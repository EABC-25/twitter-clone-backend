import fs from "fs/promises";
import path from "path";
import db from "src/db";

import {
  type SeedUser,
  type SeedPost,
  type SeedReply,
  type SeedUserFollow,
  type SeedPostLike,
} from "../types/types";
import { toMySQLTimestampUTC, extractBitFromBuffer } from "./helpers";

const queries = [
  "INSERT INTO users (userId, createdAt, username, email, password, displayName, displayNamePermanent, dateOfBirth, bioText, verified, verificationToken, verificationExpire, forgotPasswordFlag, forgotPasswordToken, forgotPasswordExpire, profilePicture, headerPicture, userInfoChangeCount, profilePicturePublicId, headerPicturePublicId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
  "INSERT INTO posts (postId, createdAt, postText, postMedia, mediaTypes, likeCount, replyCount, mediaPublicId, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
  "INSERT INTO replies (replyId, postId, createdAt, postText, likeCount, replyCount, replierId, posterId) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
  "INSERT INTO post_likes (postId, userId, createdAt) VALUES (?, ?, ?);",
  "INSERT INTO user_follows (follower_id, followed_id, createdAt) VALUES (?, ?, ?);",
];

async function seeder(tableName: string, fileName: string) {
  try {
    if (tableName === "users") {
      const filePath = path.resolve("tests/utils/data/", fileName);
      const file = await fs.readFile(filePath, "utf-8");
      const users: SeedUser[] = JSON.parse(file);

      for (const user of users) {
        await db.executeResult(queries[0], [
          user.userId,
          toMySQLTimestampUTC(user.createdAt),
          user.username,
          user.email,
          user.password,
          user.displayName,
          extractBitFromBuffer(user.displayNamePermanent),
          toMySQLTimestampUTC(user.dateOfBirth),
          user.bioText,
          extractBitFromBuffer(user.verified),
          user.verificationToken,
          user.verificationExpire,
          extractBitFromBuffer(user.forgotPasswordFlag),
          user.forgotPasswordToken,
          user.forgotPasswordExpire,
          user.profilePicture,
          user.headerPicture,
          user.userInfoChangeCount,
          user.profilePicturePublicId,
          user.headerPicturePublicId,
        ]);
        // console.log(`Inserted user: ${user.username}`);
      }
    } else if (tableName === "posts") {
      const filePath = path.resolve("tests/utils/data/", fileName);
      const file = await fs.readFile(filePath, "utf-8");
      const posts: SeedPost[] = JSON.parse(file);

      for (const post of posts) {
        await db.executeResult(queries[1], [
          post.postId,
          toMySQLTimestampUTC(post.createdAt),
          post.postText,
          post.postMedia,
          post.mediaTypes,
          post.likeCount,
          post.replyCount,
          post.mediaPublicId,
          post.userId,
        ]);
        // console.log(`Inserted post: ${post.postId}`);
      }
    } else if (tableName === "replies") {
      const filePath = path.resolve("tests/utils/data/", fileName);
      const file = await fs.readFile(filePath, "utf-8");
      const replies: SeedReply[] = JSON.parse(file);

      for (const reply of replies) {
        await db.executeResult(queries[2], [
          reply.replyId,
          reply.postId,
          toMySQLTimestampUTC(reply.createdAt),
          reply.postText,
          reply.likeCount,
          reply.replyCount,
          reply.replierId,
          reply.posterId,
        ]);
        // console.log(`Inserted reply: ${reply.replyId}`);
      }
    } else if (tableName === "post_likes") {
      const filePath = path.resolve("tests/utils/data/", fileName);
      const file = await fs.readFile(filePath, "utf-8");
      const postLikes: SeedPostLike[] = JSON.parse(file);

      for (const postLike of postLikes) {
        await db.executeResult(queries[3], [
          postLike.postId,
          postLike.userId,
          toMySQLTimestampUTC(postLike.createdAt),
        ]);
        // console.log(
        //   `Inserted postLike for: ${postLike.postId} by ${postLike.userId}`
        // );
      }
    } else if (tableName === "user_follows") {
      const filePath = path.resolve("tests/utils/data/", fileName);
      const file = await fs.readFile(filePath, "utf-8");
      const userFollows: SeedUserFollow[] = JSON.parse(file);

      for (const userFollow of userFollows) {
        await db.executeResult(queries[4], [
          userFollow.follower_id,
          userFollow.followed_id,
          toMySQLTimestampUTC(userFollow.createdAt),
        ]);
        // console.log(
        //   `Inserted userFollow for: ${userFollow.follower_id} - ${userFollow.followed_id}`
        // );
      }
    } else {
      throw new Error(`No seeding logic defined for table: ${tableName}`);
    }
  } catch (err) {
    console.error("Seeder error: ", err);
  }
}

export default seeder;
