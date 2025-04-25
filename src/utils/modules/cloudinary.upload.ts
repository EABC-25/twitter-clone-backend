import { v2 as cloudinary } from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.config";

const apiSecret = cloudinaryConfig.api_secret;

export const signUploadForm = () => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: process.env.CLOUDINARY_FOLDER_NAME,
      },
      apiSecret
    );

    return { timestamp, signature };
  } catch (err) {
    throw err;
  }
};

export const deleteMedia = async (publicId: string, type: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: type,
      invalidate: true,
    });
    console.log("Deleted: ", result);
    return result;
  } catch (err) {
    console.error("Cloudinary deletion error: ", err);
    throw err;
  }
};
