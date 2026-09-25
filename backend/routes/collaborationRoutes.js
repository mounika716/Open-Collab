const express = require("express");

const {
  applyForCollaboration,
  getMyCollaborationRequests,
  getOpportunityRequests,
  updateCollaborationStatus,
} = require("../controllers/collaborationController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/opportunities/:opportunityId/apply",
  applyForCollaboration
);

router.get(
  "/my",
  getMyCollaborationRequests
);

router.get(
  "/opportunities/:opportunityId/requests",
  getOpportunityRequests
);

router.put(
  "/:id/status",
  updateCollaborationStatus
);

module.exports = router;