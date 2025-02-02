import {
  type User,
  type NewUser,
  type EmailOptions,
  type JWTOptions,
} from "./types/types";
import { CustomError } from "./error/CustomError";
import { handleError } from "./error/errorHandler";
import { comparePassword, hashPassword, generateJWToken } from "./encryption";
import { generateVerificationToken, generateHashedToken } from "./encryption";
import {
  getUsersFromDb,
  getUserWithEmailAndQuery,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
} from "./db/user.db";
import { sendEmail } from "./email/email";

export {
  type User,
  type NewUser,
  type EmailOptions,
  type JWTOptions,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateJWToken,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  getUsersFromDb,
  getUserWithEmailAndQuery,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
};
