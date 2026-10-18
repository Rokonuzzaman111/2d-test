import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Frame } from "./Frame";
import {
  RealMimosa,
  Ground,
  Fireflies,
  LeafDefs,
  Pinna,
  mimosaTip,
  mimosaFlower,
  mimosaStemPoint,
  mimosaAttach,
} from "../components/Botanical";
import { colors } from "../styles/theme";

const PX = 540;
const PY = 905;
const PS = 1.0;

/** Scene 2 — MEET THE SENSITIVE PLANT */
export const MeetScene = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  // Plant grows out of the soil
  const grow = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const curS = PS * (0.35 + 0.65 * grow);

  const label1 = interpolate(f, [30, 50], [0, 1], clampBoth);
  const label2 = interpolate(f, [70, 90], [0, 1], clampBoth);
  const label3 = interpolate(f, [110, 130], [0, 1], clampBoth);
  const lens = interpolate(f, [140, 165], [0, 1], clampBoth);

  // Gentle leaf fold demo
  const demoFold = interpolate(f, [180, 250, 280, 320], [0, 0.85, 0.85, 0], clampBoth);

  // anchor points on the real plant geometry
  const leafTip = mimosaTip(PX, PY, PS, 1, 1);
  const flower = mimosaFlower(PX, PY, PS, 0);
  const stem = mimosaStemPoint(PX, PY, PS, 200);
  const lensAnchor = mimosaAttach(PX, PY, PS, 4);
  const LC = { x: 850, y: 775 };

  return (
    <Frame
      scene={1}
      tag="পরিচয়"
      title={
        <>
          <span style={{ color: colors.lightLeaf }}>লজ্জাবতী</span>
          <br />
          Mimosa pudica
        </>
      }
      subtitle="Sensitive Plant — স্পর্শকাতর উদ্ভিদ"
    >
      <svg
        width="1080"
        height="1050"
        style={{ position: "absolute", top: 600 }}
      >
        <defs>
          <radialGradient id="mt-plate" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={colors.leafGreen} stopOpacity={0.22} />
            <stop offset="1" stopColor={colors.forestGreen} stopOpacity={0.05} />
          </radialGradient>
          <clipPath id="mt-lens-clip">
            <circle r={96} />
          </clipPath>
        </defs>

        {/* Botanical specimen plate */}
        <circle cx={540} cy={640} r={330} fill="url(#mt-plate)" />
        <circle
          cx={540}
          cy={640}
          r={330}
          fill="none"
          stroke={colors.leafGreen}
          strokeWidth={1.2}
          strokeDasharray="6 5"
          opacity={0.6}
        />
        <circle cx={540} cy={640} r={352} fill="none" stroke={colors.emerald} strokeWidth={0.8} opacity={0.35} />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2 + f * 0.0015;
          const long = i % 6 === 0;
          const r1 = 352;
          const r0 = long ? 338 : 345;
          return (
            <line
              key={i}
              x1={540 + Math.cos(a) * r0}
              y1={640 + Math.sin(a) * r0}
              x2={540 + Math.cos(a) * r1}
              y2={640 + Math.sin(a) * r1}
              stroke={colors.sage}
              strokeWidth={long ? 1.6 : 0.8}
              opacity={0.4}
            />
          );
        })}

        <Ground x={PX} y={PY} w={640} layer="back" id="mt-gr" />
        <RealMimosa
          x={PX}
          y={PY}
          scale={curS}
          foldProgress={demoFold}
          cascade
          idPrefix="mt"
        />
        <Ground x={PX} y={PY} w={640} layer="front" id="mt-gr" />
        <Fireflies count={10} h={900} seed={7} />

        {/* Label 1: বাংলা নাম */}
        <g opacity={label1} transform={`translate(0 ${15 * (1 - label1)})`}>
          <line
            x1={350}
            y1={190}
            x2={leafTip.x}
            y2={leafTip.y}
            stroke={colors.sage}
            strokeWidth={1.6}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <circle cx={leafTip.x} cy={leafTip.y} r={5} fill={colors.paper} />
          <circle cx={leafTip.x} cy={leafTip.y} r={11} fill="none" stroke={colors.paper} opacity={0.5} />
          <rect x={90} y={150} width={260} height={64} rx={32} fill={colors.emerald} opacity={0.95} />
          <text x={220} y={193} textAnchor="middle" fontSize={34} fontWeight={700} fill={colors.paper}>
            লজ্জাবতী
          </text>
        </g>

        {/* Label 2: Scientific name → flower */}
        <g opacity={label2} transform={`translate(0 ${15 * (1 - label2)})`}>
          <line
            x1={700}
            y1={232}
            x2={flower.x}
            y2={flower.y}
            stroke={colors.sage}
            strokeWidth={1.6}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <circle cx={flower.x} cy={flower.y} r={5} fill={colors.paper} />
          <circle cx={flower.x} cy={flower.y} r={12} fill="none" stroke={colors.paper} opacity={0.5} />
          <rect
            x={690}
            y={200}
            width={310}
            height={60}
            rx={30}
            fill={`${colors.deepForest}EE`}
            stroke={colors.leafGreen}
            strokeWidth={1.2}
          />
          <text x={845} y={240} textAnchor="middle" fontSize={28} fontWeight={600} fill={colors.sage} fontStyle="italic">
            Mimosa pudica
          </text>
        </g>

        {/* Label 3: English name → stem */}
        <g opacity={label3} transform={`translate(0 ${15 * (1 - label3)})`}>
          <line
            x1={330}
            y1={348}
            x2={stem.x}
            y2={stem.y}
            stroke={colors.signal}
            strokeWidth={1.6}
            strokeDasharray="4 3"
            opacity={0.7}
          />
          <circle cx={stem.x} cy={stem.y} r={5} fill={colors.signal} />
          <rect
            x={60}
            y={320}
            width={270}
            height={56}
            rx={28}
            fill={`${colors.deepForest}EE`}
            stroke={colors.signal}
            strokeWidth={1.2}
          />
          <text x={195} y={357} textAnchor="middle" fontSize={27} fontWeight={600} fill={colors.signal}>
            Sensitive Plant
          </text>
        </g>

        {/* Leaflet magnifier */}
        <g opacity={lens}>
          <line
            x1={lensAnchor.x}
            y1={lensAnchor.y}
            x2={LC.x - 70}
            y2={LC.y - 70}
            stroke={colors.leafGreen}
            strokeWidth={1.4}
            strokeDasharray="4 3"
            opacity={0.8}
          />
          <circle cx={lensAnchor.x} cy={lensAnchor.y} r={5} fill={colors.lightLeaf} />
          <g transform={`translate(${LC.x} ${LC.y})`}>
            <circle r={104} fill={`${colors.charcoal}`} stroke={colors.leafGreen} strokeWidth={2.5} />
            <g clipPath="url(#mt-lens-clip)">
              <rect x={-100} y={-100} width={200} height={200} fill="#12261c" />
              <g transform="translate(-92 34) rotate(-20) scale(2.2)">
                <LeafDefs p="mtl" />
                <Pinna len={80} n={7} fold={demoFold} p="mtl" />
              </g>
            </g>
            <circle r={96} fill="none" stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
          </g>
          <text x={LC.x} y={LC.y - 124} textAnchor="middle" fontSize={26} fontWeight={600} fill={colors.sage}>
            জোড়া পাতা
          </text>
        </g>
      </svg>
    </Frame>
  );
};