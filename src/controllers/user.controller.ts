import { type Request, type Response } from "express";
import {
  type UserInfoUpdates,
  CustomError,
  handleError,
  deleteMedia,
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
} from "../utils";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const results = await getUsersFromDb();
    // console.log(results[0].createdAt instanceof Date);
    res.status(200).json({ data: results });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserTest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE userId = ?`,
      userId as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    const dnp = results[0].displayNamePermanent
      ? results[0].displayNamePermanent[0] === 1
      : false;

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    if (!v) {
      throw new CustomError("User: User is not yet verified!", 403);
    }

    const lpRes = await getUserLikedPostsFromDb(results[0].userId);
    const lpResMappedVals: string[] = lpRes.map(obj => obj.postId);

    res.status(200).json({
      user: {
        username: results[0].username,
        email: results[0].email,
        createdAt: results[0].createdAt,
        displayName: results[0].displayName,
        displayNamePermanent: dnp,
        dateOfBirth: results[0].dateOfBirth,
        bioText: results[0].bioText,
        verified: v,
        likedPosts: lpResMappedVals,
        profilePicture: results[0].profilePicture,
        headerPicture: results[0].headerPicture,
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const getUserWithToken = async (req: Request, res: Response) => {
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

    const dnp = displayNamePermanent ? displayNamePermanent[0] === 1 : false;

    const v = verified ? verified[0] === 1 : false;

    // if (!v) {
    //   throw new CustomError("User: User is not yet verified!", 403);
    // }

    const lpRes = await getUserLikedPostsFromDb(userId);
    const lpResMappedVals: string[] = lpRes.map(obj => obj.postId);

    const userFollowsCount = await getUserFollowsCountFromDb(userId);
    const userPostsRepliesCount = await getUserPostsRepliesLimits(userId);

    const user = {
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
      displayNamePermanent: dnp,
      bioText,
      verified: v,
      likedPosts: lpResMappedVals,
      profilePicture,
      headerPicture,
      userFollowsCount,
      postCount: userPostsRepliesCount.postCount,
      replyCount: userPostsRepliesCount.replyCount,
      userInfoChangeCount,
    };
    // console.log("user: ", user);

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

    console.log(un);

    if (!un) {
      throw new CustomError("DB: User not found!", 404);
    }

    const results = await getUserFromDb(
      `SELECT userId, username, email, createdAt, displayName, displayNamePermanent, dateOfBirth, bioText, verified, profilePicture, headerPicture FROM users WHERE username = ?`,
      un as string
    );

    if (results.length <= 0) {
      throw new CustomError("DB: User not found!", 404);
    }

    const dnp = results[0].displayNamePermanent
      ? results[0].displayNamePermanent[0] === 1
      : false;

    const v = results[0].verified ? results[0].verified[0] === 1 : false;

    // if (!v) {
    //   throw new CustomError("User: User is not yet verified!", 403);
    // }

    const userFollowsCount = await getUserFollowsCountFromDb(results[0].userId);

    res.status(200).json({
      user: {
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
        displayNamePermanent: dnp,
        bioText: results[0].bioText,
        verified: v,
        likedPosts: null,
        profilePicture: results[0].profilePicture,
        headerPicture: results[0].headerPicture,
        userFollowsCount,
        postCount: null,
        replyCount: null,
        userInfoChangeCount: null,
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // we need to pass cookie token here, but for this test email will suffice..
    const { email } = req.body;
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

    const updatesCopy: UserInfoUpdates = { ...updates };

    if (updatesCopy.email !== user[0].email) {
      throw new CustomError("Unauthorized access!", 401);
    }

    let updateKeys: string[] = [];
    let updateValues: string[] = [];
    let updateStr: string = "";

    type UpdatableKey = keyof UserInfoUpdates;

    (Object.keys(updatesCopy) as UpdatableKey[])
      .slice(0, 7) // remove email, profilePictureActive and headerPictureActive
      .forEach(v => {
        if (updatesCopy[v]) {
          updateValues.push(updatesCopy[v]);
          updateKeys.push(` ${v} = ?`);
        }
      });

    updateStr = updateKeys.join(",");

    let query: string = `UPDATE users SET${updateStr}, userInfoChangeCount = userInfoChangeCount + 1 WHERE userId = ?`;

    const prevMedia = await updateUserInDb(
      query,
      [...updateValues, user[0].userId],
      user[0].userId
    );

    console.log(prevMedia);

    if (!prevMedia) {
      //revert media upload if unsuccessful
      if (updatesCopy.profilePicture && updatesCopy.profilePictureMediaId) {
        await deleteMedia(updatesCopy.profilePictureMediaId, "image");
      }

      if (updatesCopy.headerPicture && updatesCopy.headerPictureMediaId) {
        await deleteMedia(updatesCopy.headerPictureMediaId, "image");
      }

      throw new CustomError(
        "Something went wrong.. please try again later",
        500
      );
    }

    // backend needs to initiate deletion of previously uploaded media if user has uploaded a new one. That's why we returned prevMedia object from db method
    if (updatesCopy.profilePicture && prevMedia.profilePictureMediaId) {
      await deleteMedia(prevMedia.profilePictureMediaId, "image");
    }

    if (updatesCopy.headerPicture && prevMedia.headerPictureMediaId) {
      await deleteMedia(prevMedia.headerPictureMediaId, "image");
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

    if (user.length === 0) {
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

    if (user[0].username === updates.otherUser) {
      throw new CustomError("DB: Unauthorized.", 403);
    }

    const otherUserId = await getUserFromDb(
      `SELECT userId FROM users WHERE username = ?`,
      updates.otherUser as string
    );

    if (otherUserId.length === 0) {
      throw new CustomError("DB: Not Found", 400);
    }

    if (
      !(await updateUserFollowsInDb(
        updates.type,
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
