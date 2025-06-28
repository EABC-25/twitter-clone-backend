import db from "../db";
import { type NewUser } from "../utils";

export const addUserToDb = async (newUser: NewUser): Promise<boolean> => {
  const rows = await db.executeResult(
    `INSERT INTO users ( username, email, password, displayName, dateOfBirth, verificationToken, verificationExpire) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      newUser.username,
      newUser.email,
      newUser.password,
      newUser.displayName,
      newUser.dateOfBirth,
      newUser.verificationToken,
      newUser.verificationExpire,
    ]
  );

  if (rows?.[0]?.affectedRows > 0) return true;

  return false;
};

export const verifyUserInDb = async (email: string): Promise<boolean> => {
  const rows = await db.executeResult(
    `UPDATE users SET verified = b'1', verificationToken = NULL, verificationExpire = NULL WHERE email = ?`,
    [email]
  );

  if (rows?.[0]?.affectedRows > 0) return true;

  return false;
};

export const checkUserWithEmail = async (
  email: string
): Promise<{ email: string } | null> => {
  const rows = await db.executeRows(`SELECT email FROM users WHERE email = ?`, [
    email,
  ]);

  if (!rows[0] || rows[0].length === 0) {
    return null;
  }

  // we only need to return the first one because email is a UNIQUE value...
  return rows[0][0] as { email: string };
};
