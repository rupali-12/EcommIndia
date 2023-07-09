const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const connectDB = () => {
  // try {
  mongoose.set("strictQuery", false);
  console.log("Database Connected");
  return mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // console.log("Database connected");
  // } catch (err) {
  //   console.log("Error occured in connecting DB ", err);
  // }
};

module.exports = connectDB;
