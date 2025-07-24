import { type Request, type Response } from "express";

import { register } from "../../../src/controllers/auth.controller";
import * as userService from "../../../src/services/user.service";
import * as errorUtils from "../../../src/utils/error/errorHandler";
import * as encryptUtils from "../../../src/utils/encryption/encryption";
import { CustomError } from "src/utils";
import { UserSchema, type User, type NewUserToDb } from "src/utils/zod/User";

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
  });
});

// describe("verifyEmail controller", () => {
//   const req = {} as Request;

//   const res = {
//     status: jest.fn().mockReturnThis(),
//     json: jest.fn(),
//   } as unknown as Response;

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 200 and json {success: true} on successful operation", async () => {});
// });
