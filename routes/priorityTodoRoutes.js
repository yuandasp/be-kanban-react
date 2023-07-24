const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/verifyUser");
const { priorityTodoController } = require("../controllers");

router.get("/all", verifyUser, priorityTodoController.getPriorityTodo);

module.exports = router;
