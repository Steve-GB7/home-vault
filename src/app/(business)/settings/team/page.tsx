"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRole } from "@/hooks/useRole";
import {
  inviteBusinessMember,
  revokeInvite,
  getBusinessSettingsData,
} from "@/actions/onboarding";
import {
  Users,
  UserPlus,
  Mail,
  ShieldAlert,
  Clock,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export default function BusinessTeamPage() {
  const router = useRouter();
  const { user } = useRole();

  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [data, setData] = useState<any>(null);

  // Form
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!user?.businessId) return;
    try {
      const res = await getBusinessSettingsData(user.businessId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.businessId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;

    setInviting(true);
    setGeneratedLink(null);
    setCopied(false);

    try {
      const res = await inviteBusinessMember({
        businessId: user.businessId,
        email: email.trim(),
        isAdmin,
      });

      if (res.ok && res.data) {
        setGeneratedLink(res.data.inviteUrl);
        setEmail("");
        toast.success(`Team invite generated for ${res.data.email}!`);
        await loadData();
      } else {
        toast.error(res.error || "Failed to create invite");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      const res = await revokeInvite({ inviteId, kind: "business" });
      if (res.ok) {
        toast.success("Invitation revoked");
        await loadData();
      } else {
        toast.error(res.error || "Failed to revoke invite");
      }
    } catch (err: any) {
      toast.error(err.message || "Error revoking invite");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
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
  if (!data?.isAdmin && !user.isBusinessAdmin) {
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
              Only company administrators can view team management and invite technicians or managers.
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

  const activeInvites = (data?.invites || []).filter(
    (i: any) => i.status === "pending" && new Date(i.expires_at) > new Date()
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 min-w-0">
          {/* Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Company Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Team & Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage authorized technicians, dispatch coordinators, and administrators for {data?.business?.name || user.orgName}
            </p>
          </div>

          {/* Section 1: Invite Form */}
          <Card className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Invite Team Member</h2>
                <p className="text-xs text-slate-500">
                  Generate an invitation link for a new field technician or business admin
                </p>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Staff Work Email
                  </label>
                  <Input
                    id="techEmail"
                    type="email"
                    required
                    placeholder="technician@company.demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Role Privilege
                  </label>
                  <select
                    value={isAdmin ? "admin" : "tech"}
                    onChange={(e) => setIsAdmin(e.target.value === "admin")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="tech">Technician (Tickets & Logs)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={inviting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-xl shadow-md shadow-amber-600/20"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Create Team Invite Link
                  </>
                )}
              </Button>
            </form>

            {/* Link preview & copyable box */}
            {generatedLink && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Shareable Team Join Link Created</span>
                  </div>
                  <p className="text-xs text-amber-800 font-mono truncate max-w-full">
                    {generatedLink}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Invite Link
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* Section 2: Active Team Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Active Team Members ({data?.members?.length || 0})</span>
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {(data?.members || []).map((m: any) => (
                  <div
                    key={m.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                        {m.fullName?.charAt(0) || "T"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {m.fullName}
                          </span>
                          {m.is_admin ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                              Technician
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 truncate block">
                          {m.email}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      Added {m.created_at?.split("T")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Pending Invitations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Team Invitations ({activeInvites.length})</span>
              </h2>
            </div>

            {activeInvites.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
                No pending team invitations.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {activeInvites.map((inv: any) => {
                    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inv.token}`;
                    return (
                      <div
                        key={inv.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {inv.email}
                            </span>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              {inv.is_admin ? "Admin" : "Technician"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            Expires {new Date(inv.expires_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(inviteUrl)}
                            className="text-xs text-slate-700 hover:bg-slate-100"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(inv.id)}
                            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
