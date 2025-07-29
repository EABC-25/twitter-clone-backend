import { CookieOptions, type Response } from "express";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
const { createHmac } = crypto;

import { CustomError } from "../error/CustomError";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10); // Create a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at hashPassword fn.");
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword); // Compare plain password with hashed one
    return isMatch;
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at comparePassword fn.");
  }
};

export const generateJWToken = (userId: string): string => {
  try {
    const payload: object = { userId: userId };
    const secret: jsonwebtoken.Secret = process.env.JWT_SECRET as string;
    const expiresIn: number = 86400;
    const jwtOptions: jsonwebtoken.SignOptions = {
      expiresIn: expiresIn,
    };

    const token = jsonwebtoken.sign(payload, secret, jwtOptions);

    return token;
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at generateJWToken fn.");
  }
};

export const generateVerificationToken = (): {
  token: string;
  hashedToken: string;
  expiration: number;
} => {
  try {
    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = generateHashedToken(token);

    const expiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const extended = `${token}.${crypto.randomBytes(100).toString("hex")}`;
    return {
      token: extended,
      hashedToken: hashedToken,
      expiration: expiration,
    };
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at generateVerificationToken fn.");
  }
};

export const generateHashedToken = (token: string): string => {
  try {
    const hashed = createHmac("sha256", process.env.CRYPTO_SECRET as string)
      .update(token)
      .digest("hex");

    return hashed;
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at generateHashedToken fn.");
  }
};

export const returnTokenizedResponse = async (
  userId: string,
  res: Response,
  action?: string
): Promise<Response> => {
  try {
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
      return res;
    } else {
      const jwToken = generateJWToken(userId);

      res.cookie("token", jwToken, options);
      return res;
    }
  } catch (err) {
    console.error("Error log: ", err);
    throw new Error("Error at returnTokenizedResponse fn.");
  }
};
