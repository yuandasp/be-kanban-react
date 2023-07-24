const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middleware/verifyUser");
const { todoController } = require("../controllers");

router.get("/all", verifyUser, todoController.getAllTodo);
router.get("/:idTodo", verifyUser, todoController.getDetailTodo);
router.post("/", verifyUser, todoController.addTodo);
router.put("/:idTodo", verifyUser, todoController.editTodo);
router.delete("/:idTodo", verifyUser, todoController.deleteTodo);

module.exports = router;
