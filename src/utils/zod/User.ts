import { z } from "zod";

import { BufferSchema } from "./Buffer";

export const UserSchema = z.object({
  userId: z.string(),
  createdAt: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  displayName: z.string(),
  displayNamePermanent: BufferSchema,
  dateOfBirth: z.string(),
  bioText: z.string(),
  verified: BufferSchema,
  verificationToken: z.string().nullable(),
  verificationExpire: z.number().nullable(),
  forgotPasswordFlag: BufferSchema,
  forgotPasswordToken: z.string().nullable(),
  forgotPasswordExpire: z.string().nullable(),
  profilePicture: z.string().nullable(),
  headerPicture: z.string().nullable(),
  userInfoChangeCount: z.number(),
  profilePicturePublicId: z.string().nullable(),
  headerPicturePublicId: z.string().nullable(),
});

// likedPosts: z.array(z.string()).nullable()

// dates: z.object({
//   createdAt: z.string(),
//   createdAtShort: z.string(),
//   dateOfBirth: z.string(),
//   dateOfBirthShort: z.string(),
//   dateOfBirthNum: z.string(),
// })

// userFollowsCount: z.object({
//   followingCount: z.number(),
//   followersCount: z.number(),
//   following: z.array(z.string()).nullable(),
//   followers: z.array(z.string()).nullable(),
// })

export type User = z.infer<typeof UserSchema>;
