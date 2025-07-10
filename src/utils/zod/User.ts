import { z } from "zod";

import { BufferSchema } from "./Buffer";
import { DatesSchema } from "./Dates";
import { PostIdSchema } from "./Post";

export const UserEmailSchema = z.string().email();

export const UserSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  username: z.string(),
  email: UserEmailSchema,
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
  followingCount: z.union([z.number(), z.literal(0)]), // wait do I have to do this haha I mean 0 is a number already
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

export const UserFollowsObjectSchema = z.object({
  following: z.array(UserFollowsSchema),
  followers: z.array(UserFollowsSchema),
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

export const UserCountSchema = z.object({
  userCount: z.number(),
});

export const UserMediaPublicIdSchema = UserSchema.pick({
  profilePicturePublicId: true,
  headerPicturePublicId: true,
});

export const UserSearchSchema = UserSchema.pick({
  profilePicture: true,
  username: true,
  displayName: true,
});

export const UserInformationForUpdateSchema = UserSchema.pick({
  profilePicture: true,
  headerPicture: true,
  profilePicturePublicId: true,
  headerPicturePublicId: true,
  email: true,
}).extend({
  displayName: z.string().nullable(),
  bioText: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
});

export const UserFollowsForUpdateSchema = z.object({
  type: z.union([z.literal("follow"), z.literal("unfollow")]),
  otherUser: z.string(),
});

export type UserEmail = z.infer<typeof UserEmailSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserPartial = z.infer<typeof UserPartialSchema>;
export type SeedUser = z.infer<typeof SeedUserSchema>;
export type UserFollows = z.infer<typeof UserFollowsSchema>;
export type UserFollowsTally = z.infer<typeof UserFollowsTallySchema>;
export type UserFollowsObject = z.infer<typeof UserFollowsObjectSchema>;
export type UserPostRepliesLimits = z.infer<typeof UserPostRepliesLimitsSchema>;
export type UserCount = z.infer<typeof UserCountSchema>;
export type UserMediaPublicId = z.infer<typeof UserMediaPublicIdSchema>;
export type UserSearch = z.infer<typeof UserSearchSchema>;
export type UserInformationForUpdate = z.infer<
  typeof UserInformationForUpdateSchema
>;
