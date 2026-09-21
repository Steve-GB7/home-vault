import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log("Downloading small sample mp4 buffer...");
  // Download a tiny valid mp4 file
  const videoBufferRes = await fetch("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", {
    headers: { Range: "bytes=0-100000" } // small chunk or fetch full
  });
  const fullVideoRes = await fetch("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
  const arrayBuffer = await fullVideoRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`Downloaded ${buffer.length} bytes.`);

  const testFilePath = "complaints/ffffffff-0000-0000-0000-000000000001/video.mp4";
  console.log(`Uploading to Supabase Storage: homevault-docs/${testFilePath}...`);
  const { data: uploadData, error: uploadErr } = await admin.storage
    .from("homevault-docs")
    .upload(testFilePath, buffer, {
      contentType: "video/mp4",
      upsert: true,
    });
  console.log("Upload result:", uploadData, "error:", uploadErr);

  console.log("Creating signed URL...");
  const { data: signData, error: signErr } = await admin.storage
    .from("homevault-docs")
    .createSignedUrl(testFilePath, 3600);
  console.log("Sign result:", signData, "error:", signErr);

  if (signData?.signedUrl) {
    console.log("Testing fetch of signedUrl:", signData.signedUrl);
    const res = await fetch(signData.signedUrl);
    console.log(`Status: ${res.status}`);
    console.log(`Headers:`, Object.fromEntries(res.headers.entries()));
  }
}

test().catch(console.error);
