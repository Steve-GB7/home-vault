import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seedComplaintVideo() {
  console.log("Fetching flower.mp4...");
  const res = await fetch("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`Downloaded ${buffer.length} bytes.`);

  const complaintId = "ffffffff-0000-0000-0000-000000000001";
  const filePath = `complaints/${complaintId}/evidence.mp4`;

  console.log(`Uploading to bucket homevault-docs: ${filePath}...`);
  const { data: uploadData, error: uploadErr } = await admin.storage
    .from("homevault-docs")
    .upload(filePath, buffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  console.log("Upload result:", uploadData, "error:", uploadErr);

  // Check if complaint_media row already exists
  const { data: existingMedia } = await admin
    .from("complaint_media")
    .select("id")
    .eq("complaint_id", complaintId);

  if (!existingMedia || existingMedia.length === 0) {
    console.log("Inserting complaint_media row in Supabase DB...");
    const { data: inserted, error: insertErr } = await admin
      .from("complaint_media")
      .insert({
        complaint_id: complaintId,
        file_path: filePath,
        file_name: "evidence.mp4",
        mtype: "video",
        mime_type: "video/mp4",
        size_bytes: buffer.length,
        duration_seconds: 5.2,
        caption: "RO Purifier Leakage Evidence Video",
      })
      .select();
    console.log("Inserted complaint_media:", inserted, "error:", insertErr);
  } else {
    console.log("Existing complaint_media row found, updating file_path...");
    const { data: updated, error: updateErr } = await admin
      .from("complaint_media")
      .update({
        file_path: filePath,
        file_name: "evidence.mp4",
        mtype: "video",
        mime_type: "video/mp4",
        size_bytes: buffer.length,
        duration_seconds: 5.2,
      })
      .eq("complaint_id", complaintId)
      .select();
    console.log("Updated complaint_media:", updated, "error:", updateErr);
  }

  // Test createSignedUrl
  console.log("Generating signed URL to verify...");
  const { data: signData, error: signErr } = await admin.storage
    .from("homevault-docs")
    .createSignedUrl(filePath, 3600);

  console.log("Signed URL:", signData?.signedUrl);
  console.log("Signed Error:", signErr);

  if (signData?.signedUrl) {
    const checkRes = await fetch(signData.signedUrl);
    console.log(`Signed URL check status: ${checkRes.status}`);
    console.log(`Content-Type: ${checkRes.headers.get("content-type")}`);
    console.log(`Content-Length: ${checkRes.headers.get("content-length")}`);
  }
}

seedComplaintVideo().catch(console.error);
