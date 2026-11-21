export type IdeaCategory =
  | "Comedy & Skits"
  | "Tech & Campus"
  | "Lifestyle"
  | "Music & Dance"
  | "Filmmaking"
  | "Brand Pitch";

export type IdeaStatus = "Draft" | "In Production" | "Completed";

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  languages: string[];
  skills: string[];
  avatarUrl?: string;
  portfolioUrl: string;
  instagramHandle: string;
  youtubeHandle: string;
  joinedAt: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  collabAlerts: boolean;
  brandDigest: boolean;
  defaultPlatform: string;
  defaultLanguage: string;
}

export interface CreatorIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  platform: string;
  isPublic: boolean;
  publicIdeaId?: string;
  audioTag?: string;
  updatedAt: string;
  createdAt: string;
}

export interface IdeaComment {
  id: string;
  authorName: string;
  authorHandle: string;
  text: string;
  createdAt: string;
}

export interface PublicIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  platform: string;
  likes: number;
  likedByMe: boolean;
  saves: number;
  savedByMe: boolean;
  usesCount: number;
  comments: IdeaComment[];
  createdAt: string;
}

export type AudioTrendStatus = "Peak Viral" | "Rising Fast" | "Breakout" | "Steady";

export interface TrendingAudioTrack {
  id: string;
  title: string;
  creator: string;
  category: "Beat / Lo-Fi" | "Regional Comedy" | "Cinematic" | "Dialogue Hook" | "Upbeat Pop";
  trendStatus: AudioTrendStatus;
  bpm: number;
  durationSec: number;
  usageCount: string;
  moodNote: string;
  synthNotes: number[];
  synthWaveform: "sine" | "triangle" | "sawtooth";
  savedByMe: boolean;
}

export interface AIGeneratedConcept {
  id: string;
  title: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string[];
  productionTip: string;
  mode: "live" | "demo";
  saved?: boolean;
}

export interface CreatorDirectoryMember {
  id: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  skills: string[];
  languages: string[];
  location: string;
  followersLabel: string;
  completedCollabs: number;
  avatarUrl?: string;
  availableForCollab: boolean;
}

export type CollabRequestStatus = "Pending" | "Accepted" | "Declined";

export interface CollabRequest {
  id: string;
  direction: "sent" | "incoming";
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorRole: string;
  projectTitle: string;
  message: string;
  status: CollabRequestStatus;
  createdAt: string;
}

export type CampaignApplicationStatus = "Applied" | "Under Review" | "Shortlisted";

export interface BrandCampaign {
  id: string;
  brandName: string;
  title: string;
  category: string;
  description: string;
  requirements: string[];
  deadline: string;
  reward: string;
  slotsOpen: number;
  coverUrl?: string;
  applied: boolean;
  applicationStatus?: CampaignApplicationStatus;
  applicationPitch?: string;
  appliedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  read: boolean;
  route: string;
}

// --- CREATOR EARN DOMAIN MODELS ---

export type EarnCategory =
  | "Sponsored Content"
  | "UGC Creation"
  | "Product Promotion"
  | "Affiliate Marketing"
  | "Idea Challenges"
  | "Creative Tasks";

export type EarnApplicationStatus =
  | "Pending Review"
  | "Approved"
  | "Rejected"
  | "Work Submitted"
  | "Completed"
  | "Payment Released";

export interface EarnCampaign {
  id: string;
  brandName: string;
  brandInitials: string;
  brandAccent: string;
  title: string;
  description: string;
  category: EarnCategory;
  requiredSkills: string[];
  platform: string;
  budgetInr: number;
  rewardInr: number;
  slotsTotal: number;
  slotsAvailable: number;
  deadline: string;
  requirements: string[];
  createdByRole: "brand" | "demo";
  createdAt: string;
}

export interface EarnApplication {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  rewardInr: number;
  creatorName: string;
  socialProfileUrl: string;
  relevantSkills: string[];
  pitchReason: string;
  portfolioUrl: string;
  status: EarnApplicationStatus;
  submittedWorkUrl?: string;
  submittedWorkDescription?: string;
  submittedWorkAt?: string;
  brandReviewNote?: string;
  payoutReference?: string;
  appliedAt: string;
  updatedAt: string;
}

export type TransactionType =
  | "Campaign Payout"
  | "Bounty Reward"
  | "Affiliate Commission"
  | "Demo Withdrawal";

export type TransactionPaymentStatus =
  | "Released"
  | "Pending Verification"
  | "Processed (Demo)";

export interface EarnTransaction {
  id: string;
  title: string;
  date: string;
  type: TransactionType;
  amountInr: number;
  status: TransactionPaymentStatus;
  referenceId: string;
}

export interface DemoWithdrawal {
  id: string;
  amountInr: number;
  method: "UPI ID (Demo)" | "Bank Transfer (Demo)";
  destination: string;
  status: "Processed (Demo)";
  createdAt: string;
}

export interface BountyChallenge {
  id: string;
  brandName: string;
  title: string;
  prompt: string;
  platform: string;
  rewardInr: number;
  deadline: string;
  status: "Open" | "Awarded";
}

export type BountySubmissionStatus = "Submitted" | "Selected Winner" | "Not Selected";

export interface BountySubmission {
  id: string;
  bountyId: string;
  creatorName: string;
  ideaTitle: string;
  conceptSummary: string;
  workUrl?: string;
  status: BountySubmissionStatus;
  submittedAt: string;
}

export interface AffiliateProgram {
  id: string;
  brandName: string;
  productTitle: string;
  commissionLabel: string;
  commissionPerConversionInr: number;
  referralCode: string;
  referralUrl: string;
  clicks: number;
  verifiedConversions: number;
  commissionEarnedInr: number;
}

