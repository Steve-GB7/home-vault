import { GoogleGenAI } from "@google/genai";

let genaiInstance: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!genaiInstance) {
    genaiInstance = new GoogleGenAI({ apiKey });
  }
  return genaiInstance;
}

export function getModel(): string {
  return process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
}

export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function generateContentWithFallback(prompt: string): Promise<string | null> {
  const gemini = getGemini();
  if (!gemini) return null;

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
  ];

  for (const model of candidateModels) {
    try {
      const resp = await gemini.models.generateContent({
        model,
        contents: prompt,
      });
      if (resp.text) {
        return resp.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} failed (${err.status || err.message}), attempting fallback...`);
    }
  }

  return null;
}
