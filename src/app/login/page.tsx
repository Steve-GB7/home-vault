"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { signInUser } from "@/actions/onboarding";

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useRole();
  const [accountType, setAccountType] = useState<"household" | "business">("household");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signInUser({ email, password });
      if (res.ok && res.redirect) {
        toast.success("Signed in successfully");
        await refreshSession();
        router.push(res.redirect);
      } else {
        setError(res.error || "Invalid credentials");
        toast.error(res.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signupUrl = accountType === "household" ? "/signup/household" : "/signup/business";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8 space-y-6 shadow-sm">
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-[#0f172a]">HOME</span>
            <span className="text-[#0369a1]">VAULT</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Appliance passport & service platform</p>
        </div>

        {/* Home / Company Segmented Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setAccountType("household")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              accountType === "household"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setAccountType("business")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              accountType === "business"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Company
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium py-2 rounded-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <Link href={signupUrl} className="font-semibold text-[#0369a1] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
