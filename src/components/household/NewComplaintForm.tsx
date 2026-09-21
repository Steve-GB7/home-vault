"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MediaUploadPreview } from "./MediaUploadPreview";
import { toast } from "@/components/ui/toast";
import { Send, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import type { AssetWithCoverage, Complaint } from "@/types/domain";

export interface NewComplaintFormProps {
  asset?: AssetWithCoverage;
  assets?: AssetWithCoverage[];
  onSuccess?: (complaint: Complaint) => void;
  onCancel?: () => void;
}

interface BusinessOption {
  id: string;
  name: string;
  btype?: string;
  city?: string;
}

interface DuplicateWarning {
  message: string;
  ticketId: string;
  ticketNo?: string;
}

export function NewComplaintForm({
  asset,
  assets = [],
  onSuccess,
  onCancel,
}: NewComplaintFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    asset?.id || ""
  );
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch("/api/businesses");
        const json = await res.json();
        if (json.ok && json.data && json.data.length > 0) {
          setBusinesses(json.data);
        }
      } catch (err) {
        console.error("Failed to load businesses:", err);
      }
    }
    loadBusinesses();
  }, []);

  const handleVideoChange = (file: File | null, duration?: number) => {
    setVideoFile(file);
    setVideoDuration(duration || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateWarning(null);

    if (!selectedAssetId) {
      toast.error("Please select an appliance");
      return;
    }
    if (!selectedBusinessId) {
      toast.error("Please select a service company to assign");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter an issue title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a detailed description of the issue");
      return;
    }
    if (!priority) {
      toast.error("Please select a priority");
      return;
    }
    if (!videoFile) {
      toast.error("A short video of the issue is required to submit a complaint.");
      return;
    }

    setLoading(true);
    try {
      const selectedBiz = businesses.find((b) => b.id === selectedBusinessId);
      const bizName = selectedBiz ? selectedBiz.name : "the service provider";

      // Prepare media payload with verified video first
      const media = [
        {
          mtype: "video",
          mime_type: videoFile.type || "video/mp4",
          file_name: videoFile.name,
          file_size: videoFile.size,
          duration_seconds: videoDuration || 3,
        },
        ...photos.map((p) => ({
          mtype: "image",
          mime_type: p.type || "image/jpeg",
          file_name: p.name,
          file_size: p.size,
        })),
      ];

      const payload = {
        asset_id: selectedAssetId,
        title: title.trim(),
        description: description.trim(),
        priority,
        assigned_business_id: selectedBusinessId,
        media,
        has_video: true,
        media_count: media.length,
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      // Check for duplicate-complaint anti-fraud guard response
      if (json.is_duplicate) {
        setDuplicateWarning({
          message: json.error || "You already raised a similar complaint recently on this asset.",
          ticketId: json.existing_ticket_id,
          ticketNo: json.existing_ticket_no,
        });
        toast.error("Similar complaint detected on this asset within the last hour.");
        return;
      }

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to raise complaint ticket");
      }

      toast.success(`Complaint submitted to ${bizName}!`);
      onSuccess?.(json.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  const assetOptions = [
    { value: "", label: "Select appliance..." },
    ...assets.map((a) => ({
      value: a.id,
      label: `${a.brand} ${a.model} (${a.nickname || a.category})`,
    })),
  ];

  const businessOptions = [
    { value: "", label: "Select company..." },
    ...businesses.map((b) => ({
      value: b.id,
      label: `${b.name}${b.city ? ` (${b.city})` : ""}`,
    })),
  ];

  const priorityOptions = [
    { value: "", label: "Select priority..." },
    { value: "low", label: "Low - Routine query" },
    { value: "medium", label: "Medium - Minor inconvenience" },
    { value: "high", label: "High - Not functioning properly" },
    { value: "urgent", label: "Urgent - Complete breakdown / hazard" },
  ];

  // Button is strictly disabled until: title filled, description filled, and at least one valid video attached
  const isSubmittable =
    !loading &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    videoFile !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Duplicate ticket warning banner */}
      {duplicateWarning && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-900">{duplicateWarning.message}</p>
              <p className="text-amber-700 mt-1">
                Ticket #{duplicateWarning.ticketNo || duplicateWarning.ticketId.slice(0, 8)} was already raised on this appliance within the last 60 minutes.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200/60 flex items-center gap-3">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-1.5 font-semibold text-[#0369a1] hover:underline"
            >
              <span>View Existing Ticket #{duplicateWarning.ticketNo || duplicateWarning.ticketId.slice(0, 8)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Asset Selection */}
      {!asset && assets.length > 0 ? (
        <Select
          label="Appliance"
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          options={assetOptions}
          required
        />
      ) : asset ? (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
          <span className="font-medium text-slate-500">Appliance:</span>
          <span className="font-semibold text-slate-900">
            {asset.brand} {asset.model} ({asset.nickname || asset.category})
          </span>
        </div>
      ) : null}

      {/* Assign to Business */}
      <Select
        label="Assign to Company"
        value={selectedBusinessId}
        onChange={(e) => setSelectedBusinessId(e.target.value)}
        options={businessOptions}
        required
      />

      {/* Title */}
      <Input
        label="Issue Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. AC is not cooling, Refrigerator leaking water"
        required
      />

      {/* Priority */}
      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        options={priorityOptions}
        required
      />

      {/* Description */}
      <Textarea
        label="Detailed Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what happened, error codes displayed, or unusual symptoms..."
        required
      />

      {/* Mandatory Video Evidence & Optional Photos */}
      <MediaUploadPreview
        videoFile={videoFile}
        onVideoChange={handleVideoChange}
        photos={photos}
        onPhotosChange={setPhotos}
      />

      {/* Form buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-[11px] text-slate-400">
          {!videoFile ? (
            <span className="text-amber-600 font-medium">Video evidence is required before submission</span>
          ) : !title.trim() || !description.trim() ? (
            <span>Fill in title and description to submit</span>
          ) : (
            <span className="text-emerald-600 font-medium">Ready to submit</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isSubmittable}
            className="bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                <span>Submit Complaint Ticket</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
