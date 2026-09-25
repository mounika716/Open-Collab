const express = require("express");

const {
  getOpportunities,
  getMyOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getOpportunities);

router.get(
  "/mine",
  getMyOpportunities
);

router.post(
  "/",
  createOpportunity
);

router.put(
  "/:id",
  updateOpportunity
);

router.delete(
  "/:id",
  deleteOpportunity
);

module.exports = router;
