/**
 * Search-key folding - MUST stay byte-for-byte equivalent to the Python
 * ingest pipeline (ingest/ingest.py: exact_key / translit_key / strip_key)
 * so that query keys match the keys stored in the search_keys table.
 *
 *   kind 0  exact     NFC + lowercase            "schön"  -> "schön"
 *   kind 1  translit  ä→ae ö→oe ü→ue ß→ss        "schön"  -> "schoen"
 *   kind 2  strip     ä→a  ö→o  ü→u  ß→s         "schön"  -> "schon"
 */

export const KIND_EXACT = 0;
export const KIND_TRANSLIT = 1;
export const KIND_STRIP = 2;

export type Kind = typeof KIND_EXACT | typeof KIND_TRANSLIT | typeof KIND_STRIP;

const KIND_NAMES: Record<number, string> = {
  [KIND_EXACT]: "exact",
  [KIND_TRANSLIT]: "translit",
  [KIND_STRIP]: "strip",
};

const TRANSLIT: Record<string, string> = {
  "ä": "ae",
  "ö": "oe",
  "ü": "ue",
  "ß": "ss",
};
const STRIP: Record<string, string> = {
  "ä": "a",
  "ö": "o",
  "ü": "u",
  "ß": "s",
};

/** NFC + lowercase (lower, not casefold: "ß" must stay "ß"). */
export function exactKey(word: string): string {
  return word.normalize("NFC").toLowerCase();
}

export function translitKey(word: string): string {
  return exactKey(word).replace(/[äöüß]/g, (ch) => TRANSLIT[ch]!);
}

export function stripKey(word: string): string {
  return exactKey(word).replace(/[äöüß]/g, (ch) => STRIP[ch]!);
}

export interface FoldedQuery {
  raw: string;
  exact: string;
  translit: string;
  strip: string;
}

export function foldQuery(raw: string): FoldedQuery {
  return {
    raw,
    exact: exactKey(raw),
    translit: translitKey(raw),
    strip: stripKey(raw),
  };
}

export function kindName(kind: number): string {
  return KIND_NAMES[kind] ?? "unknown";
}
