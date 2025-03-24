import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import pool from "../../db";
import db from "../../db/index";
import {
  type User,
  type NewUser,
  type UserByToken,
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

export const getUserLikedPostsFromDb = async (
  userId: string
): Promise<{ postId: string }[]> => {
  const rows = await db.executeRows(
    `SELECT postId FROM post_likes WHERE userId = ?`,
    [userId]
  );

  return rows[0] as { postId: string }[];
};

// INSERT INTO post_likes (userId, postId) VALUES('313168b5-ef63-11ef-a3db-88a4c22b5dbc', 'b879a07e-fef5-11ef-86f2-88a4c22b5dbc');

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

export const getPostFromDb = async (id: string): Promise<Post[]> => {
  const rows = await db.executeRows(
    `
    SELECT * FROM posts WHERE postId = ?
    `,
    [id]
  );

  return rows[0] as Post[];
};

export const getUserPostsFromDb = async (
  limit: number,
  offset: number,
  username: string
): Promise<Post[]> => {
  const rows = await db.executeRows(
    `
    SELECT * FROM posts
    WHERE username = ?
    ORDER BY createdAt DESC
    LIMIT ${limit + 1} OFFSET ${offset}
    `,
    [username]
  );
  // adding one more to limit here so that we can signal frontend if there are more posts to retrieve after this batch through type ResponsePost.nextPage
  return rows[0] as Post[];
};

export const updateLikeInUserAndPost = async (
  type: string,
  postId: string,
  userId: string
): Promise<boolean> => {
  let usersQuery: string;
  let postsQuery: string;
  let params: any[];

  console.log(type, postId, userId);

  if (type === "add") {
    usersQuery = `UPDATE users SET likedPosts = COALESCE(CONCAT(likedPosts, ',', ?), ?) WHERE userId = ?`;
    params = [postId, postId, userId];
    postsQuery = `UPDATE posts SET likeCount = likeCount + 1 WHERE postId = ?`;
  } else if (type === "remove") {
    usersQuery = `UPDATE users SET likedPosts = NULLIF(TRIM(BOTH ',' FROM REPLACE(CONCAT(',', likedPosts, ','), CONCAT(',', ?, ','), ',')), '') WHERE userId = ?`;
    params = [postId, userId];
    postsQuery = `UPDATE posts SET likeCount = GREATEST(likeCount - 1, 0) WHERE postId = ?`;
  }
  const usersResult = await db.executeResult(usersQuery, params);
  const postsResult = await db.executeResult(postsQuery, [postId]);

  if (usersResult[0].affectedRows !== 1 && postsResult[0].affectedRows !== 1) {
    return false;
  }

  return true;
};
