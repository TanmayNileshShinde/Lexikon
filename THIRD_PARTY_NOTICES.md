# Third-party notices

The source code in this repository is released under the [MIT License](LICENSE).
The dictionary **data** it displays is not covered by that licence: it comes from Wiktionary and
has its own terms, summarised here so you can check them before reusing or redistributing
anything.

> **This is not legal advice.** The information below comes from each project's own
> documentation. Licences can change; always check the original source.

## Dictionary data

| Source | Used for | Licence | Notes |
|---|---|---|---|
| [Wiktionary](https://de.wiktionary.org/) (German edition), extracted by [wiktextract](https://github.com/tatuylonen/wiktextract) and published by [kaikki.org](https://kaikki.org/) | Headwords, inflected forms, senses, examples, IPA and word relations | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and [GFDL](https://www.gnu.org/licenses/fdl-1.3.html) (dual-licensed by Wikimedia) | Attribution is required and derived data must be shared under the same licence. |

What this means for Lexikon:

- **Attribution.** The website credits Wiktionary in its footer and links to the licence.
  Keep that credit if you deploy your own copy.
- **Share-alike.** The `data/dictionary.db` file built by `ingest/ingest.py` is an adaptation
  of the Wiktionary content, so it is distributed under CC BY-SA 4.0, not under the MIT licence
  of the code. Do not publish it under another licence.
- **Not in this repository.** The dump (`data/raw/`) and the built database (`data/*.db`) are
  git-ignored: they are regenerated from the original source, never committed.

## Audio recordings

Pronunciation clips are **not copied** into this repository or its database; only their URLs are
stored. The browser loads them directly from
[Wikimedia Commons](https://commons.wikimedia.org/), where each file has its own licence (mostly
CC BY-SA, CC BY or public domain) and author credit on its file page.

## Libraries

| Library | Licence |
|---|---|
| [Hono](https://hono.dev/), [@hono/node-server](https://github.com/honojs/node-server) | MIT |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | MIT |
| [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) | MIT |
| [tsx](https://github.com/privatenumber/tsx), [TypeScript](https://www.typescriptlang.org/) | MIT, Apache-2.0 |
| [tqdm](https://github.com/tqdm/tqdm) (optional, ingest progress bar) | MPL-2.0 / MIT |

The exact versions are pinned in `server/package-lock.json` and `web/package-lock.json`; the
licence of every transitive dependency is in its own package.
