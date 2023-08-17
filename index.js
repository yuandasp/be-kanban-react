const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cron = require("node-cron");
const PORT = process.env.PORT;
const app = express();
const {
  authRoutes,
  todoRoutes,
  statusTodoRoutes,
  priorityTodoRoutes,
  userRoutes,
} = require("./routes");
const nodemailer = require("./helpers/nodemailer");
const { db, query } = require("./database");

app.use(cors());
app.use(
  cors({
    origin: [
      process.env.WHITELISTED_DOMAIN &&
        process.env.WHITELISTED_DOMAIN.split(","),
    ],
  })
);

app.use(express.json());

cron.schedule(
  "0 11 * * *",
  async () => {
    try {
      const users = await query(`SELECT * FROM user;`);

      users.forEach(async (user) => {
        const todos = await query(
          `SELECT * FROM todo WHERE is_notif_sent=false and end_date >= curdate() and idstatus < 3 and iduser=${user.id_user};`
        );

        if (todos.length > 0) {
          let htmlTodos = "";
          todos.forEach((todo) => (htmlTodos += `<li>${todo.title}</li>`));

          let mail = {
            from: `Admin <${process.env.NODEMAILER_USER}>`,
            to: `${user.email}`,
            subject: `Today is your deadline!`,
            html: `
            <div>
              <p>You have several tasks to complete today</p>
              <ul>
              ${htmlTodos}
              </ul>
              <a href="${process.env.LINK_HOME}">Click here</a>
              <span>to see the task</span>
            </div>`,
          };

          nodemailer.sendMail(mail);

          let dataId = todos.map((todo) => todo.idtodo);
          const updateIsNotifSent = await query(
            `UPDATE todo SET is_notif_sent=true WHERE iduser=${
              user.id_user
            } AND idtodo IN (${dataId.join(",")});`
          );
        }
      });
    } catch (error) {
      error;
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/status", statusTodoRoutes);
app.use("/priority", priorityTodoRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log("I'm running on port: ", PORT);
});
