import type {
  CastProfile,
  PulseAlert,
  VideoAnalysis,
  VideoPulseSummary,
} from "./types";
import { slugifyName } from "./slug";

function split(p: number, n: number, u: number): {
  positive: number;
  negative: number;
  neutral: number;
} {
  return { positive: p, negative: n, neutral: u };
}

const YT = {
  blind: "dQw4w9WgXcQ",
  balloon: "9bZkp7q19f0",
  celeb: "kJQP7kiw5Fk",
  couple: "L_jWHff5D9A",
} as const;

export const MOCK_VIDEOS: Record<string, VideoAnalysis> = {
  "blind-dating-girls-by-aesthetic": {
    id: "blind-dating-girls-by-aesthetic",
    youtubeId: YT.blind,
    title: "Blind Dating Girls By Aesthetic",
    views: 4_200_000,
    commentCountTotal: 8200,
    commentsAnalyzed: 8200,
    publishedAt: "2025-11-02",
    analyzedAt: "2026-04-28",
    overallSentiment: split(68, 14, 18),
    standoutQuotes: [
      "Camille carried the entire room—give her a spinoff.",
      "Production value + casting = actually unreal this week.",
    ],
    cast: [
      {
        name: "Camille Dubois",
        slug: slugifyName("Camille Dubois"),
        mentionCount: 1420,
        sentiment: split(91, 4, 5),
        topPositiveQuote:
          "Camille is literally wife material—respectful, funny, actually listening. More of her please.",
        topNegativeQuote: "Felt like she got less screen time than she deserved.",
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Raven Blackwood",
        slug: slugifyName("Raven Blackwood"),
        mentionCount: 980,
        sentiment: split(54, 32, 14),
        topPositiveQuote: "Raven's humor saved that awkward pause—icon timing.",
        topNegativeQuote:
          "She's been on like four times this month... we need fresh faces in rotation.",
        bringBack: false,
        fatigue: true,
      },
      {
        name: "Mia Chen",
        slug: slugifyName("Mia Chen"),
        mentionCount: 910,
        sentiment: split(85, 7, 8),
        topPositiveQuote: "Mia's energy is infectious—she makes everyone better on camera.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Destiny Reeves",
        slug: slugifyName("Destiny Reeves"),
        mentionCount: 720,
        sentiment: split(87, 5, 8),
        topPositiveQuote: "Destiny's improv in the corner bits—bring her back every format.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Jordan Taylor",
        slug: slugifyName("Jordan Taylor"),
        mentionCount: 540,
        sentiment: split(79, 9, 12),
        topPositiveQuote: "Jordan seems genuinely kind; refreshing to see on this channel.",
        topNegativeQuote: "Wanted a bit more risk-taking in answers.",
        bringBack: false,
        fatigue: false,
      },
      {
        name: "Lily Nakamura",
        slug: slugifyName("Lily Nakamura"),
        mentionCount: 480,
        sentiment: split(76, 8, 16),
        topPositiveQuote: "Lily's aesthetic storytelling was a highlight.",
        topNegativeQuote: "Underused compared to the rest of the cast.",
        bringBack: false,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "This format works best when the commentary room feels smaller—less cross-talk chaos.",
        sentiment: "neutral",
      },
      {
        text: "Sound mix in the reveal section was a bit hot; otherwise immaculate episode.",
        sentiment: "negative",
      },
      {
        text: "More blind aesthetic breakdowns like this—the pacing was chef's kiss.",
        sentiment: "positive",
      },
    ],
  },
  "pop-the-balloon-15-girls-vs-2-guys": {
    id: "pop-the-balloon-15-girls-vs-2-guys",
    youtubeId: YT.balloon,
    title: "Pop the Balloon: 15 Girls vs 2 Guys",
    views: 3_100_000,
    commentCountTotal: 5400,
    commentsAnalyzed: 5400,
    publishedAt: "2025-12-14",
    analyzedAt: "2026-04-25",
    overallSentiment: split(62, 18, 20),
    standoutQuotes: [
      "Sasha in the middle rounds was comedy gold.",
      "Camille again? Not mad—she elevates games like this.",
    ],
    cast: [
      {
        name: "Camille Dubois",
        slug: slugifyName("Camille Dubois"),
        mentionCount: 1100,
        sentiment: split(93, 3, 4),
        topPositiveQuote: "If Camille isn't in the next challenge video I'm rioting politely.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Destiny Reeves",
        slug: slugifyName("Destiny Reeves"),
        mentionCount: 890,
        sentiment: split(89, 4, 7),
        topPositiveQuote:
          "Destiny's quick reactions are what these balloon videos need—queen of timing.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Sasha Monroe",
        slug: slugifyName("Sasha Monroe"),
        mentionCount: 760,
        sentiment: split(81, 6, 13),
        topPositiveQuote: "Sasha went full improv coach and it worked.",
        topNegativeQuote: "Sometimes stepped on other people's reactions.",
        bringBack: false,
        fatigue: false,
      },
      {
        name: "Priya Sharma",
        slug: slugifyName("Priya Sharma"),
        mentionCount: 620,
        sentiment: split(74, 9, 17),
        topPositiveQuote: "Priya asking the smart questions in round two—more of that energy.",
        topNegativeQuote: "Wish she'd pushed back on one of the prompts.",
        bringBack: false,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "Balloon format peaks when rounds are shorter—this one dragged in the middle.",
        sentiment: "neutral",
      },
      {
        text: "Thumbnail is perfect; algorithm gods fed.",
        sentiment: "positive",
      },
    ],
  },
  "celebrity-lookalike-dating-challenge": {
    id: "celebrity-lookalike-dating-challenge",
    youtubeId: YT.celeb,
    title: "Celebrity Lookalike Dating Challenge",
    views: 2_800_000,
    commentCountTotal: 4100,
    commentsAnalyzed: 4100,
    publishedAt: "2026-01-20",
    analyzedAt: "2026-04-20",
    overallSentiment: split(59, 22, 19),
    standoutQuotes: [
      "Marcus had the best deadpan—underrated episode MVP.",
      "Raven fatigue is real in these comments.",
    ],
    cast: [
      {
        name: "Raven Blackwood",
        slug: slugifyName("Raven Blackwood"),
        mentionCount: 820,
        sentiment: split(48, 38, 14),
        topPositiveQuote: "Raven still funny but felt like same beats as last time.",
        topNegativeQuote:
          "She's been on like 4 times—rotate the bench, there are other hilarious people.",
        bringBack: false,
        fatigue: true,
      },
      {
        name: "Mia Chen",
        slug: slugifyName("Mia Chen"),
        mentionCount: 740,
        sentiment: split(84, 8, 8),
        topPositiveQuote: "Mia made the lookalike reveals feel genuine instead of mean.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Jake Rossi",
        slug: slugifyName("Jake Rossi"),
        mentionCount: 690,
        sentiment: split(78, 10, 12),
        topPositiveQuote: "Jake and Mia chemistry in segment 2 was subtle but strong.",
        topNegativeQuote: "Needs one bolder choice per episode to stand out.",
        bringBack: false,
        fatigue: false,
      },
      {
        name: "Marcus Williams",
        slug: slugifyName("Marcus Williams"),
        mentionCount: 510,
        sentiment: split(82, 6, 12),
        topPositiveQuote: "Marcus delivery is so dry it's perfect for this channel.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "Celebrity likeness jokes walk a line—this episode stayed classy.",
        sentiment: "positive",
      },
      {
        text: "Would love a follow-up with audience voting on the closest match.",
        sentiment: "neutral",
      },
    ],
  },
  "guess-the-real-couple": {
    id: "guess-the-real-couple",
    youtubeId: YT.couple,
    title: "Guess the Real Couple",
    views: 1_900_000,
    commentCountTotal: 3200,
    commentsAnalyzed: 3200,
    publishedAt: "2026-03-08",
    analyzedAt: "2026-04-18",
    overallSentiment: split(71, 12, 17),
    standoutQuotes: [
      "Camille + Jake segment had people pausing to rewatch.",
      "Jordan quietly improving every episode.",
    ],
    cast: [
      {
        name: "Camille Dubois",
        slug: slugifyName("Camille Dubois"),
        mentionCount: 950,
        sentiment: split(94, 2, 4),
        topPositiveQuote:
          "The Camille & Jake beat is the kind of human moment this channel does best.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
      {
        name: "Jake Rossi",
        slug: slugifyName("Jake Rossi"),
        mentionCount: 710,
        sentiment: split(80, 8, 12),
        topPositiveQuote: "Jake letting Camille lead the story arch—smart on-camera instincts.",
        topNegativeQuote: "Still finding his comedic pacing in group shots.",
        bringBack: false,
        fatigue: false,
      },
      {
        name: "Jordan Taylor",
        slug: slugifyName("Jordan Taylor"),
        mentionCount: 550,
        sentiment: split(81, 6, 13),
        topPositiveQuote: "Jordan's reads on body language were shockingly accurate.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "This concept could be a recurring series with rotating guest detectives.",
        sentiment: "positive",
      },
      {
        text: "Cold open ran long—hook was strong but trim 8 seconds next time.",
        sentiment: "neutral",
      },
    ],
  },
  "speed-dating-one-chair-remix": {
    id: "speed-dating-one-chair-remix",
    youtubeId: YT.celeb,
    title: "Speed Dating: One Chair Remix",
    views: 1_400_000,
    commentCountTotal: 2800,
    commentsAnalyzed: 2800,
    publishedAt: "2025-09-12",
    analyzedAt: "2026-04-01",
    overallSentiment: split(72, 11, 17),
    standoutQuotes: [
      "Camille pacing the room was the opposite of cringe—more setups like this.",
    ],
    cast: [
      {
        name: "Camille Dubois",
        slug: slugifyName("Camille Dubois"),
        mentionCount: 620,
        sentiment: split(86, 5, 9),
        topPositiveQuote:
          "Instant favorite—natural charisma without trying to win the room.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "One-chair constraint forced better listening—keep that rule.",
        sentiment: "positive",
      },
    ],
  },
  "coffee-shop-encounters": {
    id: "coffee-shop-encounters",
    youtubeId: YT.couple,
    title: "Coffee Shop Encounters",
    views: 980_000,
    commentCountTotal: 1900,
    commentsAnalyzed: 1900,
    publishedAt: "2025-05-20",
    analyzedAt: "2026-03-15",
    overallSentiment: split(70, 13, 17),
    standoutQuotes: ["Mia's micro-expressions in the B-roll carried the episode."],
    cast: [
      {
        name: "Mia Chen",
        slug: slugifyName("Mia Chen"),
        mentionCount: 480,
        sentiment: split(86, 7, 7),
        topPositiveQuote: "Mia is the reason I stayed past the three-minute mark.",
        topNegativeQuote: null,
        bringBack: true,
        fatigue: false,
      },
    ],
    generalComments: [
      {
        text: "Softer color grade fits this format—don't over-crush the blacks next time.",
        sentiment: "neutral",
      },
    ],
  },
};

export const MOCK_VIDEO_ORDER = [
  "blind-dating-girls-by-aesthetic",
  "pop-the-balloon-15-girls-vs-2-guys",
  "celebrity-lookalike-dating-challenge",
  "guess-the-real-couple",
] as const;

export function toPulseSummary(v: VideoAnalysis): VideoPulseSummary {
  return {
    id: v.id,
    youtubeId: v.youtubeId,
    title: v.title,
    analyzedAt: v.analyzedAt,
    overallSentiment: v.overallSentiment,
    commentsAnalyzed: v.commentsAnalyzed,
    standoutQuotes: v.standoutQuotes,
  };
}

export const MOCK_ALERTS: PulseAlert[] = [
  {
    id: "raven-negative-streak",
    headline: "Raven Blackwood — tone shift",
    detail:
      "Mentioned negatively in 3 of the last 4 analyzed videos; fatigue language up sharply.",
    tone: "coral",
  },
  {
    id: "camille-trending",
    headline: "Camille Dubois — audience pull",
    detail:
      'Comment clusters show recurring "bring her back" signals and strong positive association.',
    tone: "amber",
  },
  {
    id: "destiny-improv",
    headline: "Destiny Reeves — improv equity",
    detail:
      "High positive velocity on challenge formats; strong candidate for next week's tentpole.",
    tone: "neutral",
  },
];

export const MOCK_CAST_PROFILES: Record<string, CastProfile> = {
  [slugifyName("Camille Dubois")]: {
    slug: slugifyName("Camille Dubois"),
    name: "Camille Dubois",
    social: "@camilledubois",
    appearanceCount: 4,
    avgPositivePct: 91,
    trend: "up",
    status: "Hot",
    lastAppearanceDate: "2026-03-08",
    trajectory: [
      {
        videoId: "speed-dating-one-chair-remix",
        videoTitle: "Speed Dating: One Chair Remix",
        youtubeId: YT.celeb,
        date: "2025-09-12",
        positivePct: 86,
      },
      {
        videoId: "pop-the-balloon-15-girls-vs-2-guys",
        videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys",
        youtubeId: YT.balloon,
        date: "2025-12-14",
        positivePct: 93,
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 91,
      },
      {
        videoId: "guess-the-real-couple",
        videoTitle: "Guess the Real Couple",
        youtubeId: YT.couple,
        date: "2026-03-08",
        positivePct: 94,
      },
    ],
    videosAppeared: [
      {
        videoId: "guess-the-real-couple",
        videoTitle: "Guess the Real Couple",
        youtubeId: YT.couple,
        date: "2026-03-08",
        positivePct: 94,
        topComment:
          "The Camille & Jake beat is the kind of human moment this channel does best.",
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 91,
        topComment:
          "Camille is literally wife material—respectful, funny, actually listening. More of her please.",
      },
      {
        videoId: "pop-the-balloon-15-girls-vs-2-guys",
        videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys",
        youtubeId: YT.balloon,
        date: "2025-12-14",
        positivePct: 93,
        topComment:
          "If Camille isn't in the next challenge video I'm rioting politely.",
      },
      {
        videoId: "speed-dating-one-chair-remix",
        videoTitle: "Speed Dating: One Chair Remix",
        youtubeId: YT.celeb,
        date: "2025-09-12",
        positivePct: 86,
        topComment: "Instant favorite—natural charisma without trying to win the room.",
      },
    ],
    recommendation:
      "Audience sentiment is strong with sustained upward trajectory — prioritize for a return appearance within the next 2–3 uploads.",
  },
  [slugifyName("Raven Blackwood")]: {
    slug: slugifyName("Raven Blackwood"),
    name: "Raven Blackwood",
    social: "@ravenblackwood",
    appearanceCount: 5,
    avgPositivePct: 62,
    trend: "down",
    status: "Resting",
    lastAppearanceDate: "2026-01-20",
    trajectory: [
      { videoId: "m1", videoTitle: "Late Night Debate Club", youtubeId: YT.blind, date: "2025-06-01", positivePct: 88 },
      { videoId: "m2", videoTitle: "Two Truths & a Lie", youtubeId: YT.balloon, date: "2025-08-10", positivePct: 79 },
      { videoId: "m3", videoTitle: "Ranking Exes (CHAOS)", youtubeId: YT.celeb, date: "2025-10-04", positivePct: 71 },
      { videoId: "blind-dating-girls-by-aesthetic", videoTitle: "Blind Dating Girls By Aesthetic", youtubeId: YT.blind, date: "2025-11-02", positivePct: 54 },
      { videoId: "celebrity-lookalike-dating-challenge", videoTitle: "Celebrity Lookalike Dating Challenge", youtubeId: YT.celeb, date: "2026-01-20", positivePct: 48 },
    ],
    videosAppeared: [
      {
        videoId: "celebrity-lookalike-dating-challenge",
        videoTitle: "Celebrity Lookalike Dating Challenge",
        youtubeId: YT.celeb,
        date: "2026-01-20",
        positivePct: 48,
        topComment:
          "She's been on like 4 times—rotate the bench, there are other hilarious people.",
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 54,
        topComment: "Raven's humor saved that awkward pause—icon timing.",
      },
    ],
    recommendation:
      "Declining sentiment over the last three appearances with rising fatigue language — consider resting Raven for 4–6 weeks before a soft reintroduction in a fresh format.",
  },
  [slugifyName("Mia Chen")]: {
    slug: slugifyName("Mia Chen"),
    name: "Mia Chen",
    social: "@miachen",
    appearanceCount: 3,
    avgPositivePct: 85,
    trend: "flat",
    status: "Overexposed",
    lastAppearanceDate: "2026-01-20",
    trajectory: [
      {
        videoId: "coffee-shop-encounters",
        videoTitle: "Coffee Shop Encounters",
        youtubeId: YT.couple,
        date: "2025-05-20",
        positivePct: 86,
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 85,
      },
      {
        videoId: "celebrity-lookalike-dating-challenge",
        videoTitle: "Celebrity Lookalike Dating Challenge",
        youtubeId: YT.celeb,
        date: "2026-01-20",
        positivePct: 84,
      },
    ],
    videosAppeared: [
      {
        videoId: "coffee-shop-encounters",
        videoTitle: "Coffee Shop Encounters",
        youtubeId: YT.couple,
        date: "2025-05-20",
        positivePct: 86,
        topComment: "Mia is the reason I stayed past the three-minute mark.",
      },
      {
        videoId: "celebrity-lookalike-dating-challenge",
        videoTitle: "Celebrity Lookalike Dating Challenge",
        youtubeId: YT.celeb,
        date: "2026-01-20",
        positivePct: 84,
        topComment: "Mia made the lookalike reveals feel genuine instead of mean.",
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 85,
        topComment: "Mia's energy is infectious—she makes everyone better on camera.",
      },
    ],
    recommendation:
      "Fan favorite—sentiment holding steady, but visibility is high. Pair with newer faces next cycle to avoid crossing into overexposure.",
  },
  [slugifyName("Jordan Taylor")]: {
    slug: slugifyName("Jordan Taylor"),
    name: "Jordan Taylor",
    appearanceCount: 2,
    avgPositivePct: 80,
    trend: "up",
    status: "Fresh",
    lastAppearanceDate: "2026-03-08",
    trajectory: [
      { videoId: "blind-dating-girls-by-aesthetic", videoTitle: "Blind Dating Girls By Aesthetic", youtubeId: YT.blind, date: "2025-11-02", positivePct: 79 },
      { videoId: "guess-the-real-couple", videoTitle: "Guess the Real Couple", youtubeId: YT.couple, date: "2026-03-08", positivePct: 81 },
    ],
    videosAppeared: [
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 79,
        topComment: "Jordan seems genuinely kind; refreshing to see on this channel.",
      },
      {
        videoId: "guess-the-real-couple",
        videoTitle: "Guess the Real Couple",
        youtubeId: YT.couple,
        date: "2026-03-08",
        positivePct: 81,
        topComment: "Jordan's reads on body language were shockingly accurate.",
      },
    ],
    recommendation:
      "Fresh face with warm reception — strong candidate for a return in a character-forward format.",
  },
  [slugifyName("Destiny Reeves")]: {
    slug: slugifyName("Destiny Reeves"),
    name: "Destiny Reeves",
    social: "@destinyreeves",
    appearanceCount: 2,
    avgPositivePct: 87,
    trend: "up",
    status: "Hot",
    lastAppearanceDate: "2025-12-14",
    trajectory: [
      { videoId: "pop-the-balloon-15-girls-vs-2-guys", videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys", youtubeId: YT.balloon, date: "2025-12-14", positivePct: 89 },
      { videoId: "blind-dating-girls-by-aesthetic", videoTitle: "Blind Dating Girls By Aesthetic", youtubeId: YT.blind, date: "2025-11-02", positivePct: 87 },
    ],
    videosAppeared: [
      {
        videoId: "pop-the-balloon-15-girls-vs-2-guys",
        videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys",
        youtubeId: YT.balloon,
        date: "2025-12-14",
        positivePct: 89,
        topComment:
          "Destiny's quick reactions are what these balloon videos need—queen of timing.",
      },
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 87,
        topComment:
          "Destiny's improv in the corner bits—bring her back every format.",
      },
    ],
    recommendation:
      "Audience explicitly requests more Destiny on challenge beats — schedule while momentum is hot.",
  },
  [slugifyName("Lily Nakamura")]: {
    slug: slugifyName("Lily Nakamura"),
    name: "Lily Nakamura",
    appearanceCount: 1,
    avgPositivePct: 76,
    trend: "flat",
    status: "Fresh",
    lastAppearanceDate: "2025-11-02",
    trajectory: [
      { videoId: "blind-dating-girls-by-aesthetic", videoTitle: "Blind Dating Girls By Aesthetic", youtubeId: YT.blind, date: "2025-11-02", positivePct: 76 },
    ],
    videosAppeared: [
      {
        videoId: "blind-dating-girls-by-aesthetic",
        videoTitle: "Blind Dating Girls By Aesthetic",
        youtubeId: YT.blind,
        date: "2025-11-02",
        positivePct: 76,
        topComment: "Lily's aesthetic storytelling was a highlight.",
      },
    ],
    recommendation:
      "Early sample size — positive skew with requests for more screen time. Consider a featured slot.",
  },
  [slugifyName("Priya Sharma")]: {
    slug: slugifyName("Priya Sharma"),
    name: "Priya Sharma",
    appearanceCount: 1,
    avgPositivePct: 74,
    trend: "flat",
    status: "Fresh",
    lastAppearanceDate: "2025-12-14",
    trajectory: [
      { videoId: "pop-the-balloon-15-girls-vs-2-guys", videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys", youtubeId: YT.balloon, date: "2025-12-14", positivePct: 74 },
    ],
    videosAppeared: [
      {
        videoId: "pop-the-balloon-15-girls-vs-2-guys",
        videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys",
        youtubeId: YT.balloon,
        date: "2025-12-14",
        positivePct: 74,
        topComment: "Priya asking the smart questions in round two—more of that energy.",
      },
    ],
    recommendation:
      "Solid debut metrics — book on a talk-heavy format to maximize strengths.",
  },
  [slugifyName("Sasha Monroe")]: {
    slug: slugifyName("Sasha Monroe"),
    name: "Sasha Monroe",
    appearanceCount: 1,
    avgPositivePct: 81,
    trend: "up",
    status: "Fresh",
    lastAppearanceDate: "2025-12-14",
    trajectory: [
      { videoId: "pop-the-balloon-15-girls-vs-2-guys", videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys", youtubeId: YT.balloon, date: "2025-12-14", positivePct: 81 },
    ],
    videosAppeared: [
      {
        videoId: "pop-the-balloon-15-girls-vs-2-guys",
        videoTitle: "Pop the Balloon: 15 Girls vs 2 Guys",
        youtubeId: YT.balloon,
        date: "2025-12-14",
        positivePct: 81,
        topComment: "Sasha went full improv coach and it worked.",
      },
    ],
    recommendation:
      "High engagement on comedy-forward segments — rebook alongside a strong straight-man foil.",
  },
  [slugifyName("Jake Rossi")]: {
    slug: slugifyName("Jake Rossi"),
    name: "Jake Rossi",
    appearanceCount: 2,
    avgPositivePct: 79,
    trend: "up",
    status: "Hot",
    lastAppearanceDate: "2026-03-08",
    trajectory: [
      { videoId: "celebrity-lookalike-dating-challenge", videoTitle: "Celebrity Lookalike Dating Challenge", youtubeId: YT.celeb, date: "2026-01-20", positivePct: 78 },
      { videoId: "guess-the-real-couple", videoTitle: "Guess the Real Couple", youtubeId: YT.couple, date: "2026-03-08", positivePct: 80 },
    ],
    videosAppeared: [
      {
        videoId: "guess-the-real-couple",
        videoTitle: "Guess the Real Couple",
        youtubeId: YT.couple,
        date: "2026-03-08",
        positivePct: 80,
        topComment: "Jake letting Camille lead the story arch—smart on-camera instincts.",
      },
      {
        videoId: "celebrity-lookalike-dating-challenge",
        videoTitle: "Celebrity Lookalike Dating Challenge",
        youtubeId: YT.celeb,
        date: "2026-01-20",
        positivePct: 78,
        topComment: "Jake and Mia chemistry in segment 2 was subtle but strong.",
      },
    ],
    recommendation:
      "Improving arc — audience reads warmth; strong pairing potential with established favorites.",
  },
  [slugifyName("Marcus Williams")]: {
    slug: slugifyName("Marcus Williams"),
    name: "Marcus Williams",
    appearanceCount: 1,
    avgPositivePct: 82,
    trend: "flat",
    status: "Fresh",
    lastAppearanceDate: "2026-01-20",
    trajectory: [
      { videoId: "celebrity-lookalike-dating-challenge", videoTitle: "Celebrity Lookalike Dating Challenge", youtubeId: YT.celeb, date: "2026-01-20", positivePct: 82 },
    ],
    videosAppeared: [
      {
        videoId: "celebrity-lookalike-dating-challenge",
        videoTitle: "Celebrity Lookalike Dating Challenge",
        youtubeId: YT.celeb,
        date: "2026-01-20",
        positivePct: 82,
        topComment: "Marcus delivery is so dry it's perfect for this channel.",
      },
    ],
    recommendation:
      "Distinctive voice — ideal for narrated or deadpan segments; low fatigue risk.",
  },
};
