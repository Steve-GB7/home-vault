"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceOcrUploader } from "./InvoiceOcrUploader";
import { OcrReviewForm } from "./OcrReviewForm";
import { toast } from "@/components/ui/toast";
import type { OcrResult } from "@/lib/ocr/schema";
import type { AssetWithCoverage } from "@/types/domain";

export interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetCreated: (newAsset: AssetWithCoverage) => void;
}

export function RegisterAssetModal({
  isOpen,
  onClose,
  onAssetCreated,
}: RegisterAssetModalProps) {
  const [extractedOcr, setExtractedOcr] = useState<OcrResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("ocr");

  const handleOcrExtracted = (result: OcrResult, file: File) => {
    setExtractedOcr(result);
    setUploadedFile(file);
  };

  const handleReset = () => {
    setExtractedOcr(null);
    setUploadedFile(null);
    onClose();
  };

  const handleSaveAsset = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to register appliance");
      }

      toast.success(`${formData.brand} ${formData.model} registered successfully!`);
      onAssetCreated(json.data);
      handleReset();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save appliance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Register Appliance"
      description="Add a new appliance to your household vault with warranty tracking and documents."
      maxWidth="2xl"
    >
      {extractedOcr ? (
        <OcrReviewForm
          initialData={extractedOcr}
          onConfirm={handleSaveAsset}
          onCancel={() => setExtractedOcr(null)}
          loading={loading}
        />
      ) : (
        <Tabs defaultValue="ocr" value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="ocr">AI Warranty Card</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="ocr" className="pt-2">
            <InvoiceOcrUploader onOcrExtracted={handleOcrExtracted} />
          </TabsContent>

          <TabsContent value="manual" className="pt-2">
            <OcrReviewForm
              initialData={{
                brand: "",
                model: "",
                serial_number: "",
                category: "" as any,
                purchase_date: "",
                purchase_price: null as any,
                currency: "INR",
                seller_name: "",
                warranty_months: null as any,
                extended_warranty_months: null,
                amc_included: false,
                line_items: [],
                confidence: {},
              }}
              onConfirm={handleSaveAsset}
              onCancel={handleReset}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      )}
    </Modal>
  );
}
