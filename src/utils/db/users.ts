import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import pool from "../../db";
import db from "../../db/index";
import { type User, type NewUser } from "../types/types";

export const getUsersFromDb = async (): Promise<User[]> => {
  const rows = await db.executeRows(`SELECT * FROM users`);
  return rows[0] as User[];
};

export const checkEmailFromDb = async (email: string): Promise<User[]> => {
  const rows = await db.executeRows(`SELECT email FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0] as User[];
};

export const getUserFromDbUsingEmail = async (
  query: string,
  email: string
): Promise<User[]> => {
  const rows = await db.executeRows(query, [email]);

  // I might need to find a way to pass the email from verify email so that I don't need to use the verification token in the above query (which I find very insecure? or unreliable because of possible collisions?)

  // I think I'll just pass the email thru sendEmail's url and then access that via req.query
  // also, I might need to index email in db for fast retrieval right?

  return rows[0] as User[];
};

export const verifyUserInDb = async (email: string): Promise<boolean> => {
  const rows = await db.executeResult(
    `UPDATE users SET verified = b'1', verificationToken = NULL, verificationExpire = NULL WHERE email = ?`,
    [email]
  );

  if (rows[0].affectedRows > 0) return true;

  return false;
};

export const addUserToDb = async (newUser: NewUser): Promise<boolean> => {
  const rows = await db.executeResult(
    `INSERT INTO users ( username, email, password, verificationToken, verificationExpire) VALUES (?, ?, ?, ?, ?)`,
    [
      newUser.username,
      newUser.email,
      newUser.password,
      newUser.verificationToken,
      newUser.verificationExpire,
    ]
  );

  if (rows[0].affectedRows > 0) return true;

  return false;
};

export const deleteUserFromDb = async (email: string): Promise<boolean> => {
  const rows = await db.executeResult(`DELETE FROM users WHERE email = ?`, [
    email,
  ]);

  if (rows[0].affectedRows > 0) return true;

  return false;
};
