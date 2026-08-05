import type { IncomingMessage } from "node:http";
import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { generateHandler } from "./src/server/generateHandler";
import { waitlistHandler } from "./src/server/waitlistHandler";
import { captureHandler } from "./src/server/captureHandler";

/**
 * Dev-only API middleware so `pnpm dev` exercises the same generate/waitlist
 * logic the Netlify functions run in production, without needing `netlify dev`.
 * netlify/functions/*.ts are thin wrappers around these same handlers.
 */
function devApiPlugin() {
  return {
    name: "advsr-dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/generate", async (req, res) => {
        const body = await readJsonBody(req);
        const ip = req.socket?.remoteAddress ?? "dev";
        const result = await generateHandler(body, ip);
        res.statusCode = result.statusCode;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.body));
      });
      server.middlewares.use("/api/waitlist", async (req, res) => {
        const body = await readJsonBody(req);
        const result = await waitlistHandler(body);
        res.statusCode = result.statusCode;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.body));
      });
      server.middlewares.use("/api/capture", async (req, res) => {
        const body = await readJsonBody(req);
        const result = await captureHandler(body);
        res.statusCode = result.statusCode;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.body));
      });
    },
  };
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default defineConfig(({ mode }) => {
  // Vite only exposes .env vars to client code via import.meta.env (and only
  // VITE_-prefixed ones at that). The dev API middleware above runs plain
  // Node code (generateHandler/waitlistHandler) that reads process.env
  // directly, same as the Netlify functions do in production, so those vars
  // must be loaded into actual process.env here too, or ANTHROPIC_API_KEY /
  // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are undefined under `pnpm dev`
  // even when they're set correctly in .env.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), tailwindcss(), devApiPlugin()],
    server: { port: 5173 },
  };
});
