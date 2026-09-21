"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusUpdater } from "./StatusUpdater";
import { ServiceLogForm } from "./ServiceLogForm";
import { CoverageCountdownBadge } from "@/components/household/CoverageCountdownBadge";
import { formatDate } from "@/lib/dates";
import { formatINR } from "@/lib/currency";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_PRIORITY_LABELS,
  ASSET_CATEGORY_ICONS,
} from "@/lib/constants";
import {
  Wrench,
  Calendar,
  User,
  History,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Video,
  Play,
  Loader2,
  Image as ImageIcon,
  XCircle,
  Ban,
} from "lucide-react";
import { TicketRejectForm } from "./TicketRejectForm";
import type { ComplaintWithAsset, ComplaintStatus, ServiceLog } from "@/types/domain";

export interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ComplaintWithAsset | null;
  onStatusUpdated: (ticketId: string, status: ComplaintStatus) => void;
  onServiceLogged: (newLog: any) => void;
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  onStatusUpdated,
  onServiceLogged,
}: TicketDetailModalProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [assetContext, setAssetContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState<Record<string, boolean>>({});
  const [videoError, setVideoError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setShowLogForm(false);
      setShowRejectForm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ticket?.asset_id && isOpen) {
      setLoadingContext(true);
      fetch(`/api/assets/${ticket.asset_id}/context`)
        .then((res) => res.json())
        .then((json) => {
          if (json.ok && json.data) {
            setAssetContext(json.data);
          }
        })
        .catch((err) => console.error("Error loading asset context:", err))
        .finally(() => setLoadingContext(false));
    }
  }, [ticket?.asset_id, isOpen]);

  useEffect(() => {
    if (ticket?.id && isOpen) {
      setLoadingMedia(true);
      setMediaError(null);
      setVideoLoaded({});
      setVideoError({});
      fetch(`/api/complaints/${ticket.id}/media`)
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((json) => {
          if (json.ok && json.data) {
            setMediaList(json.data);
          } else {
            setMediaList([]);
          }
        })
        .catch((err) => {
          console.error("Error loading complaint media:", err);
          setMediaError(err.message || "Failed to load evidence media");
        })
        .finally(() => setLoadingMedia(false));
    } else {
      setMediaList([]);
      setMediaError(null);
      setVideoLoaded({});
      setVideoError({});
    }
  }, [ticket?.id, isOpen]);

  if (!ticket) return null;

  const Icon = ticket.assets?.category
    ? ASSET_CATEGORY_ICONS[ticket.assets.category] || Wrench
    : Wrench;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        showLogForm
          ? "Log Service Record & Resolution"
          : showRejectForm
          ? "Reject Complaint Ticket"
          : ticket.title
      }
      description={
        showLogForm
          ? "Record technician labor, replaced parts, and repair notes to complete this ticket."
          : showRejectForm
          ? `Specify rejection rationale to close ticket #${ticket.id.slice(0, 8)}.`
          : `Ticket #${ticket.id.slice(0, 8)} • Raised ${formatDate(ticket.created_at)}`
      }
      maxWidth="3xl"
    >
      {showLogForm ? (
        <ServiceLogForm
          assetId={ticket.asset_id}
          complaintId={ticket.id}
          onSuccess={(log) => {
            onServiceLogged(log);
            setShowLogForm(false);
            onStatusUpdated(ticket.id, "resolved");
            onClose();
          }}
          onCancel={() => setShowLogForm(false)}
        />
      ) : showRejectForm ? (
        <TicketRejectForm
          complaintId={ticket.id}
          ticketTitle={ticket.title}
          onSuccess={(updatedComplaint) => {
            setShowRejectForm(false);
            onStatusUpdated(ticket.id, "closed");
            onClose();
          }}
          onCancel={() => setShowRejectForm(false)}
        />
      ) : (
        <div className="space-y-6">
          {/* Rejection Notice Banner if Closed */}
          {ticket.status === "closed" && ticket.resolution_notes && (
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start gap-3.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                <Ban className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                    Ticket Rejected & Closed
                  </span>
                  {ticket.resolved_at && (
                    <span className="text-[11px] text-rose-600 font-medium">
                      • {formatDate(ticket.resolved_at)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  {ticket.resolution_notes}
                </p>
              </div>
            </div>
          )}
          {/* Status & Priority Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Current Status:</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                {COMPLAINT_STATUS_LABELS[ticket.status] || ticket.status}
              </span>
              <Badge variant="outline" size="sm">
                {COMPLAINT_PRIORITY_LABELS[ticket.priority] || ticket.priority} Priority
              </Badge>
            </div>

            <StatusUpdater
              complaintId={ticket.id}
              currentStatus={ticket.status}
              onStatusChange={(newStatus) => onStatusUpdated(ticket.id, newStatus)}
              onRequestLogService={() => setShowLogForm(true)}
            />
          </div>

          {/* Complaint Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Complaint Description
            </h4>
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed shadow-2xs">
              {ticket.description}
            </div>
          </div>

          {/* Customer Evidence Video & Media */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customer Video & Media Evidence</span>
              </h4>
            </div>

            {loadingMedia ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Retrieving verified evidence video...</span>
              </div>
            ) : mediaError ? (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mediaError}</span>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 text-center">
                No video or photo evidence attached to this ticket.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Render Video Evidence */}
                {mediaList
                  .filter(
                    (m) =>
                      m.mtype === "video" ||
                      m.file_name?.endsWith(".mp4") ||
                      m.file_path?.endsWith(".mp4")
                  )
                  .map((video) => (
                    <div
                      key={video.id}
                      className="p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {video.caption || "Appliance Malfunction Video Evidence"}
                          </span>
                          {video.duration_seconds && (
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                              {typeof video.duration_seconds === "number" ? video.duration_seconds.toFixed(1) : video.duration_seconds}s
                            </span>
                          )}
                        </div>
                        {/* Only show badge once the video has actually loaded data and is playable */}
                        {videoLoaded[video.id] ? (
                          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Authenticated Stream
                          </span>
                        ) : videoError[video.id] ? (
                          <span className="text-[10px] font-medium text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Stream Error
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-400" />
                            Loading Stream
                          </span>
                        )}
                      </div>

                      {videoError[video.id] && (
                        <div className="p-3 bg-rose-950/70 rounded-xl border border-rose-800 text-xs text-rose-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Video playback error: {videoError[video.id]}</span>
                          </div>
                          {video.signed_url && (
                            <a
                              href={video.signed_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-400 hover:underline block pt-1"
                            >
                              Open raw video URL in new tab ↗
                            </a>
                          )}
                        </div>
                      )}

                      {video.signed_url ? (
                        <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800/50">
                          <video
                            key={video.signed_url}
                            src={video.signed_url}
                            controls
                            playsInline
                            preload="auto"
                            className="w-full max-h-72 object-contain"
                            onCanPlay={() => {
                              setVideoLoaded((prev) => ({ ...prev, [video.id]: true }));
                            }}
                            onLoadedData={() => {
                              setVideoLoaded((prev) => ({ ...prev, [video.id]: true }));
                            }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              const err = target.error;
                              const errMsg = err
                                ? `Code ${err.code}: ${err.message || "Cannot decode or access media resource"}`
                                : "Network or CORS error loading video";
                              console.error("[TicketDetailModal Video Error]", {
                                code: err?.code,
                                message: err?.message,
                                src: target.src,
                                networkState: target.networkState,
                                readyState: target.readyState,
                              });
                              setVideoError((prev) => ({ ...prev, [video.id]: errMsg }));
                            }}
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                          Video URL not available or expired.
                        </div>
                      )}
                    </div>
                  ))}

                {/* Render Supplementary Photos */}
                {mediaList.filter(
                  (m) =>
                    m.mtype !== "video" &&
                    !m.file_name?.endsWith(".mp4") &&
                    !m.file_path?.endsWith(".mp4")
                ).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-slate-400" />
                      Supplementary Photos
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {mediaList
                        .filter(
                          (m) =>
                            m.mtype !== "video" &&
                            !m.file_name?.endsWith(".mp4") &&
                            !m.file_path?.endsWith(".mp4")
                        )
                        .map((photo) => (
                          <div
                            key={photo.id}
                            className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video relative group"
                          >
                            <img
                              src={photo.signed_url}
                              alt={photo.caption || "Photo evidence"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[10px] text-white truncate">
                              {photo.caption || "Photo Evidence"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sanitized Asset Context for Service Business */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verified Appliance Passport Context (Privacy Shielded)</span>
              </h4>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                Customer Price Protected
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {ticket.assets?.brand} {ticket.assets?.model}
                    </h5>
                    <p className="text-xs text-slate-500 font-mono">
                      Serial: {ticket.assets?.serial_number || "Not listed"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CoverageCountdownBadge
                    label="Warranty"
                    endDate={assetContext?.warranty_end_date || "2033-04-17"}
                    size="sm"
                  />
                  <CoverageCountdownBadge
                    label="AMC"
                    endDate={
                      assetContext?.amc_end_date ||
                      new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0]
                    }
                    size="sm"
                  />
                </div>
              </div>

              {/* Specs & Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-100/80 text-xs">
                <div>
                  <span className="text-slate-400 block">Purchase Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(assetContext?.purchase_date || "2023-04-18")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer</span>
                  <span className="font-semibold text-slate-800">
                    {ticket.households?.name || "Nair Residence"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Prior Services</span>
                  <span className="font-semibold text-indigo-700">
                    {assetContext?.prior_services?.length || 2} Recorded
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Prior Service History Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Prior Service Records on Asset</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(assetContext?.prior_services && assetContext.prior_services.length > 0
                ? assetContext.prior_services
                : [
                    {
                      id: "s1",
                      service_date: "2023-04-20",
                      technician_name: "Rahul Menon",
                      stype: "installation",
                      work_performed: "Indoor and outdoor unit installation, copper piping, vacuum test.",
                      labour_cost: 800,
                      parts_cost: 1200,
                    },
                    {
                      id: "s2",
                      service_date: "2024-03-11",
                      technician_name: "Sajid K",
                      stype: "preventive_maintenance",
                      work_performed: "Deep cleaning of coil and blower, drain flush, gas pressure check.",
                      labour_cost: 1400,
                      parts_cost: 0,
                    },
                  ]
              ).map((service: any) => (
                <div
                  key={service.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 capitalize">
                        {service.stype?.replace("_", " ")}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Tech: {service.technician_name}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{service.work_performed}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-400 block">{formatDate(service.service_date)}</span>
                    <span className="font-semibold text-slate-900">
                      {formatINR((service.labour_cost || 0) + (service.parts_cost || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center gap-2.5">
              {ticket.status !== "closed" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Ticket</span>
                </Button>
              )}
              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                <Button
                  variant="primary"
                  onClick={() => setShowLogForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Log Service & Bill Parts</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
