// code used here in /db was sourced from mysql2 docs with small changes with the help of chatgpt: https://sidorares.github.io/node-mysql2/docs/examples/typescript/basic-custom-class

import { type PoolOptions } from "mysql2/promise";
import MySQL from "./db";

const access: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: "Z",
  // dateStrings: false,
};

export default new MySQL(access);
