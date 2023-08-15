const express = require("express");
const { authController } = require("../controllers");
const { verifyUser } = require("../middleware/verifyUser");
// const { accessTokenGoogle } = require("../middleware/accessTokenGoogle");
// const { verificationUser } = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verification", verifyUser, authController.verificationUser);
router.post("/forgot-password", authController.sendLinkForgotPassword);
router.post("/change-password", verifyUser, authController.changePassword);
router.post("/google", authController.verifyGoogleSignIn);
// router.post("/google2", authController.signInWithGoogle);
// router.get("/google", authController.getUserInfoGoogle);

module.exports = router;
