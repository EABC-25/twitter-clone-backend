// import libs
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// init env
dotenv.config();

// import db
import db from "./db";

// import files, routes
import healthRoutes from "./routes/health.route";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import postRoutes from "./routes/post.route";
import testRoutes from "./routes/test.route";

// init app and port
const app = express();

// Configure CORS to allow requests from y-app
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and other credentials
};

// This tells Express to trust the X-Forwarded-For header — which your reverse proxy (OpenLiteSpeed in your case) sets correctly.
// 1 means "trust the first IP in the chain", which helps mitigate spoofing if your app is exposed beyond your reverse proxy.
app.set("trust proxy", true);

// init methods, routes, middleware and db
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");

db.connect();

app.get("/", (req, res) => {
  res.redirect("/health");
});

app.get("/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/test", testRoutes);

export default app;
