export type SentimentKind = "positive" | "negative" | "neutral";

export type SentimentSplit = {
  positive: number;
  negative: number;
  neutral: number;
};

export type CastInVideo = {
  name: string;
  slug: string;
  mentionCount: number;
  sentiment: SentimentSplit;
  topPositiveQuote: string;
  topNegativeQuote: string | null;
  bringBack: boolean;
  fatigue: boolean;
};

export type GeneralComment = {
  text: string;
  sentiment: SentimentKind;
};

export type VideoAnalysis = {
  id: string;
  youtubeId: string;
  title: string;
  views: number;
  commentCountTotal: number;
  commentsAnalyzed: number;
  publishedAt: string;
  analyzedAt: string;
  overallSentiment: SentimentSplit;
  standoutQuotes: string[];
  cast: CastInVideo[];
  generalComments: GeneralComment[];
};

export type PulseAlert = {
  id: string;
  headline: string;
  detail: string;
  tone: "amber" | "coral" | "neutral";
};

export type VideoPulseSummary = {
  id: string;
  youtubeId: string;
  title: string;
  analyzedAt: string;
  overallSentiment: SentimentSplit;
  commentsAnalyzed: number;
  standoutQuotes: string[];
};

export type CastTrend = "up" | "down" | "flat";

export type CastStatus = "Hot" | "Resting" | "Overexposed" | "Fresh";

export type TrajectoryPoint = {
  videoId: string;
  videoTitle: string;
  youtubeId: string;
  date: string;
  positivePct: number;
};

export type AppearanceRow = TrajectoryPoint & {
  topComment: string;
};

export type CastProfile = {
  slug: string;
  name: string;
  social?: string;
  appearanceCount: number;
  avgPositivePct: number;
  trend: CastTrend;
  status: CastStatus;
  lastAppearanceDate: string;
  trajectory: TrajectoryPoint[];
  videosAppeared: AppearanceRow[];
  recommendation: string;
};

export type RosterRow = {
  slug: string;
  name: string;
  totalAppearances: number;
  avgSentimentPositive: number;
  lastAppearanceDate: string;
  trend: CastTrend;
  status: CastStatus;
  /** Tracked name with no comment mentions in analyzed videos yet. */
  noCommentDataYet?: boolean;
};
