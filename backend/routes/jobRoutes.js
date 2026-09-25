const express = require("express");

const {
  getJobs,
  getJob,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJobMatch,
} = require("../controllers/jobController");

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

const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access required",
    });
  }

  next();
};

router.get("/industry/mine", protect, industryOnly, getMyJobs);

router.post("/", protect, industryOnly, createJob);

router.put("/:id", protect, industryOnly, updateJob);

router.delete("/:id", protect, industryOnly, deleteJob);

router.get("/:id/match", protect, studentOnly, getJobMatch);

router.get("/", protect, getJobs);

router.get("/:id", protect, getJob);

module.exports = router;