"use client";

import Link from "next/link";
import { useState } from "react";
import { SendIcon } from "./icons";

type Result = { id: string; source: string; speaker: string; translation: string; plain: string | null; href: string };

const IDEAS = ["anger", "fear of failure", "losing someone", "a restless mind"];

// "Find verses about…": the same meaning search the Swami uses, free and instant
export function VerseFinder() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [searched, setSearched] = useState("");
  const [busy, setBusy] = useState(false);

  const find = async (q: string) => {
    q = q.trim();
    if (!q || busy) return;
    setQuery(q);
    setBusy(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setResults(res.ok ? (await res.json()).results : []);
    } catch {
      setResults([]);
    }
    setSearched(q);
    setBusy(false);
  };

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          find(query);
        }}
        className="flex items-center gap-2 rounded-full border-2 border-kajal bg-[#fbf3e2] p-1.5 pl-5 focus-within:border-kesar-deep"
      >
        <label htmlFor="verse-finder" className="sr-only">
          Find verses about
        </label>
        <input
          id="verse-finder"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find verses about…"
          className="min-h-12 min-w-0 flex-1 bg-transparent font-display text-[1.15rem] outline-none placeholder:text-kajal-soft/70"
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          aria-label="Find verses"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-kesar text-kajal hover:bg-kesar-deep hover:text-sandal disabled:bg-sandal-deep disabled:text-kajal-soft"
        >
          <SendIcon className="size-6" />
        </button>
      </form>

      {!results && (
        <div className="mt-3 flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => find(idea)}
              className="min-h-11 rounded-full border-2 border-sandal-edge px-4 text-[0.95rem] hover:border-kesar"
            >
              {idea}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {busy && <p className="mt-4 italic text-kajal-soft">Searching the verses…</p>}
        {results && !busy && (
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[0.95rem] font-semibold text-kajal-soft">Verses about “{searched}”</p>
              <button
                type="button"
                onClick={() => {
                  setResults(null);
                  setQuery("");
                }}
                className="text-[0.95rem] font-semibold text-kesar-deep hover:underline"
              >
                Clear
              </button>
            </div>
            {results.length === 0 ? (
              <p className="mt-3 text-kajal-soft">Nothing found. Try other words.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      className="block rounded-2xl border-2 border-sandal-edge px-5 py-4 hover:border-kesar hover:bg-sandal-deep/60"
                    >
                      <span className="font-display text-[1.1rem] text-kesar-deep">{r.source}</span>
                      <span className="ml-2 text-[0.85rem] text-kajal-soft">{r.speaker}</span>
                      <span className="mt-1 line-clamp-3 block text-[1.05rem] leading-relaxed">
                        {r.plain ?? r.translation}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
