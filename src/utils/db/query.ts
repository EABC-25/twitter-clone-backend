import { type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import pool from "../../db";
import db from "../../db/index";
import {
  type User,
  type NewUser,
  type UserByToken,
  type NewPost,
  type Post,
  type NewReply,
  type Reply,
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

export const addPostToDb = async (newPost: NewPost): Promise<Post | null> => {
  const resultId = await db.executeRows(`SELECT UUID() AS uuid;`);

  const newUuid = resultId[0][0].uuid;

  const resultPost = await db.executeResult(
    `INSERT INTO posts (postId, username, displayName, postText, postMedia, mediaTypes) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newUuid,
      newPost.username,
      newPost.displayName,
      newPost.postText,
      newPost.postMedia,
      newPost.mediaTypes,
    ]
  );

  if (resultPost[0].affectedRows <= 0) return null;

  const resultNewPost = await db.executeRows(
    `SELECT * FROM posts WHERE postId = ?`,
    [newUuid]
  );

  if (resultNewPost[0].length === 0) return null;

  return resultNewPost[0][0] as Post;
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

export const getPostFromDb = async (
  query: string,
  index: string
): Promise<Post[]> => {
  const rows = await db.executeRows(query, [index]);

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

export const updatePostLikesInDb = async (
  type: string,
  postId: string,
  userId: string
): Promise<boolean> => {
  try {
    let postLikesQuery: string;
    let postQuery: string;

    if (type === "add") {
      postLikesQuery = `INSERT INTO post_likes (postId, userId) VALUES (?, ?)`;
      postQuery = `UPDATE posts SET likeCount = likeCount + 1 WHERE postId = ?`;
    } else if (type === "remove") {
      postLikesQuery = `DELETE FROM post_likes WHERE postId = ? AND userId = ?`;
      postQuery = `UPDATE posts SET likeCount = GREATEST(likeCount - 1, 0) WHERE postId = ?`;
    }
    const postLikesResult = await db.executeResult(postLikesQuery, [
      postId,
      userId,
    ]);

    if (postLikesResult[0].affectedRows !== 1) {
      return false;
    }

    const postResult = await db.executeResult(postQuery, [postId]);

    if (postResult[0].affectedRows !== 1) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

export const addReplyToDb = async (
  newReply: NewReply
): Promise<Reply | null> => {
  const resultId = await db.executeRows(`SELECT UUID() AS uuid;`);

  const newUuid = resultId[0][0].uuid;

  const resultReply = await db.executeResult(
    `INSERT INTO replies (replyId, postId, posterName, username, displayName, postText) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newUuid,
      newReply.postId,
      newReply.posterName,
      newReply.username,
      newReply.displayName,
      newReply.postText,
    ]
  );

  if (resultReply[0].affectedRows <= 0) return null;

  const postResult = await db.executeResult(
    `UPDATE posts SET replyCount = replyCount + 1 WHERE postId = ?`,
    [newReply.postId]
  );

  if (postResult[0].affectedRows <= 0) return null;

  const resultNewReply = await db.executeRows(
    `SELECT * FROM replies WHERE replyId = ?`,
    [newUuid]
  );

  if (resultNewReply[0].length === 0) return null;

  return resultNewReply[0][0] as Reply;
};

export const getPostRepliesFromDb = async (
  limit: number,
  offset: number,
  postId: string
): Promise<Reply[]> => {
  const rows = await db.executeRows(
    `
    SELECT * FROM replies
    WHERE postId = ?
    ORDER BY createdAt DESC
    LIMIT ${limit + 1} OFFSET ${offset}
    `,
    [postId]
  );

  // adding one more to limit here so that we can signal frontend if there are more posts to retrieve after this batch through type ResponsePost.nextPage
  return rows[0] as Reply[];
};

export const getReplyFromDb = async (
  query: string,
  index: string
): Promise<Reply[]> => {
  const rows = await db.executeRows(query, [index]);

  return rows[0] as Reply[];
};

export const updateReplyLikesInDb = async (
  type: string,
  replyId: string,
  userId: string
): Promise<boolean> => {
  try {
    let replyLikesQuery: string;
    let replyQuery: string;

    // we actually will be putting reply likes in post_likes table since in the future I plan to merge post and reply as one
    if (type === "add") {
      replyLikesQuery = `INSERT INTO post_likes (postId, userId) VALUES (?, ?)`;
      replyQuery = `UPDATE replies SET likeCount = likeCount + 1 WHERE replyId = ?`;
    } else if (type === "remove") {
      replyLikesQuery = `DELETE FROM post_likes WHERE postId = ? AND userId = ?`;
      replyQuery = `UPDATE replies SET likeCount = GREATEST(likeCount - 1, 0) WHERE replyId = ?`;
    }
    const replyLikesResult = await db.executeResult(replyLikesQuery, [
      replyId,
      userId,
    ]);

    console.log("replyLikesResult:", replyLikesResult);

    if (replyLikesResult[0].affectedRows !== 1) {
      return false;
    }

    const replyResult = await db.executeResult(replyQuery, [replyId]);

    console.log("replyResult: ", replyResult);

    if (replyResult[0].affectedRows !== 1) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};
