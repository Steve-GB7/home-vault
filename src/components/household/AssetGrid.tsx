"use client";

import { useState, useMemo } from "react";
import { AssetCard } from "./AssetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Layers } from "lucide-react";
import type { AssetWithCoverage } from "@/types/domain";

export interface AssetGridProps {
  assets: AssetWithCoverage[];
  onOpenRegisterModal: () => void;
  onRaiseComplaint: (asset: AssetWithCoverage) => void;
}

export function AssetGrid({
  assets,
  onOpenRegisterModal,
  onRaiseComplaint,
}: AssetGridProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesQuery =
        !query ||
        asset.brand.toLowerCase().includes(query.toLowerCase()) ||
        asset.model.toLowerCase().includes(query.toLowerCase()) ||
        (asset.nickname && asset.nickname.toLowerCase().includes(query.toLowerCase())) ||
        (asset.location_in_home && asset.location_in_home.toLowerCase().includes(query.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" || asset.category === selectedCategory;

      return matchesQuery && matchesCat;
    });
  }, [assets, query, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search appliances by brand, model, room..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
          >
            <option value="all">All Categories</option>
            <option value="air_conditioner">Air Conditioners</option>
            <option value="refrigerator">Refrigerators</option>
            <option value="washing_machine">Washing Machines</option>
            <option value="ro_water_purifier">RO Purifiers</option>
            <option value="television">Televisions</option>
          </select>

          <Button
            onClick={onOpenRegisterModal}
            className="shrink-0 bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Register Appliance</span>
          </Button>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRaiseComplaint={onRaiseComplaint}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl">
          <Layers className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No appliances found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {query || selectedCategory !== "all"
              ? "Try adjusting your search terms or filters."
              : "Register your first appliance using invoice OCR scanning or manual entry."}
          </p>
          <Button onClick={onOpenRegisterModal}>
            <Plus className="w-4 h-4" />
            <span>Register Appliance</span>
          </Button>
        </div>
      )}
    </div>
  );
}
