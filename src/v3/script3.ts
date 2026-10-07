// Video 3: MJ Burger ad (Algerian Darija). Times in seconds.
import type { Caption, Sfx } from "../script";

export const FPS3 = 30;
// The clip is cut: the Ronaldo part (5.5-8.97 s) and the closing lines after
// "مرحبا بيكم" are removed. Times below are on the cut timeline.
export const SPEECH_END3 = 17.5;
// the end card holds for a moment after the speech
export const DURATION3 = 20.7;

export const SHOP = {
  name: "MJ BURGER",
  city: "الشلف",
  address: "DNC",
  phone: "0542547119",
};

export const CAPTIONS3: Caption[] = [
  { start: 0.0, end: 1.1, text: "بما أنو MJ\u00A0Burger", hl: ["MJ\u00A0Burger"] },
  { start: 1.1, end: 2.27, text: "متواجد في ولاية الشلف", hl: ["الشلف"] },
  { start: 2.51, end: 3.7, text: "راح نوريكم" },
  { start: 3.7, end: 5.46, text: "واش كاين في المينيو", hl: ["المينيو"] },
  { start: 5.533, end: 7.073, text: "اللي هو الأفضل في الشلف", hl: ["الأفضل"] },
  { start: 7.363, end: 8.823, text: "من ناحية الجودة والماكلة", hl: ["الجودة"] },
  { start: 8.923, end: 9.703, text: "شوفو خاوتي" },
  { start: 9.803, end: 11.243, text: "كاين الهامبرغر", hl: ["الهامبرغر"] },
  { start: 11.543, end: 12.203, text: "كاين الصاندويتش", hl: ["الصاندويتش"] },
  { start: 12.293, end: 13.193, text: "كاين التاكوس", hl: ["التاكوس"] },
  { start: 13.303, end: 14.963, text: "وأي حاجة راكم تحوسو عليها" },
  { start: 15.223, end: 16.333, text: "MJ\u00A0Burger خاوتي", hl: ["MJ\u00A0Burger"] },
  { start: 16.413, end: 17.343, text: "مرحبا بيكم", hl: ["مرحبا"] },
];

export type SceneKind3 = "intro" | "menuTease" | "best" | "quality" | "menu" | "welcome";

export type Scene3 = { start: number; end: number; kind: SceneKind3; zoom: number; gfxStart?: number };

export const SCENES3: Scene3[] = [
  { start: 0.0, end: 2.4, kind: "intro", zoom: 1.0 },
  { start: 2.4, end: 5.5, kind: "menuTease", zoom: 1.12 },
  { start: 5.5, end: 7.23, kind: "best", zoom: 1.0 },
  { start: 7.23, end: 9.73, kind: "quality", zoom: 1.14 },
  { start: 9.73, end: 15.08, kind: "menu", zoom: 1.0 },
  { start: 15.08, end: 17.5, kind: "welcome", zoom: 1.14 },
];

// Full-screen product showcase (real photos / clips of the food).
export type Shot =
  | { start: number; end: number; kind: "image"; src: string; tag: string }
  | { start: number; end: number; kind: "video"; src: string; tag: string; from?: number; rate?: number }
  | { start: number; end: number; kind: "collage"; tag: string };

export const SHOTS3: Shot[] = [
  { start: 3.7, end: 5.46, kind: "video", src: "v3/sandwich_live.mp4", tag: "📋 المينيو", rate: 0.45 },
  { start: 9.75, end: 11.39, kind: "image", src: "v3/products/p6.jpg", tag: "🍔 الهامبرغر" },
  { start: 11.39, end: 12.25, kind: "image", src: "v3/products/p1.jpg", tag: "🥖 الصاندويتش" },
  { start: 12.25, end: 13.25, kind: "video", src: "v3/tacos.mp4", tag: "🌯 التاكوس", from: 0.5 },
  { start: 13.25, end: 15.08, kind: "collage", tag: "😋 واش تحوس كاين" },
];

export const COLLAGE3 = ["p6", "p1", "p2", "p4", "p5", "p3"].map((p) => `v3/products/${p}.jpg`);

// end card (shop name, address, phone)
export const END_START3 = 17.45;

const f = (frames: number) => frames / FPS3;
const zoomCuts = SCENES3.slice(1).filter((s) => !SHOTS3.some((b) => Math.abs(b.start - s.start) < 0.2));

export const SFX3: Sfx[] = [
  ...zoomCuts.map((s, i) => ({
    at: Math.max(0, s.start - 0.05),
    file: s.zoom > (SCENES3[SCENES3.indexOf(s) - 1]?.zoom ?? 1) ? "whoosh_in" : "whoosh_out",
    volume: i % 2 ? 0.45 : 0.5,
  })),
  // showcase shots
  ...SHOTS3.flatMap((b) => [
    { at: b.start, file: "swipe", volume: 0.55 },
    { at: b.start + f(5), file: "pop2", volume: 0.4 },
  ]),
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: 13.25 + f(3 + i * 4), file: "pop", volume: 0.3 })),
  // intro logo
  { at: f(2), file: "pop", volume: 0.5 },
  { at: f(12), file: "pop", volume: 0.35 },
  { at: f(18), file: "pop", volume: 0.35 },
  { at: 0.9, file: "sparkle", volume: 0.35 },
  // menu tease
  { at: 2.4 + f(3), file: "pop", volume: 0.45 },
  { at: 2.4 + f(8), file: "pop2", volume: 0.4 },
  // best in Chlef
  { at: 5.5 + f(2), file: "pop", volume: 0.45 },
  { at: 5.5 + f(6), file: "pop2", volume: 0.4 },
  { at: 5.5 + f(14), file: "sparkle", volume: 0.3 },
  // quality: five stars
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 7.23 + f(4 + i * 3), file: "blip", volume: 0.2 })),
  { at: 7.23 + f(22), file: "pop", volume: 0.4 },
  { at: 7.23 + f(8), file: "pop2", volume: 0.4 },
  // welcome
  { at: 15.08 + f(3), file: "pop", volume: 0.45 },
  { at: 15.08 + f(6), file: "pop2", volume: 0.4 },
  { at: 15.08 + f(14), file: "pop", volume: 0.35 },
  // end card
  { at: END_START3, file: "swipe", volume: 0.55 },
  { at: END_START3 + f(8), file: "v3/kaching", volume: 0.45 },
  { at: END_START3 + f(16), file: "pop2", volume: 0.4 },
  { at: END_START3 + f(24), file: "pop2", volume: 0.4 },
  { at: END_START3 + f(32), file: "ding", volume: 0.35 },
  // soft tick for each new caption line
  ...CAPTIONS3.slice(1).map((c) => ({ at: c.start, file: "tick", volume: 0.14 })),
];
