import React, { useState } from "react";
import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useCreatorVerse } from "../../context/CreatorVerseContext";
import { sanitizeExternalUrl } from "../../utils/urlValidation";
import type { EarnCategory } from "../../types/creatorverse";

const CATEGORIES: EarnCategory[] = [
  "Sponsored Content",
  "UGC Creation",
  "Product Promotion",
  "Affiliate Marketing",
  "Idea Challenges",
  "Creative Tasks",
];

const SKILL_CHOICES = [
  "Acting",
  "Editing",
  "Dancing",
  "Scripting",
  "Cinematography",
  "Sound Design",
];

export function BrandStudioPanel() {
  const {
    earnAccountRole,
    setEarnAccountRole,
    earnApplications,
    bountyChallenges,
    bountySubmissions,
    publishBrandCampaign,
    reviewEarnApplication,
    releaseEarnPayment,
    rejectSubmittedWork,
    publishBountyChallenge,
    awardBountySubmission,
  } = useCreatorVerse();

  // Campaign Publish Form State
  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EarnCategory>("Sponsored Content");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Cinematography", "Editing"]);
  const [budgetInr, setBudgetInr] = useState("100000");
  const [rewardInr, setRewardInr] = useState("12500");
  const [slotsTotal, setSlotsTotal] = useState("8");
  const [deadline, setDeadline] = useState("2026-12-25");
  const [requirementsText, setRequirementsText] = useState(
    "1 Vertical Reel (30–45s)\nSubmit draft URL for review before payout"
  );
  const [campError, setCampError] = useState("");

  // Bounty Publish Form State
  const [bBrand, setBBrand] = useState("");
  const [bTitle, setBTitle] = useState("");
  const [bPrompt, setBPrompt] = useState("");
  const [bPlatform, setBPlatform] = useState("Instagram Reels");
  const [bReward, setBReward] = useState("6000");
  const [bDeadline, setBDeadline] = useState("2026-12-18");
  const [bError, setBError] = useState("");

  const [releasingId, setReleasingId] = useState<string | null>(null);

  if (earnAccountRole !== "brand") {
    return (
      <div className="cv-surface rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold text-white">
          Brand Account Permissions Required
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Creator and Brand permissions are strictly separated. Creator accounts cannot publish
          campaigns, approve applications, or release payouts. Switch to the{" "}
          <strong className="text-white">Brand Account View</strong> to test publishing campaigns
          and reviewing creator deliverables.
        </p>
        <button
          type="button"
          onClick={() => setEarnAccountRole("brand")}
          className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Building2 className="h-4 w-4" />
          <span>Switch to Brand Account View (Demo)</span>
        </button>
      </div>
    );
  }

  const toggleSkill = (sk: string) => {
    setRequiredSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : [...prev, sk]
    );
  };

  const handlePublishCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setCampError("");

    const budget = Number(budgetInr);
    const reward = Number(rewardInr);
    const slots = Number(slotsTotal);

    if (brandName.trim().length < 2) {
      setCampError("Please enter a brand name.");
      return;
    }
    if (title.trim().length < 4) {
      setCampError("Campaign name must be at least 4 characters.");
      return;
    }
    if (description.trim().length < 15) {
      setCampError("Campaign description must be at least 15 characters.");
      return;
    }
    if (requiredSkills.length === 0) {
      setCampError("Select at least one required creator skill.");
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(reward) || reward <= 0) {
      setCampError("Campaign budget and creator reward must be positive numbers.");
      return;
    }
    if (reward > budget) {
      setCampError("Creator reward cannot exceed total campaign budget.");
      return;
    }
    if (!Number.isFinite(slots) || slots < 1) {
      setCampError("Creator slots must be at least 1.");
      return;
    }
    if (!deadline) {
      setCampError("Please select a campaign deadline.");
      return;
    }

    const reqLines = requirementsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    publishBrandCampaign({
      title,
      brandName,
      description,
      category,
      requiredSkills,
      platform,
      budgetInr: Math.round(budget),
      rewardInr: Math.round(reward),
      slotsTotal: Math.round(slots),
      deadline,
      requirements: reqLines.length > 0 ? reqLines : ["Submit final deliverable link for review"],
    });

    setTitle("");
    setDescription("");
  };

  const handlePublishBounty = (e: React.FormEvent) => {
    e.preventDefault();
    setBError("");
    const reward = Number(bReward);

    if (bBrand.trim().length < 2 || bTitle.trim().length < 4 || bPrompt.trim().length < 12) {
      setBError("Enter brand name, challenge title, and creative prompt.");
      return;
    }
    if (!Number.isFinite(reward) || reward <= 0) {
      setBError("Enter a valid positive bounty reward.");
      return;
    }

    publishBountyChallenge({
      brandName: bBrand,
      title: bTitle,
      prompt: bPrompt,
      platform: bPlatform,
      rewardInr: Math.round(reward),
      deadline: bDeadline,
    });
    setBTitle("");
    setBPrompt("");
  };

  const handleReleasePayout = async (applicationId: string) => {
    setReleasingId(applicationId);
    await releaseEarnPayment(applicationId);
    setReleasingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Brand Campaign Creation Form */}
      <section className="cv-surface rounded-2xl p-5 sm:p-6">
        <div className="border-b border-white/8 pb-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Create & Publish Brand Campaign
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Campaigns published here appear immediately in the Creator Earn marketplace.
          </p>
        </div>

        <form onSubmit={handlePublishCampaign} noValidate className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bc-brand" className="block text-xs font-medium text-zinc-300">
                Brand Name
              </label>
              <input
                id="bc-brand"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., NovaWear Studio"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bc-title" className="block text-xs font-medium text-zinc-300">
                Campaign Name
              </label>
              <input
                id="bc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Campus Streetwear Drop Reel"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bc-desc" className="block text-xs font-medium text-zinc-300">
              Campaign Description
            </label>
            <textarea
              id="bc-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the product, target hook, and deliverable format..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="bc-cat" className="block text-xs font-medium text-zinc-300">
                Category
              </label>
              <select
                id="bc-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as EarnCategory)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bc-plat" className="block text-xs font-medium text-zinc-300">
                Platform
              </label>
              <select
                id="bc-plat"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                <option>Instagram Reels</option>
                <option>YouTube Shorts</option>
                <option>YouTube Long-form</option>
                <option>LinkedIn Video</option>
              </select>
            </div>

            <div>
              <label htmlFor="bc-budget" className="block text-xs font-medium text-zinc-300">
                Campaign Budget (₹)
              </label>
              <input
                id="bc-budget"
                type="number"
                min={1}
                value={budgetInr}
                onChange={(e) => setBudgetInr(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bc-reward" className="block text-xs font-medium text-zinc-300">
                Creator Reward (₹)
              </label>
              <input
                id="bc-reward"
                type="number"
                min={1}
                value={rewardInr}
                onChange={(e) => setRewardInr(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bc-slots" className="block text-xs font-medium text-zinc-300">
                Creator Slots
              </label>
              <input
                id="bc-slots"
                type="number"
                min={1}
                value={slotsTotal}
                onChange={(e) => setSlotsTotal(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-medium text-zinc-300 mb-2">Required Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_CHOICES.map((sk) => {
                  const active = requiredSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                        active
                          ? "bg-violet-500/20 text-white border-violet-500/40"
                          : "bg-[#08090D] text-zinc-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-violet-300" />}
                      <span>{sk}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="bc-deadline" className="block text-xs font-medium text-zinc-300">
                Campaign Deadline
              </label>
              <input
                id="bc-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bc-reqs" className="block text-xs font-medium text-zinc-300">
              Submission Requirements (one per line)
            </label>
            <textarea
              id="bc-reqs"
              rows={2}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {campError && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {campError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Campaign</span>
            </button>
          </div>
        </form>
      </section>

      {/* Creator Applications & Work Verification Queue */}
      <section className="cv-surface rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-white/8 pb-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Creator Applications & Deliverable Verification ({earnApplications.length})
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Approve creators, inspect submitted work URLs, and trigger verified payout releases.
          </p>
        </div>

        {earnApplications.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">No creator applications yet.</p>
        ) : (
          <div className="space-y-3">
            {earnApplications.map((app) => {
              const safeSocial = sanitizeExternalUrl(app.socialProfileUrl);
              const safeWork = sanitizeExternalUrl(app.submittedWorkUrl);

              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-white/8 bg-[#0B0C12] p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs text-zinc-400">
                      {app.brandName} · {app.campaignTitle} ·{" "}
                      <span className="font-mono text-emerald-300 tabular-nums">
                        ₹{app.rewardInr.toLocaleString("en-IN")}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-semibold text-white">
                        {app.creatorName}
                      </span>
                      <span className="text-xs font-medium text-violet-300">· {app.status}</span>
                      {safeSocial && (
                        <a
                          href={safeSocial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-300 hover:underline"
                        >
                          <span>Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300">{app.pitchReason}</p>

                    {app.submittedWorkUrl && (
                      <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] p-3 text-xs space-y-1">
                        <p className="font-semibold text-blue-200">Creator Deliverable Submitted:</p>
                        {safeWork && (
                          <a
                            href={safeWork}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-300 hover:underline break-all"
                          >
                            <span>{safeWork}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        )}
                        {app.submittedWorkDescription && (
                          <p className="text-zinc-300">{app.submittedWorkDescription}</p>
                        )}
                      </div>
                    )}

                    {app.payoutReference && (
                      <p className="font-mono text-[11px] text-emerald-400">
                        Payout Ref: {app.payoutReference}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {app.status === "Pending Review" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            reviewEarnApplication(
                              app.id,
                              "Approved",
                              "Approved by brand! Proceed with production and submit your deliverable link."
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            reviewEarnApplication(
                              app.id,
                              "Rejected",
                              "Not a fit for this cohort."
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {(app.status === "Work Submitted" || app.status === "Completed") && (
                      <>
                        <button
                          type="button"
                          disabled={releasingId === app.id}
                          onClick={() => handleReleasePayout(app.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {releasingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Approve Work & Release Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            rejectSubmittedWork(
                              app.id,
                              "Please adjust audio clarity and resubmit deliverable link."
                            )
                          }
                          className="rounded-lg border border-white/12 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                        >
                          Request Revision
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand Idea Bounty Manager */}
      <section className="cv-surface rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="border-b border-white/8 pb-4">
          <h2 className="font-display text-lg font-semibold text-white">
            Post & Award Idea Bounty Challenges
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Crowdsource reel concepts from creators and award bounties to top submissions.
          </p>
        </div>

        <form onSubmit={handlePublishBounty} noValidate className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              value={bBrand}
              onChange={(e) => setBBrand(e.target.value)}
              placeholder="Brand name"
              aria-label="Bounty brand name"
              className="rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
            <input
              type="text"
              value={bTitle}
              onChange={(e) => setBTitle(e.target.value)}
              placeholder="Challenge title"
              aria-label="Bounty challenge title"
              className="sm:col-span-2 rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
            <select
              value={bPlatform}
              onChange={(e) => setBPlatform(e.target.value)}
              aria-label="Bounty platform"
              className="rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option>Instagram Reels</option>
              <option>YouTube Shorts</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <input
              type="text"
              value={bPrompt}
              onChange={(e) => setBPrompt(e.target.value)}
              placeholder="Challenge prompt (e.g., Create a unique Instagram reel concept for our new drop)"
              aria-label="Bounty prompt"
              className="sm:col-span-7 rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
            <input
              type="number"
              min={1}
              value={bReward}
              onChange={(e) => setBReward(e.target.value)}
              placeholder="Reward ₹"
              aria-label="Bounty reward INR"
              className="sm:col-span-2 rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
            />
            <input
              type="date"
              value={bDeadline}
              onChange={(e) => setBDeadline(e.target.value)}
              aria-label="Bounty deadline"
              className="sm:col-span-3 rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {bError && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {bError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/[0.09]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Bounty Challenge</span>
            </button>
          </div>
        </form>

        {/* Bounty Submissions waiting for selection */}
        {bountySubmissions.length > 0 && (
          <div className="pt-3 border-t border-white/8 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-400">Submitted Bounty Concepts</p>
            {bountySubmissions.map((sub) => {
              const parent = bountyChallenges.find((b) => b.id === sub.bountyId);
              const safeBountyLink = sanitizeExternalUrl(sub.workUrl);
              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-white/8 bg-[#0B0C12] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs text-zinc-400">
                      {parent?.title || "Bounty"} · by {sub.creatorName} ·{" "}
                      <span className="text-violet-300 font-medium">{sub.status}</span>
                    </p>
                    <p className="text-sm font-semibold text-white">{sub.ideaTitle}</p>
                    <p className="text-xs text-zinc-300">{sub.conceptSummary}</p>
                    {safeBountyLink && (
                      <a
                        href={safeBountyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-300 hover:underline break-all"
                      >
                        <span>{safeBountyLink}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>
                  {parent && parent.status === "Open" && sub.status === "Submitted" && (
                    <button
                      type="button"
                      onClick={() => awardBountySubmission(parent.id, sub.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap shrink-0"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>Select Winner (₹{parent.rewardInr.toLocaleString("en-IN")})</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
