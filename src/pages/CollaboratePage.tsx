import React, { useMemo, useState } from "react";
import {
  Check,
  MapPin,
  Search,
  Send,
  UserCheck,
  X,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import type { CreatorDirectoryMember } from "../types/creatorverse";

const SKILL_FILTERS = [
  "All",
  "Acting",
  "Editing",
  "Dancing",
  "Scripting",
  "Cinematography",
  "Sound Design",
];

const LANGUAGE_FILTERS = ["All", "Telugu", "English", "Hindi", "Tamil"];
const LOCATION_FILTERS = ["All", "Hyderabad", "Bengaluru", "Mumbai", "Chennai", "Pune"];

export function CollaboratePage() {
  const {
    creators,
    ideas,
    collabRequests,
    sendCollabRequest,
    cancelCollabRequest,
    respondIncomingCollab,
  } = useCreatorVerse();

  const [tab, setTab] = useState<"discover" | "requests">("discover");
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
  const [locFilter, setLocFilter] = useState("All");

  // Modal state
  const [selectedCreator, setSelectedCreator] = useState<CreatorDirectoryMember | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [pitchMessage, setPitchMessage] = useState("");
  const [formError, setFormError] = useState("");

  const filteredCreators = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creators.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSkill = skillFilter === "All" || c.skills.includes(skillFilter);
      const matchesLang = langFilter === "All" || c.languages.includes(langFilter);
      const matchesLoc = locFilter === "All" || c.location === locFilter;
      return matchesQ && matchesSkill && matchesLang && matchesLoc;
    });
  }, [creators, search, skillFilter, langFilter, locFilter]);

  const openRequestModal = (creator: CreatorDirectoryMember) => {
    setSelectedCreator(creator);
    setProjectTitle(ideas[0]?.title || "");
    setPitchMessage("");
    setFormError("");
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreator) return;
    setFormError("");

    if (projectTitle.trim().length < 3) {
      setFormError("Please enter a project or reel title (at least 3 characters).");
      return;
    }
    if (pitchMessage.trim().length < 12) {
      setFormError("Please include a short collaboration note (at least 12 characters).");
      return;
    }

    sendCollabRequest({
      creator: selectedCreator,
      projectTitle,
      message: pitchMessage,
    });
    setSelectedCreator(null);
  };

  const getLatestSentRequest = (creatorId: string) =>
    collabRequests.find((r) => r.direction === "sent" && r.creatorId === creatorId);

  return (
    <DashboardLayout title="Creator Collaboration">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Creator Collaboration
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Find actors, editors, dancers, scriptwriters, and cinematographers by skill, language,
              and city.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#101119] p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab("discover")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                tab === "discover" ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Discover Creators
            </button>
            <button
              type="button"
              onClick={() => setTab("requests")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                tab === "requests" ? "bg-white/12 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Requests ({collabRequests.length})
            </button>
          </div>
        </div>

        {tab === "discover" ? (
          <>
            {/* Search & Filters */}
            <div className="cv-surface rounded-xl p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="relative md:col-span-5">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search creators, roles, or skills..."
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    aria-label="Filter by skill"
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    {SKILL_FILTERS.map((s) => (
                      <option key={s} value={s}>
                        {s === "All" ? "All Skills" : s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={langFilter}
                    onChange={(e) => setLangFilter(e.target.value)}
                    aria-label="Filter by language"
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    {LANGUAGE_FILTERS.map((l) => (
                      <option key={l} value={l}>
                        {l === "All" ? "All Languages" : l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={locFilter}
                    onChange={(e) => setLocFilter(e.target.value)}
                    aria-label="Filter by location"
                    className="w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    {LOCATION_FILTERS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === "All" ? "All Cities" : loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredCreators.length === 0 ? (
              <div className="cv-surface rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  No creators match those filters
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Try widening your skill, language, or city selection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCreators.map((creator) => {
                  const sentReq = getLatestSentRequest(creator.id);

                  return (
                    <article
                      key={creator.id}
                      className="cv-surface rounded-xl p-5 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-3.5">
                          <MediaImage
                            src={creator.avatarUrl}
                            alt={creator.name}
                            fallbackLabel={creator.name}
                            variant="avatar"
                            className="h-12 w-12 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <h2 className="font-display text-base font-semibold text-white truncate">
                              {creator.name}
                            </h2>
                            <p className="text-xs text-zinc-400 truncate">
                              {creator.handle} · {creator.role}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{creator.bio}</p>

                        <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                          <p>
                            <span className="text-zinc-500">Skills:</span>{" "}
                            <span className="text-zinc-200">{creator.skills.join(" · ")}</span>
                          </p>
                          <p>
                            <span className="text-zinc-500">Languages:</span>{" "}
                            <span className="text-zinc-200">{creator.languages.join(", ")}</span>
                          </p>
                          <p className="flex items-center justify-between pt-1">
                            <span className="inline-flex items-center gap-1 text-zinc-400">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              {creator.location}
                            </span>
                            <span className="font-mono text-zinc-400 tabular-nums">
                              {creator.followersLabel} · {creator.completedCollabs} collabs
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                        {sentReq ? (
                          <div className="flex w-full items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                sentReq.status === "Accepted"
                                  ? "text-emerald-300"
                                  : sentReq.status === "Declined"
                                  ? "text-rose-300"
                                  : "text-amber-300"
                              }`}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Request {sentReq.status}</span>
                            </span>
                            {sentReq.status === "Pending" && (
                              <button
                                type="button"
                                onClick={() => cancelCollabRequest(sentReq.id)}
                                className="text-xs text-zinc-400 hover:text-white"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRequestModal(creator)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg cv-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Request Collaboration</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Requests Management Tab */
          <div className="space-y-4">
            {collabRequests.length === 0 ? (
              <div className="cv-surface rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  No collaboration requests yet
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Discover creators and pitch your next reel or short film concept.
                </p>
              </div>
            ) : (
              collabRequests.map((req) => {
                const statusColor =
                  req.status === "Accepted"
                    ? "text-emerald-300"
                    : req.status === "Declined"
                    ? "text-rose-300"
                    : "text-amber-300";

                return (
                  <div
                    key={req.id}
                    className="cv-surface rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-xs text-zinc-400">
                        {req.direction === "incoming" ? "Incoming Invitation" : "Sent Request"} ·{" "}
                        <span className="tabular-nums">{req.createdAt}</span> ·{" "}
                        <span className={`font-semibold ${statusColor}`}>{req.status}</span>
                      </p>
                      <h2 className="font-display text-base font-semibold text-white">
                        {req.creatorName}{" "}
                        <span className="text-xs font-normal text-zinc-400">
                          {req.creatorHandle} · {req.creatorRole}
                        </span>
                      </h2>
                      <p className="text-xs font-medium text-violet-300">
                        Project: {req.projectTitle}
                      </p>
                      <p className="text-sm text-zinc-300">{req.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.direction === "incoming" && req.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => respondIncomingCollab(req.id, "Accepted")}
                            className="inline-flex items-center gap-1.5 rounded-lg cv-accent-gradient px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => respondIncomingCollab(req.id, "Declined")}
                            className="rounded-lg border border-white/12 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {req.direction === "sent" && req.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => cancelCollabRequest(req.id)}
                          className="rounded-lg border border-white/12 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Send Collaboration Request Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="collab-modal-title"
            className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#101119] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h2
                  id="collab-modal-title"
                  className="font-display text-lg font-semibold text-white"
                >
                  Collaborate with {selectedCreator.name}
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectedCreator.role} · {selectedCreator.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCreator(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} noValidate className="mt-5 space-y-4">
              <div>
                <label htmlFor="collab-project" className="block text-xs font-medium text-zinc-300">
                  Project or Idea Title
                </label>
                <input
                  id="collab-project"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g., Hostel 2 AM Maggi Negotiation"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
                {ideas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ideas.slice(0, 3).map((idea) => (
                      <button
                        key={idea.id}
                        type="button"
                        onClick={() => setProjectTitle(idea.title)}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-white/[0.08]"
                      >
                        Use: {idea.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="collab-message" className="block text-xs font-medium text-zinc-300">
                  Collaboration Pitch
                </label>
                <textarea
                  id="collab-message"
                  rows={4}
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  placeholder="Share shoot timeline, what role you need them for, and credit/split details..."
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-rose-400">
                  {formError}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCreator(null)}
                  className="rounded-lg border border-white/12 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg cv-accent-gradient px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
