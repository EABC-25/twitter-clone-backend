import {
  type User,
  type NewUser,
  type EmailOptions,
} from "./types/interfaceTypes";
import { CustomError } from "./error/CustomError";
import { handleError } from "./error/errorHandler";
import { comparePassword, hashPassword, generateJWToken } from "./encryption";
import { generateVerificationToken, generateHashedToken } from "./encryption";
import {
  getUsersFromDb,
  checkEmailFromDb,
  addUserToDb,
  deleteUserFromDb,
} from "./db/users";
import { sendEmail } from "./email/email";

export {
  type User,
  type NewUser,
  type EmailOptions,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateJWToken,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  getUsersFromDb,
  checkEmailFromDb,
  addUserToDb,
  deleteUserFromDb,
};
