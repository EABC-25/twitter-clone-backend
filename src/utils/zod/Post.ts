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

export type PostId = z.infer<typeof PostIdSchema>;
