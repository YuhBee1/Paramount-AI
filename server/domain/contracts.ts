export type OperationType =
  | "TEXT_GENERATION"
  | "IMAGE_GENERATION"
  | "VIDEO_GENERATION"
  | "AUDIO_GENERATION"
  | "CODE_AGENT"
  | "EMBEDDING"
  | "TRANSCRIPTION"
  | "DOCUMENT_ANALYSIS";

export type ModelCapability = "text" | "streaming" | "vision" | "image" | "audio" | "video" | "embeddings" | "tools";

export interface AiRequest { operation: OperationType; model?: string; input: unknown; projectId?: number; }
export interface AiUsage { inputTokens?: number; outputTokens?: number; mediaUnits?: number; providerCost?: number; }
export interface AiResponse { output: unknown; usage?: AiUsage; providerRequestId?: string; }

export interface AiProvider {
  readonly name: string;
  supports(capability: ModelCapability): boolean;
  generate(request: AiRequest): Promise<AiResponse>;
  stream?(request: AiRequest): AsyncIterable<unknown>;
}

export interface ModelRouter { select(request: AiRequest, available: ReadonlyArray<{ name: string; capabilities: ModelCapability[]; priority: number }>): string; }

export interface StorageObject { hash: string; size: number; mimeType: string; ownerId: number; projectId: number; key: string; }
export interface StorageService {
  putObject(input: { ownerId: number; projectId: number; bytes: Uint8Array; mimeType: string }): Promise<StorageObject>;
  getObject(object: StorageObject): Promise<Uint8Array>;
  deleteObject(object: StorageObject): Promise<void>;
  createSnapshot(projectId: number, label?: string): Promise<{ id: string; projectId: number }>;
  restoreSnapshot(snapshotId: string, projectId: number): Promise<void>;
}

export interface CreditService {
  quote(operation: OperationType, model: string): Promise<{ credits: number; currency: string }>;
  reserve(accountId: number, amount: number, idempotencyKey: string): Promise<void>;
  commit(accountId: number, amount: number, idempotencyKey: string): Promise<void>;
  release(accountId: number, amount: number, idempotencyKey: string): Promise<void>;
}

export type JobStatus = "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled" | "expired";
export interface AiJob { id: string; userId: number; projectId?: number; operation: OperationType; status: JobStatus; progress: number; creditCost?: number; }
export interface JobService { enqueue(job: Omit<AiJob, "id" | "status" | "progress">): Promise<AiJob>; cancel(jobId: string, userId: number): Promise<void>; }
