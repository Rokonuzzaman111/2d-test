import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";

/* ============================================================
   REALISM TOOLKIT — shared photoreal building blocks
   - deterministic pseudo-random helpers (frame-safe)
   - SVG filter libraries (skin pores, leaf veins, bark, water)
   - film grain + lens dirt + vignette overlays
   - god rays / volumetric light shafts
   - parallax camera wrapper (fake multi-plane 3D depth)
   Everything is frame-deterministic so renders are reproducible.
   ============================================================ */

/** Deterministic hash-based noise in [0,1). Stable across frames. */
export const nrand = (seed: string): number => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

/** Smooth organic wobble: layered sines with irrational-ish ratios. */
export const wobble = (f: number, speed = 1, seed = 0): number => {
  const t = f / 60 + seed;
  return (
    Math.sin(t * 1.0 * speed) * 0.55 +
    Math.sin(t * 1.618 * speed + 1.3) * 0.3 +
    Math.sin(t * 2.71 * speed + 4.1) * 0.15
  );
};

/** Slow breathing scale for living things. */
export const breathe = (f: number, periodSec = 4, amp = 0.012): number =>
  1 + Math.sin((f / 30) * Math.PI * (periodSec / 2)) * amp;

/** Tiny per-frame jitter that stays sub-pixel (micro-tremor of life). */
export const microTremor = (f: number, amp = 0.35, seed = "a"): number =>
  wobble(f * 0.35, 3.2, nrand(seed) * 10) * amp;

/* ------------------------------------------------------------
   SVG FILTER LIBRARY
   Give each usage a unique `idPrefix` to avoid DOM id clashes.
   ------------------------------------------------------------ */

type FilterLibProps = { idPrefix: string };

