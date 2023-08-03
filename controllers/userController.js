const { query } = require("../database");

module.exports = {
  fetchUser: async (req, res) => {
    try {
      const idUser = req.user.id;

      const user = await query(`SELECT * FROM user WHERE id_user=${idUser}`);
      return res.status(200).send({ username: user[0].username });
    } catch (error) {
      return res.status(500).send({ message: error });
    }
  },
};
