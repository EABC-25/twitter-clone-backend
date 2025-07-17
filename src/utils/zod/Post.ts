import { z } from "zod";

export const PostIdSchema = z.string();

export const PostSchema = z.object({
  postId: PostIdSchema,
  createdAt: z.date(),
  postText: z.string().nullable(),
  postMedia: z.string().nullable(),
  mediaTypes: z.string().nullable(),
  likeCount: z.number(),
  replyCount: z.number(),
  mediaPublicId: z.string().nullable(),
  userId: z.string(),
});

export const PostPartialStrictSchema = PostSchema.pick({
  postId: true,
  createdAt: true,
  postText: true,
  postMedia: true,
  mediaTypes: true,
  likeCount: true,
  replyCount: true,
}).extend({
  username: z.string(),
  displayName: z.string(),
  profilePicture: z.string().nullable(),
});

export const ReplyPartialStrictSchema = PostSchema.pick({
  postId: true,
  createdAt: true,
  postText: true,
  likeCount: true,
  replyCount: true,
}).extend({
  replyId: PostIdSchema,
  replierUserName: z.string(),
  replierDisplayName: z.string(),
  replierProfilePicture: z.string().nullable(),
  posterUserName: z.string(),
});

export const PostToResponseSchema = z.object({
  posts: z.array(PostPartialStrictSchema),
  nextPage: z.boolean(),
});

export const ReplyToResponseSchema = z.object({
  replies: z.array(ReplyPartialStrictSchema),
  nextPage: z.boolean(),
  nextPageCount: z.number(),
});

export const NewPostFromRequestSchema = z.object({
  html: z.string().nullable(),
  media: z.array(z.string()),
  mediaPublicId: z.array(z.string()),
  mediaTypes: z.array(z.string()),
});

export const NewReplyFromRequestSchema = z.object({
  html: z.string().nullable(),
  postId: PostIdSchema,
});

export const NewPostToDbSchema = z.object({
  userId: z.string(),
  postText: z.string().nullable(),
  postMedia: z.string().nullable(),
  mediaTypes: z.string().nullable(),
  mediaPublicId: z.string().nullable(),
});

export const NewReplyToDbSchema = z.object({
  postId: PostIdSchema,
  replierId: z.string(), // replierId and posterId is actuall userId from UserSchema but I chose not to import and use that because its just a string check
  posterId: z.string(),
  postText: z.string().nullable(),
});

export const UpdatePostLikesFromRequestSchema = z.object({
  id: PostSchema.shape.postId,
  type: z.union([z.literal("add"), z.literal("remove")]),
});

export type PostId = z.infer<typeof PostIdSchema>;
export type Post = z.infer<typeof PostSchema>;
export type PostPartialStrict = z.infer<typeof PostPartialStrictSchema>;
export type ReplyPartialStrict = z.infer<typeof ReplyPartialStrictSchema>;
export type PostToResponse = z.infer<typeof PostToResponseSchema>;
export type ReplyToResponse = z.infer<typeof ReplyToResponseSchema>;
export type NewPostToDb = z.infer<typeof NewPostToDbSchema>;
export type NewReplyToDb = z.infer<typeof NewReplyToDbSchema>;
