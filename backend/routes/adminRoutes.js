const express = require("express");

const {
  getAdminDashboard,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

module.exports = router;