/** Photographic filters: skin subsurface, pore noise, specular sheen. */
export const SkinFilters = ({ idPrefix }: FilterLibProps) => (
  <defs>
    {/* Soft skin shading gradient */}
    <linearGradient id={`${idPrefix}-skinBase`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EFC1A0" />
      <stop offset="45%" stopColor="#DFA07B" />
      <stop offset="100%" stopColor="#B87A56" />
    </linearGradient>
    <radialGradient id={`${idPrefix}-skinTip`} cx="0.35" cy="0.3" r="0.9">
      <stop offset="0%" stopColor="#F6D3B4" />
      <stop offset="60%" stopColor="#DEA47E" />
      <stop offset="100%" stopColor="#A9694A" />
    </radialGradient>
    {/* Fingernail: keratin plate with lunula + translucent edge */}
    <linearGradient id={`${idPrefix}-nail`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#F8E9DF" />
      <stop offset="55%" stopColor="#EBD2C2" />
      <stop offset="100%" stopColor="#D9B7A2" />
    </linearGradient>
    {/* Pores + fine wrinkles via fractal noise displaced lighting */}
    <filter id={`${idPrefix}-pores`} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.9"
        numOctaves={3}
        seed={7}
        result="noise"
      />
      <feDiffuseLighting
        in="noise"
        lightingColor="#ffffff"
        surfaceScale={1.1}
        diffuseConstant={1.05}
        result="lit"
      >
        <feDistantLight azimuth={235} elevation={42} />
      </feDiffuseLighting>
      <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="0.9" k2="0.25" k3="0.1" k4="0" result="tex" />
      <feGaussianBlur in="tex" stdDeviation="0.25" />
    </filter>
    {/* Specular sheen highlight on skin */}
    <filter id={`${idPrefix}-sheen`}>
      <feGaussianBlur stdDeviation="6" />
    </filter>
    {/* Warm subsurface glow at thin tissue (nail bed, fingertip) */}
    <radialGradient id={`${idPrefix}-subsurface`} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stopColor="#FF9E7A" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#FF9E7A" stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** Botanical filters: leaf cuticle gloss, vein emboss, hairy trichomes. */
export const LeafFilters = ({ idPrefix }: FilterLibProps) => (
  <defs>
    <filter id={`${idPrefix}-cuticle`} x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={11} result="bump" />
      <feDiffuseLighting in="bump" lightingColor="#ffffff" surfaceScale={2.2} diffuseConstant={1.15} result="light">
        <feDistantLight azimuth={215} elevation={55} />
      </feDiffuseLighting>
      <feComposite in="light" in2="SourceGraphic" operator="arithmetic" k1="0.85" k2="0.3" k3="0" k4="0" />
    </filter>
    <filter id={`${idPrefix}-softshadow`} x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="2" dy="6" stdDeviation="5" floodColor="#04140c" floodOpacity="0.55" />
    </filter>
    <linearGradient id={`${idPrefix}-leafGrad`} x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stopColor="#63C68F" />
      <stop offset="45%" stopColor="#3E9463" />
      <stop offset="100%" stopColor="#1E5236" />
    </linearGradient>
    <linearGradient id={`${idPrefix}-leafBack`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2F6B49" />
      <stop offset="100%" stopColor="#143724" />
    </linearGradient>
    <radialGradient id={`${idPrefix}-specular`} cx="0.3" cy="0.25" r="0.6">
      <stop offset="0%" stopColor="#EAFFF4" stopOpacity={0.75} />
      <stop offset="35%" stopColor="#EAFFF4" stopOpacity={0.18} />
      <stop offset="100%" stopColor="#EAFFF4" stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** Water / ion / cell-membrane gradients and caustics filter. */
export const WaterFilters = ({ idPrefix }: FilterLibProps) => (
  <defs>
    <radialGradient id={`${idPrefix}-vacuole`} cx="0.42" cy="0.38" r="0.75">
      <stop offset="0%" stopColor="#BDEBFF" stopOpacity={0.95} />
      <stop offset="45%" stopColor="#5BC6EC" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#1B6E96" stopOpacity={0.9} />
    </radialGradient>
    <radialGradient id={`${idPrefix}-droplet`} cx="0.35" cy="0.3" r="0.8">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.95} />
      <stop offset="30%" stopColor="#CFF1FF" stopOpacity={0.6} />
      <stop offset="80%" stopColor="#6FB9DE" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#2A6E92" stopOpacity={0.5} />
    </radialGradient>
    <filter id={`${idPrefix}-caustic`} x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves={2} seed={3} result="t">
        <animate attributeName="baseFrequency" dur="20s" values="0.018 0.03;0.022 0.035;0.018 0.03" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="t" scale={7} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

/* ------------------------------------------------------------
   Overlays: film grain, vignette, chromatic edge, dust motes
   ------------------------------------------------------------ */

export const FilmGrain = ({ intensity = 0.05 }: { intensity?: number }) => {
  const f = useCurrentFrame();
  // Re-seed turbulence every few frames -> moving grain like real film
  const seed = 1 + (Math.floor(f / 2) % 90);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intensity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const CinematicVignette = ({ strength = 0.5 }: { strength?: number }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 48%, transparent 52%, rgba(2,10,6,${strength * 0.5}) 82%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Subtle RGB fringing at the frame edges, like real lenses. */
export const ChromaticEdge = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        boxShadow: "inset 14px 0 60px -30px rgba(255,60,60,0.16), inset -14px 0 60px -30px rgba(60,120,255,0.16)",
      }}
    />
  </AbsoluteFill>
);

/** Blurred foreground bokeh specks drifting close to the lens. */
export const ForegroundBokeh = ({ count = 7, tint = "#9BE8C8" }: { count?: number; tint?: string }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const sd = `bokeh-${i}`;
        const x0 = random(sd + "x") * 100;
        const y0 = random(sd + "y") * 100;
        const size = 26 + random(sd + "s") * 60;
        const driftX = (random(sd + "dx") - 0.5) * 22;
        const driftY = -10 - random(sd + "dy") * 25;
        const ph = random(sd + "ph") * Math.PI * 2;
        const x = x0 + driftX * t + Math.sin(f / (fps * 3) + ph) * 1.2;
        const y = y0 + driftY * t + Math.cos(f / (fps * 4) + ph) * 1.0;
        const op = 0.05 + random(sd + "o") * 0.09;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, ${tint}CC, ${tint}22 60%, transparent 75%)`,
              filter: "blur(6px)",
              opacity: op,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** God-rays: soft rotating light shafts from an anchor point. */
export const GodRays = ({
  xPct = 78,
  yPct = 8,
  color = "#FFE9B8",
  rays = 9,
  opacity = 0.12,
}: {
  xPct?: number;
  yPct?: number;
  color?: string;
  rays?: number;
  opacity?: number;
}) => {
  const f = useCurrentFrame();
  const rot = f * 0.02;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `${xPct}%`,
          top: `${yPct}%`,
          width: 2400,
          height: 2400,
          transform: `translate(-50%,-50%) rotate(${rot}deg)`,
          background: `repeating-conic-gradient(from 0deg at 50% 50%, ${color}00 0deg, ${color}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")} 3deg, ${color}00 7deg, ${color}00 ${360 / rays}deg)`,
          maskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 0%, transparent 62%)",
          filter: "blur(14px)",
          opacity: 0.9,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------
   ParallaxCamera — fake multi-plane 3D.
   Children wrapped in <ParallaxPlane depth={..}> shift by
   depth * camera drift, plus slight scale = dolly effect.
   ------------------------------------------------------------ */

const camCtx = React.createContext<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

export const ParallaxCamera = ({
  children,
  amount = 1,
  seed = "cam",
}: {
  children: React.ReactNode;
  amount?: number;
  seed?: string;
}) => {
  const f = useCurrentFrame();
  const slow = f / 240;
  const dx = (wobble(slow * 60, 0.35, nrand(seed + "a") * 7) * 10 +
    Math.sin(slow * 0.9) * 4) *
    amount;
  const dy = (wobble(slow * 60, 0.27, nrand(seed + "b") * 13) * 6 +
    Math.cos(slow * 0.7) * 3) *
    amount;
  return (
    <camCtx.Provider value={{ dx, dy }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.008 * amount})` }}>{children}</AbsoluteFill>
    </camCtx.Provider>
  );
};

export const ParallaxPlane = ({
  depth = 0,
  children,
  style,
}: {
  depth?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  const { dx, dy } = React.useContext(camCtx);
  return (
    <AbsoluteFill
      style={{
        ...style,
        transform: `translate3d(${dx * depth}px, ${dy * depth}px, 0) scale(${1 + depth * 0.004})`,
        willChange: "transform",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------
   Micro-detail primitives used across scenes
   ------------------------------------------------------------ */

/** Dew bead with refraction hint + specular dot. */
export const DewBead = ({
  cx,
  cy,
  r = 3,
  idPrefix,
  shimmerSeed = "dew",
  frameOffset = 0,
}: {
  cx: number;
  cy: number;
  r?: number;
  idPrefix: string;
  shimmerSeed?: string;
  frameOffset?: number;
}) => {
  const f = useCurrentFrame() + frameOffset;
  const sh = 0.75 + wobble(f * 0.5, 1.5, nrand(shimmerSeed) * 9) * 0.25;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.7} fill="#000" opacity={0.18} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${idPrefix}-droplet)`} stroke="#BFEAFF" strokeWidth={0.3} strokeOpacity={0.5} />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 0.3} fill="#FFFFFF" opacity={0.95 * sh} />
      <circle cx={cx + r * 0.25} cy={cy + r * 0.35} r={r * 0.14} fill="#EAFBFF" opacity={0.5 * sh} />
    </g>
  );
};

/** Trichome hairs along a stem — signature of Mimosa pudica. */
export const Trichomes = ({
  x1,
  y1,
  x2,
  y2,
  count = 14,
  len = 5,
  color = "#CFEAD9",
  seed = "tri",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  count?: number;
  len?: number;
  color?: string;
  seed?: string;
}) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    const side = i % 2 === 0 ? -1 : 1;
    const ang = Math.atan2(y2 - y1, x2 - x1) + (side * Math.PI) / 2.4 + (nrand(`${seed}${i}`) - 0.5) * 0.5;
    const l = len * (0.7 + nrand(`${seed}l${i}`) * 0.6);
    items.push(
      <line
        key={i}
        x1={px}
        y1={py}
        x2={px + Math.cos(ang) * l * side}
        y2={py + Math.sin(ang) * l - l * 0.4}
        stroke={color}
        strokeWidth={0.5}
        strokeLinecap="round"
        opacity={0.55}
      />,
    );
  }
  return <g>{items}</g>;
};

