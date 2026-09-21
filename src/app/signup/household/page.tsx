"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { signUpHousehold } from "@/actions/onboarding";
import { useRole } from "@/hooks/useRole";

export default function SignUpHouseholdPage() {
  const router = useRouter();
  const { refreshSession } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    householdName: "",
    city: "",
    pincode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signUpHousehold(form);
      if (res.ok && res.redirect) {
        toast.success(`Welcome to HomeVault, ${form.fullName}!`);
        await refreshSession();
        router.push(res.redirect);
      } else {
        setError(res.error || "Failed to create household account");
        toast.error(res.error || "Failed to create account");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to choices</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Household Vault
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Register your home to track appliances, warranties & service history
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-6 px-6 rounded-xl border border-slate-200 shadow-xs sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                required
                placeholder="e.g. Ramesh Menon"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="ramesh@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Household Name
              </label>
              <Input
                id="householdName"
                type="text"
                required
                placeholder="e.g. Menon Residence"
                value={form.householdName}
                onChange={(e) => setForm({ ...form, householdName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  type="text"
                  required
                  placeholder="e.g. Kochi"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pincode
                </label>
                <Input
                  id="pincode"
                  type="text"
                  required
                  placeholder="682001"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0369a1] hover:bg-[#0284c7] text-white font-medium py-2 rounded-lg mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Household Account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-[#0369a1] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
