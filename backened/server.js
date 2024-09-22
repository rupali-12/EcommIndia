const express = require("express");
const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const cloudinary = require("cloudinary");
const cors = require("cors");
const path = require("path");

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
});

// Set up CORS before anything else
app.use(
  cors({
    origin: [
      "https://ecommindia.onrender.com", // Backend URL
      "https://ecomm-india-rupali-sharma.vercel.app", // Vercel frontend URL
    ],
    credentials: true, // This allows cookies to be passed if necessary
    methods: ["GET", "POST", "PUT", "DELETE"], // Add any additional methods you need
  })
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "frontend/build")));

// This wildcard route should be after all other routes/middleware
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// Initialize Cloudinary config and start the server
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

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
