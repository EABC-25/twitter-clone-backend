// import libs
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// init env
dotenv.config();

// import files, routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";

// init app and port
const app = express();
const port = 8000;

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and other credentials
};

// init methods and routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
