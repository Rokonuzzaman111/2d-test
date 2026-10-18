import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "./Frame";
import {
  PlantCell,
  LeafSprig,
  pointOnPath,
} from "../components/Botanical";
import { colors } from "../styles/theme";
import { CameraRig, ExposurePulse } from "./Cinematics";

const WATER_PATH = "M392,255 C470,205 610,205 700,255";

const Chip = ({
  x,
  y,
  w,
  n,
  text,
  color,
  textColor,
  op,
}: {
  x: number;
  y: number;
  w: number;
  n: string;
  text: string;
  color: string;
  textColor: string;
  op: number;
}) => (
  <g opacity={op} transform={`translate(${x} ${y + 8 * (1 - op)})`}>
    <rect width={w} height={56} rx={28} fill={`${color}30`} stroke={color} strokeWidth={1.4} />
    <circle cx={30} cy={28} r={17} fill={color} />
    <text x={30} y={35} textAnchor="middle" fontSize={20} fontWeight={800} fill={colors.deepForest}>
      {n}
    </text>
    <text x={w / 2 + 20} y={37} textAnchor="middle" fontSize={25} fontWeight={650} fill={textColor}>
      {text}
    </text>
  </g>
);

/** Scene 5 — WATER PRESSURE: the turgor mechanism explained */
export const TurgorScene = () => {
  const f = useCurrentFrame();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const ionLabel = interpolate(f, [30, 55], [0, 1], clampBoth);
  const waterLabel = interpolate(f, [80, 105], [0, 1], clampBoth);
  const turgorLabel = interpolate(f, [140, 165], [0, 1], clampBoth);
  const foldLabel = interpolate(f, [200, 225], [0, 1], clampBoth);

  const firmWater = 0.88 + Math.sin(f / 25) * 0.015;
  const drainWater = interpolate(f, [60, 200], [0.88, 0.25], clampBoth);
  const leafFold = interpolate(f, [200, 320], [0, 1], clampBoth);
  const dividerOpacity = interpolate(f, [10, 30], [0, 1], clampBoth);
  const ionFlow = interpolate(f, [30, 60], [0, 1], clampBoth);

  return (
    <>
    <CameraRig move="craneUp" dur={680}>
    <Frame
      scene={4}
      tag="মূল রহস্য"
      title={
        <>
          <span style={{ color: colors.water }}>টার্গর চাপ</span>
          <br />
          পাতা ভাঁজের কারণ
        </>
      }
      subtitle="পানি ও আয়নের চলাচল বদলায় কোষে"
      bgGradient={`radial-gradient(ellipse at 50% 40%, ${colors.charcoal} 0%, #0D1B16 80%)`}
    >
      <svg
        width="1080"
        height="1050"
        style={{ position: "absolute", top: 580 }}
      >
        <defs>
          <marker id="tg-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={colors.water} />
          </marker>
          <linearGradient id="tg-pl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.leafGreen} stopOpacity={0.18} />
            <stop offset="1" stopColor={colors.forestGreen} stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="tg-pr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.coral} stopOpacity={0.16} />
            <stop offset="1" stopColor={colors.forestGreen} stopOpacity={0.08} />
          </linearGradient>
        </defs>

        {/* Split panels */}
        <rect x={60} y={40} width={460} height={540} rx={34} fill="url(#tg-pl)" stroke={colors.leafGreen} strokeWidth={1.2} />
        <rect x={560} y={40} width={460} height={540} rx={34} fill="url(#tg-pr)" stroke={colors.coral} strokeWidth={1.2} />

        <text x={290} y={92} textAnchor="middle" fontSize={30} fontWeight={700} fill={colors.lightLeaf}>
          স্বাভাবিক অবস্থা
        </text>
        <text x={790} y={92} textAnchor="middle" fontSize={30} fontWeight={700} fill={colors.coral}>
          স্পর্শের পরে
        </text>

        <line x1={540} y1={70} x2={540} y2={550} stroke={colors.paper} strokeWidth={1} opacity={dividerOpacity * 0.2} strokeDasharray="6 4" />

        {/* Cells */}
        <PlantCell x={290} y={255} waterLevel={firmWater} scale={0.95} id="tgL" />
        <PlantCell x={790} y={255} waterLevel={drainWater} ionFlow={ionFlow} scale={0.95} id="tgR" />

        {/* State pills under cells */}
        <g>
          <rect x={170} y={392} width={240} height={42} rx={21} fill={`${colors.leafGreen}30`} stroke={colors.leafGreen} />
          <text x={290} y={421} textAnchor="middle" fontSize={24} fontWeight={650} fill={colors.lightLeaf}>
            টার্গর = উচ্চ
          </text>
          <rect x={670} y={392} width={240} height={42} rx={21} fill={`${colors.coral}30`} stroke={colors.coral} />
          <text x={790} y={421} textAnchor="middle" fontSize={24} fontWeight={650} fill={colors.coral}>
            টার্গর = নিম্ন
          </text>
        </g>

        {/* Leaves under each cell */}
        <g transform="translate(290 545)">
          <path d="M0,0 Q4,-24 0,-48" stroke="#6c9a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
          <g transform="translate(0 -48) rotate(-90)">
            <LeafSprig fold={0} scale={0.5} p="tgA" />
          </g>
          <text x={72} y={-30} fontSize={22} fill={colors.sage}>
            পাতা খোলা
          </text>
        </g>
        <g transform="translate(790 545)">
          <path d="M0,0 Q4,-24 0,-48" stroke="#6c9a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
          <g transform="translate(0 -48) rotate(-90)">
            <LeafSprig fold={leafFold} scale={0.5} p="tgB" />
          </g>
          <text x={72} y={-30} fontSize={22} fill={colors.coral}>
            পাতা ভাঁজ
          </text>
        </g>

        {/* Water flowing between cells */}
        {waterLabel > 0 && (
          <g opacity={waterLabel}>
            <path
              d={WATER_PATH}
              fill="none"
              stroke={colors.water}
              strokeWidth={2.5}
              strokeDasharray="8 6"
              strokeDashoffset={-f * 0.8}
              markerEnd="url(#tg-arrow)"
            />
            {Array.from({ length: 5 }, (_, i) => {
              const t = (f / 90 + i / 5) % 1;
              const p = pointOnPath(WATER_PATH, t);
              return (
                <g key={i} opacity={Math.sin(t * Math.PI)}>
                  <circle cx={p.x} cy={p.y} r={9} fill={colors.water} opacity={0.3} />
                  <circle cx={p.x} cy={p.y} r={5} fill="#d8f3ff" />
                </g>
              );
            })}
            <text x={546} y={196} textAnchor="middle" fontSize={24} fontWeight={600} fill={colors.water}>
              পানি বেরিয়ে যায়
            </text>
          </g>
        )}

        {/* Explanation chain */}
        <g transform="translate(0 625)">
          <Chip x={90} y={0} w={400} n="১" text="আয়ন চলাচল" color={colors.ion} textColor={colors.paper} op={ionLabel} />
          <Chip x={590} y={0} w={400} n="২" text="পানির পুনর্বণ্টন" color={colors.water} textColor={colors.paper} op={waterLabel} />
          <Chip x={90} y={76} w={400} n="৩" text="Turgor Pressure কমে" color={colors.warmGold} textColor={colors.sunlight} op={turgorLabel} />
          <Chip x={590} y={76} w={400} n="৪" text="পাতা ভাঁজ হয়" color={colors.signal} textColor={colors.signal} op={foldLabel} />
        </g>
      </svg>
    </Frame>
    </CameraRig>
    <ExposurePulse atFrame={70} strength={0.18} color="#7FD3F0" />
    </>
  );
};