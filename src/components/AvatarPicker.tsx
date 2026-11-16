"use client";

import { AVATARS, getAvatar } from "@/lib/avatars";
import { useSettings } from "@/lib/settings";
import { AvatarArt } from "./AvatarArt";
import { CheckIcon } from "./icons";

// A chosen picture, or the first letter of the email on a gold coin until one is chosen
export function AvatarBadge({ fallback, size }: { fallback: string; size: number }) {
  const { avatar } = useSettings();
  const a = getAvatar(avatar);
  if (a) return <AvatarArt id={a.id} size={size} />;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-kesar font-display leading-none text-on-kesar"
    >
      {fallback}
    </span>
  );
}

export function AvatarPicker() {
  const { avatar, update } = useSettings();
  const chosen = getAvatar(avatar)?.id;
  return (
    <fieldset className="mt-6">
      <legend className="font-display text-[1.15rem]">Your picture</legend>
      <p className="mt-1 text-[0.95rem] text-kajal-soft">Pick the one that feels like you.</p>
      <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-6">
        {AVATARS.map((a) => {
          const on = chosen === a.id;
          return (
            <button
              key={a.id}
              type="button"
              aria-label={a.name}
              aria-pressed={on}
              onClick={() => update({ avatar: on ? null : a.id })}
              className="group flex flex-col items-center gap-1.5 rounded-xl"
            >
              <span
                className={`relative block w-full rounded-full transition-[box-shadow,transform] duration-200 group-hover:scale-105 ${
                  on ? "shadow-[0_0_0_3px_var(--sandal-deep),0_0_0_5px_var(--kesar),0_0_22px_var(--glow)]" : ""
                }`}
              >
                <AvatarArt id={a.id} className="h-auto w-full" />
                {on && (
                  <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full bg-kesar text-on-kesar ring-2 ring-sandal-deep">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </span>
              <span className={`text-center text-[0.7rem] leading-tight ${on ? "text-kesar-deep" : "text-kajal-soft"}`}>
                {a.name}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
