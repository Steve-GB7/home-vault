"use client";

import { useState, useEffect } from "react";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { NewComplaintForm } from "@/components/household/NewComplaintForm";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/dates";
import { COMPLAINT_STATUS_LABELS, COMPLAINT_PRIORITY_LABELS } from "@/lib/constants";
import { useAssets } from "@/hooks/useAssets";
import { Plus, CheckCircle2, Wrench } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import type { ComplaintWithAsset } from "@/types/domain";

export default function ComplaintsPage() {
  const { user } = useRole();
  const { assets } = useAssets();
  const [complaints, setComplaints] = useState<ComplaintWithAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const url = user?.householdId
        ? `/api/complaints?household_id=${user.householdId}`
        : "/api/complaints";
      const res = await fetch(url);
      const json = await res.json();
      if (json.ok && json.data) {
        setComplaints(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user?.householdId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Household Complaints
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track tickets dispatched to maintenance providers and certified repair centers.
              </p>
            </div>

            <Button
              onClick={() => setNewModalOpen(true)}
              className="bg-[#0369a1] hover:bg-[#0284c7] text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Raise Complaint</span>
            </Button>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {complaints.length > 0 ? (
              complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-lg border border-slate-200 p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {COMPLAINT_STATUS_LABELS[c.status] || c.status}
                      </span>
                      <Badge variant="outline" size="sm">
                        {COMPLAINT_PRIORITY_LABELS[c.priority] || c.priority}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        Ticket #{c.ticket_no || c.id.slice(0, 8)}
                      </span>
                    </div>

                    <time className="text-xs text-slate-400">
                      Raised {relativeTime(c.created_at)}
                    </time>
                  </div>

                  <h2 className="text-base font-semibold text-slate-900">{c.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Appliance: {c.assets?.brand} {c.assets?.model} ({c.assets?.nickname || c.assets?.category})
                      </span>
                    </div>

                    <div className="text-slate-700 font-medium">
                      Assigned: {c.businesses?.name || "Service Provider"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h2 className="font-semibold text-sm text-slate-800">No active complaints</h2>
                <p className="text-xs text-slate-500 mt-1">
                  All your appliances are running smoothly with no unresolved tickets.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Complaint Modal */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Raise Service Complaint"
        description="Submit a service request to your assigned maintenance center"
      >
        <NewComplaintForm
          assets={assets}
          onSuccess={() => {
            setNewModalOpen(false);
            fetchComplaints();
          }}
          onCancel={() => setNewModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
