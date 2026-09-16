import { desc, eq } from "drizzle-orm";
import { featureFlags, models, providers } from "../../drizzle/schema.js";
import { getDb } from "../db.js";

export async function listProviders() { const db = await getDb(); return db ? db.select().from(providers).orderBy(desc(providers.createdAt)) : []; }
export async function listModels() { const db = await getDb(); return db ? db.select().from(models).orderBy(models.priority) : []; }
export async function listFeatureFlags() { const db = await getDb(); return db ? db.select().from(featureFlags).orderBy(featureFlags.flag) : []; }
export async function setFeatureFlag(flag: string, enabled: boolean) { const db = await getDb(); if (!db) throw new Error("Persistence is unavailable"); await db.update(featureFlags).set({ enabled }).where(eq(featureFlags.flag, flag)); return { flag, enabled }; }
