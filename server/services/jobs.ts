import { desc, and, eq } from "drizzle-orm";
import { jobs } from "../../drizzle/schema";
import { getDb } from "../db";

export async function listJobs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}
export async function enqueueJob(input: { userId: number; projectId?: number; operationType: string; creditCost?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  const result = await db.insert(jobs).values(input);
  const created = await db.select().from(jobs).where(eq(jobs.id, Number(result[0].insertId))).limit(1);
  return created[0];
}
export async function cancelJob(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  await db.update(jobs).set({ status: "cancelled", completedAt: new Date() }).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
}
