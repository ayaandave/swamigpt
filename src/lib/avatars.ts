// Profile pictures: twelve small paintings in the app's own gold-on-dark look, drawn in
// components/AvatarArt.tsx and chosen on the account page. No photos, so nothing personal is
// uploaded (safe for children too). Saved with the settings, so it follows the account.
export type Avatar = { id: string; name: string };

export const AVATARS: Avatar[] = [
  { id: "diya", name: "Diya lamp" },
  { id: "om", name: "Om" },
  { id: "lotus", name: "Lotus" },
  { id: "moon", name: "Moon" },
  { id: "himalaya", name: "Himalayas" },
  { id: "sun", name: "Sunrise" },
  { id: "peacock", name: "Peacock feather" },
  { id: "mala", name: "Mala beads" },
  { id: "bell", name: "Temple bell" },
  { id: "banyan", name: "Banyan tree" },
  { id: "flute", name: "Flute" },
  { id: "conch", name: "Conch shell" },
];

// Pictures from the first set that were replaced: anyone who chose one keeps a picture
const RENAMED: Record<string, string> = { elephant: "bell", monkey: "flute", cow: "mala" };

export const getAvatar = (id: string | null | undefined) => {
  if (!id) return undefined;
  const key = RENAMED[id] ?? id;
  return AVATARS.find((a) => a.id === key);
};
