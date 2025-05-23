import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

import { CustomError, handleError, getUserFromDb } from "../../utils";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string;

    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new CustomError("Not authorized to access this route", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

    // decoded.iat and decoded.exp is in seconds therefore we need to multiply by 1000
    const jwtExpired = Date.now() > decoded.exp * 1000 ? true : false;

    // console.log("expires in (seconds):", decoded.exp - decoded.iat);

    if (!decoded || !decoded.userId || jwtExpired) {
      throw new CustomError("Not authorized to access this route", 401);
    }
    // console.log(decoded);

    // we need to make sql query to get user via decoded.id === userId in the db

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture, userInfoChangeCount FROM users WHERE userId = ?`,
      decoded.userId as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    // console.log(results);

    req.body.user = results;

    next();
  } catch (err) {
    handleError(err, res);
  }
};
