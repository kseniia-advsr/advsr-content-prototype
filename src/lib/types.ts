import type { ToneResponses } from "../engine/toneProfile";

export type HandlerResult = { statusCode: number; body: Record<string, unknown> };

export type GenerateRequestBody = {
  topic: string;
  contentType?: string;
  toneResponses?: ToneResponses;
  platforms?: string[];
};

export type GenerateResponseBody = { output: string } | { error: string };

export type WaitlistRequestBody = {
  name: string;
  email: string;
  company?: string;
  market?: string;
  expectedPrice?: string;
  hasAdvsrLogin: boolean;
  toneProfile?: ToneResponses;
  generatedOutput?: string;
};

export type WaitlistResponseBody = { ok: true } | { error: string };
