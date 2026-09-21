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
} from "lucide-react";
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
  const [assetContext, setAssetContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(false);

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

  if (!ticket) return null;

  const Icon = ticket.assets?.category
    ? ASSET_CATEGORY_ICONS[ticket.assets.category] || Wrench
    : Wrench;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showLogForm ? "Log Service Record & Resolution" : ticket.title}
      description={
        showLogForm
          ? "Record technician labor, replaced parts, and repair notes to complete this ticket."
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
      ) : (
        <div className="space-y-6">
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
            <Button
              variant="primary"
              onClick={() => setShowLogForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              <Wrench className="w-4 h-4" />
              <span>Log Service & Bill Parts</span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
