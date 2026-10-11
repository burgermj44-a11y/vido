import { f } from "./config";

// Captions. {word} = yellow marker, [word] = blue text.
// Text comes from an automatic transcript of a Darija voice-over, so
// review it and fix any word that differs from what is said.
export type Caption = { from: number; to: number; text: string };
const c = (a: number, b: number, text: string): Caption => ({ from: f(a), to: f(b), text });

export const CAPTIONS: Caption[] = [
  c(0.15, 2.3, "هذا [الإنسان] هو أكبر تحفيز"),
  c(2.3, 3.7, "باش تدي {معدل 16}"),
  c(3.7, 5.0, "بلا ما [تتعب]"),
  c(5.0, 6.5, "[قصة] هذا الإنسان"),
  c(6.5, 7.7, "متنساش {بارطاجي}"),
  c(7.7, 9.6, "{ابوني} هذا الكونت [يفيدك] كاع حياتك"),
  c(9.9, 12.7, "هذا [الإنسان] صديقي اسمه {محمد}"),
  c(12.7, 15.5, "[المعدل] في الفصل الأول"),
  c(15.6, 19.8, "شاف [بابه] يدخل الدار {تعبان}"),
  c(20.4, 23.2, "بابا [وش بيك]؟ نقدر {نعاونك}؟"),
  c(27.0, 29.0, "وقرر باش [يعاون] بابا"),
  c(29.0, 32.2, "ودار [بروغرام] ويقرا {زوج سوايع} في اليوم"),
  c(32.6, 35.4, "بذكاء [ماشي بجهد]"),
  c(36.5, 39.3, "اكتبو لي [خطة] في الفيديو الجاي"),
  c(44.4, 47.4, "ربي [يوفقكم] إن شاء الله خوتي"),
];

export type Topic = {
  from: number;
  to: number;
  title: string;
  red?: boolean;
  stickers: { e: string; x: number; y: number; s?: number; r?: number }[];
  note?: string; // paper note, e.g. "16/20"
  noteFrom?: number;
};
const t = (a: number, b: number, o: Omit<Topic, "from" | "to">): Topic => ({
  from: f(a), to: f(b), ...o,
});

// Top paper tag + stickers around the speaker.
export const TOPICS: Topic[] = [
  t(0.2, 4.9, {
    title: "التحفيز",
    stickers: [
      { e: "🔥", x: 70, y: 300, s: 150, r: -12 },
      { e: "📈", x: 800, y: 330, s: 140, r: 10 },
    ],
    note: "16/20",
    noteFrom: 2.3,
  }),
  t(5.0, 6.5, {
    title: "قصة",
    stickers: [
      { e: "📖", x: 780, y: 300, s: 150, r: 8 },
      { e: "✨", x: 80, y: 340, s: 120, r: -10 },
    ],
  }),
  t(9.9, 15.4, {
    title: "محمد",
    stickers: [
      { e: "🎓", x: 780, y: 300, s: 150, r: 10 },
      { e: "📚", x: 70, y: 330, s: 140, r: -12 },
    ],
  }),
  t(15.6, 19.9, {
    title: "بابا تعبان",
    red: true,
    stickers: [
      { e: "😔", x: 760, y: 320, s: 150, r: 8 },
      { e: "🏠", x: 70, y: 330, s: 140, r: -10 },
    ],
  }),
  t(20.3, 26.6, {
    title: "نقدر نعاونك",
    stickers: [
      { e: "🤝", x: 780, y: 300, s: 150, r: 8 },
      { e: "❤️", x: 70, y: 340, s: 130, r: -12 },
    ],
  }),
  t(27.0, 29.0, {
    title: "القرار",
    stickers: [
      { e: "💪", x: 780, y: 300, s: 150, r: 10 },
      { e: "💡", x: 70, y: 330, s: 140, r: -10 },
    ],
  }),
  t(32.6, 36.2, {
    title: "بذكاء ماشي بجهد",
    stickers: [
      { e: "🧠", x: 780, y: 310, s: 150, r: 8 },
      { e: "⚡", x: 70, y: 340, s: 130, r: -12 },
    ],
  }),
  t(36.5, 39.3, {
    title: "الفيديو الجاي",
    stickers: [
      { e: "📝", x: 780, y: 300, s: 150, r: 10 },
      { e: "👇", x: 70, y: 340, s: 130, r: -8 },
    ],
  }),
  t(44.3, 47.4, {
    title: "ربي يوفقكم",
    stickers: [
      { e: "🤲", x: 780, y: 300, s: 150, r: 8 },
      { e: "🌟", x: 70, y: 340, s: 130, r: -12 },
    ],
  }),
];

// "هذا الإنسان": paper person with a bar over the eyes.
export const PERSON_AT = [0.2, 8.95].map(f);
// "بارطاجي": share sticker. "ابوني": profile card.
export const SHARE_AT = f(6.5);
export const FOLLOW_AT = f(7.7);
