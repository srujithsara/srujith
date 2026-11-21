import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  FolderPlus,
  Info,
  Pause,
  Play,
  Search,
  Volume2,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { audioPreviewEngine } from "../utils/audioPreview";
import type { AudioTrendStatus } from "../types/creatorverse";

const AUDIO_CATEGORIES = [
  "All",
  "Beat / Lo-Fi",
  "Regional Comedy",
  "Cinematic",
  "Dialogue Hook",
  "Upbeat Pop",
] as const;

const TREND_STATUSES: Array<"All" | AudioTrendStatus> = [
  "All",
  "Peak Viral",
  "Rising Fast",
  "Breakout",
  "Steady",
];

export function TrendingAudioPage() {
  const { audioTracks, toggleSaveAudio } = useCreatorVerse();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof AUDIO_CATEGORIES)[number]>("All");
  const [trendFilter, setTrendFilter] = useState<"All" | AudioTrendStatus>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      audioPreviewEngine.stop();
    };
  }, []);

  const handleTogglePlay = (trackId: string) => {
    if (playingId === trackId) {
      audioPreviewEngine.stop();
      setPlayingId(null);
      setProgress(0);
      return;
    }

    const track = audioTracks.find((t) => t.id === trackId);
    if (!track) return;

    setPlayingId(trackId);
    setProgress(0);
    audioPreviewEngine.playLoop(
      track.id,
      track.synthNotes,
      track.bpm,
      track.synthWaveform,
      (pct) => setProgress(pct),
      () => {
        setPlayingId(null);
        setProgress(0);
      }
    );
  };

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return audioTracks.filter((t) => {
      const matchesQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.creator.toLowerCase().includes(q) ||
        t.moodNote.toLowerCase().includes(q);
      const matchesCat = category === "All" || t.category === category;
      const matchesTrend = trendFilter === "All" || t.trendStatus === trendFilter;
      return matchesQ && matchesCat && matchesTrend;
    });
  }, [audioTracks, search, category, trendFilter]);

  return (
    <DashboardLayout title="Trending Audio">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Trending Audio Discovery
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Preview beats, regional comedy cues, and cinematic risers matched to your next shoot.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
            <Info className="h-4 w-4 shrink-0" />
            <span>Sample / Demo Audio Library (interactive Web Audio synth previews)</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="cv-surface rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audio title, artist, or mood..."
                className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={trendFilter}
                onChange={(e) => setTrendFilter(e.target.value as "All" | AudioTrendStatus)}
                aria-label="Filter by trend status"
                className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                {TREND_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === "All" ? "All Trend Velocity" : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {AUDIO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? "bg-violet-500/20 text-violet-200 border border-violet-500/35"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Grid */}
        {filteredTracks.length === 0 ? (
          <div className="cv-surface rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-white">No audio tracks match</p>
            <p className="mt-2 text-sm text-zinc-400">
              Reset your category or trend filters to explore all sample tracks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredTracks.map((track) => {
              const isPlaying = playingId === track.id;
              const trendColor =
                track.trendStatus === "Peak Viral"
                  ? "text-emerald-300"
                  : track.trendStatus === "Rising Fast"
                  ? "text-violet-300"
                  : track.trendStatus === "Breakout"
                  ? "text-blue-300"
                  : "text-zinc-400";

              return (
                <article
                  key={track.id}
                  className="cv-surface rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePlay(track.id)}
                          aria-label={isPlaying ? `Stop ${track.title}` : `Play ${track.title}`}
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                            isPlaying
                              ? "cv-accent-gradient text-white border-transparent"
                              : "bg-violet-500/12 text-violet-300 border-violet-500/30 hover:bg-violet-500/25"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 translate-x-0.5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h2 className="font-display text-base font-semibold text-white truncate">
                            {track.title}
                          </h2>
                          <p className="text-xs text-zinc-400 truncate">
                            {track.creator} · {track.category}
                          </p>
                        </div>
                      </div>

                      <span className={`text-xs font-medium whitespace-nowrap ${trendColor}`}>
                        {track.trendStatus}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{track.moodNote}</p>

                    {/* Playback Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Volume2 className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{isPlaying ? "Playing synth preview..." : "Click play to audition"}</span>
                        </span>
                        <span className="font-mono tabular-nums">
                          {track.bpm} BPM · 0:{String(track.durationSec).padStart(2, "0")} ·{" "}
                          {track.usageCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full cv-accent-gradient transition-all duration-150"
                          style={{ width: `${isPlaying ? progress : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSaveAudio(track.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        track.savedByMe ? "text-violet-300" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${track.savedByMe ? "fill-current" : ""}`}
                      />
                      <span>{track.savedByMe ? "Saved Audio" : "Save Audio"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/ideas?audio=${encodeURIComponent(track.title)}`)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
                    >
                      <FolderPlus className="h-3.5 w-3.5 text-blue-300" />
                      <span>Use in Idea</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
