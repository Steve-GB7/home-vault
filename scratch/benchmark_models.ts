import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.trim().split("="))
);

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

async function benchmark() {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
  ];

  for (const m of models) {
    const start = Date.now();
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: "You are HomeVault AI assistant. The user says: 'how are you'. Respond conversationally in one friendly sentence.",
      });
      console.log(`[SUCCESS] ${m} in ${Date.now() - start}ms: "${res.text?.trim()}"`);
    } catch (err: any) {
      console.log(`[FAILED] ${m} in ${Date.now() - start}ms: code=${err.status || err.code} message=${err.message?.slice(0, 80)}`);
    }
  }
}

benchmark();
