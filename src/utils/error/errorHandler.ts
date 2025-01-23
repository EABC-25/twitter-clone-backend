import { type Response } from "express";
import { CustomError } from "./CustomError";

const isCustomError = (err: unknown): err is CustomError => {
  return err instanceof CustomError;
};

const isError = (err: unknown): err is Error => {
  return err instanceof Error;
};

export const handleError = (err: unknown, res: Response): void => {
  const errCode = isCustomError(err) ? err.code : 500;
  const errMessage =
    err instanceof Error ? err.message : "An unknown error occurred";

  res.status(errCode).json({
    error: errCode,
    message: errMessage,
  });

  console.error("Error: ", err);
};
