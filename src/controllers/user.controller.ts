import { type Request, type Response, type NextFunction } from "express";
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
  checkEmailFromDb,
  addUserToDb,
  deleteUserFromDb,
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
    // console.log(results[0].createdAt instanceof Date);
    res.status(200).json(results);
  } catch (err) {
    handleError(err, res);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // we need to create regex here to check email

    const searchResult = await checkEmailFromDb(email);
    if (searchResult) {
      throw new CustomError("DB: User already exists!", 400);
    }

    const hashedPassword = await hashPassword(password);
    const { token, hashedToken, expiration } = generateVerificationToken();
    const newUser: NewUser = {
      username: username as string,
      email: email as string,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationExpire: expiration.toString(),
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
    const results = await deleteUserFromDb(email);
    if (results.affectedRows > 0) {
      res.status(200).json({
        message: "Successfully deleted User!",
      });
    } else {
      throw new CustomError("DB: User not found!", 404);
    }
  } catch (err) {
    handleError(err, res);
  }
};

// export const verifyEmail = async (req: Request, res: Response) => {
//   try {
//     const { token } = req.query;

//     if (!token) {
//       throw new CustomError("User: token does not exist!", 400);
//     }

//     const splitToken = String(token).split(".")[0];
//     const hashedToken = generateHashedToken(splitToken);
//     console.log(hashedToken);
//     const user = await emailVerification(hashedToken);

//     if (verified.result) {
//       const newUser = {
//         ...verified.user,
//         verified: true,
//         verificationToken: "",
//         verificationExpire: null,
//       };

//       if (
//         !(await writeJsonFileAsync(
//           mockDbPath,
//           newUser.userId.toString(),
//           newUser
//         ))
//       ) {
//         throw new CustomError("DB: User update failed!", 500);
//       }

//       res.status(200).json({
//         message: "Account verification success!",
//       });
//     } else if (!verified.result) {
//       const { token, hashedToken, expiration } = generateVerificationToken();
//       const newUser = {
//         ...verified.user,
//         verificationToken: hashedToken,
//         verificationExpire: expiration,
//       };

//       if (
//         !(await writeJsonFileAsync(
//           mockDbPath,
//           newUser.userId.toString(),
//           newUser
//         ))
//       ) {
//         throw new CustomError("DB: User update failed!", 500);
//       }

//       if (!(await sendEmail(req, token, newUser.email))) {
//         throw new CustomError("Email: Email sending failed!", 500);
//       }

//       res.status(200).json({
//         message:
//           "Account verification failed, but we sent you another email for verification.",
//       });
//     }
//   } catch (err) {
//     handleError(err, res);
//   }
// };

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

// HELPER FUNCTIONS

// const emailVerification = async (
//   token: string
// ): Promise<{ result: boolean; user: User }> => {
//   const data = await readJsonFileAsync(mockDbPath);
//   if (!data) {
//     throw new CustomError("Fetch data failed!", 500);
//   }

//   const user = Object.values(data).find(
//     user => user.verificationToken === token
//   );
//   const dateNow = Date.now();
//   if (!user) {
//     throw new CustomError("User does not exist!", 404);
//   }

//   if (
//     !user.verified &&
//     user.verificationExpire &&
//     user.verificationExpire > dateNow
//   ) {
//     return { result: true, user: user };
//   } else if (
//     !user.verified &&
//     user.verificationExpire &&
//     user.verificationExpire <= dateNow
//   ) {
//     return { result: false, user: user };
//   }

//   throw new CustomError("User is already verified!", 400);
// };
