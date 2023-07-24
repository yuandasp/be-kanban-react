const express = require("express");
require("dotenv").config();
const cors = require("cors");
const PORT = process.env.PORT;
const app = express();
const {
  authRoutes,
  todoRoutes,
  statusTodoRoutes,
  priorityTodoRoutes,
} = require("./routes");

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

app.use("/auth", authRoutes);
app.use("/todo", todoRoutes);
app.use("/status", statusTodoRoutes);
app.use("/priority", priorityTodoRoutes);

app.listen(PORT, () => {
  console.log("I'm running on port: ", PORT);
});
