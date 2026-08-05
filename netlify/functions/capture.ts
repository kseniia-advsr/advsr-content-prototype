import type { Handler } from "@netlify/functions";
import { captureHandler } from "../../src/server/captureHandler";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed." }) };
  }

  let body: unknown = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  const result = await captureHandler(body);

  return {
    statusCode: result.statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.body),
  };
};
