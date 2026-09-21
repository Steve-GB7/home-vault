"use client";

import { useState } from "react";
import { LEGAL_TRANSITIONS, COMPLAINT_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import type { ComplaintStatus } from "@/types/domain";

export interface StatusUpdaterProps {
  complaintId: string;
  currentStatus: ComplaintStatus;
  onStatusChange: (newStatus: ComplaintStatus) => void;
  onRequestLogService?: () => void;
}

export function StatusUpdater({
  complaintId,
  currentStatus,
  onStatusChange,
  onRequestLogService,
}: StatusUpdaterProps) {
  const [loading, setLoading] = useState(false);
  const legalNext = LEGAL_TRANSITIONS[currentStatus] || [];

  const handleUpdate = async (nextStatus: ComplaintStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to update status");
      }

      toast.success(`Ticket moved to ${COMPLAINT_STATUS_LABELS[nextStatus] || nextStatus}`);
      onStatusChange(nextStatus);

      if (nextStatus === "resolved" && onRequestLogService) {
        onRequestLogService();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 mr-1">Move to:</span>
      {legalNext.length > 0 ? (
        legalNext.map((statusKey) => (
          <Button
            key={statusKey}
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleUpdate(statusKey as ComplaintStatus)}
            className="text-xs capitalize font-semibold hover:border-indigo-400 hover:text-indigo-600"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ArrowRight className="w-3 h-3" />
            )}
            <span>{COMPLAINT_STATUS_LABELS[statusKey] || statusKey}</span>
          </Button>
        ))
      ) : (
        <span className="text-xs text-slate-400 font-medium">Terminal state</span>
      )}
    </div>
  );
}
