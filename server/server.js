require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();

// Ensure database schema is initialized on server start
require("./init-db");

const admin = require("./routes/index");

// ==================== Middleware ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/" , (req, res) => {
    res.send("projected..")
})

app.use("/api/v1" , admin);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== Error Handler ====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
