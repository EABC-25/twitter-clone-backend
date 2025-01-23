import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import pool from "../../config/db";
import { type User, type NewUser } from "../types/interfaceTypes";

export const getUsersFromDb = async (): Promise<User[]> => {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM `users`");
  return rows as User[];
};

export const checkEmailFromDb = async (email: string): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT `email` FROM `users` WHERE `email` = ?",
    [email]
  );

  return rows.length > 0 ? true : false;
};

export const getUser = async (queryString: string): Promise<User[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(queryString);

  // I might need to find a way to pass the email from verify email so that I don't need to use the verification token in the above query (which I find very insecure? or unreliable because of possible collisions?)

  // I think I'll just pass the email thru sendEmail's url and then access that via req.query
  // also, I might need to index email in db for fast retrieval right?

  return rows as User[];
};

export const addUserToDb = async (newUser: NewUser): Promise<boolean> => {
  try {
    await pool.query<ResultSetHeader>(
      "INSERT INTO users ( `username`, `email`, `password`, `verificationToken`, `verificationExpire`) VALUES (?, ?, ?, ?, ?)",
      [
        newUser.username,
        newUser.email,
        newUser.password,
        newUser.verificationToken,
        newUser.verificationExpire,
      ]
    );
    return true;
  } catch (err) {
    return false;
  }
};

export const deleteUserFromDb = async (
  email: string
): Promise<ResultSetHeader> => {
  const [deleted] = await pool.query<ResultSetHeader>(
    "DELETE FROM `users` WHERE `email` = ?",
    [email]
  );

  return deleted;
};
