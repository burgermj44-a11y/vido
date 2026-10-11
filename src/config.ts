export const FPS = 30;
export const DURATION = 1423; // 47.43s source video
export const W = 1080;
export const H = 1920;

const f = (s: number) => Math.round(s * FPS);

// Centre of each paper transition (seconds into the source video).
export const CUTS = [5.4, 10.6, 16.2, 21.4, 27, 32.8, 38.4].map(f);

// What appears between cuts: the "mj" logo, or a French word.
export const INTERSTITIALS = [
  "mj",
  "Astuce",
  "mj",
  "Retiens ça",
  "mj",
  "Attention",
  "Go !",
];

// Moments where a word is spoken (seconds). Tune these if a sticker is off.
export const TRIGGERS = {
  person: [0.2, 8.8].map(f), // "هذا الإنسان"
  share: f(7.2), // "بارطاجي هذا الفيديو لكاع أصحابك"
  follow: f(43.6), // "ابوني هذا الكونت راح يفيدك كاع حياتك"
};

export const PROFILE = {
  handle: "@mj",
  name: "mj",
};

export const PALETTE = {
  paper: "#f4ecda",
  kraft: "#c79a5b",
  ink: "#1d1a17",
  red: "#e5483a",
  yellow: "#f6c945",
  teal: "#2b9c8f",
  blue: "#3b6fd4",
  pink: "#f08ab0",
};
