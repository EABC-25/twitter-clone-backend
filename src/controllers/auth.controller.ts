import { type Request, type Response } from "express";
import { CookieOptions } from "express";
import validator from "validator";
import {
  type NewUser,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateVerificationToken,
  generateHashedToken,
  getUserFromDb,
  checkUserWithEmail,
  addUserToDb,
  verifyUserInDb,
  generateJWToken,
  getUserCountInDb,
} from "../utils";

// we need to add all possible routes here like "settings/account" or just block usage of \ or any special character as username
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

// export const checkToken = async (req: Request, res: Response) => {
//   try {
//     // testing
//     res.status(200).json({ success: true });
//   } catch (err) {
//     handleError(err, res);
//   }
// };

// export const checkEmail = async (req: Request, res: Response) => {
//   try {
//     // testing
//     const results = await checkUserWithEmail("admin12345@gmail.com");

//     if (results.length <= 0) throw new CustomError("DB: Email not found!", 404);

//     res.status(200).json({ message: "Email found." });
//   } catch (err) {
//     handleError(err, res);
//   }
// };

export const register = async (req: Request, res: Response) => {
  try {
    const { userCount } = await getUserCountInDb();
    const userLimit = parseInt(process.env.USER_COUNT_LIMIT as string) || 50;

    if (userCount >= userLimit) {
      throw new CustomError("User count limit already reached!", 500);
    }

    const { username, email, password, dateOfBirth } = req.body;

    if (frontendRoutes.includes(username)) {
      throw new CustomError("DB: User already exists!", 403);
    }

    if (!validator.isEmail(email)) {
      throw new CustomError("User: Invalid email!", 406);
    }

    const existingUsername = await getUserFromDb(
      `SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`,
      username as string
    );

    const existingEmail = await getUserFromDb(
      `SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)`,
      email as string
    );

    // in the future, we need to configure the response to also include specific codes that differentiate the existence of username or email instead of using 401, 403 or 404
    if (
      Object.values(existingUsername[0])[0] === 1 &&
      Object.values(existingEmail[0])[0] === 1
    ) {
      throw new CustomError("DB: User and Email already exists!", 401);
    }

    if (Object.values(existingUsername[0])[0] === 1) {
      throw new CustomError("DB: User already exists!", 403);
    }

    if (Object.values(existingEmail[0])[0] === 1) {
      throw new CustomError("DB: Email already exists!", 404);
    }

    // throw new CustomError("test", 501);

    const hashedPassword = await hashPassword(password);
    const { token, hashedToken, expiration } = generateVerificationToken();
    // since we removed email verification due to financial reasons... we need to mark verified as true in query
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
    const { token, email } = req.body;

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
      throw new CustomError("User: User is already verified!", 403);
    }

    const userToken = processed[0].verificationToken;
    const userTokenExp = processed[0].verificationExpire;

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
    const { email, password } = req.body;

    if (!validator.isEmail(email as string)) {
      throw new CustomError("User: Invalid email!", 401);
    }

    const results = await getUserFromDb(
      `SELECT userId, verified, password FROM users WHERE email = ?`,
      email as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User/Email not found!", 404);
    }

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
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

export const forgotPassword = async (req: Request, res: Response) => {};

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
