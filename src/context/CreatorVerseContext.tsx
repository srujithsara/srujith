import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEMO_AFFILIATE_PROGRAMS,
  DEMO_BOUNTY_CHALLENGES,
  DEMO_BOUNTY_SUBMISSIONS,
  DEMO_BRAND_CAMPAIGNS,
  DEMO_COLLAB_REQUESTS,
  DEMO_CREATORS,
  DEMO_DEFAULT_SETTINGS,
  DEMO_DEFAULT_USER,
  DEMO_EARN_APPLICATIONS,
  DEMO_EARN_CAMPAIGNS,
  DEMO_EARN_TRANSACTIONS,
  DEMO_INITIAL_IDEAS,
  DEMO_PUBLIC_IDEAS,
  DEMO_TRENDING_AUDIO,
  DEMO_NOTIFICATIONS,
  DEMO_WITHDRAWALS,
} from "../data/demoData";
import { verifyBrandPayoutOnServer } from "../services/paymentArchitecture";
import type {
  AffiliateProgram,
  AppNotification,
  BountyChallenge,
  BountySubmission,
  BrandCampaign,
  CollabRequest,
  CreatorDirectoryMember,
  CreatorIdea,
  DemoWithdrawal,
  EarnApplication,
  EarnCampaign,
  EarnCategory,
  EarnTransaction,
  IdeaCategory,
  IdeaStatus,
  PublicIdea,
  TrendingAudioTrack,
  UserProfile,
  UserSettings,
} from "../types/creatorverse";

const STORAGE_KEY = "trendspace_workspace_v1";

interface PersistedState {
  isAuthenticated: boolean;
  user: UserProfile;
  settings: UserSettings;
  ideas: CreatorIdea[];
  publicIdeas: PublicIdea[];
  audioTracks: TrendingAudioTrack[];
  creators: CreatorDirectoryMember[];
  collabRequests: CollabRequest[];
  campaigns: BrandCampaign[];
  notifications: AppNotification[];
  // Creator Earn State
  earnAccountRole: "creator" | "brand";
  earnCampaigns: EarnCampaign[];
  earnApplications: EarnApplication[];
  earnTransactions: EarnTransaction[];
  demoWithdrawals: DemoWithdrawal[];
  bountyChallenges: BountyChallenge[];
  bountySubmissions: BountySubmission[];
  affiliatePrograms: AffiliateProgram[];
}

export interface ToastItem {
  id: string;
  message: string;
  tone: "success" | "info" | "error";
}

