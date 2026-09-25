const express = require("express");

const {
  getStudentPortfolio,
} = require("../controllers/portfolioController");

const {
  protect,
  studentOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/student",
  protect,
  studentOnly,
  getStudentPortfolio
);

module.exports = router;