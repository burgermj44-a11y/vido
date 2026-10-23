// YT6 content: one beat per spoken line (times in seconds of public/yt6/voice.wav).
import type { POSES } from "../mascot/Owl";

export type Beat = {
  start: number;
  end: number;
  en: string; // what he says (English captions)
  ar: string; // Arabic translation on the paper strip
  kind: "title" | "emoji" | "vs" | "steps" | "number" | "quote" | "word";
  pose?: keyof typeof POSES;
  big?: string;
  keys?: string[];
  emoji?: string[];
  labels?: string[];
  value?: number;
  unit?: string;
  sfx?: string | null;
};

export const SECTIONS: { at: number; title: string; pal: "gold" | "blue" | "pink" | "green" | "purple" | "night" }[] = [{ at: 0, title: "Intro", pal: "gold" }];

export const PROMO_AT = 60;

export const BEATS: Beat[] = [{ start: 0, end: 2, en: "Work in progress", ar: "قيد الإنجاز", kind: "title", big: "Work in progress" }];

export const THUMB = { lines: [{ text: "WIP", size: 120, gold: false }], emoji: [] as string[] };
