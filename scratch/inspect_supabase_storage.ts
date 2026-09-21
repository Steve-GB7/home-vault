import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function inspectSupabase() {
  console.log("Supabase URL:", SUPABASE_URL);
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Check complaints
  const { data: complaints, error: compErr } = await admin.from("complaints").select("id, ticket_no, title, assigned_business_id");
  console.log("Complaints count:", complaints?.length, "error:", compErr);
  console.log("Complaints:", JSON.stringify(complaints, null, 2));

  // 2. Check complaint_media rows
  const { data: mediaRows, error: mediaErr } = await admin.from("complaint_media").select("*");
  console.log("Complaint media rows count:", mediaRows?.length, "error:", mediaErr);
  console.log("Media rows:", JSON.stringify(mediaRows, null, 2));

  // 3. Check storage buckets
  const { data: buckets, error: bErr } = await admin.storage.listBuckets();
  console.log("Buckets:", buckets, "error:", bErr);

  // 4. Check storage.objects in bucket homevault-docs
  const { data: files, error: filesErr } = await admin.storage.from("homevault-docs").list();
  console.log("Files in homevault-docs root:", files, "error:", filesErr);

  // If there are media rows, test signed URL generation for each
  if (mediaRows && mediaRows.length > 0) {
    for (const item of mediaRows) {
      console.log(`\nTesting signed URL for media item ${item.id}, file_path: "${item.file_path}"`);
      const { data: signData, error: signErr } = await admin.storage.from("homevault-docs").createSignedUrl(item.file_path, 3600);
      console.log("Sign result data:", signData);
      console.log("Sign error:", signErr);
      if (signData?.signedUrl) {
        console.log("Testing fetch of signedUrl:", signData.signedUrl);
        try {
          const res = await fetch(signData.signedUrl);
          console.log(`Fetch signedUrl HTTP status: ${res.status}`);
          console.log(`Content-Type: ${res.headers.get("content-type")}`);
          console.log(`Content-Length: ${res.headers.get("content-length")}`);
          const text = await res.text();
          if (res.status !== 200) {
            console.log("Body:", text);
          }
        } catch (e: any) {
          console.error("Fetch signedUrl error:", e.message);
        }
      }
    }
  }
}

inspectSupabase().catch(console.error);
