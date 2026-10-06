import { continueRender, delayRender, staticFile } from "remotion";

const faces: [string, string, string][] = [
  ["CairoBlack", "cairo-latin-900-normal.woff2", "U+0000-00FF"],
  [
    "CairoBlack",
    "cairo-arabic-900-normal.woff2",
    "U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F",
  ],
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading Cairo font");
  Promise.all(
    faces.map(([family, file, range]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, {
        unicodeRange: range,
        weight: "900",
      });
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};

export const FONT = '"CairoBlack", sans-serif';
