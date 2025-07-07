import { z } from "zod";

import { BufferSchema } from "./Buffer";
import { DatesSchema } from "./Dates";
import { PostIdSchema } from "./Post";

export const UserSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  displayName: z.string(),
  displayNamePermanent: z.instanceof(Buffer).transform(buf => buf[0] === 1),
  dateOfBirth: z.date(),
  bioText: z.string(),
  verified: z.instanceof(Buffer).transform(buf => buf[0] === 1),
  verificationToken: z.string().nullable(),
  verificationExpire: z.number().nullable(),
  forgotPasswordFlag: z.instanceof(Buffer).transform(buf => buf[0] === 1),
  forgotPasswordToken: z.string().nullable(),
  forgotPasswordExpire: z.string().nullable(),
  profilePicture: z.string().nullable(),
  headerPicture: z.string().nullable(),
  userInfoChangeCount: z.number().nullable(),
  profilePicturePublicId: z.string().nullable(),
  headerPicturePublicId: z.string().nullable(),
});

export const UserPartialSchema = UserSchema.partial();

export const SeedUserSchema = UserSchema.extend({
  createdAt: z.string(),
  dateOfBirth: z.string(),
  verified: BufferSchema,
  displayNamePermanent: BufferSchema,
  forgotPasswordFlag: BufferSchema,
});

export const UserFollowsTallySchema = z.object({
  followingCount: z.union([z.number(), z.literal(0)]), // wait do I have to do this haha I mean 0 is still a number right
  followersCount: z.union([z.number(), z.literal(0)]),
  following: z.array(z.string()).nullable(),
  followers: z.array(z.string()).nullable(),
});

export const UserFollowsSchema = UserSchema.pick({
  username: true,
  displayName: true,
  profilePicture: true,
  bioText: true,
});

export const UserPostRepliesLimitsSchema = z.object({
  postCount: z.number().nullable(),
  replyCount: z.number().nullable(),
});

export const UserResponseSchema = UserSchema.pick({
  username: true,
  email: true,
  displayName: true,
  displayNamePermanent: true,
  bioText: true,
  profilePicture: true,
  headerPicture: true,
  userInfoChangeCount: true,
}).extend({
  displayNamePermanent: z.boolean(),
  verified: z.boolean(),
  dates: DatesSchema,
  likedPosts: z.array(z.string()).nullable(),
  userFollowsCount: UserFollowsTallySchema,
  postCount: UserPostRepliesLimitsSchema.shape.postCount,
  replyCount: UserPostRepliesLimitsSchema.shape.replyCount,
});

export type User = z.infer<typeof UserSchema>;
export type UserPartial = z.infer<typeof UserPartialSchema>;
export type SeedUser = z.infer<typeof SeedUserSchema>;
export type UserFollows = z.infer<typeof UserFollowsSchema>;
export type UserFollowsTally = z.infer<typeof UserFollowsTallySchema>;
export type UserPostRepliesLimits = z.infer<typeof UserPostRepliesLimitsSchema>;
