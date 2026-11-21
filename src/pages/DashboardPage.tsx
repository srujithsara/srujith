import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  FolderKanban,
  Heart,
  Pause,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { audioPreviewEngine } from "../utils/audioPreview";

export function DashboardPage() {
  const {
    user,
    ideas,
    publicIdeas,
    audioTracks,
    creators,
    collabRequests,
    campaigns,
    toggleLikePublicIdea,
    toggleSavePublicIdea,
  } = useCreatorVerse();

  const navigate = useNavigate();
  const [quickPrompt, setQuickPrompt] = useState(
    "I'm a B.Tech student living in a hostel. Give me a funny Telugu reel idea."
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);

  useEffect(() => {
    return () => {
      audioPreviewEngine.stop();
    };
  }, []);

  const handleToggleAudio = (trackId: string) => {
    if (playingId === trackId) {
      audioPreviewEngine.stop();
      setPlayingId(null);
      setPlayProgress(0);
      return;
    }

    const track = audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    setPlayingId(trackId);
    setPlayProgress(0);
    audioPreviewEngine.playLoop(
      track.id,
      track.synthNotes,
      track.bpm,
      track.synthWaveform,
      (pct) => setPlayProgress(pct),
      () => {
        setPlayingId(null);
        setPlayProgress(0);
      }
    );
  };

  const handleLaunchAI = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(quickPrompt.trim());
    navigate(`/ai-generator?prompt=${encoded}`);
  };

  const publishedCount = ideas.filter((i) => i.isPublic).length;
  const activeCollabCount = collabRequests.length;
  const openCampaignsCount = campaigns.filter((c) => !c.applied).length;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-violet-300">
              {user.name} · {user.role} · {user.location}
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to your TRENDSPACE.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/ideas"
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-4 py-2 text-xs sm:text-sm font-medium text-zinc-200 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
            >
              <FolderKanban className="h-4 w-4 text-violet-300" />
              <span>New Idea</span>
            </Link>
            <Link
              to="/ai-generator"
              className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Open AI Studio</span>
            </Link>
          </div>
        </section>

        {/* Quick Statistics Strip (4 KPI Cards with tabular-nums) */}
        <section aria-label="Workspace statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            to="/ideas"
            className="cv-surface rounded-xl p-5 hover:border-violet-500/35 transition-colors"
          >
            <p className="text-xs font-medium text-zinc-400">My Ideas</p>
            <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {ideas.length}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {ideas.filter((i) => i.status === "Completed").length} completed
            </p>
          </Link>

          <Link
            to="/hub"
            className="cv-surface rounded-xl p-5 hover:border-violet-500/35 transition-colors"
          >
            <p className="text-xs font-medium text-zinc-400">Published Ideas</p>
            <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {publishedCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{publicIdeas.length} in community hub</p>
          </Link>

          <Link
            to="/collaborate"
            className="cv-surface rounded-xl p-5 hover:border-violet-500/35 transition-colors"
          >
            <p className="text-xs font-medium text-zinc-400">Collaborations</p>
            <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {activeCollabCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {collabRequests.filter((r) => r.status === "Pending").length} pending review
            </p>
          </Link>

          <Link
            to="/brands"
            className="cv-surface rounded-xl p-5 hover:border-violet-500/35 transition-colors"
          >
            <p className="text-xs font-medium text-zinc-400">Opportunities</p>
            <p className="mt-2 font-mono text-2xl sm:text-3xl font-semibold text-white tabular-nums">
              {openCampaignsCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {campaigns.filter((c) => c.applied).length} applied campaigns
            </p>
          </Link>
        </section>

        {/* AI Idea Generator Shortcut */}
        <section className="cv-surface rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                AI Idea Generator Shortcut
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Describe your real-life situation or niche and jump straight into structured hooks
                and scripts.
              </p>
            </div>
            <Link
              to="/ai-generator"
              className="text-xs font-medium text-violet-300 hover:text-violet-200 whitespace-nowrap"
            >
              Configure language & tone →
            </Link>
          </div>

          <form onSubmit={handleLaunchAI} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="e.g., I'm a B.Tech student living in a hostel. Give me a funny Telugu reel idea."
              aria-label="Quick AI topic prompt"
              className="flex-1 rounded-lg border border-white/10 bg-[#08090D] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Script</span>
            </button>
          </form>
        </section>

        {/* Main 2-Column Workspace Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recommended Public Ideas */}
          <section className="lg:col-span-7 cv-surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Recommended Public Ideas
                </h2>
                <p className="text-xs text-zinc-400">Popular formats from creators this week</p>
              </div>
              <Link
                to="/hub"
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200 whitespace-nowrap"
              >
                <span>Open Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/6">
              {publicIdeas.slice(0, 3).map((item) => (
                <article key={item.id} className="py-4 first:pt-4 last:pb-0">
                  <p className="text-xs text-zinc-500">
                    {item.category} · {item.platform} · by {item.authorName}
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleLikePublicIdea(item.id)}
                      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                        item.likedByMe ? "text-rose-400" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${item.likedByMe ? "fill-current" : ""}`} />
                      <span className="tabular-nums">{item.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSavePublicIdea(item.id)}
                      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                        item.savedByMe ? "text-violet-300" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${item.savedByMe ? "fill-current" : ""}`}
                      />
                      <span className="tabular-nums">{item.saves}</span>
                    </button>
                    <Link
                      to="/hub"
                      className="ml-auto text-xs font-medium text-zinc-300 hover:text-white"
                    >
                      View & Remix →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Trending Topics & Audio */}
          <section className="lg:col-span-5 cv-surface rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    Trending Audio
                  </h2>
                  <p className="text-xs text-zinc-400">Sample preview tracks</p>
                </div>
                <Link
                  to="/audio"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-300 hover:text-blue-200 whitespace-nowrap"
                >
                  <span>All Audio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {audioTracks.slice(0, 4).map((track) => {
                  const isPlaying = playingId === track.id;
                  return (
                    <div
                      key={track.id}
                      className="rounded-xl border border-white/8 bg-[#0B0C12] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleAudio(track.id)}
                            aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 translate-x-0.5" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{track.title}</p>
                            <p className="text-xs text-zinc-400 truncate">
                              {track.creator} · {track.trendStatus}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-zinc-400 shrink-0 tabular-nums">
                          {track.bpm} BPM
                        </span>
                      </div>
                      {isPlaying && (
                        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full cv-accent-gradient transition-all duration-150"
                            style={{ width: `${playProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/8 text-xs text-zinc-500">
              Trending topics: Campus Hostel Reels · 120 BPM Match Cuts · Silent Foley Vlogs
            </div>
          </section>
        </div>

        {/* Bottom 2-Column Row: Suggested Creators & Brand Opportunities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Suggested Creators */}
          <section className="lg:col-span-6 cv-surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-300" />
                <h2 className="font-display text-lg font-semibold text-white">
                  Suggested Creators
                </h2>
              </div>
              <Link
                to="/collaborate"
                className="text-xs font-medium text-violet-300 hover:text-violet-200 whitespace-nowrap"
              >
                Find collaborators →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-white/6">
              {creators.slice(0, 3).map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MediaImage
                      src={creator.avatarUrl}
                      alt={creator.name}
                      fallbackLabel={creator.name}
                      variant="avatar"
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{creator.name}</p>
                      <p className="text-xs text-zinc-400 truncate">
                        {creator.skills.slice(0, 2).join(" · ")} · {creator.location}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/collaborate"
                    className="rounded-lg border border-white/12 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/5 whitespace-nowrap shrink-0"
                  >
                    Connect
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Brand Campaign Opportunities */}
          <section className="lg:col-span-6 cv-surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-300" />
                <h2 className="font-display text-lg font-semibold text-white">
                  Brand Campaign Opportunities
                </h2>
              </div>
              <Link
                to="/brands"
                className="text-xs font-medium text-blue-300 hover:text-blue-200 whitespace-nowrap"
              >
                Marketplace →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-white/6">
              {campaigns.slice(0, 3).map((camp) => (
                <div
                  key={camp.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">
                      {camp.brandName} · Due {camp.deadline}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-white truncate">{camp.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-semibold text-emerald-300 tabular-nums">
                      {camp.reward}
                    </p>
                    <Link
                      to="/brands"
                      className="mt-0.5 inline-block text-xs text-zinc-400 hover:text-white"
                    >
                      {camp.applied ? camp.applicationStatus : "Apply →"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
