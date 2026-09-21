"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { PassportHeader } from "@/components/household/PassportHeader";
import { AssetTimeline } from "@/components/household/AssetTimeline";
import { DocumentVault } from "@/components/household/DocumentVault";
import { NewComplaintForm } from "@/components/household/NewComplaintForm";
import { AssistantFab } from "@/components/ai/AssistantFab";
import { AssistantDrawer } from "@/components/ai/AssistantDrawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Sparkles, Shield, Wrench } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { AssetWithCoverage, Document, TimelineEvent } from "@/types/domain";

export default function AssetPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [asset, setAsset] = useState<AssetWithCoverage | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const fetchAssetData = async () => {
    try {
      const res = await fetch(`/api/assets/${id}`);
      const json = await res.json();
      if (json.ok && json.data) {
        setAsset(json.data.asset);
        setDocuments(json.data.documents || []);
        setTimeline(json.data.timeline || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <RoleSwitcherHeader />
        <div className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <RoleSwitcherHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Shield className="w-12 h-12 text-slate-300 mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Appliance Passport Not Found</h2>
          <Link href="/dashboard" className="mt-4">
            <Button variant="outline">Return to Vault</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lifetimeSpend =
    (asset.spend?.total_service_cost || 0) + (asset.spend?.amc_cost || 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          {/* Breadcrumb / Back button */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Appliance Vault</span>
            </Link>
          </div>

          {/* Passport Header */}
          <PassportHeader
            asset={asset}
            onRaiseComplaint={() => setComplaintModalOpen(true)}
            onUploadDoc={() => setUploadModalOpen(true)}
            lifetimeSpend={lifetimeSpend}
          />

          {/* Tabbed Passport Sections */}
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="bg-slate-100 p-1 rounded-lg border border-slate-200">
              <TabsTrigger value="timeline" className="rounded-md px-4 text-xs font-medium">
                Lifecycle Timeline
              </TabsTrigger>
              <TabsTrigger value="documents" className="rounded-md px-4 text-xs font-medium">
                Documents & Invoices ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-md px-4 text-xs font-medium">
                Appliance Specs
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Provenance & Service History
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tamper-evident record of purchase, warranties, AMC contracts, and technician visits.
                    </p>
                  </div>
                </div>

                <AssetTimeline events={timeline} />
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <DocumentVault
                  documents={documents}
                  onUploadClick={() => setUploadModalOpen(true)}
                />
              </div>
            </TabsContent>

            {/* Technical Specs Tab */}
            <TabsContent value="specs">
              <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Manufacturer Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Brand</span>
                    <span className="font-semibold text-slate-900">{asset.brand}</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Model</span>
                    <span className="font-semibold text-slate-900">{asset.model}</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Category</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {asset.category.replace("_", " ")}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Capacity / Rating</span>
                    <span className="font-semibold text-slate-900">
                      {asset.capacity_spec || "1.5 Ton Dual Inverter 5 Star"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Serial Number</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {asset.serial_number || "311KRPZ4D827"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block">Installation Room</span>
                    <span className="font-semibold text-slate-900">
                      {asset.location_in_home || "Living Room"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Raise Complaint Modal */}
      <Modal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        title="Raise Complaint Ticket"
        description={`Report an issue with ${asset.brand} ${asset.model}`}
      >
        <NewComplaintForm
          asset={asset}
          onSuccess={() => {
            setComplaintModalOpen(false);
            fetchAssetData();
          }}
          onCancel={() => setComplaintModalOpen(false)}
        />
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document to Vault"
        description="Attach an invoice, AMC renewal contract, or service slip."
      >
        <div className="p-6 text-center space-y-4">
          <input
            type="file"
            id="doc-upload-input"
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Document uploaded and saved to appliance vault!");
                setUploadModalOpen(false);
              }}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Floating AI Assistant */}
      <AssistantFab onClick={() => setAiDrawerOpen(true)} />
      <AssistantDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        activeAssetId={asset.id}
      />
    </div>
  );
}
