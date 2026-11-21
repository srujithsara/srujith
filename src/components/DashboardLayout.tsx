import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Briefcase,
  CheckCheck,
  Compass,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Music2,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useCreatorVerse } from "../context/CreatorVerseContext";
import { MediaImage } from "./MediaImage";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ideas", label: "My Ideas", icon: FolderKanban },
  { to: "/hub", label: "Public Idea Hub", icon: Compass },
  { to: "/audio", label: "Trending Audio", icon: Music2 },
  { to: "/ai-generator", label: "AI Idea Generator", icon: Sparkles },
  { to: "/collaborate", label: "Collaboration", icon: Users },
  { to: "/brands", label: "Brand Promotions", icon: Briefcase },
  { to: "/earn", label: "Creator Earn", icon: Wallet },
  { to: "/profile", label: "Creator Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const {
    user,
    ideas,
    publicIdeas,
    audioTracks,
    creators,
    campaigns,
    earnCampaigns,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useCreatorVerse();

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ id: string; label: string; kind: string; route: string }> = [];

    ideas
      .filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((i) =>
        results.push({ id: i.id, label: i.title, kind: "My Idea", route: "/ideas" })
      );

    publicIdeas
      .filter((p) => p.title.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((p) =>
        results.push({ id: p.id, label: p.title, kind: "Public Hub", route: "/hub" })
      );

    audioTracks
      .filter((a) => a.title.toLowerCase().includes(q) || a.creator.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((a) =>
        results.push({ id: a.id, label: a.title, kind: "Audio", route: "/audio" })
      );

    creators
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, 2)
      .forEach((c) =>
        results.push({ id: c.id, label: `${c.name} (${c.role})`, kind: "Creator", route: "/collaborate" })
      );

    campaigns
      .filter((b) => b.brandName.toLowerCase().includes(q) || b.title.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach((b) =>
        results.push({ id: b.id, label: `${b.brandName}: ${b.title}`, kind: "Brand", route: "/brands" })
      );

    earnCampaigns
      .filter(
        (ec) =>
          ec.brandName.toLowerCase().includes(q) ||
          ec.title.toLowerCase().includes(q) ||
          ec.category.toLowerCase().includes(q)
      )
      .slice(0, 2)
      .forEach((ec) =>
        results.push({
          id: ec.id,
          label: `${ec.brandName}: ${ec.title}`,
          kind: "Creator Earn",
          route: "/earn",
        })
      );

    return results.slice(0, 8);
  }, [globalQuery, ideas, publicIdeas, audioTracks, creators, campaigns, earnCampaigns]);

  const handleSignOut = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-[#F4F4F8] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-white/8 bg-[#0B0C12]">
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <Link
            to="/"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap"
          >
            TRENDSPACE
          </Link>
        </div>

        <nav aria-label="Workspace Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-violet-500/15 text-white border border-violet-500/30"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-3 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Landing Overview</span>
          </Link>
          <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2.5">
            <Link to="/profile" className="flex items-center gap-2.5 min-w-0">
              <MediaImage
                src={user.avatarUrl}
                alt={user.name}
                fallbackLabel={user.name}
                variant="avatar"
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user.handle}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex w-72 max-w-[82vw] flex-col bg-[#0B0C12] border-r border-white/10">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="font-display text-lg font-bold tracking-tight text-white"
              >
                TRENDSPACE
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-violet-500/15 text-white border border-violet-500/30"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="border-t border-white/8 p-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Search & Notification Bar */}
        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#08090D]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="inline-flex lg:hidden items-center justify-center rounded-lg border border-white/10 p-2 text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-zinc-300 truncate">{title}</span>
            </div>

            {/* Global Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={globalQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Search ideas, audio, creators, brands..."
                aria-label="Search workspace"
                className="w-full rounded-lg border border-white/10 bg-[#101119] py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              {searchFocused && globalQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-[#12131D] shadow-2xl overflow-hidden z-40">
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-white/6">
                      {searchResults.map((res) => (
                        <li key={`${res.kind}_${res.id}`}>
                          <button
                            type="button"
                            onMouseDown={() => {
                              setGlobalQuery("");
                              navigate(res.route);
                            }}
                            className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                          >
                            <span className="text-sm text-zinc-100 truncate">{res.label}</span>
                            <span className="text-xs text-zinc-400 shrink-0">{res.kind}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-3 text-xs text-zinc-400">
                      No matches found for &ldquo;{globalQuery}&rdquo;.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell & Profile */}
            <div className="flex items-center gap-2 shrink-0 relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Open notifications"
                className="relative rounded-lg border border-white/10 bg-[#101119] p-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-white/10 bg-[#12131D] shadow-2xl z-40 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/6">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-zinc-400">
                        You are all caught up.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(n.id);
                            setNotifOpen(false);
                            navigate(n.route);
                          }}
                          className={`block w-full px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                            n.read ? "opacity-70" : "bg-violet-500/[0.04]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {n.title}
                            </span>
                            <span className="text-[11px] text-zinc-500 shrink-0 tabular-nums">
                              {n.timeAgo}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{n.detail}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-[#101119] py-1.5 pl-1.5 pr-3 hover:bg-white/5 transition-colors"
              >
                <MediaImage
                  src={user.avatarUrl}
                  alt={user.name}
                  fallbackLabel={user.name}
                  variant="avatar"
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
