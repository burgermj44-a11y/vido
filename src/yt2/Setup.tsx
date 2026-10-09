/* The paper study-room "setup" the camera travels through, and the tomato timer. */
import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { GOLD, HAND, INK, LEAF, TOMATO, icon, jitter, maskStyle, onTwos, stickerFilter, tex } from "./kit";

/* ---------------- tomato kitchen timer ---------------- */
export const TomatoTimer: React.FC<{ size: number; minutes: number; shake?: number; label?: string }> = ({ size, minutes, shake = 0, label }) => {
  const frame = useCurrentFrame();
  const rot = -minutes * 6; // dial: 6deg per minute, pointer fixed at top
  const s = shake ? Math.sin(frame * 2.6) * 4 * shake : 0;
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `rotate(${s}deg)` }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id="tomG" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#FF7A5C" />
            <stop offset="55%" stopColor={TOMATO} />
            <stop offset="100%" stopColor="#A9241A" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="190" rx="70" ry="9" fill="rgba(60,30,10,0.25)" />
        {/* white paper outline */}
        <path d="M100 26 C150 26 188 60 188 108 C188 158 150 186 100 186 C50 186 12 158 12 108 C12 60 50 26 100 26 Z" fill="#fff" />
        <path d="M100 32 C146 32 182 63 182 108 C182 154 146 180 100 180 C54 180 18 154 18 108 C18 63 54 32 100 32 Z" fill="url(#tomG)" />
        {/* dial band */}
        <g transform={`rotate(${rot} 100 108)`}>
          <circle cx="100" cy="108" r="56" fill="#FFF6E8" stroke="#E9D9BF" strokeWidth="3" />
          {Array.from({ length: 60 }, (_, i) => (
            <line
              key={i}
              x1="100"
              y1={108 - 54}
              x2="100"
              y2={108 - (i % 5 === 0 ? 44 : 49)}
              stroke={INK}
              strokeWidth={i % 5 === 0 ? 2.4 : 1.2}
              transform={`rotate(${i * 6} 100 108)`}
            />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <text key={i} x="100" y={108 - 32} textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill={INK} transform={`rotate(${i * 30} 100 108)`}>
              {i * 5}
            </text>
          ))}
          <circle cx="100" cy="108" r="14" fill={TOMATO} />
        </g>
        {/* pointer */}
        <path d="M100 46 L93 34 L107 34 Z" fill={INK} />
        {/* leaves */}
        <g transform="translate(100 34)">
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} d="M0 0 C6 -6 18 -6 26 -2 C16 2 8 4 0 0 Z" fill={LEAF} stroke="#2B6E27" strokeWidth="1.5" transform={`rotate(${a - 90}) scale(1 0.8)`} />
          ))}
          <rect x="-3" y="-16" width="6" height="14" rx="3" fill="#2B6E27" />
        </g>
        <ellipse cx="62" cy="70" rx="16" ry="9" fill="rgba(255,255,255,0.35)" transform="rotate(-30 62 70)" />
      </svg>
      {label && (
        <div style={{ position: "absolute", left: 0, right: 0, top: size * 1.0, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: size * 0.16, color: INK }}>{label}</div>
      )}
    </div>
  );
};

/* ---------------- the room (3840 x 2160 world units) ---------------- */
export const WORLD_W = 3840;
export const WORLD_H = 2160;

const Paper: React.FC<{ x: number; y: number; w: number; h: number; color: string; seed?: number; tx?: "white" | "kraft"; style?: React.CSSProperties; children?: React.ReactNode; radius?: number }> = ({
  x,
  y,
  w,
  h,
  color,
  seed = 1,
  tx: t = "white",
  style,
  children,
  radius = 0,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, filter: "drop-shadow(0 10px 12px rgba(50,30,10,0.3))", ...style }}>
    <div style={{ position: "absolute", inset: 0, background: color, borderRadius: radius, overflow: "hidden", ...(radius ? {} : maskStyle(seed)) }}>
      <Img src={tex(t)} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.55 }} />
    </div>
    {children}
  </div>
);

