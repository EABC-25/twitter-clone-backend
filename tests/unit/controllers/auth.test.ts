import { type Request, type Response } from "express";

import {
  register,
  verifyEmail,
  login,
  logout,
} from "../../../src/controllers/auth.controller";
import * as userService from "../../../src/services/user.service";
import * as authService from "../../../src/services/auth.service";
import * as errorUtils from "../../../src/utils/error/errorHandler";
import * as encryptUtils from "../../../src/utils/encryption/encryption";
import { CustomError } from "src/utils";
import {
  UserSchema,
  LoginSchema,
  type User,
  type UserPartialNonStrict,
  type NewUserToDb,
} from "src/utils/zod/User";

describe("register controller", () => {
  const req = {} as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const username = "testusername";
  const email = "testuseremail@email.com";
  const password = "testpassword";
  const hashPassword = "hashpasswordsample";
  const dateOfBirth = "2000-12-20";
  const token = "tokensample";
  const hashedToken = "hashsample";
  const expiration = 123;

  it("should return 201 and json {success: true} on successful operation", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const newUserMock: NewUserToDb = {
      username,
      email,
      password: hashPassword,
      displayName: username,
      dateOfBirth,
      verificationToken: hashedToken,
      verificationExpire: expiration,
    };

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockResolvedValueOnce(false) // for username
      .mockResolvedValueOnce(false); // for email

    jest.spyOn(encryptUtils, "hashPassword").mockResolvedValue(hashPassword);
    jest
      .spyOn(encryptUtils, "generateVerificationToken")
      .mockReturnValue({ token, hashedToken, expiration });

    jest.spyOn(userService, "addUserToDb").mockResolvedValue(true);

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).toHaveBeenCalledWith(password);
    expect(userService.addUserToDb).toHaveBeenCalledWith(
      expect.objectContaining(newUserMock)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should throw customError to handleError if user count limit (50) is reached", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const userCountMax = parseInt(process.env.USER_COUNT_LIMIT ?? "") || 50;
    const customError = new CustomError(
      "User count limit already reached!",
      500
    );

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: userCountMax });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username is less than 8 characters", async () => {
    req.body = {
      username: "testuse",
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username is more than 50 characters", async () => {
    req.body = {
      username: "tencharacstencharacstencharacstencharacstencharacst",
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username does not pass zod refine validation helper functions", async () => {
    req.body = {
      username: "tencharacters123-/.()}=&",
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.email is not a valid email", async () => {
    req.body = {
      username,
      email: "testemail",
      password,
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.password is less than 8 characters", async () => {
    req.body = {
      username,
      email,
      password: "testpas",
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.password is more than 100 characters", async () => {
    req.body = {
      username,
      email,
      password:
        "tencharacstencharacstencharacstencharacstencharacsttencharacstencharacstencharacstencharacstencharacst",
      dateOfBirth,
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.dateOfBirth does not pass zod refine validation helper functions", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth: "January 1, 2020",
    };

    const customError = new CustomError("Invalid request!", 500);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username is a known frontend route", async () => {
    req.body = {
      username: "emailVerification",
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("User already exists!", 403);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).not.toHaveBeenCalled();
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username and req.body.email already exists in the db", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("User and Email already exists!", 401);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockImplementationOnce(async (key, val) => {
        if (key === "username") return true;
        throw new Error("Unexpected key in first call");
      })
      .mockImplementationOnce(async (key, val) => {
        if (key === "email") return true;
        throw new Error("Unexpected key in second call");
      });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.username already exists in the db", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("User already exists!", 403);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockImplementationOnce(async (key, val) => {
        if (key === "username") return true;
        throw new Error("Unexpected key in first call");
      })
      .mockImplementationOnce(async (key, val) => {
        if (key === "email") return false;
        throw new Error("Unexpected key in second call");
      });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if req.body.email already exists in the db", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const customError = new CustomError("Email already exists!", 404);

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockImplementationOnce(async (key, val) => {
        if (key === "username") return false;
        throw new Error("Unexpected key in first call");
      })
      .mockImplementationOnce(async (key, val) => {
        if (key === "email") return true;
        throw new Error("Unexpected key in second call");
      });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenCalledWith(
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).not.toHaveBeenCalled();
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw Error to handleError from hashPassword fn if it fails", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const error = new Error("Error at hashPassword fn.");

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    jest.spyOn(encryptUtils, "hashPassword").mockRejectedValue(error);
    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(encryptUtils.generateVerificationToken).not.toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw Error to handleError from generateVerificationToken fn if it fails", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const error = new Error("Error at generateVerificationToken fn.");

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    jest.spyOn(encryptUtils, "hashPassword").mockResolvedValue(hashPassword);
    jest
      .spyOn(encryptUtils, "generateVerificationToken")
      .mockImplementation(() => {
        throw error;
      });
    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(encryptUtils.generateVerificationToken).toHaveBeenCalled();
    expect(userService.addUserToDb).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw customError to handleError if addUserToDb fails and returns false result", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const newUserMock: NewUserToDb = {
      username,
      email,
      password: hashPassword,
      displayName: username,
      dateOfBirth,
      verificationToken: hashedToken,
      verificationExpire: expiration,
    };

    const customError = new CustomError(
      "Failed to register user!, username or email already taken or something went wrong in the server/db.",
      500
    );

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    jest.spyOn(encryptUtils, "hashPassword").mockResolvedValue(hashPassword);
    jest
      .spyOn(encryptUtils, "generateVerificationToken")
      .mockReturnValue({ token, hashedToken, expiration });
    jest.spyOn(userService, "addUserToDb").mockResolvedValue(false);
    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(encryptUtils.generateVerificationToken).toHaveBeenCalled();
    expect(userService.addUserToDb).toHaveBeenCalledWith(newUserMock);
    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });

  it("should throw Error to handleError from addUserToDb service if it fails", async () => {
    req.body = {
      username,
      email,
      password,
      dateOfBirth,
    };

    const newUserMock: NewUserToDb = {
      username,
      email,
      password: hashPassword,
      displayName: username,
      dateOfBirth,
      verificationToken: hashedToken,
      verificationExpire: expiration,
    };

    const error = new Error("Error at addUserToDb service.");

    jest
      .spyOn(userService, "getUserCountInDb")
      .mockResolvedValue({ userCount: 5 });

    jest
      .spyOn(userService, "checkUserInDb")
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    jest.spyOn(encryptUtils, "hashPassword").mockResolvedValue(hashPassword);
    jest
      .spyOn(encryptUtils, "generateVerificationToken")
      .mockReturnValue({ token, hashedToken, expiration });
    jest.spyOn(userService, "addUserToDb").mockRejectedValue(error);
    const handleError = jest.spyOn(errorUtils, "handleError");

    await register(req, res);

    expect(userService.getUserCountInDb).toHaveBeenCalled();
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      req.body.username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      req.body.email
    );
    expect(encryptUtils.hashPassword).toHaveBeenCalledWith(req.body.password);
    expect(encryptUtils.generateVerificationToken).toHaveBeenCalled();
    expect(userService.addUserToDb).toHaveBeenCalledWith(newUserMock);
    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(201);
  });
});

