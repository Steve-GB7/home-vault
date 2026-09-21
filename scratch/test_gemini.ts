import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

async function testGemini() {
  const apiKey = env.GEMINI_API_KEY;
  const modelName = env.GEMINI_MODEL || "gemini-2.0-flash";

  console.log("Testing Gemini API with key:", apiKey?.slice(0, 10) + "...", "model:", modelName);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello! Confirm you are working as the HomeVault assistant.",
    });

    console.log("Gemini API Response Success!");
    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("Gemini API Error:", err.message);
    if (err.status) console.error("Status:", err.status);
    if (err.errorDetails) console.error("Details:", err.errorDetails);
  }
}

testGemini();
