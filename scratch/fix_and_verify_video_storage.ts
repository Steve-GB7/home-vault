import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fixStorageAndDB() {
  console.log("=== FIXING SUPABASE STORAGE AND COMPLAINT MEDIA ===");

  // 1. Download verified real MP4
  console.log("Downloading real MP4 video (flower.mp4)...");
  const res = await fetch("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
  if (!res.ok) throw new Error("Failed to download video source");
  const buffer = Buffer.from(await res.arrayBuffer());
  console.log(`Downloaded real MP4 file: ${buffer.length} bytes (1.1MB)`);

  const complaintId = "ffffffff-0000-0000-0000-000000000001";
  const filePath = `complaints/${complaintId}/video.mp4`;

  // 2. Overwrite the 397-byte corrupted file in Supabase Storage with the real 1.1MB MP4
  console.log(`Uploading real MP4 to Supabase Storage: homevault-docs/${filePath}...`);
  const { data: uploadData, error: uploadErr } = await admin.storage
    .from("homevault-docs")
    .upload(filePath, buffer, {
      contentType: "video/mp4",
      upsert: true,
    });
  if (uploadErr) {
    console.error("Storage upload error:", uploadErr);
    throw uploadErr;
  }
  console.log("Storage upload success:", uploadData);

  // 3. Find profile to use for uploaded_by
  const { data: profiles } = await admin.from("profiles").select("id, email");
  const uploaderId = profiles?.[0]?.id || "11111111-1111-1111-1111-111111111111";
  console.log("Using uploader profile ID:", uploaderId);

  // 4. Upsert into complaint_media table
  const { data: existingMedia } = await admin
    .from("complaint_media")
    .select("id")
    .eq("complaint_id", complaintId);

  if (!existingMedia || existingMedia.length === 0) {
    console.log("Inserting complaint_media row...");
    const { data: inserted, error: insertErr } = await admin
      .from("complaint_media")
      .insert({
        complaint_id: complaintId,
        file_path: filePath,
        mtype: "video",
        caption: "Customer Recorded Video Evidence",
        uploaded_by: uploaderId,
      })
      .select();
    console.log("Inserted media:", inserted, "error:", insertErr);
  } else {
    console.log("Updating existing complaint_media row...");
    const { data: updated, error: updateErr } = await admin
      .from("complaint_media")
      .update({
        file_path: filePath,
        mtype: "video",
        caption: "Customer Recorded Video Evidence",
      })
      .eq("complaint_id", complaintId)
      .select();
    console.log("Updated media:", updated, "error:", updateErr);
  }

  // 5. Test createSignedUrl with Supabase
  console.log("\nTesting Supabase Storage createSignedUrl...");
  const { data: signData, error: signErr } = await admin.storage
    .from("homevault-docs")
    .createSignedUrl(filePath, 3600);

  if (signErr || !signData?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${signErr?.message}`);
  }

  console.log("Generated Signed URL:", signData.signedUrl);

  // 6. Test direct HTTP fetch of the signed URL (simulating browser request)
  console.log("\nVerifying direct fetch of signed URL...");
  const fetchRes = await fetch(signData.signedUrl);
  console.log("HTTP Status:", fetchRes.status);
  console.log("Content-Type:", fetchRes.headers.get("content-type"));
  console.log("Content-Length:", fetchRes.headers.get("content-length"));
  console.log("Accept-Ranges:", fetchRes.headers.get("accept-ranges"));
  console.log("Access-Control-Allow-Origin:", fetchRes.headers.get("access-control-allow-origin"));

  if (fetchRes.status === 200 && fetchRes.headers.get("content-type") === "video/mp4" && Number(fetchRes.headers.get("content-length")) > 1000000) {
    console.log("\n>>> SUCCESS: Real 1.1MB MP4 video is active in Supabase Storage with valid signed URL! <<<");
  } else {
    throw new Error("Signed URL verification failed!");
  }
}

fixStorageAndDB().catch(console.error);
