import React, { useMemo, useState } from "react";
import {
  Bookmark,
  CopyPlus,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Share2,
  X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import type { IdeaCategory } from "../types/creatorverse";

const CATEGORIES: Array<"All" | IdeaCategory> = [
  "All",
  "Comedy & Skits",
  "Tech & Campus",
  "Lifestyle",
  "Music & Dance",
  "Filmmaking",
  "Brand Pitch",
];

export function PublicHubPage() {
  const {
    publicIdeas,
    toggleLikePublicIdea,
    toggleSavePublicIdea,
    addCommentToPublicIdea,
    clonePublicIdeaToMyIdeas,
    publishNewPublicIdea,
    showToast,
  } = useCreatorVerse();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | IdeaCategory>("All");
  const [sortBy, setSortBy] = useState<"likes" | "newest" | "saved">("likes");

  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Publish modal
  const [publishOpen, setPublishOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState("");
  const [pubDesc, setPubDesc] = useState("");
  const [pubCategory, setPubCategory] = useState<IdeaCategory>("Comedy & Skits");
  const [pubPlatform, setPubPlatform] = useState("Instagram Reels");
  const [pubError, setPubError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publicIdeas
      .filter((item) => {
        const matchesQ =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.authorName.toLowerCase().includes(q);
        const matchesCat = category === "All" || item.category === category;
        const matchesSavedFilter = sortBy !== "saved" || item.savedByMe;
        return matchesQ && matchesCat && matchesSavedFilter;
      })
      .sort((a, b) => {
        if (sortBy === "likes") return b.likes - a.likes;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [publicIdeas, search, category, sortBy]);

  const handleShare = async (title: string, id: string) => {
    const shareUrl = `${window.location.origin}/hub#${id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${title} — ${shareUrl}`);
      }
      showToast("Idea link copied to clipboard.");
    } catch {
      showToast("Share link ready: " + shareUrl, "info");
    }
  };

  const handlePostComment = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const text = (commentInputs[id] || "").trim();
    if (!text) return;
    addCommentToPublicIdea(id, text);
    setCommentInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPubError("");
    if (pubTitle.trim().length < 4) {
      setPubError("Title must be at least 4 characters.");
      return;
    }
    if (pubDesc.trim().length < 15) {
      setPubError("Please share enough detail for other creators (at least 15 characters).");
      return;
    }
    publishNewPublicIdea({
      title: pubTitle,
      description: pubDesc,
      category: pubCategory,
      platform: pubPlatform,
    });
    setPubTitle("");
    setPubDesc("");
    setPublishOpen(false);
  };

  return (
    <DashboardLayout title="Public Idea Hub">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Public Idea Hub
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Publish concepts openly, collect creator feedback, and remix proven formats into your
              own queue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPublishOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg cv-accent-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Idea</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="cv-surface rounded-xl p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public ideas or authors..."
                className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#08090D] p-1">
              {(
                [
                  { id: "likes", label: "Most Liked" },
                  { id: "newest", label: "Newest" },
                  { id: "saved", label: "Saved" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSortBy(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    sortBy === tab.id ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
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

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="cv-surface rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-white">No public ideas found</p>
            <p className="mt-2 text-sm text-zinc-400">
              Try another category or publish a fresh concept for the community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const commentsOpen = openCommentsId === item.id;
              return (
                <article key={item.id} className="cv-surface rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MediaImage
                        src={item.authorAvatar}
                        alt={item.authorName}
                        fallbackLabel={item.authorName}
                        variant="avatar"
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                      <div className="text-xs">
                        <p className="font-medium text-white">
                          {item.authorName}{" "}
                          <span className="text-zinc-500 font-normal">{item.authorHandle}</span>
                        </p>
                        <p className="text-zinc-400">
                          {item.category} · {item.platform} ·{" "}
                          <span className="tabular-nums">{item.createdAt}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => clonePublicIdeaToMyIdeas(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/15 hover:border-violet-500/40 transition-colors whitespace-nowrap self-start sm:self-auto"
                    >
                      <CopyPlus className="h-3.5 w-3.5" />
                      <span>Use This Idea ({item.usesCount})</span>
                    </button>
                  </div>

                  <h2 className="mt-4 font-display text-xl font-semibold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.description}</p>

                  {/* Action Row */}
                  <div className="mt-5 pt-4 border-t border-white/8 flex flex-wrap items-center gap-5 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleLikePublicIdea(item.id)}
                      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                        item.likedByMe ? "text-rose-400" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${item.likedByMe ? "fill-current" : ""}`} />
                      <span className="tabular-nums">{item.likes} Likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenCommentsId(commentsOpen ? null : item.id)}
                      className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="tabular-nums">{item.comments.length} Comments</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSavePublicIdea(item.id)}
                      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
                        item.savedByMe ? "text-violet-300" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${item.savedByMe ? "fill-current" : ""}`}
                      />
                      <span className="tabular-nums">
                        {item.savedByMe ? "Saved" : "Save"} ({item.saves})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(item.title, item.id)}
                      className="inline-flex items-center gap-1.5 font-medium text-zinc-400 hover:text-white transition-colors ml-auto"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Drawer */}
                  {commentsOpen && (
                    <div className="mt-4 border-t border-white/8 pt-4 space-y-3">
                      {item.comments.length === 0 ? (
                        <p className="text-xs text-zinc-500">
                          No comments yet. Share a filming tip or reaction below.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {item.comments.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-lg bg-[#0B0C12] border border-white/6 px-3.5 py-2.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-white">
                                  {c.authorName}{" "}
                                  <span className="text-zinc-500 font-normal">
                                    {c.authorHandle}
                                  </span>
                                </span>
                                <span className="text-zinc-500 tabular-nums">{c.createdAt}</span>
                              </div>
                              <p className="mt-1 text-xs sm:text-sm text-zinc-300">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => handlePostComment(e, item.id)}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputs[item.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Add a comment or shooting suggestion..."
                          className="flex-1 rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90 whitespace-nowrap"
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Publish Public Idea Modal */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pub-modal-title"
            className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <h2 id="pub-modal-title" className="font-display text-lg font-semibold text-white">
                Publish Idea to Public Hub
              </h2>
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="pub-title" className="block text-xs font-medium text-zinc-300">
                  Concept Title
                </label>
                <input
                  id="pub-title"
                  type="text"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  placeholder="e.g., 3-Angle Coffee Pour Match Cut"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="pub-desc" className="block text-xs font-medium text-zinc-300">
                  Idea Breakdown
                </label>
                <textarea
                  id="pub-desc"
                  rows={4}
                  value={pubDesc}
                  onChange={(e) => setPubDesc(e.target.value)}
                  placeholder="Explain the hook, visual transition, or comedy beat so other creators can build on it..."
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pub-cat" className="block text-xs font-medium text-zinc-300">
                    Category
                  </label>
                  <select
                    id="pub-cat"
                    value={pubCategory}
                    onChange={(e) => setPubCategory(e.target.value as IdeaCategory)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pub-plat" className="block text-xs font-medium text-zinc-300">
                    Target Platform
                  </label>
                  <select
                    id="pub-plat"
                    value={pubPlatform}
                    onChange={(e) => setPubPlatform(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option>Instagram Reels</option>
                    <option>YouTube Shorts</option>
                    <option>YouTube Long-form</option>
                    <option>LinkedIn Video</option>
                  </select>
                </div>
              </div>

              {pubError && (
                <p role="alert" className="text-xs font-medium text-rose-400">
                  {pubError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPublishOpen(false)}
                  className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Publish Publicly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
