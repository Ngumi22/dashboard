import { hashPassword, isAllowedEmail } from "@/lib/Auth_actions/auth";
import { createUser, getUserByEmail } from "@/lib/Auth_actions/db";
import { createSession } from "@/lib/Auth_actions/sessions";
import { type NextRequest, NextResponse } from "next/server";

// OAuth configuration
const oauthConfig = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    userEmailsUrl: "https://api.github.com/user/emails",
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  // Validate provider and code
  if (!["github", "google"].includes(provider) || !code) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_request", request.url)
    );
  }

  try {
    // Exchange code for access token
    let accessToken = "";
    let userData = null;
    let userEmail = "";

    if (provider === "github") {
      // Exchange code for GitHub access token
      const tokenResponse = await fetch(oauthConfig.github.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: oauthConfig.github.clientId,
          client_secret: oauthConfig.github.clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Get user data
      const userResponse = await fetch(oauthConfig.github.userInfoUrl, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });

      userData = await userResponse.json();

      // Get user email (GitHub might not include email in user data)
      if (!userData.email) {
        const emailsResponse = await fetch(oauthConfig.github.userEmailsUrl, {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });

        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((email: any) => email.primary);
        userEmail = primaryEmail ? primaryEmail.email : emails[0].email;
      } else {
        userEmail = userData.email;
      }
    } else if (provider === "google") {
      // Exchange code for Google access token
      const tokenResponse = await fetch(oauthConfig.google.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: oauthConfig.google.clientId,
          client_secret: oauthConfig.google.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      // Get user data
      const userResponse = await fetch(oauthConfig.google.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      userData = await userResponse.json();
      userEmail = userData.email;
    }

    // Check if email is allowed
    const emailAllowed = await isAllowedEmail(userEmail);
    if (!emailAllowed) {
      return NextResponse.redirect(
        new URL("/login?error=email_not_allowed", request.url)
      );
    }

    // Check if user exists
    let user = await getUserByEmail(userEmail);

    // Create user if not exists
    if (!user) {
      // Generate a random password for OAuth users
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedRandomPassword = await hashPassword(randomPassword);

      // Create user with default role
      await createUser({
        name: userData.name || userData.login || "User",
        email: userEmail,
        password: hashedRandomPassword,
        role: "user",
      });

      // Get the newly created user
      user = await getUserByEmail(userEmail);
    }

    // Create session
    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error(`${provider} OAuth error:`, error);
    return NextResponse.redirect(
      new URL("/login?error=auth_error", request.url)
    );
  }
}