describe("verifyEmail controller", () => {
  const req = {} as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const token = "testToken.tokenTest";
  const email = "testemail@email.com";

  const getUserFromDbArgs = {
    query: `SELECT email, verified, verificationToken, verificationExpire FROM users WHERE email = ?`,
    index: email,
  };

  const verified = false;
  const hashedVerificationToken = "testHashedToken";
  const verificationExpired = Date.now() - 3600000 * 24; // minus 24 hours
  const verificationNotExpired = Date.now() + 3600000 * 24; // plus 24 hours

  it("should return 200 and json {success: true} on successful operation", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationNotExpired,
    };

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(authService, "verifyUserInDb").mockResolvedValue(true);

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).toHaveBeenCalledWith(req.body.email);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
    });
  });

  it("should throw customError to handleError if req.body.token is less than 5 characters", async () => {
    req.body = {
      token: "toke",
      email,
    };

    const customError = new CustomError("Invalid request!", 500);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).not.toHaveBeenCalled();
    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if req.body.email is is not a valid email", async () => {
    req.body = {
      token,
      email: "testemail@",
    };

    const customError = new CustomError("Invalid request!", 500);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).not.toHaveBeenCalled();
    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw Error to handleError from generateHashedToken fn if it fails", async () => {
    req.body = {
      token,
      email,
    };

    const error = new Error("Error at generateHashedToken fn.");

    jest.spyOn(encryptUtils, "generateHashedToken").mockImplementation(() => {
      throw error;
    });

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw Error to handleError from getUserFromDb service if it fails", async () => {
    req.body = {
      token,
      email,
    };

    const error = new Error("Error at getUserFromDb service.");

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest.spyOn(userService, "getUserFromDb").mockRejectedValue(error);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb returns empty array", async () => {
    req.body = {
      token,
      email,
    };

    const customError = new CustomError("User not found!", 404);

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest.spyOn(userService, "getUserFromDb").mockResolvedValue([]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb returns user verified === true", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified: true,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationNotExpired,
    };

    const customError = new CustomError("User is already verified!", 403);

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb returns user.verificationToken !== encryptUtils.generateHashedToken's returned value ", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationNotExpired,
    };

    const customError = new CustomError(
      "Failed to update user, Please check your credentials!",
      401
    );

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue("hashedTokenNotEqualsToVerificationToken");

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb returns user.verificationExpire === null", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: null,
    };

    const customError = new CustomError(
      "Failed to update user, Please check your credentials!",
      401
    );

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb returns user.verificationExpire > Date.now()", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationExpired,
    };

    const customError = new CustomError(
      "Failed to update user, Please check your credentials!",
      401
    );

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if verifyUserInDb returns false", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationNotExpired,
    };

    const customError = new CustomError("Failed to update user!", 500);

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(authService, "verifyUserInDb").mockResolvedValue(false);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).toHaveBeenCalledWith(req.body.email);

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw Error to handleError from verifyUserInDb if it fails", async () => {
    req.body = {
      token,
      email,
    };

    const mockPartialUser: UserPartialNonStrict = {
      email,
      verified,
      verificationToken: hashedVerificationToken,
      verificationExpire: verificationNotExpired,
    };

    const error = new Error("Error at verifyUserInDb service.");

    jest
      .spyOn(encryptUtils, "generateHashedToken")
      .mockReturnValue(hashedVerificationToken);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(authService, "verifyUserInDb").mockRejectedValue(error);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await verifyEmail(req, res);

    expect(encryptUtils.generateHashedToken).toHaveBeenCalledWith(
      req.body.token.split(".")[0]
    );
    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(authService.verifyUserInDb).toHaveBeenCalledWith(req.body.email);

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });
});