interface CreatorVerseContextValue extends PersistedState {
  toasts: ToastItem[];
  showToast: (message: string, tone?: "success" | "info" | "error") => void;
  dismissToast: (id: string) => void;
  login: (email: string) => void;
  signup: (payload: { name: string; email: string; role: string; location: string }) => void;
  loginDemo: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  addIdea: (input: {
    title: string;
    description: string;
    category: IdeaCategory;
    status: IdeaStatus;
    platform: string;
    isPublic: boolean;
    audioTag?: string;
  }) => CreatorIdea;
  updateIdea: (id: string, updates: Partial<CreatorIdea>) => void;
  deleteIdea: (id: string) => void;
  toggleIdeaStatus: (id: string) => void;
  publishIdeaToHub: (ideaId: string) => void;
  clonePublicIdeaToMyIdeas: (publicIdeaId: string) => void;
  publishNewPublicIdea: (input: {
    title: string;
    description: string;
    category: IdeaCategory;
    platform: string;
  }) => void;
  toggleLikePublicIdea: (publicIdeaId: string) => void;
  toggleSavePublicIdea: (publicIdeaId: string) => void;
  addCommentToPublicIdea: (publicIdeaId: string, text: string) => void;
  toggleSaveAudio: (audioId: string) => void;
  sendCollabRequest: (input: {
    creator: CreatorDirectoryMember;
    projectTitle: string;
    message: string;
  }) => void;
  cancelCollabRequest: (requestId: string) => void;
  respondIncomingCollab: (requestId: string, status: "Accepted" | "Declined") => void;
  applyToCampaign: (campaignId: string, pitch: string) => void;
  withdrawCampaignApplication: (campaignId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoWorkspace: () => void;
  // Creator Earn Actions
  setEarnAccountRole: (role: "creator" | "brand") => void;
  submitEarnApplication: (input: {
    campaign: EarnCampaign;
    creatorName: string;
    socialProfileUrl: string;
    relevantSkills: string[];
    pitchReason: string;
    portfolioUrl: string;
  }) => void;
  publishBrandCampaign: (input: {
    title: string;
    brandName: string;
    description: string;
    category: EarnCategory;
    requiredSkills: string[];
    platform: string;
    budgetInr: number;
    rewardInr: number;
    slotsTotal: number;
    deadline: string;
    requirements: string[];
  }) => void;
  reviewEarnApplication: (
    applicationId: string,
    decision: "Approved" | "Rejected",
    reviewNote?: string
  ) => void;
  submitEarnWork: (
    applicationId: string,
    workUrl: string,
    workDescription: string
  ) => void;
  releaseEarnPayment: (applicationId: string) => Promise<void>;
  rejectSubmittedWork: (applicationId: string, reviewNote: string) => void;
  requestDemoWithdrawal: (input: {
    amountInr: number;
    method: "UPI ID (Demo)" | "Bank Transfer (Demo)";
    destination: string;
  }) => boolean;
  publishBountyChallenge: (input: {
    brandName: string;
    title: string;
    prompt: string;
    platform: string;
    rewardInr: number;
    deadline: string;
  }) => void;
  submitBountyIdea: (input: {
    bountyId: string;
    ideaTitle: string;
    conceptSummary: string;
    workUrl?: string;
  }) => void;
  awardBountySubmission: (bountyId: string, submissionId: string) => void;
  simulateAffiliateDemoConversion: (programId: string) => void;
}

function getInitialState(): PersistedState {
  const defaultState: PersistedState = {
    isAuthenticated: true,
    user: DEMO_DEFAULT_USER,
    settings: DEMO_DEFAULT_SETTINGS,
    ideas: DEMO_INITIAL_IDEAS,
    publicIdeas: DEMO_PUBLIC_IDEAS,
    audioTracks: DEMO_TRENDING_AUDIO,
    creators: DEMO_CREATORS,
    collabRequests: DEMO_COLLAB_REQUESTS,
    campaigns: DEMO_BRAND_CAMPAIGNS,
    notifications: DEMO_NOTIFICATIONS,
    earnAccountRole: "creator",
    earnCampaigns: DEMO_EARN_CAMPAIGNS,
    earnApplications: DEMO_EARN_APPLICATIONS,
    earnTransactions: DEMO_EARN_TRANSACTIONS,
    demoWithdrawals: DEMO_WITHDRAWALS,
    bountyChallenges: DEMO_BOUNTY_CHALLENGES,
    bountySubmissions: DEMO_BOUNTY_SUBMISSIONS,
    affiliatePrograms: DEMO_AFFILIATE_PROGRAMS,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...defaultState,
      ...parsed,
      user: { ...defaultState.user, ...(parsed.user || {}) },
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      earnAccountRole: parsed.earnAccountRole === "brand" ? "brand" : "creator",
      earnCampaigns: parsed.earnCampaigns || defaultState.earnCampaigns,
      earnApplications: parsed.earnApplications || defaultState.earnApplications,
      earnTransactions: parsed.earnTransactions || defaultState.earnTransactions,
      demoWithdrawals: parsed.demoWithdrawals || defaultState.demoWithdrawals,
      bountyChallenges: parsed.bountyChallenges || defaultState.bountyChallenges,
      bountySubmissions: parsed.bountySubmissions || defaultState.bountySubmissions,
      affiliatePrograms: parsed.affiliatePrograms || defaultState.affiliatePrograms,
    };
  } catch {
    return defaultState;
  }
}

const CreatorVerseContext = createContext<CreatorVerseContextValue | null>(null);

