import React, { useState } from "react";
import { Database, Download, RotateCcw, Save } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import {
  getSupabaseArchitectureStatus,
  SUPABASE_SCHEMA_BLUEPRINT,
} from "../services/supabaseArchitecture";

export function SettingsPage() {
  const {
    user,
    settings,
    ideas,
    publicIdeas,
    collabRequests,
    campaigns,
    updateSettings,
    resetDemoWorkspace,
    showToast,
  } = useCreatorVerse();

  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [collabAlerts, setCollabAlerts] = useState(settings.collabAlerts);
  const [brandDigest, setBrandDigest] = useState(settings.brandDigest);
  const [defaultPlatform, setDefaultPlatform] = useState(settings.defaultPlatform);
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage);
  const [confirmReset, setConfirmReset] = useState(false);

  const supabaseStatus = getSupabaseArchitectureStatus();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      emailNotifications,
      collabAlerts,
      brandDigest,
      defaultPlatform,
      defaultLanguage,
    });
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      ideas,
      publicIdeas,
      collabRequests,
      campaigns,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trendspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Workspace JSON backup downloaded.");
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Configure creator defaults, notification rules, and data persistence options.
          </p>
        </div>

        {/* Workspace & AI Defaults */}
        <form onSubmit={handleSaveSettings} className="cv-surface rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold text-white border-b border-white/8 pb-3">
            Workspace & Notification Preferences
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="set-platform" className="block text-xs font-medium text-zinc-300">
                Default Target Platform
              </label>
              <select
                id="set-platform"
                value={defaultPlatform}
                onChange={(e) => setDefaultPlatform(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                <option>Instagram Reels</option>
                <option>YouTube Shorts</option>
                <option>YouTube Long-form</option>
                <option>LinkedIn Video</option>
              </select>
            </div>

            <div>
              <label htmlFor="set-language" className="block text-xs font-medium text-zinc-300">
                Default Script Language
              </label>
              <select
                id="set-language"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                <option>Telugu</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Bilingual (Tenglish / Hinglish)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#0B0C12] px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Collaboration Alerts</p>
                <p className="text-xs text-zinc-400">
                  Notify when creators send or accept project invitations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={collabAlerts}
                onChange={(e) => setCollabAlerts(e.target.checked)}
                className="h-4 w-4 accent-violet-500"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#0B0C12] px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Brand Campaign Digest</p>
                <p className="text-xs text-zinc-400">
                  Receive weekly updates on matching paid brand briefs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={brandDigest}
                onChange={(e) => setBrandDigest(e.target.checked)}
                className="h-4 w-4 accent-violet-500"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#0B0C12] px-4 py-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Email Summaries</p>
                <p className="text-xs text-zinc-400">
                  Weekly recap of public hub likes, saves, and remixes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 accent-violet-500"
              />
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>

        {/* Supabase Architecture Readiness */}
        <section className="cv-surface rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-300" />
              <h2 className="font-display text-lg font-semibold text-white">
                Persistence & Supabase Architecture
              </h2>
            </div>
            <span className="text-xs font-medium text-blue-300">
              {supabaseStatus.configured
                ? "Supabase Env Configured"
                : "Local Demo Storage Active"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your workspace currently persists seamlessly in browser localStorage for instant demos.
            All entities follow the production Supabase Auth, Postgres RLS, and Storage schema
            below:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/8 text-zinc-400">
                <tr>
                  <th className="py-2 pr-4 font-medium">Table</th>
                  <th className="py-2 pr-4 font-medium">Responsibility</th>
                  <th className="py-2 font-medium">Storage Bucket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-zinc-300">
                {SUPABASE_SCHEMA_BLUEPRINT.map((row) => (
                  <tr key={row.table}>
                    <td className="py-2.5 pr-4 font-mono text-violet-300">{row.table}</td>
                    <td className="py-2.5 pr-4">{row.purpose}</td>
                    <td className="py-2.5 font-mono text-zinc-400">
                      {row.storageBucket || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Backup & Demo Reset */}
        <section className="cv-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Demo Data Management
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Export your current ideas and applications as JSON, or reset back to fresh sample
              data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.08]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetDemoWorkspace();
                    setConfirmReset(false);
                  }}
                  className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
