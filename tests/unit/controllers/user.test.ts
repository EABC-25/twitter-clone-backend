import { type Request, type Response } from "express";

import { getUsers } from "../../../src/controllers/user.controller";
import * as userService from "../../../src/services/user.service";
import * as errorUtils from "../../../src/utils/error/errorHandler";
import { mockUser } from "../../../src/utils/mock/data";
import { type User } from "../../../src/utils";

describe("getUsers controller", () => {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return users and status 200", async () => {
    const mockUsers: User[] = [
      {
        ...mockUser,
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
    const handleError = jest.spyOn(errorUtils, "handleError");

    await getUsers(req, res);

    expect(handleError).toHaveBeenCalledWith(error, res);
  });
});

describe("getUserWithToken controller", () => {});
