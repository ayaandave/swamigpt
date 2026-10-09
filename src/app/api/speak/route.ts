// GET /api/speak?v=swamiji&s=0.8&t=text: the text read aloud by an ElevenLabs voice, as streamed MP3.
// A GET so an <audio> element can start playing while the rest is still arriving.
// The ElevenLabs key stays here on the server; without it this returns 503 and the browser
// falls back to its own built-in voice.

const VOICE_IDS: Record<string, string | undefined> = {
  swamiji: process.env.ELEVENLABS_VOICE_SWAMIJI,
  amma: process.env.ELEVENLABS_VOICE_AMMA,
  sakshi: process.env.ELEVENLABS_VOICE_SAKSHI,
};
const MAX_CHARS = 5000; // every character costs credits

export async function GET(request: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  const params = new URL(request.url).searchParams;
  const voiceId = VOICE_IDS[params.get("v") ?? "swamiji"];
  if (!key || !voiceId) return new Response("not configured", { status: 503 });

  // Only our own pages may spend credits (browsers mark same-site requests themselves)
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response("forbidden", { status: 403 });

  const text = params.get("t")?.trim() ?? "";
  if (!text || text.length > MAX_CHARS) return new Response("bad text", { status: 400 });

  // The app's speed slider (0.65-0.95) mapped onto ElevenLabs' gentler range (0.7-1.0)
  const slider = Number(params.get("s") ?? 0.8);
  const speed = Math.min(1.0, Math.max(0.7, 0.7 + ((slider - 0.65) / 0.3) * 0.3));

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": key },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2", // handles Sanskrit names well
        voice_settings: { stability: 0.6, similarity_boost: 0.75, speed },
      }),
    },
  );
  if (!upstream.ok || !upstream.body) {
    console.error("ElevenLabs failed", upstream.status, await upstream.text().catch(() => ""));
    return new Response("voice unavailable", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      // The same text in the same voice never changes, so the browser can keep it
      "Cache-Control": "private, max-age=86400",
    },
  });
}
