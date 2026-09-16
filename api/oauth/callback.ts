import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, decodeOAuthState, OAUTH_STATE_COOKIE } from "../../shared/const";
import * as db from "../../server/db";
import { sdk } from "../../server/_core/sdk";

export default async function callback(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  if (!code || !state) {
    return Response.json({ error: "code and state are required" }, { status: 400 });
  }

  const { nonce, redirectUri } = decodeOAuthState(state);
  const cookies = parseCookieHeader(request.headers.get("cookie") ?? "");
  if (!nonce || nonce !== cookies[OAUTH_STATE_COOKIE]) {
    return Response.json({ error: "invalid oauth state" }, { status: 403 });
  }

  try {
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    if (!userInfo.openId) {
      return Response.json({ error: "openId missing from user info" }, { status: 400 });
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

    const headers = new Headers({ Location: redirectUri || "/" });
    headers.append("Set-Cookie", `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; SameSite=None; Secure`);
    headers.append("Set-Cookie", `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=31536000; HttpOnly; SameSite=None; Secure`);
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    return Response.json({ error: "OAuth callback failed" }, { status: 500 });
  }
}
