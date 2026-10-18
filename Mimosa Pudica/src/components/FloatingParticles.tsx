import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";
import { nrand, wobble } from "./Realism";

/**
 * Three-layer atmospheric depth:
 *  - far layer: large blurred bokeh orbs (out of focus, behind everything)
 *  - mid layer: dust motes / pollen with Brownian wander + motion trails
 *  - near layer: a few bright fast specks crossing close to the lens
 * All motion is layered-sine pseudo-Brownian — organic, never robotic.
 */
export const FloatingParticles = () => {
  const f = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="fp-blur-far" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="fp-blur-near" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id="fp-orb" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FFF3D6" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#FFE0A8" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#FFE0A8" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* FAR: big defocused bokeh orbs with soft ring edges like real lens bokeh */}
      {Array.from({ length: 11 }, (_, i) => {
        const s = (i + 1) * 17.3;
        const r = 26 + ((s * 7) % 44);
        const x = ((s * 13) % 1080) + Math.sin(f / (130 + i * 11) + i) * (10 + i * 2);
        const y = ((s * 29) % 1920) + Math.cos(f / (170 + i * 9) + i * 2) * (8 + i);
        return (
          <g key={`bk-${i}`} filter="url(#fp-blur-far)">
            <circle cx={x} cy={y} r={r} fill={i % 2 === 0 ? colors.sunlight : colors.sage} opacity={0.04 + (i % 3) * 0.015} />
            <circle cx={x} cy={y} r={r} fill="none" stroke={i % 2 === 0 ? "#FFE9C0" : "#BFEAD0"} strokeWidth={r * 0.18} opacity={0.03} />
          </g>
        );
      })}

      {/* MID: dust motes & pollen — per-particle seeded Brownian wander */}
      {Array.from({ length: 34 }, (_, i) => {
        const baseX = 40 + nrand(`mx${i}`) * 1000;
        const speed = 0.16 + nrand(`sp${i}`) * 0.4;
        const size = 1.6 + nrand(`sz${i}`) * 4.4;
        // three-frequency drift ≈ Brownian motion
        const drift =
          Math.sin(f / (40 + i * 7) + i * 1.3) * 15 +
          Math.sin(f / 17 + i * 2.1) * 4 +
          wobble(f + i * 31, 1.2, i) * 3;
        const y = (nrand(`my${i}`) * 1920 + 1920 - f * speed) % 1920;
        const tw = 0.7 + 0.3 * Math.sin(f / (18 + nrand(`tw${i}`) * 20) + i * 1.7);
        const opacity = (0.07 + nrand(`op${i}`) * 0.1) * tw;
        const cx = baseX + drift;
        const col = i % 4 === 0 ? colors.glow : i % 3 === 0 ? colors.sunlight : i % 2 === 0 ? colors.sage : "#EAF7DF";
        return (
          <g key={i}>
            {/* vertical motion smear */}
            <ellipse cx={cx} cy={y + size * 2} rx={size * 0.35} ry={size * (2 + speed * 4)} fill={col} opacity={opacity * 0.3} />
            {/* glow halo */}
            <circle cx={cx} cy={y} r={size * 2.4} fill={col} opacity={opacity * 0.22} />
            <circle cx={cx} cy={y} r={size} fill={col} opacity={opacity} />
            {/* specular micro-dot offset toward the light source */}
            <circle cx={cx - size * 0.35} cy={y - size * 0.4} r={size * 0.32} fill="#fff" opacity={opacity * 0.9} />
          </g>
        );
      })}

      {/* NEAR: fast bright specks drifting past the lens, slightly blurred */}
      {Array.from({ length: 5 }, (_, i) => {
        const speed = 1.4 + nrand(`ns${i}`) * 1.6;
        const x = (nrand(`nx${i}`) * 1080 + f * speed * (i % 2 === 0 ? 1 : -1)) % 1080;
        const y = 200 + nrand(`ny${i}`) * 1500 + Math.sin(f / 40 + i) * 30;
        const r = 4 + nrand(`nr${i}`) * 5;
        return (
          <g key={`near-${i}`} filter="url(#fp-blur-near)" opacity={0.1 + nrand(`no${i}`) * 0.08}>
            <circle cx={x} cy={y} r={r} fill="#F6FFEA" />
          </g>
        );
      })}
    </svg>
  );
};
