const express = require("express");

const {
  getProfile,
  updateProfile,
  getDashboard,
  getAnalytics,
} = require("../controllers/institutionController");

const {
  protect,
  institutionOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(institutionOnly);

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;