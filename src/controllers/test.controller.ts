import { type Request, type Response } from "express";
import { CookieOptions } from "express";
import validator from "validator";

import db from "../db";
import { handleError } from "../utils";
import {
  getUsersFromDb,
  getUserLikedPostsFromDb,
  checkUserInDb,
} from "src/services/user.service";
import { getPostsFromDb, getUserIdFromPost } from "src/services/post.service";
import {
  dateStringIsISO8601Valid,
  dateStringIsAValidPreviouslyPassedDate,
} from "src/utils/helpers/helpers";

// I use this endpoint for testing thru postman
export const endPointTest = async (req: Request, res: Response) => {
  try {
    // await getUserFromDb(
    //   `SELECT * FROM users WHERE username = ?`,
    //   "Super_Admin"
    // );

    // const mediaResult = await db.executeRows(
    //   `SELECT mediaPublicId, mediaTypes FROM posts WHERE postId = ?`,
    //   ["4c96647b-33d3-11f0-b004-88a4c22b5dbc"]
    // );

    // console.log(mediaResult);
    // console.log(mediaResult[0][0]);

    // const updatesCopy: UserInfoUpdates = {
    //   profilePicture: "",
    //   headerPicture: "",
    //   profilePictureMediaId: "",
    //   headerPictureMediaId: "",
    //   displayName: "",
    //   bioText: "",
    //   dateOfBirth: "",
    //   email: "",
    // };

    // type UpdatableKey = keyof UserInfoUpdates;

    // const data = await getUserLikedPostsFromDb(
    //   "56e1120c-44f9-11f0-ab22-88a4c22b5dbc"
    // );

    // is it possible it does not work with 2 and it should be 02?
    const data = dateStringIsISO8601Valid("2005-2-29");

    // console.log((Object.keys(updatesCopy) as UpdatableKey[]).slice(0, 7));

    res.status(200).json({ message: "test message", data });
  } catch (err) {
    handleError(err, res);
  }
};
