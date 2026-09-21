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
  inviteHouseholdMember,
  revokeInvite,
  getHouseholdSettingsData,
} from "@/actions/onboarding";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Clock,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function HouseholdMembersPage() {
  const router = useRouter();
  const { user } = useRole();

  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [data, setData] = useState<any>(null);

  // Form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"adult" | "viewer">("adult");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!user?.householdId) return;
    try {
      const res = await getHouseholdSettingsData(user.householdId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.householdId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.householdId) return;

    setInviting(true);
    setGeneratedLink(null);
    setCopied(false);

    try {
      const res = await inviteHouseholdMember({
        householdId: user.householdId,
        email: email.trim(),
        role,
      });

      if (res.ok && res.data) {
        setGeneratedLink(res.data.inviteUrl);
        setEmail("");
        toast.success(`Invite created for ${res.data.email}!`);
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
      const res = await revokeInvite({ inviteId, kind: "household" });
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
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </main>
        </div>
      </div>
    );
  }

  // Non-owner guard
  if (!data?.isOwner && !user.isHouseholdOwner) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <RoleSwitcherHeader />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Owner Access Required</h2>
            <p className="text-sm text-slate-500 max-w-md mt-2">
              Only household owners can view member settings and issue invitations.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="mt-6 bg-indigo-600 text-white"
            >
              Return to Vault Dashboard
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
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Household Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Members & Invitations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Invite family members to share access to appliances, service requests, and warranty documents
            </p>
          </div>

          {/* Section 1: Invite Form */}
          <Card className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Invite New Member</h2>
                <p className="text-xs text-slate-500">
                  Enter an email address to generate an instant shareable join link
                </p>
              </div>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Member Email
                  </label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    required
                    placeholder="family.member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="adult">Adult (Full Access)</option>
                    <option value="viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={inviting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-md shadow-indigo-600/20"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Create Invitation Link
                  </>
                )}
              </Button>
            </form>

            {/* Link preview & copyable box */}
            {generatedLink && (
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Shareable Invite Link Created</span>
                  </div>
                  <p className="text-xs text-indigo-700 font-mono truncate max-w-full">
                    {generatedLink}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(generatedLink)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-xs"
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

          {/* Section 2: Active Household Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Active Members ({data?.members?.length || 0})</span>
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                        {m.fullName?.charAt(0) || "M"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {m.fullName}
                          </span>
                          {m.member_role === "owner" && (
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                              Owner
                            </Badge>
                          )}
                          {m.member_role === "adult" && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                              Adult
                            </Badge>
                          )}
                          {m.member_role === "viewer" && (
                            <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]">
                              Viewer
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 truncate block">
                          {m.email}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono shrink-0">
                      Joined {m.joined_at?.split("T")[0]}
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
                <span>Pending Invitations ({activeInvites.length})</span>
              </h2>
            </div>

            {activeInvites.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
                No pending invitations right now.
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
                              {inv.invited_role}
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
