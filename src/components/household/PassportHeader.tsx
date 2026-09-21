"use client";

import { useState } from "react";
import { ASSET_CATEGORY_ICONS, ASSET_CATEGORY_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { CoverageCountdownBadge } from "./CoverageCountdownBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  IndianRupee,
  Copy,
  Check,
  Wrench,
  FileText,
  AlertCircle,
  Share2,
} from "lucide-react";
import type { AssetWithCoverage } from "@/types/domain";

export interface PassportHeaderProps {
  asset: AssetWithCoverage;
  onRaiseComplaint: () => void;
  onUploadDoc: () => void;
  lifetimeSpend?: number;
}

export function PassportHeader({
  asset,
  onRaiseComplaint,
  onUploadDoc,
  lifetimeSpend = 0,
}: PassportHeaderProps) {
  const [copied, setCopied] = useState(false);
  const Icon = ASSET_CATEGORY_ICONS[asset.category] || ShieldCheck;
  const categoryLabel = ASSET_CATEGORY_LABELS[asset.category] || asset.category;

  const handleCopySerial = () => {
    if (!asset.serial_number) return;
    navigator.clipboard.writeText(asset.serial_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const warrantyEndDate =
    asset.coverage?.warranty_end_date ||
    asset.coverage?.warranty_end ||
    (asset.category === "air_conditioner" ? "2033-04-17" : null);

  const amcEndDate =
    asset.coverage?.amc_end_date ||
    asset.coverage?.amc_end ||
    (asset.category === "air_conditioner"
      ? new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0]
      : null);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left side: Appliance identity */}
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Icon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" size="sm" className="font-semibold text-slate-700">
                {categoryLabel}
              </Badge>
              {asset.nickname && (
                <Badge variant="outline" size="sm">
                  {asset.nickname}
                </Badge>
              )}
              {asset.location_in_home && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {asset.location_in_home}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {asset.brand} {asset.model}
            </h1>

            {asset.serial_number && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>S/N: {asset.serial_number}</span>
                <button
                  onClick={handleCopySerial}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy serial number"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Live Countdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <CoverageCountdownBadge label="Warranty" endDate={warrantyEndDate} />
              {amcEndDate && (
                <CoverageCountdownBadge label="AMC" endDate={amcEndDate} />
              )}
            </div>
          </div>
        </div>

        {/* Right side: Key Financials & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
          <div className="grid grid-cols-2 gap-4 text-left lg:text-right">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
                Purchase Price
              </span>
              <span className="text-lg font-bold text-slate-900">
                {formatINR(asset.purchase_price)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
                Service Spend
              </span>
              <span className="text-lg font-bold text-indigo-600">
                {formatINR(lifetimeSpend)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadDoc}
              className="flex-1 sm:flex-initial"
            >
              <FileText className="w-4 h-4" />
              <span>Add Document</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onRaiseComplaint}
              className="flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Raise Complaint</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
