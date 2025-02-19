import { type Request, type Response, type NextFunction } from "express";
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import {
  type User,
  type NewUser,
  type CookieOptions,
  type NewPost,
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

export const getPosts = async (req: Request, res: Response) => {
  try {
    // we query for the posts here
    const results = await getPostsFromDb();

    res.status(200).json(results);
  } catch (err) {
    handleError(err, res);
  }
};

export const addPost = async (req: Request, res: Response) => {
  try {
    const { html, media } = req.body;

    let sanitizedHtml: string | null = null;

    if (html !== null) {
      sanitizedHtml = sanitizeHtml(html, {
        allowedTags: ["div", "span", "br"],
        allowedAttributes: { span: ["style"], div: ["style"] },
      });
    }

    const mediaStr: string | null = media.length !== 0 ? media.join("") : null;

    console.log("74", sanitizedHtml);
    console.log("75", mediaStr);

    if (sanitizedHtml === null && mediaStr === null) {
      throw new CustomError("Empty post data received.", 404);
    }

    const status = await addPostToDb({
      userId: "test",
      postText: sanitizedHtml,
      postMedia: mediaStr,
    });

    console.log(status);

    if (!status) {
      throw new CustomError("DB: Failed to save post!", 500);
    }

    res.status(201).json({ success: true });
  } catch (err) {
    handleError(err, res);
  }
};
