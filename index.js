require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const { createProxyMiddleware } = require("http-proxy-middleware");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

// -----------------------------------------------------------------------------------

mongoose
  .connect(process.env.MONGODB_LINK + "sdp")
  // .connect("mongodb://localhost:27017/sdp")
  .then(() => {
    console.log("Connected to Database......");
  })
  .catch((ex) => {
    console.log(ex.message);
  });

// -----------------------------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(compression());
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  console.log("Morgon Enabled.....");
}

// -----------------------------------------------------------------------------------

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use("/api/users", users);
app.use("/api/reviews", reviews);

// -----------------------------------------------------------------------------------

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
