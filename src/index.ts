// import libs
import express from "express";
import dotenv from "dotenv";

// init env
dotenv.config();

// import files, routes
import userRoutes from "./routes/user.route";

// init app and port
const app = express();
const port = 3000;

// init methods and routes
// app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);

// init server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
