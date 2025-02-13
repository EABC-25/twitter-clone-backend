import { v2 as cloudinary } from "cloudinary";
import cloudinaryConfig from "../config/cloudinary.config";

const apiSecret = cloudinaryConfig.api_secret;

const signUploadForm = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "twitter_clone",
    },
    apiSecret
  );

  return { timestamp, signature };
};

export default signUploadForm;
