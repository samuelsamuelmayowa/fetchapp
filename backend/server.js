const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config();
const { sequelize } = require("./db.js");
const  userroutes= require("./routes/userroutes");

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://yourfrontend.com",
  "https://ppt-beryl.vercel.app",
  "https://www.yourfrontend.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (postman/mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests, please try again later",
});

app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
  });
});

app.use("/api/auth", userroutes);

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ Database synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Server failed:", err);
    process.exit(1);
  });