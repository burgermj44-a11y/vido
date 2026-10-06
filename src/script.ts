// Transcript of the clip (Algerian Darija), split into caption chunks.
// Times are in seconds. `hl` marks words to highlight.
export type Caption = { start: number; end: number; text: string; hl?: string[] };

export const CAPTIONS: Caption[] = [
  { start: 0.0, end: 0.85, text: "راح نوريلك" },
  { start: 0.9, end: 1.95, text: "كيفاش تضمن معدل 12", hl: ["تضمن", "12"] },
  { start: 1.95, end: 3.1, text: "قبل ما تدخل تقرا", hl: ["تقرا"] },
  { start: 3.25, end: 4.55, text: "ديجا غير تبدا تقرا" },
  { start: 4.55, end: 5.3, text: "عارف روحك فيها 12", hl: ["12"] },
  { start: 5.3, end: 6.05, text: "وإذا بغيت زيد", hl: ["زيد"] },
  { start: 6.1, end: 7.6, text: "راح نعطيك 3 نصائح", hl: ["3", "نصائح"] },
  { start: 7.6, end: 8.6, text: "لازم تخدم بيهم", hl: ["لازم"] },
  { start: 8.6, end: 9.8, text: "إذا ما خدمتش بيهم" },
  { start: 9.8, end: 10.55, text: "ما كش حتديها", hl: ["حتديها"] },
  { start: 10.55, end: 11.4, text: "شوف قبل ما" },
  { start: 11.4, end: 13.0, text: "نقولك هاذ النصائح", hl: ["النصائح"] },
  { start: 13.0, end: 14.65, text: "ما تنساش تشترك في القناة", hl: ["تشترك"] },
  { start: 14.8, end: 16.45, text: "أول نصيحة", hl: ["أول"] },
  { start: 16.6, end: 17.8, text: "وهي مهمة بزاف", hl: ["بزاف"] },
  { start: 17.8, end: 20.4, text: "لازم يكون عندك الهدف تاعك", hl: ["الهدف"] },
  { start: 20.4, end: 21.7, text: "واش حاب دير" },
  { start: 21.7, end: 23.08, text: "والنتيجة اللي حاب توصلها", hl: ["توصلها"] },
];

// Visual scenes (images / graphics) that follow what is being said.
export type SceneKind =
  | "grade"
  | "books"
  | "tips"
  | "warning"
  | "subscribe"
  | "tip1"
  | "goal";

export type Scene = {
  start: number;
  end: number;
  kind: SceneKind;
  zoom: number;
  // when the graphics start (defaults to `start`), e.g. after a B-roll cutaway
  gfxStart?: number;
};

export const SCENES: Scene[] = [
  { start: 0.0, end: 1.95, kind: "grade", zoom: 1.0 },
  { start: 1.95, end: 6.05, kind: "books", zoom: 1.14, gfxStart: 3.15 },
  { start: 6.05, end: 9.8, kind: "tips", zoom: 1.0 },
  { start: 9.8, end: 11.4, kind: "warning", zoom: 1.22 },
  { start: 11.4, end: 14.72, kind: "subscribe", zoom: 1.0 },
  { start: 14.72, end: 17.8, kind: "tip1", zoom: 1.14 },
  { start: 17.8, end: 21.75, kind: "goal", zoom: 1.04, gfxStart: 19.4 },
];

// Full-screen illustrated cutaways that show what is being talked about.
export type Broll = { start: number; end: number; img: string; tag: string };

export const BROLLS: Broll[] = [
  { start: 1.95, end: 3.15, img: "exam-prep", tag: "📚 الدراسة" },
  { start: 7.6, end: 8.85, img: "road-to-knowledge", tag: "✅ طبّق النصائح" },
  { start: 17.8, end: 19.4, img: "target", tag: "🎯 الهدف" },
  { start: 21.75, end: 23.1, img: "education", tag: "🎓 النتيجة" },
];

// Sound effects (files in public/sfx).
export type Sfx = { at: number; file: string; volume: number };

export const SFX: Sfx[] = [
  // grade card
  { at: 0.05, file: "pop", volume: 0.5 },
  { at: 0.45, file: "pop", volume: 0.35 },
  { at: 1.25, file: "sparkle", volume: 0.35 },
  // b-roll swipes in and out
  ...BROLLS.flatMap((b) => [
    { at: b.start, file: "swipe", volume: 0.55 },
    { at: b.end - 0.25, file: "whoosh_out", volume: 0.4 },
  ]),
  // books
  { at: 3.2, file: "pop", volume: 0.45 },
  // zoom cuts
  { at: 6.0, file: "whoosh_out", volume: 0.45 },
  { at: 9.75, file: "whoosh_in", volume: 0.5 },
  { at: 11.35, file: "whoosh_out", volume: 0.45 },
  { at: 14.67, file: "whoosh_in", volume: 0.5 },
  // three bulbs
  { at: 6.05 + 6 / 24, file: "pop", volume: 0.45 },
  { at: 6.05 + 15 / 24, file: "pop", volume: 0.45 },
  { at: 6.05 + 24 / 24, file: "pop", volume: 0.45 },
  // warning
  { at: 9.8, file: "boom", volume: 0.6 },
  // subscribe
  { at: 11.45, file: "pop", volume: 0.45 },
  { at: 13.5, file: "click", volume: 0.7 },
  { at: 13.55, file: "ding", volume: 0.35 },
  // tip 1
  { at: 14.8, file: "sparkle", volume: 0.35 },
  // goal: rocket flies and hits the target
  { at: 19.4 + 6 / 24, file: "whoosh_in", volume: 0.45 },
  { at: 19.4 + 22 / 24, file: "boom", volume: 0.5 },
  { at: 19.4 + 24 / 24, file: "sparkle", volume: 0.3 },
];
