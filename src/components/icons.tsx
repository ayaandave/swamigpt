type P = { className?: string };
const base = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const AskIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
    <path d="M9.5 8.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4" />
    <circle cx="12" cy="13.6" r=".4" fill="currentColor" />
  </svg>
);

// Seated figure
export const MeditateIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7.5v5" />
    <path d="M7 11.5c1.6 1 3.2 1.4 5 1.4s3.4-.4 5-1.4" />
    <path d="M4.5 18.5c2.2-2 4.7-3 7.5-3s5.3 1 7.5 3" />
    <path d="M6 20.5h12" />
  </svg>
);

// Open book
export const LearnIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
    <path d="M12 6.5v13" />
  </svg>
);

// Rising sun
export const TodayIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 16a6 6 0 0 1 12 0" />
    <path d="M3 19.5h18" />
    <path d="M12 4.5v2.5M5.3 8.3l1.7 1.7M18.7 8.3 17 10M2.5 15.5H4.5M19.5 15.5h2" />
  </svg>
);

export const SettingsIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
);

export const SpeakerIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const StopIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" />
  </svg>
);

export const MicIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

export const SendIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
  </svg>
);

export const PlayIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
  </svg>
);

export const PauseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 5.5v13M16 5.5v13" strokeWidth="3" />
  </svg>
);

export const BackIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const CheckIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const PersonIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);

// A house with a lamp's flame in the doorway
export const HomeIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" />
    <path d="M12 12.2c1 1.2 1.6 2.2 1.6 3.1a1.6 1.6 0 0 1-3.2 0c0-.9.6-1.9 1.6-3.1z" />
  </svg>
);

// A rolled scroll
export const ReadIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7 4h11a2 2 0 0 1 2 2v1h-4" />
    <path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10" />
    <path d="M7 4a2 2 0 0 0-2 2v11" />
    <path d="M9 9h4M9 12h4" />
  </svg>
);

// Three rising bars: the private money page
export const MoneyIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 20h16" />
    <path d="M7 16.5v-4" />
    <path d="M12 16.5v-8" />
    <path d="M17 16.5V5" />
  </svg>
);

// Two arrows chasing each other: karma, what we do comes back
export const KarmaIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19 12a7 7 0 0 1-12 4.9" />
    <path d="M5 12a7 7 0 0 1 12-4.9" />
    <path d="M17.5 3.5v4h-4" />
    <path d="M6.5 20.5v-4h4" />
  </svg>
);

// Rama's bow and arrow
export const BowIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 3.5c7 2 10.5 9.5 14.5 14.5" />
    <path d="M6 3.5 20.5 18" />
    <path d="M3.5 20.5 15 9" />
    <path d="M3.5 20.5v-3.2M3.5 20.5h3.2" />
  </svg>
);

// A diya, the small oil lamp
export const LampIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 13.5h17c-.8 3.5-4.2 5.5-8.5 5.5s-7.7-2-8.5-5.5z" />
    <path d="M12 4c1.6 1.9 2.4 3.4 2.4 4.7a2.4 2.4 0 0 1-4.8 0C9.6 7.4 10.4 5.9 12 4z" />
  </svg>
);

// A crescent moon, for sleep
export const MoonIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
  </svg>
);
