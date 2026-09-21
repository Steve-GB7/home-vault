"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/actions/onboarding";

export function RoleSwitcherHeader() {
  const { user } = useRole();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-bold text-lg tracking-tight">
            <span className="text-[#0f172a]">HOME</span>
            <span className="text-[#0369a1]">VAULT</span>
          </span>
        </Link>

        {/* Right side: Org name + user name + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-xs font-medium text-slate-900 leading-tight">
                {user?.name || "User"}
              </span>
              {user?.orgName && (
                <span className="text-[11px] text-slate-500 leading-tight">
                  {user.orgName}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="Log Out"
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-8 px-2.5 ml-2"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-1 text-xs">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
