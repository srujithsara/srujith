import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Info,
  Link2,
  MousePointerClick,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  User,
  Wallet,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { EarningsChart } from "../components/earn/EarningsChart";
import {
  ApplyCampaignModal,
  BountySubmitModal,
  SubmitWorkModal,
  WithdrawModal,
} from "../components/earn/CreatorEarnModals";
import { BrandStudioPanel } from "../components/earn/BrandStudioPanel";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { sanitizeExternalUrl } from "../utils/urlValidation";
import type {
  BountyChallenge,
  EarnApplication,
  EarnApplicationStatus,
  EarnCampaign,
  EarnCategory,
} from "../types/creatorverse";

type EarnTab =
  | "overview"
  | "opportunities"
  | "applications"
  | "bounties"
  | "affiliates"
  | "brand-studio";

const TABS: Array<{ id: EarnTab; label: string; route: string }> = [
  { id: "overview", label: "Overview", route: "/earn" },
  { id: "opportunities", label: "Opportunities", route: "/earn/opportunities" },
  { id: "applications", label: "My Applications", route: "/earn/applications" },
  { id: "bounties", label: "Idea Bounties", route: "/earn/bounties" },
  { id: "affiliates", label: "Affiliates", route: "/earn/affiliates" },
  { id: "brand-studio", label: "Brand Studio", route: "/earn/brand-studio" },
];

const EARN_CATEGORIES: Array<"All" | EarnCategory> = [
  "All",
  "Sponsored Content",
  "UGC Creation",
  "Product Promotion",
  "Affiliate Marketing",
  "Idea Challenges",
  "Creative Tasks",
];

const APP_STATUSES: Array<"All" | EarnApplicationStatus> = [
  "All",
  "Pending Review",
  "Approved",
  "Rejected",
  "Work Submitted",
  "Completed",
  "Payment Released",
];

