import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Frame } from "./Frame";
import {
  RealMimosa,
  Hand,
  Ground,
  Fireflies,
  SignalStream,
  GlowFilter,
  mimosaTip,
  mimosaRoute,
  mimosaAttach,
  BRANCHES,
  clamp01,
} from "../components/Botanical";
import { colors } from "../styles/theme";

const PX = 540;
const PY = 905;
const PS = 1.05;

/** Action-potential style voltage graph that draws itself with the signal */
const ActionPotential = ({ prog }: { prog: number }) => {
  const W = 380;
  const H = 120;
  const pts = Array.from({ length: 90 }, (_, i) => {
    const t = i / 89;
    const v =
      -70 +
      110 * Math.exp(-Math.pow((t - 0.34) / 0.055, 2)) -
      12 * Math.exp(-Math.pow((t - 0.52) / 0.09, 2));
    return { x: t * W, y: H - ((v + 85) / 130) * H };
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const head = pts[Math.min(89, Math.floor(clamp01(prog) * 89))];
  const restY = H - ((-70 + 85) / 130) * H;
  return (
    <g transform="translate(580 40)">
      <rect width={440} height={230} rx={28} fill={`${colors.charcoal}E6`} stroke={colors.glow} strokeOpacity={0.5} strokeWidth={1.4} />
      <text x={28} y={44} fontSize={24} fontWeight={700} fill={colors.glow}>
        সংকেতের ভোল্টেজ
      </text>
      <g transform="translate(30 70)">
        {[0, 0.5, 1].map((k) => (
          <line key={k} x1={0} y1={k * H} x2={W} y2={k * H} stroke={colors.paper} strokeOpacity={0.08} />
        ))}
        <line x1={0} y1={restY} x2={W} y2={restY} stroke={colors.sage} strokeOpacity={0.45} strokeDasharray="5 4" />
        <path d={d} pathLength={1} fill="none" stroke={colors.glow} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${clamp01(prog)} 2`} />
        {prog > 0.01 && prog < 0.999 && (
          <>
            <circle cx={head.x} cy={head.y} r={11} fill={colors.glow} opacity={0.3} />
            <circle cx={head.x} cy={head.y} r={5} fill="#fff" />
          </>
        )}
        <text x={W} y={H + 28} textAnchor="end" fontSize={18} fill={colors.sage}>
          সময় →
        </text>
      </g>
    </g>
  );
};

/** Scene 3 — HOW DOES IT DETECT THE STIMULUS? */
export const SignalScene = () => {
  const f = useCurrentFrame();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const tip = mimosaTip(PX, PY, PS, 0, 1);
  const route = mimosaRoute(PX, PY, PS);

  const handP = interpolate(f, [0, 14, 40, 95], [1, 1, 1, 0], clampBoth);
  const ripple = clamp01(f / 40);
  const sig = interpolate(f, [30, 200], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.quad),
  });
  const fold = interpolate(f, [75, 240], [0, 1], clampBoth);
  const noBrain = interpolate(f, [40, 65], [0, 1], clampBoth);
  const sigLabel = interpolate(f, [120, 145], [0, 1], clampBoth);

  return (
    <Frame
      scene={2}
      tag="প্রশ্ন"
      title={
        <>
          গাছ কীভাবে
          <br />
          <span style={{ color: colors.glow }}>স্পর্শ বোঝে?</span>
        </>
      }
      subtitle="মস্তিষ্ক ছাড়াই দ্রুত প্রতিক্রিয়া"
    >
      <svg
        width="1080"
        height="1050"
        style={{ position: "absolute", top: 590 }}
      >
        <GlowFilter />

        <Ground x={PX} y={PY} w={700} layer="back" id="sg-gr" />
        <RealMimosa
          x={PX}
          y={PY}
          scale={PS}
          foldProgress={fold}
          cascade
          showGlow={sig > 0.05 && sig < 0.98}
          idPrefix="sg"
        />
        <Ground x={PX} y={PY} w={700} layer="front" id="sg-gr" />

        {/* Pulses at every leaf joint as the signal passes */}
        {BRANCHES.map((_, i) => {
          const t0 = 45 + i * 22;
          const k = clamp01((f - t0) / 32);
          if (k <= 0 || k >= 1) return null;
          const a = mimosaAttach(PX, PY, PS, i);
          return (
            <circle
              key={i}
              cx={a.x}
              cy={a.y}
              r={6 + k * 34}
              fill="none"
              stroke={colors.glow}
              strokeWidth={3 * (1 - k)}
              opacity={1 - k}
            />
          );
        })}

        {/* Electrical signal from the touched leaflet down the stem */}
        <SignalStream d={route} progress={sig} color={colors.glow} width={3.5} />

        <Fireflies count={8} h={900} seed={11} color={colors.glow} />
        <Hand x={tip.x} y={tip.y} progress={handP} pulse={ripple} />

        {/* "No brain" label with vector brain icon */}
        <g opacity={noBrain} transform={`translate(0 ${12 * (1 - noBrain)})`}>
          <rect x={50} y={90} width={310} height={74} rx={37} fill={`${colors.deepForest}EE`} stroke={colors.coral} strokeWidth={1.6} />
          <g transform="translate(96 128)">
            <path
              d="M-14,2 C-22,-8 -12,-20 -2,-14 C4,-22 18,-16 14,-6 C22,0 16,14 6,12 C2,20 -10,18 -10,10 C-18,10 -20,4 -14,2Z"
              fill="none"
              stroke={colors.coral}
              strokeWidth={2.4}
              strokeLinejoin="round"
            />
            <line x1={-22} y1={20} x2={22} y2={-22} stroke={colors.coral} strokeWidth={3.5} strokeLinecap="round" />
          </g>
          <text x={236} y={139} textAnchor="middle" fontSize={32} fontWeight={700} fill={colors.coral}>
            মস্তিষ্ক নেই
          </text>
        </g>

        {/* Voltage graph */}
        <ActionPotential prog={sig} />

        {/* "বৈদ্যুতিক সংকেত" label with vector bolt */}
        <g opacity={sigLabel} transform={`translate(0 ${12 * (1 - sigLabel)})`}>
          <rect x={650} y={292} width={350} height={66} rx={33} fill={`${colors.deepForest}EE`} stroke={colors.glow} strokeWidth={1.6} />
          <polygon
            points="696,308 680,332 692,332 686,350 706,324 693,324"
            fill={colors.glow}
          />
          <text x={858} y={336} textAnchor="middle" fontSize={32} fontWeight={700} fill={colors.glow}>
            বৈদ্যুতিক সংকেত
          </text>
        </g>
      </svg>
    </Frame>
  );
};