import { type Request, type Response } from "express";

import { register } from "../../../src/controllers/auth.controller";
import * as userService from "../../../src/services/user.service";
import * as errorUtils from "../../../src/utils/error/errorHandler";
import * as encryptUtils from "../../../src/utils/encryption/encryption";
import { mockUser } from "../../utils/data/data";
import { UserSchema, type User, type NewUserToDb } from "src/utils/zod/User";

describe("register controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 and json {success: true}", async () => {
    const username = "testusername";
    const email = "testuseremail@email.com";
    const password = "testpassword";
    const hashPassword = "hashpasswordsample";
    const dateOfBirth = "2000-12-20";
    const token = "tokensample";
    const hashedToken = "hashsample";
    const expiration = 123;

    const req = {
      body: {
        username,
        email,
        password,
        dateOfBirth,
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

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

    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      1,
      "username",
      username
    );
    expect(userService.checkUserInDb).toHaveBeenNthCalledWith(
      2,
      "email",
      email
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
});
