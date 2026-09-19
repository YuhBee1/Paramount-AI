import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, decodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const.js";

type VercelRequestLike = {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponseLike = {
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string | string[]) => void;
  redirect: (code: number, url: string) => void;
};

function header(request: VercelRequestLike, name: string) {
  const value = request.headers[name] ?? request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

export default async function callback(request: VercelRequestLike, response: VercelResponseLike) {
  const forwardedProtocol = header(request, "x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const forwardedHost = header(request, "x-forwarded-host")?.split(",")[0]?.trim() || header(request, "host") || "localhost";
  const requestUrl = new URL(request.url || "/api/oauth/callback", `${forwardedProtocol}://${forwardedHost}`);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  if (!code || !state) {
    response.status(400).json({ error: "code and state are required" });
    return;
  }

  const { nonce, redirectUri } = decodeOAuthState(state);
  const cookies = parseCookieHeader(header(request, "cookie") ?? "");
  if (!nonce || nonce !== cookies[OAUTH_STATE_COOKIE]) {
    response.status(403).json({ error: "invalid oauth state" });
    return;
  }

  try {
    const [{ sdk }, db] = await Promise.all([
      import("../../server/_core/sdk.js"),
      import("../../server/db.js"),
    ]);
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      response.status(400).json({ error: "openId missing from user info" });
      return;
    }

    await db.upsertUser({
      openId: userInfo.openId,
      name: userInfo.name || null,
      email: userInfo.email ?? null,
      loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
      lastSignedIn: new Date(),
    });

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: 365 * 24 * 60 * 60 * 1000,
    });

    response.setHeader("Set-Cookie", [
      `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; SameSite=None; Secure`,
      `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=31536000; HttpOnly; SameSite=None; Secure`,
    ]);
    response.redirect(302, redirectUri || "/");
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    response.status(500).json({ error: "OAuth callback failed" });
  }
}
