const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "backened/config/config.env" });

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());

const errorMiddleware = require("./middleware/error");
// Routes>
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoutes");

// app.use("api/v1", product);
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// code for deployment
// app.use(express.static(path.join(__dirname, "frontend/client/build")));

// // Serve the index.html file for any route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "frontend/client/build/index.html"));
// });

app.use(express.static("frontend/client/build"));
app.get("*", function (req, res) {
  // res.sendFile(path.resolve('client', 'build' , 'index.html'));
  res.sendFile(path.resolve(__dirname, "frontend/client/build", "index.html"));
});
console.log("dfghj" + __dirname);

// Middleware for errors
app.use(errorMiddleware);
module.exports = app;
