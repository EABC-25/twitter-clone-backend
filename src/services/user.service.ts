import db from "../db/index";
import { type NewUser } from "../utils";

import {
  UserSchema,
  UserPartialNonStrictSchema,
  UserFollowsTallySchema,
  UserFollowsObjectSchema,
  UserPostRepliesLimitsSchema,
  UserCountSchema,
  UserMediaPublicIdSchema,
  UserSearchSchema,
  type User,
  type NewUserToDb,
  type UserPartialNonStrict,
  type UserFollowsTally,
  type UserFollowsObject,
  type UserPostRepliesLimits,
  type UserCount,
  type UserMediaPublicId,
  type UserSearch,
} from "src/utils/zod/User";
import { PostIdSchema, type PostId } from "src/utils/zod/Post";

export const checkUserInDb = async (
  column: string,
  arg: string
): Promise<boolean> => {
  const result = await db.executeRows(
    `SELECT EXISTS(SELECT 1 FROM users WHERE ${column} = ?)`,
    [arg]
  );

  // SHAPE:
  // result = [
  //   [ { 'EXISTS(SELECT 1 FROM users WHERE email = ?)': 1 } ],
  //   [ `EXISTS(SELECT 1 FROM users WHERE email = ?)` BIGINT(1) NOT NULL ]
  // ]

  if (Object.values(result[0][0])[0] === 1) {
    return true;
  }

  return false;
};

export const getUserCountInDb = async (): Promise<UserCount> => {
  const result = await db.executeRows(`SELECT COUNT(*) FROM users`);

  return UserCountSchema.parse({
    userCount: result[0][0]["COUNT(*)"],
  });
};

export const getUserFromDb = async (
  query: string,
  index: string
): Promise<UserPartialNonStrict[]> => {
  const rows = await db.executeRows(query, [index]);

  const users = rows[0].map((user: unknown) => {
    return UserPartialNonStrictSchema.parse(user);
  });

  return users;
};

export const getUsersFromDb = async (): Promise<User[]> => {
  const rows = await db.executeRows(`SELECT * FROM users`);

  const users = rows[0].map((user: unknown) => {
    return UserSchema.parse(user);
  });

  return users;
};

export const getUserLikedPostsFromDb = async (
  userId: string
): Promise<PostId[]> => {
  const rows = await db.executeRows(
    `SELECT postId FROM post_likes WHERE userId = ?`,
    [userId]
  );

  let postIds: PostId[] = [];

  for (let i = 0; i < rows[0].length; i++) {
    postIds.push(PostIdSchema.parse(rows[0][i].postId));
  }

  return postIds;
};

export const getUserFollowsFromDb = async (
  userId: string
): Promise<UserFollowsObject> => {
  const following = await db.executeRows(
    `
      SELECT
          u.profilePicture,
          u.username,
          u.displayName,
          u.bioText
        FROM user_follows
        JOIN users AS u ON user_follows.followed_id = u.userId
        WHERE user_follows.follower_id = ?
        ORDER BY user_follows.createdAt DESC
    `,
    [userId]
  );

  const followers = await db.executeRows(
    `
      SELECT
          u.profilePicture,
          u.username,
          u.displayName,
          u.bioText
        FROM user_follows
        JOIN users AS u ON user_follows.follower_id = u.userId
        WHERE user_follows.followed_id = ?
        ORDER BY user_follows.createdAt DESC
    `,
    [userId]
  );

  return UserFollowsObjectSchema.parse({
    following: following[0],
    followers: followers[0],
  });
};

export const getUserFollowsCountFromDb = async (
  userId: string
): Promise<UserFollowsTally> => {
  const following = await db.executeRows(
    `
      SELECT
          u.username
        FROM user_follows
        JOIN users AS u ON user_follows.followed_id = u.userId
        WHERE user_follows.follower_id = ?
    `,
    [userId]
  );

  const followers = await db.executeRows(
    `
      SELECT
          u.username
        FROM user_follows
        JOIN users AS u ON user_follows.follower_id = u.userId
        WHERE user_follows.followed_id = ?
    `,
    [userId]
  );

  const f1 =
    following[0].length === 0
      ? []
      : following[0].flatMap(f => {
          return Object.values(f);
        });

  const f2 =
    followers[0].length === 0
      ? []
      : followers[0].flatMap(f => {
          return Object.values(f);
        });

  return UserFollowsTallySchema.parse({
    followingCount: f1.length > 0 ? f1.length : 0,
    followersCount: f2.length ? f2.length : 0,
    following: f1.length > 0 ? f1 : null,
    followers: f2.length > 0 ? f2 : null,
  });
};

export const getUserPostsRepliesLimits = async (
  userId: string
): Promise<UserPostRepliesLimits> => {
  const postsResult = await db.executeRows(
    `SELECT COUNT(*) FROM posts WHERE userId = ?`,
    [userId]
  );
  const repliesResult = await db.executeRows(
    `SELECT COUNT(*) FROM replies WHERE replierId = ?`,
    [userId]
  );

  return UserPostRepliesLimitsSchema.parse({
    postCount: postsResult[0][0]["COUNT(*)"],
    replyCount: repliesResult[0][0]["COUNT(*)"],
  });
};

export const addUserToDb = async (newUser: NewUserToDb): Promise<boolean> => {
  try {
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
  } catch (err) {
    console.error("Error log:", err);
    throw new Error("Error at addUserToDb service.");
  }
};

export const deleteUserFromDb = async (email: string): Promise<boolean> => {
  const rows = await db.executeResult(`DELETE FROM users WHERE email = ?`, [
    email,
  ]);

  if (rows[0] && rows[0].affectedRows > 0) return true;

  return false;
};

export const updateUserInDb = async (
  query: string,
  queryParams: string[],
  userId: string
): Promise<UserMediaPublicId | null> => {
  try {
    const prevMedia = await db.executeRows(
      `SELECT profilePicturePublicId, headerPicturePublicId FROM users WHERE userId = ?`,
      [userId]
    );

    const updateResults = await db.executeResult(query, queryParams);

    if (updateResults[0].affectedRows === 0) {
      return null;
    }

    return UserMediaPublicIdSchema.parse(prevMedia[0][0]);
  } catch (err) {
    // why are we throwing null here instead of handling the error? because we need to activate !prevMedia conditional block in order to revert/delete uploaded media, after that updateUserProfile controller will throw and catch the error
    return null;
  }
};

export const updateUserFollowsInDb = async (
  type: string,
  followerId: string,
  followedId: string
): Promise<boolean> => {
  try {
    if (type === "follow") {
      const query = `INSERT INTO user_follows (follower_id, followed_id) VALUES (?, ?);`;
      const result = await db.executeResult(query, [followerId, followedId]);

      if (result[0].affectedRows !== 1) {
        return false;
      }

      return true;
    } else if (type === "unfollow") {
      const query = `DELETE FROM user_follows WHERE follower_id = ? AND followed_id = ?;`;
      const result = await db.executeResult(query, [followerId, followedId]);

      if (result[0].affectedRows !== 1) {
        return false;
      }

      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

export const getUsersSearchedFromDb = async (): Promise<UserSearch[]> => {
  const rows = await db.executeRows(
    `SELECT profilePicture, username, displayName FROM users`
  );

  const users = rows[0].map((user: unknown) => {
    return UserSearchSchema.parse(user);
  });

  return users;
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
