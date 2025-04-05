interface User {
  userId: string;
  createdAt: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  displayNamePermanent: boolean;
  dateOfBirth: string;
  bioText: string;
  verified: boolean;
  verificationToken: string | null;
  verificationExpire: number | null;
  forgotPasswordFlag: boolean;
  forgotPasswordToken: string | null;
  forgotPasswordExpire: string | null;
}
// userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified
interface UserByToken {
  userId: string;
  createdAt: string;
  username: string;
  email: string;
  displayName: string;
  displayNamePermanent: boolean;
  dateOfBirth: string;
  bioText: string;
  verified: boolean;
}

interface NewUser {
  username: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  verificationToken: string | null;
  verificationExpire: number | null;
}

interface NewPost {
  username: string;
  displayName: string;
  postText: string | null;
  postMedia: string | null;
  mediaTypes: string;
}

interface Post {
  postId: string;
  username: string;
  displayName: string;
  createdAt: string;
  postText: string | null;
  postMedia: string | null;
  mediaTypes: string;
  likeCount: number;
  replyCount: number;
}

interface ResponsePosts {
  posts: Post[];
  nextPage: boolean;
}

interface ResponsePost {
  post: Post;
  reacts: null;
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

interface NewReply {
  postId: string;
  posterName: string;
  username: string;
  displayName: string;
  postText: string | null;
}

interface Reply {
  replyId: string;
  postId: string;
  posterName: string;
  username: string;
  displayName: string;
  createdAt: string;
  postText: string;
  likeCount: number;
  replyCount: number;
}

interface ResponseReplies {
  replies: Reply[];
  nextPage: boolean;
}

const MESSAGE = {
  SUCCESS: "SUCCESS",
  DB_ERROR: "FAILED_DB",

  // TO BE CONTINUED
};

export {
  type User,
  type NewUser,
  type UserByToken,
  type EmailOptions,
  type CookieOptions,
  type NewPost,
  type Post,
  type ResponsePosts,
  type ResponsePost,
  type NewReply,
  type Reply,
  type ResponseReplies,
};
