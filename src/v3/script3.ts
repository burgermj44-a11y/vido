// Video 3: MJ Burger ad (Algerian Darija). Times in seconds.
import type { Caption, Sfx } from "../script";

export const FPS3 = 30;
export const SPEECH_END3 = 25.43;
// the end card holds for a moment after the speech
export const DURATION3 = 27.5;

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
  { start: 5.54, end: 6.6, text: "كيما راكم تشوفو" },
  { start: 6.6, end: 7.9, text: "أنا كريستيانو رونالدو", hl: ["رونالدو"] },
  { start: 7.9, end: 8.9, text: "جيت عند MJ\u00A0Burger", hl: ["MJ\u00A0Burger"] },
  { start: 9.0, end: 10.54, text: "اللي هو الأفضل في الشلف", hl: ["الأفضل"] },
  { start: 10.83, end: 12.29, text: "من ناحية الجودة والماكلة", hl: ["الجودة"] },
  { start: 12.39, end: 13.17, text: "شوفو خاوتي" },
  { start: 13.27, end: 14.71, text: "كاين الهامبرغر", hl: ["الهامبرغر"] },
  { start: 15.01, end: 15.67, text: "كاين الصاندويتش", hl: ["الصاندويتش"] },
  { start: 15.76, end: 16.66, text: "كاين التاكوس", hl: ["التاكوس"] },
  { start: 16.77, end: 18.43, text: "وأي حاجة راكم تحوسو عليها" },
  { start: 18.69, end: 19.8, text: "MJ\u00A0Burger خاوتي", hl: ["MJ\u00A0Burger"] },
  { start: 19.88, end: 20.81, text: "مرحبا بيكم", hl: ["مرحبا"] },
  { start: 21.08, end: 22.14, text: "راح تلقاوني أنا" },
  { start: 22.54, end: 23.34, text: "وعبد الوهاب", hl: ["عبد", "الوهاب"] },
  { start: 23.43, end: 24.62, text: "راح نكونو كيف كيف" },
  { start: 24.89, end: 25.43, text: "نمدولكم الماكلة", hl: ["الماكلة"] },
];

export type SceneKind3 =
  | "intro"
  | "menuTease"
  | "look"
  | "siuuu"
  | "best"
  | "quality"
  | "menu"
  | "welcome"
  | "chefs";

export type Scene3 = { start: number; end: number; kind: SceneKind3; zoom: number; gfxStart?: number };

export const SCENES3: Scene3[] = [
  { start: 0.0, end: 2.4, kind: "intro", zoom: 1.0 },
  { start: 2.4, end: 5.5, kind: "menuTease", zoom: 1.12 },
  { start: 5.5, end: 6.6, kind: "look", zoom: 1.0 },
  { start: 6.6, end: 8.95, kind: "siuuu", zoom: 1.24 },
  { start: 8.95, end: 10.7, kind: "best", zoom: 1.0 },
  { start: 10.7, end: 13.2, kind: "quality", zoom: 1.14 },
  { start: 13.2, end: 18.55, kind: "menu", zoom: 1.0 },
  { start: 18.55, end: 21.0, kind: "welcome", zoom: 1.14 },
  { start: 21.0, end: 23.4, kind: "chefs", zoom: 1.0 },
];

// Full-screen product showcase (real photos / clips of the food).
export type Shot =
  | { start: number; end: number; kind: "image"; src: string; tag: string }
  | { start: number; end: number; kind: "video"; src: string; tag: string; from?: number; rate?: number }
  | { start: number; end: number; kind: "collage"; tag: string };

export const SHOTS3: Shot[] = [
  { start: 3.7, end: 5.46, kind: "video", src: "v3/sandwich_live.mp4", tag: "📋 المينيو", rate: 0.45 },
  { start: 13.22, end: 14.86, kind: "image", src: "v3/products/p6.jpg", tag: "🍔 الهامبرغر" },
  { start: 14.86, end: 15.72, kind: "image", src: "v3/products/p1.jpg", tag: "🥖 الصاندويتش" },
  { start: 15.72, end: 16.72, kind: "video", src: "v3/tacos.mp4", tag: "🌯 التاكوس", from: 0.5 },
  { start: 16.72, end: 18.55, kind: "collage", tag: "😋 واش تحوس كاين" },
];

export const COLLAGE3 = ["p6", "p1", "p2", "p4", "p5", "p3"].map((p) => `v3/products/${p}.jpg`);

// end card (shop name, address, phone)
export const END_START3 = 23.4;

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
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: 16.72 + f(3 + i * 4), file: "pop", volume: 0.3 })),
  // intro brand card
  { at: f(2), file: "pop", volume: 0.5 },
  { at: f(12), file: "pop", volume: 0.35 },
  { at: f(18), file: "pop", volume: 0.35 },
  { at: 0.9, file: "sparkle", volume: 0.35 },
  // menu tease
  { at: 2.4 + f(3), file: "pop", volume: 0.45 },
  { at: 2.4 + f(8), file: "pop2", volume: 0.4 },
  // "look" + Ronaldo joke: whistle, crowd, SIUUU impact, laugh sticker
  { at: 5.5 + f(3), file: "pop", volume: 0.4 },
  { at: 6.55, file: "v3/whistle", volume: 0.45 },
  { at: 6.7, file: "v3/crowd", volume: 0.5 },
  { at: 6.6 + f(12), file: "boom", volume: 0.55 },
  { at: 6.6 + f(30), file: "pop", volume: 0.4 },
  { at: 6.6 + f(34), file: "pop2", volume: 0.4 },
  // best in Chlef
  { at: 8.95 + f(2), file: "pop", volume: 0.45 },
  { at: 8.95 + f(6), file: "pop2", volume: 0.4 },
  { at: 8.95 + f(14), file: "sparkle", volume: 0.3 },
  // quality: five stars
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 10.7 + f(4 + i * 3), file: "blip", volume: 0.2 })),
  { at: 10.7 + f(22), file: "pop", volume: 0.4 },
  { at: 10.7 + f(8), file: "pop2", volume: 0.4 },
  // welcome
  { at: 18.55 + f(3), file: "pop", volume: 0.45 },
  { at: 18.55 + f(6), file: "pop2", volume: 0.4 },
  { at: 18.55 + f(14), file: "pop", volume: 0.35 },
  // chefs
  { at: 21.0 + f(3), file: "pop", volume: 0.45 },
  { at: 21.0 + f(6), file: "pop2", volume: 0.4 },
  { at: 21.0 + f(14), file: "pop", volume: 0.35 },
  // end card
  { at: END_START3, file: "swipe", volume: 0.55 },
  { at: END_START3 + f(8), file: "v3/kaching", volume: 0.45 },
  { at: END_START3 + f(16), file: "pop2", volume: 0.4 },
  { at: END_START3 + f(24), file: "pop2", volume: 0.4 },
  { at: END_START3 + f(32), file: "ding", volume: 0.35 },
  // soft tick for each new caption line
  ...CAPTIONS3.slice(1).map((c) => ({ at: c.start, file: "tick", volume: 0.14 })),
];
