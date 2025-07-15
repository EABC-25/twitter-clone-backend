import db from "../db";
import { type Post, type NewPost, type Reply, type NewReply } from "../utils";
import { UserIdSchema, type UserId } from "src/utils/zod/User";
import {
  PostPartialStrictSchema,
  PostToResponseSchema,
  type PostPartialStrict,
  type PostToResponse,
} from "src/utils/zod/Post";

export const checkExistingPostsInDb = async (): Promise<boolean> => {
  const result = await db.executeRows(`
    SELECT EXISTS(SELECT 1 FROM posts);
    `);

  if (Object.values(result[0][0])[0] === 1) {
    return true;
  }
  return false;
};

export const checkExistingPostsInDbUsingId = async (
  column: string,
  arg: string
): Promise<boolean> => {
  const result = await db.executeRows(
    `SELECT EXISTS(SELECT 1 FROM posts WHERE ${column} = ?)`,
    [arg]
  );

  if (Object.values(result[0][0])[0] === 1) {
    return true;
  }
  return false;
};

export const getPostFromDb = async (
  arg: string
): Promise<PostPartialStrict[]> => {
  // I know postId is unique and is already indexed by the db... but maybe we can still optimize this query some more?? since it is returning an array, possibly it is not expecting to only get 1 right? so maybe it still somehow checks all the other entries in the db for postId equality?? or maybe I'm using the wrong db method (db.executeRows)???
  const rows = await db.executeRows(
    `
      SELECT 
        posts.postId, 
        posts.createdAt, 
        posts.postText, 
        posts.postMedia, 
        posts.mediaTypes, 
        posts.likeCount, 
        posts.replyCount, 
        users.username, 
        users.displayName, 
        users.profilePicture 
          FROM posts JOIN users 
          WHERE posts.userId = users.userId AND postId = ?
          `,
    [arg]
  );

  const data = rows[0].map(post => {
    return PostPartialStrictSchema.parse(post);
  });

  return data;
};

export const getUserIdFromPost = async (
  postId: string
): Promise<UserId | null> => {
  const rows = await db.executeRows(
    "SELECT userId FROM posts WHERE postId = ?",
    [postId]
  );

  if (rows[0].length) {
    return UserIdSchema.parse(rows[0][0]);
  }

  return null;
};

export const getPostsFromDb = async (
  limit: number,
  offset: number
): Promise<PostToResponse> => {
  // adding one more to limit here so that we can signal frontend if there are more posts to retrieve after this batch through type ResponsePost.nextPage
  const rows = await db.executeRows(
    `
    SELECT 
      posts.postId, 
      posts.createdAt, 
      posts.postText, 
      posts.postMedia, 
      posts.mediaTypes, 
      posts.likeCount, 
      posts.replyCount, 
      users.username, 
      users.displayName, 
      users.profilePicture 
        FROM posts JOIN users 
        WHERE posts.userId = users.userId 
        ORDER BY createdAt DESC
        LIMIT ${limit + 1} OFFSET ${offset}
    `
  );

  const data = PostToResponseSchema.parse({
    posts: rows[0].length > limit ? rows[0].slice(0, 30) : rows[0],
    nextPage: rows[0].length > limit ? true : false,
  });
  // apparently - {posts: [], nextPage: false} also passes the parse, therefore we need to block 0 posts in controller

  return data;
};

export const getUserPostsFromDb = async (
  limit: number,
  offset: number,
  userId: string
): Promise<PostToResponse> => {
  const rows = await db.executeRows(
    `
    SELECT 
      posts.postId, 
      posts.createdAt, 
      posts.postText, 
      posts.postMedia, 
      posts.mediaTypes, 
      posts.likeCount, 
      posts.replyCount, 
      users.username, 
      users.displayName, 
      users.profilePicture 
        FROM posts JOIN users 
        WHERE posts.userId = users.userId AND posts.userId = ?
        ORDER BY createdAt DESC
        LIMIT ${limit + 1} OFFSET ${offset}
    `,
    [userId]
  );
  const data = PostToResponseSchema.parse({
    posts: rows[0].length > limit ? rows[0].slice(0, 30) : rows[0],
    nextPage: rows[0].length > limit ? true : false,
  });

  return data;
};

