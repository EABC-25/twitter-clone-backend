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
  profilePicture: string | null;
  headerPicture: string | null;
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

interface UpdatedUser {
  profilePicture: string | null;
  headerPicture: string | null;
  displayName: string;
  bioText: string | null;
  dateOfBirth: string;
}

interface NewPost {
  userId: string;
  postText: string | null;
  postMedia: string | null;
  mediaTypes: string | null;
  mediaPublicId: string | null;
}

interface Post {
  postId: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  createdAt: string;
  postText: string | null;
  postMedia: string | null;
  mediaTypes: string;
  likeCount: number;
  replyCount: number;
  userId?: string;
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
  replierId: string;
  posterId: string;
  postText: string | null;
}

interface Reply {
  replyId: string;
  postId: string;
  replierUserName: string;
  replierDisplayName: string;
  replierProfilePicture: string;
  posterUserName: string;
  createdAt: string;
  postText: string;
  likeCount: number;
  replyCount: number;
}

interface ResponseReplies {
  replies: Reply[];
  nextPage: boolean;
  nextPageCount: number;
}

interface UserFollows {
  profilePicture: string;
  username: string;
  displayName: string;
  bioText: string;
}

export {
  type User,
  type NewUser,
  type UserByToken,
  type UpdatedUser,
  type EmailOptions,
  type CookieOptions,
  type NewPost,
  type Post,
  type ResponsePosts,
  type ResponsePost,
  type NewReply,
  type Reply,
  type ResponseReplies,
  type UserFollows,
};