export function CreatorEarnPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const {
    user,
    earnAccountRole,
    setEarnAccountRole,
    earnCampaigns,
    earnApplications,
    earnTransactions,
    demoWithdrawals,
    bountyChallenges,
    bountySubmissions,
    affiliatePrograms,
    submitEarnApplication,
    submitEarnWork,
    requestDemoWithdrawal,
    submitBountyIdea,
    simulateAffiliateDemoConversion,
    resetDemoWorkspace,
    showToast,
  } = useCreatorVerse();

  const activeTab: EarnTab = useMemo(() => {
    const match = TABS.find((t) => t.id === section);
    return match ? match.id : "overview";
  }, [section]);

  // Payment gateway status check from backend
  const [paymentStatusNote, setPaymentStatusNote] = useState(
    "Demo Payment Ledger active. No live payment gateway keys configured."
  );

  useEffect(() => {
    let active = true;
    fetch("/api/payments/status")
      .then((res) => res.json())
      .then((data: { message?: string }) => {
        if (active && data.message) {
          setPaymentStatusNote(data.message);
        }
      })
      .catch(() => {
        // Keep clear default demo notice
      });
    return () => {
      active = false;
    };
  }, []);

  // Financial Metrics (computed strictly from ledger & application state)
  const totalEarningsInr = useMemo(
    () =>
      earnTransactions
        .filter((t) => t.amountInr > 0 && t.status === "Released")
        .reduce((sum, t) => sum + t.amountInr, 0),
    [earnTransactions]
  );

  const withdrawnTotalInr = useMemo(
    () =>
      earnTransactions
        .filter((t) => t.amountInr < 0)
        .reduce((sum, t) => sum + Math.abs(t.amountInr), 0),
    [earnTransactions]
  );

  const availableBalanceInr = Math.max(0, totalEarningsInr - withdrawnTotalInr);

  const pendingPaymentsInr = useMemo(
    () =>
      earnApplications
        .filter(
          (a) =>
            a.status === "Approved" ||
            a.status === "Work Submitted" ||
            a.status === "Completed"
        )
        .reduce((sum, a) => sum + a.rewardInr, 0),
    [earnApplications]
  );

  const completedCampaignsCount = useMemo(
    () =>
      earnApplications.filter(
        (a) => a.status === "Completed" || a.status === "Payment Released"
      ).length,
    [earnApplications]
  );

  // Opportunities Filters
  const [oppSearch, setOppSearch] = useState("");
  const [oppCategory, setOppCategory] = useState<"All" | EarnCategory>("All");
  const [oppSort, setOppSort] = useState<"reward" | "deadline" | "slots">("reward");

  const filteredOpportunities = useMemo(() => {
    const q = oppSearch.trim().toLowerCase();
    return earnCampaigns
      .filter((c) => {
        const matchesQ =
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.brandName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.requiredSkills.some((s) => s.toLowerCase().includes(q));
        const matchesCat = oppCategory === "All" || c.category === oppCategory;
        return matchesQ && matchesCat;
      })
      .sort((a, b) => {
        if (oppSort === "reward") return b.rewardInr - a.rewardInr;
        if (oppSort === "slots") return b.slotsAvailable - a.slotsAvailable;
        return a.deadline.localeCompare(b.deadline);
      });
  }, [earnCampaigns, oppSearch, oppCategory, oppSort]);

  // My Applications Filters
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<"All" | EarnApplicationStatus>("All");

  const filteredApplications = useMemo(() => {
    const q = appSearch.trim().toLowerCase();
    return earnApplications.filter((a) => {
      const matchesQ =
        !q ||
        a.campaignTitle.toLowerCase().includes(q) ||
        a.brandName.toLowerCase().includes(q);
      const matchesStatus = appStatusFilter === "All" || a.status === appStatusFilter;
      return matchesQ && matchesStatus;
    });
  }, [earnApplications, appSearch, appStatusFilter]);

  // Modals & Interactive States
  const [applyingCampaign, setApplyingCampaign] = useState<EarnCampaign | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [submittingWorkApp, setSubmittingWorkApp] = useState<EarnApplication | null>(null);
  const [activeBounty, setActiveBounty] = useState<BountyChallenge | null>(null);
  const [copiedAffId, setCopiedAffId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleCopyReferral = async (id: string, url: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedAffId(id);
      showToast("Referral link copied to clipboard.");
      window.setTimeout(() => setCopiedAffId(null), 1800);
    } catch {
      showToast("Referral link ready: " + url, "info");
    }
  };

  const statusBadgeClass = (status: EarnApplicationStatus) => {
    switch (status) {
      case "Payment Released":
      case "Completed":
        return "text-emerald-300";
      case "Approved":
        return "text-blue-300";
      case "Work Submitted":
        return "text-violet-300";
      case "Rejected":
        return "text-rose-300";
      default:
        return "text-amber-300";
    }
  };

  return (
    <DashboardLayout title="Creator Earn">
      <div className="space-y-6">
        {/* Top Header + Role Separation Switcher + Demo Reset */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Creator Earn
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Monetize ideas through brand campaigns, UGC deliverables, idea bounties, and
              affiliate links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Creator vs Brand Permission Role Toggle */}
            <div
              role="group"
              aria-label="Account role view"
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#101119] p-1"
            >
              <button
                type="button"
                onClick={() => setEarnAccountRole("creator")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  earnAccountRole === "creator"
                    ? "bg-violet-500/25 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Creator View</span>
              </button>
              <button
                type="button"
                onClick={() => setEarnAccountRole("brand")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  earnAccountRole === "brand"
                    ? "bg-blue-500/25 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Brand Account View</span>
              </button>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    resetDemoWorkspace();
                    setConfirmReset(false);
                  }}
                  className="text-xs font-semibold text-rose-200 hover:text-white"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Demo Mode & Payment Architecture Notice */}
        <div className="rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-blue-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-blue-300 mt-0.5 sm:mt-0" />
            <span>
              <strong>Demo Mode Active:</strong> Simulated creator earnings, balances, and test
              withdrawals persist locally in your browser and are not actual withdrawable money.
            </span>
          </div>
          <span className="font-mono text-[11px] text-blue-300 shrink-0">
            {paymentStatusNote}
          </span>
        </div>

        {/* Segmented Sub-Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/8 pb-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.route)}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "cv-accent-gradient text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.label}
                {tab.id === "applications" && earnApplications.length > 0
                  ? ` (${earnApplications.length})`
                  : ""}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW (CREATOR EARNING DASHBOARD) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 4 Financial KPI Cards */}
            <section
              aria-label="Creator earnings metrics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="cv-glass rounded-xl p-5">
                <p className="text-xs font-medium text-zinc-400">Total Earnings (Demo)</p>
                <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                  ₹{totalEarningsInr.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">Released payouts + bounties + affiliates</p>
              </div>

              <div className="cv-glass rounded-xl p-5">
                <p className="text-xs font-medium text-zinc-400">Available Balance (Demo)</p>
                <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-emerald-300 tabular-nums">
                  ₹{availableBalanceInr.toLocaleString("en-IN")}
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Withdraw Earnings</span>
                  </button>
                </div>
              </div>

              <div className="cv-glass rounded-xl p-5">
                <p className="text-xs font-medium text-zinc-400">Pending Payments</p>
                <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-amber-300 tabular-nums">
                  ₹{pendingPaymentsInr.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Awaiting work submission or brand verification
                </p>
              </div>

              <div className="cv-glass rounded-xl p-5">
                <p className="text-xs font-medium text-zinc-400">Completed Campaigns</p>
                <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
                  {completedCampaignsCount}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {earnApplications.length} total applications
                </p>
              </div>
            </section>

            {/* Chart + Quick Actions Split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <EarningsChart transactions={earnTransactions} />
              </div>

              <aside className="lg:col-span-4 cv-surface rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    Demo Withdrawal History
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400">
                    Simulated payouts tracked locally for demonstration.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {demoWithdrawals.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-4">No demo withdrawals yet.</p>
                    ) : (
                      demoWithdrawals.slice(0, 4).map((wd) => (
                        <div
                          key={wd.id}
                          className="rounded-xl border border-white/8 bg-[#0B0C12] px-3.5 py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{wd.method}</p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {wd.destination} · {wd.createdAt}
                            </p>
                          </div>
                          <span className="font-mono text-xs font-semibold text-zinc-200 tabular-nums shrink-0">
                            ₹{wd.amountInr.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawOpen(true)}
                    className="w-full rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Withdraw Demo Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/earn/opportunities")}
                    className="w-full rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5"
                  >
                    Browse Paid Campaigns →
                  </button>
                </div>
              </aside>
            </div>

            {/* Recent Transactions Table */}
            <section className="cv-surface rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    Recent Transactions
                  </h2>
                  <p className="text-xs text-zinc-400">
                    All payouts require explicit brand verification or simulated demo conversion
                  </p>
                </div>
              </div>

              {earnTransactions.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-400">No transactions yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="border-b border-white/8 text-xs text-zinc-400">
                      <tr>
                        <th className="py-2.5 pr-4 font-medium">Campaign / Source</th>
                        <th className="py-2.5 pr-4 font-medium">Type</th>
                        <th className="py-2.5 pr-4 font-medium">Date</th>
                        <th className="py-2.5 pr-4 font-medium">Payment Status</th>
                        <th className="py-2.5 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6">
                      {earnTransactions.map((tx) => {
                        const statusColor =
                          tx.status === "Released"
                            ? "text-emerald-300"
                            : tx.status === "Pending Verification"
                            ? "text-amber-300"
                            : "text-blue-300";

                        return (
                          <tr key={tx.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 pr-4 font-medium text-white">{tx.title}</td>
                            <td className="py-3 pr-4 text-xs text-zinc-400 whitespace-nowrap">
                              {tx.type}
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className={`py-3 pr-4 text-xs font-medium whitespace-nowrap ${statusColor}`}>
                              {tx.status}
                            </td>
                            <td
                              className={`py-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                                tx.amountInr < 0 ? "text-zinc-300" : "text-emerald-300"
                              }`}
                            >
                              {tx.amountInr < 0
                                ? `-₹${Math.abs(tx.amountInr).toLocaleString("en-IN")}`
                                : `+₹${tx.amountInr.toLocaleString("en-IN")}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: AVAILABLE EARNING OPPORTUNITIES */}
        {activeTab === "opportunities" && (
          <div className="space-y-5">
            <div className="cv-surface rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="relative md:col-span-8">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={oppSearch}
                    onChange={(e) => setOppSearch(e.target.value)}
                    placeholder="Search campaigns, brands, or required skills..."
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={oppSort}
                    onChange={(e) =>
                      setOppSort(e.target.value as "reward" | "deadline" | "slots")
                    }
                    aria-label="Sort opportunities"
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="reward">Sort: Highest Reward</option>
                    <option value="deadline">Sort: Soonest Deadline</option>
                    <option value="slots">Sort: Most Open Slots</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {EARN_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setOppCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                      oppCategory === cat
                        ? "bg-violet-500/20 text-violet-200 border border-violet-500/35"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="cv-surface rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  No matching opportunities
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Try another category filter or publish a campaign from Brand Studio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredOpportunities.map((camp) => {
                  const existingApp = earnApplications.find((a) => a.campaignId === camp.id);
                  return (
                    <article
                      key={camp.id}
                      className="cv-surface rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${camp.brandAccent} text-xs font-bold text-white`}
                            >
                              {camp.brandInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-zinc-300 truncate">
                                {camp.brandName} · {camp.category}
                              </p>
                              <p className="text-xs text-zinc-500">{camp.platform}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-mono text-base font-semibold text-emerald-300 tabular-nums">
                              ₹{camp.rewardInr.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[11px] text-zinc-500">Per Creator</p>
                          </div>
                        </div>

                        <h2 className="mt-4 font-display text-lg font-semibold text-white">
                          {camp.title}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                          {camp.description}
                        </p>

                        <p className="mt-3 text-xs text-zinc-400">
                          <span className="text-zinc-500">Required Skills:</span>{" "}
                          {camp.requiredSkills.join(" · ")}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs text-zinc-400 space-x-3">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            Due {camp.deadline}
                          </span>
                          <span className="tabular-nums">{camp.slotsAvailable} slots left</span>
                        </div>

                        {existingApp ? (
                          <button
                            type="button"
                            onClick={() => navigate("/earn/applications")}
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3.5 py-2 text-xs font-medium hover:bg-white/5 ${statusBadgeClass(
                              existingApp.status
                            )}`}
                          >
                            <span>Status: {existingApp.status}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={camp.slotsAvailable === 0 || earnAccountRole === "brand"}
                            onClick={() => setApplyingCampaign(camp)}
                            className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                          >
                            <span>
                              {earnAccountRole === "brand"
                                ? "Switch to Creator View to Apply"
                                : camp.slotsAvailable === 0
                                ? "Slots Filled"
                                : "Apply Now"}
                            </span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY APPLICATIONS & TASK COMPLETION */}
        {activeTab === "applications" && (
          <div className="space-y-5">
            <div className="cv-surface rounded-xl p-4 grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="relative md:col-span-7">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  placeholder="Search applied campaigns or brands..."
                  className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-5">
                <select
                  value={appStatusFilter}
                  onChange={(e) =>
                    setAppStatusFilter(e.target.value as "All" | EarnApplicationStatus)
                  }
                  aria-label="Filter applications by status"
                  className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                  {APP_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st === "All" ? "All Application Statuses" : st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="cv-surface rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  No applications match your filters
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Explore open opportunities and submit your first pitch.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/earn/opportunities")}
                  className="mt-4 rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white"
                >
                  Explore Opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const parentCamp = earnCampaigns.find((c) => c.id === app.campaignId);
                  const safeWorkUrl = sanitizeExternalUrl(app.submittedWorkUrl);

                  return (
                    <article key={app.id} className="cv-surface rounded-2xl p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <p className="text-xs text-zinc-400">
                            {app.brandName} · Applied{" "}
                            <span className="tabular-nums">{app.appliedAt}</span> ·{" "}
                            <span className={`font-semibold ${statusBadgeClass(app.status)}`}>
                              {app.status}
                            </span>
                          </p>
                          <h2 className="mt-1 font-display text-lg font-semibold text-white">
                            {app.campaignTitle}
                          </h2>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <p className="font-mono text-base font-semibold text-emerald-300 tabular-nums">
                            ₹{app.rewardInr.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {app.status === "Payment Released"
                              ? "Paid (Demo)"
                              : "Pending Verification"}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-300">{app.pitchReason}</p>

                      {app.brandReviewNote && (
                        <div className="rounded-xl border border-white/8 bg-[#0B0C12] px-4 py-3 text-xs text-zinc-300">
                          <strong className="text-white">Brand Feedback:</strong>{" "}
                          {app.brandReviewNote}
                        </div>
                      )}

                      {app.status === "Approved" && parentCamp && (
                        <div className="rounded-xl border border-blue-500/25 bg-blue-500/[0.06] p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-blue-200">
                              Approved — Campaign Deliverable Instructions
                            </p>
                            <ul className="mt-1.5 space-y-1 text-xs text-zinc-300">
                              {parentCamp.requirements.map((req) => (
                                <li key={req}>• {req}</li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubmittingWorkApp(app)}
                            className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Submit Completed Work</span>
                          </button>
                        </div>
                      )}

                      {app.submittedWorkUrl && (
                        <div className="rounded-xl border border-white/8 bg-[#0B0C12] p-4 text-xs space-y-1.5">
                          <p className="font-semibold text-zinc-200">
                            Submitted Work ({app.submittedWorkAt})
                          </p>
                          {safeWorkUrl && (
                            <a
                              href={safeWorkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-300 hover:underline break-all"
                            >
                              <span>{safeWorkUrl}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          )}
                          {app.submittedWorkDescription && (
                            <p className="text-zinc-400">{app.submittedWorkDescription}</p>
                          )}
                        </div>
                      )}

                      {app.payoutReference && (
                        <p className="font-mono text-xs text-emerald-400">
                          Verified Payout Reference: {app.payoutReference}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IDEA BOUNTY CHALLENGES */}
        {activeTab === "bounties" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {bountyChallenges.map((bounty) => {
                const mySubs = bountySubmissions.filter((s) => s.bountyId === bounty.id);
                return (
                  <article
                    key={bounty.id}
                    className="cv-surface rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-medium text-violet-300">
                          {bounty.brandName} · {bounty.platform}
                        </span>
                        <span className="font-mono font-semibold text-emerald-300 tabular-nums">
                          ₹{bounty.rewardInr.toLocaleString("en-IN")} Bounty
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-lg font-semibold text-white">
                        {bounty.title}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{bounty.prompt}</p>

                      {mySubs.length > 0 && (
                        <div className="mt-4 space-y-2 border-t border-white/8 pt-3">
                          <p className="text-xs font-semibold text-zinc-400">Your Submissions</p>
                          {mySubs.map((sub) => {
                            const safeBountyLink = sanitizeExternalUrl(sub.workUrl);
                            return (
                              <div
                                key={sub.id}
                                className="rounded-lg border border-white/8 bg-[#0B0C12] p-3 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-white">{sub.ideaTitle}</span>
                                  <span
                                    className={
                                      sub.status === "Selected Winner"
                                        ? "text-emerald-300 font-semibold"
                                        : sub.status === "Not Selected"
                                        ? "text-zinc-500"
                                        : "text-amber-300"
                                    }
                                  >
                                    {sub.status}
                                  </span>
                                </div>
                                <p className="text-zinc-400">{sub.conceptSummary}</p>
                                {safeBountyLink && (
                                  <a
                                    href={safeBountyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-300 hover:underline break-all"
                                  >
                                    <span>{safeBountyLink}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-3">
                      <span className="text-xs text-zinc-400 tabular-nums">
                        Deadline: {bounty.deadline} · {bounty.status}
                      </span>

                      {bounty.status === "Open" ? (
                        <button
                          type="button"
                          onClick={() => setActiveBounty(bounty)}
                          className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Submit Original Idea</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
                          <Award className="h-3.5 w-3.5" />
                          <span>Winner Selected</span>
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: AFFILIATE EARNING */}
        {activeTab === "affiliates" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/8 bg-[#0B0C12] px-4 py-3 text-xs text-zinc-300">
              Simulated Demo Affiliate Tracking: Metrics below reflect demo clicks and simulated
              conversions until a live attribution webhook is connected.
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {affiliatePrograms.map((prog) => (
                <article
                  key={prog.id}
                  className="cv-surface rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-medium text-violet-300">{prog.brandName}</p>
                    <h2 className="mt-1 font-display text-lg font-semibold text-white">
                      {prog.productTitle}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">{prog.commissionLabel}</p>

                    <div className="mt-4 rounded-xl border border-white/8 bg-[#08090D] p-3 space-y-2">
                      <p className="text-[11px] text-zinc-500">Your Unique Referral Link</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-200 truncate">
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                          <span className="truncate">{prog.referralUrl}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyReferral(prog.id, prog.referralUrl)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/12 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-white/10 shrink-0"
                        >
                          {copiedAffId === prog.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>{copiedAffId === prog.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-white/8 pt-4">
                      <div>
                        <p className="font-mono text-base font-semibold text-white tabular-nums">
                          {prog.clicks}
                        </p>
                        <p className="text-[11px] text-zinc-500">Clicks</p>
                      </div>
                      <div>
                        <p className="font-mono text-base font-semibold text-white tabular-nums">
                          {prog.verifiedConversions}
                        </p>
                        <p className="text-[11px] text-zinc-500">Verified</p>
                      </div>
                      <div>
                        <p className="font-mono text-base font-semibold text-emerald-300 tabular-nums">
                          ₹{prog.commissionEarnedInr.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-zinc-500">Earned</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => simulateAffiliateDemoConversion(prog.id)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] transition-colors"
                  >
                    <MousePointerClick className="h-3.5 w-3.5 text-blue-300" />
                    <span>Simulate Demo Conversion (+₹{prog.commissionPerConversionInr})</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BRAND ACCOUNT STUDIO */}
        {activeTab === "brand-studio" && <BrandStudioPanel />}
      </div>

      {/* Modals */}
      {applyingCampaign && (
        <ApplyCampaignModal
          campaign={applyingCampaign}
          defaultName={user.name}
          defaultPortfolio={user.portfolioUrl}
          defaultSkills={user.skills}
          onClose={() => setApplyingCampaign(null)}
          onSubmit={(payload) => {
            submitEarnApplication({ campaign: applyingCampaign, ...payload });
            setApplyingCampaign(null);
          }}
        />
      )}

      {withdrawOpen && (
        <WithdrawModal
          availableBalanceInr={availableBalanceInr}
          onClose={() => setWithdrawOpen(false)}
          onConfirm={requestDemoWithdrawal}
        />
      )}

      {submittingWorkApp && (
        <SubmitWorkModal
          application={submittingWorkApp}
          campaign={earnCampaigns.find((c) => c.id === submittingWorkApp.campaignId)}
          onClose={() => setSubmittingWorkApp(null)}
          onSubmit={(workUrl, workDesc) => {
            submitEarnWork(submittingWorkApp.id, workUrl, workDesc);
            setSubmittingWorkApp(null);
          }}
        />
      )}

      {activeBounty && (
        <BountySubmitModal
          bounty={activeBounty}
          onClose={() => setActiveBounty(null)}
          onSubmit={(payload) => {
            submitBountyIdea({ bountyId: activeBounty.id, ...payload });
            setActiveBounty(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
