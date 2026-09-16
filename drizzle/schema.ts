import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "worker", "developer", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  status: mysqlEnum("status", ["active", "archived", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const storageObjects = mysqlTable("storage_objects", {
  id: int("id").autoincrement().primaryKey(),
  contentHash: varchar("contentHash", { length: 128 }).notNull().unique(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  mimeType: varchar("mimeType", { length: 160 }).notNull(),
  ownerId: int("ownerId").notNull(),
  projectId: int("projectId").notNull(),
  retentionState: mysqlEnum("retentionState", ["active", "pending_delete", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  parentPath: varchar("parentPath", { length: 1024 }).default("/").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  objectId: int("objectId").notNull(),
  currentVersion: int("currentVersion").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const fileVersions = mysqlTable("file_versions", {
  id: int("id").autoincrement().primaryKey(),
  fileId: int("fileId").notNull(),
  version: int("version").notNull(),
  objectId: int("objectId").notNull(),
  changeSummary: text("changeSummary"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const providers = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  kind: varchar("kind", { length: 80 }).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  configuration: json("configuration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const models = mysqlTable("models", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  modelType: varchar("modelType", { length: 80 }).notNull(),
  capabilities: json("capabilities").notNull(),
  contextWindow: int("contextWindow"),
  inputPrice: decimal("inputPrice", { precision: 12, scale: 6 }),
  outputPrice: decimal("outputPrice", { precision: 12, scale: 6 }),
  enabled: boolean("enabled").default(false).notNull(),
  priority: int("priority").default(100).notNull(),
  publicAccess: boolean("publicAccess").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  operationType: varchar("operationType", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["queued", "running", "waiting", "completed", "failed", "cancelled", "expired"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  creditCost: int("creditCost"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const creditAccounts = mysqlTable("credit_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balance: int("balance").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const creditLedger = mysqlTable("credit_ledger", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  entryType: varchar("entryType", { length: 50 }).notNull(),
  amount: int("amount").notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 190 }).notNull().unique(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usageRecords = mysqlTable("usage_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId"),
  provider: varchar("provider", { length: 120 }).notNull(),
  model: varchar("model", { length: 160 }).notNull(),
  inputTokens: int("inputTokens").default(0).notNull(),
  outputTokens: int("outputTokens").default(0).notNull(),
  providerCost: decimal("providerCost", { precision: 12, scale: 6 }),
  platformCredits: int("platformCredits").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  action: varchar("action", { length: 120 }).notNull(),
  resourceType: varchar("resourceType", { length: 80 }).notNull(),
  resourceId: varchar("resourceId", { length: 120 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type Model = typeof models.$inferSelect;
