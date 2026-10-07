// Video 5: standalone (not part of the series) – "3 things about studying".
// The CapCut outro at the end of the clip was removed (clip ends at 31.9 s).
import type { Broll, Caption, Sfx } from "../script";

export const FPS5 = 30;
export const DURATION5 = 957 / 30; // 31.9 s

export const CAPTIONS5: Caption[] = [
  { start: 0.0, end: 1.6, text: "هاذ الهدرة كون قالهالك باباك", hl: ["باباك"] },
  { start: 1.6, end: 3.6, text: "صدّقني تدي المعدل عادي", hl: ["المعدل"] },
  { start: 3.6, end: 4.8, text: "وهاذ الهدرة" },
  { start: 4.8, end: 6.4, text: "ما كانش اللي راح يقولهالك", hl: ["يقولهالك"] },
  { start: 6.4, end: 8.1, text: "بصح راح نعطيهالك أنا", hl: ["نعطيهالك"] },
  { start: 8.1, end: 9.7, text: "وما تنساوش تبارطاجيو", hl: ["تبارطاجيو"] },
  { start: 9.7, end: 11.2, text: "هاذ الفيديو إذا عجبكم" },
  { start: 11.2, end: 12.6, text: "راح يفيدك في حياتك", hl: ["يفيدك"] },
  { start: 12.6, end: 13.32, text: "أول حاجة", hl: ["أول"] },
  { start: 13.4, end: 14.9, text: "القراية تبدا من المسيد", hl: ["المسيد"] },
  { start: 14.9, end: 16.12, text: "ماشي من الدار" },
  { start: 16.2, end: 17.2, text: "وثاني حاجة", hl: ["ثاني"] },
  { start: 17.2, end: 18.4, text: "القراية في المسيد وحدها" },
  { start: 18.4, end: 19.4, text: "ما تديلك والو", hl: ["والو"] },
  { start: 19.4, end: 20.7, text: "إلا إذا دعمتها في الدار", hl: ["الدار"] },
  { start: 20.7, end: 21.5, text: "وثالث حاجة", hl: ["ثالث"] },
  { start: 21.5, end: 22.8, text: "القراية في المسيد وفي الدار" },
  { start: 22.8, end: 24.0, text: "ما تديلك والو وحدها", hl: ["والو"] },
  { start: 24.0, end: 25.6, text: "إلا إذا دعمتها بالكور", hl: ["بالكور"] },
  { start: 25.6, end: 27.4, text: "ولا بالحصص المجانية", hl: ["المجانية"] },
  { start: 27.4, end: 28.5, text: "تاع اليوتيوب", hl: ["اليوتيوب"] },
  { start: 28.5, end: 29.5, text: "ولازم تدعمها بالسيريات", hl: ["بالسيريات"] },
  { start: 29.5, end: 30.6, text: "أبليكي هاذ الكونساي", hl: ["الكونساي"] },
  { start: 30.6, end: 31.85, text: "و17 معدل تشوفها قدام عينك", hl: ["و17"] },
];

export type SceneKind5 =
  | "dad"
  | "easy"
  | "secret"
  | "gift"
  | "share"
  | "life"
  | "point1"
  | "point2"
  | "point3"
  | "lessons"
  | "series"
  | "seventeen";

export type Scene5 = { start: number; end: number; kind: SceneKind5; zoom: number; gfxStart?: number };

export const SCENES5: Scene5[] = [
  { start: 0.0, end: 1.6, kind: "dad", zoom: 1.0 },
  { start: 1.6, end: 3.6, kind: "easy", zoom: 1.22 },
  { start: 3.6, end: 6.4, kind: "secret", zoom: 1.0 },
  { start: 6.4, end: 8.1, kind: "gift", zoom: 1.14 },
  { start: 8.1, end: 11.2, kind: "share", zoom: 1.0 },
  { start: 11.2, end: 12.6, kind: "life", zoom: 1.12 },
  { start: 12.6, end: 16.15, kind: "point1", zoom: 1.0, gfxStart: 14.9 },
  { start: 16.15, end: 20.7, kind: "point2", zoom: 1.14 },
  { start: 20.7, end: 24.0, kind: "point3", zoom: 1.0 },
  { start: 24.0, end: 27.4, kind: "lessons", zoom: 1.14 },
  { start: 27.4, end: 29.5, kind: "series", zoom: 1.0 },
  { start: 29.5, end: 31.9, kind: "seventeen", zoom: 1.22 },
];

