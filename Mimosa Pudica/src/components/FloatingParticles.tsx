import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";
export const FloatingParticles = () => {
  const f = useCurrentFrame();
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 30 }, (_, i) => {
        const baseX = 40 + ((i * 157) % 1000);
        const speed = 0.2 + (i % 5) * 0.08;
        const size = 3 + (i % 5) * 2;
        const drift = Math.sin(f / (40 + i * 7) + i * 1.3) * 15;
        const y = (i * 211 + 1920 - f * speed) % 1920;
        const opacity = 0.08 + (i % 3) * 0.04;
        return (
          <circle
            key={i}
            cx={baseX + drift}
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
        );
      })}
    </svg>
  );
};
