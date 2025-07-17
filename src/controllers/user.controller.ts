import { type Request, type Response } from "express";
import { CustomError, handleError, deleteMedia } from "../utils";

import {
  getUsersFromDb,
  getUserFromDb,
  getUserLikedPostsFromDb,
  updateUserInDb,
  deleteUserFromDb,
  getUserFollowsCountFromDb,
  getUserFollowsFromDb,
  updateUserFollowsInDb,
  getUsersSearchedFromDb,
  getUserPostsRepliesLimits,
  getUserCountInDb,
} from "../services/user.service";

import {
  UserEmailSchema,
  UserToResponseSchema,
  UserInformationForUpdateSchema,
  UserFollowsForUpdateSchema,
  type UserInformationForUpdate,
} from "src/utils/zod/User";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const results = await getUsersFromDb();
    res.status(200).json({ data: results });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const { userCount } = await getUserCountInDb();

    res.status(200).json({
      userCount,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserFromToken = async (req: Request, res: Response) => {
  try {
    let {
      userId,
      username,
      email,
      createdAt,
      displayName,
      displayNamePermanent,
      dateOfBirth,
      bioText,
      verified,
      profilePicture,
      headerPicture,
      userInfoChangeCount,
    } = req.body.user[0];

    const likedPosts = await getUserLikedPostsFromDb(userId);
    const userFollowsCount = await getUserFollowsCountFromDb(userId);
    const userPostsRepliesCount = await getUserPostsRepliesLimits(userId);

    const user = UserToResponseSchema.parse({
      username,
      email,
      dates: {
        createdAt,
        createdAtShort: "",
        dateOfBirth,
        dateOfBirthShort: "",
        dateOfBirthNum: "",
      },
      displayName,
      displayNamePermanent,
      bioText,
      verified,
      likedPosts,
      profilePicture,
      headerPicture,
      userFollowsCount,
      postCount: userPostsRepliesCount.postCount,
      replyCount: userPostsRepliesCount.replyCount,
      userInfoChangeCount,
    });

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserWithUserName = async (req: Request, res: Response) => {
  try {
    const { username: un } = req.query;

    if (!un) {
      throw new CustomError("DB: User not found!", 404);
    }

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE username = ?`,
      un as string
    );

    if (results.length <= 0 || !results[0].userId) {
      throw new CustomError("DB: User not found!", 404);
    }

    const userFollowsCount = await getUserFollowsCountFromDb(results[0].userId);

    const user = UserToResponseSchema.parse({
      username: results[0].username,
      email: results[0].email,
      dates: {
        createdAt: results[0].createdAt,
        createdAtShort: "",
        dateOfBirth: results[0].dateOfBirth,
        dateOfBirthShort: "",
        dateOfBirthNum: "",
      },
      displayName: results[0].displayName,
      displayNamePermanent: results[0].displayNamePermanent,
      bioText: results[0].bioText,
      verified: results[0].verified,
      likedPosts: null,
      profilePicture: results[0].profilePicture,
      headerPicture: results[0].headerPicture,
      userFollowsCount,
      postCount: null,
      replyCount: null,
      userInfoChangeCount: null,
    });

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // we need to pass cookie token here, but for this test email will suffice..
    const { email } = req.body;

    // safeParse returns an object { success: true, data } || { success: false, error }
    const emailCheck = UserEmailSchema.safeParse(email);

    if (!emailCheck.success) {
      throw new CustomError("Not a valid email", 404);
    }

    if (!(await deleteUserFromDb(email))) {
      throw new CustomError("DB: User not found!", 404);
    }

    res.status(200).json({
      message: "Successfully deleted User!",
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { updates, user } = req.body;

    if (
      user[0].userInfoChangeCount >=
      (parseInt(process.env.USER_INFO_CHANGE_COUNT_LIMIT as string) || 10)
    ) {
      throw new CustomError("User info change limit already reached!", 403);
    }

    const updatesCheck = UserInformationForUpdateSchema.safeParse(updates);

    if (!updatesCheck.success) {
      throw new CustomError("Unauthorized access!", 401);
    }

    const updatesCopy = updatesCheck.data;

    if (updatesCopy.email !== user[0].email) {
      throw new CustomError("Unauthorized access!", 401);
    }

    let updateKeys: string[] = [];
    let updateValues: string[] = [];
    let updateStr: string = "";

    type UpdatableKey = keyof UserInformationForUpdate;

    (Object.keys(updatesCopy) as UpdatableKey[])
      .filter(key => key !== "email") // remove email
      .forEach(key => {
        const value = updatesCopy[key];
        if (value !== null && value !== undefined) {
          updateValues.push(value);
          updateKeys.push(` ${key} = ?`);
        }
      });

    updateStr = updateKeys.join(",");

    let query: string = `UPDATE users SET${updateStr}, userInfoChangeCount = userInfoChangeCount + 1 WHERE userId = ?`;

    const prevMedia = await updateUserInDb(
      query,
      [...updateValues, user[0].userId],
      user[0].userId
    );

    console.log("user updated prevMedia: ", prevMedia);

    // !prevMedia means upload failed, take a look at updateUserInDb service for reference
    if (!prevMedia) {
      // revert media upload if unsuccessful
      if (updatesCopy.profilePicture && updatesCopy.profilePicturePublicId) {
        await deleteMedia(updatesCopy.profilePicturePublicId, "image");
      }

      if (updatesCopy.headerPicture && updatesCopy.headerPicturePublicId) {
        await deleteMedia(updatesCopy.headerPicturePublicId, "image");
      }

      // why are we throwing an error here? because we threw null from updateUserInDb service in order to activate !prevMedia conditional block. now that we have successfully reverted/deleted uploaded media, we can now throw error
      throw new CustomError(
        "Something went wrong.. please try again later",
        500
      );
    }

    // backend needs to initiate deletion of previously uploaded media if user has uploaded a new one. That's why we returned prevMedia object from db method
    if (updatesCopy.profilePicture && prevMedia.profilePicturePublicId) {
      await deleteMedia(prevMedia.profilePicturePublicId, "image");
    }

    if (updatesCopy.headerPicture && prevMedia.headerPicturePublicId) {
      await deleteMedia(prevMedia.headerPicturePublicId, "image");
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserFollows = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;

    const user = await getUserFromDb(
      `SELECT userId FROM users WHERE username = ?`,
      username as string
    );

    if (user.length === 0 || !user[0].userId) {
      throw new CustomError("DB: Not Found", 400);
    }

    const userFollows = await getUserFollowsFromDb(user[0].userId);

    res.status(200).json({
      userFollows: userFollows,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const updateUserFollows = async (req: Request, res: Response) => {
  try {
    const { updates, user } = req.body;

    const updatesCheck = UserFollowsForUpdateSchema.safeParse(updates);

    if (!updatesCheck.success) {
      throw new CustomError("Not enough information.", 401);
    }

    const updatesChecked = updatesCheck.data;

    if (user[0].username === updatesChecked.otherUser) {
      throw new CustomError("Action not possible.", 403);
    }

    const otherUserId = await getUserFromDb(
      `SELECT userId FROM users WHERE username = ?`,
      updatesChecked.otherUser as string
    );

    if (otherUserId.length === 0 || !otherUserId[0].userId) {
      throw new CustomError("DB: Not Found", 400);
    }

    if (
      !(await updateUserFollowsInDb(
        updatesChecked.type,
        user[0].userId,
        otherUserId[0].userId
      ))
    ) {
      throw new CustomError("DB: Something went wrong", 500);
    }

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUsersForSearch = async (req: Request, res: Response) => {
  try {
    const data = await getUsersSearchedFromDb();

    res.status(200).json({
      users: data,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserPostsRepliesLimitsTest = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getUserPostsRepliesLimits(
      "285d07a2-2736-11f0-b3fd-88a4c22b5dbc"
    );

    res.status(200).json({
      limits: data,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserFromTokenTest = async (req: Request, res: Response) => {
  try {
    const userId = "3e686ac1-477c-11f0-ab22-88a4c22b5dbc";
    const username = "usertesting";
    const email = "usertesting@email.com";
    const createdAt = new Date("2025-06-12T18:58:59.000Z");
    const dateOfBirth = new Date("2025-06-12T18:58:59.000Z");
    const displayName = "usertesting";
    const displayNamePermanent = false;
    const bioText = "";
    const verified = true;
    const profilePicture = null;
    const headerPicture = null;
    const userInfoChangeCount = 0;

    const likedPosts = await getUserLikedPostsFromDb(userId);
    const userFollowsCount = await getUserFollowsCountFromDb(userId);
    const userPostsRepliesCount = await getUserPostsRepliesLimits(userId);

    const user = UserToResponseSchema.parse({
      username,
      email,
      dates: {
        createdAt,
        createdAtShort: "",
        dateOfBirth,
        dateOfBirthShort: "",
        dateOfBirthNum: "",
      },
      displayName,
      displayNamePermanent,
      bioText,
      verified,
      likedPosts,
      profilePicture,
      headerPicture,
      userFollowsCount,
      postCount: userPostsRepliesCount.postCount,
      replyCount: userPostsRepliesCount.replyCount,
      userInfoChangeCount,
    });

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserWithUserNameTest = async (req: Request, res: Response) => {
  try {
    const un = "usertesting";

    if (!un) {
      throw new CustomError("DB: User not found!", 404);
    }

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE username = ?`,
      un as string
    );

    if (results.length <= 0 || !results[0].userId) {
      throw new CustomError("DB: User not found!", 404);
    }

    const userFollowsCount = await getUserFollowsCountFromDb(results[0].userId);

    const user = UserToResponseSchema.parse({
      username: results[0].username,
      email: results[0].email,
      dates: {
        createdAt: results[0].createdAt,
        createdAtShort: "",
        dateOfBirth: results[0].dateOfBirth,
        dateOfBirthShort: "",
        dateOfBirthNum: "",
      },
      displayName: results[0].displayName,
      displayNamePermanent: results[0].displayNamePermanent,
      bioText: results[0].bioText,
      verified: results[0].verified,
      likedPosts: null,
      profilePicture: results[0].profilePicture,
      headerPicture: results[0].headerPicture,
      userFollowsCount,
      postCount: null,
      replyCount: null,
      userInfoChangeCount: null,
    });

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    handleError(err, res);
  }
};
