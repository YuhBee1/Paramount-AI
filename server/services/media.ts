import { generateImage, listImageModels } from "../_core/imageGeneration";
export async function imageModels() { return listImageModels(); }
export async function createImage(prompt: string, model?: string) { if (prompt.length > 2000) throw new Error("Prompt is too long"); return generateImage({ prompt, model, quality: "medium" }); }
