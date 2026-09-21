"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-slate-950 border-slate-200 shadow-lg rounded-xl",
          description: "text-slate-500",
          actionButton: "bg-indigo-600 text-white font-medium rounded-lg",
          cancelButton: "bg-slate-100 text-slate-600 font-medium rounded-lg",
        },
      }}
    />
  );
}

export { toast };
