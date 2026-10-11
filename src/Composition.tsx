import React, { useEffect, useState } from "react";
import { AbsoluteFill, Composition, Img, Html5Audio, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/cairo/arabic-900.css";
import "@fontsource/cairo/latin-900.css";
import "@fontsource/aref-ruqaa/arabic-700.css";
import "@fontsource/aref-ruqaa/latin-700.css";
import { BROLL, CUTS, DURATION, FPS, H, W } from "./config";
import { FOLLOW_AT, PERSON_AT, SHARE_AT } from "./script";
import { CaptionLayer, TopicStickers, TopicTitle } from "./Captions";
import { FollowCard, PersonSticker, ShareSticker } from "./stickers";
import { BrollScene } from "./Broll";
import { PaperTransition, TRANSITION_FRAMES } from "./Transition";
import { boil, rand } from "./paper";

const ZOOM = [1.0, 1.12, 1.0, 1.14, 1.04, 1.12, 1.0, 1.1, 1.0, 1.12];
const ORIGIN = ["50% 38%", "45% 35%", "55% 40%", "50% 33%", "50% 45%", "40% 38%", "60% 38%", "50% 36%", "50% 40%", "50% 36%"];

const sfx = (name: string, volume = 0.8) => <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />;

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load("900 40px Cairo", "هذا الإنسان 16"),
      document.fonts.load("700 40px 'Aref Ruqaa'", "قصة محمد"),
    ]).finally(() => continueRender(h));
  }, [h]);
};

export const MontageComposition: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const scene = CUTS.filter((c) => frame >= c.at).length;
  const start = scene === 0 ? 0 : CUTS[scene - 1].at;
  const local = frame - start;
  const punch = interpolate(local, [0, 9], [0.09, 0], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const zoom = ZOOM[scene] + punch + local * 0.0005;
  const jx = (rand(boil(frame, 4) + 3) - 0.5) * 4;
  const jy = (rand(boil(frame, 4) + 9) - 0.5) * 4;
  const inBroll = frame >= BROLL.from && frame < BROLL.to;
  const maskUrl = staticFile(`mask/${String(Math.min(frame, DURATION - 1)).padStart(4, "0")}.png`);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ width: W, height: H, transform: `translate(${jx}px,${jy}px) scale(${zoom})`, transformOrigin: ORIGIN[scene] }}>
          <OffthreadVideo src={staticFile("input.mp4")} style={{ width: W, height: H, objectFit: "cover" }} />
        </div>
      </div>

      {/* emoji + notes sit between the background and the speaker */}
      {!inBroll && <TopicStickers frame={frame} />}
      {!inBroll && <TopicTitle frame={frame} />}
      <Sequence from={SHARE_AT} durationInFrames={40} layout="none">
        <ShareSticker frame={frame - SHARE_AT} />
        {sfx("flap", 0.5)}
        <Sequence from={10}>{sfx("ding", 0.25)}</Sequence>
      </Sequence>
      <Sequence from={FOLLOW_AT} durationInFrames={58} layout="none">
        <FollowCard frame={frame - FOLLOW_AT} />
        {sfx("flap", 0.5)}
        <Sequence from={26}>{sfx("flap", 0.5)}</Sequence>
        <Sequence from={28}>{sfx("ding", 0.3)}</Sequence>
      </Sequence>


      {!inBroll && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div
            style={{
              width: W,
              height: H,
              transform: `translate(${jx}px,${jy}px) scale(${zoom})`,
              transformOrigin: ORIGIN[scene],
              WebkitMaskImage: `url(${maskUrl})`,
              maskImage: `url(${maskUrl})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              maskMode: "luminance",
            }}
          >
            <OffthreadVideo src={staticFile("input.mp4")} style={{ width: W, height: H, objectFit: "cover" }} />
          </div>
          {/* preloads the matte so it is ready when the frame is captured */}
          <Img src={maskUrl} style={{ position: "absolute", width: 2, height: 2, opacity: 0 }} />
        </div>
      )}

      {inBroll && <BrollScene frame={frame - BROLL.from} />}
      <CaptionLayer frame={frame} />

      {PERSON_AT.map((t, i) => (
        <Sequence key={t} from={t} durationInFrames={46} layout="none">
          <PersonSticker frame={frame - t} seed={i * 17} />
          {sfx("flap", 0.5)}
        </Sequence>
      ))}
      {CUTS.map((c, i) => {
        const s = c.at - TRANSITION_FRAMES / 2;
        return (
          <React.Fragment key={c.at}>
            <PaperTransition frame={frame - s} index={i} kind={c.kind} word={c.word} />
            <Sequence from={s} durationInFrames={34} layout="none">
              {sfx("tear1", 0.42)}
              <Sequence from={c.kind === "tear" ? 11 : 16}>{sfx("tear2", 0.3)}</Sequence>
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition id="Montage" component={MontageComposition} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
