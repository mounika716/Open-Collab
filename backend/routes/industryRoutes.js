const express = require("express");

const {
  getProfile,
  updateProfile,
  getIndustryDemand,
} = require("../controllers/industryController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const industryOnly = (req, res, next) => {
  if (req.user?.role !== "industry") {
    return res.status(403).json({
      success: false,
      message: "Industry access required",
    });
  }

  next();
};

router.get(
  "/profile",
  protect,
  industryOnly,
  getProfile
);

router.put(
  "/profile",
  protect,
  industryOnly,
  updateProfile
);
router.get(
  "/demand",
  protect,
  industryOnly,
  getIndustryDemand
);

module.exports = router;