// GET /api/card?id=gita-2-47: a picture of one passage, for sharing and for link previews
// (1200×630, the size iMessage, WhatsApp and social sites show). The words never change, so
// the image is cached for a long time.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPassageById } from "@/lib/scripture/library";
import { caption, whoSays } from "@/lib/scripture/who";

const SANDAL = "#f2e3c6";
const FLAME = "#ffb347";
const NIGHT = "#17142e";
const GOLD = "#e3b341";

// Lora, a serif close to the app's own (whose font tables the image renderer can't read),
// fetched as TTF and cut down to just the letters on this card
async function font(text: string) {
  const signal = AbortSignal.timeout(4000); // a slow font server falls back to a plain serif
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Lora&text=${encodeURIComponent(text)}`, {
    signal,
  }).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  return url ? fetch(url, { signal }).then((r) => r.arrayBuffer()) : null;
}

// Long passages are cut at a word, so the card stays readable
function clip(text: string, max: number) {
  const flat = text.replace(/\s*\n\s*/g, " / ").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, flat.lastIndexOf(" ", max)).replace(/[,;:—-]$/, "") + "…";
}

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const id = reqUrl.searchParams.get("id") ?? "";
  // One address per card, so extra parameters can't skip the cache and force new drawings
  if ([...reqUrl.searchParams.keys()].some((k) => k !== "id")) {
    return Response.redirect(new URL(`/api/card?id=${encodeURIComponent(id)}`, request.url), 308);
  }
  if (id === "site") return siteCard();
  const p = getPassageById(id);
  if (!p) return new Response("not found", { status: 404 });

  const quote = clip(p.translation, 300);
  const who = whoSays(p);
  const where = caption(p);
  const size = quote.length > 220 ? 38 : quote.length > 140 ? 44 : 52;
  const data = await font(`${who}${quote}${where}“”SwamiGPT.com`).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: `radial-gradient(ellipse at 50% 35%, #3a2a3a 0%, ${NIGHT} 70%)`,
          color: SANDAL,
          fontFamily: data ? "Lora" : "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: FLAME, letterSpacing: 1 }}>{who}</div>
        <div style={{ display: "flex", fontSize: size, lineHeight: 1.35 }}>
          {/[“"]/.test(quote) ? quote : `“${quote}”`}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26 }}>
          <span style={{ color: "rgba(242,227,198,0.75)" }}>{where}</span>
          <span style={{ color: FLAME }}>SwamiGPT.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: data ? [{ name: "Lora", data, weight: 400, style: "normal" }] : undefined,
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}

// /api/card?id=site: the Om and the name, for pages that have no verse of their own
async function siteCard() {
  const svg = (await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8")).replace('rx="26"', 'rx="0"');
  const mark = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const line = "A calm guide to the Gita, the Upanishads and meditation";
  const data = await font(`SwamiGPT${line}.com`).catch(() => null);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: "radial-gradient(ellipse at 30% 45%, #2a2110 0%, #000 70%)",
          color: SANDAL,
          fontFamily: data ? "Lora" : "serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into a PNG, not shown on a page */}
        <img src={mark} width={260} height={260} alt="" style={{ borderRadius: 48 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 92, color: GOLD }}>SwamiGPT</div>
          <div style={{ display: "flex", fontSize: 40, lineHeight: 1.3, maxWidth: 640 }}>{line}</div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(242,227,198,0.75)" }}>swamigpt.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: data ? [{ name: "Lora", data, weight: 400, style: "normal" }] : undefined,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
