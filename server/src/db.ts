/**
 * Read-only SQLite access layer.
 *
 * The database is a build artifact produced by ingest/ingest.py and never
 * written to at runtime, so it is opened in read-only mode with an mmap'ed
 * page cache for fast point lookups.
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import Database from "better-sqlite3";
import { foldQuery, kindName } from "./fold.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB = path.resolve(HERE, "..", "..", "data", "dictionary.db");

export const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : DEFAULT_DB;

const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
db.pragma("query_only = ON");
db.pragma("cache_size = -32000"); // ~32 MiB page cache
db.pragma("mmap_size = 268435456"); // ~256 MiB mmap
db.pragma("temp_store = MEMORY");

export interface SuggestResult {
  id: number;
  word: string;
  pos: string;
  gender: string | null;
  article: string | null;
  plural: string | null;
  snippet: string;
  kind: number;
  match: string;
  exactForm: boolean;
}

interface RawSuggestRow {
  id: number;
  kind: number;
  exact_form: number;
  word: string;
  pos: string;
  gender: string | null;
  article: string | null;
  plural: string | null;
  g0: string | null;
  g1: string | null;
  g2: string | null;
}

const SUGGEST_SQL = `
  SELECT
    e.id                                   AS id,
    MIN(k.kind)                            AS kind,
    MAX(k.exact_form)                      AS exact_form,
    e.word                                 AS word,
    e.pos                                  AS pos,
    e.gender                               AS gender,
    json_extract(e.data, '$.article')      AS article,
    json_extract(e.data, '$.plural')       AS plural,
    json_extract(e.data, '$.senses[0].glosses[0]') AS g0,
    json_extract(e.data, '$.senses[0].glosses[1]') AS g1,
    json_extract(e.data, '$.senses[0].glosses[2]') AS g2
  FROM search_keys k
  JOIN entries e ON e.id = k.entry_id
  WHERE (k.kind = 0 AND k.key = @k0)
     OR (k.kind = 1 AND k.key = @k1)
     OR (k.kind = 2 AND k.key = @k2)
  GROUP BY e.id
  ORDER BY kind ASC, exact_form DESC, length(e.word) ASC, e.word ASC
  LIMIT @limit
`;

const suggestStmt = db.prepare<[Record<string, unknown>], RawSuggestRow>(SUGGEST_SQL);
const entryStmt = db.prepare<[number], { data: string }>(
  "SELECT data FROM entries WHERE id = ?",
);
const countStmt = db.prepare<[], { c: number }>("SELECT count(*) AS c FROM entries");
const keysStmt = db.prepare<[], { c: number }>("SELECT count(*) AS c FROM search_keys");

export function suggest(query: string, limit = 25): SuggestResult[] {
  const folded = foldQuery(query);
  const rows = suggestStmt.all({
    k0: folded.exact,
    k1: folded.translit,
    k2: folded.strip,
    limit: Math.min(Math.max(limit, 1), 100),
  });
  return rows.map((row) => {
    const glosses = [row.g0, row.g1, row.g2].filter(
      (g): g is string => typeof g === "string" && g.length > 0,
    );
    return {
      id: row.id,
      word: row.word,
      pos: row.pos,
      gender: row.gender,
      article: row.article,
      plural: row.plural,
      snippet: glosses.length ? `${glosses.join("; ")}${glosses.length === 3 ? " …" : ""}` : "",
      kind: row.kind,
      match: kindName(row.kind),
      exactForm: row.exact_form === 1,
    };
  });
}

export function getEntry(id: number): Record<string, unknown> | null {
  const row = entryStmt.get(id);
  if (!row) return null;
  const entry = JSON.parse(row.data) as Record<string, unknown>;
  return { id, ...entry };
}

export function stats(): { entries: number; searchKeys: number; dbPath: string } {
  return {
    entries: countStmt.get()!.c,
    searchKeys: keysStmt.get()!.c,
    dbPath: DB_PATH,
  };
}
