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

export type Scene = { start: number; end: number; kind: SceneKind; zoom: number };

export const SCENES: Scene[] = [
  { start: 0.0, end: 1.95, kind: "grade", zoom: 1.0 },
  { start: 1.95, end: 6.05, kind: "books", zoom: 1.14 },
  { start: 6.05, end: 9.8, kind: "tips", zoom: 1.0 },
  { start: 9.8, end: 11.4, kind: "warning", zoom: 1.22 },
  { start: 11.4, end: 14.72, kind: "subscribe", zoom: 1.0 },
  { start: 14.72, end: 17.8, kind: "tip1", zoom: 1.14 },
  { start: 17.8, end: 23.1, kind: "goal", zoom: 1.04 },
];
