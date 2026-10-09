import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "../fonts";

// YouTube thumbnail for YT1 (render as a still at 1280x720)
export const YT1Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#EFE8D8" }}>
    <Img src={staticFile("yt1/paper_notebook.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(40,25,10,0.45) 100%)" }} />
    <div dir="rtl" style={{ position: "absolute", right: 50, top: 70, width: 760, textAlign: "right" }}>
      <div style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1.15, color: "#1F1F24", WebkitTextStroke: "0px" }}>
        راجع <span style={{ background: "linear-gradient(transparent 30%, #FFE14D 30%, #FFE14D 95%, transparent 95%)", padding: "0 10px" }}>بذكاء</span>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1.15, color: "#D7322F" }}>لا تنسَ شيئًا!</div>
      <div
        style={{
          display: "inline-block",
          marginTop: 26,
          fontFamily: FONT,
          fontSize: 40,
          color: "#fff",
          background: "#2B59C3",
          padding: "8px 26px 14px",
          borderRadius: 14,
          transform: "rotate(-2deg)",
        }}
      >
        طريقتان أثبتهما العلم
      </div>
    </div>
    <Img src={staticFile("yt1/img/1f9e0.svg")} style={{ position: "absolute", left: 90, top: 120, width: 330, height: 330, transform: "rotate(-10deg)", filter: "drop-shadow(8px 0 0 #fff) drop-shadow(-8px 0 0 #fff) drop-shadow(0 8px 0 #fff) drop-shadow(0 -8px 0 #fff) drop-shadow(0 14px 14px rgba(0,0,0,0.35))" }} />
    <Img src={staticFile("yt1/img/1f4c5.svg")} style={{ position: "absolute", left: 330, top: 400, width: 190, height: 190, transform: "rotate(12deg)", filter: "drop-shadow(6px 0 0 #fff) drop-shadow(-6px 0 0 #fff) drop-shadow(0 6px 0 #fff) drop-shadow(0 -6px 0 #fff) drop-shadow(0 10px 10px rgba(0,0,0,0.35))" }} />
    <div style={{ position: "absolute", left: 40, bottom: 30, fontFamily: FONT, fontSize: 76, letterSpacing: -3, background: "linear-gradient(180deg, #FFE68A 0%, #FFC93C 45%, #E09A00 100%)", WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}>
      MJ
    </div>
  </AbsoluteFill>
);
