// Video 7: "how to build your own study program" – paper style.
// The real room stays as the background; three full-screen paper cut-aways
// (3-4 s each, speaker hidden) at the key moments.
import type { Caption, Sfx } from "../script";

export const FPS7 = 30;
export const DURATION7 = 1084 / 30; // 36.13 s

// caption times snapped to the real pauses in his speech; shown a hair early
const CAPTIONS_RAW: Caption[] = [
  { start: 0.0, end: 1.64, text: "شفت هاد البروغرام", hl: ["البروغرام"] },
  { start: 1.7, end: 3.11, text: "اللي عطيناهولك؟" },
  { start: 3.36, end: 4.63, text: "راح تدي 16", hl: ["16"] },
  { start: 4.7, end: 6.43, text: "بارطاجي هاد الفيديو", hl: ["بارطاجي"] },
  { start: 6.52, end: 7.0, text: "لكاع صحابك", hl: ["صحابك"] },
  { start: 7.07, end: 8.14, text: "أبوني للكونت تاعي", hl: ["أبوني"] },
  { start: 8.23, end: 9.0, text: "يفيدك في كاع حياتك", hl: ["حياتك"] },
  { start: 9.03, end: 10.0, text: "وفي هاد الفيديو" },
  { start: 10.0, end: 11.06, text: "ما جيتش نعطيك بروغرام", hl: ["بروغرام"] },
  { start: 11.34, end: 12.82, text: "جيت نعلمك كيفاش تصنع" },
  { start: 12.89, end: 14.13, text: "بروغرام يليق بيك انتايا", hl: ["بيك"] },
  { start: 14.23, end: 15.55, text: "أول حاجة لازم تديرها", hl: ["أول"] },
  { start: 15.76, end: 17.22, text: "دير بروغرام على حساب المواد", hl: ["المواد"] },
  { start: 17.3, end: 18.84, text: "اللي عندك" },
  { start: 18.93, end: 20.28, text: "تمارين وتعلّمات", hl: ["تمارين"] },
  { start: 20.38, end: 21.33, text: "وثاني حاجة", hl: ["ثاني"] },
  { start: 21.39, end: 22.78, text: "المواد الصعيبة", hl: ["الصعيبة"] },
  { start: 22.86, end: 24.24, text: "ديرها في بداية النهار", hl: ["بداية"] },
  { start: 24.33, end: 26.26, text: "مثلا الماط والفيزيك والعلوم", hl: ["الماط"] },
  { start: 26.44, end: 27.6, text: "وثالث حاجة", hl: ["ثالث"] },
  { start: 27.72, end: 29.68, text: "كون واقعي في البروغرام", hl: ["واقعي"] },
  { start: 29.77, end: 32.07, text: "ماشي تحط مجهود", hl: ["مجهود"] },
  { start: 32.13, end: 33.22, text: "يعجّزك سوايع في النهار", hl: ["سوايع"] },
  { start: 33.32, end: 36.1, text: "بصح كي تقرا يومين ولا ثلاث أيام", hl: ["يومين"] },
];

const CAPTION_LEAD = 0.1;
export const CAPTIONS7: Caption[] = CAPTIONS_RAW.map((c) => ({ ...c, start: Math.max(0, c.start - CAPTION_LEAD), end: c.end - CAPTION_LEAD }));

// graphics land slightly before the words so the animation is readable on time
const SCENE_LEAD = 0.25;
const CUT_LEAD = 0.3;

export type SceneKind7 = "program" | "sixteen" | "share" | "follow" | "noready" | "point1" | "exercises" | "subjects" | "point3" | "hours";
export type Scene7 = { start: number; end: number; kind: SceneKind7; zoom: number };

// speaker scenes (the cut-aways cover 11.2-15.0, 20.3-24.0 and 33.2-end)
const SCENES_RAW: Scene7[] = [
  { start: 0.0, end: 3.25, kind: "program", zoom: 1.0 },
  { start: 3.25, end: 4.65, kind: "sixteen", zoom: 1.2 },
  { start: 4.65, end: 6.98, kind: "share", zoom: 1.0 },
  { start: 6.98, end: 9.0, kind: "follow", zoom: 1.0 },
  { start: 9.0, end: 11.2, kind: "noready", zoom: 1.14 },
  { start: 11.2, end: 15.0, kind: "noready", zoom: 1.0 },
  { start: 15.0, end: 18.9, kind: "point1", zoom: 1.0 },
  { start: 18.9, end: 20.3, kind: "exercises", zoom: 1.14 },
  { start: 20.3, end: 24.0, kind: "exercises", zoom: 1.0 },
  { start: 24.0, end: 26.4, kind: "subjects", zoom: 1.14 },
  { start: 26.4, end: 29.5, kind: "point3", zoom: 1.0 },
  { start: 29.5, end: 33.2, kind: "hours", zoom: 1.2 },
  { start: 33.2, end: DURATION7, kind: "hours", zoom: 1.0 },
];

