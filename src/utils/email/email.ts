import { type Request } from "express";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  req: Request,
  token: string,
  email: string
): Promise<boolean> => {
  const verifyEmailURL = `${req.protocol}://${req.get(
    "host"
  )}/users/verifyEmail?token=${token}`;

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification - Authentication",
    text: `Please click this link to verify your email within 24 hours: \n\n <a href="${verifyEmailURL}" id="anchor">`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (err) {
    console.error("Email: failed to send email");
    return false;
  }
};
