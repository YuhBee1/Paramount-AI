import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { apiKeys } from "../../drizzle/schema";
import { getDb } from "../db";

function hashKey(value: string) { return createHash("sha256").update(value).digest("hex"); }
export async function createApiKey(userId: number, label: string, scopes: string[]) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  const secret = `pai_${randomBytes(24).toString("base64url")}`;
  await db.insert(apiKeys).values({ userId, label, keyPrefix: secret.slice(0, 12), keyHash: hashKey(secret), scopes });
  return { secret, prefix: secret.slice(0, 12) };
}
export async function listApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: apiKeys.id, label: apiKeys.label, keyPrefix: apiKeys.keyPrefix, scopes: apiKeys.scopes, createdAt: apiKeys.createdAt, lastUsedAt: apiKeys.lastUsedAt, revokedAt: apiKeys.revokedAt }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
}
export async function revokeApiKey(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}
export async function authenticateApiKey(secret: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hashKey(secret))).limit(1);
  const key = result[0];
  if (!key || key.revokedAt || (key.expiresAt && key.expiresAt < new Date())) return undefined;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id));
  return key;
}