/** Pinnate vein system drawn inside one leaflet. */
export const LeafVeins = ({
  w,
  h,
  pairs = 5,
  color = "#1B4A30",
  midrib = "#8FDCAE",
}: {
  w: number;
  h: number;
  pairs?: number;
  color?: string;
  midrib?: string;
}) => {
  const lines = [];
  for (let i = 0; i < pairs; i++) {
    const t = 0.18 + (i / pairs) * 0.72;
    const yy = -h * t;
    const spread = w * (1 - Math.abs(t - 0.5) * 1.4) * 0.85;
    lines.push(
      <path
        key={`vl${i}`}
        d={`M0 ${yy} Q ${-spread * 0.5} ${yy - h * 0.04} ${-spread} ${yy - h * 0.1}`}
        stroke={color}
        strokeWidth={0.35}
        fill="none"
        opacity={0.5}
      />,
      <path
        key={`vr${i}`}
        d={`M0 ${yy} Q ${spread * 0.5} ${yy - h * 0.04} ${spread} ${yy - h * 0.1}`}
        stroke={color}
        strokeWidth={0.35}
        fill="none"
        opacity={0.5}
      />,
    );
  }
  return (
    <g>
      <line x1={0} y1={0} x2={0} y2={-h} stroke={midrib} strokeWidth={0.6} opacity={0.7} />
      {lines}
    </g>
  );
};

/** Realistic soft contact shadow ellipse under objects. */
export const ContactShadow = ({
  cx,
  cy,
  rx,
  ry,
  opacity = 0.35,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  opacity?: number;
}) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="#020c07"
    opacity={opacity}
    style={{ filter: "blur(6px)" }}
  />
);

/** Depth-of-field blur helper for background elements. */
export const dofBlur = (distance: number): React.CSSProperties => ({
  filter: `blur(${Math.max(0, distance).toFixed(2)}px)`,
});

/** Gentle exposure flicker multiplier (organic light variation). */
export const exposureFlicker = (f: number): number =>
  interpolate(wobble(f * 0.4, 0.8, 3), [-1, 1], [0.965, 1.0]);
