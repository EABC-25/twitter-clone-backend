import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import protect from "../../../../src/middlewares/auth/protect";
import * as userService from "../../../../src/services/user.service";
import * as errorUtils from "../../../../src/utils/error/errorHandler";
import { mockUser } from "../../../utils/data/data";
import { CustomError } from "../../../../src/utils";

jest.mock("jsonwebtoken");
jest.mock("../../../../src/services/user.service");

describe("protect middleware", () => {
  const mockRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response);

  const next = jest.fn() as NextFunction;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 401 if no token is provided", async () => {
    const req = { cookies: {} } as Request;
    const res = mockRes();
    const handleError = jest
      .spyOn(errorUtils, "handleError")
      .mockImplementation(jest.fn());

    await protect(req, res, next);

    expect(handleError).toHaveBeenCalledWith(expect.any(CustomError), res);

    // expect(handleError).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     message: "Not authorized to access this route",
    //     code: 401,
    //   }),
    //   res
    // );

    const errArg = handleError.mock.calls[0][0] as CustomError;

    expect(errArg.message).toBe("Not authorized to access this route");
    expect(errArg.code).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw 401 if token is invalid or missing userId", async () => {
    const req = { cookies: { token: "invalid" } } as unknown as Request;
    const res = mockRes();
    const handleError = jest
      .spyOn(errorUtils, "handleError")
      .mockImplementation(jest.fn());

    (jwt.verify as jest.Mock).mockReturnValue({ iat: 123, exp: 124 });

    await protect(req, res, next);

    expect(handleError).toHaveBeenCalledWith(expect.any(CustomError), res);

    const errArg = handleError.mock.calls[0][0] as CustomError;

    expect(errArg.message).toBe("Not authorized to access this route");
    expect(errArg.code).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw 401 if token is expired", async () => {
    const req = { cookies: { token: "expired" } } as unknown as Request;
    const res = mockRes();
    const handleError = jest
      .spyOn(errorUtils, "handleError")
      .mockImplementation(jest.fn());

    const now = Date.now();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user1",
      iat: Math.floor(now / 1000) - 100,
      exp: Math.floor(now / 1000) - 50,
      // initiated at is 50 seconds bigger than expiration, means it was already expired before creation
    });

    await protect(req, res, next);

    expect(handleError).toHaveBeenCalledWith(expect.any(CustomError), res);

    const errArg = handleError.mock.calls[0][0] as CustomError;

    expect(errArg.message).toBe("Not authorized to access this route");
    expect(errArg.code).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw 404 if user is not found in DB", async () => {
    const req = { cookies: { token: "expired" } } as unknown as Request;
    const res = mockRes();
    const handleError = jest
      .spyOn(errorUtils, "handleError")
      .mockImplementation(jest.fn());

    const now = Date.now();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user1",
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + 100,
    });

    (userService.getUserFromDb as jest.Mock).mockResolvedValue([]);

    await protect(req, res, next);

    expect(handleError).toHaveBeenCalledWith(expect.any(CustomError), res);

    const errArg = handleError.mock.calls[0][0] as CustomError;

    expect(errArg.message).toBe("DB: User not found!");
    expect(errArg.code).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next and attach user to req.body on success", async () => {
    const mockUserArray = [{ ...mockUser }];
    const req = { cookies: { token: "valid" }, body: {} } as unknown as Request;
    const res = mockRes();
    const now = Date.now();

    (jwt.verify as jest.Mock).mockReturnValue({
      userId: "user1",
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + 100,
    });

    (userService.getUserFromDb as jest.Mock).mockResolvedValue(mockUserArray);

    await protect(req, res, next);

    expect(req.body.user).toEqual(mockUserArray);
    expect(next).toHaveBeenCalled();
  });
});
