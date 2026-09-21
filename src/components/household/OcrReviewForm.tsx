"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { ASSET_CATEGORY_LABELS } from "@/lib/constants";
import type { OcrResult } from "@/lib/ocr/schema";

export interface OcrReviewFormProps {
  initialData: OcrResult;
  onConfirm: (formData: Record<string, any>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function OcrReviewForm({
  initialData,
  onConfirm,
  onCancel,
  loading = false,
}: OcrReviewFormProps) {
  const [formData, setFormData] = useState({
    brand: initialData.brand || "",
    model: initialData.model || "",
    serial_number: initialData.serial_number || "",
    category: initialData.category || "",
    nickname: `${initialData.brand || ""} ${initialData.model || ""}`.trim(),
    location_in_home: "",
    purchase_date: initialData.purchase_date || "",
    purchase_price: initialData.purchase_price ? String(initialData.purchase_price) : "",
    seller_name: initialData.seller_name || "",
    warranty_months: initialData.warranty_months ? String(initialData.warranty_months) : "",
    amc_included: initialData.amc_included || false,
  });

  const getConfidenceBadge = (field: string) => {
    const score = initialData.confidence?.[field];
    if (score === undefined) return null;

    if (score >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-2.5 h-2.5" />
          <span>{(score * 100).toFixed(0)}% Match</span>
        </span>
      );
    }
    if (score >= 0.6) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-2.5 h-2.5" />
          <span>{(score * 100).toFixed(0)}% Review</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-2.5 h-2.5" />
        <span>Low Match</span>
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
      warranty_months: formData.warranty_months ? parseInt(formData.warranty_months, 10) : 12,
    });
  };

  const categoryOptions = [
    { value: "", label: "Select category..." },
    ...Object.entries(ASSET_CATEGORY_LABELS).map(([val, label]) => ({
      value: val,
      label,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initialData.brand ? (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
          <strong>Review Extracted Details:</strong> Please check and adjust the invoice details below before committing this appliance to your vault.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Brand */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Brand</label>
            {getConfidenceBadge("brand")}
          </div>
          <Input
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="e.g. LG, Samsung, Sony"
            required
          />
        </div>

        {/* Model */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Model Number</label>
            {getConfidenceBadge("model")}
          </div>
          <Input
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g. PS-Q19YNZE"
            required
          />
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Category</label>
            {getConfidenceBadge("category")}
          </div>
          <Select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            options={categoryOptions}
            required
          />
        </div>

        {/* Serial Number */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Serial Number</label>
            {getConfidenceBadge("serial_number")}
          </div>
          <Input
            value={formData.serial_number}
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            placeholder="e.g. 311KRPZ4D827"
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Nickname / Friendly Label
          </label>
          <Input
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="e.g. Master Bedroom AC"
          />
        </div>

        {/* Location in Home */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Location in Home
          </label>
          <Input
            value={formData.location_in_home}
            onChange={(e) => setFormData({ ...formData, location_in_home: e.target.value })}
            placeholder="e.g. Living Room, Kitchen"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Purchase Date</label>
            {getConfidenceBadge("purchase_date")}
          </div>
          <Input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            required
          />
        </div>

        {/* Purchase Price */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Purchase Price (₹)</label>
            {getConfidenceBadge("purchase_price")}
          </div>
          <Input
            type="number"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
            placeholder="e.g. 42990"
            required
          />
        </div>

        {/* Seller Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-700">Seller / Retailer</label>
            {getConfidenceBadge("seller_name")}
          </div>
          <Input
            value={formData.seller_name}
            onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
            placeholder="e.g. Reliance Digital, Bismi"
          />
        </div>

        {/* Warranty Months */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Warranty Duration (Months)
          </label>
          <Input
            type="number"
            value={formData.warranty_months}
            onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
            placeholder="e.g. 12"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium"
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          <span>Confirm & Register Asset</span>
        </Button>
      </div>
    </form>
  );
}
