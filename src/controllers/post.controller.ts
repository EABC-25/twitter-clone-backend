import { type Request, type Response } from "express";
import sanitizeHtml from "sanitize-html";
import {
  type ResponsePosts,
  type ResponseReplies,
  CustomError,
  handleError,
  cloudinaryConfig,
  signUploadForm,
  deleteMedia,
} from "../utils";

import { getUserFromDb } from "../services/user.service";

import {
  addPostToDb,
  deletePostInDb,
  checkPostsInDb,
  getPostsFromDb,
  getPostFromDb,
  getUserPostsFromDb,
  updatePostLikesInDb,
  addReplyToDb,
  getPostRepliesFromDb,
  getReplyFromDb,
  updateReplyLikesInDb,
  deleteReplyInDb,
} from "../services/post.service";

export const getMediaUploadSign = async (req: Request, res: Response) => {
  try {
    const mediaSign = signUploadForm();
    // ISN'T THIS FUNCTION INSECURE?? BRO WE NEED TO CIRCLE BACK SOME POINT IN THE NEAR FUTURE AND FIX THIS FUNCTIONALITY??
    res.status(200).json({
      signature: mediaSign.signature,
      timestamp: mediaSign.timestamp,
      cloudname: cloudinaryConfig.cloud_name,
      apiKey: cloudinaryConfig.api_key,
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getHomePosts = async (req: Request, res: Response) => {
  try {
    const { page } = req.query;

    if (!page) {
      throw new CustomError("No page received.", 404);
    }

    const exists = await checkPostsInDb();
    if (!exists) {
      res.status(200).json({
        posts: [],
        nextPage: false,
      });

      return;
    }

    const pageNum = Number(page);
    const limit: number = 30;
    const offset = (pageNum - 1) * limit;
    const results = await getPostsFromDb(limit, offset);

    if (results.length <= 0) {
      throw new CustomError("DB: No more posts to return.", 404);
    }

    let response: ResponsePosts = {
      posts: results,
      nextPage: false,
    };

    if (response.posts.length > limit) {
      response.posts = response.posts.slice(0, 30);
      response.nextPage = true;
    } else {
      response.nextPage = false;
    }

    res.status(200).json(response);
  } catch (err) {
    handleError(err, res);
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      throw new CustomError("No postId received.", 404);
    }

    const post = await getPostFromDb(
      `SELECT posts.postId, posts.createdAt, posts.postText, posts.postMedia, posts.mediaTypes, posts.likeCount, posts.replyCount, users.username, users.displayName, users.profilePicture FROM posts JOIN users WHERE posts.userId = users.userId AND postId = ?`,
      postId as string
    );

    if (post.length <= 0) {
      throw new CustomError("DB: post not found.", 404);
    }

    res.status(200).json(post[0]);
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const { username, page } = req.query;

    if (!username || !page) {
      throw new CustomError("No username received.", 404);
    }

    const userId = await getUserFromDb(
      `SELECT userId FROM users WHERE username = ?`,
      username as string
    );
    if (!userId.length) {
      throw new CustomError("DB: Resource not found..", 400);
    }

    const exists = await checkPostsInDb(userId[0].userId as string);
    if (!exists) {
      res.status(200).json({
        posts: [],
        nextPage: false,
      });

      return;
    }

    const pageNum = Number(page);
    const limit: number = 30;
    const offset = (pageNum - 1) * limit;
    const results = await getUserPostsFromDb(
      limit,
      offset,
      userId[0].userId as string
    );

    let response: ResponsePosts = {
      posts: results,
      nextPage: false,
    };

    if (response.posts.length > limit) {
      response.posts = response.posts.slice(0, 30);
      response.nextPage = true;
    } else {
      response.nextPage = false;
    }

    res.status(200).json(response);
  } catch (err) {
    handleError(err, res);
  }
};

export const addPost = async (req: Request, res: Response) => {
  try {
    const { html, media, mediaPublicId, mediaTypes, user } = req.body;

    if (
      user[0].postCount >=
      (parseInt(process.env.POST_COUNT_LIMIT as string) || 10)
    ) {
      throw new CustomError("Post limit already reached!", 403);
    }

    let sanitizedHtml: string | null = null;

    const cssUpdated: string =
      html !== null
        ? html
            .replace(/font-size:\s*1\.25rem;?/g, "font-size: 1rem;")
            .replace(/letter-spacing:\s*0\.025em;?/g, "")
            .replace(/font-weight:\s*300;?/g, "")
        : "";

    if (html !== null && cssUpdated !== "") {
      sanitizedHtml = sanitizeHtml(cssUpdated, {
        allowedTags: ["div", "span", "br"],
        allowedAttributes: { span: ["style"], div: ["style"] },
      });
    }

    const mediaStr: string | null = media.length !== 0 ? media.join(",") : null;
    const mediaPublicIdStr: string | null =
      mediaPublicId.length !== 0 ? mediaPublicId.join(",") : null;
    const mediaTypesStr: string | null =
      mediaTypes.length !== 0 ? mediaTypes.join(",") : null;

    if (sanitizedHtml === null && mediaStr === null) {
      throw new CustomError("Empty post data received.", 404);
    }

    const newPost = await addPostToDb({
      userId: user[0].userId,
      postText: sanitizedHtml,
      postMedia: mediaStr,
      mediaTypes: mediaTypesStr,
      mediaPublicId: mediaPublicIdStr,
    });

    if (!newPost || newPost === null) {
      throw new CustomError("DB: Failed to save post!", 500);
    }

    res.status(201).json(newPost);
  } catch (err) {
    handleError(err, res);
  }
};

export const updatePostLikes = async (req: Request, res: Response) => {
  try {
    const { type, id, user } = req.body;

    const result = await updatePostLikesInDb(type, id, user[0].userId);

    if (!result) {
      throw new CustomError("DB: Operation failed!", 404);
    }

    res.status(200).json({
      success: true,
    });
    // throw new CustomError("Error testing...", 404);
  } catch (err) {
    handleError(err, res);
  }
};

export const addReply = async (req: Request, res: Response) => {
  try {
    const { html, postId, user } = req.body;

    if (
      user[0].replyCount >=
      (parseInt(process.env.REPLY_COUNT_LIMIT as string) || 20)
    ) {
      throw new CustomError("Replies limit already reached!", 403);
    }

    const resPost = await getPostFromDb(
      "SELECT userId FROM posts WHERE postId = ?",
      postId as string
    );

    if (resPost.length <= 0) {
      throw new CustomError("DB: Post not found!", 404);
    }

    let sanitizedHtml: string | null = null;

    const cssUpdated: string =
      html !== null
        ? html
            .replace(/font-size:\s*1\.25rem;?/g, "font-size: 1rem;")
            .replace(/letter-spacing:\s*0\.025em;?/g, "")
            .replace(/font-weight:\s*300;?/g, "")
        : "";

    if (html !== null && cssUpdated !== "") {
      sanitizedHtml = sanitizeHtml(cssUpdated, {
        allowedTags: ["div", "span", "br"],
        allowedAttributes: { span: ["style"], div: ["style"] },
      });
    }

    if (sanitizedHtml === null) {
      throw new CustomError("Empty post data received.", 404);
    }

    const newReply = await addReplyToDb({
      postId: postId,
      replierId: user[0].userId,
      posterId: resPost[0].userId as string,
      postText: sanitizedHtml,
    });

    if (!newReply || newReply === null) {
      throw new CustomError("DB: Failed to save reply!", 500);
    }

    res.status(201).json(newReply);
  } catch (err) {
    handleError(err, res);
  }
};

export const getPostReplies = async (req: Request, res: Response) => {
  try {
    const { postId, page } = req.query;

    if (!page || !postId) {
      throw new CustomError("DB: Operation failed!.", 404);
    }

    const resPost = await getPostFromDb(
      "SELECT EXISTS(SELECT 1 FROM posts WHERE postId = ?)",
      postId as string
    );

    if (Object.values(resPost[0])[0] !== 1) {
      throw new CustomError("DB: Post not found!", 404);
    }

    const pageNum = Number(page);
    const limit: number = 5;
    const offset = (pageNum - 1) * limit;
    const results = await getPostRepliesFromDb(limit, offset, postId as string);

    // results.length === 0 will send back empty array

    let response: ResponseReplies = {
      replies: results,
      nextPage: false,
      nextPageCount: 0,
    };

    if (response.replies.length > 5) {
      response.replies = response.replies.slice(0, 5);
      response.nextPage = true;
      response.nextPageCount = Number(page) + 1;
    } else {
      response.nextPage = false;
    }

    res.status(200).json(response);
  } catch (err) {
    handleError(err, res);
  }
};

export const getReply = async (req: Request, res: Response) => {
  try {
    const { replyId } = req.query;

    if (!replyId) {
      throw new CustomError("No postId received.", 404);
    }

    const reply = await getReplyFromDb(
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
      replyId as string
    );

    if (reply.length <= 0) {
      throw new CustomError("DB: reply not found.", 404);
    }

    res.status(200).json(reply[0]);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateReplyLikes = async (req: Request, res: Response) => {
  try {
    const { type, id, user } = req.body;

    const result = await updateReplyLikesInDb(type, id, user[0].userId);

    if (!result) {
      throw new CustomError("DB: Operation failed!", 404);
    }

    res.status(200).json({
      success: true,
    });
    // throw new CustomError("Error testing...", 404);
  } catch (err) {
    handleError(err, res);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.query;
    const { user } = req.body;
    // we checked the user via cookie-jwt in protect but how sure are we that the user deleting is the owner of the post once the request lands here? is it possible to bypass our protected route??? should we perform db check for user here???

    // likes and replies also already handled for deletion inside below function
    const result = await deletePostInDb(postId as string, user[0].userId);

    if (!result || result === null) {
      throw new CustomError("DB: Operation failed!", 403);
    }

    if (result.mediaPublicId !== null && result.mediaTypes !== null) {
      const idParts = result.mediaPublicId.split(",");
      const typeParts = result.mediaTypes.split(",");

      for (let i = 0; i < Math.max(idParts.length, typeParts.length); i++) {
        await deleteMedia(idParts[i], typeParts[i]);
      }
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteReply = async (req: Request, res: Response) => {
  try {
    const { replyId, postId } = req.query;
    const { userId } = req.body.user[0];

    if (!(await deleteReplyInDb(replyId as string, postId as string, userId))) {
      throw new CustomError("DB: Operation failed!", 500);
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};
