const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "_id name email role isActive"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

const studentOnly = (req, res, next) => {
  return requireRole("student")(req, res, next);
};

const academicianOnly = (req, res, next) => {
  return requireRole("academician")(req, res, next);
};

const institutionOnly = (req, res, next) => {
  return requireRole("institution")(req, res, next);
};

const industryOnly = (req, res, next) => {
  return requireRole("industry")(req, res, next);
};

const adminOnly = (req, res, next) => {
  return requireRole("admin")(req, res, next);
};

module.exports = {
  protect,
  requireRole,
  studentOnly,
  academicianOnly,
  institutionOnly,
  industryOnly,
  adminOnly,
};