export function CreatorVerseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(getInitialState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [state]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (message: string, tone: "success" | "info" | "error" = "success") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3400);
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const login = (email: string) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        ...prev.user,
        email: email.trim(),
      },
    }));
    showToast("Signed in to your TRENDSPACE workspace.");
  };

  const signup = (payload: { name: string; email: string; role: string; location: string }) => {
    const cleanName = payload.name.trim();
    const handleSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        ...prev.user,
        id: `user_${Date.now()}`,
        name: cleanName,
        handle: `@${handleSlug || "creator"}`,
        email: payload.email.trim(),
        role: payload.role.trim() || "Digital Creator",
        location: payload.location.trim() || "Hyderabad",
        joinedAt: todayStr(),
      },
    }));
    showToast(`Welcome to TRENDSPACE, ${cleanName}!`);
  };

  const loginDemo = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: DEMO_DEFAULT_USER,
    }));
    showToast("Entered Demo Creator Workspace as Arjun Rao.");
  };

  const logout = () => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
    showToast("Signed out of workspace.", "info");
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...updates },
    }));
    showToast("Creator profile updated.");
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    showToast("Settings saved.");
  };

  const addIdea = (input: {
    title: string;
    description: string;
    category: IdeaCategory;
    status: IdeaStatus;
    platform: string;
    isPublic: boolean;
    audioTag?: string;
  }) => {
    const now = todayStr();
    const newId = `idea_${Date.now()}`;
    let publicIdeaId: string | undefined;

    const newPublicIdea: PublicIdea | null = input.isPublic
      ? {
          id: `pub_${Date.now()}`,
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          authorId: state.user.id,
          authorName: state.user.name,
          authorHandle: state.user.handle,
          authorAvatar: state.user.avatarUrl,
          platform: input.platform,
          likes: 1,
          likedByMe: true,
          saves: 0,
          savedByMe: false,
          usesCount: 0,
          comments: [],
          createdAt: now,
        }
      : null;

    if (newPublicIdea) {
      publicIdeaId = newPublicIdea.id;
    }

    const created: CreatorIdea = {
      id: newId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      status: input.status,
      platform: input.platform,
      isPublic: input.isPublic,
      publicIdeaId,
      audioTag: input.audioTag?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => ({
      ...prev,
      ideas: [created, ...prev.ideas],
      publicIdeas: newPublicIdea ? [newPublicIdea, ...prev.publicIdeas] : prev.publicIdeas,
    }));

    showToast(
      input.isPublic
        ? "Idea saved and published to the Public Idea Hub."
        : "Idea saved to My Ideas."
    );
    return created;
  };

  const updateIdea = (id: string, updates: Partial<CreatorIdea>) => {
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((idea) =>
        idea.id === id ? { ...idea, ...updates, updatedAt: todayStr() } : idea
      ),
    }));
    showToast("Idea updated.");
  };

  const deleteIdea = (id: string) => {
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((idea) => idea.id !== id),
    }));
    showToast("Idea deleted.", "info");
  };

  const toggleIdeaStatus = (id: string) => {
    const cycle: Record<IdeaStatus, IdeaStatus> = {
      Draft: "In Production",
      "In Production": "Completed",
      Completed: "Draft",
    };
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((idea) =>
        idea.id === id
          ? { ...idea, status: cycle[idea.status], updatedAt: todayStr() }
          : idea
      ),
    }));
  };

  const publishIdeaToHub = (ideaId: string) => {
    const target = state.ideas.find((i) => i.id === ideaId);
    if (!target) return;
    if (target.isPublic) {
      showToast("This idea is already published on the Public Hub.", "info");
      return;
    }

    const pubId = `pub_${Date.now()}`;
    const publicEntry: PublicIdea = {
      id: pubId,
      title: target.title,
      description: target.description,
      category: target.category,
      authorId: state.user.id,
      authorName: state.user.name,
      authorHandle: state.user.handle,
      authorAvatar: state.user.avatarUrl,
      platform: target.platform,
      likes: 1,
      likedByMe: true,
      saves: 0,
      savedByMe: false,
      usesCount: 0,
      comments: [],
      createdAt: todayStr(),
    };

    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((item) =>
        item.id === ideaId ? { ...item, isPublic: true, publicIdeaId: pubId, updatedAt: todayStr() } : item
      ),
      publicIdeas: [publicEntry, ...prev.publicIdeas],
    }));
    showToast("Published idea to the Public Idea Hub!");
  };

  const publishNewPublicIdea = (input: {
    title: string;
    description: string;
    category: IdeaCategory;
    platform: string;
  }) => {
    const now = todayStr();
    const pubId = `pub_${Date.now()}`;
    const publicEntry: PublicIdea = {
      id: pubId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      authorId: state.user.id,
      authorName: state.user.name,
      authorHandle: state.user.handle,
      authorAvatar: state.user.avatarUrl,
      platform: input.platform,
      likes: 1,
      likedByMe: true,
      saves: 0,
      savedByMe: false,
      usesCount: 0,
      comments: [],
      createdAt: now,
    };
    const privateMirror: CreatorIdea = {
      id: `idea_${Date.now()}`,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      status: "Draft",
      platform: input.platform,
      isPublic: true,
      publicIdeaId: pubId,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      publicIdeas: [publicEntry, ...prev.publicIdeas],
      ideas: [privateMirror, ...prev.ideas],
    }));
    showToast("Idea published to the Public Hub and synced to My Ideas.");
  };

  const clonePublicIdeaToMyIdeas = (publicIdeaId: string) => {
    const pub = state.publicIdeas.find((p) => p.id === publicIdeaId);
    if (!pub) return;
    const now = todayStr();
    const cloned: CreatorIdea = {
      id: `idea_${Date.now()}`,
      title: `${pub.title} (Remix)`,
      description: `${pub.description}\n\nInspired by ${pub.authorName} (${pub.authorHandle}).`,
      category: pub.category,
      status: "Draft",
      platform: pub.platform,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      ideas: [cloned, ...prev.ideas],
      publicIdeas: prev.publicIdeas.map((item) =>
        item.id === publicIdeaId ? { ...item, usesCount: item.usesCount + 1 } : item
      ),
    }));
    showToast("Added concept to My Ideas for your next shoot.");
  };

  const toggleLikePublicIdea = (publicIdeaId: string) => {
    setState((prev) => ({
      ...prev,
      publicIdeas: prev.publicIdeas.map((item) =>
        item.id === publicIdeaId
          ? {
              ...item,
              likedByMe: !item.likedByMe,
              likes: item.likedByMe ? Math.max(0, item.likes - 1) : item.likes + 1,
            }
          : item
      ),
    }));
  };

  const toggleSavePublicIdea = (publicIdeaId: string) => {
    setState((prev) => ({
      ...prev,
      publicIdeas: prev.publicIdeas.map((item) =>
        item.id === publicIdeaId
          ? {
              ...item,
              savedByMe: !item.savedByMe,
              saves: item.savedByMe ? Math.max(0, item.saves - 1) : item.saves + 1,
            }
          : item
      ),
    }));
  };

  const addCommentToPublicIdea = (publicIdeaId: string, text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setState((prev) => ({
      ...prev,
      publicIdeas: prev.publicIdeas.map((item) =>
        item.id === publicIdeaId
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `c_${Date.now()}`,
                  authorName: prev.user.name,
                  authorHandle: prev.user.handle,
                  text: clean,
                  createdAt: todayStr(),
                },
              ],
            }
          : item
      ),
    }));
    showToast("Comment posted.");
  };

  const toggleSaveAudio = (audioId: string) => {
    setState((prev) => ({
      ...prev,
      audioTracks: prev.audioTracks.map((track) =>
        track.id === audioId ? { ...track, savedByMe: !track.savedByMe } : track
      ),
    }));
  };

  const sendCollabRequest = (input: {
    creator: CreatorDirectoryMember;
    projectTitle: string;
    message: string;
  }) => {
    const newReq: CollabRequest = {
      id: `req_${Date.now()}`,
      direction: "sent",
      creatorId: input.creator.id,
      creatorName: input.creator.name,
      creatorHandle: input.creator.handle,
      creatorRole: input.creator.role,
      projectTitle: input.projectTitle.trim(),
      message: input.message.trim(),
      status: "Pending",
      createdAt: todayStr(),
    };
    setState((prev) => ({
      ...prev,
      collabRequests: [newReq, ...prev.collabRequests],
    }));
    showToast(`Collaboration request sent to ${input.creator.name}.`);
  };

  const cancelCollabRequest = (requestId: string) => {
    setState((prev) => ({
      ...prev,
      collabRequests: prev.collabRequests.filter((r) => r.id !== requestId),
    }));
    showToast("Collaboration request withdrawn.", "info");
  };

  const respondIncomingCollab = (requestId: string, status: "Accepted" | "Declined") => {
    setState((prev) => ({
      ...prev,
      collabRequests: prev.collabRequests.map((r) =>
        r.id === requestId ? { ...r, status } : r
      ),
    }));
    showToast(`Collaboration request ${status.toLowerCase()}.`);
  };

  const applyToCampaign = (campaignId: string, pitch: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              applied: true,
              applicationStatus: "Applied",
              applicationPitch: pitch.trim(),
              appliedAt: todayStr(),
            }
          : c
      ),
    }));
    showToast("Campaign application submitted!");
  };

  const withdrawCampaignApplication = (campaignId: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              applied: false,
              applicationStatus: undefined,
              applicationPitch: undefined,
              appliedAt: undefined,
            }
          : c
      ),
    }));
    showToast("Application withdrawn.", "info");
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const setEarnAccountRole = (role: "creator" | "brand") => {
    setState((prev) => ({ ...prev, earnAccountRole: role }));
    showToast(
      role === "brand"
        ? "Switched to Brand Account view (campaign & payout permissions active)."
        : "Switched to Creator Account view.",
      "info"
    );
  };

  const submitEarnApplication = (input: {
    campaign: EarnCampaign;
    creatorName: string;
    socialProfileUrl: string;
    relevantSkills: string[];
    pitchReason: string;
    portfolioUrl: string;
  }) => {
    const alreadyApplied = state.earnApplications.some(
      (a) => a.campaignId === input.campaign.id
    );
    if (alreadyApplied) {
      showToast("You have already applied to this campaign.", "info");
      return;
    }

    const now = todayStr();
    const newApp: EarnApplication = {
      id: `app_${Date.now()}`,
      campaignId: input.campaign.id,
      campaignTitle: input.campaign.title,
      brandName: input.campaign.brandName,
      rewardInr: input.campaign.rewardInr,
      creatorName: input.creatorName.trim(),
      socialProfileUrl: input.socialProfileUrl.trim(),
      relevantSkills: input.relevantSkills,
      pitchReason: input.pitchReason.trim(),
      portfolioUrl: input.portfolioUrl.trim(),
      status: "Pending Review",
      appliedAt: now,
      updatedAt: now,
    };

    setState((prev) => ({
      ...prev,
      earnApplications: [newApp, ...prev.earnApplications],
      earnCampaigns: prev.earnCampaigns.map((c) =>
        c.id === input.campaign.id
          ? { ...c, slotsAvailable: Math.max(0, c.slotsAvailable - 1) }
          : c
      ),
    }));
    showToast("Application Submitted — Status: Pending Review.");
  };

  const publishBrandCampaign = (input: {
    title: string;
    brandName: string;
    description: string;
    category: EarnCategory;
    requiredSkills: string[];
    platform: string;
    budgetInr: number;
    rewardInr: number;
    slotsTotal: number;
    deadline: string;
    requirements: string[];
  }) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Switch to Brand Account permissions to publish campaigns.", "error");
      return;
    }
    const initials = input.brandName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");

    const created: EarnCampaign = {
      id: `earn_camp_${Date.now()}`,
      brandName: input.brandName.trim(),
      brandInitials: initials || "BR",
      brandAccent: "from-violet-600 to-blue-600",
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      requiredSkills: input.requiredSkills,
      platform: input.platform,
      budgetInr: input.budgetInr,
      rewardInr: input.rewardInr,
      slotsTotal: input.slotsTotal,
      slotsAvailable: input.slotsTotal,
      deadline: input.deadline,
      requirements: input.requirements,
      createdByRole: "brand",
      createdAt: todayStr(),
    };

    setState((prev) => ({
      ...prev,
      earnCampaigns: [created, ...prev.earnCampaigns],
    }));
    showToast("Campaign published to the Creator Earn marketplace!");
  };

  const reviewEarnApplication = (
    applicationId: string,
    decision: "Approved" | "Rejected",
    reviewNote?: string
  ) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Brand permissions are required to review applications.", "error");
      return;
    }
    setState((prev) => ({
      ...prev,
      earnApplications: prev.earnApplications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: decision,
              brandReviewNote: reviewNote?.trim() || app.brandReviewNote,
              updatedAt: todayStr(),
            }
          : app
      ),
    }));
    showToast(`Application ${decision}.`);
  };

  const submitEarnWork = (
    applicationId: string,
    workUrl: string,
    workDescription: string
  ) => {
    const target = state.earnApplications.find((a) => a.id === applicationId);
    if (!target || target.status !== "Approved") {
      showToast("Work can only be submitted on Approved campaigns.", "error");
      return;
    }

    const now = todayStr();
    const pendingRef = `pending_${applicationId}`;

    setState((prev) => {
      const hasPendingTx = prev.earnTransactions.some((t) => t.referenceId === pendingRef);
      const nextTransactions: EarnTransaction[] = hasPendingTx
        ? prev.earnTransactions
        : [
            {
              id: `tx_${Date.now()}`,
              title: `${target.brandName} — ${target.campaignTitle} (Pending Brand Approval)`,
              date: now,
              type: "Campaign Payout",
              amountInr: target.rewardInr,
              status: "Pending Verification",
              referenceId: pendingRef,
            },
            ...prev.earnTransactions,
          ];

      return {
        ...prev,
        earnApplications: prev.earnApplications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: "Work Submitted",
                submittedWorkUrl: workUrl.trim(),
                submittedWorkDescription: workDescription.trim(),
                submittedWorkAt: now,
                updatedAt: now,
              }
            : app
        ),
        earnTransactions: nextTransactions,
      };
    });

    showToast("Work submitted for brand verification.");
  };

  const releaseEarnPayment = async (applicationId: string) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Only brand accounts can release payments.", "error");
      return;
    }
    const target = state.earnApplications.find((a) => a.id === applicationId);
    if (!target) return;
    if (target.status === "Payment Released") {
      showToast("Payment has already been released for this submission.", "info");
      return;
    }
    if (target.status !== "Work Submitted" && target.status !== "Completed") {
      showToast("Creator must submit work before payment can be released.", "error");
      return;
    }

    try {
      const result = await verifyBrandPayoutOnServer({
        idempotencyKey: `payout_${applicationId}`,
        campaignId: target.campaignId,
        applicationId: target.id,
        amountInr: target.rewardInr,
        actorRole: "brand",
      });

      const now = todayStr();
      const pendingRef = `pending_${applicationId}`;

      setState((prev) => {
        const filteredTx = prev.earnTransactions.filter((t) => t.referenceId !== pendingRef);
        const alreadyRecorded = filteredTx.some(
          (t) => t.referenceId === result.payoutReference
        );
        const newTx: EarnTransaction = {
          id: `tx_${Date.now()}`,
          title: `${target.brandName} — ${target.campaignTitle}`,
          date: now,
          type: "Campaign Payout",
          amountInr: target.rewardInr,
          status: "Released",
          referenceId: result.payoutReference,
        };

        return {
          ...prev,
          earnApplications: prev.earnApplications.map((app) =>
            app.id === applicationId
              ? {
                  ...app,
                  status: "Payment Released",
                  payoutReference: result.payoutReference,
                  brandReviewNote: "Deliverable approved. Demo payout released.",
                  updatedAt: now,
                }
              : app
          ),
          earnTransactions: alreadyRecorded ? filteredTx : [newTx, ...filteredTx],
        };
      });

      showToast(`Verified payout released: ₹${target.rewardInr.toLocaleString("en-IN")} (Demo).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not verify payout.";
      showToast(msg, "error");
    }
  };

  const rejectSubmittedWork = (applicationId: string, reviewNote: string) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Brand permissions are required.", "error");
      return;
    }
    const pendingRef = `pending_${applicationId}`;
    setState((prev) => ({
      ...prev,
      earnApplications: prev.earnApplications.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "Approved",
              brandReviewNote: reviewNote.trim() || "Revision requested by brand.",
              updatedAt: todayStr(),
            }
          : app
      ),
      earnTransactions: prev.earnTransactions.filter((t) => t.referenceId !== pendingRef),
    }));
    showToast("Revision requested — creator notified to resubmit work.", "info");
  };

  const requestDemoWithdrawal = (input: {
    amountInr: number;
    method: "UPI ID (Demo)" | "Bank Transfer (Demo)";
    destination: string;
  }) => {
    const releasedEarnings = state.earnTransactions
      .filter((t) => t.amountInr > 0 && t.status === "Released")
      .reduce((acc, t) => acc + t.amountInr, 0);
    const withdrawnTotal = state.earnTransactions
      .filter((t) => t.amountInr < 0)
      .reduce((acc, t) => acc + Math.abs(t.amountInr), 0);
    const available = Math.max(0, releasedEarnings - withdrawnTotal);

    if (input.amountInr <= 0 || input.amountInr > available) {
      showToast("Withdrawal amount exceeds available demo balance.", "error");
      return false;
    }

    const now = todayStr();
    const ref = `demo_wd_${Date.now()}`;
    const newWithdrawal: DemoWithdrawal = {
      id: `wd_${Date.now()}`,
      amountInr: input.amountInr,
      method: input.method,
      destination: input.destination.trim(),
      status: "Processed (Demo)",
      createdAt: now,
    };

    const newTx: EarnTransaction = {
      id: `tx_${Date.now()}`,
      title: `${input.method} (${input.destination.trim()})`,
      date: now,
      type: "Demo Withdrawal",
      amountInr: -input.amountInr,
      status: "Processed (Demo)",
      referenceId: ref,
    };

    setState((prev) => ({
      ...prev,
      demoWithdrawals: [newWithdrawal, ...prev.demoWithdrawals],
      earnTransactions: [newTx, ...prev.earnTransactions],
    }));

    showToast(`Demo withdrawal of ₹${input.amountInr.toLocaleString("en-IN")} recorded.`);
    return true;
  };

  const publishBountyChallenge = (input: {
    brandName: string;
    title: string;
    prompt: string;
    platform: string;
    rewardInr: number;
    deadline: string;
  }) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Switch to Brand Account permissions to post challenges.", "error");
      return;
    }
    const created: BountyChallenge = {
      id: `bounty_${Date.now()}`,
      brandName: input.brandName.trim(),
      title: input.title.trim(),
      prompt: input.prompt.trim(),
      platform: input.platform,
      rewardInr: input.rewardInr,
      deadline: input.deadline,
      status: "Open",
    };
    setState((prev) => ({
      ...prev,
      bountyChallenges: [created, ...prev.bountyChallenges],
    }));
    showToast("Idea Bounty Challenge posted.");
  };

  const submitBountyIdea = (input: {
    bountyId: string;
    ideaTitle: string;
    conceptSummary: string;
    workUrl?: string;
  }) => {
    const newSub: BountySubmission = {
      id: `bsub_${Date.now()}`,
      bountyId: input.bountyId,
      creatorName: state.user.name,
      ideaTitle: input.ideaTitle.trim(),
      conceptSummary: input.conceptSummary.trim(),
      workUrl: input.workUrl?.trim() || undefined,
      status: "Submitted",
      submittedAt: todayStr(),
    };
    setState((prev) => ({
      ...prev,
      bountySubmissions: [newSub, ...prev.bountySubmissions],
    }));
    showToast("Idea submitted to bounty challenge.");
  };

  const awardBountySubmission = (bountyId: string, submissionId: string) => {
    if (state.earnAccountRole !== "brand") {
      showToast("Brand permissions are required to award bounties.", "error");
      return;
    }
    const bounty = state.bountyChallenges.find((b) => b.id === bountyId);
    const sub = state.bountySubmissions.find((s) => s.id === submissionId);
    if (!bounty || !sub || bounty.status === "Awarded") {
      showToast("This bounty has already been awarded.", "info");
      return;
    }

    const now = todayStr();
    const tx: EarnTransaction = {
      id: `tx_${Date.now()}`,
      title: `Bounty Winner: ${bounty.title} (${bounty.brandName})`,
      date: now,
      type: "Bounty Reward",
      amountInr: bounty.rewardInr,
      status: "Released",
      referenceId: `bounty_win_${bountyId}`,
    };

    setState((prev) => ({
      ...prev,
      bountyChallenges: prev.bountyChallenges.map((b) =>
        b.id === bountyId ? { ...b, status: "Awarded" } : b
      ),
      bountySubmissions: prev.bountySubmissions.map((s) =>
        s.bountyId === bountyId
          ? { ...s, status: s.id === submissionId ? "Selected Winner" : "Not Selected" }
          : s
      ),
      earnTransactions: [tx, ...prev.earnTransactions],
    }));
    showToast(`Bounty awarded! ₹${bounty.rewardInr.toLocaleString("en-IN")} added (Demo).`);
  };

  const simulateAffiliateDemoConversion = (programId: string) => {
    const prog = state.affiliatePrograms.find((p) => p.id === programId);
    if (!prog) return;
    const now = todayStr();
    const tx: EarnTransaction = {
      id: `tx_${Date.now()}`,
      title: `Demo Affiliate Conversion: ${prog.productTitle}`,
      date: now,
      type: "Affiliate Commission",
      amountInr: prog.commissionPerConversionInr,
      status: "Released",
      referenceId: `demo_aff_${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      affiliatePrograms: prev.affiliatePrograms.map((p) =>
        p.id === programId
          ? {
              ...p,
              clicks: p.clicks + 12,
              verifiedConversions: p.verifiedConversions + 1,
              commissionEarnedInr: p.commissionEarnedInr + p.commissionPerConversionInr,
            }
          : p
      ),
      earnTransactions: [tx, ...prev.earnTransactions],
    }));
    showToast(
      `Simulated +1 verified affiliate conversion (+₹${prog.commissionPerConversionInr}).`,
      "info"
    );
  };

  const resetDemoWorkspace = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAuthenticated: true,
      user: DEMO_DEFAULT_USER,
      settings: DEMO_DEFAULT_SETTINGS,
      ideas: DEMO_INITIAL_IDEAS,
      publicIdeas: DEMO_PUBLIC_IDEAS,
      audioTracks: DEMO_TRENDING_AUDIO,
      creators: DEMO_CREATORS,
      collabRequests: DEMO_COLLAB_REQUESTS,
      campaigns: DEMO_BRAND_CAMPAIGNS,
      notifications: DEMO_NOTIFICATIONS,
      earnAccountRole: "creator",
      earnCampaigns: DEMO_EARN_CAMPAIGNS,
      earnApplications: DEMO_EARN_APPLICATIONS,
      earnTransactions: DEMO_EARN_TRANSACTIONS,
      demoWithdrawals: DEMO_WITHDRAWALS,
      bountyChallenges: DEMO_BOUNTY_CHALLENGES,
      bountySubmissions: DEMO_BOUNTY_SUBMISSIONS,
      affiliatePrograms: DEMO_AFFILIATE_PROGRAMS,
    });
    showToast("Demo workspace restored to default sample data.");
  };

  return (
    <CreatorVerseContext.Provider
      value={{
        ...state,
        toasts,
        showToast,
        dismissToast,
        login,
        signup,
        loginDemo,
        logout,
        updateProfile,
        updateSettings,
        addIdea,
        updateIdea,
        deleteIdea,
        toggleIdeaStatus,
        publishIdeaToHub,
        clonePublicIdeaToMyIdeas,
        publishNewPublicIdea,
        toggleLikePublicIdea,
        toggleSavePublicIdea,
        addCommentToPublicIdea,
        toggleSaveAudio,
        sendCollabRequest,
        cancelCollabRequest,
        respondIncomingCollab,
        applyToCampaign,
        withdrawCampaignApplication,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoWorkspace,
        setEarnAccountRole,
        submitEarnApplication,
        publishBrandCampaign,
        reviewEarnApplication,
        submitEarnWork,
        releaseEarnPayment,
        rejectSubmittedWork,
        requestDemoWithdrawal,
        publishBountyChallenge,
        submitBountyIdea,
        awardBountySubmission,
        simulateAffiliateDemoConversion,
      }}
    >
      {children}
    </CreatorVerseContext.Provider>
  );
}

export function useCreatorVerse() {
  const ctx = useContext(CreatorVerseContext);
  if (!ctx) {
    throw new Error("useCreatorVerse must be used inside CreatorVerseProvider");
  }
  return ctx;
}
