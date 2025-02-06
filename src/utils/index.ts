import {
  type User,
  type NewUser,
  type EmailOptions,
  type CookieOptions,
} from "./types/types";
import { CustomError } from "./error/CustomError";
import { handleError } from "./error/errorHandler";
import {
  comparePassword,
  hashPassword,
  verifyJWTToken,
  generateJWToken,
  generateVerificationToken,
  generateHashedToken,
} from "./encryption/encryption";
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
  type CookieOptions,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  verifyJWTToken,
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
