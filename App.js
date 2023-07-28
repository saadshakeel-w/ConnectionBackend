const express = require("express");
var app = express();
const mongoose = require("mongoose");

const cors = require("cors");
var bodyParser = require("body-parser");

const { createServer } = require("http");
const { Server } = require("socket.io");

const path = require("path");

const DB =
  "mongodb+srv://sarmadshakeel20:connectionpass@connection.hp2qhfe.mongodb.net/";
mongoose
  .connect(DB)
  .then(() => {
    console.log("connected to mongoDb");
  })
  .catch((ex) => {
    console.log(ex);
  });

const promptsRoutes = require("./src/routes/promptsRoutes");
const userRoutes = require("./src/routes/userRoutes");
const testRoutes = require("./src/routes/testRoutes");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use(express.json({ limit: "20mb" }));
// app.use(express.static('public'));
// app.use( express.static(__dirname + '/images'));

app.set("io", io);
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(cors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });

  return;
});

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/prompts", promptsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/test", testRoutes);

const port = app.get("port");
httpServer.listen(port, () =>
  console.log(`Listening to port number ${port}...`)
);

module.exports.app = app;
