"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { signUpBusiness } from "@/actions/onboarding";
import { useRole } from "@/hooks/useRole";

const CATEGORIES = [
  { id: "air_conditioner", label: "Air Conditioners" },
  { id: "refrigerator", label: "Refrigerators" },
  { id: "washing_machine", label: "Washing Machines" },
  { id: "television", label: "Televisions" },
  { id: "ro_water_purifier", label: "RO Water Purifiers" },
  { id: "microwave", label: "Microwaves & Ovens" },
];

export default function SignUpBusinessPage() {
  const router = useRouter();
  const { refreshSession } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    businessName: "",
    btype: "service_center" as "brand" | "service_center" | "amc_provider" | "retailer",
    serviceCategories: [] as string[],
    city: "",
    contactPhone: "",
  });

  const toggleCategory = (catId: string) => {
    setForm((prev) => {
      const exists = prev.serviceCategories.includes(catId);
      if (exists) {
        return {
          ...prev,
          serviceCategories: prev.serviceCategories.filter((c) => c !== catId),
        };
      } else {
        return {
          ...prev,
          serviceCategories: [...prev.serviceCategories, catId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.serviceCategories.length === 0) {
      toast.error("Please select at least one supported appliance category");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await signUpBusiness(form);
      if (res.ok && res.redirect) {
        toast.success(`Registered ${form.businessName} successfully!`);
        await refreshSession();
        router.push(res.redirect);
      } else {
        setError(res.error || "Failed to create business account");
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
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to choices</span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Register Service Company
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Create an isolated service desk tenant for your technicians and repair operations
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-6 px-6 rounded-xl border border-slate-200 shadow-xs sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Admin Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. Joseph Thomas"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Admin Work Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@freezefix.demo"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
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
                Company / Center Name
              </label>
              <Input
                id="businessName"
                type="text"
                required
                placeholder="e.g. FreezeFix Repairs"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Business Type
                </label>
                <select
                  id="btype"
                  value={form.btype}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      btype: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0369a1]"
                >
                  <option value="service_center">Authorized Service Center</option>
                  <option value="brand">Brand OEM Service Desk</option>
                  <option value="amc_provider">Independent AMC Provider</option>
                  <option value="retailer">Appliance Retailer Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City / Base Region
                </label>
                <Input
                  id="city"
                  type="text"
                  required
                  placeholder="e.g. Ernakulam"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contact Phone
              </label>
              <Input
                id="contactPhone"
                type="text"
                required
                placeholder="+91-9846-554433"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Supported Appliance Categories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = form.serviceCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                        selected
                          ? "bg-slate-100 border-[#0369a1] text-slate-900 font-semibold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-[#0369a1]" />}
                    </button>
                  );
                })}
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
                  Creating Company Desk...
                </>
              ) : (
                "Register Service Desk & Team"
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
