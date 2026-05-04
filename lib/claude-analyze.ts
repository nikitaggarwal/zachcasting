import Anthropic from "@anthropic-ai/sdk";
import type {
  CastInVideo,
  GeneralComment,
  SentimentKind,
  SentimentSplit,
  VideoAnalysis,
} from "./types";
import { slugifyName } from "./slug";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

type ClaudeMention = {
  name: string;
  sentiment: SentimentKind;
  bringBack?: boolean;
  fatigue?: boolean;
  gist?: string;
};

type ClaudeCommentRow = {
  i: number;
  mentions: ClaudeMention[];
  overallCommentSentiment: SentimentKind;
  mentionsAnyoneOnCastList?: boolean;
};

type ClaudeBatch = {
  comments: ClaudeCommentRow[];
};

function parseClaudeJson(text: string): ClaudeBatch {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as ClaudeBatch;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function normalizeSplit(p: number, n: number, neu: number): SentimentSplit {
  const t = p + n + neu;
  if (t === 0) return { positive: 0, negative: 0, neutral: 100 };
  const pp = Math.round((p / t) * 100);
  const nn = Math.round((n / t) * 100);
  return {
    positive: pp,
    negative: nn,
    neutral: Math.max(0, 100 - pp - nn),
  };
}

export async function runClaudeOnBatches(
  apiKey: string,
  castNames: string[],
  commentTexts: string[],
  batchSize = 80
): Promise<ClaudeBatch> {
  const client = new Anthropic({ apiKey });
  const batches = chunk(commentTexts.map((text, i) => ({ i, text })), batchSize);
  const merged: ClaudeCommentRow[] = [];

  const castLines = castNames.map((n) => `- ${n}`).join("\n");

  for (const part of batches) {
    const numbered = part.map(({ i, text }) => `[${i}] ${text}`).join("\n\n");

    const userContent = `Cast members to detect (match these names exactly when possible; also accept obvious nicknames/abbreviations that clearly refer to them):\n${castLines}\n\nComments:\n${numbered}`;

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8192,
      system: `You are an audience researcher for YouTube cast-driven videos. For each comment (marked [index]), return STRICT JSON only, no markdown, with this shape:
{"comments":[{"i":number,"overallCommentSentiment":"positive"|"negative"|"neutral","mentionsAnyoneOnCastList":boolean,"mentions":[{"name":"exact cast name from the provided list when possible","sentiment":"positive"|"negative"|"neutral","bringBack":boolean,"fatigue":boolean,"gist":"short paraphrase of how they're discussed"}]}]}

Rules:
- If the comment does not clearly reference anyone on the cast list, "mentions" should be [] and mentionsAnyoneOnCastList false.
- bringBack: true if the audience explicitly wants this person to return or says "bring back" / similar.
- fatigue: true if the audience implies they're tired of seeing this person, overexposure, "again?", "so many times", etc.
- Match cast names from the provided list when the comment refers to that person.
- gist: one short phrase, not the full comment.`,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in Claude response");
    }
    const parsed = parseClaudeJson(textBlock.text);
    merged.push(...parsed.comments);
  }

  return { comments: merged };
}

type Agg = {
  name: string;
  pos: number;
  neg: number;
  neu: number;
  bringBack: boolean;
  fatigue: boolean;
  posQuotes: { text: string; score: number }[];
  negQuotes: { text: string; score: number }[];
};

export function aggregateToVideoAnalysis(
  youtubeId: string,
  title: string,
  views: number,
  commentCountTotal: number,
  publishedAt: string,
  castNames: string[],
  commentTexts: string[],
  batch: ClaudeBatch
): VideoAnalysis {
  const byName = new Map<string, Agg>();
  for (const n of castNames) {
    byName.set(n, {
      name: n,
      pos: 0,
      neg: 0,
      neu: 0,
      bringBack: false,
      fatigue: false,
      posQuotes: [],
      negQuotes: [],
    });
  }

  let gPos = 0,
    gNeg = 0,
    gNeu = 0;
  const general: GeneralComment[] = [];

  const indexToText = new Map<number, string>();
  commentTexts.forEach((t, i) => indexToText.set(i, t));

  for (const row of batch.comments) {
    const text = indexToText.get(row.i) ?? "";
    switch (row.overallCommentSentiment) {
      case "positive":
        gPos++;
        break;
      case "negative":
        gNeg++;
        break;
      default:
        gNeu++;
    }

    const isGeneral =
      !row.mentionsAnyoneOnCastList || (row.mentions?.length ?? 0) === 0;

    if (isGeneral && text.length >= 24) {
      general.push({
        text: text.length > 280 ? text.slice(0, 277) + "…" : text,
        sentiment: row.overallCommentSentiment,
      });
    }

    for (const m of row.mentions ?? []) {
      const key =
        castNames.find((c) => c.toLowerCase() === m.name.toLowerCase()) ??
        m.name;
      let agg = byName.get(key);
      if (!agg) {
        agg = {
          name: key,
          pos: 0,
          neg: 0,
          neu: 0,
          bringBack: !!m.bringBack,
          fatigue: !!m.fatigue,
          posQuotes: [],
          negQuotes: [],
        };
        byName.set(key, agg);
      }
      if (m.bringBack) agg.bringBack = true;
      if (m.fatigue) agg.fatigue = true;
      switch (m.sentiment) {
        case "positive":
          agg.pos++;
          break;
        case "negative":
          agg.neg++;
          break;
        default:
          agg.neu++;
      }
      const len = text.length;
      if (m.sentiment === "positive" && text) {
        agg.posQuotes.push({ text, score: len });
      }
      if (m.sentiment === "negative" && text) {
        agg.negQuotes.push({ text, score: len });
      }
    }
  }

  const overallSentiment = normalizeSplit(gPos, gNeg, gNeu);

  const cast: CastInVideo[] = Array.from(byName.values())
    .filter((a) => a.pos + a.neg + a.neu > 0)
    .map((a) => {
      const t = a.pos + a.neg + a.neu;
      const sent = normalizeSplit(a.pos, a.neg, a.neu);
      const topPos = [...a.posQuotes].sort((x, y) => y.score - x.score)[0];
      const topNeg = [...a.negQuotes].sort((x, y) => y.score - x.score)[0];
      return {
        name: a.name,
        slug: slugifyName(a.name),
        mentionCount: t,
        sentiment: sent,
        topPositiveQuote: topPos?.text ?? "—",
        topNegativeQuote: topNeg?.text ?? null,
        bringBack: a.bringBack,
        fatigue: a.fatigue,
      };
    })
    .sort((a, b) => b.mentionCount - a.mentionCount);

  const standoutQuotes = [...commentTexts]
    .filter((t) => t.length > 40 && t.length < 400)
    .slice(0, 15);

  const analyzedAt = new Date().toISOString().slice(0, 10);

  return {
    id: youtubeId,
    youtubeId,
    title,
    views,
    commentCountTotal,
    commentsAnalyzed: commentTexts.length,
    publishedAt,
    analyzedAt,
    overallSentiment,
    standoutQuotes: standoutQuotes.slice(0, 2),
    cast,
    generalComments: general.slice(0, 12),
  };
}
