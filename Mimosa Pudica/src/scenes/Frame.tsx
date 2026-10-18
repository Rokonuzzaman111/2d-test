import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { font, colors } from "../styles/theme";
import { FloatingParticles } from "../components/FloatingParticles";
import { SceneTransition } from "../components/SceneTransition";
import {
  FilmGrain,
  CinematicVignette,
  ChromaticEdge,
  ForegroundBokeh,
  GodRays,
} from "../components/Realism";
import type { ReactNode } from "react";

const durations = [510, 630, 540, 450, 750, 450, 690];

export const Frame = ({
  tag,
  title,
  subtitle,
  children,
  scene = 0,
  bgGradient,
}: {
  tag: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  scene?: number;
  bgGradient?: string;
}) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 120);
  const bg =
    bgGradient ||
    `radial-gradient(ellipse at 50% 30%, ${colors.charcoal} 0%, ${colors.deepForest} 70%)`;

  return (
    <AbsoluteFill
      style={{
        background: bg,
        color: colors.paper,
        fontFamily: font,
      }}
    >
      {/* slow ambient colour blooms */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(620px 520px at ${30 + drift * 6}% 72%, ${colors.emerald}26, transparent 70%), radial-gradient(520px 440px at ${85 - drift * 4}% 18%, ${colors.sunlight}14, transparent 70%)`,
        }}
      />

      {/* Volumetric sunlight shafts through the canopy */}
      <GodRays xPct={82} yPct={6} opacity={0.1} />
      {/* Mottled foliage shadow pattern drifting over the set */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(closest-side at 20% 15%, rgba(0,0,0,0.35), transparent),
            radial-gradient(closest-side at 75% 8%, rgba(0,0,0,0.3), transparent),
            radial-gradient(closest-side at 90% 40%, rgba(0,0,0,0.22), transparent)`,
          transform: `translate(${drift * 14}px, ${-drift * 8}px)`,
          transition: "none",
        }}
      />

      <FloatingParticles />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          fontWeight: 650,
        }}
      >
        <span
          style={{
            color: colors.sage,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <svg width={34} height={34} viewBox="0 0 24 24">
            <path
              d="M12 22C12 22 4 16 4 9.5C4 5 8 2 12 2c4 0 8 3 8 7.5C20 16 12 22 12 22Z"
              fill={colors.leafGreen}
            />
            <path d="M12 6v14" stroke={colors.deepForest} strokeWidth={1.4} />
            <path d="M12 11l-3-2M12 14l3-2.4M12 17l-2.6-1.8" stroke={colors.deepForest} strokeWidth={1} />
          </svg>
          প্রকৃতির রহস্য
        </span>
        <span style={{ color: colors.signal, fontSize: 22 }}>
          বিজ্ঞান • ০১
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 150,
          width: 920,
          height: 1,
          background: `linear-gradient(90deg, ${colors.leafGreen}60, transparent)`,
        }}
      />

      <SceneTransition>
        {/* Title area */}
        <div style={{ position: "absolute", top: 195, left: 80, right: 80 }}>
          <div
            style={{
              color: colors.signal,
              fontSize: 28,
              fontWeight: 650,
              marginBottom: 16,
              letterSpacing: 0.5,
            }}
          >
            {tag}
          </div>
          <div
            data-safe-text
            style={{
              fontSize: 82,
              lineHeight: 1.28,
              fontWeight: 850,
              letterSpacing: -1.5,
              textShadow: "0 6px 34px rgba(0,0,0,0.45)",
            }}
          >
            {title}
          </div>
          <div
            data-safe-text
            style={{
              fontSize: 38,
              lineHeight: 1.5,
              marginTop: 16,
              fontWeight: 450,
              color: colors.mint,
              opacity: 0.85,
            }}
          >
            {subtitle}
          </div>
        </div>
        {children}
      </SceneTransition>

      {/* Graded cinematic finish stack: vignette + lens fringe + bokeh + grain */}
      <CinematicVignette strength={0.5} />
      <ChromaticEdge />
      <ForegroundBokeh count={6} />
      <FilmGrain intensity={0.05} />

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 88,
          left: 80,
          display: "flex",
          gap: 10,
        }}
      >
        {durations.map((d, i) => (
          <div
            key={i}
            style={{
              width: 120,
              height: 5,
              borderRadius: 5,
              background: `${colors.paper}18`,
              overflow: "hidden",
              boxShadow: i === scene ? `0 0 14px ${colors.signal}55` : "none",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 5,
                background:
                  i < scene
                    ? colors.signal
                    : i === scene
                      ? `linear-gradient(90deg, ${colors.signal}, ${colors.glow})`
                      : "transparent",
                width:
                  i < scene
                    ? "100%"
                    : i === scene
                      ? `${interpolate(f, [0, d - 1], [2, 100], { extrapolateRight: "clamp" })}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};