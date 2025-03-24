import { type NextRequest, NextResponse } from "next/server";

// OAuth configuration
const oauthConfig = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID as string,
    clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  // Validate provider
  if (!["github", "google"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  // Generate OAuth authorization URL
  let authUrl = "";

  if (provider === "github") {
    const { clientId, redirectUri } = oauthConfig.github;
    const scope = "read:user user:email";

    authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}`;
  } else if (provider === "google") {
    const { clientId, redirectUri } = oauthConfig.google;
    const scope = "profile email";

    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  }

  // Redirect to provider's authorization page
  return NextResponse.redirect(authUrl);
}
