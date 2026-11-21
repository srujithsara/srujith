import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#08090D]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 py-4 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          TRENDSPACE
        </Link>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </a>
          <a
            href="#talent"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Talent
          </a>
          <a
            href="#brands"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Brands
          </a>
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center justify-center rounded-lg cv-accent-gradient px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
          >
            Explore TRENDSPACE
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-white/10 p-2.5 text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/8 bg-[#0D0E15] px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-zinc-300">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="py-2 hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="py-2 hover:text-white"
            >
              Features
            </a>
            <a
              href="#talent"
              onClick={() => setMobileOpen(false)}
              className="py-2 hover:text-white"
            >
              Talent
            </a>
            <a
              href="#brands"
              onClick={() => setMobileOpen(false)}
              className="py-2 hover:text-white"
            >
              Brands
            </a>
            <div className="pt-2 border-t border-white/8 flex flex-col gap-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-lg cv-accent-gradient px-4 py-2.5 text-sm font-medium text-white"
              >
                Explore TRENDSPACE
              </Link>
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-lg border border-white/12 px-4 py-2.5 text-sm font-medium text-zinc-200"
              >
                Join the Community
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
