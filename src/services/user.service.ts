import db from "../db/index";

import { type User, type UserFollows, type UserSearch } from "../utils";

export const getUserFromDb = async (
  query: string,
  index: string
): Promise<User[]> => {
  const rows = await db.executeRows(query, [index]);

  return rows[0] as User[];
};

export const getUsersFromDb = async (): Promise<User[]> => {
  const rows = await db.executeRows(`SELECT * FROM users`);
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

export const getUserFollowsFromDb = async (
  userId: string
): Promise<{
  following: UserFollows[];
  followers: UserFollows[];
}> => {
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

  return {
    following: following[0] as UserFollows[],
    followers: followers[0] as UserFollows[],
  };
};

export const getUserFollowsCountFromDb = async (
  userId: string
): Promise<{
  followingCount: number;
  followersCount: number;
  following: string[] | null;
  followers: string[] | null;
} | null> => {
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

  return {
    followingCount: f1.length > 0 ? f1.length : 0,
    followersCount: f2.length ? f2.length : 0,
    following: f1.length > 0 ? f1 : null,
    followers: f2.length > 0 ? f2 : null,
  };
};

export const getUserPostsRepliesLimits = async (
  userId: string
): Promise<{
  postCount: number;
  replyCount: number;
}> => {
  const postsResult = await db.executeRows(
    `SELECT COUNT(*) FROM posts WHERE userId = ?`,
    [userId]
  );
  const repliesResult = await db.executeRows(
    `SELECT COUNT(*) FROM replies WHERE replierId = ?`,
    [userId]
  );

  return {
    postCount: postsResult[0][0]["COUNT(*)"],
    replyCount: repliesResult[0][0]["COUNT(*)"],
  };
};

export const deleteUserFromDb = async (email: string): Promise<boolean> => {
  const rows = await db.executeResult(`DELETE FROM users WHERE email = ?`, [
    email,
  ]);

  if (rows[0].affectedRows > 0) return true;

  return false;
};

export const updateUserInDb = async (
  query: string,
  queryParams: string[],
  userId: string
): Promise<{
  profilePicturePublicId: string;
  headerPicturePublicId: string;
} | null> => {
  try {
    const prevMedia = await db.executeRows(
      `SELECT profilePicturePublicId, headerPicturePublicId FROM users WHERE userId = ?`,
      [userId]
    );

    const updateResults = await db.executeResult(query, queryParams);

    if (updateResults[0].affectedRows === 0) {
      return null;
    }

    return prevMedia[0][0] as {
      profilePicturePublicId: string;
      headerPicturePublicId: string;
    };
  } catch (err) {
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
  return rows[0] as UserSearch[];
};

export const getUserCountInDb = async (): Promise<{
  userCount: number;
}> => {
  const result = await db.executeRows(`SELECT COUNT(*) FROM users`);

  return {
    userCount: result[0][0]["COUNT(*)"],
  };
};
