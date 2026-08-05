import type { ToneResponses } from "../engine/toneProfile";

export type HandlerResult = { statusCode: number; body: Record<string, unknown> };

export type ClarifyingQa = { question: string; answer: string };

export type GenerateRequestBody = {
  topic: string;
  contentType?: string;
  toneResponses?: ToneResponses;
  platforms?: string[];
  /** Clarifying question/answer pairs exchanged so far this turn, oldest first. */
  clarifyingQa?: ClarifyingQa[];
  /**
   * True when this exact topic already produced a real generation earlier in
   * the same session (picking another platform for the same prompt from the
   * platform picker) — skips the clarify-turn call entirely, since the topic
   * was already proven workable and re-asking the same question per platform
   * would only add latency for no benefit.
   */
  alreadyValidated?: boolean;
};

/**
 * `question`: at most one short follow-up question, asked only when the
 * topic as given cannot reliably be turned into content at all (see
 * generateHandler's per-turn clarify step — never more than one per
 * generation).
 */
export type GenerateResponseBody = { output: string } | { question: string } | { error: string };

export type WaitlistRequestBody = {
  sessionId?: string;
  name: string;
  email: string;
  company?: string;
  market?: string;
  expectedPrice?: string;
  missingFeedback?: string;
  hasAdvsrLogin: boolean;
  toneProfile?: ToneResponses;
  generatedOutput?: string;
};

export type WaitlistResponseBody = { ok: true } | { error: string };

/**
 * Fields the capture endpoint is allowed to write, one call at a time,
 * upserted onto the row identified by sessionId. Every field is optional —
 * each capture point (early profile, frequency-after, clarifying Q&A +
 * output, thumbs feedback) only sends the columns it owns.
 */
export type CaptureFields = {
  toneProfile?: ToneResponses;
  postingFrequencyBefore?: string;
  postingFrequencyAfter?: string;
  changedMindOnFrequency?: boolean;
  platformBeliefBefore?: string;
  /** The insights funnel's "what does an hour of marketing cost you?" slider answer, in whole dollars. */
  estimatedHourlyRate?: number;
  clarifyingQa?: ClarifyingQa[];
  generatedOutput?: string;
  contentFeedback?: "GOOD" | "BAD";
};

export type CaptureRequestBody = {
  sessionId: string;
  fields: CaptureFields;
};

export type CaptureResponseBody = { ok: true } | { error: string };
