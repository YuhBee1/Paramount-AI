import type { AiRequest, ModelCapability } from "./contracts.js";

export interface RoutableModel { name: string; capabilities: ModelCapability[]; priority: number; enabled?: boolean; }

export function selectCapability(request: AiRequest): ModelCapability {
  switch (request.operation) {
    case "TEXT_GENERATION": return "text";
    case "IMAGE_GENERATION": return "image";
    case "VIDEO_GENERATION": return "video";
    case "AUDIO_GENERATION": return "audio";
    case "EMBEDDING": return "embeddings";
    case "CODE_AGENT": return "tools";
    case "TRANSCRIPTION": return "audio";
    case "DOCUMENT_ANALYSIS": return "vision";
  }
}

export function chooseModel(request: AiRequest, models: ReadonlyArray<RoutableModel>): string {
  if (request.model && models.some(model => model.name === request.model && model.enabled !== false)) return request.model;
  const capability = selectCapability(request);
  const candidate = models.filter(model => model.enabled !== false && model.capabilities.includes(capability)).sort((a, b) => a.priority - b.priority)[0];
  if (!candidate) throw new Error(`No enabled model supports ${capability}`);
  return candidate.name;
}

export function calculateCreditCharge(providerCost: number, multiplier: number, minimum = 1): number {
  if (!Number.isFinite(providerCost) || providerCost < 0) throw new Error("providerCost must be a non-negative finite number");
  if (!Number.isFinite(multiplier) || multiplier <= 0) throw new Error("multiplier must be positive");
  return Math.max(minimum, Math.ceil(providerCost * multiplier));
}
