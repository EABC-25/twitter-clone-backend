import { type Request, type Response, type NextFunction } from "express";
import validator from "validator";
import {
  type User,
  type NewUser,
  type CookieOptions,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  signUploadForm,
  cloudinaryConfig,
  getUsersFromDb,
  getUserFromDb,
  getUserLikedPostsFromDb,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
  generateJWToken,
} from "../utils";

export const getUsers = async (_, res: Response) => {
  try {
    const results = await getUsersFromDb();
    // console.log(results[0].createdAt instanceof Date);
    res.status(200).json({ data: results });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserTest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE userId = ?`,
      userId as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    const dnp = results[0].displayNamePermanent
      ? results[0].displayNamePermanent[0] === 1
      : false;

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    const lpRes = await getUserLikedPostsFromDb(results[0].userId);
    const lpResMappedVals: string[] = lpRes.map(obj => obj.postId);

    res.status(200).json({
      user: {
        username: results[0].username,
        email: results[0].email,
        createdAt: results[0].createdAt,
        displayName: results[0].displayName,
        displayNamePermanent: dnp,
        dateOfBirth: results[0].dateOfBirth,
        bioText: results[0].bioText,
        verified: v,
        likedPosts: lpResMappedVals,
        profilePicture: results[0].profilePicture,
        headerPicture: results[0].headerPicture,
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    let {
      userId,
      username,
      email,
      createdAt,
      displayName,
      displayNamePermanent,
      dateOfBirth,
      bioText,
      verified,
      profilePicture,
      headerPicture,
    } = req.body.user[0];

    const dnp = displayNamePermanent ? displayNamePermanent[0] === 1 : false;

    const v = verified ? verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    const lpRes = await getUserLikedPostsFromDb(userId);
    const lpResMappedVals: string[] = lpRes.map(obj => obj.postId);
    const user = {
      username,
      email,
      createdAt,
      displayName,
      displayNamePermanent: dnp,
      dateOfBirth,
      bioText,
      verified: v,
      likedPosts: lpResMappedVals,
      profilePicture,
      headerPicture,
    };
    // console.log("user: ", user);

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserName = async (req: Request, res: Response) => {
  try {
    const { username: un } = req.query;

    console.log(un);

    if (!un) {
      throw new CustomError("DB: User not found!", 404);
    }

    const results = await getUserFromDb(
      `SELECT username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE username = ?`,
      un as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    const dnp = results[0].displayNamePermanent
      ? results[0].displayNamePermanent[0] === 1
      : false;

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    res.status(200).json({
      user: {
        username: results[0].username,
        email: results[0].email,
        createdAt: results[0].createdAt,
        displayName: results[0].displayName,
        displayNamePermanent: dnp,
        dateOfBirth: results[0].dateOfBirth,
        bioText: results[0].bioText,
        verified: v,
        profilePicture: results[0].profilePicture,
        headerPicture: results[0].headerPicture,
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // we need to pass cookie token here, but for this test email will suffice..
    const { email } = req.body;
    if (!(await deleteUserFromDb(email))) {
      throw new CustomError("DB: User not found!", 404);
    }

    res.status(200).json({
      message: "Successfully deleted User!",
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { updates, user } = req.body;

    //  profilePicture: null | File;
    //  headerPicture: null | File;
    //  displayName: null | string;
    //  bioText: null | string;
    //  dateOfBirth: null | string;
    //  email: string;

    if (updates.email !== user[0].email) {
      throw new CustomError("Unauthorized access!", 401);
    }

    //upload media
    // const mediaSign = signUploadForm();

    if (updates.profilePicture) {
    }

    if (updates.headerPicture) {
    }

    //push to db

    let updateKeys: string[] = [];
    let updateValues: string[] = [];
    let updateStr: string = "";

    Object.keys(updates)
      .slice(0, 5)
      .forEach(v => {
        console.log(updates[v]);
        if (updates[v] !== null) {
          updateValues.push(updates[v]);
          updateKeys.push(` ${v} = ?`);
        }
      });

    console.log(updateKeys);

    updateStr = updateKeys.join(",");

    console.log(updateStr);
    console.log(updateValues);
    let query: string = `UPDATE users SET ${""}`;
    let queryParams: string[] = [];

    //revert if unsuccessful

    res.status(200).json({
      user: { ...updates },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const uploadMedia = async (
  mediaSign: { timestamp: number; signature: string },
  file: File,
  fileType: string
): Promise<any> => {
  try {
    const formData = new FormData();

    const urlParts = process.env.CLOUDINARY_API_URL.split("$");

    const url =
      urlParts[0] + cloudinaryConfig.cloudname + "/" + fileType + urlParts[1];

    formData.append("file", file);
    formData.append("api_key", cloudinaryConfig.apiKey);
    formData.append("timestamp", mediaSign.timestamp.toString());
    formData.append("signature", mediaSign.signature);
    formData.append("folder", process.env.CLOUDINARY_FOLDER_NAME);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
};
