import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { registerPublicApi } from "../server/api";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, _res, next) => {
  const requestedPath = typeof req.query.__path === "string" ? req.query.__path : undefined;
  if (requestedPath) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === "__path") continue;
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== undefined) query.set(key, String(value));
    }
    req.url = `/api${requestedPath}${query.toString() ? `?${query.toString()}` : ""}`;
  }
  next();
});

registerStorageProxy(app);
registerOAuthRoutes(app);
registerPublicApi(app);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export default app;
