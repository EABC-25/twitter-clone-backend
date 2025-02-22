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

    console.log("80", html);
    console.log("81", cssUpdated);
    console.log("82", sanitizedHtml);
    console.log("83", mediaStr);
    console.log("84", mediaTypesStr);
    console.log("85", user);

    if (sanitizedHtml === null && mediaStr === null) {
      throw new CustomError("Empty post data received.", 404);
    }

    const status = await addPostToDb({
      username: user[0].username,
      displayName: user[0].displayName,
      postText: sanitizedHtml,
      postMedia: mediaStr,
      mediaTypes: mediaTypesStr,
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
