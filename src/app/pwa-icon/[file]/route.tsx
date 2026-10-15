// App icons for "Add to Home Screen" and installing: /pwa-icon/192.png, /pwa-icon/512.png and
// /pwa-icon/maskable-512.png (with room around the lamp, since phones crop these into circles)
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const SIZES: Record<string, { size: number; maskable: boolean }> = {
  "192.png": { size: 192, maskable: false },
  "512.png": { size: 512, maskable: false },
  "maskable-512.png": { size: 512, maskable: true },
};

export function generateStaticParams() {
  return Object.keys(SIZES).map((file) => ({ file }));
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const icon = SIZES[(await params).file];
  if (!icon) return new Response("not found", { status: 404 });
  const svg = (await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8")).replace('rx="26"', 'rx="0"');
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const inner = icon.maskable ? Math.round(icon.size * 0.8) : icon.size;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f2e3c6" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into a PNG, not shown on a page */}
        <img src={src} width={inner} height={inner} alt="" />
      </div>
    ),
    { width: icon.size, height: icon.size },
  );
}
