const { db, query } = require("../database");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const nodemailer = require("../helpers/nodemailer");
const cron = require("node-cron");

// cron.schedule("0 4 * * *", () => {
//   console.log("running a task minute");
// });

module.exports = {
  getAllTodo: async (req, res) => {
    try {
      const idUser = req.user.id;
      const email = req.user.email;

      const getTodo =
        await query(`SELECT todo.idtodo, todo.title, todo.description, todo.start_date, todo.end_date, todo.is_notif_sent, status.name as status, priority.label FROM todo
        LEFT JOIN status on status.idstatus = todo.idstatus
        LEFT JOIN priority ON priority.idpriority = todo.idpriority
        WHERE todo.iduser=${idUser};`);

      // cron.schedule(
      //   "*/10 * * * *",
      //   // "* * * * *",
      //   // "*/10 * * * * *",
      //   async () => {
      //     console.log("this function is running");

      //     // const dateNow = new Date();
      //     // const filterEndDate = getTodo.filter((todo) => {
      //     //   return (
      //     //     moment(new Date(todo.end_date)).isSame(dateNow, "day") &&
      //     //     !todo.is_notif_sent
      //     //   );
      //     // });

      //     // if (filterEndDate.length > 0) {
      //     //   let mail = {
      //     //     from: `Admin <${process.env.NODEMAILER_USER}>`,
      //     //     to: `${email}`,
      //     //     subject: `Today is your deadline!`,
      //     //     html: `
      //     // <div>

      //     // <p>You have several tasks to complete today</p>
      //     // <ul>
      //     // ${filterEndDate.map((todo) => `<li>${todo.title}</li>`)}
      //     // </ul>
      //     // <a href="${process.env.LINK_HOME}">Click here</a>
      //     // <span>to see the task</span>
      //     // </div>`,
      //     //   };

      //     //   //nodemailer tetep await, tapi di front end tambahin loading bar
      //     //   nodemailer.sendMail(mail);

      //     //   let dataId = filterEndDate.map((todo) => todo.idtodo);

      //   const updateIsNotifSent = await query(
      //     `UPDATE todo SET is_notif_sent=true WHERE iduser=${idUser} AND idtodo IN (${dataId.join(
      //       ","
      //     )});`
      //   );
      //     // }
      //   },
      //   {
      //     scheduled: true,
      //     timezone: "Asia/Jakarta",
      //   }
      // );

      return res.status(200).send({ data: getTodo });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error });
    }
  },
  getDetailTodo: async (req, res) => {
    try {
      const idUser = req.user.id;
      const { idTodo } = req.params;

      const getTodo =
        await query(`SELECT todo.idtodo, todo.title, todo.description, todo.start_date, todo.end_date, status.name as status, priority.label FROM todo
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
        updateQuery += `end_date=${db.escape(endDate)},`;
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
  dueDateTodo: async (req, res) => {
    try {
      const idUser = req.user.id;
      const email = req.user.email;

      const getTodo =
        await query(`SELECT todo.idtodo, todo.title, todo.description, todo.start_date, todo.end_date, todo.is_notif_sent, status.name as status, priority.label FROM todo
        LEFT JOIN status on status.idstatus = todo.idstatus
        LEFT JOIN priority ON priority.idpriority = todo.idpriority
        WHERE todo.iduser=${idUser};`);

      const dateNow = new Date();
      const filterEndDate = getTodo.filter((todo) => {
        return (
          moment(new Date(todo.end_date)).isSame(dateNow, "day") &&
          !todo.is_notif_sent
        );
      });

      if (filterEndDate.length > 0) {
        let mail = {
          from: `Admin <${process.env.NODEMAILER_USER}>`,
          to: `${email}`,
          subject: `Today is your deadline!`,
          html: `
          <div>

          <p>You have several tasks to complete today</p>
          <ul>
          ${filterEndDate.map((todo) => `<li>${todo.title}</li>`)}
          </ul>
          <a href="${process.env.LINK_HOME}">Click here</a>
          <span>to see the task</span>
          </div>`,
        };

        nodemailer.sendMail(mail);

        let dataId = filterEndDate.map((todo) => todo.idtodo);

        const updateIsNotifSent = await query(
          `UPDATE todo SET is_notif_sent=true WHERE iduser=${idUser} AND idtodo IN (${dataId.join(
            ","
          )});`
        );
      }

      return res.status(200).send({ data: getTodo });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error });
    }
  },
};
