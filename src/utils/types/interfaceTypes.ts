interface User {
  userId: string;
  createdAt: Date;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | null;
  verificationExpire: string | null;
  forgotPasswordFlag: boolean;
  forgotPasswordToken: string | null;
  forgotPasswordExpire: string | null;
}

interface NewUser {
  username: string;
  email: string;
  password: string;
  verificationToken: string | null;
  verificationExpire: string | null;
}

interface EmailOptions {
  subject: string;
  email: string;
  message: string;
}

const MESSAGE = {
  SUCCESS: "SUCCESS",
  DB_ERROR: "FAILED_DB",

  // TO BE CONTINUED
};

export { type User, type NewUser, type EmailOptions };
