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

export const getPosts = async (req: Request, res: Response) => {
  try {
    // we query for the posts here

    res.status(200).json({
      posts: [
        { id: 1, data: "post one" },
        { id: 2, data: "post two" },
        { id: 3, data: "post three" },
      ],
    });
  } catch (err) {
    handleError(err, res);
  }
};
