import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Copy,
  FolderPlus,
  Loader2,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { buildDemoAIGenerations } from "../data/demoData";
import type { AIGeneratedConcept, IdeaCategory } from "../types/creatorverse";

const EXAMPLE_PROMPTS = [
  "I'm a B.Tech student living in a hostel. Give me a funny Telugu reel idea.",
  "I'm a solo filmmaker shooting in a small bedroom with one desk lamp.",
  "College placement season stress turned into a relatable short comedy skit.",
  "Reviewing budget wireless earbuds on a noisy metro commute.",
];

const PLATFORMS = [
  "Instagram Reels",
  "YouTube Shorts",
  "YouTube Long-form",
  "LinkedIn Video",
];
const LANGUAGES = ["Telugu", "English", "Hindi", "Tamil", "Bilingual (Tenglish / Hinglish)"];
const CONTENT_TYPES = [
  "Comedy Skit",
  "POV / Relatable",
  "Storytime",
  "Educational Breakdown",
  "Product Review",
];
const TONES = [
  "Witty & Satirical",
  "Casual & Relatable",
  "High-Energy",
  "Cinematic & Emotional",
];

export function AIGeneratorPage() {
  const { settings, addIdea, showToast } = useCreatorVerse();
  const [searchParams] = useSearchParams();

  const [topic, setTopic] = useState(
    searchParams.get("prompt") ||
      "I'm a B.Tech student living in a hostel. Give me a funny Telugu reel idea."
  );
  const [platform, setPlatform] = useState(settings.defaultPlatform || "Instagram Reels");
  const [language, setLanguage] = useState(settings.defaultLanguage || "Telugu");
  const [contentType, setContentType] = useState("Comedy Skit");
  const [tone, setTone] = useState("Witty & Satirical");

  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<AIGeneratedConcept[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: { configured?: boolean }) => {
        if (!active) return;
        const configured = Boolean(data.configured);
        setServerConfigured(configured);
        if (!configured) {
          setUseDemoMode(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setServerConfigured(false);
        setUseDemoMode(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const runDemoGeneration = () => {
    setLoading(true);
    setErrorMsg("");
    window.setTimeout(() => {
      const demoConcepts = buildDemoAIGenerations(
        topic,
        platform,
        language,
        contentType,
        tone
      );
      setResults(demoConcepts);
      setLoading(false);
    }, 450);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (topic.trim().length < 5) {
      setErrorMsg("Please describe your topic or real-life situation in at least 5 characters.");
      return;
    }

    if (useDemoMode || serverConfigured === false) {
      runDemoGeneration();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          platform,
          language,
          contentType,
          tone,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        ideas?: Array<{
          title: string;
          hook: string;
          script: string;
          caption: string;
          hashtags: string[];
          productionTip: string;
        }>;
      };

      if (!response.ok) {
        setErrorMsg(
          data.message || "AI service could not complete this request. You can switch to Demo Mode below."
        );
        setLoading(false);
        return;
      }

      const mapped: AIGeneratedConcept[] = (data.ideas || []).map((item, index) => ({
        id: `live_ai_${Date.now()}_${index}`,
        title: item.title,
        hook: item.hook,
        script: item.script,
        caption: item.caption,
        hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
        productionTip: item.productionTip,
        mode: "live",
      }));

      setResults(mapped);
    } catch {
      setErrorMsg("Network error reaching AI backend. Please retry or switch to Demo Mode.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConcept = (concept: AIGeneratedConcept) => {
    const categoryMap: Record<string, IdeaCategory> = {
      "Comedy Skit": "Comedy & Skits",
      "POV / Relatable": "Tech & Campus",
      Storytime: "Lifestyle",
      "Educational Breakdown": "Tech & Campus",
      "Product Review": "Brand Pitch",
    };

    addIdea({
      title: concept.title,
      description: `Hook: ${concept.hook}\n\nScript:\n${concept.script}\n\nCaption: ${concept.caption}`,
      category: categoryMap[contentType] || "Comedy & Skits",
      status: "Draft",
      platform,
      isPublic: false,
    });

    setResults((prev) =>
      prev.map((item) => (item.id === concept.id ? { ...item, saved: true } : item))
    );
  };

  const handleCopyScript = async (concept: AIGeneratedConcept) => {
    const text = `${concept.title}\n\nHook: ${concept.hook}\n\nScript:\n${concept.script}\n\nCaption: ${concept.caption} ${concept.hashtags.join(" ")}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(concept.id);
      showToast("Hook, script, and caption copied.");
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showToast("Ready to copy from card.", "info");
    }
  };

  return (
    <DashboardLayout title="AI Idea Generator">
      <div className="space-y-6">
        {/* Header & Mode Control */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              AI Idea Generator
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Turn real-life moments into shootable hooks, short scripts, and localized captions.
            </p>
          </div>

          {/* Explicit Live vs Demo Mode Indicator */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#101119] p-1 self-start sm:self-auto">
            <button
              type="button"
              disabled={serverConfigured === false}
              onClick={() => setUseDemoMode(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                !useDemoMode && serverConfigured
                  ? "bg-violet-500/25 text-white"
                  : "text-zinc-400 disabled:opacity-40"
              }`}
            >
              {serverConfigured ? "Live Server AI" : "Server AI Unavailable"}
            </button>
            <button
              type="button"
              onClick={() => setUseDemoMode(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                useDemoMode ? "bg-blue-500/25 text-blue-200" : "text-zinc-400 hover:text-white"
              }`}
            >
              Demo Mode
            </button>
          </div>
        </div>

        {useDemoMode && (
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-xs sm:text-sm text-blue-200 flex items-center justify-between gap-3">
            <span>
              <strong>Demo Mode Active:</strong>{" "}
              {serverConfigured === false
                ? "No server AI key is configured in this environment, so structured sample concepts are generated locally."
                : "Generating curated offline sample concepts. Switch to Live Server AI above anytime."}
            </span>
          </div>
        )}

        {/* Prompt & Controls Form */}
        <form onSubmit={handleGenerate} className="cv-surface rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor="ai-topic" className="block text-xs font-medium text-zinc-300">
              Topic or Real-Life Situation
            </label>
            <textarea
              id="ai-topic"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., I'm a B.Tech student living in a hostel. Give me a funny Telugu reel idea."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#08090D] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            />
            <div className="mt-2.5 flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setTopic(ex)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="ai-platform" className="block text-xs font-medium text-zinc-400">
                Platform
              </label>
              <select
                id="ai-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ai-language" className="block text-xs font-medium text-zinc-400">
                Language
              </label>
              <select
                id="ai-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ai-type" className="block text-xs font-medium text-zinc-400">
                Content Type
              </label>
              <select
                id="ai-type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ai-tone" className="block text-xs font-medium text-zinc-400">
                Tone
              </label>
              <select
                id="ai-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {TONES.map((tn) => (
                  <option key={tn} value={tn}>
                    {tn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              {!useDemoMode && (
                <button
                  type="button"
                  onClick={() => {
                    setUseDemoMode(true);
                    runDemoGeneration();
                  }}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 whitespace-nowrap self-start sm:self-auto"
                >
                  Use Demo Mode Instead
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Concepts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Ideas & Scripts</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="cv-surface rounded-2xl p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-6 w-3/4 rounded bg-white/10" />
                <div className="h-24 w-full rounded bg-white/8" />
              </div>
            ))}
          </div>
        )}

        {/* Generated Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Generated Concepts ({results.length})
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {results.map((concept) => (
                <article key={concept.id} className="cv-surface rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-400">
                      {platform} · {language} ·{" "}
                      <span
                        className={
                          concept.mode === "live" ? "text-emerald-300" : "text-blue-300"
                        }
                      >
                        {concept.mode === "live" ? "Live AI Output" : "Demo Mode Output"}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyScript(concept)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5 whitespace-nowrap"
                      >
                        {copiedId === concept.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedId === concept.id ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={concept.saved}
                        onClick={() => handleSaveConcept(concept)}
                        className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
                      >
                        <FolderPlus className="h-3.5 w-3.5" />
                        <span>{concept.saved ? "Saved to My Ideas" : "Save to My Ideas"}</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white">{concept.title}</h3>

                  <div className="rounded-xl border border-white/8 bg-[#0B0C12] p-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-violet-300">3-Second Hook</p>
                      <p className="mt-1 text-zinc-100">{concept.hook}</p>
                    </div>

                    <div className="border-t border-white/6 pt-3">
                      <p className="text-xs font-semibold text-blue-300">Shot-by-Shot Script</p>
                      <p className="mt-1 text-zinc-300 whitespace-pre-line leading-relaxed">
                        {concept.script}
                      </p>
                    </div>

                    <div className="border-t border-white/6 pt-3">
                      <p className="text-xs font-semibold text-zinc-400">Caption & Hashtags</p>
                      <p className="mt-1 text-zinc-200">{concept.caption}</p>
                      <p className="mt-1.5 text-xs text-violet-300">
                        {concept.hashtags.join("  ")}
                      </p>
                    </div>

                    <div className="border-t border-white/6 pt-3 text-xs text-zinc-400">
                      <strong className="text-zinc-200">Production Tip:</strong>{" "}
                      {concept.productionTip}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