export const addPostToDb = async (newPost: NewPost): Promise<Post | null> => {
  const resultId = await db.executeRows(`SELECT UUID() AS uuid;`);

  const newUuid = resultId[0][0].uuid;

  const resultPost = await db.executeResult(
    `INSERT INTO posts (postId, userId, postText, postMedia, mediaTypes, mediaPublicId) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      newUuid,
      newPost.userId,
      newPost.postText,
      newPost.postMedia,
      newPost.mediaTypes,
      newPost.mediaPublicId,
    ]
  );

  if (resultPost[0].affectedRows <= 0) return null;

  const resultNewPost = await db.executeRows(
    `SELECT 
        posts.postId, 
        posts.createdAt, 
        posts.postText, 
        posts.postMedia, 
        posts.mediaTypes, 
        posts.likeCount,
        posts.replyCount, 
        users.username, 
        users.displayName, 
        users.profilePicture 
      FROM posts 
      JOIN users 
      WHERE posts.userId = users.userId 
      AND posts.postId = ?`,
    [newUuid]
  );

  if (resultNewPost[0].length === 0) return null;

  // const resultLimits = await db.executeResult(
  //   `UPDATE users SET postCount = postCount + 1 WHERE userId = ?`,
  //   [newPost.userId]
  // );

  // if (resultLimits[0].affectedRows === 0) return null;

  return resultNewPost[0][0] as Post;
};

export const updatePostLikesInDb = async (
  type: string,
  postId: string,
  userId: string
): Promise<boolean> => {
  try {
    if (type === "add") {
      const postLikesQuery = `INSERT INTO post_likes (postId, userId) VALUES (?, ?)`;
      const postQuery = `UPDATE posts SET likeCount = likeCount + 1 WHERE postId = ?`;
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
    } else if (type === "remove") {
      const postLikesQuery = `DELETE FROM post_likes WHERE postId = ? AND userId = ?`;
      const postQuery = `UPDATE posts SET likeCount = GREATEST(likeCount - 1, 0) WHERE postId = ?`;
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
    }
    return false;
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
    `INSERT INTO replies (replyId, postId, replierId, posterId, postText) VALUES (?, ?, ?, ?, ?)`,
    [
      newUuid,
      newReply.postId,
      newReply.replierId,
      newReply.posterId,
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
    `SELECT 
        replies.replyId, 
        replies.postId, 
        u1.username AS replierUserName, 
        u1.displayName AS replierDisplayName,
        u1.profilePicture AS replierProfilePicture, 
        u2.username AS posterUserName, 
        replies.createdAt, 
        replies.postText, 
        replies.likeCount, 
        replies.replyCount 
      FROM replies 
      JOIN users AS u1 ON replies.replierId = u1.userId
      JOIN users AS u2 ON replies.posterId = u2.userId
      WHERE replies.replyId = ?`,
    [newUuid]
  );

  if (resultNewReply[0].length === 0) return null;

  // const resultLimits = await db.executeResult(
  //   `UPDATE users SET replyCount = replyCount + 1 WHERE userId = ?`,
  //   [newReply.replierId]
  // );

  // if (resultLimits[0].affectedRows === 0) return null;

  return resultNewReply[0][0] as Reply;
};

export const getPostRepliesFromDb = async (
  limit: number,
  offset: number,
  postId: string
): Promise<Reply[]> => {
  const rows = await db.executeRows(
    `
    SELECT 
        replies.replyId, 
        replies.postId, 
        u1.username AS replierUserName, 
        u1.displayName AS replierDisplayName, 
        u1.profilePicture AS replierProfilePicture, 
        u2.username AS posterUserName, 
        replies.createdAt, 
        replies.postText, 
        replies.likeCount, 
        replies.replyCount 
      FROM replies 
      JOIN users AS u1 ON replies.replierId = u1.userId
      JOIN users AS u2 ON replies.posterId = u2.userId
      WHERE replies.postId = ?
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
    // we actually will be putting reply likes in post_likes table since in the future I plan to merge post and reply as one
    if (type === "add") {
      const replyLikesQuery = `INSERT INTO post_likes (postId, userId) VALUES (?, ?)`;
      const replyQuery = `UPDATE replies SET likeCount = likeCount + 1 WHERE replyId = ?`;
      const replyLikesResult = await db.executeResult(replyLikesQuery, [
        replyId,
        userId,
      ]);

      if (replyLikesResult[0].affectedRows !== 1) {
        return false;
      }

      const replyResult = await db.executeResult(replyQuery, [replyId]);

      if (replyResult[0].affectedRows !== 1) {
        return false;
      }

      return true;
    } else if (type === "remove") {
      const replyLikesQuery = `DELETE FROM post_likes WHERE postId = ? AND userId = ?`;
      const replyQuery = `UPDATE replies SET likeCount = GREATEST(likeCount - 1, 0) WHERE replyId = ?`;
      const replyLikesResult = await db.executeResult(replyLikesQuery, [
        replyId,
        userId,
      ]);

      if (replyLikesResult[0].affectedRows !== 1) {
        return false;
      }

      const replyResult = await db.executeResult(replyQuery, [replyId]);

      if (replyResult[0].affectedRows !== 1) {
        return false;
      }

      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const deletePostInDb = async (
  postId: string,
  userId: string
): Promise<{
  mediaPublicId: string;
  mediaTypes: string;
  replyCount: number;
} | null> => {
  const mediaResult = await db.executeRows(
    `SELECT mediaPublicId, mediaTypes FROM posts WHERE postId = ?`,
    [postId]
  );
  const deletePost = await db.executeResult(
    `DELETE FROM posts WHERE postId = ?`,
    [postId]
  );

  const deleteReply = Promise.resolve(
    db.executeResult(`DELETE FROM replies WHERE postId = ?`, [postId])
  );

  const deleteLikes = Promise.resolve(
    db.executeResult(`DELETE FROM post_likes WHERE postId = ?`, [postId])
  );

  // const replyCount = mediaResult[0][0].replyCount;

  // const deleteLimits = Promise.resolve(
  //   db.executeResult(
  //     `UPDATE users SET postCount = GREATEST(postCount - 1, 0), replyCount = GREATEST(replyCount - ?, 0) WHERE userId = ?`,
  //     [replyCount, userId]
  //   )
  // );

  Promise.all([deleteReply, deleteLikes]).then(_ => {});

  if (deletePost[0].affectedRows >= 1) {
    return mediaResult[0][0] as {
      mediaPublicId: string;
      mediaTypes: string;
      replyCount: number;
    };
  }
  return null;
};

export const deleteReplyInDb = async (
  replyId: string,
  postId: string,
  userId: string
): Promise<boolean> => {
  const deleteReply = await db.executeResult(
    `DELETE FROM replies WHERE replyId = ?`,
    [replyId]
  );

  const deleteLikes = Promise.resolve(
    db.executeResult(`DELETE FROM post_likes WHERE postId = ?`, [replyId])
  );

  const deleteReplyCount = Promise.resolve(
    db.executeResult(
      `UPDATE posts SET replyCount = GREATEST(replyCount - 1, 0) WHERE postId = ?`,
      [postId]
    )
  );

  Promise.all([deleteReplyCount, deleteLikes]).then(_ => {});

  if (deleteReply[0].affectedRows <= 0) {
    return false;
  }

  return true;
};
