const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const db = require("./db");
const app = express();

const userRoutes = require("./routes/user");
const listingRoutes = require("./routes/listings");

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

// Check server 
app.get("/health", function(req, res) {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost
    res.send("I am happy and healthy\n");
});

// Routes
app.use("/users", userRoutes);
app.use("/listings", listingRoutes);

module.exports = app;