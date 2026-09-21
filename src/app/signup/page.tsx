"use client";

import Link from "next/link";
import { Home, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpChoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            <span className="text-[#0f172a]">HOME</span>
            <span className="text-[#0369a1]">VAULT</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Already have an account?</span>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs border-slate-200">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center items-center w-full">
        <div className="text-center max-w-lg mx-auto mb-8 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-slate-500 text-sm">
            Select how you would like to use HomeVault.
          </p>
        </div>

        {/* Two Clean Cards */}
        <div className="grid md:grid-cols-2 gap-4 w-full">
          {/* Card 1: Homeowner */}
          <Link
            href="/signup/household"
            className="bg-white border border-slate-200 hover:border-[#0369a1] rounded-xl p-6 transition-all flex flex-col justify-between hover:shadow-xs group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#0369a1]/10 group-hover:text-[#0369a1] transition-colors">
                <Home className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-[#0369a1] transition-colors">
                  Household
                </h2>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  For homeowners and families. Register appliances, track warranties and service history, and raise repair tickets.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0369a1]">
              <span>Sign up as Household</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Service Provider */}
          <Link
            href="/signup/business"
            className="bg-white border border-slate-200 hover:border-[#0369a1] rounded-xl p-6 transition-all flex flex-col justify-between hover:shadow-xs group"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#0369a1]/10 group-hover:text-[#0369a1] transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-[#0369a1] transition-colors">
                  Service Company
                </h2>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  For authorized service centers, repair technicians, and warranty providers to manage tickets and log repairs.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0369a1]">
              <span>Sign up as Company</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        HomeVault • Appliance Lifecycle Management
      </footer>
    </div>
  );
}
