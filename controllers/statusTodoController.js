const { db, query } = require("../database");

module.exports = {
  getStatusTodo: async (req, res) => {
    try {
      const getStatusTodo = await query(`SELECT * FROM status`);
      return res.status(200).send({ data: getStatusTodo });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  addStatusTodo: async (req, res) => {
    try {
      const { name } = req.body;

      const addStatusTodo = await query(
        `INSERT INTO status VALUES (null, ${db.escape(name)});`
      );

      return res
        .status(200)
        .send({ addStatusTodo, message: "Success add status!" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  editStatusTodo: async (req, res) => {
    try {
      const { name } = req.body;
      const { idStatus } = req.params;

      let updateQuery = "UPDATE todo SET ";

      if (name) {
        updateQuery += `name=${db.escape(name)},`;
      }

      updateQuery =
        updateQuery.slice(0, updateQuery.length - 1) +
        ` WHERE idstatus = ${idStatus};`;

      await query(updateQuery);

      return res.status(200).send({ message: "Edit success" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
  deleteStatusTodo: async (req, res) => {
    try {
      const { idStatus } = req.params;

      const deleteTodo = await query(
        `DELETE FROM status WHERE idstatus=${idStatus};`
      );

      return res.status(200).send({ message: "Delete success" });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};
