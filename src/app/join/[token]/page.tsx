"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Home,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { getInviteDetails, acceptInvite } from "@/actions/onboarding";
import { useRole } from "@/hooks/useRole";

export default function JoinInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const router = useRouter();
  const { user: currentUser, refreshSession } = useRole();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs for accepting user
  const [acceptEmail, setAcceptEmail] = useState("");
  const [acceptName, setAcceptName] = useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await getInviteDetails(token);
        if (res.ok && res.data) {
          setInviteData(res.data);
          setAcceptEmail(res.data.email || "");
          if (currentUser?.email) {
            // Default to current user's info if available
            setAcceptName(currentUser.name);
          }
        } else {
          setError(res.error || "Invite not found or link has expired");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load invite");
      } finally {
        setLoading(false);
      }
    }
    loadInvite();
  }, [token, currentUser]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData) return;

    setAccepting(true);
    setError(null);

    try {
      const emailToUse = acceptEmail.trim().toLowerCase();
      const nameToUse = acceptName.trim() || currentUser?.name || "Invited Member";

      // If user overrides or is accepting as specific email
      const res = await acceptInvite({
        token,
        kind: inviteData.kind,
        userOverrideEmail: emailToUse,
        userOverrideId: currentUser?.id,
        userOverrideName: nameToUse,
      });

      if (res.ok && res.redirect) {
        toast.success(res.message || "Invite accepted successfully!");
        await refreshSession();
        router.push(res.redirect);
      } else {
        setError(res.error || "Failed to accept invite");
        toast.error(res.error || "Failed to accept invite");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Error");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold">Validating invite link...</p>
        </div>
      </div>
    );
  }

  const isHousehold = inviteData?.kind === "household";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">HomeVault</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {error ? "Invitation Status" : "You've Been Invited!"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {error
            ? "There was a problem with this invitation"
            : `Join ${inviteData?.orgName} on HomeVault`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {error ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Unable to Proceed</h3>
                <p className="text-xs text-rose-600 font-medium leading-relaxed">{error}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-xs">
                    Return to Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost" className="w-full text-xs text-slate-500">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleAccept}>
              {/* Organization and inviter banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isHousehold
                    ? "bg-indigo-50/70 border-indigo-100 text-indigo-950"
                    : "bg-amber-50/70 border-amber-100 text-amber-950"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                    isHousehold ? "bg-indigo-600" : "bg-amber-600"
                  }`}
                >
                  {isHousehold ? (
                    <Home className="w-5 h-5" />
                  ) : (
                    <Briefcase className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                    {isHousehold ? "Household Invitation" : "Company Team Invitation"}
                  </span>
                  <h3 className="font-extrabold text-sm truncate">{inviteData.orgName}</h3>
                  <p className="text-xs opacity-80 mt-0.5">
                    Invited by <span className="font-semibold">{inviteData.inviterName}</span>
                  </p>
                </div>
              </div>

              {/* Role badge */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Role Granted</span>
                <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  {isHousehold
                    ? inviteData.invite?.invited_role === "adult"
                      ? "Adult Member (Full Passport Access)"
                      : "Viewer (Read Only)"
                    : inviteData.isAdmin
                    ? "Admin (Full Service Desk & Team Management)"
                    : "Technician (Ticket Resolution Only)"}
                </span>
              </div>

              {/* Invited Email reminder */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Invited Email Address
                </label>
                <Input
                  id="acceptEmail"
                  type="email"
                  required
                  value={acceptEmail}
                  onChange={(e) => setAcceptEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-slate-50 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Must match the recipient email specified in the invitation ({inviteData.email}).
                </p>
              </div>

              {/* Name for the membership */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Display Name
                </label>
                <Input
                  id="acceptName"
                  type="text"
                  required
                  value={acceptName}
                  onChange={(e) => setAcceptName(e.target.value)}
                  placeholder="e.g. Arun Nair or Technician Name"
                />
              </div>

              <Button
                type="submit"
                disabled={accepting}
                className={`w-full font-bold py-2.5 rounded-xl shadow-lg text-white mt-2 ${
                  isHousehold
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                }`}
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting Invitation...
                  </>
                ) : (
                  <>
                    <span>Accept & Join {inviteData.orgName}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