describe("login controller", () => {
  const req = {} as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const email = "testemail@email.com";
  const userId = "testuserid";
  const verified = true;
  const passwordFromFrontend = "testpasswordfromfe";
  const passwordFromDB = "testpasswordfromdb";

  const getUserFromDbArgs = {
    query: `SELECT userId, verified, password FROM users WHERE email = ?`,
    index: email,
  };

  it("should return 200 and json {success: true} on successful operation", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId,
      verified,
      password: passwordFromDB,
    };

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(encryptUtils, "comparePassword").mockResolvedValue(true);

    jest.spyOn(encryptUtils, "returnTokenizedResponse").mockResolvedValue(res);

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockPartialUser.password
    );
    expect(encryptUtils.returnTokenizedResponse).toHaveBeenCalledWith(
      mockPartialUser.userId,
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should throw customError to handleError if req.body.email is not a valid email", async () => {
    req.body = {
      email: "testemail@email",
      password: passwordFromFrontend,
    };

    const customError = new CustomError("Invalid request!", 500);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if req.body.password is less than 8 characters", async () => {
    req.body = {
      email,
      password: "testpas",
    };

    const customError = new CustomError("Invalid request!", 500);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if req.body.password is more than 100 characters", async () => {
    req.body = {
      email,
      password:
        "tencharstrtencharstrtencharstrtencharstrtencharstrtencharstrtencharstrtencharstrtencharstrtencharstra",
    };

    const customError = new CustomError("Invalid request!", 500);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).not.toHaveBeenCalled();
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw Error to handleError from getUserFromDb service fn if it fails", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const error = new Error("Error at getUserFromDb service.");

    jest.spyOn(userService, "getUserFromDb").mockRejectedValue(error);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns empty array ", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const customError = new CustomError("User/Email not found!", 404);

    jest.spyOn(userService, "getUserFromDb").mockResolvedValue([]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns empty string as user.password", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId,
      verified,
      password: "",
    };

    const customError = new CustomError("User/Email not found!", 404);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns undefined as user.password", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId,
      verified,
      password: undefined,
    };

    const customError = new CustomError("User/Email not found!", 404);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns empty string as user.userId", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId: "",
      verified,
      password: passwordFromFrontend,
    };

    const customError = new CustomError("User/Email not found!", 404);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns undefined as user.userId", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId: undefined,
      verified,
      password: passwordFromFrontend,
    };

    const customError = new CustomError("User/Email not found!", 404);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).not.toHaveBeenCalled();
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw customError to handleError if getUserFromDb service returns undefined as user.userId", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId,
      verified,
      password: passwordFromFrontend,
    };

    const customError = new CustomError("User: Invalid Password!", 404);

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(encryptUtils, "comparePassword").mockResolvedValue(false);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockPartialUser.password
    );
    expect(encryptUtils.returnTokenizedResponse).not.toHaveBeenCalled();

    expect(handleError).toHaveBeenCalledWith(customError, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });

  it("should throw Error to handleError from returnTokenizedResponse fn if it fails", async () => {
    req.body = {
      email,
      password: passwordFromFrontend,
    };

    const mockPartialUser: UserPartialNonStrict = {
      userId,
      verified,
      password: passwordFromFrontend,
    };

    const error = new Error("Error at returnTokenizedResponse fn.");

    jest
      .spyOn(userService, "getUserFromDb")
      .mockResolvedValue([mockPartialUser]);

    jest.spyOn(encryptUtils, "comparePassword").mockResolvedValue(true);

    jest
      .spyOn(encryptUtils, "returnTokenizedResponse")
      .mockRejectedValue(error);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await login(req, res);

    expect(userService.getUserFromDb).toHaveBeenCalledWith(
      getUserFromDbArgs.query,
      getUserFromDbArgs.index
    );
    expect(encryptUtils.comparePassword).toHaveBeenCalledWith(
      req.body.password,
      mockPartialUser.password
    );
    expect(encryptUtils.returnTokenizedResponse).toHaveBeenCalledWith(
      mockPartialUser.userId,
      res
    );

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });
});

describe("logout controller", () => {
  const req = {} as Request;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = "testuserid";

  it("should return 200 and json {success: true} on successful operation", async () => {
    req.body = {
      user: [
        {
          userId,
        },
      ],
    };

    jest.spyOn(encryptUtils, "returnTokenizedResponse").mockResolvedValue(res);

    await logout(req, res);
    expect(encryptUtils.returnTokenizedResponse).toHaveBeenCalledWith(
      req.body.user[0].userId,
      res,
      "logout"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should throw Error to handleError from returnTokenizedResponse fn if it fails", async () => {
    req.body = {
      user: [
        {
          userId,
        },
      ],
    };

    const error = new Error("Error at returnTokenizedResponse fn.");

    jest
      .spyOn(encryptUtils, "returnTokenizedResponse")
      .mockRejectedValue(error);

    const handleError = jest.spyOn(errorUtils, "handleError");

    await logout(req, res);

    expect(encryptUtils.returnTokenizedResponse).toHaveBeenCalledWith(
      req.body.user[0].userId,
      res,
      "logout"
    );

    expect(handleError).toHaveBeenCalledWith(error, res);
    expect(res.status).not.toHaveBeenCalledWith(200);
  });
});
