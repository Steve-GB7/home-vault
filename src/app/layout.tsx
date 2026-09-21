import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeVault — Digital Home Asset Passport",
  description:
    "Cross-brand household appliance lifecycle platform. Track warranties, AMC, service history, and complaints with privacy-shielded service desk.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <RoleProvider>
          {children}
          <Toaster />
        </RoleProvider>
      </body>
    </html>
  );
}
