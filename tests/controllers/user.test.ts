import { type Request, type Response } from "express";

import { getUsers } from "../../src/controllers/user.controller";
import * as userService from "../../src/services/user.service";
import * as errorHandler from "../../src/utils/error/errorHandler";
import { type User } from "../../src/utils";

describe("getUsers controller", () => {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return User[] and status 200", async () => {
    const mockUsers: User[] = [
      {
        userId: "u1",
        createdAt: "2025-06-27T00:00:00Z",
        username: "eabc",
        email: "eabc@example.com",
        password: "hashedpassword",
        displayName: "Emmanuel",
        displayNamePermanent: new Uint8Array([1]),
        dateOfBirth: "1998-01-01",
        bioText: "Hello",
        verified: new Uint8Array([0]),
        verificationToken: null,
        verificationExpire: null,
        forgotPasswordFlag: new Uint8Array([0]),
        forgotPasswordToken: null,
        forgotPasswordExpire: null,
        profilePicture: null,
        headerPicture: null,
      },
    ];

    jest.spyOn(userService, "getUsersFromDb").mockResolvedValue(mockUsers);

    await getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockUsers });
  });

  it("should call handleError if getUsersFromDb throws", async () => {
    const error = new Error("DB error");
    jest.spyOn(userService, "getUsersFromDb").mockRejectedValue(error);
    const errorSpy = jest.spyOn(errorHandler, "handleError");

    await getUsers(req, res);

    expect(errorSpy).toHaveBeenCalledWith(error, res);
  });
});
