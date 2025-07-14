import { type Request, type Response } from "express";
import { CookieOptions } from "express";
import validator from "validator";

import {
  NewUserFromRequestSchema,
  NewUserToDbSchema,
  VerifyEmailSchema,
  LoginSchema,
} from "src/utils/zod/User";
import {
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateVerificationToken,
  generateHashedToken,
  generateJWToken,
} from "../utils";
import {
  checkUserInDb,
  getUserFromDb,
  getUserCountInDb,
  addUserToDb,
} from "../services/user.service";
import { verifyUserInDb } from "../services/auth.service";

const frontendRoutes = [
  "landing",
  "home",
  "emailVerification",
  "settings",
  "explore",
  "notifications",
  "messages",
  "bookmarks",
  "communities",
  "games",
  "surprise",
  "media",
];

export const register = async (req: Request, res: Response) => {
  try {
    const { userCount } = await getUserCountInDb();
    const userLimit = parseInt(process.env.USER_COUNT_LIMIT as string) || 50;

    if (userCount >= userLimit) {
      throw new CustomError("User count limit already reached!", 500);
    }

    const { username, email, password, dateOfBirth } =
      NewUserFromRequestSchema.parse({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        dateOfBirth: req.body.dateOfBirth,
      });

    if (!username || !email || !password || !dateOfBirth) {
      throw new CustomError("Invalid request!", 500);
    }

    if (frontendRoutes.includes(username)) {
      throw new CustomError("DB: User already exists!", 403);
    }

    if (!validator.isEmail(email)) {
      throw new CustomError("User: Invalid email!", 406);
    }

    const usernameExists = await checkUserInDb("username", username);

    const emailExists = await checkUserInDb("email", email);

    // TO DO: refactor each error sent to the frontend to include code that signals which error message to display in the frontend. Right now we are using http status codes (400+) in the frontend - since we have lots of edge cases like the below... we are running out of status codes to use.
    if (usernameExists && emailExists) {
      throw new CustomError("DB: User and Email already exists!", 401);
    }

    if (usernameExists) {
      throw new CustomError("DB: User already exists!", 403);
    }

    if (emailExists) {
      throw new CustomError("DB: Email already exists!", 404);
    }

    const hashedPassword = await hashPassword(password);
    const { token, hashedToken, expiration } = generateVerificationToken();
    // since we removed email verification due to financial reasons... we need to mark verified as true in query
    const newUser = NewUserToDbSchema.parse({
      username: username as string,
      email: email as string,
      password: hashedPassword,
      displayName: username as string,
      dateOfBirth: dateOfBirth,
      verificationToken: hashedToken,
      verificationExpire: expiration,
    });

    if (!(await addUserToDb(newUser))) {
      throw new CustomError(
        "DB: Failed to register user!, username or email already taken or something went wrong in the server/db.",
        500
      );
    }

    // if (!(await sendEmail(req, token, email))) {
    //   // FALLBACK: we should either make a function that makes sure email was sent, or else we delete user in db so that user can use the email again to create a new user which will then send the email
    //   // As long as email is sent initially - user can just click the link in the email to either finish the verification or resend email again if it fails
    //   // GOOD SOLUTION: or we can create a route and frontend functionality like a button or link that the user can use to resend the email... YUP THIS IS A MORE PROPER SOLUTION! WE CAN SEND EMAIL ONLY AFTER EVERY 60 SECONDS
    //   throw new CustomError("Email: Email sending failed!", 501);
    // }

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = VerifyEmailSchema.parse({
      token: req.body.token,
      email: req.body.email,
    });

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

    if (results[0].verified) {
      throw new CustomError("User: User is already verified!", 403);
    }

    const userToken = results[0].verificationToken;
    const userTokenExp = results[0].verificationExpire;

    if (
      userToken === hashedToken &&
      userTokenExp &&
      Date.now() < userTokenExp
    ) {
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
    const { email, password } = LoginSchema.parse({
      email: req.body.email,
      password: req.body.password,
    });

    if (!validator.isEmail(email as string)) {
      throw new CustomError("User: Invalid email!", 401);
    }

    const results = await getUserFromDb(
      `SELECT userId, verified, password FROM users WHERE email = ?`,
      email as string
    );

    if (results.length <= 0 || !results[0].password || !results[0].userId) {
      throw new CustomError("DB: User/Email not found!", 404);
    }

    const isMatching = await comparePassword(password, results[0].password);

    if (!isMatching) {
      throw new CustomError("User: Invalid Password!", 404);
    }

    sendTokenizedResponse(results[0].userId, 200, res);
  } catch (err) {
    handleError(err, res);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body.user[0];
    sendTokenizedResponse(userId, 200, res, "logout");
  } catch (err) {
    handleError(err, res);
  }
};

// export const forgotPassword = async (req: Request, res: Response) => {};

// helper functions
const sendTokenizedResponse = async (
  userId: string,
  statusCode: number,
  res: Response,
  action?: string
) => {
  const production: boolean = process.env.NODE_ENV === "production";

  const options: CookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() +
        (parseInt(process.env.JWT_COOKIE_EXPIRE as string) || 1) *
          60 *
          1000 *
          60 *
          24
    ), // 24 hours or 1 day
    sameSite: production ? "none" : "strict",
    secure: production ? true : false,
  };

  if (production) {
    options.domain = process.env.DOMAIN_URL;
  }

  if (action === "logout") {
    options.expires = new Date(Date.now());

    res.cookie("token", "none", options);
    res.status(statusCode).json({ success: true });
  } else {
    const jwToken = generateJWToken(userId);

    res.cookie("token", jwToken, options);
    res.status(statusCode).json({ success: true });
  }
};
