import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Frame } from "./Frame";
import { RealMimosa, Ground, Fireflies } from "../components/Botanical";
import { colors } from "../styles/theme";

/** Scene 6 — MYTH VS SCIENCE */
export const MythScene = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const questionReveal = spring({
    frame: f,
    fps,
    config: { damping: 15, stiffness: 90 },
  });
  const answerReveal = interpolate(f, [120, 155], [0, 1], clampBoth);
  const plantFold = interpolate(f, [0, 30], [0.8, 0.7], clampBoth);
  const crossReveal = interpolate(f, [160, 190], [0, 1], clampBoth);
  const checkReveal = interpolate(f, [200, 230], [0, 1], clampBoth);

  return (
    <Frame
      scene={5}
      tag="সত্য নাকি ভুল?"
      title={
        <>
          গাছটি কি সত্যিই
          <br />
          <span style={{ color: colors.coral }}>লজ্জা পায়?</span>
        </>
      }
      subtitle="বিজ্ঞান বনাম প্রচলিত ধারণা"
    >
      <svg
        width="1080"
        height="1000"
        style={{ position: "absolute", top: 610 }}
      >
        <defs>
          <linearGradient id="mh-myth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a1f22" stopOpacity={0.92} />
            <stop offset="1" stopColor={colors.deepForest} stopOpacity={0.92} />
          </linearGradient>
          <linearGradient id="mh-sci" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14402f" stopOpacity={0.95} />
            <stop offset="1" stopColor={colors.deepForest} stopOpacity={0.92} />
          </linearGradient>
        </defs>

        {/* Faded plant in background */}
        <Ground x={540} y={830} w={620} layer="back" id="mh-gr" />
        <RealMimosa x={540} y={830} scale={0.8} foldProgress={plantFold} opacity={0.28} idPrefix="mh" />
        <Fireflies count={8} h={950} seed={5} />

        {/* Question card */}
        <g
          opacity={questionReveal}
          transform={`translate(540 160) scale(${0.9 + 0.1 * questionReveal}) translate(-540 -160)`}
        >
          <rect x={130} y={100} width={820} height={120} rx={60} fill={`${colors.charcoal}F0`} stroke={colors.sunlight} strokeWidth={2.2} />
          <text x={540} y={175} textAnchor="middle" fontSize={40} fontWeight={750} fill={colors.sunlight}>
            গাছটি কি সত্যিই লজ্জা পায়?
          </text>
        </g>

        {/* Myth card */}
        <g opacity={answerReveal} transform={`translate(0 ${20 * (1 - answerReveal)})`}>
          <rect x={80} y={290} width={420} height={270} rx={32} fill="url(#mh-myth)" stroke={`${colors.coral}90`} strokeWidth={2} />
          {/* vector X badge */}
          <circle cx={290} cy={334} r={24} fill={`${colors.coral}25`} stroke={colors.coral} strokeWidth={2.5} />
          <path d="M280,324 L300,344 M300,324 L280,344" stroke={colors.coral} strokeWidth={4} strokeLinecap="round" />
          <text x={290} y={394} textAnchor="middle" fontSize={32} fontWeight={700} fill={colors.coral}>
            প্রচলিত ধারণা
          </text>
          <text x={290} y={440} textAnchor="middle" fontSize={25} fill={colors.paper} opacity={0.85}>
            “গাছটি লজ্জা পায়”
          </text>
          <text x={290} y={476} textAnchor="middle" fontSize={25} fill={colors.paper} opacity={0.85}>
            “গাছটি ভয় পায়”
          </text>
          <text x={290} y={523} textAnchor="middle" fontSize={22} fill={colors.textLight}>
            মানুষের আবেগ নয়
          </text>
          {/* strike-through lines drawing across the quotes */}
          <line x1={150} y1={432} x2={150 + 280 * crossReveal} y2={432} stroke={colors.coral} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
          <line x1={150} y1={468} x2={150 + 280 * crossReveal} y2={468} stroke={colors.coral} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
        </g>

        {/* Science card */}
        <g opacity={answerReveal} transform={`translate(0 ${20 * (1 - answerReveal)})`}>
          <rect x={580} y={290} width={420} height={270} rx={32} fill="url(#mh-sci)" stroke={`${colors.signal}90`} strokeWidth={2} />
          {/* vector check badge */}
          <circle cx={790} cy={334} r={24} fill={`${colors.signal}25`} stroke={colors.signal} strokeWidth={2.5} />
          <path d="M778,335 L787,344 L804,325" stroke={colors.signal} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x={790} y={394} textAnchor="middle" fontSize={32} fontWeight={700} fill={colors.signal}>
            বৈজ্ঞানিক সত্য
          </text>
          <text x={790} y={440} textAnchor="middle" fontSize={25} fill={colors.paper} opacity={0.9}>
            এটি একটি
          </text>
          <text x={790} y={482} textAnchor="middle" fontSize={32} fontWeight={700} fill={colors.glow}>
            জৈবিক প্রতিক্রিয়া
          </text>
          <text x={790} y={523} textAnchor="middle" fontSize={22} fill={colors.sage}>
            টার্গর চাপের পরিবর্তন
          </text>
          {checkReveal > 0 && (
            <>
              <circle cx={790} cy={334} r={24 + 80 * checkReveal} fill="none" stroke={colors.signal} strokeWidth={2} opacity={0.4 * (1 - checkReveal)} />
              <circle cx={790} cy={334} r={24 + 50 * checkReveal} fill="none" stroke={colors.signal} strokeWidth={2} opacity={0.5 * (1 - checkReveal)} />
            </>
          )}
        </g>

        {/* Bottom summary */}
        <g opacity={checkReveal} transform={`translate(0 ${10 * (1 - checkReveal)})`}>
          <rect x={150} y={610} width={780} height={76} rx={38} fill={`${colors.signal}20`} stroke={colors.signal} strokeWidth={1.4} />
          <text x={540} y={658} textAnchor="middle" fontSize={31} fontWeight={700} fill={colors.signal}>
            এটি উদ্ভিদের একটি জৈবিক প্রতিক্রিয়া
          </text>
        </g>
      </svg>
    </Frame>
  );
};