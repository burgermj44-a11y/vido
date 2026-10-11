import React from "react";
import {
  AbsoluteFill,
  Composition,
  Html5Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CUTS, DURATION, FPS, H, INTERSTITIALS, PALETTE, TRIGGERS, W } from "./config";
import { FONT, PaperBackground, Tape, boil, rand } from "./paper";
import { PaperTransition, TRANSITION_FRAMES } from "./Transition";
import { FollowCard, PersonSticker, ShareSticker } from "./stickers";

const SCENE_ZOOM = [1.0, 1.16, 1.04, 1.2, 1.0, 1.14, 1.06, 1.0];
const SCENE_ROT = [-1.2, 1.4, -0.8, 1.6, -1.5, 1.0, -1.0, 0.6];
const SCENE_ORIGIN = ["50% 40%", "40% 35%", "60% 45%", "50% 30%", "50% 50%", "35% 40%", "65% 40%", "50% 40%"];

const sfx = (name: string, volume = 1) => (
  <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
);

export const MontageComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = CUTS.filter((c) => frame >= c).length;
  const sceneStart = scene === 0 ? 0 : CUTS[scene - 1];
  const local = frame - sceneStart;

  // Punch-in right after every cut, then a slow push.
  const punch = interpolate(local, [0, 10], [0.1, 0], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const push = local * 0.0006;
  const zoom = SCENE_ZOOM[scene] + punch + push;
  const jx = (rand(boil(frame, 4) + 3) - 0.5) * 5;
  const jy = (rand(boil(frame, 4) + 9) - 0.5) * 5;
  const rot = SCENE_ROT[scene] + (rand(boil(frame, 6) + scene) - 0.5) * 0.5;
  const settle = interpolate(local, [0, 8], [1.05, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <PaperBackground frame={frame} />

      {/* video card */}
      <div
        style={{
          position: "absolute",
          left: (W - 928) / 2 + jx,
          top: (H - 1628) / 2 + jy,
          width: 928,
          height: 1628,
          padding: 14,
          background: "#fff",
          boxShadow: "16px 22px 0 rgba(0,0,0,0.28)",
          transform: `rotate(${rot}deg) scale(${settle})`,
        }}
      >
        <div style={{ width: 900, height: 1600, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: `scale(${zoom})`,
              transformOrigin: SCENE_ORIGIN[scene],
            }}
          >
            <OffthreadVideo
              src={staticFile("input.mp4")}
              style={{ width: 900, height: 1600, objectFit: "cover" }}
            />
          </div>
        </div>
        <Tape style={{ left: -50, top: -14, transform: "rotate(-38deg)" }} />
        <Tape style={{ right: -50, bottom: -14, transform: "rotate(-38deg)" }} />
      </div>

      {/* mj tag, always visible */}
      <div
        style={{
          position: "absolute",
          left: 44,
          top: 40,
          background: PALETTE.red,
          color: PALETTE.paper,
          border: "8px solid #fff",
          borderRadius: 999,
          padding: "2px 34px 10px",
          fontWeight: 900,
          fontSize: 76,
          letterSpacing: -4,
          transform: `rotate(${-6 + (boil(frame, 6) % 2)}deg)`,
          boxShadow: "6px 8px 0 rgba(0,0,0,0.28)",
        }}
      >
        mj
      </div>

      {/* word / action stickers */}
      {TRIGGERS.person.map((t, i) => (
        <Sequence key={t} from={t} durationInFrames={50} layout="none">
          <PersonSticker frame={frame - t} seed={i * 17} />
          {sfx("pop", 0.9)}
        </Sequence>
      ))}
      <Sequence from={TRIGGERS.share} durationInFrames={66} layout="none">
        <ShareSticker frame={frame - TRIGGERS.share} />
        {sfx("pop", 0.9)}
        <Sequence from={14}>{sfx("ding", 0.7)}</Sequence>
      </Sequence>
      <Sequence from={TRIGGERS.follow} durationInFrames={DURATION - TRIGGERS.follow} layout="none">
        <FollowCard frame={frame - TRIGGERS.follow} />
        {sfx("whoosh", 0.6)}
        <Sequence from={38}>{sfx("pop", 0.9)}</Sequence>
        <Sequence from={40}>{sfx("ding", 0.8)}</Sequence>
      </Sequence>

      {/* transitions + their sound design */}
      {CUTS.map((c, i) => {
        const start = c - TRANSITION_FRAMES / 2;
        return (
          <React.Fragment key={c}>
            <PaperTransition frame={frame - start} index={i} word={INTERSTITIALS[i]} />
            <Sequence from={start} durationInFrames={30} layout="none">
              {sfx("whoosh", 0.85)}
              <Sequence from={4}>{sfx("rip", 0.8)}</Sequence>
              <Sequence from={9}>{sfx("tick", 0.9)}</Sequence>
              <Sequence from={12}>{sfx("thud", 0.7)}</Sequence>
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition
    id="Montage"
    component={MontageComposition}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
