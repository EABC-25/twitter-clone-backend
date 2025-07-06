export interface SeedBuffer {
  type: "Buffer";
  data: number[];
}

export interface SeedUser {
  userId: string;
  createdAt: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  displayNamePermanent: SeedBuffer;
  dateOfBirth: string;
  bioText: string;
  verified: SeedBuffer;
  verificationToken: string | null;
  verificationExpire: number | null;
  forgotPasswordFlag: SeedBuffer;
  forgotPasswordToken: string | null;
  forgotPasswordExpire: number | null;
  profilePicture: string | null;
  headerPicture: string | null;
  userInfoChangeCount: number;
  profilePicturePublicId: string | null;
  headerPicturePublicId: string | null;
}

export interface SeedPost {
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

export interface SeedReply {
  replyId: string;
  postId: string;
  createdAt: string;
  postText: string | null;
  likeCount: number;
  replyCount: number;
  replierId: string;
  posterId: string;
}

export interface SeedPostLike {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface SeedUserFollow {
  follower_id: string;
  followed_id: string;
  createdAt: string;
}

// export type Entity = User | Post | Reply | PostLike | UserFollow;
