import { v2 as cloudinary } from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.config";

const apiSecret = cloudinaryConfig.api_secret;

const signUploadForm = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    },
    apiSecret
  );

  return { timestamp, signature };
};

export default signUploadForm;
