"use client";

import { useState, useRef } from "react";
import { Video, Image as ImageIcon, X, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MediaUploadPreviewProps {
  videoFile: File | null;
  onVideoChange: (file: File | null, duration?: number) => void;
  photos?: File[];
  onPhotosChange?: (photos: File[]) => void;
  maxPhotos?: number;
}

const MIN_VIDEO_SIZE = 200 * 1024; // 200 KB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MIN_VIDEO_DURATION = 3; // 3 seconds

export function MediaUploadPreview({
  videoFile,
  onVideoChange,
  photos = [],
  onPhotosChange,
  maxPhotos = 3,
}: MediaUploadPreviewProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [validatingVideo, setValidatingVideo] = useState(false);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. MIME type validation
    if (!file.type.startsWith("video/")) {
      setVideoError("Please select a valid video file (MP4, WebM, MOV, etc.).");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // 2. Minimum file size validation (200KB)
    if (file.size < MIN_VIDEO_SIZE) {
      setVideoError("Video file is too small (minimum 200KB). Please upload a valid video showing the issue.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // 3. Maximum file size validation (50MB)
    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError("Video file exceeds the 50MB size limit.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // 4. Video duration validation (minimum 3 seconds)
    setValidatingVideo(true);
    try {
      const duration = await readVideoDuration(file);
      if (duration < MIN_VIDEO_DURATION) {
        setVideoError("Video is too short — please record at least 3 seconds showing the issue.");
        if (videoInputRef.current) videoInputRef.current.value = "";
        return;
      }

      setVideoDuration(duration);
      onVideoChange(file, duration);
    } catch {
      setVideoError("Unable to verify video duration. Please ensure the file is an uncorrupted video recording.");
      if (videoInputRef.current) videoInputRef.current.value = "";
    } finally {
      setValidatingVideo(false);
    }
  };

  const readVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        // Handle edge case where duration is Infinite (e.g. some webm streams)
        if (!isFinite(video.duration) || isNaN(video.duration)) {
          // If duration is not finite, fallback to 3+ seconds if file is valid
          resolve(3);
        } else {
          resolve(video.duration);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Video read failed"));
      };
    });
  };

  const handleRemoveVideo = () => {
    onVideoChange(null);
    setVideoDuration(null);
    setVideoError(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleAddPhotos = (newFiles: FileList | null) => {
    if (!newFiles || !onPhotosChange) return;
    const added = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const combined = [...photos, ...added].slice(0, maxPhotos);
    onPhotosChange(combined);
  };

  const handleRemovePhoto = (index: number) => {
    if (!onPhotosChange) return;
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: MANDATORY VIDEO EVIDENCE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-800">
            Video Evidence <span className="text-rose-600 font-bold">*Required</span>
          </label>
          <span className="text-[11px] text-slate-400">Min 3s, under 50MB</span>
        </div>

        {/* Video validation error */}
        {videoError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{videoError}</span>
          </div>
        )}

        {/* Empty state: Notice when no video is attached */}
        {!videoFile && !videoError && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">A short video of the issue is required to submit a complaint.</p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Record a brief 3+ second video showing the appliance malfunction, leaking, or error display.
              </p>
            </div>
          </div>
        )}

        {/* Video Card if attached */}
        {videoFile ? (
          <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {videoFile.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Video
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{formatFileSize(videoFile.size)}</span>
                  {videoDuration !== null && (
                    <>
                      <span>•</span>
                      <span>Duration: {formatDuration(videoDuration)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveVideo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
              title="Remove video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={validatingVideo}
              onClick={() => videoInputRef.current?.click()}
              className="w-full justify-center border-dashed border-slate-300 hover:border-[#0369a1] text-xs h-10"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-[#0369a1]" />
              <span>{validatingVideo ? "Checking video duration..." : "Attach Video Evidence (Required)"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* SECTION 2: OPTIONAL PHOTO EVIDENCE */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700">
            Additional Photos <span className="text-slate-400 font-normal">(Optional Supplementary)</span>
          </label>
          <span className="text-[11px] text-slate-400">Max {maxPhotos} images</span>
        </div>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {photos.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {photos.length < maxPhotos && (
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleAddPhotos(e.target.files)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
              className="text-xs text-slate-600 hover:text-slate-900 h-8 px-2"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>{photos.length > 0 ? "Add Another Photo" : "+ Attach Supporting Photo"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
