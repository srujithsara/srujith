import React, { useState } from "react";
import { Check, Loader2, Send, Upload, Wallet, X } from "lucide-react";
import { isSafeHttpUrl } from "../../utils/urlValidation";
import type {
  BountyChallenge,
  EarnApplication,
  EarnCampaign,
} from "../../types/creatorverse";

const SKILL_OPTIONS = [
  "Acting",
  "Editing",
  "Dancing",
  "Scripting",
  "Cinematography",
  "Sound Design",
];

// 1. Apply to Campaign Modal
export function ApplyCampaignModal({
  campaign,
  defaultName,
  defaultPortfolio,
  defaultSkills,
  onClose,
  onSubmit,
}: {
  campaign: EarnCampaign;
  defaultName: string;
  defaultPortfolio: string;
  defaultSkills: string[];
  onClose: () => void;
  onSubmit: (payload: {
    creatorName: string;
    socialProfileUrl: string;
    relevantSkills: string[];
    pitchReason: string;
    portfolioUrl: string;
  }) => void;
}) {
  const [creatorName, setCreatorName] = useState(defaultName);
  const [socialProfileUrl, setSocialProfileUrl] = useState("https://instagram.com/arjun.creates");
  const [relevantSkills, setRelevantSkills] = useState<string[]>(
    defaultSkills.length > 0 ? defaultSkills : campaign.requiredSkills
  );
  const [pitchReason, setPitchReason] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(defaultPortfolio);
  const [error, setError] = useState("");

  const toggleSkill = (skill: string) => {
    setRelevantSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (creatorName.trim().length < 2) {
      setError("Please enter your creator name (at least 2 characters).");
      return;
    }
    if (!isSafeHttpUrl(socialProfileUrl)) {
      setError("Please enter a valid Social Media Profile URL starting with http:// or https://.");
      return;
    }
    if (relevantSkills.length === 0) {
      setError("Select at least one relevant skill.");
      return;
    }
    if (pitchReason.trim().length < 15) {
      setError("Please explain why you want to join this campaign (at least 15 characters).");
      return;
    }
    if (!isSafeHttpUrl(portfolioUrl)) {
      setError("Please enter a valid Portfolio URL starting with http:// or https://.");
      return;
    }

    onSubmit({
      creatorName,
      socialProfileUrl,
      relevantSkills,
      pitchReason,
      portfolioUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="earn-apply-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="min-w-0">
            <h2 id="earn-apply-title" className="font-display text-lg font-semibold text-white truncate">
              Apply: {campaign.title}
            </h2>
            <p className="text-xs text-zinc-400">
              {campaign.brandName} · Reward ₹{campaign.rewardInr.toLocaleString("en-IN")} ·{" "}
              {campaign.platform}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close application modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="app-creator-name" className="block text-xs font-medium text-zinc-300">
              Creator Name
            </label>
            <input
              id="app-creator-name"
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="app-social-url" className="block text-xs font-medium text-zinc-300">
                Social Media Profile URL
              </label>
              <input
                id="app-social-url"
                type="url"
                value={socialProfileUrl}
                onChange={(e) => setSocialProfileUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="app-portfolio-url" className="block text-xs font-medium text-zinc-300">
                Portfolio URL
              </label>
              <input
                id="app-portfolio-url"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-2">Relevant Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map((sk) => {
                const active = relevantSkills.includes(sk);
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
            <label htmlFor="app-pitch" className="block text-xs font-medium text-zinc-300">
              Why You Want to Join This Campaign
            </label>
            <textarea
              id="app-pitch"
              rows={3}
              value={pitchReason}
              onChange={(e) => setPitchReason(e.target.value)}
              placeholder="Share your creative angle, audience fit, and production plan..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
  );
}

// 2. Demo Withdrawal Modal
export function WithdrawModal({
  availableBalanceInr,
  onClose,
  onConfirm,
}: {
  availableBalanceInr: number;
  onClose: () => void;
  onConfirm: (payload: {
    amountInr: number;
    method: "UPI ID (Demo)" | "Bank Transfer (Demo)";
    destination: string;
  }) => boolean;
}) {
  const [amount, setAmount] = useState(
    availableBalanceInr > 0 ? String(Math.min(5000, availableBalanceInr)) : ""
  );
  const [method, setMethod] = useState<"UPI ID (Demo)" | "Bank Transfer (Demo)">(
    "UPI ID (Demo)"
  );
  const [destination, setDestination] = useState("arjun.demo@upi");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const num = Number(amount);

    if (!Number.isFinite(num) || num <= 0) {
      setError("Enter a valid positive withdrawal amount.");
      return;
    }
    if (num > availableBalanceInr) {
      setError(
        `Amount cannot exceed available demo balance (₹${availableBalanceInr.toLocaleString("en-IN")}).`
      );
      return;
    }
    if (destination.trim().length < 4) {
      setError("Enter a valid demo UPI ID or account label.");
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      const ok = onConfirm({ amountInr: Math.round(num), method, destination });
      setSubmitting(false);
      if (ok) onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wd-modal-title"
        className="w-full max-w-md rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-violet-300" />
            <h2 id="wd-modal-title" className="font-display text-lg font-semibold text-white">
              Demo Earnings Withdrawal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close withdrawal modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-3.5 py-2.5 text-xs text-blue-200 leading-relaxed">
            <strong>Demo Mode Notice:</strong> Simulated balances are for hackathon demonstration
            only and do not initiate real bank or UPI transfers.
          </div>

          <div className="rounded-lg border border-white/8 bg-[#0B0C12] px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Available Demo Balance</span>
            <span className="font-mono text-base font-semibold text-white tabular-nums">
              ₹{availableBalanceInr.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <label htmlFor="wd-amount" className="block text-xs font-medium text-zinc-300">
              Withdrawal Amount (INR)
            </label>
            <input
              id="wd-amount"
              type="number"
              min={1}
              max={availableBalanceInr}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm font-mono text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="wd-method" className="block text-xs font-medium text-zinc-300">
              Payout Method (Simulated)
            </label>
            <select
              id="wd-method"
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as "UPI ID (Demo)" | "Bank Transfer (Demo)")
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="UPI ID (Demo)">UPI ID (Demo)</option>
              <option value="Bank Transfer (Demo)">Bank Transfer (Demo)</option>
            </select>
          </div>

          <div>
            <label htmlFor="wd-dest" className="block text-xs font-medium text-zinc-300">
              {method === "UPI ID (Demo)" ? "Demo UPI ID" : "Demo Account Label"}
            </label>
            <input
              id="wd-dest"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || availableBalanceInr <= 0}
              className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Confirm Demo Withdrawal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Submit Completed Work Modal
export function SubmitWorkModal({
  application,
  campaign,
  onClose,
  onSubmit,
}: {
  application: EarnApplication;
  campaign?: EarnCampaign;
  onClose: () => void;
  onSubmit: (workUrl: string, workDescription: string) => void;
}) {
  const [workUrl, setWorkUrl] = useState(application.submittedWorkUrl || "");
  const [workDescription, setWorkDescription] = useState(
    application.submittedWorkDescription || ""
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSafeHttpUrl(workUrl)) {
      setError("Please enter a valid deliverable URL starting with http:// or https://.");
      return;
    }
    if (workDescription.trim().length < 15) {
      setError("Please describe your completed deliverable (at least 15 characters).");
      return;
    }
    onSubmit(workUrl, workDescription);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-modal-title"
        className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="min-w-0">
            <h2 id="work-modal-title" className="font-display text-lg font-semibold text-white truncate">
              Submit Completed Work
            </h2>
            <p className="text-xs text-zinc-400">
              {application.brandName} · {application.campaignTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close work submission modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {campaign && campaign.requirements.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-[#0B0C12] p-3.5 space-y-1.5">
              <p className="text-xs font-semibold text-violet-300">Campaign Instructions</p>
              <ul className="space-y-1 text-xs text-zinc-300">
                {campaign.requirements.map((req) => (
                  <li key={req}>• {req}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label htmlFor="work-url" className="block text-xs font-medium text-zinc-300">
              Published Content URL or Deliverable Link
            </label>
            <input
              id="work-url"
              type="url"
              value={workUrl}
              onChange={(e) => setWorkUrl(e.target.value)}
              placeholder="https://instagram.com/reel/... or https://drive.google.com/..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="work-desc" className="block text-xs font-medium text-zinc-300">
              Description of Completed Work
            </label>
            <textarea
              id="work-desc"
              rows={3}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="Summarize format, hook, duration, and any notes for brand review..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Submit Deliverable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. Submit Idea Bounty Modal
export function BountySubmitModal({
  bounty,
  onClose,
  onSubmit,
}: {
  bounty: BountyChallenge;
  onClose: () => void;
  onSubmit: (payload: { ideaTitle: string; conceptSummary: string; workUrl?: string }) => void;
}) {
  const [ideaTitle, setIdeaTitle] = useState("");
  const [conceptSummary, setConceptSummary] = useState("");
  const [workUrl, setWorkUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (ideaTitle.trim().length < 4) {
      setError("Idea title must be at least 4 characters.");
      return;
    }
    if (conceptSummary.trim().length < 15) {
      setError("Please describe your original concept (at least 15 characters).");
      return;
    }
    if (workUrl.trim() && !isSafeHttpUrl(workUrl)) {
      setError("Optional link must start with http:// or https://.");
      return;
    }
    onSubmit({
      ideaTitle,
      conceptSummary,
      workUrl: workUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bounty-modal-title"
        className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="min-w-0">
            <h2 id="bounty-modal-title" className="font-display text-lg font-semibold text-white truncate">
              Submit Bounty Concept
            </h2>
            <p className="text-xs text-zinc-400">
              {bounty.brandName} · Prize ₹{bounty.rewardInr.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bounty modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div className="rounded-xl border border-white/8 bg-[#0B0C12] p-3.5 text-xs text-zinc-300">
            <strong className="text-white">Brief:</strong> {bounty.prompt}
          </div>

          <div>
            <label htmlFor="bounty-title" className="block text-xs font-medium text-zinc-300">
              Original Idea Title
            </label>
            <input
              id="bounty-title"
              type="text"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              placeholder="e.g., 3-Beat Mirror Transition Lookbook"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="bounty-summary" className="block text-xs font-medium text-zinc-300">
              Concept & Script Breakdown
            </label>
            <textarea
              id="bounty-summary"
              rows={4}
              value={conceptSummary}
              onChange={(e) => setConceptSummary(e.target.value)}
              placeholder="Pitch the 3-second hook, visual beats, and call-to-action..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="bounty-url" className="block text-xs font-medium text-zinc-300">
              Optional Prototype / Reference Link
            </label>
            <input
              id="bounty-url"
              type="url"
              value={workUrl}
              onChange={(e) => setWorkUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-400">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Idea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
