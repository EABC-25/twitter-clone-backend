import {
  addUserToDb,
  verifyUserInDb,
  checkUserWithEmail,
} from "../../../src/services/auth.service";
import db from "../../../src/db";
import { mockNewUser } from "../../utils/data/data";

jest.mock("../../../src/db");

describe("addUserToDb service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if affectedRows > 0", async () => {
    (db.executeResult as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

    const result = await addUserToDb(mockNewUser);

    expect(db.executeResult).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return false if affectedRows === 0", async () => {
    (db.executeResult as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

    const result = await addUserToDb(mockNewUser);

    expect(result).toBe(false);
  });

  it("should throw if db.executeResult throws", async () => {
    (db.executeResult as jest.Mock).mockRejectedValue(new Error("DB failed"));

    await expect(addUserToDb(mockNewUser)).rejects.toThrow("DB failed");
  });
});

describe("verifyUserInDb service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if affectedRows > 0", async () => {
    (db.executeResult as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

    const result = await verifyUserInDb("testemail@email.com");

    expect(db.executeResult).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("should return false if affectedRows === 0", async () => {
    (db.executeResult as jest.Mock).mockResolvedValue([{ affectedRows: 0 }]);

    const result = await verifyUserInDb("testemail@email.com");

    expect(result).toBe(false);
  });

  it("should throw if db.executeResult throws", async () => {
    (db.executeResult as jest.Mock).mockRejectedValue(new Error("DB failed"));

    await expect(verifyUserInDb("testemail@email.com")).rejects.toThrow(
      "DB failed"
    );
  });
});

describe("checkUserWithEmail service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // we do not need to test if executeRows will return multiple because email is a UNIQUE value...
  it("should be able to return {email: string}", async () => {
    const mockValue = [[{ email: "testemail@gmail.com" }]];
    (db.executeRows as jest.Mock).mockReturnValue(mockValue);

    const result = await checkUserWithEmail("testemail@email.com");

    expect(db.executeRows).toHaveBeenCalled();
    expect(result).toEqual(mockValue[0][0]);
  });

  it("should be able to return null on !rows[0]", async () => {
    const mockValue = [undefined];
    (db.executeRows as jest.Mock).mockReturnValue(mockValue);

    const result = await checkUserWithEmail("testemail@gmail.com");

    expect(db.executeRows).toHaveBeenCalled();
    expect(result).toEqual(null);
  });

  it("should be able to return null on rows[0].length === 0", async () => {
    const mockValue = [[]];
    (db.executeRows as jest.Mock).mockReturnValue(mockValue);

    const result = await checkUserWithEmail("testemail@email.com");

    expect(db.executeRows).toHaveBeenCalled();
    expect(result).toEqual(null);
  });
});
