const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { pool } = require("./config");
const app = express();

app.use(morgan("dev"));
app.use(helmet());

// parse JSON bodies, with limit
app.use(express.json({ limit: '1mb' }));

const allowedOrigin = process.env.CORS_ORIGIN || '*'; //this is okay in local/dev
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);


app.get("/health", async(req, res) => {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost
    try {
      const [rows] = await pool.query("SHOW TABLES;");
      res.status(200).json({
        status: "healthy",
        tables: rows
      });
    } catch (err) {
      console.error("DB connection failed:", err);
      res.status(500).json({
        status: "unhealthy",
        error: err.message
      });
    }
});

module.exports = app;