export const BROLLS5: Broll[] = [
  { start: 13.4, end: 14.9, img: "teacher", tag: "🏫 القراية تبدا من المسيد" },
  { start: 19.4, end: 20.7, img: "book-reading", tag: "🏠 دعّمها في الدار" },
];

const f = (frames: number) => frames / FPS5;
const zoomCuts = SCENES5.slice(1).filter((s) => !BROLLS5.some((b) => Math.abs(b.start - s.start) < 0.2));

export const SFX5: Sfx[] = [
  // opening riser, impact lands on the 1.6 s punch-in
  { at: 0, file: "v5/riser", volume: 0.45 },
  ...zoomCuts.map((s, i) => ({
    at: Math.max(0.05, s.start - 0.05),
    file: s.zoom > (SCENES5[SCENES5.indexOf(s) - 1]?.zoom ?? 1) ? "whoosh_in" : "whoosh_out",
    volume: i % 2 ? 0.4 : 0.45,
  })),
  ...BROLLS5.flatMap((b) => [
    { at: b.start, file: "swipe", volume: 0.5 },
    { at: b.start + f(5), file: "pop2", volume: 0.35 },
    { at: b.end - 0.25, file: "whoosh_out", volume: 0.35 },
  ]),
  // dad / easy / secret / gift
  { at: f(4), file: "pop", volume: 0.4 },
  { at: f(8), file: "pop2", volume: 0.35 },
  { at: 1.6 + f(3), file: "pop", volume: 0.4 },
  { at: 1.6 + f(6), file: "pop2", volume: 0.35 },
  { at: 3.6 + f(3), file: "pop", volume: 0.4 },
  { at: 3.6 + f(6), file: "pop2", volume: 0.35 },
  { at: 6.4 + f(3), file: "pop", volume: 0.4 },
  { at: 6.4 + f(14), file: "sparkle", volume: 0.35 },
  // share
  { at: 8.1 + f(2), file: "pop", volume: 0.45 },
  { at: 8.1 + f(5), file: "pop2", volume: 0.35 },
  { at: 8.1 + f(12), file: "click", volume: 0.5 },
  ...[0, 1, 2, 3].flatMap((i) => [
    { at: 8.1 + f(14 + i * 3), file: "swipe", volume: 0.18 },
    { at: 8.1 + f(26 + i * 3), file: "pop", volume: 0.25 },
  ]),
  // life
  { at: 11.2 + f(3), file: "sparkle", volume: 0.35 },
  // the three numbered points
  { at: 12.6 + f(1), file: "boom", volume: 0.4 },
  { at: 14.9 + f(3), file: "pop2", volume: 0.35 },
  { at: 16.15 + f(1), file: "boom", volume: 0.4 },
  { at: 16.15 + f(8), file: "pop2", volume: 0.35 },
  { at: 20.7 + f(1), file: "boom", volume: 0.4 },
  { at: 20.7 + f(8), file: "pop2", volume: 0.35 },
  // lessons: two cards
  { at: 24.0 + f(3), file: "pop", volume: 0.4 },
  { at: 25.6 + f(1), file: "pop", volume: 0.4 },
  { at: 27.4 + f(1), file: "pop2", volume: 0.35 },
  // exercise sheets
  ...[0, 1, 2].map((i) => ({ at: 27.4 + f(4 + i * 4), file: "pop", volume: 0.3 })),
  // 17 counter + impact
  ...Array.from({ length: 9 }, (_, k) => ({ at: 29.5 + f(2 + k * 2), file: "blip", volume: 0.12 })),
  { at: 29.5 + f(20), file: "boom", volume: 0.45 },
  { at: 29.5 + f(21), file: "sparkle", volume: 0.35 },
  // soft tick for each new caption line
  ...CAPTIONS5.slice(1).map((c) => ({ at: c.start, file: "tick", volume: 0.1 })),
];
