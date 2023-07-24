const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/verifyUser");
const { statusTodoController } = require("../controllers");

router.get("/all", verifyUser, statusTodoController.getStatusTodo);
router.post("/", verifyUser, statusTodoController.addStatusTodo);
router.put("/:idStatus", verifyUser, statusTodoController.editStatusTodo);
router.delete("/:idStatus", verifyUser, statusTodoController.deleteStatusTodo);
module.exports = router;
