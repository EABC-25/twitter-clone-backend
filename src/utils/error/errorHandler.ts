import { type Response } from "express";
import { CustomError } from "./CustomError";

const isCustomError = (err: unknown): err is CustomError => {
  return err instanceof CustomError;
};

export const handleError = (err: unknown, res: Response) => {
  const errCode = isCustomError(err) ? err.code : 500;
  const errMessage = isCustomError(err)
    ? err.message
    : "An unknown error occurred";

  // ONLY CUSTOMERROR WILL RETURN A SPECIFIC ERROR CODE, ALL OTHER TYPES WILL PASS AS 500 - "An unknown error occurred"

  // if (process.env.NODE_ENV !== "test") {
  //   console.error("Error: ", err);
  // }

  //test

  console.error("Error: ", err);

  res.status(errCode).json({
    success: false,
    error: errCode,
    message: errMessage,
  });
};
