const { db, query } = require("../database");
const jwt = require("jsonwebtoken");

module.exports = {
  getAllTodo: async (req, res) => {
    try {
      const idUser = req.user.id;

      //ada filter status, filter priority, filter date range,

      const getTodo =
        await query(`SELECT todo.title, todo.description, todo.start_date, todo.end_date, status.name as status, priority.label FROM todo
        LEFT JOIN status on status.idstatus = todo.idstatus
        LEFT JOIN priority ON priority.idpriority = todo.idpriority
        WHERE todo.iduser=${idUser};`);

      return res.status(200).send({ data: getTodo });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  getDetailTodo: async (req, res) => {
    try {
      const idUser = req.user.id;
      const { idTodo } = req.params;

      const getTodo =
        await query(`SELECT todo.title, todo.description, todo.start_date, todo.end_date, status.name as status, priority.label FROM todo
        LEFT JOIN status on status.idstatus = todo.idstatus
        LEFT JOIN priority ON priority.idpriority = todo.idpriority
        WHERE todo.iduser=${idUser} AND idtodo=${idTodo};`);

      return res.status(200).send({ data: getTodo });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  addTodo: async (req, res) => {
    try {
      const { title, description, idStatus, idPriority, startDate, endDate } =
        req.body;
      const idUser = req.user.id;
      console.log("REQ", req.body);

      const addTodo = await query(
        `INSERT INTO todo (idtodo, iduser, title, description, idstatus, idpriority, start_date, end_date) VALUES (null, ${idUser}, ${db.escape(
          title
        )}, ${db.escape(description)},${idStatus}, ${idPriority}, ${db.escape(
          startDate
        )}, ${db.escape(endDate)})`
      );

      return res
        .status(200)
        .send({ addTodo, message: "Success add todo list!" });
    } catch (error) {}
  },
  editTodo: async (req, res) => {
    try {
      const { title, description, idStatus, idPriority, startDate, endDate } =
        req.body;
      const { idTodo } = req.params;

      let updateQuery = "UPDATE todo SET ";

      if (title) {
        updateQuery += `title=${db.escape(title)},`;
      }
      if (description) {
        updateQuery += `description=${db.escape(description)},`;
      }
      if (idStatus) {
        updateQuery += `idstatus=${idStatus},`;
      }
      if (idPriority) {
        updateQuery += `idpriority=${idPriority},`;
      }
      if (startDate) {
        updateQuery += `start_date=${db.escape(startDate)},`;
      }
      if (endDate) {
        updateQuery += `end=${db.escape(endDate)},`;
      }

      updateQuery =
        updateQuery.slice(0, updateQuery.length - 1) +
        ` WHERE idtodo = ${idTodo};`;

      await query(updateQuery);

      return res.status(200).send({ message: "Edit success" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  deleteTodo: async (req, res) => {
    try {
      const { idTodo } = req.params;

      const deleteTodo = await query(
        `DELETE FROM todo WHERE idtodo=${idTodo};`
      );

      return res.status(200).send({ message: "Delete success" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};
