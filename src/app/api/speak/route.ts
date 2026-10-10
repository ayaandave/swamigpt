// GET /api/speak?v=swamiji&s=0.8&t=text: the text read aloud by an ElevenLabs voice, as streamed MP3.
// A GET so an <audio> element can start playing while the rest is still arriving.
// The ElevenLabs key stays here on the server; without it this returns 503 and the browser
// falls back to its own built-in voice.
//
// With c=1 (fixed text: lessons, verse pages, meditations), the audio is saved to Supabase
// Storage after its first play, and later requests are sent straight to the saved file, so each
// piece of text costs credits only once. Needs SUPABASE_SECRET_KEY; without it nothing is saved.
import { createHash } from "node:crypto";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VOICE_IDS: Record<string, string | undefined> = {
  swamiji: process.env.ELEVENLABS_VOICE_SWAMIJI,
  amma: process.env.ELEVENLABS_VOICE_AMMA,
  sakshi: process.env.ELEVENLABS_VOICE_SAKSHI,
};
const MAX_CHARS = 5000; // every character costs credits
// Eleven v4 sounds best for SwamiGPT; Multilingual v2 is the fallback if v4 is refused
const MODELS = [process.env.ELEVENLABS_MODEL ?? "eleven_v4", "eleven_multilingual_v2"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "speech";

export async function GET(request: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  const params = new URL(request.url).searchParams;
  const voice = params.get("v") ?? "swamiji";
  const voiceId = VOICE_IDS[voice];
  if (!key || !voiceId) return new Response("not configured", { status: 503 });

  // Only our own pages may spend credits (browsers mark same-site requests themselves)
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response("forbidden", { status: 403 });

  const text = params.get("t")?.trim() ?? "";
  if (!text || text.length > MAX_CHARS) return new Response("bad text", { status: 400 });
  // When text is read in pieces, a sentence either side keeps the voice flowing between them
  const previous = params.get("p")?.slice(-200) || undefined;
  const next = params.get("n")?.slice(0, 200) || undefined;

  // The app's speed slider (0.65-0.95) mapped onto ElevenLabs' gentler range (0.7-1.0), in steps
  // of 0.05 so saved audio is shared by everyone at about the same speed
  const slider = Number(params.get("s") ?? 0.8);
  const exact = Math.min(1.0, Math.max(0.7, 0.7 + ((slider - 0.65) / 0.3) * 0.3));
  const speed = Math.round(exact * 20) / 20;

  // ---- Saved audio for fixed text ----
  const cacheable = params.get("c") === "1" && SUPABASE_URL && SECRET;
  const file = cacheable
    ? `${voice}/${createHash("sha256").update([MODELS[0], voiceId, speed, previous, text, next].join("|")).digest("hex")}.mp3`
    : null;
  if (file) {
    const saved = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}`;
    const head = await fetch(saved, { method: "HEAD" }).catch(() => null);
    if (head?.ok) return Response.redirect(saved, 302);
  }

  let upstream: Response | undefined;
  for (const model of MODELS) {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": key },
        body: JSON.stringify({
          text,
          previous_text: previous,
          next_text: next,
          model_id: model,
          voice_settings: { stability: 0.6, similarity_boost: 0.75, speed },
        }),
      },
    );
    if (upstream.ok && upstream.body) break;
    console.error(`ElevenLabs ${model} failed`, upstream.status, await upstream.text().catch(() => ""));
    // Only a refused request (bad model or settings) is worth retrying on the other model
    if (upstream.status !== 400 && upstream.status !== 422) break;
  }
  if (!upstream?.ok || !upstream.body) {
    return new Response("voice unavailable", { status: 502 });
  }

  let body = upstream.body;
  if (file) {
    // One copy streams to the listener; the other is saved once the response has gone out
    const [toListener, toSave] = upstream.body.tee();
    body = toListener;
    after(async () => {
      const audio = await new Response(toSave).arrayBuffer();
      const sb = createClient(SUPABASE_URL!, SECRET!, { auth: { persistSession: false } });
      const { error } = await sb.storage
        .from(BUCKET)
        .upload(file, audio, { contentType: "audio/mpeg", cacheControl: "31536000", upsert: true });
      if (error) console.error("saving audio failed", error.message);
    });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "audio/mpeg",
      // The same text in the same voice never changes, so the browser can keep it
      "Cache-Control": "private, max-age=86400",
    },
  });
}
