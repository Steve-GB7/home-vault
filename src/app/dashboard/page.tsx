"use client";

import { useState } from "react";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { AssetGrid } from "@/components/household/AssetGrid";
import { RegisterAssetModal } from "@/components/household/RegisterAssetModal";
import { NewComplaintForm } from "@/components/household/NewComplaintForm";
import { SpendChart } from "@/components/household/SpendChart";
import { AssistantFab } from "@/components/ai/AssistantFab";
import { AssistantDrawer } from "@/components/ai/AssistantDrawer";
import { Modal } from "@/components/ui/modal";
import { useAssets } from "@/hooks/useAssets";
import { useRole } from "@/hooks/useRole";
import { formatINR } from "@/lib/currency";
import { ShieldCheck, Layers, Wrench, IndianRupee, Sparkles } from "lucide-react";
import type { AssetWithCoverage } from "@/types/domain";

export default function HouseholdDashboard() {
  const { user } = useRole();
  const { assets, loading, refreshAssets, setAssets } = useAssets();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [complaintAsset, setComplaintAsset] = useState<AssetWithCoverage | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // Compute vault stats
  const totalAssets = assets.length;
  const totalPurchaseValue = assets.reduce(
    (sum, a) => sum + (Number(a.purchase_price) || 0),
    0
  );
  const totalServiceSpend = assets.reduce(
    (sum, a) => sum + (Number(a.spend?.total_service_cost) || 0),
    0
  );

  // Spend chart data over years
  const chartData = [
    { year: "2022", purchase: 33500, service: 0 },
    { year: "2023", purchase: 42990, service: 2000 },
    { year: "2024", purchase: 17900, service: 3350 },
    { year: "2025", purchase: 0, service: 1500 },
    { year: "2026 (YTD)", purchase: 0, service: totalServiceSpend > 6850 ? totalServiceSpend - 6850 : 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {user?.orgName || "Household Vault"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {totalAssets === 0
                  ? "Zero appliances registered yet. Click 'Register Appliance' to add your first asset."
                  : `Tracking ${totalAssets} ${totalAssets === 1 ? "appliance" : "appliances"} with active warranties, maintenance contracts, and digital passports.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0369a1]" />
                <span>Ask AI Vault</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <span className="text-xs font-medium text-slate-500">
                Registered Appliances
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{totalAssets}</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <span className="text-xs font-medium text-slate-500">
                Active Coverages
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{totalAssets > 0 ? "3 Active" : "0 Active"}</span>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <span className="text-xs font-medium text-slate-500">
                Vault Asset Value
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {formatINR(totalPurchaseValue)}
                </span>
                <IndianRupee className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <span className="text-xs font-medium text-slate-500">
                Lifetime Maintenance
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {formatINR(totalServiceSpend)}
                </span>
                <Wrench className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Appliances Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Registered Appliances</h2>
                <p className="text-xs text-slate-500">
                  Click any appliance passport to view its timeline, documents, and coverage details.
                </p>
              </div>
            </div>

            <AssetGrid
              assets={assets}
              onOpenRegisterModal={() => setRegisterOpen(true)}
              onRaiseComplaint={(asset) => setComplaintAsset(asset)}
            />
          </section>

          {/* Spending Analysis Chart */}
          <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Appliance Portfolio Spend Over Time</h2>
              <p className="text-xs text-slate-500">
                Comparison of initial capital expenditure against ongoing maintenance & AMC investments.
              </p>
            </div>
            <SpendChart data={chartData} />
          </section>
        </main>
      </div>

      {/* Register Asset Modal */}
      <RegisterAssetModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onAssetCreated={(newAsset) => {
          setAssets((prev) => [newAsset, ...prev]);
        }}
      />

      {/* Raise Complaint Modal */}
      <Modal
        isOpen={!!complaintAsset}
        onClose={() => setComplaintAsset(null)}
        title="Raise Service Complaint Ticket"
        description={
          complaintAsset
            ? `Reporting issue on ${complaintAsset.brand} ${complaintAsset.model}`
            : "Report appliance breakdown or request maintenance"
        }
        maxWidth="lg"
      >
        {complaintAsset && (
          <NewComplaintForm
            asset={complaintAsset}
            onSuccess={() => {
              setComplaintAsset(null);
            }}
            onCancel={() => setComplaintAsset(null)}
          />
        )}
      </Modal>

      {/* Floating AI Assistant Trigger & Drawer */}
      <AssistantFab onClick={() => setAiDrawerOpen(true)} />
      <AssistantDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
}
