import { invokeLLM, listLLMModels } from "../_core/llm";
import type { AiRequest } from "../domain/contracts";

export async function availableModels() {
  const response = await listLLMModels();
  return response.data.map((model: any) => ({ id: model.id, name: model.name ?? model.id, contextWindow: model.context_window ?? null, capabilities: model.capabilities ?? {} }));
}

export async function generateText(input: { messages: Array<{ role: "system" | "user" | "assistant"; content: string }>; model?: string }) {
  const catalog = await availableModels();
  const selected = input.model && catalog.some(model => model.id === input.model) ? input.model : catalog[0]?.id;
  const response = await invokeLLM({ model: selected, messages: input.messages });
  const content = response.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((part: any) => part.text ?? "").join("") : "";
  return { text, model: selected ?? "managed-default", usage: response.usage ?? null };
}
