import { type Response } from "express";
import { CustomError } from "./CustomError";

const isCustomError = (err: unknown): err is CustomError => {
  return err instanceof CustomError;
};

export const handleError = (err: unknown, res: Response) => {
  const errCode = isCustomError(err) ? err.code : 500;
  const errMessage =
    err instanceof Error ? err.message : "An unknown error occurred";

  console.error("Error: ", err);

  res.status(errCode).json({
    error: errCode,
    message: errMessage,
  });
};
