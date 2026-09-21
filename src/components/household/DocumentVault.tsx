"use client";

import { formatDate } from "@/lib/dates";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Upload, CheckCircle2, Sparkles } from "lucide-react";
import type { Document } from "@/types/domain";

export interface DocumentVaultProps {
  documents: Document[];
  onUploadClick: () => void;
}

export function DocumentVault({ documents, onUploadClick }: DocumentVaultProps) {
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          Attached Documents ({documents.length})
        </h3>
        <Button size="sm" variant="outline" onClick={onUploadClick}>
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map((doc) => {
            const hasOcr = !!doc.ocr_json;
            const docLabel = DOCUMENT_TYPE_LABELS[doc.doc_type] || doc.doc_type;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <Badge variant="outline" size="sm">
                        {docLabel}
                      </Badge>
                      {hasOcr && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                          <Sparkles className="w-3 h-3" />
                          <span>AI Parsed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h4
                    className="text-sm font-bold text-slate-900 truncate"
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{formatSize(doc.size_bytes)}</span>
                    <span>•</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>

                  <a
                    href={`/api/documents/${doc.id}`}
                    download={doc.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 font-medium">No documents uploaded yet</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-3">
            Store purchase invoices, extended warranties, and service receipts.
          </p>
          <Button size="sm" variant="outline" onClick={onUploadClick}>
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Button>
        </div>
      )}
    </div>
  );
}
