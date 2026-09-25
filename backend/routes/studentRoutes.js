const express = require("express");

const {
  getProfile,
  updateProfile,
  getCareerIntelligence,
  getRecommendations,
  getPortfolio,
  getSkillGapIntelligence,
} = require("../controllers/studentController");

const {
  protect,
  studentOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(studentOnly);

router.get(
  "/profile",
  getProfile
);

router.put(
  "/profile",
  updateProfile
);

router.get(
  "/career-intelligence",
  getCareerIntelligence
);

router.get(
  "/recommendations",
  getRecommendations
);

router.get(
  "/portfolio",
  getPortfolio
);

router.get(
  "/skill-gap",
  getSkillGapIntelligence
);

module.exports = router;