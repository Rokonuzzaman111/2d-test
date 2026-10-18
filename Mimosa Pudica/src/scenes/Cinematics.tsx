import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { colors } from "../styles/theme";
import { ParallaxCamera, ParallaxPlane, wobble } from "../components/Realism";

/* ============================================================
   CINEMATIC DIRECTOR LAYER
   Adds true-camera behaviour on top of every scene:
   - CameraRig: dolly-in / pull-out / crane moves + focal zoom
     (applied OUTSIDE Frame so HUD stays rock-steady = pro look)
   - RackFocus: depth-of-field rack focus between near & far planes
   - LetterboxBars: optional scope bars for the mystery opening
   ============================================================ */

export type CamMove =
  | "pushIn"
  | "pullOut"
  | "craneUp"
  | "driftLeft"
  | "orbitRight"
  | "macroPush";

const moveMap: Record<
  CamMove,
  { scale: [number, number]; tx: [number, number]; ty: [number, number] }
> = {
  pushIn: { scale: [1.0, 1.14], tx: [0, -18], ty: [0, -30] },
  macroPush: { scale: [1.06, 1.26], tx: [40, -70], ty: [30, -60] },
  pullOut: { scale: [1.16, 1.0], tx: [-14, 0], ty: [-24, 0] },
  craneUp: { scale: [1.05, 1.08], tx: [0, 0], ty: [26, -14] },
  driftLeft: { scale: [1.04, 1.07], tx: [24, -16], ty: [0, 8] },
  orbitRight: { scale: [1.05, 1.1], tx: [-26, 22], ty: [6, -6] },
};

/**
 * Wraps the scene content (behind Frame's HUD) with a virtual camera.
 * `dur` is the scene length in frames; moves ease with slow-in/slow-out
 * like a real dolly operator, plus handheld breathing.
 */
export const CameraRig = ({
  children,
  move = "pushIn",
  dur = 300,
  parallax = false,
}: {
  children: React.ReactNode;
  move?: CamMove;
  dur?: number;
  parallax?: boolean;
}) => {
  const f = useCurrentFrame();
  const m = moveMap[move];
  // smoothstep over the whole scene — never linear
  const t = interpolate(f, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = t * t * (3 - 2 * t);
  // settle spring at cut-in: cameras don't start instantly
  const settle = spring({ frame: f, fps: 30, config: { damping: 18, stiffness: 60 } });
  const s =
    interpolate(eased, [0, 1], m.scale) *
    interpolate(settle, [0, 1], [0.985, 1]);
  const tx = interpolate(eased, [0, 1], m.tx) + wobble(f, 0.25, 7) * 2.2;
  const ty = interpolate(eased, [0, 1], m.ty) + wobble(f, 0.2, 3) * 1.6;
  const rot = move === "orbitRight" ? wobble(f, 0.18, 9) * 0.6 : wobble(f, 0.15, 5) * 0.25;

  const camStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: `translate(${tx}px, ${ty}px) scale(${s}) rotate(${rot}deg)`,
    transformOrigin: "50% 45%",
    willChange: "transform",
  };

  if (!parallax) return <div style={camStyle}>{children}</div>;

  // Multi-plane parallax version: background layers lag behind foreground
  return (
    <ParallaxCamera amount={move === "macroPush" ? 1.6 : 1}>
      <ParallaxPlane depth={-2.2}>
        <div style={camStyle}>{children}</div>
      </ParallaxPlane>
    </ParallaxCamera>
  );
};

/**
 * Rack focus: blurs the scene then sharpens onto the subject,
 * or shifts focus mid-scene (foreground → background).
 */
export const RackFocus = ({
  children,
  fromBlur = 10,
  startFrame = 0,
  endFrame = 40,
  midBlurFrame,
  toBlur = 8,
}: {
  children: React.ReactNode;
  fromBlur?: number;
  startFrame?: number;
  endFrame?: number;
  midBlurFrame?: number; // if set, focus racks AWAY again at this frame
  toBlur?: number;
}) => {
  const f = useCurrentFrame();
  let blur = interpolate(f, [startFrame, endFrame], [fromBlur, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (midBlurFrame !== undefined) {
    blur = interpolate(
      f,
      [startFrame, endFrame, midBlurFrame, midBlurFrame + 45],
      [fromBlur, 0, 0, toBlur],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  }
  return (
    <AbsoluteFill style={{ filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

/** Subtle anamorphic bars that breathe — used only in the opening mystery. */
export const LetterboxBars = ({ appear = true, h = 64 }: { appear?: boolean; h?: number }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f, fps: 30, config: { damping: 20, stiffness: 70 } });
  const off = appear ? interpolate(p, [0, 1], [h, 0]) : 0;
  const wob = Math.sin(f / 200) * 2;
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          transform: `translateY(${-h + off + wob}px)`,
          background: "#000",
          zIndex: 40,
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          transform: `translateY(${1920 - (h - off) - wob}px)`,
          height: h,
          background: "#000",
          zIndex: 40,
        }}
      />
    </>
  );
};

/** Quick exposure "breath" flash layered over a scene (light flicker as signal fires). */
export const ExposurePulse = ({
  atFrame,
  strength = 0.22,
  color = "#FFE9B8",
}: {
  atFrame: number;
  strength?: number;
  color?: string;
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [atFrame, atFrame + 4, atFrame + 26], [0, strength, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", background: color, opacity: o, mixBlendMode: "soft-light" }}
    />
  );
};

/** A drifting blurred leaf silhouette crossing the lens — instant macro-cinema. */
export const ForegroundLeafPass = ({
  startFrame,
  dur = 70,
  tint = colors.forestGreen,
}: {
  startFrame: number;
  dur?: number;
  tint?: string;
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [startFrame, startFrame + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (t <= 0 || t >= 1) return null;
  const x = interpolate(t, [0, 1], [-420, 1300]);
  const y = interpolate(t, [0, 1], [1500, 900]);
  const r = interpolate(t, [0, 1], [40, -30]);
  const o = Math.sin(t * Math.PI) * 0.5;
  return (
    <svg
      width="1080"
      height="1920"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: o }}
    >
      <g transform={`translate(${x} ${y}) rotate(${r}) scale(3.4)`} style={{ filter: "blur(9px)" }}>
        <path
          d="M0,0 C26,-14 60,-10 84,10 C58,30 22,30 0,0 Z M0,0 L-26,-6"
          fill={tint}
          opacity={0.85}
        />
      </g>
    </svg>
  );
};
