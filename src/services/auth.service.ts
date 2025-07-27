import db from "../db";

export const verifyUserInDb = async (email: string): Promise<boolean> => {
  try {
    const rows = await db.executeResult(
      `UPDATE users SET verified = b'1', verificationToken = NULL, verificationExpire = NULL WHERE email = ?`,
      [email]
    );

    if (rows?.[0]?.affectedRows > 0) return true;

    return false;
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at verifyUserInDb service.");
  }
};