export const SCENES7: Scene7[] = SCENES_RAW.map((x) => ({ ...x, start: Math.max(0, x.start - SCENE_LEAD), end: x.end >= DURATION7 - 0.01 ? x.end : x.end - SCENE_LEAD }));

export type CutKind = "planner" | "morning" | "quit";
const CUTS_RAW: { kind: CutKind; start: number; end: number }[] = [
  { kind: "planner", start: 11.2, end: 15.0 }, // "كيفاش تصنع بروغرام يليق بيك"
  { kind: "morning", start: 20.3, end: 24.0 }, // "المواد الصعيبة في بداية النهار"
  { kind: "quit", start: 33.2, end: DURATION7 }, // "كي تقرا يومين ولا ثلاث أيام"
];

export const CUTAWAYS = CUTS_RAW.map((c) => ({ ...c, start: c.start - CUT_LEAD, end: c.end >= DURATION7 - 0.01 ? c.end : c.end - CUT_LEAD }));

// MJ wipe into each cut-away; a page tear on the way out
export const WIPES7 = CUTAWAYS.map((c) => c.start);
export const WIPE_FRAMES = 24;
export const TEARS7 = CUTAWAYS.filter((c) => c.end < DURATION7 - 0.2).map((c) => c.end);

const f = (frames: number) => frames / FPS7;
const visibleScenes = SCENES7.filter((s) => !CUTAWAYS.some((c) => s.start >= c.start - 0.01 && s.start < c.end));

export const SFX7: Sfx[] = [
  { at: 0, file: "v7/riser", volume: 0.45 },
  ...WIPES7.flatMap((t) => [
    { at: t - f(12), file: "v6/mj_whoosh", volume: 0.9 },
    { at: t - f(10), file: "v6/paper_flip", volume: 0.55 },
    { at: t - f(2), file: "v6/mj_hit", volume: 0.75 },
  ]),
  ...TEARS7.flatMap((t) => [
    { at: t - f(8), file: "v6/paper_tear", volume: 0.8 },
    { at: t - f(2), file: "v6/paper_slide", volume: 0.5 },
  ]),
  // speaker scenes: zoom whoosh + stickers unfold + labels taped
  ...visibleScenes.slice(1).map((s, i) => ({ at: s.start - 0.04, file: i % 2 ? "whoosh_out" : "whoosh_in", volume: 0.35 })),
  ...visibleScenes.flatMap((s) => [
    { at: s.start + f(3), file: "v6/paper_fold", volume: 0.7 },
    { at: s.start + f(7), file: "v6/paper_rustle", volume: 0.6 },
    { at: s.start + f(12), file: "v6/paper_fold", volume: 0.5 },
  ]),
  // cut-aways: layers pop up one by one
  ...CUTAWAYS.flatMap((c) => [0, 1, 2, 3, 4, 5].map((i) => ({ at: c.start + f(6 + i * 5), file: "v6/paper_fold", volume: 0.5 }))),
  // 16 counter + impact
  ...Array.from({ length: 8 }, (_, k) => ({ at: 3.25 - SCENE_LEAD + f(2 + k * 2), file: "blip", volume: 0.12 })),
  { at: 3.25 - SCENE_LEAD + f(20), file: "boom", volume: 0.4 },
  { at: 3.25 - SCENE_LEAD + f(21), file: "sparkle", volume: 0.3 },
  // share: button tapped, planes fly out to friends
  { at: 4.65 - SCENE_LEAD + f(12), file: "click", volume: 0.5 },
  ...[0, 1, 2, 3].map((i) => ({ at: 4.65 - SCENE_LEAD + f(16 + i * 3), file: "v6/paper_slide", volume: 0.45 })),
  // follow: tap on "Follow" exactly on "أبوني", then hearts
  { at: 7.1, file: "click", volume: 0.55 },
  { at: 7.15, file: "ding", volume: 0.4 },
  // "not a ready-made program": red cross
  { at: 9.0 - SCENE_LEAD + f(14), file: "v6/paper_crumple", volume: 0.5 },
  // numbered points
  { at: 15.0 - SCENE_LEAD + f(1), file: "boom", volume: 0.35 },
  { at: 26.4 - SCENE_LEAD + f(1), file: "boom", volume: 0.35 },
  // hours: 10 h crossed, 2 h ticked
  { at: 29.5 - SCENE_LEAD + f(18), file: "v6/paper_crumple", volume: 0.5 },
  { at: 29.5 - SCENE_LEAD + f(40), file: "ding", volume: 0.3 },
  // soft rustle on each caption strip
  ...CAPTIONS7.slice(1).map((c) => ({ at: c.start, file: "v6/paper_rustle", volume: 0.22 })),
];
