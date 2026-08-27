export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

export type FeedbackChannel =
  | 'ZENDESK'
  | 'INTERCOM'
  | 'APP_STORE'
  | 'SALES_CALL'
  | 'DISCORD'
  | 'NPS_SURVEY'
  | 'EMAIL';

export type SentimentType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export type FeedbackStatus = 'NEW' | 'REVIEWED' | 'ACTIONED';

export type CustomerTier = 'ENTERPRISE' | 'PRO' | 'STARTER' | 'FREE';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  domain: string;
  industry: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  avatar: string;
  title: string;
}

export type UserProfile = User;

export interface FeedbackItem {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerTier: CustomerTier;
  channel: FeedbackChannel;
  sentiment: SentimentType;
  sentimentScore: number; // -1.0 to 1.0
  status: FeedbackStatus;
  featureArea: string; // e.g. "Onboarding", "Billing", "API & Webhooks", "Mobile App", "Analytics", "Security & SSO"
  themes: string[]; // e.g. ["SSO Token Drop", "SAML Configuration"]
  tags: string[];
  urgency: UrgencyLevel;
  createdAt: string;
  aiSummary?: string;
  keyQuote?: string;
  actionNotes?: string;
  actionedBy?: string;
  actionedAt?: string;
  // Deduplication Metadata
  contentHash?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  duplicateOfTitle?: string;
  duplicateSimilarityScore?: number;
  duplicateType?: 'EXACT_HASH' | 'SEMANTIC_SIMILARITY';
  duplicateCount?: number;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matchType: 'EXACT_HASH' | 'SEMANTIC_SIMILARITY' | 'NONE';
  similarityScore: number;
  matchedItem?: FeedbackItem;
  contentHash: string;
  reason?: string;
}

export interface IngestionOptions {
  checkDuplicates?: boolean;
  deduplicationMode?: 'flag' | 'reject' | 'allow' | 'merge';
  similarityThreshold?: number; // e.g. 0.88
}

export interface ThemeItem {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  featureArea: string;
  feedbackCount: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageSentimentScore: number;
  growthPct: number; // e.g. +34% vs last week
  isSpike: boolean;
  priorityScore: number; // 0 - 100
  sampleQuotes: string[];
  recommendedAction: string;
  relatedFeedbackIds: string[];
}

export interface VoCReport {
  id: string;
  workspaceId: string;
  title: string;
  timeRange: string;
  generatedAt: string;
  summary: string;
  statsSnapshot: {
    totalFeedbackAnalyzed: number;
    avgSentimentScore: number;
    negativeRatioPct: number;
    criticalIssuesCount: number;
    topChannel: string;
  };
  topThemes: Array<{
    name: string;
    featureArea: string;
    count: number;
    impact: string;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  sentimentShift: {
    currentScore: number;
    previousScore: number;
    deltaLabel: string;
    breakdown: { positivePct: number; neutralPct: number; negativePct: number };
  };
  criticalGaps: string[];
  prioritizedActions: Array<{
    priority: 'P1' | 'P2' | 'P3';
    action: string;
    department: string;
    expectedImpact: string;
    evidenceSnippet: string;
    timeline: string;
  }>;
  representativeQuotes: Array<{
    quote: string;
    customerName: string;
    customerTier: string;
    channel: string;
    theme: string;
  }>;
}

export interface GroundedSource {
  id: string;
  customerName: string;
  customerCompany?: string;
  customerTier: string;
  channel: FeedbackChannel;
  snippet: string;
  sentiment: SentimentType;
  featureArea: string;
  urgency?: UrgencyLevel;
  createdAt: string;
  similarityScore?: number;
}

export interface RetrievalStats {
  vectorCount: number;
  latencyMs: number;
  model: string;
  searchMode: string;
  avgSimilarity: number;
}

export interface VectorIndexStatus {
  workspaceId: string;
  totalDocuments: number;
  totalVectors: number;
  dimension: number;
  model: string;
  cacheHits: number;
  lastIndexedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: GroundedSource[];
  suggestedFollowups?: string[];
  retrievalMode?: string;
  retrievalLatencyMs?: number;
}
