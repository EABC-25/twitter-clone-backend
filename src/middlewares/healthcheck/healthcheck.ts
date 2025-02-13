import { type Request, type Response, type NextFunction } from "express";
import { CustomError, handleError } from "../../utils";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // we need to implement health check middle ware that returns 503 if the server or database is down
    next();
  } catch (err) {
    handleError(err, res);
  }
};
