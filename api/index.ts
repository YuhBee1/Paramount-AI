import type { Request, Response } from "express";
import { createVercelApp } from "../server/vercelApp";

type VercelLikeRequest = Request & {
  query: Record<string, string | string[] | undefined>;
};

const app = createVercelApp();

export default function handler(req: VercelLikeRequest, res: Response) {
  const requestedPath = typeof req.query.__path === "string" ? req.query.__path : undefined;
  if (requestedPath) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === "__path") continue;
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== undefined) query.set(key, String(value));
    }
    req.url = `${requestedPath}${query.toString() ? `?${query.toString()}` : ""}`;
  }
  return app(req, res);
}
