import { randomUUID } from "node:crypto";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";

export default function login(request: Request) {
  const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL;
  const appId = process.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    return Response.json({ error: "OAuth configuration is missing" }, { status: 500 });
  }

  const incomingUrl = new URL(request.url);
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || incomingUrl.protocol.replace(":", "");
  const redirectUri = `${forwardedProtocol}://${incomingUrl.host}/api/oauth/callback`;
  const nonce = randomUUID();
  const state = encodeOAuthState({ redirectUri, nonce });
  const loginUrl = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
  loginUrl.searchParams.set("appId", appId);
  loginUrl.searchParams.set("redirectUri", redirectUri);
  loginUrl.searchParams.set("state", state);
  loginUrl.searchParams.set("type", "signIn");

  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      "Set-Cookie": `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`,
    },
  });
}
