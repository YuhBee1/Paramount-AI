export default {
  async fetch(request: Request) {
    const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL;
    const appId = process.env.VITE_APP_ID;

    if (!oauthPortalUrl || !appId) {
      return new Response(JSON.stringify({ error: "OAuth configuration is missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    if (!host) {
      return new Response(JSON.stringify({ error: "OAuth host is missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const protocol = forwardedProtocol || "https";
    const redirectUri = `${protocol}://${host}/api/oauth/callback`;
    const nonce = crypto.randomUUID();
    const encodedState = btoa(JSON.stringify({ redirectUri, nonce }));
    const loginUrl = new URL(`${oauthPortalUrl.replace(/\/+$/, "")}/app-auth`);
    loginUrl.searchParams.set("appId", appId);
    loginUrl.searchParams.set("redirectUri", redirectUri);
    loginUrl.searchParams.set("state", encodedState);
    loginUrl.searchParams.set("type", "signIn");

    return new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl.toString(),
        "Set-Cookie": `__Host-oauth_state=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`,
      },
    });
  },
};
