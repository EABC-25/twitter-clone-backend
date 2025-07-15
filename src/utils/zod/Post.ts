import { z } from "zod";

export const PostSchema = z.object({
  postId: z.string(),
  createdAt: z.date(),
  postText: z.string().nullable(),
  postMedia: z.string().nullable(),
  mediaTypes: z.string().nullable(),
  likeCount: z.number(),
  replyCount: z.number(),
  mediaPublicId: z.string().nullable(),
  userId: z.string(),
});

export const PostIdSchema = PostSchema.pick({
  postId: true,
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

export const PostToResponseSchema = z.object({
  posts: z.array(PostPartialStrictSchema),
  nextPage: z.boolean(),
});

export type Post = z.infer<typeof PostSchema>;
export type PostId = z.infer<typeof PostIdSchema>;
export type PostPartialStrict = z.infer<typeof PostPartialStrictSchema>;
export type PostToResponse = z.infer<typeof PostToResponseSchema>;
