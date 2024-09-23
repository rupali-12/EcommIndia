const express = require("express");
const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cloudinary = require("cloudinary");
const cors = require("cors");
const path = require("path");

// Load environment variables from config file
dotenv.config({ path: "./config/.env" });

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1); // Exit the process after handling the error
});

// Setup CORS before anything else
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Change this to your frontend's deployed URL
      "https://ecommindia.onrender.com", // Add any additional allowed origins
    ],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "PUT", "DELETE"], // Add other methods as necessary
  })
);

// Connect to the database and initialize Cloudinary
let server;
const start = async () => {
  try {
    await connectDB();
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Start the server
    server = app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.log(`Error in DB connection: ${err.message}`);
    process.exit(1); // Exit if unable to connect to the database
  }
};

start();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "frontend/build")));

// Catch-all handler to send the React app on any route
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
