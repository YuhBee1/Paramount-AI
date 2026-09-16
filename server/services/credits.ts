import { and, eq } from "drizzle-orm";
import { creditAccounts, creditLedger } from "../../drizzle/schema";
import { getDb } from "../db";

export async function getCreditBalance(userId: number) {
  const db = await getDb();
  if (!db) return { balance: 0 };
  const rows = await db.select().from(creditAccounts).where(eq(creditAccounts.userId, userId)).limit(1);
  return { balance: rows[0]?.balance ?? 0 };
}
export async function recordCreditEntry(userId: number, input: { type: string; amount: number; idempotencyKey: string; metadata?: unknown }) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  const existing = await db.select().from(creditLedger).where(eq(creditLedger.idempotencyKey, input.idempotencyKey)).limit(1);
  if (existing[0]) return existing[0];
  const accounts = await db.select().from(creditAccounts).where(eq(creditAccounts.userId, userId)).limit(1);
  let accountId = accounts[0]?.id;
  if (!accountId) {
    const created = await db.insert(creditAccounts).values({ userId, balance: 0 });
    accountId = Number(created[0].insertId);
  }
  await db.insert(creditLedger).values({ accountId, entryType: input.type, amount: input.amount, idempotencyKey: input.idempotencyKey, metadata: input.metadata });
  await db.update(creditAccounts).set({ balance: (accounts[0]?.balance ?? 0) + input.amount }).where(eq(creditAccounts.id, accountId));
  const result = await db.select().from(creditLedger).where(eq(creditLedger.idempotencyKey, input.idempotencyKey)).limit(1);
  return result[0];
}
