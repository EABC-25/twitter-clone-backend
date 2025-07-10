import { type Response } from "express";
import { CustomError } from "./CustomError";

const isCustomError = (err: unknown): err is CustomError => {
  return err instanceof CustomError;
};

export const handleError = (err: unknown, res: Response) => {
  const errCode = isCustomError(err) ? err.code : 500;
  const errMessage =
    err instanceof Error ? err.message : "An unknown error occurred";

  // REMINDER: WE NEED TO ALSO ADD CHECKS HERE FOR ZOD OR MYSQL ERRORS, ESPECIALLY SINCE WE USED ONLY 'PARSE' IN OUR SERVICES... 'PARSE' AUTOMATICALLY THROWS ZOD ERROR

  // if (process.env.NODE_ENV !== "test") {
  //   console.error("Error: ", err);
  // }

  console.error("Error: ", err);

  if (errCode === 500) {
    res.status(500).json({
      success: false,
      error: errCode,
      message: "Something went wrong, please try again later.",
    });

    return;
  }

  res.status(errCode).json({
    success: false,
    error: errCode,
    message: errMessage,
  });
};
