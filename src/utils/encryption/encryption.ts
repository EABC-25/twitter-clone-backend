import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import crypto from "crypto";
const { createHmac } = crypto;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // Create a salt with 10 rounds
  const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword); // Compare plain password with hashed one
  return isMatch;
};

export const generateJWToken = (userId: string): string => {
  const payload: object = { userId: userId };
  const secret: jsonwebtoken.Secret = process.env.JWT_SECRET as string;
  const expiresIn: string | number = process.env.JWT_EXPIRE ?? "1d";
  const jwtOptions: jsonwebtoken.SignOptions = {
    expiresIn: expiresIn,
  };

  const token = jsonwebtoken.sign(payload, secret, jwtOptions);

  return token;
};

export const generateVerificationToken = (): {
  token: string;
  hashedToken: string;
  expiration: number;
} => {
  const token = crypto.randomBytes(20).toString("hex");
  const hashedToken = generateHashedToken(token);

  const expiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const extended = `${token}.${crypto.randomBytes(100).toString("hex")}`;
  return { token: extended, hashedToken: hashedToken, expiration: expiration };
};

export const generateHashedToken = (token: string): string => {
  return createHmac("sha256", process.env.CRYPTO_SECRET as string)
    .update(token)
    .digest("hex");
};
