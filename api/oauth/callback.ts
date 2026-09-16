import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, decodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";
import * as db from "../../server/db";
import { sdk } from "../../server/_core/sdk";

export default async function callback(req: any, res: any) {
  const code = typeof req.query?.code === "string" ? req.query.code : undefined;
  const state = typeof req.query?.state === "string" ? req.query.state : undefined;
  if (!code || !state) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "code and state are required" }));
    return;
  }

  const { nonce, redirectUri } = decodeOAuthState(state);
  const cookies = parseCookieHeader(String(req.headers?.cookie ?? ""));
  if (!nonce || nonce !== cookies[OAUTH_STATE_COOKIE]) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "invalid oauth state" }));
    return;
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "openId missing from user info" }));
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

    res.statusCode = 302;
    res.setHeader("Set-Cookie", [
      `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; SameSite=None; Secure`,
      `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=31536000; HttpOnly; SameSite=None; Secure`,
    ]);
    res.setHeader("Location", redirectUri || "/");
    res.end();
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "OAuth callback failed" }));
  }
}
