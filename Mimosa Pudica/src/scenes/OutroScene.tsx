import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Frame } from "./Frame";
import { RealMimosa, Ground, Fireflies } from "../components/Botanical";
import { colors } from "../styles/theme";

/** Scene 7 — REVEAL AND CLOSING with CTA */
export const OutroScene = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  // Leaves slowly open again
  const fold = interpolate(f, [0, 130], [0.85, 0], {
    ...clampBoth,
    easing: Easing.inOut(Easing.cubic),
  });

  const endCard = spring({
    frame: Math.max(0, f - 140),
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const ctaReveal = spring({
    frame: Math.max(0, f - 220),
    fps,
    config: { damping: 16, stiffness: 70 },
  });
  const finalText = interpolate(f, [250, 290], [0, 1], clampBoth);
  const warmth = interpolate(f, [0, 100], [0.15, 0.38], clampBoth);
  const ctaPulse = 1 + 0.018 * Math.sin(f / 9) * ctaReveal;

  return (
    <Frame
      scene={6}
      tag="প্রকৃতির বিস্ময়"
      title={
        <>
          রহস্য এখনো
          <br />
          <span style={{ color: colors.signal }}>শেষ হয়নি!</span>
        </>
      }
      subtitle="আরও ফ্যাক্ট জানতে সঙ্গে থাকুন"
      bgGradient={`radial-gradient(ellipse at 50% 60%, ${colors.forestGreen}40 0%, ${colors.deepForest} 70%)`}
    >
      <svg
        width="1080"
        height="1050"
        style={{ position: "absolute", top: 580 }}
      >
        <defs>
          <radialGradient id="ot-warm" cx="0.5" cy="0.3">
            <stop offset="0" stopColor={colors.sunlight} stopOpacity={warmth} />
            <stop offset="1" stopColor={colors.sunlight} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="ot-cta" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={colors.signal} />
            <stop offset="1" stopColor={colors.glow} />
          </linearGradient>
        </defs>

        <circle cx={540} cy={380} r={430} fill="url(#ot-warm)" />

        <Ground x={540} y={790} w={700} layer="back" id="ot-gr" />
        <RealMimosa x={540} y={790} scale={1.0} foldProgress={fold} idPrefix="ot" />
        <Ground x={540} y={790} w={700} layer="front" id="ot-gr" />
        <Fireflies count={18} h={900} seed={9} />

        {/* End card */}
        <g opacity={endCard} transform={`translate(0 ${20 * (1 - endCard)})`}>
          <rect x={140} y={90} width={800} height={130} rx={26} fill={`${colors.deepForest}E8`} stroke={colors.signal} strokeWidth={1.6} />
          <text x={540} y={150} textAnchor="middle" fontSize={36} fontWeight={750} fill={colors.glow}>
            প্রকৃতির রহস্য এখনো শেষ হয়নি!
          </text>
          <text x={540} y={195} textAnchor="middle" fontSize={26} fontWeight={500} fill={colors.sage}>
            স্থির গাছের ভেতরেও চলছে জটিল প্রক্রিয়া
          </text>
        </g>

        {/* CTA button */}
        <g
          transform={`translate(540 878) scale(${(0.85 + 0.15 * ctaReveal) * ctaPulse}) translate(-540 -878)`}
          opacity={ctaReveal}
        >
          <rect x={232} y={829} width={616} height={98} rx={49} fill={colors.signal} opacity={0.18} />
          <rect x={240} y={835} width={600} height={85} rx={42} fill="url(#ot-cta)" />
          <rect x={262} y={842} width={556} height={20} rx={10} fill="#fff" opacity={0.18} />
          <text x={540} y={890} textAnchor="middle" fontSize={36} fontWeight={800} fill={colors.deepForest}>
            আরও ফ্যাক্ট জানতে ফলো করুন
          </text>
        </g>

        {/* Comment prompt */}
        <g opacity={finalText} transform={`translate(0 ${8 * (1 - finalText)})`}>
          <text x={540} y={970} textAnchor="middle" fontSize={24} fontWeight={500} fill={colors.sage} opacity={0.9}>
            কমেন্টে বলুন — পরের ভিডিওতে কোন ফ্যাক্ট চান?
          </text>
        </g>

        {/* Sparkles orbiting the CTA */}
        {ctaReveal > 0.5 &&
          Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2 + f * 0.02;
            const radius = 320 + Math.sin(f / 20 + i * 2) * 15;
            return (
              <circle
                key={i}
                cx={540 + Math.cos(angle) * radius}
                cy={878 + Math.sin(angle) * radius * 0.28}
                r={3.2}
                fill={colors.sunlight}
                opacity={0.45 + Math.sin(f / 8 + i) * 0.25}
              />
            );
          })}
      </svg>
    </Frame>
  );
};