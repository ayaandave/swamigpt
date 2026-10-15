// GET /api/card?id=gita-2-47: a picture of one passage, for sharing and for link previews
// (1200×630, the size iMessage, WhatsApp and social sites show). The words never change, so
// the image is cached for a long time.
import { ImageResponse } from "next/og";
import { getPassageById } from "@/lib/scripture/library";
import { caption, whoSays } from "@/lib/scripture/who";

const SANDAL = "#f2e3c6";
const FLAME = "#ffb347";
const NIGHT = "#17142e";

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
