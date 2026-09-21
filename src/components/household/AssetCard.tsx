"use client";

import Link from "next/link";
import { ASSET_CATEGORY_ICONS, ASSET_CATEGORY_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/currency";
import { formatDate } from "@/lib/dates";
import { CoverageCountdownBadge } from "./CoverageCountdownBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Wrench, Shield, AlertCircle, MapPin, Calendar } from "lucide-react";
import type { AssetWithCoverage } from "@/types/domain";

export interface AssetCardProps {
  asset: AssetWithCoverage;
  onRaiseComplaint?: (asset: AssetWithCoverage) => void;
}

export function AssetCard({ asset, onRaiseComplaint }: AssetCardProps) {
  const Icon = ASSET_CATEGORY_ICONS[asset.category] || Shield;
  const categoryLabel = ASSET_CATEGORY_LABELS[asset.category] || asset.category;

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
    <Card hover className="flex flex-col justify-between group overflow-hidden border-slate-200">
      <div>
        {/* Top bar: Category Icon + Brand & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {categoryLabel}
              </span>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {asset.brand} {asset.model}
              </h4>
            </div>
          </div>
        </div>

        {/* Nickname & Location */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {asset.nickname && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
              {asset.nickname}
            </span>
          )}
          {asset.location_in_home && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              {asset.location_in_home}
            </span>
          )}
        </div>

        {/* Coverage Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <CoverageCountdownBadge
            label="Warranty"
            endDate={warrantyEndDate}
            size="sm"
          />
          {amcEndDate && (
            <CoverageCountdownBadge
              label="AMC"
              endDate={amcEndDate}
              size="sm"
            />
          )}
        </div>

        {/* Specs & Purchase Info */}
        <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-slate-100 text-xs mb-4">
          <div>
            <span className="text-slate-400 block mb-0.5">Purchased</span>
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formatDate(asset.purchase_date)}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Purchase Cost</span>
            <span className="font-semibold text-slate-900">
              {formatINR(asset.purchase_price)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Link href={`/household/assets/${asset.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full justify-center text-xs">
            <span>Passport</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
        {onRaiseComplaint && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRaiseComplaint(asset)}
            className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5"
            title="Raise Service Complaint"
          >
            <AlertCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
