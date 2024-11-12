import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import VerifyEmail from "./templates/email";

export async function sendVerificationEmail(email: string, token: string) {
  const { EMAIL_USER, EMAIL_PASS, BASE_URL } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS || !BASE_URL) {
    console.error("Missing required environment variables");
    return;
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    await transport.verify();
    const emailHtml = await render(
      <VerifyEmail url={`${BASE_URL}/api/verify?token=${token}`} />
    );

    await transport.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Please verify your email",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
