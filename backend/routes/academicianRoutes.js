const express = require("express");

const {
  getProfile,
  updateProfile,
  getDashboard,
} = require("../controllers/academicianController");

const {
  protect,
  academicianOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(academicianOnly);

router.get("/dashboard", getDashboard);

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

module.exports = router;
