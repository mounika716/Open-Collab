const express = require("express");

const {
  register,
  login,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  completeOAuthRegistration,
  completeOnboarding,
} = require("../controllers/authController");
const {
  protect,
} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post(
  "/oauth/complete",
  completeOAuthRegistration
);
router.post(
  "/onboarding/complete",
  protect,
  completeOnboarding
);
module.exports = router;