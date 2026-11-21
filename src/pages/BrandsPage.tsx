import React, { useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Info,
  Search,
  Send,
  X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import type { BrandCampaign } from "../types/creatorverse";

export function BrandsPage() {
  const {
    user,
    campaigns,
    applyToCampaign,
    withdrawCampaignApplication,
  } = useCreatorVerse();

  const [tab, setTab] = useState<"all" | "applied">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Application Modal
  const [selectedCampaign, setSelectedCampaign] = useState<BrandCampaign | null>(null);
  const [pitch, setPitch] = useState("");
  const [pitchError, setPitchError] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(campaigns.map((c) => c.category)))],
    [campaigns]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const matchesTab = tab === "all" || c.applied;
      const matchesQ =
        !q ||
        c.brandName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchesCat = categoryFilter === "All" || c.category === categoryFilter;
      return matchesTab && matchesQ && matchesCat;
    });
  }, [campaigns, tab, search, categoryFilter]);

  const openApplyModal = (camp: BrandCampaign) => {
    setSelectedCampaign(camp);
    setPitch("");
    setPitchError("");
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setPitchError("");
    if (pitch.trim().length < 15) {
      setPitchError("Please write a brief creative pitch (at least 15 characters).");
      return;
    }
    applyToCampaign(selectedCampaign.id, pitch);
    setSelectedCampaign(null);
  };

  return (
    <DashboardLayout title="Brand Promotions">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Brand Promotion Marketplace
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Review transparent deliverables, deadlines, and rewards—then apply directly.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#101119] p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                tab === "all" ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              All Campaigns ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("applied")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                tab === "applied" ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              My Applications ({campaigns.filter((c) => c.applied).length})
            </button>
          </div>
        </div>

        <div className="inline-flex w-full items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-2.5 text-xs text-blue-200">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Sample Brand Campaigns: Demonstration marketplace data until live brand portals are
            connected.
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="cv-surface rounded-xl p-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brand names, campaigns, or deliverables..."
              className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter campaigns by category"
              className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaigns List */}
        {filtered.length === 0 ? (
          <div className="cv-surface rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-white">No campaigns found</p>
            <p className="mt-2 text-sm text-zinc-400">
              {tab === "applied"
                ? "You haven't applied to any brand campaigns yet."
                : "Try clearing your search or category filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((camp) => (
              <article
                key={camp.id}
                className="cv-surface rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                {camp.coverUrl && (
                  <MediaImage
                    src={camp.coverUrl}
                    alt={`${camp.brandName} campaign visual`}
                    fallbackLabel={camp.brandName}
                    className="h-44 w-full object-cover border-b border-white/8"
                  />
                )}

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-violet-300">
                        {camp.brandName} · {camp.category}
                      </span>
                      <span className="font-mono text-emerald-300 font-semibold tabular-nums">
                        {camp.reward}
                      </span>
                    </div>

                    <h2 className="mt-2 font-display text-xl font-semibold text-white">
                      {camp.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{camp.description}</p>

                    <div className="mt-4 space-y-1.5">
                      <p className="text-xs font-semibold text-zinc-400">Requirements</p>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {camp.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2">
                            <span className="text-violet-400">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/8 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        Deadline: {camp.deadline}
                      </span>
                      <span className="tabular-nums">{camp.slotsOpen} creator slots open</span>
                    </div>

                    {camp.applied ? (
                      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Status: {camp.applicationStatus}</span>
                          </p>
                          {camp.applicationPitch && (
                            <p className="mt-1 text-xs text-zinc-300 truncate">
                              Pitch: {camp.applicationPitch}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => withdrawCampaignApplication(camp.id)}
                          className="text-xs font-medium text-zinc-300 hover:text-white whitespace-nowrap shrink-0"
                        >
                          Withdraw
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openApplyModal(camp)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg cv-accent-gradient px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Apply to Campaign</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h2 id="apply-modal-title" className="font-display text-lg font-semibold text-white">
                  Apply: {selectedCampaign.brandName}
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectedCampaign.title} · {selectedCampaign.reward}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} noValidate className="mt-5 space-y-4">
              <div className="rounded-lg border border-white/8 bg-[#0B0C12] px-3.5 py-2.5 text-xs text-zinc-300">
                Submitting with profile: <strong className="text-white">{user.name}</strong> (
                {user.handle}) · Portfolio: {user.portfolioUrl}
              </div>

              <div>
                <label htmlFor="camp-pitch" className="block text-xs font-medium text-zinc-300">
                  Your Campaign Concept Pitch
                </label>
                <textarea
                  id="camp-pitch"
                  rows={4}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Describe the hook, storyline, and how you'll showcase the brand naturally..."
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {pitchError && (
                <p role="alert" className="text-xs font-medium text-rose-400">
                  {pitchError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
