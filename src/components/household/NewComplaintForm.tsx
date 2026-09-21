"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MediaUploadPreview } from "./MediaUploadPreview";
import { toast } from "@/components/ui/toast";
import { Send } from "lucide-react";
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

export function NewComplaintForm({
  asset,
  assets = [],
  onSuccess,
  onCancel,
}: NewComplaintFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    asset?.id || (assets.length > 0 ? assets[0].id : "")
  );
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch("/api/businesses");
        const json = await res.json();
        if (json.ok && json.data && json.data.length > 0) {
          setBusinesses(json.data);
          setSelectedBusinessId(json.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load businesses:", err);
      }
    }
    loadBusinesses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!priority) {
      toast.error("Please select a priority");
      return;
    }

    setLoading(true);
    try {
      const selectedBiz = businesses.find((b) => b.id === selectedBusinessId);
      const bizName = selectedBiz ? selectedBiz.name : "the service provider";

      const payload = {
        asset_id: selectedAssetId,
        title: title.trim(),
        description: description.trim(),
        priority,
        assigned_business_id: selectedBusinessId,
        media_count: files.length,
        has_media: files.length > 0,
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Media Upload */}
      <MediaUploadPreview files={files} onChange={setFiles} />

      {/* Form buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium"
        >
          <Send className="w-4 h-4 mr-1.5" />
          <span>Submit Complaint Ticket</span>
        </Button>
      </div>
    </form>
  );
}
