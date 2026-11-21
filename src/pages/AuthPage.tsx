import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { MediaImage } from "../components/MediaImage";
import { DEMO_HERO_STUDIO_IMAGE } from "../data/demoData";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Short-Form Creator");
  const [location, setLocation] = useState("Hyderabad");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, loginDemo } = useCreatorVerse();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      if (mode === "signin") {
        login(email);
      } else {
        signup({ name, email, role, location });
      }
      setLoading(false);
      navigate("/dashboard");
    }, 350);
  };

  const handleDemoEnter = () => {
    loginDemo();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F4F4F8] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Studio Editorial Panel */}
      <div className="hidden lg:flex lg:col-span-6 relative overflow-hidden border-r border-white/8 flex-col justify-between p-10">
        <MediaImage
          src={DEMO_HERO_STUDIO_IMAGE}
          alt="TRENDSPACE Studio"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/70 to-[#08090D]/80" />

        <div className="relative z-10">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-white">
            TRENDSPACE
          </Link>
          <p className="mt-1 text-sm text-zinc-300">Where Ideas Meet Creators.</p>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="font-display text-3xl font-bold text-white leading-tight text-balance">
            Your ideas, collaborators, audio cues, and brand deals—unified.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            Running in local Demo Persistence mode with pre-built Supabase Auth & Postgres RLS
            schema readiness for production deployment.
          </p>
        </div>
      </div>

      {/* Right Auth Form Panel */}
      <div className="lg:col-span-6 flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="mt-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {mode === "signin" ? "Sign in to TRENDSPACE" : "Create your creator account"}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {mode === "signin"
                ? "Access your saved ideas, collaborations, and brand applications."
                : "Start organizing ideas, generating scripts, and meeting creators."}
            </p>
          </div>

          {/* Segmented Mode Switch */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#101119] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                mode === "signin" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`rounded-md py-2 text-xs font-semibold transition-colors ${
                mode === "signup" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-medium text-zinc-300">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arjun Rao"
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#101119] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-role" className="block text-xs font-medium text-zinc-300">
                      Creator Role
                    </label>
                    <input
                      id="auth-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#101119] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-city" className="block text-xs font-medium text-zinc-300">
                      City / Location
                    </label>
                    <input
                      id="auth-city"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#101119] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-300">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#101119] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-300">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#101119] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg cv-accent-gradient px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/8 pt-6">
            <button
              type="button"
              onClick={handleDemoEnter}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/14 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/[0.07] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-violet-300" />
              <span>Enter Demo Creator Account (Instant Access)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
