// Avatars: a symbol on a coloured circle, chosen on the account page. No photos, so nothing personal
// is uploaded (safe for children too). Saved with the settings, so it follows the account.
export type Avatar = { id: string; symbol: string; name: string; tone: string; devanagari?: boolean };

export const AVATARS: Avatar[] = [
  { id: "diya", symbol: "🪔", name: "Diya lamp", tone: "bg-night" },
  { id: "lotus", symbol: "🪷", name: "Lotus", tone: "bg-tulsi" },
  { id: "om", symbol: "ॐ", name: "Om", tone: "bg-kesar text-kajal", devanagari: true },
  { id: "peacock", symbol: "🦚", name: "Peacock", tone: "bg-night-soft" },
  { id: "elephant", symbol: "🐘", name: "Elephant, for Ganesha", tone: "bg-sandal-edge" },
  { id: "monkey", symbol: "🐒", name: "Monkey, for Hanuman", tone: "bg-kesar-deep" },
  { id: "cow", symbol: "🐄", name: "Cow", tone: "bg-tulsi" },
  { id: "banyan", symbol: "🌳", name: "Banyan tree", tone: "bg-kumkum" },
  { id: "sun", symbol: "☀️", name: "Sun", tone: "bg-kesar" },
  { id: "moon", symbol: "🌙", name: "Moon", tone: "bg-night" },
  { id: "conch", symbol: "🐚", name: "Conch shell", tone: "bg-tulsi" },
  { id: "himalaya", symbol: "🏔️", name: "Himalayas", tone: "bg-kesar-deep" },
];

export const getAvatar = (id: string | null | undefined) => AVATARS.find((a) => a.id === id);
