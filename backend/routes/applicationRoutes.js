const express = require("express");

const {
  applyForInternship,
  getMyApplications,
  getMyApplication,
  getInternshipApplications,
  updateApplicationStatus,
  evaluateInternship,
  issueInternshipCertificate,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

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

// Student routes
router.post(
  "/:internshipId",
  protect,
  studentOnly,
  applyForInternship
);

router.get(
  "/my",
  protect,
  studentOnly,
  getMyApplications
);

router.get(
  "/my/:id",
  protect,
  studentOnly,
  getMyApplication
);

// Industry routes
router.get(
  "/internship/:internshipId",
  protect,
  industryOnly,
  getInternshipApplications
);

router.put(
  "/:id/status",
  protect,
  industryOnly,
  updateApplicationStatus
);

router.put(
  "/:id/evaluation",
  protect,
  industryOnly,
  evaluateInternship
);

router.put(
  "/:id/certificate",
  protect,
  industryOnly,
  issueInternshipCertificate
);

module.exports = router;