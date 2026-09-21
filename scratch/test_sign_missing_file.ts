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
  const { data, error } = await admin.storage
    .from("homevault-docs")
    .createSignedUrl("complaints/test/video.mp4", 3600);

  console.log("createSignedUrl data:", data);
  console.log("createSignedUrl error:", error);

  if (data?.signedUrl) {
    const res = await fetch(data.signedUrl);
    console.log("Fetch signedUrl status:", res.status);
    console.log("Fetch signedUrl text:", await res.text());
  }
}

test();
