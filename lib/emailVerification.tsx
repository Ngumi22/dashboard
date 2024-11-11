import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import VerifyEmail from "./templates/email";

export async function sendVerificationEmail(email: string, token: string) {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  // Check if required environment variables are set
  if (!EMAIL_USER || !EMAIL_PASS || !process.env.BASE_URL) {
    console.error("Missing required environment variables");
    return;
  }

  console.log("Using email:", EMAIL_USER);

  // Create nodemailer transport
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    // Verify SMTP connection
    await transport.verify();
    console.log("SMTP connection successful");
  } catch (error) {
    console.error("SMTP connection error:", error);
    return;
  }

  try {
    // Render the email HTML
    const emailHtml = await render(
      <VerifyEmail url={`${process.env.BASE_URL}/api/verify?token=${token}`} />
    );

    // Define email options
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Please verify your email",
      html: emailHtml,
    };

    // Send the email
    await transport.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
