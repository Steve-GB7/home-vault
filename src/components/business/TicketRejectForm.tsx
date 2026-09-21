"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { AlertTriangle, XCircle, Loader2, ArrowLeft } from "lucide-react";

export interface TicketRejectFormProps {
  complaintId: string;
  ticketTitle: string;
  onSuccess: (updatedComplaint: any) => void;
  onCancel: () => void;
}

const REJECTION_PRESETS = [
  {
    category: "Out of Service Area",
    defaultNote:
      "This household location is outside our authorized service zone radius. Please re-assign to a local neighborhood service center.",
  },
  {
    category: "Brand / Model Not Supported",
    defaultNote:
      "We are not authorized by the manufacturer to service or bill genuine replacement components for this specific brand/model.",
  },
  {
    category: "Warranty / Coverage Void",
    defaultNote:
      "Inspection indicates non-authorized prior tampering or physical damage not covered under active warranty terms.",
  },
  {
    category: "Duplicate Ticket",
    defaultNote:
      "A complaint for the exact same appliance defect has already been raised and is currently being tracked under an earlier ticket.",
  },
  {
    category: "Inconclusive / Insufficient Evidence",
    defaultNote:
      "The uploaded evidence does not demonstrate an active malfunction, or essential serial and diagnostic data could not be verified.",
  },
  {
    category: "Customer Cancelled / Unreachable",
    defaultNote:
      "Technician attempted contact multiple times with no customer response, or the customer requested cancellation.",
  },
  {
    category: "Other Reason",
    defaultNote: "",
  },
];

export function TicketRejectForm({
  complaintId,
  ticketTitle,
  onSuccess,
  onCancel,
}: TicketRejectFormProps) {
  const [selectedPreset, setSelectedPreset] = useState(REJECTION_PRESETS[0].category);
  const [reasonNotes, setReasonNotes] = useState(REJECTION_PRESETS[0].defaultNote);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset: (typeof REJECTION_PRESETS)[0]) => {
    setSelectedPreset(preset.category);
    setReasonNotes(preset.defaultNote);
  };

  const handleConfirmRejection = async () => {
    if (!reasonNotes.trim()) {
      toast.error("Please provide a detailed rejection note explaining the reason.");
      return;
    }

    setLoading(true);
    try {
      const fullReason = `${selectedPreset}: ${reasonNotes.trim()}`;
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          rejection_reason: fullReason,
          resolution_notes: fullReason,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to reject ticket");
      }

      toast.success("Complaint ticket rejected and closed.");
      onSuccess(json.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Box */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <h4 className="font-bold text-rose-900 text-sm">
            Rejecting & Closing Ticket
          </h4>
          <p className="text-rose-700 leading-relaxed">
            This complaint will be permanently transitioned to{" "}
            <span className="font-bold">Closed (Rejected)</span>. The customer
            will receive this rejection explanation on their appliance passport
            timeline.
          </p>
        </div>
      </div>

      {/* Structured Category Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Select Rejection Reason Category
        </label>
        <div className="flex flex-wrap gap-2">
          {REJECTION_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.category;
            return (
              <button
                key={preset.category}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs font-medium px-3 py-2 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-rose-50 border-rose-300 text-rose-900 font-bold ring-2 ring-rose-500/20 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {preset.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Customer-Facing Explanation & Notes <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Editable message</span>
        </div>
        <Textarea
          value={reasonNotes}
          onChange={(e) => setReasonNotes(e.target.value)}
          placeholder="Explain why this service request cannot be fulfilled by your service center..."
          className="min-h-[110px] text-xs leading-relaxed focus:border-rose-400 focus:ring-rose-400/20"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={onCancel} disabled={loading} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket</span>
        </Button>

        <Button
          variant="primary"
          onClick={handleConfirmRejection}
          disabled={loading || !reasonNotes.trim()}
          className="bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>Confirm Rejection & Close Ticket</span>
        </Button>
      </div>
    </div>
  );
}
