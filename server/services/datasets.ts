import { and, desc, eq } from "drizzle-orm";
import { datasets } from "../../drizzle/schema";
import { getDb } from "../db";
export async function listDatasets(ownerId: number) { const db = await getDb(); return db ? db.select().from(datasets).where(eq(datasets.ownerId, ownerId)).orderBy(desc(datasets.updatedAt)) : []; }
export async function createDataset(ownerId: number, input: { name: string; purpose: string }) { const db = await getDb(); if (!db) throw new Error("Persistence is unavailable"); const result = await db.insert(datasets).values({ ownerId, name: input.name, purpose: input.purpose }); const rows = await db.select().from(datasets).where(eq(datasets.id, Number(result[0].insertId))).limit(1); return rows[0]; }
export async function setDatasetConsent(ownerId: number, id: number, consentStatus: "approved" | "rejected" | "withdrawn") { const db = await getDb(); if (!db) throw new Error("Persistence is unavailable"); await db.update(datasets).set({ consentStatus }).where(and(eq(datasets.id, id), eq(datasets.ownerId, ownerId))); return { id, consentStatus }; }
