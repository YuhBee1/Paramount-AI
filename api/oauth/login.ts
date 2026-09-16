import { randomUUID } from "node:crypto";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";

export default function login(req: any, res: any) {
  const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL;
  const appId = process.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "OAuth configuration is missing" }));
    return;
  }

  const forwardedProtocol = String(req.headers?.["x-forwarded-proto"] ?? "https").split(",")[0].trim();
  const host = req.headers?.host;
  if (!host) {
    res.statusCode = 400;
    res.end("Missing host header");
    return;
  }

  const nonce = randomUUID();
  const redirectUri = `${forwardedProtocol || "https"}://${host}/api/oauth/callback`;
  const state = encodeOAuthState({ redirectUri, nonce });
  const loginUrl = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
  loginUrl.searchParams.set("appId", appId);
  loginUrl.searchParams.set("redirectUri", redirectUri);
  loginUrl.searchParams.set("state", state);
  loginUrl.searchParams.set("type", "signIn");

  res.statusCode = 302;
  res.setHeader("Set-Cookie", `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`);
  res.setHeader("Location", loginUrl.toString());
  res.end();
}
