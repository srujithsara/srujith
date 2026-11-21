/**
 * Supabase Architecture Blueprint & Adapter Layer
 * ------------------------------------------------
 * TRENDSPACE uses localStorage in Demo Mode for zero-friction hackathon
 * demonstrations, while keeping all data contracts aligned with a production
 * Supabase backend (Auth, Postgres RLS tables, and Storage buckets).
 */

export interface SupabaseConfigStatus {
  configured: boolean;
  urlPresent: boolean;
  anonKeyPresent: boolean;
  mode: "local-demo" | "supabase-ready";
}

export function getSupabaseArchitectureStatus(): SupabaseConfigStatus {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const urlPresent = Boolean(url && url.trim().length > 0);
  const anonKeyPresent = Boolean(anonKey && anonKey.trim().length > 0);
  const configured = urlPresent && anonKeyPresent;

  return {
    configured,
    urlPresent,
    anonKeyPresent,
    mode: configured ? "supabase-ready" : "local-demo",
  };
}

export const SUPABASE_SCHEMA_BLUEPRINT = [
  {
    table: "profiles",
    purpose: "Creator identity, skills, languages, location, and social handles",
    storageBucket: "creator-avatars",
  },
  {
    table: "ideas",
    purpose: "Private Idea Organizer items with Draft / In Production / Completed state",
    storageBucket: null,
  },
  {
    table: "public_ideas",
    purpose: "Community Idea Hub entries with likes, saves, and comments",
    storageBucket: null,
  },
  {
    table: "collab_requests",
    purpose: "Creator-to-creator collaboration pitches and status transitions",
    storageBucket: null,
  },
  {
    table: "campaign_applications",
    purpose: "Creator applications, review statuses (Pending Review → Payment Released), and work URLs",
    storageBucket: "campaign-deliverables",
  },
  {
    table: "earn_campaigns",
    purpose: "Brand-created earning opportunities with budget, reward, slots, and RBAC brand ownership",
    storageBucket: null,
  },
  {
    table: "bounty_challenges & bounty_submissions",
    purpose: "Brand creative idea bounties and creator idea submissions with winner selection",
    storageBucket: "bounty-assets",
  },
  {
    table: "affiliate_links & affiliate_events",
    purpose: "Unique creator referral codes, click tracking, and backend-verified conversions",
    storageBucket: null,
  },
  {
    table: "creator_transactions & withdrawals",
    purpose: "Idempotent payout ledger, Razorpay payout references, and withdrawal status tracking",
    storageBucket: null,
  },
] as const;

export const RBAC_PERMISSION_MATRIX = {
  creator: [
    "Apply to open brand campaigns",
    "Submit completed work URLs on Approved campaigns",
    "Submit original concepts to Idea Bounty Challenges",
    "Copy affiliate referral links & view conversion ledger",
    "Request payout withdrawals from verified Released balance",
  ],
  brand: [
    "Publish new campaigns with budgets, slots, and deliverables",
    "Approve or reject creator campaign applications",
    "Review submitted work and trigger server-verified Payment Released",
    "Post Idea Bounty Challenges and select winning submissions",
  ],
} as const;
