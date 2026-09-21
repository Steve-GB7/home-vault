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
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
