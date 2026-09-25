const express = require("express");

const {
  startAssessment,
  getAssessment,
  submitCode,
  recordViolation,
  finalizeAssessment,
  getAssessmentHistory,
  submitAnswer,
} = require("../controllers/assessmentController");

const {
  protect,
  studentOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(studentOnly);

/*
 * Start coding assessment
 *
 * POST /api/assessment/start
 */
router.post(
  "/start",
  startAssessment
);

/*
 * Assessment history
 *
 * GET /api/assessment/history
 */
router.get(
  "/history",
  getAssessmentHistory
);

/*
 * Get assessment
 *
 * GET /api/assessment/:id
 */
router.get(
  "/:id",
  getAssessment
);

/*
 * Submit code
 *
 * POST /api/assessment/:id/submit
 */
router.post(
  "/:id/submit",
  submitCode
);

/*
 * Integrity violation
 *
 * POST /api/assessment/:id/violation
 */
router.post(
  "/:id/violation",
  recordViolation
);

/*
 * Final submission
 *
 * POST /api/assessment/:id/complete
 */
router.post(
  "/:id/complete",
  finalizeAssessment
);

/*
 * Legacy MCQ endpoint.
 * Kept temporarily for compatibility.
 */
router.post(
  "/:id/answer",
  submitAnswer
);

module.exports = router;