// code used here in /db was sourced from mysql2 docs with small changes with the help of chatgpt: https://sidorares.github.io/node-mysql2/docs/examples/typescript/basic-custom-class

import { type PoolOptions } from "mysql2/promise";
import MySQL from "./db";

const access: PoolOptions = {
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  socketPath: "/var/run/mysqld/mysqld.sock",
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: "Z",
  // dateStrings: false,
};

export default new MySQL(access);
