const express = require("express");

const {
  getInternships,
  getInternship,
  createInternship,
  getMyInternships,
  updateInternship,
  deleteInternship,
  getInternshipMatch,
} = require("../controllers/internshipController");

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

// Industry routes
router.get("/industry/mine", protect, industryOnly, getMyInternships);
router.post("/", protect, industryOnly, createInternship);
router.put("/:id", protect, industryOnly, updateInternship);
router.delete("/:id", protect, industryOnly, deleteInternship);

// Student routes
router.get("/:id/match", protect, studentOnly, getInternshipMatch);

// Authenticated internship browsing
router.get("/", protect, getInternships);
router.get("/:id", protect, getInternship);

module.exports = router;