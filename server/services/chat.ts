import { asc, desc, eq } from "drizzle-orm";
import { conversations, messages } from "../../drizzle/schema.js";
import { getDb } from "../db.js";

export async function listConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
}

export async function getConversationMessages(userId: number, conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  const owned = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId));
  if (!owned.some(row => row.id === conversationId)) throw new Error("Conversation not found");
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt));
}

export async function createConversation(userId: number, input: { title: string; projectId?: number; model?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  const result = await db.insert(conversations).values({ userId, title: input.title, projectId: input.projectId, model: input.model });
  const created = await db.select().from(conversations).where(eq(conversations.id, Number(result[0].insertId))).limit(1);
  return created[0];
}

export async function appendMessage(input: { conversationId: number; role: "system" | "user" | "assistant" | "tool"; content: string; provider?: string; model?: string; inputTokens?: number; outputTokens?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  await db.insert(messages).values(input);
  const created = await db.select().from(messages).where(eq(messages.conversationId, input.conversationId)).orderBy(desc(messages.createdAt)).limit(1);
  return created[0];
}
