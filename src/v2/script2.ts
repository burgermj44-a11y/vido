// Video 2: "BAC / BEM 2027 secret" (Algerian Darija). Times in seconds.
import type { Caption, Broll, Sfx } from "../script";

export const FPS2 = 30;
export const DURATION2 = 32.86;

export const CAPTIONS2: Caption[] = [
  { start: 0.0, end: 1.84, text: "صحاب الباك والبيام 2027", hl: ["2027"] },
  { start: 2.1, end: 3.0, text: "تيقوني غير كاملين", hl: ["تيقوني"] },
  { start: 3.0, end: 4.08, text: "راكم حتديو الباك", hl: ["الباك"] },
  { start: 4.08, end: 4.78, text: "100%", hl: ["100%"] },
  { start: 4.78, end: 5.2, text: "علاش؟", hl: ["علاش؟"] },
  { start: 5.22, end: 6.16, text: "لأنو عندي واحد السر", hl: ["السر"] },
  { start: 6.27, end: 7.55, text: "جد عظيم", hl: ["عظيم"] },
  { start: 7.55, end: 8.5, text: "واللي ما كانش حتى حد" },
  { start: 8.5, end: 9.4, text: "حكالكم عليه" },
  { start: 9.47, end: 10.3, text: "بارطاجيو هاذ الفيديو", hl: ["بارطاجيو"] },
  { start: 10.3, end: 11.1, text: "مع صحابكم", hl: ["صحابكم"] },
  { start: 11.14, end: 12.39, text: "وراح نعطيكم هاذ السر", hl: ["السر"] },
  { start: 12.55, end: 13.57, text: "هاذ السر واللي هو" },
  { start: 13.68, end: 15.43, text: "توفيق من الله سبحانه وتعالى", hl: ["توفيق"] },
  { start: 15.57, end: 16.9, text: "وبسبب توفيق من الله" },
  { start: 16.9, end: 18.36, text: "قدرت نقرّي", hl: ["نقرّي"] },
  { start: 18.57, end: 19.39, text: "بزاف شباب", hl: ["بزاف"] },
  { start: 19.53, end: 20.8, text: "صحاب الباك والبيام", hl: ["الباك"] },
  { start: 21.06, end: 22.23, text: "واللي يقرا إنجينيور", hl: ["إنجينيور"] },
  { start: 22.37, end: 23.6, text: "وهاذ الكونسبت", hl: ["الكونسبت"] },
  { start: 23.6, end: 25.34, text: "راح تديه في الأيام القادمة" },
  { start: 25.53, end: 26.3, text: "تما غير دير أبوني", hl: ["أبوني"] },
  { start: 26.3, end: 27.02, text: "لهاذ الحساب" },
  { start: 27.14, end: 27.95, text: "وبارطاجيه فالستوري", hl: ["فالستوري"] },
  { start: 27.99, end: 28.39, text: "كاملين" },
  { start: 28.52, end: 29.39, text: "بصح على بالي" },
  { start: 29.39, end: 30.52, text: "واش راح يجي ماشي نورمال", hl: ["نورمال"] },
  { start: 30.8, end: 32.86, text: "وراح تديو الباك والبيام", hl: ["الباك", "والبيام"] },
];

export type SceneKind2 =
  | "bac2027"
  | "trust"
  | "hundred"
  | "secret"
  | "hush"
  | "share"
  | "tawfiq"
  | "students"
  | "concept"
  | "follow"
  | "story"
  | "notnormal"
  | "ending";

export type Scene2 = { start: number; end: number; kind: SceneKind2; zoom: number; gfxStart?: number };

export const SCENES2: Scene2[] = [
  { start: 0.0, end: 2.1, kind: "bac2027", zoom: 1.0 },
  { start: 2.1, end: 4.08, kind: "trust", zoom: 1.12 },
  { start: 4.08, end: 5.2, kind: "hundred", zoom: 1.24 },
  { start: 5.2, end: 7.55, kind: "secret", zoom: 1.0 },
  { start: 7.55, end: 9.45, kind: "hush", zoom: 1.14 },
  { start: 9.45, end: 11.12, kind: "share", zoom: 1.0 },
  { start: 11.12, end: 15.5, kind: "tawfiq", zoom: 1.12 },
  { start: 15.5, end: 21.05, kind: "students", zoom: 1.0, gfxStart: 18.45 },
  { start: 21.05, end: 25.45, kind: "concept", zoom: 1.14, gfxStart: 22.3 },
  { start: 25.45, end: 27.05, kind: "follow", zoom: 1.0 },
  { start: 27.05, end: 28.45, kind: "story", zoom: 1.12 },
  { start: 28.45, end: 30.75, kind: "notnormal", zoom: 1.22 },
  { start: 30.75, end: 32.9, kind: "ending", zoom: 1.0 },
];

export const BROLLS2: Broll[] = [
  { start: 16.9, end: 18.45, img: "lecture", tag: "👨‍🏫 قرّيت بزاف شباب" },
  { start: 21.06, end: 22.3, img: "engineering-team", tag: "⚙️ إنجينيور" },
  { start: 23.6, end: 25.45, img: "coming-soon", tag: "⏳ قريباً" },
  { start: 30.8, end: 32.9, img: "celebration", tag: "🎓 الباك والبيام" },
];

