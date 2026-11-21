import React, { useState } from "react";
import { Check, ExternalLink, MapPin, Save } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";

const AVAILABLE_SKILLS = [
  "Acting",
  "Editing",
  "Dancing",
  "Scripting",
  "Cinematography",
  "Sound Design",
];

const AVAILABLE_LANGUAGES = ["Telugu", "English", "Hindi", "Tamil", "Kannada"];

export function ProfilePage() {
  const { user, ideas, publicIdeas, collabRequests, updateProfile } = useCreatorVerse();

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [bio, setBio] = useState(user.bio);
  const [location, setLocation] = useState(user.location);
  const [skills, setSkills] = useState<string[]>(user.skills);
  const [languages, setLanguages] = useState<string[]>(user.languages);
  const [instagramHandle, setInstagramHandle] = useState(user.instagramHandle);
  const [youtubeHandle, setYoutubeHandle] = useState(user.youtubeHandle);
  const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl);
  const [error, setError] = useState("");

  const toggleItem = (list: string[], setList: (next: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    updateProfile({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      location: location.trim(),
      skills,
      languages,
      instagramHandle: instagramHandle.trim(),
      youtubeHandle: youtubeHandle.trim(),
      portfolioUrl: portfolioUrl.trim(),
    });
  };

  const myPublicIdeas = publicIdeas.filter((p) => p.authorId === user.id);

  return (
    <DashboardLayout title="Creator Profile">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Creator Profile
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            How fellow creators and brands see your portfolio across TRENDSPACE.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Profile Preview Card */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="cv-surface rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <MediaImage
                  src={user.avatarUrl}
                  alt={user.name}
                  fallbackLabel={user.name}
                  variant="avatar"
                  className="h-16 w-16 rounded-full object-cover border border-white/12 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-white truncate">{name}</h2>
                  <p className="text-xs text-zinc-400 truncate">{user.handle}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-violet-300" />
                    <span>{location || "Remote"}</span>
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-violet-300">{role}</p>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{bio}</p>

              <div className="mt-5 pt-4 border-t border-white/8 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-mono text-lg font-semibold text-white tabular-nums">
                    {ideas.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">Ideas</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-semibold text-white tabular-nums">
                    {myPublicIdeas.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">Published</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-semibold text-white tabular-nums">
                    {collabRequests.length}
                  </p>
                  <p className="text-[11px] text-zinc-500">Collabs</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/8 space-y-1.5 text-xs text-zinc-400">
                <p>Instagram: {instagramHandle || "Not set"}</p>
                <p>YouTube: {youtubeHandle || "Not set"}</p>
                {portfolioUrl && (
                  <p className="inline-flex items-center gap-1 text-blue-300 truncate max-w-full">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{portfolioUrl}</span>
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Edit Form */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-8 cv-surface rounded-2xl p-6 space-y-5"
          >
            <h2 className="font-display text-lg font-semibold text-white border-b border-white/8 pb-3">
              Edit Creator Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-medium text-zinc-300">
                  Display Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="prof-city" className="block text-xs font-medium text-zinc-300">
                  City / Location
                </label>
                <input
                  id="prof-city"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prof-role" className="block text-xs font-medium text-zinc-300">
                Headline Role
              </label>
              <input
                id="prof-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prof-bio" className="block text-xs font-medium text-zinc-300">
                Creator Bio
              </label>
              <textarea
                id="prof-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-zinc-300 mb-2">
                Collaboration Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SKILLS.map((sk) => {
                  const active = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleItem(skills, setSkills, sk)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
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
              <span className="block text-xs font-medium text-zinc-300 mb-2">Languages</span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const active = languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleItem(languages, setLanguages, lang)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                        active
                          ? "bg-blue-500/20 text-white border-blue-500/40"
                          : "bg-[#08090D] text-zinc-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-blue-300" />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="prof-ig" className="block text-xs font-medium text-zinc-300">
                  Instagram Handle
                </label>
                <input
                  id="prof-ig"
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="prof-yt" className="block text-xs font-medium text-zinc-300">
                  YouTube Channel
                </label>
                <input
                  id="prof-yt"
                  type="text"
                  value={youtubeHandle}
                  onChange={(e) => setYoutubeHandle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="prof-port" className="block text-xs font-medium text-zinc-300">
                  Portfolio URL
                </label>
                <input
                  id="prof-port"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-rose-400">
                {error}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
