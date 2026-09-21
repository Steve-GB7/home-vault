"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaUploadPreviewProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export function MediaUploadPreview({
  files,
  onChange,
  maxFiles = 3,
}: MediaUploadPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const added = Array.from(newFiles);
    const combined = [...files, ...added].slice(0, maxFiles);
    onChange(combined);
  };

  const handleRemove = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700">
        Photos / Evidence (Optional)
      </label>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
              >
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {files.length < maxFiles && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleAddFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{files.length > 0 ? "Add Another Photo" : "Attach Image"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
