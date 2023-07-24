const { query } = require("../database");

module.exports = {
  getPriorityTodo: async (req, res) => {
    try {
      const getPriorityTodo = await query(`SELECT * FROM priority`);
      return res.status(200).send({ data: getPriorityTodo });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};
