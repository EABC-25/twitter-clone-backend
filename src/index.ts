// import libs
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";

// init env
dotenv.config();

// import files, routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";

// init app and port
const app = express();
const port = 8000;

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and other credentials
};

// init ratelimiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// init methods and routes

app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/user", authLimiter, userRoutes);
app.use("/api/v1/post", authLimiter, postRoutes);

// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
