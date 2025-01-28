import { type Request, type Response, type NextFunction } from "express";
import validator from "validator";
import {
  type User,
  type NewUser,
  CustomError,
  handleError,
  comparePassword,
  hashPassword,
  generateVerificationToken,
  generateHashedToken,
  sendEmail,
  getUsersFromDb,
  getUserFromDbUsingEmail,
  checkEmailFromDb,
  addUserToDb,
  deleteUserFromDb,
  verifyUserInDb,
} from "../utils";

export const getUsers = async (_, res: Response) => {
  try {
    const results = await getUsersFromDb();
    // console.log(results[0].createdAt instanceof Date);
    res.status(200).json(results);
  } catch (err) {
    handleError(err, res);
  }
};

export const checkEmail = async (_, res: Response) => {
  try {
    // testing
    const results = await checkEmailFromDb("test@test.com");

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

    const results = await checkEmailFromDb(email);
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
      message:
        "Account registration success, please check your email for the verification code.",
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // we need to pass cookie token here, but for now email will suffice..
    const { email } = req.body;
    if (!(await deleteUserFromDb(email))) {
      throw new CustomError("DB: User not found!", 404);
    }

    res.status(200).json({
      message: "Successfully deleted User!",
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
    const results = await getUserFromDbUsingEmail(
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
        message: "Successfully verified user!",
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

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password } = req.body;

//     const searchResult = await checkMockDbForUser("email", email);
//     if (searchResult === false) {
//       throw new CustomError("DB: User doesn't exist!", 404);
//     }

//     const user = await getUserFromMockDb(email);

//     if (user && !user.verified) {
//       throw new CustomError("User: user email verification pending!", 403);
//     }

//     if (user && (await comparePassword(password, user.password))) {
//       res.status(200).json({
//         message: `Welcome, ${username}!`,
//       });
//       // redirect to main page
//     } else {
//       throw new CustomError(
//         "User: Unable to login, please check credentials.",
//         401
//       );
//     }
//   } catch (err) {
//     handleError(err, res);
//   }
// };

export const logout = async (req: Request, res: Response) => {};

export const forgotPassword = async (req: Request, res: Response) => {};
