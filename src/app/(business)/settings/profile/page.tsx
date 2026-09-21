"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRole } from "@/hooks/useRole";
import { getBusinessSettingsData, updateBusinessProfile } from "@/actions/onboarding";
import {
  Building2,
  Check,
  Save,
  Loader2,
  AlertCircle,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
} from "lucide-react";

const CATEGORIES = [
  { id: "air_conditioner", label: "Air Conditioners" },
  { id: "refrigerator", label: "Refrigerators" },
  { id: "washing_machine", label: "Washing Machines" },
  { id: "television", label: "Televisions" },
  { id: "ro_water_purifier", label: "RO Water Purifiers" },
  { id: "microwave", label: "Microwaves & Ovens" },
];

export default function BusinessProfilePage() {
  const router = useRouter();
  const { user, refreshSession } = useRole();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contactPhone: "",
    city: "",
    serviceCategories: [] as string[],
    contactEmail: "",
    btype: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.businessId) return;
      try {
        const res = await getBusinessSettingsData(user.businessId);
        if (res.business) {
          setForm({
            name: res.business.name || "",
            contactPhone: res.business.contact_phone || "",
            city: res.business.city || "",
            serviceCategories: res.business.service_categories || [],
            contactEmail: res.business.contact_email || "",
            btype: res.business.btype || "service_center",
          });
        }
        setIsAdmin(res.isAdmin);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user?.businessId]);

  const toggleCategory = (catId: string) => {
    setForm((prev) => {
      const exists = prev.serviceCategories.includes(catId);
      if (exists) {
        if (prev.serviceCategories.length === 1) return prev;
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
    if (!user?.businessId) return;

    setSaving(true);
    try {
      const res = await updateBusinessProfile(user.businessId, {
        name: form.name,
        contactPhone: form.contactPhone,
        city: form.city,
        serviceCategories: form.serviceCategories,
      });

      if (res.ok) {
        toast.success(res.message || "Company profile updated!");
        await refreshSession();
      } else {
        toast.error(res.error || "Failed to update company profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <RoleSwitcherHeader />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </main>
        </div>
      </div>
    );
  }

  // Non-admin guard
  if (!isAdmin && !user.isBusinessAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <RoleSwitcherHeader />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Access Required</h2>
            <p className="text-sm text-slate-500 max-w-md mt-2">
              Only company administrators can edit organization profile and service categories.
            </p>
            <Button
              onClick={() => router.push("/service-desk")}
              className="mt-6 bg-amber-600 text-white hover:bg-amber-700"
            >
              Return to Service Desk
            </Button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 min-w-0">
          {/* Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Settings & Organization
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Company Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure your service center credentials, phone numbers, and serviced appliance categories
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Business / Center Name
                </label>
                <Input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Company Name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contact Phone
                  </label>
                  <Input
                    type="text"
                    required
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+91-9447-112233"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    City / Service Area
                  </label>
                  <Input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Account Email (Primary)
                  </label>
                  <Input
                    type="text"
                    disabled
                    value={form.contactEmail}
                    className="bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Business Type
                  </label>
                  <Input
                    type="text"
                    disabled
                    value={form.btype.replace("_", " ").toUpperCase()}
                    className="bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Service Categories
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const selected = form.serviceCategories.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                          selected
                            ? "bg-amber-50 border-amber-400 text-amber-900 font-semibold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-xl shadow-md shadow-amber-600/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Company Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
