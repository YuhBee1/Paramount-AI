import type { Express, Request, Response } from "express";
import { authenticateApiKey } from "./services/apiKeys";
import { availableModels, generateText } from "./services/aiGateway";

const buckets = new Map<string, { started: number; count: number }>();
function withinRateLimit(key: string) { const now = Date.now(); const current = buckets.get(key); if (!current || now - current.started > 60_000) { buckets.set(key, { started: now, count: 1 }); return true; } current.count += 1; return current.count <= 60; }
function bearer(req: Request) { const value = req.header("authorization") ?? ""; return value.startsWith("Bearer ") ? value.slice(7) : ""; }
function allowed(scopes: unknown, required: string) { return Array.isArray(scopes) && (scopes.includes(required) || scopes.includes("*")); }

export function registerPublicApi(app: Express) {
  app.get("/api/v1/models", async (_req, res) => { try { res.json({ data: await availableModels() }); } catch { res.status(502).json({ error: { message: "Model catalog unavailable", type: "gateway_error" } }); } });
  app.post("/api/v1/chat/completions", async (req: Request, res: Response) => {
    const secret = bearer(req); const key = await authenticateApiKey(secret);
    if (!key || !allowed(key.scopes, "chat:write")) return res.status(401).json({ error: { message: "Valid scoped API key required", type: "authentication_error" } });
    if (!withinRateLimit(key.keyPrefix)) return res.status(429).json({ error: { message: "Rate limit exceeded", type: "rate_limit_error" } });
    const body = req.body as { model?: string; messages?: Array<{ role: "system" | "user" | "assistant"; content: string }> };
    if (!Array.isArray(body.messages) || body.messages.length === 0) return res.status(400).json({ error: { message: "messages is required", type: "invalid_request_error" } });
    try { const result = await generateText({ model: body.model, messages: body.messages }); res.json({ id: `chat_${Date.now()}`, object: "chat.completion", model: result.model, choices: [{ index: 0, message: { role: "assistant", content: result.text }, finish_reason: "stop" }], usage: result.usage }); } catch { res.status(502).json({ error: { message: "AI provider request failed", type: "gateway_error" } }); }
  });
}
