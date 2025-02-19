import {
  type User,
  type NewUser,
  type EmailOptions,
  type CookieOptions,
  type NewPost,
  type Post,
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
  addPostToDb,
  getPostsFromDb,
} from "./db/query";
import { sendEmail } from "./email/email";
import cloudinaryConfig from "./config/cloudinary.config";
import signUploadForm from "./modules/cloudinary.upload";

export {
  type User,
  type NewUser,
  type EmailOptions,
  type CookieOptions,
  type NewPost,
  type Post,
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
  cloudinaryConfig,
  signUploadForm,
  addPostToDb,
  getPostsFromDb,
};