const Note: React.FC<{ x: number; y: number; rot: number; color: string; children: React.ReactNode; w?: number; h?: number }> = ({ x, y, rot, color, children, w = 300, h = 260 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` }}>
    <Paper x={0} y={0} w={w} h={h} color={color} seed={Math.round(x)}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>{children}</div>
    </Paper>
    <div style={{ position: "absolute", left: w / 2 - 16, top: -14, width: 32, height: 32, borderRadius: 16, background: "radial-gradient(circle at 35% 35%, #ff8a80, #c62828)", boxShadow: "0 4px 4px rgba(0,0,0,0.3)" }} />
  </div>
);

export const Room: React.FC<{ screenMinutes: number; goal17?: number }> = ({ screenMinutes, goal17 = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 40) * 2;
  const steam = (k: number) => (frame / 2 + k * 20) % 60;
  const mm = Math.floor(screenMinutes);
  const ss = Math.floor((screenMinutes - mm) * 60);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: WORLD_H }}>
      {/* wall */}
      <div style={{ position: "absolute", inset: 0, background: "#EED9B6" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.35 }} />
      </div>
      {/* wainscot stripes */}
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: i * 160 + 70, top: 0, width: 26, height: 1500, background: "rgba(255,255,255,0.18)" }} />
      ))}
      {/* window with night sky */}
      <Paper x={260} y={220} w={860} h={820} color="#FFFFFF" seed={2}>
        <div style={{ position: "absolute", left: 40, top: 40, right: 40, bottom: 40, background: "linear-gradient(180deg, #23305E 0%, #3C4F8F 60%, #F0A46B 100%)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 470, top: 90, width: 150, height: 150, borderRadius: 75, background: "#FFF3C4", boxShadow: "0 0 60px rgba(255,240,180,0.8)" }} />
          <div style={{ position: "absolute", left: 510, top: 70, width: 150, height: 150, borderRadius: 75, background: "#2C3A6E" }} />
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (i * 137) % 760,
                top: (i * 71) % 400,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: "#FFF6D0",
                opacity: 0.5 + 0.5 * Math.sin(frame / 10 + i),
              }}
            />
          ))}
          {/* city skyline */}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: i * 90, bottom: 0, width: 80, height: 120 + ((i * 53) % 160), background: "#1E2547" }}>
              {Array.from({ length: 4 }, (_, k) => (
                <div key={k} style={{ position: "absolute", left: 16 + (k % 2) * 30, top: 20 + Math.floor(k / 2) * 40, width: 14, height: 18, background: (i + k) % 3 ? "#FFD36B" : "#2F3A66" }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 425, top: 40, width: 14, bottom: 40, background: "#fff" }} />
        <div style={{ position: "absolute", left: 40, right: 40, top: 400, height: 14, background: "#fff" }} />
      </Paper>
      {/* curtains */}
      <Paper x={150} y={160} w={220} h={1000} color="#D9534F" seed={4} style={{ transform: `skewX(${sway * 0.4}deg)` }} />
      <Paper x={1010} y={160} w={220} h={1000} color="#D9534F" seed={5} style={{ transform: `skewX(${-sway * 0.4}deg)` }} />
      <div style={{ position: "absolute", left: 120, top: 140, width: 1140, height: 26, borderRadius: 13, background: "#6B4A2E" }} />
      {/* wall clock */}
      <div style={{ position: "absolute", left: 1520, top: 150, width: 260, height: 260 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#fff", border: "14px solid #2F2F35", boxShadow: "0 10px 14px rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", left: 124, top: 50, width: 12, height: 82, background: INK, borderRadius: 6, transformOrigin: "50% 100%", transform: `rotate(${frame * 0.5}deg)` }} />
        <div style={{ position: "absolute", left: 126, top: 34, width: 8, height: 98, background: TOMATO, borderRadius: 4, transformOrigin: "50% 100%", transform: `rotate(${onTwos(frame) * 6}deg)` }} />
        <div style={{ position: "absolute", left: 118, top: 118, width: 24, height: 24, borderRadius: 12, background: INK }} />
      </div>
      {/* shelf with books */}
      <div style={{ position: "absolute", left: 1350, top: 760, width: 900, height: 30, background: "#7A5235", boxShadow: "0 12px 10px rgba(0,0,0,0.25)" }} />
      {["#2B59C3", "#E8402F", "#FFC93C", "#3E9B3A", "#8E44AD", "#F28C28", "#1ABC9C", "#2F2F35", "#E84393"].map((c, i) => (
        <Paper key={i} x={1380 + i * 74 + (i > 5 ? 60 : 0)} y={760 - (230 + ((i * 37) % 70))} w={64} h={230 + ((i * 37) % 70)} color={c} seed={i + 7} radius={6}>
          <div style={{ position: "absolute", left: 10, right: 10, top: 30, height: 10, background: "rgba(255,255,255,0.6)" }} />
        </Paper>
      ))}
      <div style={{ position: "absolute", left: 2060, top: 600, transform: "rotate(-8deg)" }}>
        <Img src={icon("1f3c6")} style={{ width: 150, height: 150, filter: stickerFilter(5) }} />
      </div>
      {/* cork board */}
      <Paper x={2420} y={160} w={1220} h={980} color="#C99A63" seed={9} radius={18} style={{ border: "26px solid #7A5235" }}>
        <Note x={70} y={60} rot={-5} color="#FFF59D">
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 64, color: INK }}>25:00</div>
          <Img src={icon("1f345")} style={{ width: 90, height: 90 }} />
        </Note>
        <Note x={430} y={50} rot={4} color="#B3E5FC" w={340} h={300}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 52, color: INK }}>هدفي</div>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 120, color: TOMATO, lineHeight: 1, transform: `scale(${1 + goal17 * 0.15})` }}>17</div>
        </Note>
        <Note x={820} y={80} rot={-3} color="#C8E6C9" w={280} h={280}>
          <Img src={icon("1f1ee-1f1f9")} style={{ width: 120, height: 120 }} />
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 40, color: INK }}>إيطاليا</div>
        </Note>
        <Note x={90} y={430} rot={3} color="#FFFFFF" w={520} h={420}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 48, color: INK }}>جدول الجلسات</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 56px)", gap: 10, marginTop: 10 }}>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} style={{ width: 56, height: 56, border: `4px solid ${INK}`, borderRadius: 8, background: i < 15 ? "#FFCDD2" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i < 15 && <Img src={icon("1f345")} style={{ width: 40, height: 40 }} />}
              </div>
            ))}
          </div>
        </Note>
        <Note x={680} y={440} rot={-4} color="#FFE0B2" w={420} h={380}>
          <Img src={icon("1f4c5")} style={{ width: 130, height: 130 }} />
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 46, color: INK }}>BAC</div>
        </Note>
      </Paper>
      {/* desk */}
      <Paper x={-40} y={1480} w={3920} h={720} color="#B07A4F" seed={11} tx="kraft">
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, background: "rgba(255,255,255,0.18)" }} />
      </Paper>
      {/* plant */}
      <div style={{ position: "absolute", left: 360, top: 1060 }}>
        {[-40, -15, 10, 35, 60].map((a, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 150,
              top: 120,
              width: 70,
              height: 300,
              borderRadius: "50% 50% 10% 10%",
              background: i % 2 ? "#3E9B3A" : "#5DBB4F",
              transformOrigin: "50% 100%",
              transform: `translateY(-200px) rotate(${a + Math.sin(frame / 30 + i) * 2}deg)`,
              boxShadow: "inset -10px 0 0 rgba(0,0,0,0.1)",
            }}
          />
        ))}
        <Paper x={70} y={300} w={230} h={140} color="#E07A5F" seed={12} radius={20} />
      </div>
      {/* lamp */}
      <div style={{ position: "absolute", left: 900, top: 760 }}>
        <div style={{ position: "absolute", left: 140, top: 230, width: 26, height: 480, background: "#2F2F35", transformOrigin: "50% 100%", transform: "rotate(14deg)" }} />
        <div style={{ position: "absolute", left: 60, top: 160, width: 300, height: 160, background: GOLD, borderRadius: "150px 150px 20px 20px", transform: "rotate(-20deg)", boxShadow: "0 12px 12px rgba(0,0,0,0.25)" }} />
        <div style={{ position: "absolute", left: 40, top: 300, width: 520, height: 700, background: "radial-gradient(ellipse at 50% 0%, rgba(255,236,170,0.45), rgba(255,236,170,0) 70%)", transform: "rotate(-20deg)" }} />
        <div style={{ position: "absolute", left: 60, top: 700, width: 220, height: 30, background: "#2F2F35", borderRadius: 15 }} />
      </div>
      {/* monitor */}
      <div style={{ position: "absolute", left: 1500, top: 880 }}>
        <div style={{ position: "absolute", left: 360, top: 470, width: 120, height: 150, background: "#2F2F35" }} />
        <div style={{ position: "absolute", left: 250, top: 600, width: 340, height: 30, background: "#2F2F35", borderRadius: 14 }} />
        <div style={{ width: 840, height: 500, background: "#2F2F35", borderRadius: 26, padding: 22, boxShadow: "0 18px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 10, background: "linear-gradient(160deg, #FFF8EC, #FBE3D3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
            <TomatoTimer size={250} minutes={screenMinutes} />
            <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 120, color: INK, letterSpacing: -2 }}>
              {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
      {/* notebook + pencil */}
      <div style={{ position: "absolute", left: 1600, top: 1620, transform: "rotate(-4deg)" }}>
        <Paper x={0} y={0} w={420} h={300} color="#FFFFFF" seed={14} />
        <Paper x={420} y={0} w={420} h={300} color="#FFFFFF" seed={15} />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 470, top: 50 + i * 38, width: 300 - (i % 3) * 50, height: 6, background: "rgba(43,89,195,0.6)", borderRadius: 3 }} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 60, top: 50 + i * 38, width: 300 - (i % 2) * 70, height: 6, background: "rgba(31,31,36,0.45)", borderRadius: 3 }} />
        ))}
        <div style={{ position: "absolute", left: 417, top: 0, width: 6, height: 300, background: "rgba(0,0,0,0.15)" }} />
        <div style={{ position: "absolute", left: 640, top: 250, width: 360, height: 26, background: GOLD, borderRadius: 8, transform: "rotate(-24deg)", boxShadow: "0 6px 6px rgba(0,0,0,0.25)" }} />
      </div>
      {/* tomato timer on the desk */}
      <div style={{ position: "absolute", left: 2600, top: 1180, transform: `rotate(${jitter(frame, 3, 0.3)}deg)` }}>
        <TomatoTimer size={430} minutes={screenMinutes} />
      </div>
      {/* mug with steam */}
      <div style={{ position: "absolute", left: 3220, top: 1330 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ position: "absolute", left: 50 + k * 50, top: 40 - steam(k) * 2, width: 26, height: 70, borderRadius: 13, background: "rgba(255,255,255,0.6)", opacity: 1 - steam(k) / 60 }} />
        ))}
        <Paper x={0} y={120} w={230} h={250} color="#2B59C3" seed={16} radius={26}>
          <div style={{ position: "absolute", left: 50, top: 70, fontFamily: HAND, fontWeight: 700, fontSize: 70, color: "#fff" }}>MJ</div>
        </Paper>
        <div style={{ position: "absolute", left: 210, top: 170, width: 90, height: 130, border: "22px solid #2B59C3", borderRadius: 50 }} />
      </div>
      {/* phone face down */}
      <div style={{ position: "absolute", left: 3300, top: 1760, transform: "rotate(18deg)" }}>
        <div style={{ width: 230, height: 420, borderRadius: 34, background: "#2F2F35", boxShadow: "0 12px 14px rgba(0,0,0,0.35)", border: "6px solid #fff" }}>
          <div style={{ position: "absolute", left: 30, top: 30, width: 60, height: 60, borderRadius: 18, background: "#555" }} />
        </div>
      </div>
      {/* books stack */}
      <div style={{ position: "absolute", left: 760, top: 1660 }}>
        {["#3E9B3A", "#2B59C3", "#E8402F"].map((c, i) => (
          <Paper key={i} x={i * 14} y={-i * 70} w={480 - i * 30} h={70} color={c} seed={20 + i} radius={8}>
            <div style={{ position: "absolute", right: 20, top: 26, width: 160, height: 14, background: "rgba(255,255,255,0.7)", borderRadius: 7 }} />
          </Paper>
        ))}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(50,30,10,0.25) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: WORLD_H, pointerEvents: "none", opacity: interpolate(Math.sin(frame / 50), [-1, 1], [0.02, 0.05]), background: "#fff" }} />
    </div>
  );
};
