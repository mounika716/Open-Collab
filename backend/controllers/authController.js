const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
const createOAuthPendingToken = (data) => {
  return jwt.sign(
    {
      ...data,
      purpose: "oauth_role_selection",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
    }
  );
};

const redirectToOAuthRoleSelection = (res, data) => {
  const pendingToken = createOAuthPendingToken(data);

  const redirectUrl =
    `${process.env.CLIENT_URL}/oauth/role` +
    `?token=${encodeURIComponent(pendingToken)}`;

  return res.redirect(redirectUrl);
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Public registration can create normal platform accounts.
    // Admin accounts must be created separately.
    const allowedRoles = [
      "student",
      "industry",
      "academician",
      "institution",
    ];

    const requestedRole = role || "student";

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: requestedRole,
    onboardingCompleted: false,
  });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  onboardingCompleted: user.onboardingCompleted,
},
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    if (!user.isActive) {
      return res.status(403).json({
        success: false,
       message: "Your account has been deactivated",
      });
    }
    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const googleLogin = async (req, res) => {
  try {
    if (
      !process.env.GOOGLE_CLIENT_ID ||
      !process.env.GOOGLE_CLIENT_SECRET ||
      !process.env.GOOGLE_CALLBACK_URL
    ) {
      return res.status(500).send("Google authentication is not configured");
    }

    const authorizationUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "openid",
        "email",
        "profile",
      ],
      prompt: "select_account",
    });

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).send(
      "Unable to start Google authentication"
    );
  }
};

const googleCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("Google authorization error:", error);
      return res.status(400).send(
        "Google authentication was cancelled or denied."
      );
    }

    if (!code) {
      return res.status(400).send(
        "Google authorization code is missing"
      );
    }

    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    });

    if (!tokens.id_token) {
      return res.status(401).send(
        "Google did not return a valid identity token"
      );
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).send(
        "Unable to verify Google account"
      );
    }

    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      name,
      picture,
    } = payload;

    if (!email || !emailVerified) {
      return res.status(403).send(
        "A verified Google email address is required"
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
  return redirectToOAuthRoleSelection(res, {
    name: name?.trim() || "Google User",
    email: normalizedEmail,
    picture: picture || "",
    provider: "google",
    providerId: googleId,
  });
}

    if (!user.isActive) {
      return res.status(403).send(
        "Your account has been deactivated"
      );
    }

    const token = createToken(user);

    const userData = {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  picture: picture || "",
  onboardingCompleted: user.onboardingCompleted,
};

    const encodedUser = encodeURIComponent(
      JSON.stringify(userData)
    );

    const redirectUrl =
      `${process.env.CLIENT_URL}/oauth/callback` +
      `#token=${encodeURIComponent(token)}` +
      `&user=${encodedUser}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "Google callback error:",
      error.response?.data || error.message || error
    );

    res.status(500).send(
      "Google authentication failed. Please try again."
    );
  }
};
const githubLogin = async (req, res) => {
  try {
    if (
      !process.env.GITHUB_CLIENT_ID ||
      !process.env.GITHUB_CLIENT_SECRET ||
      !process.env.GITHUB_CALLBACK_URL
    ) {
      return res.status(500).send(
        "GitHub authentication is not configured"
      );
    }

    const githubAuthorizationUrl =
      new URL("https://github.com/login/oauth/authorize");

    githubAuthorizationUrl.searchParams.set(
      "client_id",
      process.env.GITHUB_CLIENT_ID
    );

    githubAuthorizationUrl.searchParams.set(
      "redirect_uri",
      process.env.GITHUB_CALLBACK_URL
    );

    githubAuthorizationUrl.searchParams.set(
      "scope",
      "read:user user:email"
    );

    res.redirect(githubAuthorizationUrl.toString());
  } catch (error) {
    console.error("GitHub login error:", error);

    res.status(500).send(
      "Unable to start GitHub authentication"
    );
  }
};

const githubCallback = async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("GitHub authorization error:", error);

      return res.status(400).send(
        "GitHub authentication was cancelled or denied."
      );
    }

    if (!code) {
      return res.status(400).send(
        "GitHub authorization code is missing"
      );
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "GitHub token exchange failed:",
        tokenData
      );

      return res.status(401).send(
        "Unable to authenticate with GitHub"
      );
    }

    const githubAccessToken = tokenData.access_token;

    const githubUserResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${githubAccessToken}`,
          "X-GitHub-Api-Version": "2026-03-10",
        },
      }
    );

    const githubUser = await githubUserResponse.json();

    if (
      !githubUserResponse.ok ||
      !githubUser.id
    ) {
      console.error(
        "GitHub user request failed:",
        githubUser
      );

      return res.status(401).send(
        "Unable to retrieve GitHub account"
      );
    }

    let email = githubUser.email;

    if (!email) {
      const emailResponse = await fetch(
        "https://api.github.com/user/emails",
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${githubAccessToken}`,
            "X-GitHub-Api-Version": "2026-03-10",
          },
        }
      );

      const emailData = await emailResponse.json();

      if (emailResponse.ok && Array.isArray(emailData)) {
        const primaryEmail = emailData.find(
          (item) =>
            item.primary &&
            item.verified
        );

        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    if (!email) {
      return res.status(403).send(
        "A verified GitHub email address is required"
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
  return redirectToOAuthRoleSelection(res, {
    name:
      githubUser.name?.trim() ||
      githubUser.login ||
      "GitHub User",
    email: normalizedEmail,
    picture: githubUser.avatar_url || "",
    provider: "github",
    providerId: String(githubUser.id),
  });
}

    if (!user.isActive) {
      return res.status(403).send(
        "Your account has been deactivated"
      );
    }

    const token = createToken(user);

    const userData = {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  picture: githubUser.avatar_url || "",
  onboardingCompleted: user.onboardingCompleted,
};

    const encodedUser = encodeURIComponent(
      JSON.stringify(userData)
    );

    const redirectUrl =
      `${process.env.CLIENT_URL}/oauth/callback` +
      `#token=${encodeURIComponent(token)}` +
      `&user=${encodedUser}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error(
      "GitHub callback error:",
      error.message || error
    );

    res.status(500).send(
      "GitHub authentication failed. Please try again."
    );
  }
};
const completeOAuthRegistration = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({
        success: false,
        message: "OAuth token and role are required",
      });
    }

    const allowedRoles = [
      "student",
      "industry",
      "academician",
      "institution",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration role",
      });
    }

    let pendingData;

    try {
      pendingData = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          "OAuth registration session has expired. Please sign in again.",
      });
    }

    if (
      !pendingData ||
      pendingData.purpose !==
        "oauth_role_selection"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid OAuth registration session",
      });
    }

    const {
      name,
      email,
      picture,
      provider,
      providerId,
    } = pendingData;

    if (
      !name ||
      !email ||
      !provider ||
      !providerId
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete OAuth registration data",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please sign in again.",
      });
    }

    const generatedPassword = await bcrypt.hash(
      `${provider}-${providerId}-${process.env.JWT_SECRET}`,
      12
    );

    const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password: generatedPassword,
  role,
  onboardingCompleted: false,
});

    const authToken = createToken(user);

    return res.status(201).json({
      success: true,
      message: "OAuth account created successfully",
      token: authToken,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  picture: picture || "",
  onboardingCompleted: user.onboardingCompleted,
},
    });
  } catch (error) {
    console.error(
      "OAuth registration completion error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete OAuth registration",
    });
  }
};
const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboardingCompleted: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    return res.json({
      success: true,
      message: "Onboarding completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error(
      "Complete onboarding error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to complete onboarding",
    });
  }
};
module.exports = {
  register,
  login,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  completeOAuthRegistration,
  completeOnboarding,
};
