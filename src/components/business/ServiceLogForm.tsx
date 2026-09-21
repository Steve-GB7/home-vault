"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, Wrench, IndianRupee, CheckCircle2 } from "lucide-react";
import type { PartRow, ServiceType } from "@/types/domain";

export interface ServiceLogFormProps {
  assetId: string;
  complaintId?: string;
  businessId?: string;
  onSuccess: (newLog: any) => void;
  onCancel?: () => void;
}

export function ServiceLogForm({
  assetId,
  complaintId,
  businessId,
  onSuccess,
  onCancel,
}: ServiceLogFormProps) {
  const [technicianName, setTechnicianName] = useState("Rahul Menon");
  const [serviceType, setServiceType] = useState<ServiceType>("repair");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workPerformed, setWorkPerformed] = useState(
    "Inspected refrigerant pressure, found leak at flare nut connection. Repaired flare joint, vacuum tested, and topped up R32 refrigerant. Checked compressor current draw and confirmed cooling delta at 11°C."
  );
  const [parts, setParts] = useState<PartRow[]>([
    { part: "R32 Refrigerant Gas 800g", qty: 1, cost: 1900 },
  ]);
  const [labourCost, setLabourCost] = useState<number>(1800);
  const [coveredByWarranty, setCoveredByWarranty] = useState(false);
  const [nextServiceDate, setNextServiceDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.cost) || 0) * (Number(p.qty) || 1), 0);
  const grandTotal = (Number(labourCost) || 0) + partsTotal;

  const handleAddPart = () => {
    setParts([...parts, { part: "", qty: 1, cost: 0 }]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleUpdatePart = (index: number, field: keyof PartRow, val: any) => {
    const next = [...parts];
    next[index] = { ...next[index], [field]: val };
    setParts(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workPerformed.trim()) {
      toast.error("Please enter details of work performed.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        asset_id: assetId,
        complaint_id: complaintId || null,
        technician_name: technicianName,
        stype: serviceType,
        service_date: serviceDate,
        work_performed: workPerformed,
        parts_replaced: parts,
        labour_cost: labourCost,
        parts_cost: partsTotal,
        covered_by_warranty: coveredByWarranty,
        next_service_date: nextServiceDate || null,
      };

      const res = await fetch("/api/service-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to log service record");
      }

      toast.success(
        `Service logged! ${formatINR(grandTotal)} added to asset service history.`
      );
      onSuccess(json.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to record service log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Technician Name */}
        <Input
          label="Technician Name"
          value={technicianName}
          onChange={(e) => setTechnicianName(e.target.value)}
          required
        />

        {/* Service Type */}
        <Select
          label="Service Type"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value as ServiceType)}
          options={[
            { value: "repair", label: "Breakdown Repair" },
            { value: "preventive_maintenance", label: "Preventive Maintenance" },
            { value: "installation", label: "Installation / Setup" },
            { value: "amc_visit", label: "Scheduled AMC Visit" },
            { value: "inspection", label: "Inspection & Diagnosis" },
          ]}
        />

        {/* Service Date */}
        <Input
          type="date"
          label="Service Date"
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          required
        />

        {/* Next Service Due */}
        <Input
          type="date"
          label="Next Service Due (Optional)"
          value={nextServiceDate}
          onChange={(e) => setNextServiceDate(e.target.value)}
        />
      </div>

      {/* Work Performed */}
      <Textarea
        label="Work Performed & Diagnostic Notes"
        rows={3}
        value={workPerformed}
        onChange={(e) => setWorkPerformed(e.target.value)}
        placeholder="Detailed breakdown of symptoms found, corrective action taken, and test results..."
        required
      />

      {/* Parts Replaced Table */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            Parts Replaced / Materials Used
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddPart}
            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Part</span>
          </Button>
        </div>

        {parts.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              placeholder="Part name / description"
              value={item.part}
              onChange={(e) => handleUpdatePart(idx, "part", e.target.value)}
              className="flex-3"
            />
            <Input
              type="number"
              placeholder="Qty"
              value={item.qty}
              onChange={(e) =>
                handleUpdatePart(idx, "qty", parseInt(e.target.value, 10) || 1)
              }
              className="w-16"
            />
            <Input
              type="number"
              placeholder="Cost (₹)"
              value={item.cost}
              onChange={(e) =>
                handleUpdatePart(idx, "cost", parseFloat(e.target.value) || 0)
              }
              className="w-24"
            />
            <button
              type="button"
              onClick={() => handleRemovePart(idx)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Labour Charges (₹)"
            value={labourCost}
            onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Parts Cost (₹)
            </label>
            <div className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-800">
              {formatINR(partsTotal)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
          <span>Total Billable Amount:</span>
          <span className="text-base text-indigo-600 font-extrabold">
            {formatINR(grandTotal)}
          </span>
        </div>
      </div>

      {/* Covered by Warranty Checkbox */}
      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={coveredByWarranty}
          onChange={(e) => setCoveredByWarranty(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>Waive charges under manufacturer warranty / active AMC</span>
      </label>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="shadow-md shadow-indigo-600/20"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Service Record & Complete</span>
        </Button>
      </div>
    </form>
  );
}
