const express = require("express");
const { authController } = require("../controllers");
const { verifyUser } = require("../middleware/verifyUser");
// const { verificationUser } = require("../controllers/authController");
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/verification", verifyUser, authController.verificationUser);
router.post("/forgot-password", authController.sendLinkForgotPassword);
router.post("/change-password", verifyUser, authController.changePassword);

module.exports = router;
