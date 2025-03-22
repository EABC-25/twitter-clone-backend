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
  getUsersFromDb,
  getUserFromDb,
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

export const getUser = async (req: Request, res: Response) => {
  try {
    let {
      username,
      email,
      createdAt,
      displayName,
      displayNamePermanent,
      dateOfBirth,
      bioText,
      verified,
      likedPosts,
    } = req.body.user[0];

    const dnp = displayNamePermanent ? displayNamePermanent[0] === 1 : false;

    const v = verified ? verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    res.status(200).json({
      user: {
        username,
        email,
        createdAt,
        displayName,
        displayNamePermanent: dnp,
        dateOfBirth,
        bioText,
        verified: v,
        likedPosts,
      },
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
      `SELECT username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified FROM users WHERE username = ?`,
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
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // we need to pass cookie token here, but for now email will suffice..
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
