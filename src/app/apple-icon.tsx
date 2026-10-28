import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// iPhone home-screen icon, drawn from the same leaf as icon.svg
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8");
  // iOS rounds the corners itself, so fill the square edge to edge
  const square = svg.replace('rx="26"', 'rx="0"');
  return new ImageResponse(
    <img src={`data:image/svg+xml;base64,${Buffer.from(square).toString("base64")}`} width={180} height={180} alt="" />,
    size,
  );
}
