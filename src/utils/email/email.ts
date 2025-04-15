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
  // TO DO: we need this endpoint to display a frontend component that will do the POST-request instead of directly accessing this endpoint in the browser to send a request (which will not work because GET) to the backend

  // const verifyEmailURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/auth/verifyEmail?email=${email}&token=${token}`;

  const frontEndUrl = `${process.env.FRONTEND_URL}/emailVerification?email=${email}&token=${token}`;

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: "Email Verification - Authentication",
    text: `Please click this link to verify your email within 24 hours: ${frontEndUrl}`,
    html: `<p>Please click the link below to verify your email within 24 hours:</p>
    <p><a href="${frontEndUrl}" target="_blank">Verify Email<a/></p>

    <p>If you did not request this, please ignore this email.</p>
    `,
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
