import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";
import { nrand, wobble } from "./Realism";

/**
 * Electrical signal travelling along the stem: a bright action-potential
 * bolt with volumetric bloom, depolarisation halo, secondary micro-arcs
 * and scattered charge sparks — like a real oscilloscope capture of
 * Mimosa's action potential rendered in space.
 */
export const SignalPath = ({
  points,
  progress = 0,
  width = 3,
}: {
  points: Array<[number, number]>;
  progress?: number;
  width?: number;
}) => {
  const f = useCurrentFrame();
  if (points.length < 2) return null;

  const total = points.length - 1;
  const head = Math.max(0, Math.min(total, progress * total));

  // Build path up to head with organic jitter perpendicular to direction
  const segs: string[] = [];
  for (let i = 0; i < total; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const t0 = Math.min(1, Math.max(0, head - i));
    if (t0 <= 0) break;
    const mx = (x1 + x2) / 2 + wobble(f * 0.6 + i * 13, 2, i) * 2.4;
    const my = (y1 + y2) / 2 + wobble(f * 0.6 + i * 29, 2.4, i + 5) * 2.4;
    const ex = x1 + (x2 - x1) * t0;
    const ey = y1 + (y2 - y1) * t0;
    segs.push(`Q${mx},${my} ${ex},${ey}`);
  }
  const [sx, sy] = points[0];
  const d = `M${sx},${sy} ${segs.join(" ")}`;

  // Head position for the pulse bulb
  const hi = Math.min(total - 1, Math.floor(head));
  const ht = head - hi;
  const [hx1, hy1] = points[hi];
  const [hx2, hy2] = points[Math.min(total, hi + 1)];
  const hx = hx1 + (hx2 - hx1) * ht;
  const hy = hy1 + (hy2 - hy1) * ht;

  return (
    <g>
      {/* Faint full-route guide so viewers see where it will travel */}
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={colors.glow}
        strokeWidth={1}
        strokeDasharray="2 8"
        opacity={0.18}
      />

      {/* Volumetric outer bloom */}
      <path d={d} fill="none" stroke={colors.glow} strokeWidth={width * 5} opacity={0.1} strokeLinecap="round" style={{ filter: "blur(7px)" }} />
      <path d={d} fill="none" stroke={colors.signal} strokeWidth={width * 2.2} opacity={0.3} strokeLinecap="round" style={{ filter: "blur(3px)" }} />
      {/* Core bolt */}
      <path d={d} fill="none" stroke="#EAFFF8" strokeWidth={width} opacity={0.95} strokeLinecap="round" />

      {/* Depolarisation halo rings trailing the head */}
      {[0, 1, 2].map((i) => {
        const cyc = ((f * 1.8 + i * 16) % 48) / 48;
        return (
          <circle
            key={i}
            cx={hx}
            cy={hy}
            r={4 + cyc * 26}
            fill="none"
            stroke="#7CF7D8"
            strokeWidth={1.8 - cyc * 1.4}
            opacity={(1 - cyc) * 0.55}
          />
        );
      })}

      {/* Bright pulse head with cross flare */}
      <circle cx={hx} cy={hy} r={5.5 + Math.sin(f / 4) * 1.2} fill="#FFFFFF" opacity={0.9} style={{ filter: "blur(1.5px)" }} />
      <line x1={hx - 14} y1={hy} x2={hx + 14} y2={hy} stroke="#DFFFEF" strokeWidth={1.2} opacity={0.6} />
      <line x1={hx} y1={hy - 14} x2={hx} y2={hy + 14} stroke="#DFFFEF" strokeWidth={1.2} opacity={0.6} />

      {/* Charge sparks flickering near the head */}
      {[...Array(6)].map((_, i) => {
        const on = (f + i * 5) % 14 < 6;
        if (!on) return null;
        const a = nrand(`spk${i}${Math.floor(f / 14)}`) * Math.PI * 2;
        const r = 10 + nrand(`spr${i}`) * 16;
        return (
          <path
            key={i}
            d={`M${hx},${hy} l${Math.cos(a) * r * 0.5},${Math.sin(a) * r * 0.5} l${Math.cos(a + 0.7) * r * 0.5},${Math.sin(a + 0.7) * r * 0.5}`}
            stroke="#BFFFF0"
            strokeWidth={0.9}
            fill="none"
            opacity={0.7}
          />
        );
      })}
    </g>
  );
};
