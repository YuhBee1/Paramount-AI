import type { Request, Response } from "express";

type VercelLikeRequest = Request & {
  query: Record<string, string | string[] | undefined>;
};

export default async function handler(req: VercelLikeRequest, res: Response) {
  const { createVercelApp } = await import("../server/vercelApp");
  const app = createVercelApp();
  const rawQuery = req.query ?? {};
  const requestedPath = typeof rawQuery.__path === "string" ? rawQuery.__path : undefined;
  if (requestedPath) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(rawQuery)) {
      if (key === "__path") continue;
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== undefined) query.set(key, String(value));
    }
    req.url = `/api${requestedPath}${query.toString() ? `?${query.toString()}` : ""}`;
  }
  return app(req, res);
}
