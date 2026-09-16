import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { fileVersions, files, projects, storageObjects } from "../../drizzle/schema";
import { getDb } from "../db";
import { storagePut } from "../storage";

export async function listProjectFiles(ownerId: number, projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: files.id, projectId: files.projectId, name: files.name, parentPath: files.parentPath, currentVersion: files.currentVersion, updatedAt: files.updatedAt, mimeType: storageObjects.mimeType, sizeBytes: storageObjects.sizeBytes, contentHash: storageObjects.contentHash }).from(files).innerJoin(storageObjects, eq(files.objectId, storageObjects.id)).where(and(eq(files.projectId, projectId), eq(storageObjects.ownerId, ownerId))).orderBy(desc(files.updatedAt));
}

export async function uploadProjectFile(input: { ownerId: number; projectId: number; name: string; mimeType: string; base64: string; parentPath?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Persistence is unavailable");
  const ownedProject = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, input.projectId), eq(projects.ownerId, input.ownerId))).limit(1);
  if (!ownedProject[0]) throw new Error("Project not found");
  if (!/^[\w .()\-\/]+$/.test(input.name) || input.name.includes("..")) throw new Error("Invalid file name");
  const bytes = Buffer.from(input.base64, "base64");
  if (bytes.length > 10 * 1024 * 1024) throw new Error("File exceeds the 10 MB foundation limit");
  const contentHash = createHash("sha256").update(bytes).digest("hex");
  const objectKey = `users/${input.ownerId}/projects/${input.projectId}/workspace/${input.name}`;
  const stored = await storagePut(objectKey, bytes, input.mimeType);
  const existingObject = await db.select().from(storageObjects).where(eq(storageObjects.contentHash, contentHash)).limit(1);
  const objectId = existingObject[0]?.id ?? Number((await db.insert(storageObjects).values({ contentHash, storageKey: stored.key, sizeBytes: bytes.length, mimeType: input.mimeType, ownerId: input.ownerId, projectId: input.projectId }))[0].insertId);
  const existingFile = await db.select().from(files).where(and(eq(files.projectId, input.projectId), eq(files.name, input.name), eq(files.parentPath, input.parentPath ?? "/"))).limit(1);
  if (existingFile[0]) {
    const nextVersion = existingFile[0].currentVersion + 1;
    await db.update(files).set({ objectId, currentVersion: nextVersion, updatedAt: new Date() }).where(eq(files.id, existingFile[0].id));
    await db.insert(fileVersions).values({ fileId: existingFile[0].id, version: nextVersion, objectId, createdBy: input.ownerId, changeSummary: "Uploaded new file version" });
    return { fileId: existingFile[0].id, version: nextVersion, url: stored.url };
  }
  const created = await db.insert(files).values({ projectId: input.projectId, parentPath: input.parentPath ?? "/", name: input.name, objectId, currentVersion: 1 });
  const fileId = Number(created[0].insertId);
  await db.insert(fileVersions).values({ fileId, version: 1, objectId, createdBy: input.ownerId, changeSummary: "Initial upload" });
  return { fileId, version: 1, url: stored.url };
}
