import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
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
  getUserLikedPostsFromDb,
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
  generateJWToken,
} from "../utils";

export const checkToken = async (req: Request, res: Response) => {
  try {
    // testing
    res.status(200).json({ success: true });
  } catch (err) {
    handleError(err, res);
  }
};

export const checkEmail = async (_, res: Response) => {
  try {
    // testing
    const results = await checkUserWithEmail("admin12345@gmail.com");

    if (results.length <= 0) throw new CustomError("DB: Email not found!", 404);

    res.status(200).json({ message: "Email found." });
  } catch (err) {
    handleError(err, res);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, dateOfBirth } = req.body;

    // we need to create regex here to check email
    if (!validator.isEmail(email)) {
      throw new CustomError("User: Invalid email!", 401);
    }

    // don't we also need to check username authenticity?
    // or username collisions with route namings

    const results = await checkUserWithEmail(email);
    if (results.length > 0) {
      throw new CustomError("DB: User already exists!", 400);
    }

    const hashedPassword = await hashPassword(password);
    const { token, hashedToken, expiration } = generateVerificationToken();
    const newUser: NewUser = {
      username: username as string,
      email: email as string,
      password: hashedPassword,
      displayName: username as string,
      dateOfBirth: dateOfBirth,
      verificationToken: hashedToken,
      verificationExpire: expiration,
    };

    if (!(await addUserToDb(newUser))) {
      throw new CustomError("DB: Failed to register user!", 500);
    }

    if (!(await sendEmail(req, token, email))) {
      // FALLBACK: we should either make a function that makes sure email was sent, or else we delete user in db so that user can use the email again to create a new user which will then send the email
      // As long as email is sent initially - user can just click the link in the email to either finish the verification or resend email again if it fails
      // GOOD SOLUTION: or we can create a route and frontend functionality like a button or link that the user can use to resend the email... YUP THIS IS A MORE PROPER SOLUTION! WE CAN SEND EMAIL ONLY AFTER EVERY 60 SECONDS
      throw new CustomError("Email: Email sending failed!", 500);
    }

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token) {
      throw new CustomError("User: token does not exist!", 400);
    }

    if (!validator.isEmail(email as string)) {
      throw new CustomError("User: Invalid email!", 401);
    }

    const splitToken = String(token).split(".")[0];
    const hashedToken = generateHashedToken(splitToken);

    // what if some bad actor spam sends this request to overload the db? verified check block below will block exec but it does not stop the bad actor from spamming this end point
    const results = await getUserFromDb(
      `SELECT email, verified, verificationToken, verificationExpire FROM users WHERE email = ?`,
      email as string
    );
    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    const processed = results.map(row => ({
      ...row,
      verified: row.verified ? row.verified[0] === 1 : false,
    }));
    if (processed[0].verified) {
      throw new CustomError("User: User is already verified!", 400);
    }

    const userToken = processed[0].verificationToken;
    const userTokenExp = processed[0].verificationExpire;

    if (userToken === hashedToken && Date.now() < userTokenExp) {
      if (!(await verifyUserInDb(email as string))) {
        throw new CustomError("Db: Failed to update user!", 500);
      }

      res.status(200).json({
        success: true,
      });
      return;
    }

    throw new CustomError(
      "Db: Failed to update user, Please check your credentials!",
      401
    );
  } catch (err) {
    handleError(err, res);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email as string)) {
      throw new CustomError("User: email is not a valid email!", 400);
    }

    const results = await getUserFromDb(
      `SELECT userId, username, email, password, verified, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText FROM users WHERE email = ?`,
      email as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User/Email not found!", 404);
    }

    const dnp = results[0].displayNamePermanent
      ? results[0].displayNamePermanent[0] === 1
      : false;

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    const isMatching = await comparePassword(password, results[0].password);

    if (!isMatching) {
      throw new CustomError("User: Invalid Password!", 401);
    }

    const lpRes = await getUserLikedPostsFromDb(results[0].userId);
    const lpResMappedVals: string[] = lpRes.map(obj => obj.postId);

    const processed = {
      userId: results[0].userId,
      username: results[0].username,
      email: results[0].email,
      createdAt: results[0].createdAt,
      displayName: results[0].displayName,
      displayNamePermanent: results[0].displayNamePermanent,
      dateOfBirth: results[0].dateOfBirth,
      bioText: results[0].bioText,
      verified: results[0].verified,
      likedPosts: lpResMappedVals,
    };

    sendTokenizedResponse(processed, 200, res);
  } catch (err) {
    handleError(err, res);
  }
};

export const logout = async (req: Request, res: Response) => {};

export const forgotPassword = async (req: Request, res: Response) => {};

// helper function

const sendTokenizedResponse = async (
  data: any,
  statusCode: number,
  res: Response,
  action?: string
) => {
  const options: CookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 60 * 1000 * 60 * 24
    ), // 24 hours - 1 day
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  if (action === "logout") {
    options.expires = new Date(Date.now());

    res.cookie("token", "none", options);
    res.status(statusCode).json({
      success: true,
    });
  }

  console.log(data);

  const jwToken = generateJWToken(data.userId);

  const user = { ...data, userId: null };

  res.cookie("token", jwToken, options);
  res.status(statusCode).json({
    user: user,
  });
};
