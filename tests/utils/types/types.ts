export interface User {
  userId: string;
  createdAt: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  bioText: string;
  verificationToken: string | null;
  verificationExpire: number | null;
  forgotPasswordToken: string | null;
  forgotPasswordExpire: number | null;
  profilePicture: string | null;
  headerPicture: string | null;
  userInfoChangeCount: number;
  profilePicturePublicId: string | null;
  headerPicturePublicId: string | null;
}

export interface Post {
  postId: string;
  createdAt: string;
  postText: string | null;
  postMedia: string | null;
  mediaTypes: string | null;
  likeCount: number;
  replyCount: number;
  mediaPublicId: string | null;
  userId: string;
}

export interface Reply {
  replyId: string;
  postId: string;
  createdAt: string;
  postText: string | null;
  likeCount: number;
  replyCount: number;
  replierId: string;
  posterId: string;
}

export interface PostLike {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface UserFollow {
  follower_id: string;
  followed_id: string;
  createdAt: string;
}

export type Entity = User | Post | Reply | PostLike | UserFollow;
