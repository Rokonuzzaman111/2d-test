import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";
export const FloatingParticles = () => {
  const f = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      {/* depth-of-field bokeh orbs drifting behind the motes */}
      {Array.from({ length: 10 }, (_, i) => {
        const s = (i + 1) * 17.3;
        const r = 26 + ((s * 7) % 44);
        const x = ((s * 13) % 1080) + Math.sin(f / (130 + i * 11) + i) * (10 + i * 2);
        const y = ((s * 29) % 1920) + Math.cos(f / (170 + i * 9) + i * 2) * (8 + i);
        return (
          <circle
            key={`bk-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill={i % 2 === 0 ? colors.sunlight : colors.sage}
            opacity={0.04 + (i % 3) * 0.015}
          />
        );
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const baseX = 40 + ((i * 157) % 1000);
        const speed = 0.2 + (i % 5) * 0.08;
        const size = 3 + (i % 5) * 2;
        // two-frequency drift = organic wandering instead of a clean pendulum
        const drift =
          Math.sin(f / (40 + i * 7) + i * 1.3) * 15 + Math.sin(f / 17 + i * 2.1) * 4;
        const y = (i * 211 + 1920 - f * speed) % 1920;
        // per-particle twinkle so each mote breathes as it falls
        const tw = 0.75 + 0.25 * Math.sin(f / 22 + i * 1.7);
        const opacity = (0.08 + (i % 3) * 0.04) * tw;
        const cx = baseX + drift;
        return (
          <g key={i}>
            {/* faint vertical motion trail */}
            <ellipse
              cx={cx}
              cy={y + size * 1.8}
              rx={size * 0.4}
              ry={size * 2.4}
              fill={colors.sunlight}
              opacity={opacity * 0.35}
            />
            {/* soft glow halo */}
            <circle cx={cx} cy={y} r={size * 2.1} fill={colors.sunlight} opacity={opacity * 0.25} />
            <circle
              cx={cx}
              cy={y}
              r={size}
              fill={
                i % 3 === 0
                  ? colors.sunlight
                  : i % 3 === 1
                    ? colors.sage
                    : colors.glow
              }
              opacity={opacity}
            />
            {/* tiny specular dot */}
            <circle cx={cx - size * 0.3} cy={y - size * 0.3} r={size * 0.3} fill="#fff" opacity={opacity * 0.8} />
          </g>
        );
      })}
    </svg>
  );
};
