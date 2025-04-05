import { type Request, type Response, type NextFunction } from "express";
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import {
  type User,
  type NewUser,
  type CookieOptions,
  type NewPost,
  type Post,
  type ResponsePosts,
  type ResponsePost,
  type ResponseReplies,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  getUsersFromDb,
  getUserFromDb,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
  generateJWToken,
  cloudinaryConfig,
  signUploadForm,
  addPostToDb,
  getPostsFromDb,
  getPostFromDb,
  getUserPostsFromDb,
  updatePostLikesInDb,
  addReplyToDb,
  getPostRepliesFromDb,
  getReplyFromDb,
} from "../utils";

export const getMediaUploadSign = async (req: Request, res: Response) => {
  try {
    const sig = signUploadForm();
    console.log(sig);
    res.status(200).json({
      signature: sig.signature,
      timestamp: sig.timestamp,
      cloudname: cloudinaryConfig.cloud_name,
      apiKey: cloudinaryConfig.api_key,
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

    if (response.posts.length > 30) {
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
      "SELECT * FROM posts WHERE postId = ?",
      postId as string
    );

    if (post.length <= 0) {
      throw new CustomError("DB: post not found.", 404);
    }

    const response: ResponsePost = {
      post: post[0],
      reacts: null,
    };

    // console.log("getPost ran: ", post[0]);

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

    const pageNum = Number(page);
    const limit: number = 30;
    const offset = (pageNum - 1) * limit;
    const results = await getUserPostsFromDb(limit, offset, username as string);

    if (results.length <= 0) {
      throw new CustomError("DB: No more posts to return.", 404);
    }

    let response: ResponsePosts = {
      posts: results,
      nextPage: false,
    };

    if (response.posts.length > 30) {
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
    const { html, media, mediaTypes, user } = req.body;

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

    const mediaTypesStr: string | null =
      mediaTypes.length !== 0 ? mediaTypes.join(",") : null;

    if (sanitizedHtml === null && mediaStr === null) {
      throw new CustomError("Empty post data received.", 404);
    }

    const newPost = await addPostToDb({
      username: user[0].username,
      displayName: user[0].displayName,
      postText: sanitizedHtml,
      postMedia: mediaStr,
      mediaTypes: mediaTypesStr,
    });

    if (!newPost || newPost === null) {
      throw new CustomError("DB: Failed to save post!", 500);
    }

    console.log(newPost);

    res.status(201).json(newPost);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateLikes = async (req: Request, res: Response) => {
  try {
    const { type, postId, user } = req.body;
    console.log(type, postId, user[0].userId);

    const result = await updatePostLikesInDb(type, postId, user[0].userId);

    console.log(result);
    if (!result) {
      throw new CustomError("DB: Operation failed!", 404);
    }

    res.status(200).json({
      success: true,
    });
    // throw new CustomError("testError.", 404);
  } catch (err) {
    handleError(err, res);
  }
};

export const addReply = async (req: Request, res: Response) => {
  try {
    const { html, postId, posterName, user } = req.body;

    // we need to check if postId and posterName exists in the database
    const resUser = await getUserFromDb(
      `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`,
      posterName as string
    );

    const resPost = await getPostFromDb(
      "SELECT EXISTS(SELECT 1 FROM posts WHERE postId = ?)",
      postId as string
    );

    console.log("resUser: ", resUser);
    console.log("resPost: ", resPost);

    if (resUser.length <= 0) {
      throw new CustomError("DB: Poster account not found!", 404);
    }

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
      posterName: posterName,
      username: user[0].username,
      displayName: user[0].displayName,
      postText: sanitizedHtml,
    });

    if (!newReply || newReply === null) {
      throw new CustomError("DB: Failed to save reply!", 500);
    }

    console.log("newReply: ", newReply);

    res.status(201).json(newReply);
  } catch (err) {
    handleError(err, res);
  }
};

export const getPostReplies = async (req: Request, res: Response) => {
  try {
    const { postId, page } = req.query;

    if (!page || !postId) {
      throw new CustomError("Insufficient query received.", 404);
    }

    const resPost = await getPostFromDb(
      "SELECT EXISTS(SELECT 1 FROM posts WHERE postId = ?)",
      postId as string
    );

    if (Object.values(resPost[0])[0] !== 1) {
      throw new CustomError("DB: Post not found!", 404);
    }

    const pageNum = Number(page);
    const limit: number = 3;
    const offset = (pageNum - 1) * limit;
    const results = await getPostRepliesFromDb(limit, offset, postId as string);

    console.log(results);

    if (results.length <= 0) {
      throw new CustomError("DB: No more posts to return.", 404);
    }

    let response: ResponseReplies = {
      replies: results,
      nextPage: false,
    };

    if (response.replies.length > 3) {
      response.replies = response.replies.slice(0, 3);
      response.nextPage = true;
    } else {
      response.nextPage = false;
    }

    console.log(response);

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
      "SELECT * FROM replies WHERE replyId = ?",
      replyId as string
    );

    if (reply.length <= 0) {
      throw new CustomError("DB: reply not found.", 404);
    }

    // const response: ResponsePost = {
    //   reply: reply[0],
    //   reacts: null,
    // };

    // console.log("getPost ran: ", post[0]);

    res.status(200).json(reply[0]);
  } catch (err) {
    handleError(err, res);
  }
};
