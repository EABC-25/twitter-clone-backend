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
  checkUserWithEmail,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
  generateJWToken,
} from "../utils";

export const checkToken = async (req: Request, res: Response) => {
  try {
    // testing
    console.log(req.body);
    res.status(200).json({ success: true });
  } catch (err) {
    handleError(err, res);
  }
};

export const checkEmail = async (_, res: Response) => {
  try {
    // testing
    const results = await checkUserWithEmail("test@test.com");

    if (results.length <= 0) throw new CustomError("DB: Email not found!", 404);

    res.status(200).json({ message: "Email found." });
  } catch (err) {
    handleError(err, res);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // we need to create regex here to check email
    if (!validator.isEmail(email)) {
      throw new CustomError("User: Invalid email!", 401);
    }

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
    console.log(req.headers);

    if (!validator.isEmail(email as string)) {
      throw new CustomError("User: email is not a valid email!", 400);
    }

    const results = await getUserFromDb(
      `SELECT userId, email, password, verified FROM users WHERE email = ?`,
      email as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User/Email not found!", 404);
    }

    const processed = results.map(row => ({
      ...row,
      verified: row.verified ? row.verified[0] === 1 : false,
    }));
    if (!processed[0].verified) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    const isMatching = await comparePassword(password, processed[0].password);

    if (!isMatching) {
      throw new CustomError("User: Invalid Password!", 403);
    }

    console.log(processed);

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
    ), // 24 hours / 1 day
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

  const jwToken = generateJWToken(data[0].userId);
  console.log(jwToken);

  res.cookie("token", jwToken, options);
  res.status(statusCode).json({
    success: true,
  });
};
