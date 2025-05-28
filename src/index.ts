// import libs
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// init env
dotenv.config();

// import db
import db from "./db";

// import files, routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";
import testRoutes from "./routes/test.route";

// init app and port
const app = express();
const port = 8000;

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: process.env.FRONTEND_URL,
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

// This tells Express to trust the X-Forwarded-For header — which your reverse proxy (OpenLiteSpeed in your case) sets correctly.
// 1 means "trust the first IP in the chain", which helps mitigate spoofing if your app is exposed beyond your reverse proxy.
app.set("trust proxy", 1);

// init methods, routes, middleware and db
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");

db.connect();

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/user", authLimiter, userRoutes);
app.use("/api/v1/post", authLimiter, postRoutes);
app.use("/api/v1/test", authLimiter, testRoutes);
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db.getPool().query("SELECT 1 + 1 AS result");
    res.json({ success: true, db: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
