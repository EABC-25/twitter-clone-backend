// import libs
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// init env
dotenv.config();

// import files, routes
import userRoutes from "./routes/user.route";

// init app and port
const app = express();
const port = 8000;

// Configure CORS to allow requests from localhost:3000
const corsOptions = {
  origin: process.env.BACKEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and other credentials
};

// init methods and routes
app.use(cors(corsOptions));
app.use(express.json());
app.use("/users", userRoutes);

// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
