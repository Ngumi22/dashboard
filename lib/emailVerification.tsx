import nodemailer from "nodemailer";

import * as handlebars from "handlebars";

import { VerifyEmail } from "./templates/email";

export async function sendVerificationEmail(email: string, token: string) {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    await transport.verify(); // Verify the connection
  } catch (error) {
    console.error("SMTP connection error:", error);
    return;
  }

  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Please verify your email",
      html: compileWelcomeTemplate(token),
    };

    await transport.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export function compileWelcomeTemplate(token: string): string {
  try {
    const verificationLink = `${process.env.BASE_URL}/api/verify?token=${token}`;
    const template = handlebars.compile(VerifyEmail);
    const htmlBody = template({ url: verificationLink });
    return htmlBody;
  } catch (error) {
    console.error("Error compiling Handlebars template:", error);
    return "";
  }
}
