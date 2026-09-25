const express = require("express");

const {
  applyForJob,
  getMyJobApplications,
  getJobApplications,
  updateJobApplicationStatus,
  updatePlacementDetails,
} = require("../controllers/jobApplicationController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access required",
    });
  }

  next();
};

const industryOnly = (req, res, next) => {
  if (req.user?.role !== "industry") {
    return res.status(403).json({
      success: false,
      message: "Industry access required",
    });
  }

  next();
};

router.post(
  "/:jobId",
  protect,
  studentOnly,
  applyForJob
);

router.get(
  "/my",
  protect,
  studentOnly,
  getMyJobApplications
);

router.get(
  "/job/:jobId",
  protect,
  industryOnly,
  getJobApplications
);

router.put(
  "/:id/status",
  protect,
  industryOnly,
  updateJobApplicationStatus
);

router.put(
  "/:id/placement",
  protect,
  industryOnly,
  updatePlacementDetails
);

module.exports = router;