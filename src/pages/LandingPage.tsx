import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Compass,
  FolderKanban,
  Music2,
  Sparkles,
  Users,
} from "lucide-react";
import { LandingNavbar } from "../components/LandingNavbar";
import { MediaImage } from "../components/MediaImage";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import {
  DEMO_BRAND_COVER_IMAGE,
  DEMO_CREATORS,
  DEMO_HERO_STUDIO_IMAGE,
} from "../data/demoData";

const SIX_FEATURES = [
  {
    id: "idea-organizer",
    title: "01. Idea Organizer",
    description:
      "Capture rough hooks, categorize concepts by format, move projects from Draft to Completed, and publish selectively when ready.",
    to: "/ideas",
    icon: FolderKanban,
    span: "md:col-span-2",
    detail: "Private workspace · Category filters · One-click publish",
  },
  {
    id: "public-hub",
    title: "02. Public Idea Hub",
    description:
      "Share creative concepts with the community, collect feedback, and remix open ideas into your own production queue.",
    to: "/hub",
    icon: Compass,
    span: "md:col-span-1",
    detail: "Likes · Saves · Comments · Remix",
  },
  {
    id: "trending-audio",
    title: "03. Trending Audio",
    description:
      "Audition rising regional comedy hooks, lo-fi beats, and cinematic risers with built-in BPM and trend velocity context.",
    to: "/audio",
    icon: Music2,
    span: "md:col-span-1",
    detail: "Sample preview library · BPM tags",
  },
  {
    id: "ai-generator",
    title: "04. AI Idea Generator",
    description:
      "Turn everyday situations into shootable hooks, short scripts, and captions tailored to your language, platform, and tone.",
    to: "/ai-generator",
    icon: Sparkles,
    span: "md:col-span-2",
    detail: "Server-backed Gemini AI · Multilingual scripts · Demo fallback",
  },
  {
    id: "collaboration",
    title: "05. Creator Collaboration",
    description:
      "Filter editors, actors, cinematographers, and sound designers by skill, language, and city—then pitch projects directly.",
    to: "/collaborate",
    icon: Users,
    span: "md:col-span-1",
    detail: "Skill & city filters · Request tracking",
  },
  {
    id: "brands",
    title: "06. Brand Promotion Marketplace",
    description:
      "Browse transparent campaign briefs with deliverables, deadlines, and payouts, and track your pitch status in one place.",
    to: "/brands",
    icon: Briefcase,
    span: "md:col-span-2",
    detail: "Verified briefs · Direct pitch · Status pipeline",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { signup } = useCreatorVerse();
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinRole, setJoinRole] = useState("Content Creator");
  const [joinError, setJoinError] = useState("");

  const featuredCreators = DEMO_CREATORS.slice(0, 3);

  const handleCommunityJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");

    if (joinName.trim().length < 2) {
      setJoinError("Please enter your name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(joinEmail.trim())) {
      setJoinError("Please enter a valid email address.");
      return;
    }

    signup({
      name: joinName.trim(),
      email: joinEmail.trim(),
      role: joinRole,
      location: "Hyderabad",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F4F4F8]">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/12 to-blue-600/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-medium tracking-wide text-violet-300">
                TRENDSPACE · Where Ideas Meet Creators.
              </p>
              <h1
                className="mt-4 font-display font-bold tracking-tight text-white text-balance"
                style={{ fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)", lineHeight: 1.06 }}
              >
                Your Ideas Deserve to Become Reality.
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-300">
                Discover trends. Share ideas. Find creators. Build collaborations. Unlock
                opportunities. All in one place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap"
                >
                  <span>Explore TRENDSPACE</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center justify-center rounded-lg border border-white/14 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/[0.08] transition-colors whitespace-nowrap"
                >
                  Join the Community
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#101119]">
                <MediaImage
                  src={DEMO_HERO_STUDIO_IMAGE}
                  alt="TRENDSPACE modern creator production studio"
                  fallbackLabel="TRENDSPACE Production Studio"
                  className="aspect-video w-full lg:h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090D]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-200">
                  <span>All-in-one creator production workspace</span>
                  <span className="font-mono text-zinc-300">6 Integrated Modules</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column Ecosystem Snapshot Strip below the hero split */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/8 pt-8 md:grid-cols-4">
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">6</p>
              <p className="mt-1 text-xs text-zinc-400">Core Creator Workflows</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">5+</p>
              <p className="mt-1 text-xs text-zinc-400">Regional & Global Languages</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">AI + Hub</p>
              <p className="mt-1 text-xs text-zinc-400">Script Generation to Publishing</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-white tabular-nums">Direct</p>
              <p className="mt-1 text-xs text-zinc-400">Creator & Brand Collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* How TRENDSPACE Works */}
      <section id="how-it-works" className="border-b border-white/8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              How TRENDSPACE Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400">
              Move cleanly from a late-night note in your dorm or studio to a published reel, a
              booked crew, and a paid brand brief.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="cv-surface rounded-xl p-6">
              <p className="font-mono text-xs text-violet-300">01. Capture & Generate</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Turn raw thoughts into scripts
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Save raw hooks inside My Ideas or feed an everyday situation into the AI Idea
                Generator for hooks, beats, and captions.
              </p>
            </div>

            <div className="cv-surface rounded-xl p-6">
              <p className="font-mono text-xs text-blue-300">02. Match Trends & Crew</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Pair audio and collaborators
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Audition rising audio cues and invite local editors, actors, or cinematographers
                who match your language and shooting city.
              </p>
            </div>

            <div className="cv-surface rounded-xl p-6">
              <p className="font-mono text-xs text-violet-300">03. Publish & Partner</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-white">
                Share publicly and apply to brands
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Publish validated concepts to the Public Idea Hub and pitch open brand briefs with
                real deliverables attached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Six Powerful Features */}
      <section id="features" className="border-b border-white/8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Explore Six Powerful Features
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-400">
                Every stage of the creator lifecycle lives inside one unified navigation system.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300 hover:text-violet-200 whitespace-nowrap"
            >
              <span>Open full workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {SIX_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.id}
                  to={feat.to}
                  className={`group cv-surface rounded-xl p-6 transition-colors hover:border-violet-500/40 hover:bg-[#141622] flex flex-col justify-between ${feat.span}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/12 text-violet-300 border border-violet-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-white">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feat.description}</p>
                  </div>
                  <p className="mt-5 pt-4 border-t border-white/6 text-xs text-zinc-500">
                    {feat.detail}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Discover Creative Talent */}
      <section id="talent" className="border-b border-white/8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Discover Creative Talent
              </h2>
              <p className="mt-2 text-sm sm:text-base text-zinc-400">
                Have a killer reel concept but need an editor, choreographer, or sound designer?
                Build your shoot crew in minutes.
              </p>
            </div>
            <Link
              to="/collaborate"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-blue-200 whitespace-nowrap"
            >
              <span>Browse all creators</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredCreators.map((creator) => (
              <div key={creator.id} className="cv-surface rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <MediaImage
                      src={creator.avatarUrl}
                      alt={creator.name}
                      fallbackLabel={creator.name}
                      variant="avatar"
                      className="h-14 w-14 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-semibold text-white truncate">
                        {creator.name}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {creator.handle} · {creator.location}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{creator.bio}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/6 flex items-center justify-between gap-2 text-xs text-zinc-400">
                  <span className="truncate">{creator.skills.join(" · ")}</span>
                  <Link
                    to="/collaborate"
                    className="font-medium text-violet-300 hover:text-violet-200 whitespace-nowrap shrink-0"
                  >
                    Collaborate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect with Brands */}
      <section id="brands" className="border-b border-white/8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch cv-surface rounded-2xl overflow-hidden">
            <div className="lg:col-span-5">
              <MediaImage
                src={DEMO_BRAND_COVER_IMAGE}
                alt="SonicWave wireless creator microphone and earbuds campaign"
                fallbackLabel="Brand Campaign Showcase"
                className="aspect-[4/3] w-full lg:h-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
              <p className="text-xs font-medium text-blue-300">
                Brand Promotion Marketplace · Sample Campaign Brief
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Connect with Brands
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed">
                Skip opaque agency DMs. Review clear deliverables, transparent rewards, and
                application deadlines, then apply directly using your TRENDSPACE profile and
                drafted concepts.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/8 py-4">
                <div>
                  <p className="text-xs text-zinc-500">Featured Brief</p>
                  <p className="mt-1 text-sm font-semibold text-white">SonicWave Audio</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Reward</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-emerald-300 tabular-nums">
                    ₹18,000 + Gear Kit
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Deadline</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-zinc-200 tabular-nums">
                    2026-12-05
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/brands"
                  className="inline-flex items-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  <span>View Brand Marketplace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join the Creator Community */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            Join the Creator Community
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            Whether you write comedy skits in a hostel room or cut commercial reels in a studio,
            your next collaborator and campaign are one step away.
          </p>

          <form
            onSubmit={handleCommunityJoin}
            noValidate
            className="mt-8 cv-surface rounded-2xl p-5 sm:p-6 text-left"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="join-name" className="block text-xs font-medium text-zinc-400">
                  Your Name
                </label>
                <input
                  id="join-name"
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Srujith Varma"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="join-email" className="block text-xs font-medium text-zinc-400">
                  Email Address
                </label>
                <input
                  id="join-email"
                  type="email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="join-role" className="block text-xs font-medium text-zinc-400">
                  Primary Craft
                </label>
                <select
                  id="join-role"
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#08090D] px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                  <option>Content Creator</option>
                  <option>Idea Contributor / Writer</option>
                  <option>Video Editor</option>
                  <option>Cinematographer</option>
                  <option>Music / Sound Designer</option>
                </select>
              </div>
            </div>

            {joinError && (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-400">
                {joinError}
              </p>
            )}

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-zinc-500">
                Demo workspace persists locally in your browser with Supabase architecture ready.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg cv-accent-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <span>Create Creator Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-white/8 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-zinc-200">TRENDSPACE</span>
            <span>·</span>
            <span>Where Ideas Meet Creators.</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/dashboard" className="hover:text-zinc-200">
              Dashboard
            </Link>
            <Link to="/hub" className="hover:text-zinc-200">
              Public Hub
            </Link>
            <Link to="/ai-generator" className="hover:text-zinc-200">
              AI Generator
            </Link>
            <Link to="/collaborate" className="hover:text-zinc-200">
              Collaborate
            </Link>
            <Link to="/brands" className="hover:text-zinc-200">
              Brands
            </Link>
            <Link to="/auth" className="hover:text-zinc-200">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
