const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cloudinary = require("cloudinary");
const cors = require("cors");

//config
// dotenv.config({ path: "./config/.env" });   // nodemon server
// dotenv.config({ path: "backened/config/.env" }); // npm run dev

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
});

app.use(express.static(path.join(__dirname, "frontend/build")));

app.use(
  cors({
    origin: "https://ecommindia-rupali-sharma.netlify.app/",
  })
);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

let server;
const start = async () => {
  try {
    await connectDB();
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    server = app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.log("Error in db connection " + err);
  }
};

start();
// Database connection
// connectDB();

// Unhandled error
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
