const express = require("express");
const { userController } = require("../controllers");
const { verifyUser } = require("../middleware/verifyUser");
const router = express.Router();

router.get("/", verifyUser, userController.fetchUser);

module.exports = router;
