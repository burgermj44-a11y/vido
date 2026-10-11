export const FPS = 30;
export const DURATION = 1423; // 47.43s source video
export const W = 1080;
export const H = 1920;

export const f = (s: number) => Math.round(s * FPS);

export const PALETTE = {
  paper: "#fbf6ea",
  kraft: "#c79a5b",
  ink: "#1d1a17",
  red: "#d92f2f",
  yellow: "#ffd84a",
  blue: "#1f3fd1",
  black: "#15110d",
};

export type CutKind = "mj" | "word" | "tear";
export type Cut = { at: number; kind: CutKind; word?: string };

// Paper transitions: black "mj" card, a French word card, or a plain tear.
export const CUTS: Cut[] = [
  { at: f(4.95), kind: "mj" },
  { at: f(9.95), kind: "word", word: "Histoire" },
  { at: f(15.5), kind: "mj" },
  { at: f(20.0), kind: "word", word: "Le déclic" },
  { at: f(26.8), kind: "mj" },
  { at: f(29.0), kind: "tear" },
  { at: f(32.3), kind: "word", word: "Astuce" },
  { at: f(36.3), kind: "mj" },
  { at: f(43.0), kind: "word", word: "Bonne chance !" },
];

// Full-screen paper "week" scene shown between two cuts.
export const BROLL = { from: f(29.0), to: f(32.3) };

export const PROFILE = { handle: "mj" };
// Put a screenshot of your Instagram profile in public/ and set its file name here.
export const PROFILE_IMAGE: string | null = "profile_card.png";
