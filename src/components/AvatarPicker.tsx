"use client";

import { AVATARS, getAvatar } from "@/lib/avatars";
import { useSettings } from "@/lib/settings";

// Om is drawn as the letter itself, in the app's Sanskrit font, rather than as an emoji
const DEVANAGARI = "font-[family-name:var(--font-tiro)]";

// A chosen avatar on its circle, or the first letter of the email until one is chosen
export function AvatarBadge({ fallback, size }: { fallback: string; size: number }) {
  const { avatar } = useSettings();
  const a = getAvatar(avatar);
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: a ? size * (a.devanagari ? 0.62 : 0.55) : size * 0.42 }}
      className={`flex shrink-0 items-center justify-center rounded-full leading-none ${a ? a.tone : "bg-kesar font-display text-on-kesar"} ${a?.devanagari ? DEVANAGARI : ""}`}
    >
      {a ? a.symbol : fallback}
    </span>
  );
}

export function AvatarPicker() {
  const { avatar, update } = useSettings();
  return (
    <fieldset className="mt-6">
      <legend className="font-display text-[1.15rem]">Your picture</legend>
      <p className="mt-1 text-[0.95rem] text-kajal-soft">Pick one to show on your account.</p>
      <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-label={a.name}
            aria-pressed={avatar === a.id}
            onClick={() => update({ avatar: avatar === a.id ? null : a.id })}
            className={`flex aspect-square items-center justify-center rounded-full leading-none ${a.devanagari ? `${DEVANAGARI} text-[2.3rem]` : "text-[1.9rem]"} ring-offset-2 ring-offset-sandal hover:ring-2 hover:ring-sandal-edge aria-pressed:ring-4 aria-pressed:ring-kesar-deep ${a.tone}`}
          >
            {a.symbol}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
