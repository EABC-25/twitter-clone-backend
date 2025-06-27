import { type Request, type Response } from "express";
import { CookieOptions } from "express";
import validator from "validator";

import db from "../db";
import { handleError } from "../utils";

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

    // console.log((Object.keys(updatesCopy) as UpdatableKey[]).slice(0, 7));

    res.status(200).json({ message: "nothing happened here.." });
  } catch (err) {
    handleError(err, res);
  }
};
