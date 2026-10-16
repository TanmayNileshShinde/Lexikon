/**
 * German -> English dictionary API.
 *
 *   GET /api/health          -> { status, entries, searchKeys }
 *   GET /api/suggest?q=...   -> folded (exact/translit/strip) lookup, ranked
 *   GET /api/entry/:id       -> full entry JSON (data column)
 *
 * Read-only, CORS-enabled for the Vite dev server.
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { getEntry, stats, suggest } from "./db.js";
import { foldQuery } from "./fold.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const DEFAULT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : DEFAULT_ORIGINS;

const app = new Hono();

app.use("*", logger());

app.use(
  "/api/*",
  cors({
    origin: (origin) =>
      configuredOrigins.includes("*") || configuredOrigins.includes(origin)
        ? origin
        : configuredOrigins[0]!,
    allowMethods: ["GET", "OPTIONS"],
    maxAge: 86400,
  }),
);

app.get("/", (c) =>
  c.json({
    name: "german-dict-api",
    endpoints: ["/api/health", "/api/suggest?q=", "/api/entry/:id"],
  }),
);

app.get("/api/health", (c) => c.json({ status: "ok", ...stats() }));

app.get("/api/suggest", (c) => {
  const q = (c.req.query("q") ?? "").trim();
  if (!q) {
    return c.json({ error: "missing query parameter 'q'" }, 400);
  }
  const limitParam = Number(c.req.query("limit") ?? 25);
  const limit = Number.isFinite(limitParam) ? limitParam : 25;

  const outcome = suggest(q, limit);
  const folded = foldQuery(outcome.effectiveQuery);
  return c.json({
    query: q,
    resolvedQuery: outcome.effectiveQuery,
    reflexFallback: outcome.reflexFallback,
    folded: { exact: folded.exact, translit: folded.translit, strip: folded.strip },
    count: outcome.results.length,
    results: outcome.results,
  });
});

app.get("/api/entry/:id", (c) => {
  const raw = c.req.param("id");
  if (!/^\d+$/.test(raw)) {
    return c.json({ error: "id must be a positive integer" }, 400);
  }
  const entry = getEntry(Number(raw));
  if (!entry) {
    return c.json({ error: "entry not found", id: Number(raw) }, 404);
  }
  return c.json(entry);
});

app.notFound((c) => c.json({ error: "not found", path: c.req.path }, 404));

app.onError((err, c) => {
  console.error("[error]", err);
  return c.json({ error: "internal server error" }, 500);
});

const server = serve({ fetch: app.fetch, port: PORT, hostname: HOST }, (info) => {
  const { entries, searchKeys, dbPath } = stats();
  console.log(`german-dict-api listening on http://localhost:${info.port}`);
  console.log(`  db        : ${dbPath}`);
  console.log(`  entries   : ${entries.toLocaleString()}`);
  console.log(`  searchKeys: ${searchKeys.toLocaleString()}`);
  console.log(`  cors      : ${configuredOrigins.join(", ")}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
