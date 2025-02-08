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
  generateJWToken,
  generateVerificationToken,
  generateHashedToken,
} from "./encryption/encryption";
import {
  getUsersFromDb,
  getUserFromDb,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
} from "./db/query";
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
  generateJWToken,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  getUsersFromDb,
  getUserFromDb,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
};
