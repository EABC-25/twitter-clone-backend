import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import pool from "../../db";
import db from "../../db/index";
import {
  type User,
  type NewUser,
  type NewPost,
  type Post,
} from "../types/types";

export const getUsersFromDb = async (): Promise<User[]> => {
  const rows = await db.executeRows(`SELECT * FROM users`);
  return rows[0] as User[];
};

export const checkUserWithEmail = async (
  email: string
): Promise<{ email: string }[]> => {
  const rows = await db.executeRows(`SELECT email FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0] as { email: string }[];
};

// TO DO: fix types, we need to exactly return the shape of the object defined in the promise return type... not just USER[]. ex. {email: string, username: string etc...}

// method for getting the user from db
// param1: custom query
// param2: (indexed) email or userId
export const getUserFromDb = async (
  query: string,
  index: string
): Promise<User[]> => {
  const rows = await db.executeRows(query, [index]);

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

export const addPostToDb = async (newPost: NewPost): Promise<boolean> => {
  const rows = await db.executeResult(
    `INSERT INTO posts ( username, displayName, postText, postMedia, mediaTypes) VALUES (?, ?, ?, ?, ?)`,
    [
      newPost.username,
      newPost.displayName,
      newPost.postText,
      newPost.postMedia,
      newPost.mediaTypes,
    ]
  );

  if (rows[0].affectedRows > 0) return true;

  return false;
};

export const getPostsFromDb = async (
  limit: number,
  offset: number
): Promise<Post[]> => {
  const rows = await db.executeRows(`
    SELECT * FROM posts
    ORDER BY createdAt DESC
    LIMIT ${limit + 1} OFFSET ${offset}
    `);
  // adding one more to limit here so that we can signal frontend if there are more posts to retrieve after this batch through type ResponsePost.nextPage
  return rows[0] as Post[];
};
