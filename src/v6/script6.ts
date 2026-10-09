// Video 6: paper-style version of video 5 (same clip, same transcript).
// Captions, scene timings and cutaways are shared with src/v5/script5.ts.
import type { Sfx } from "../script";
import { BROLLS5, CAPTIONS5, FPS5, SCENES5 } from "../v5/script5";

export const FPS6 = FPS5;
export const DURATION6 = 957 / 30;

// full-screen paper sheets sweep across at the big section changes
export const WIPES6 = [8.1, 12.6, 16.15, 20.7, 29.5];
export const WIPE_FRAMES = 18;

const f = (frames: number) => frames / FPS6;
const wipeAt = (t: number) => t - f(WIPE_FRAMES / 2);

export const SFX6: Sfx[] = [
  // opening riser + a page flip as the first sticker unfolds
  { at: 0, file: "v5/riser", volume: 0.45 },
  { at: f(2), file: "v6/paper_flip", volume: 0.7 },
  // paper sheet transitions
  ...WIPES6.map((t) => ({ at: wipeAt(t), file: "v6/paper_flip", volume: 0.9 })),
  // other scene cuts: a soft paper slide
  ...SCENES5.slice(1)
    .filter((s) => !WIPES6.some((w) => Math.abs(w - s.start) < 0.2) && !BROLLS5.some((b) => Math.abs(b.start - s.start) < 0.2))
    .map((s) => ({ at: s.start - 0.04, file: "v6/paper_slide", volume: 0.8 })),
  // cutaways: page slides in, tears away
  ...BROLLS5.flatMap((b) => [
    { at: b.start, file: "v6/paper_slide", volume: 0.9 },
    { at: b.start + f(6), file: "v6/paper_fold", volume: 0.6 },
    { at: b.end - 0.3, file: "v6/paper_tear", volume: 0.8 },
  ]),
  // every scene: stickers unfold, labels are taped on
  ...SCENES5.flatMap((s) => {
    const t0 = s.gfxStart ?? s.start;
    return [
      { at: t0 + f(3), file: "v6/paper_fold", volume: 0.7 },
      { at: t0 + f(7), file: "v6/paper_rustle", volume: 0.6 },
      { at: t0 + f(12), file: "v6/paper_fold", volume: 0.5 },
    ];
  }),
  // scenes fold closed at their end
  ...SCENES5.map((s) => ({ at: s.end - f(6), file: "v6/paper_rustle", volume: 0.45 })),
  // "nobody tells you" and "alone gives you nothing": crumple
  { at: 3.6 + f(10), file: "v6/paper_crumple", volume: 0.6 },
  { at: 18.4, file: "v6/paper_crumple", volume: 0.6 },
  // share: planes fly out
  ...[0, 1, 2, 3].map((i) => ({ at: 8.1 + f(16 + i * 3), file: "v6/paper_slide", volume: 0.45 })),
  // final grade: red pen circle + soft impact
  { at: 29.5 + f(20), file: "boom", volume: 0.35 },
  { at: 29.5 + f(24), file: "v6/paper_rustle", volume: 0.7 },
  // caption strips: a very soft rustle each line
  ...CAPTIONS5.slice(1).map((c) => ({ at: c.start, file: "v6/paper_rustle", volume: 0.25 })),
];