const f = (frames: number) => frames / FPS2;
const zoomCuts = SCENES2.slice(1).filter((s) => !BROLLS2.some((b) => Math.abs(b.start - s.start) < 0.2));

export const SFX2: Sfx[] = [
  // zoom cuts: whoosh in when punching in, out when pulling back
  ...zoomCuts.map((s, i) => ({
    at: Math.max(0, s.start - 0.05),
    file: s.zoom > (SCENES2[SCENES2.indexOf(s) - 1]?.zoom ?? 1) ? "whoosh_in" : "whoosh_out",
    volume: i % 2 ? 0.45 : 0.5,
  })),
  // b-roll swipes and their tags
  ...BROLLS2.flatMap((b) => [
    { at: b.start, file: "swipe", volume: 0.55 },
    { at: b.start + f(5), file: "pop2", volume: 0.4 },
    ...(b.end < DURATION2 - 0.3 ? [{ at: b.end - 0.25, file: "whoosh_out", volume: 0.4 }] : []),
  ]),
  // bac 2027 title card
  { at: f(2), file: "pop", volume: 0.5 },
  { at: f(10), file: "pop", volume: 0.35 },
  { at: f(16), file: "pop", volume: 0.35 },
  { at: 1.0, file: "sparkle", volume: 0.35 },
  // trust
  { at: 2.1 + f(3), file: "pop", volume: 0.45 },
  { at: 2.1 + f(6), file: "pop2", volume: 0.4 },
  { at: 2.1 + f(14), file: "pop", volume: 0.35 },
  // 100% counter + impact
  ...Array.from({ length: 10 }, (_, k) => ({ at: 4.08 + f(2 + k * 2), file: "blip", volume: 0.12 })),
  { at: 4.08 + f(22), file: "boom", volume: 0.55 },
  { at: 4.08 + f(23), file: "sparkle", volume: 0.3 },
  // "why?"
  { at: 4.8, file: "pop2", volume: 0.4 },
  // secret: lock, key flies in, unlock
  { at: 5.2 + f(2), file: "pop", volume: 0.45 },
  { at: 5.2 + f(6), file: "pop2", volume: 0.4 },
  { at: 6.27, file: "whoosh_in", volume: 0.35 },
  { at: 6.27 + f(14), file: "click", volume: 0.6 },
  { at: 6.27 + f(16), file: "sparkle", volume: 0.35 },
  // hush
  { at: 7.55 + f(3), file: "pop", volume: 0.45 },
  { at: 7.55 + f(6), file: "pop2", volume: 0.4 },
  { at: 7.55 + f(14), file: "pop", volume: 0.35 },
  // share #1: button, planes, friends
  { at: 9.45 + f(2), file: "pop", volume: 0.5 },
  { at: 9.45 + f(5), file: "pop2", volume: 0.4 },
  { at: 9.45 + f(12), file: "click", volume: 0.6 },
  ...[0, 1, 2, 3].flatMap((i) => [
    { at: 9.45 + f(14 + i * 3), file: "swipe", volume: 0.22 },
    { at: 9.45 + f(26 + i * 3), file: "pop", volume: 0.3 },
  ]),
  { at: 9.45 + f(38), file: "ding", volume: 0.3 },
  // tawfiq: light rays
  { at: 11.12 + f(2), file: "sparkle", volume: 0.4 },
  { at: 11.12 + f(6), file: "pop2", volume: 0.35 },
  { at: 13.68, file: "sparkle", volume: 0.35 },
  { at: 13.68 + f(4), file: "pop2", volume: 0.4 },
  // students
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 18.45 + f(2 + i * 4), file: "pop", volume: 0.35 })),
  { at: 18.45 + f(6), file: "pop2", volume: 0.4 },
  // concept: rocket
  { at: 22.3 + f(2), file: "pop", volume: 0.45 },
  { at: 22.3 + f(6), file: "pop2", volume: 0.4 },
  { at: 22.3 + f(10), file: "whoosh_in", volume: 0.4 },
  // follow card (abonné)
  { at: 25.45 + f(2), file: "pop", volume: 0.45 },
  { at: 25.45 + f(10), file: "swipe", volume: 0.3 },
  { at: 26.25, file: "click", volume: 0.7 },
  { at: 26.25 + f(1), file: "ding", volume: 0.35 },
  { at: 26.25 + f(4), file: "pop", volume: 0.3 },
  // share #2: story
  { at: 27.05 + f(2), file: "pop", volume: 0.5 },
  { at: 27.05 + f(5), file: "pop2", volume: 0.4 },
  { at: 27.05 + f(10), file: "click", volume: 0.6 },
  ...[0, 1, 2, 3].flatMap((i) => [
    { at: 27.05 + f(12 + i * 3), file: "swipe", volume: 0.22 },
    { at: 27.05 + f(22 + i * 3), file: "pop", volume: 0.3 },
  ]),
  // not normal: fire + impact
  { at: 28.45 + f(2), file: "boom", volume: 0.55 },
  { at: 28.45 + f(6), file: "pop2", volume: 0.4 },
  { at: 28.45 + f(12), file: "pop", volume: 0.35 },
  { at: 29.39 + f(14), file: "boom", volume: 0.45 },
  // finale
  { at: 32.0, file: "sparkle", volume: 0.4 },
  // a soft tick for each new caption line
  ...CAPTIONS2.slice(1).map((c) => ({ at: c.start, file: "tick", volume: 0.14 })),
];
