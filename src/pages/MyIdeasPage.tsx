import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Edit3,
  Globe,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import type { CreatorIdea, IdeaCategory, IdeaStatus } from "../types/creatorverse";

const CATEGORIES: IdeaCategory[] = [
  "Comedy & Skits",
  "Tech & Campus",
  "Lifestyle",
  "Music & Dance",
  "Filmmaking",
  "Brand Pitch",
];

const STATUSES: Array<"All" | IdeaStatus> = ["All", "Draft", "In Production", "Completed"];

export function MyIdeasPage() {
  const {
    ideas,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleIdeaStatus,
    publishIdeaToHub,
  } = useCreatorVerse();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | IdeaCategory>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | IdeaStatus>("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<CreatorIdea | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IdeaCategory>("Comedy & Skits");
  const [status, setStatus] = useState<IdeaStatus>("Draft");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [audioTag, setAudioTag] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const prefilledAudio = searchParams.get("audio");
    if (prefilledAudio) {
      setEditingIdea(null);
      setTitle("");
      setDescription("");
      setCategory("Comedy & Skits");
      setStatus("Draft");
      setPlatform("Instagram Reels");
      setAudioTag(prefilledAudio);
      setIsPublic(false);
      setFormError("");
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreateModal = () => {
    setEditingIdea(null);
    setTitle("");
    setDescription("");
    setCategory("Comedy & Skits");
    setStatus("Draft");
    setPlatform("Instagram Reels");
    setAudioTag("");
    setIsPublic(false);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (idea: CreatorIdea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description);
    setCategory(idea.category);
    setStatus(idea.status);
    setPlatform(idea.platform);
    setAudioTag(idea.audioTag || "");
    setIsPublic(idea.isPublic);
    setFormError("");
    setModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (title.trim().length < 3) {
      setFormError("Idea title must be at least 3 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setFormError("Please add a brief description (at least 10 characters).");
      return;
    }

    if (editingIdea) {
      updateIdea(editingIdea.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        platform,
        audioTag: audioTag.trim() || undefined,
      });
    } else {
      addIdea({
        title,
        description,
        category,
        status,
        platform,
        isPublic,
        audioTag,
      });
    }
    setModalOpen(false);
  };

  const filteredIdeas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ideas.filter((idea) => {
      const matchesQuery =
        !q ||
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        (idea.audioTag && idea.audioTag.toLowerCase().includes(q));
      const matchesCat = categoryFilter === "All" || idea.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || idea.status === statusFilter;
      return matchesQuery && matchesCat && matchesStatus;
    });
  }, [ideas, search, categoryFilter, statusFilter]);

  return (
    <DashboardLayout title="My Ideas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Idea Organizer
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Capture concepts, organize by category, track drafts to completion, and publish when
              ready.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg cv-accent-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Idea</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="cv-surface rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, notes, or audio tag..."
                className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as "All" | IdeaCategory)}
                aria-label="Filter by category"
                className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-1 rounded-lg border border-white/10 bg-[#08090D] p-1 overflow-x-auto">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? "bg-white/12 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ideas Grid / Empty State */}
        {filteredIdeas.length === 0 ? (
          <div className="cv-surface rounded-2xl p-10 text-center">
            <p className="font-display text-lg font-semibold text-white">No matching ideas</p>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              {ideas.length === 0
                ? "Start by logging your first reel, short, or video concept."
                : "Try clearing your search or switching status filters."}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Idea</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredIdeas.map((idea) => {
              const statusTextClass =
                idea.status === "Completed"
                  ? "text-emerald-300"
                  : idea.status === "In Production"
                  ? "text-blue-300"
                  : "text-amber-300";

              return (
                <article
                  key={idea.id}
                  className="cv-surface rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-zinc-400">
                        {idea.category} · {idea.platform}
                      </span>
                      <span className={`font-medium ${statusTextClass}`}>{idea.status}</span>
                    </div>

                    <h2 className="mt-2 font-display text-lg font-semibold text-white">
                      {idea.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                      {idea.description}
                    </p>

                    {(idea.audioTag || idea.isPublic) && (
                      <p className="mt-3 text-xs text-zinc-500">
                        {idea.audioTag ? `Audio: ${idea.audioTag}` : ""}
                        {idea.audioTag && idea.isPublic ? " · " : ""}
                        {idea.isPublic ? "Published to Hub" : ""}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleIdeaStatus(idea.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-violet-300" />
                        <span>Advance Status</span>
                      </button>

                      {!idea.isPublic && (
                        <button
                          type="button"
                          onClick={() => publishIdeaToHub(idea.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/10 transition-colors whitespace-nowrap"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>Publish</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(idea)}
                        aria-label={`Edit ${idea.title}`}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {confirmDeleteId === idea.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteIdea(idea.id);
                              setConfirmDeleteId(null);
                            }}
                            className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(idea.id)}
                          aria-label={`Delete ${idea.title}`}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="idea-modal-title"
            className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <h2 id="idea-modal-title" className="font-display text-lg font-semibold text-white">
                {editingIdea ? "Edit Idea" : "Create New Idea"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="idea-title" className="block text-xs font-medium text-zinc-300">
                  Title
                </label>
                <input
                  id="idea-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 8 AM Lab Sprint One-Take"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="idea-desc" className="block text-xs font-medium text-zinc-300">
                  Concept & Shot Notes
                </label>
                <textarea
                  id="idea-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the hook, storyline, and punchline..."
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="idea-cat" className="block text-xs font-medium text-zinc-300">
                    Category
                  </label>
                  <select
                    id="idea-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IdeaCategory)}
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
                  <label htmlFor="idea-status" className="block text-xs font-medium text-zinc-300">
                    Status
                  </label>
                  <select
                    id="idea-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as IdeaStatus)}
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Production">In Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="idea-platform" className="block text-xs font-medium text-zinc-300">
                    Platform
                  </label>
                  <select
                    id="idea-platform"
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
              </div>

              <div>
                <label htmlFor="idea-audio" className="block text-xs font-medium text-zinc-300">
                  Paired Audio Track (Optional)
                </label>
                <input
                  id="idea-audio"
                  type="text"
                  value={audioTag}
                  onChange={(e) => setAudioTag(e.target.value)}
                  placeholder="e.g., Obsidian Pulse 118"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {!editingIdea && (
                <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#08090D] accent-violet-500"
                  />
                  <span>Also publish directly to the Public Idea Hub</span>
                </label>
              )}

              {formError && (
                <p role="alert" className="text-xs font-medium text-rose-400">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  {editingIdea ? "Save Changes" : "Save Idea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
