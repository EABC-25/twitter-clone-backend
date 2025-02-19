interface User {
  userId: string;
  createdAt: Date;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | null;
  verificationExpire: number | null;
  forgotPasswordFlag: boolean;
  forgotPasswordToken: string | null;
  forgotPasswordExpire: string | null;
}

interface NewUser {
  username: string;
  email: string;
  password: string;
  verificationToken: string | null;
  verificationExpire: number | null;
}

interface NewPost {
  userId: string;
  postText: string | null;
  postMedia: string | null;
}

interface Post {
  postId: number;
  createdAt: string;
  postText: string;
  postMedia: string;
  likeCount: number;
}

interface EmailOptions {
  subject: string;
  email: string;
  message: string;
}

interface CookieOptions {
  httpOnly: boolean;
  expires: Date;
  sameSite?: "lax" | "strict" | "none";
  secure: boolean | null;
}

const MESSAGE = {
  SUCCESS: "SUCCESS",
  DB_ERROR: "FAILED_DB",

  // TO BE CONTINUED
};

export {
  type User,
  type NewUser,
  type EmailOptions,
  type CookieOptions,
  type NewPost,
  type Post,
};
