import type { User, NewUser } from "../../../src/utils";

export const mockUser: User = {
  userId: "user1",
  createdAt: "2025-04-27T00:00:00Z",
  username: "eabceabceabc",
  email: "test@example.com",
  password: "hashedpassword",
  displayName: "EABCEABC",
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
};

export const mockNewUser: NewUser = {
  username: "eabceabceabc",
  email: "test@example.com",
  password: "hashedpassword",
  displayName: "EABCEABBC",
  dateOfBirth: "1998-01-01",
  verificationToken: "someToken",
  verificationExpire: 999999999,
};
