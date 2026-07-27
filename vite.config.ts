import type { IncomingMessage } from "node:http";
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { generateHandler } from "./src/server/generateHandler";
import { waitlistHandler } from "./src/server/waitlistHandler";

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

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
  server: { port: 5173 },
});
