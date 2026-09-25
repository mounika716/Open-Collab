import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OAuthCallback() {
  const navigate = useNavigate();
  const {
  setOAuthSession,
  getPostAuthPath,
} = useAuth();

  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent the OAuth callback from being processed twice.
    // This is important when React StrictMode runs effects twice
    // during development.
    if (processedRef.current) {
      return;
    }

    processedRef.current = true;

    const processOAuthCallback = () => {
      try {
        console.log("=================================");
        console.log("Open Collab OAuth callback started");
        console.log("Current URL:", window.location.href);
        console.log("Current hash:", window.location.hash);
        console.log("Current search:", window.location.search);
        console.log("=================================");

        /*
         * Google backend redirects to:
         *
         * http://localhost:5173/oauth/callback
         * #token=...
         * &user=...
         *
         * We intentionally read the HASH because the JWT is
         * currently being returned in the URL fragment.
         */

        const hash = window.location.hash;

        if (!hash || hash.length <= 1) {
          console.error(
            "OAuth callback failed: URL hash is missing."
          );

          navigate("/login?error=oauth_failed", {
            replace: true,
          });

          return;
        }

        const hashParams = new URLSearchParams(
          hash.substring(1)
        );

        const token = hashParams.get("token");
        const userString = hashParams.get("user");

        console.log(
          "OAuth token received:",
          Boolean(token)
        );

        console.log(
          "OAuth user received:",
          Boolean(userString)
        );

        if (!token) {
          console.error(
            "OAuth callback failed: token is missing."
          );

          navigate("/login?error=oauth_failed", {
            replace: true,
          });

          return;
        }

        if (!userString) {
          console.error(
            "OAuth callback failed: user is missing."
          );

          navigate("/login?error=oauth_failed", {
            replace: true,
          });

          return;
        }

        let user;

        try {
          /*
           * IMPORTANT:
           * URLSearchParams.get() already URL-decodes the
           * parameter value.
           *
           * Therefore DO NOT call decodeURIComponent()
           * here.
           */
          user = JSON.parse(userString);
        } catch (parseError) {
          console.error(
            "OAuth user JSON parsing failed:",
            parseError
          );

          console.error(
            "Received user value:",
            userString
          );

          navigate("/login?error=oauth_failed", {
            replace: true,
          });

          return;
        }

        console.log("OAuth user object:", user);

        if (!user || typeof user !== "object") {
          console.error(
            "OAuth callback failed: invalid user object."
          );

          navigate("/login?error=oauth_failed", {
            replace: true,
          });

          return;
        }

        if (!user.role) {
          console.error(
            "OAuth callback failed: user role is missing.",
            user
          );

          navigate("/login?error=invalid_role", {
            replace: true,
          });

          return;
        }

        /*
         * IMPORTANT:
         * Remove the OAuth token/user from the browser URL
         * BEFORE changing React authentication state.
         *
         * This prevents the callback from being processed
         * again by React development rendering.
         */
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        console.log(
          "OAuth URL cleaned successfully."
        );

        /*
         * Save the same authentication format used by
         * normal email/password login.
         */
        setOAuthSession(token, user);

        console.log(
          "OAuth session stored successfully."
        );

        /*
         * Redirect according to the actual role returned
         * by the backend.
         */
        setOAuthSession(token, user);

console.log(
  "OAuth session stored successfully."
);

navigate(getPostAuthPath(user), {
  replace: true,
});
      } catch (error) {
        console.error(
          "OAuth callback processing failed:",
          error
        );

        navigate("/login?error=oauth_failed", {
          replace: true,
        });
      }
    };

    processOAuthCallback();
  }, [navigate, setOAuthSession]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        color: "#fff",
        fontSize: "18px",
      }}
    >
      Completing Google sign-in...
    </div>
  );
}

export default OAuthCallback;