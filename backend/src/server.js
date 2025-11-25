const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const config = require("./config");
const app = express();

const { uploadErrorHandler } = require("./middleware/upload/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const listingRoutes = require("./routes/listings");

app.set('trust proxy', 1); // TRUST the single nginx proxy in front of the app

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

app.use(cookieParser());

// Serve uploaded files (images, profile pictures, etc.)
app.use("/uploads", express.static(config.uploads.root));

// Check server 
app.get("/health", function(req, res) {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost
    res.send("I am happy and healthy\n");
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/listings", listingRoutes);

// Error handlers
app.use(uploadErrorHandler);

module.exports = app;