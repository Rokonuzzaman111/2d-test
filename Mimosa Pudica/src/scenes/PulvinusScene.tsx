import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { Frame } from "./Frame";
import {
  LeafSprig,
  LeafDefs,
  MiniCell,
  lerp,
  rnd,
} from "../components/Botanical";
import { colors } from "../styles/theme";
import { CameraRig } from "./Cinematics";

const PIV = { x: 300, y: 430 };
const PLEN = 270;

/** Scene 4 — THE PULVINUS: the special joint structure */
export const PulvinusScene = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const zoom = interpolate(f, [0, 60], [0.9, 1], clampBoth);
  const sig = interpolate(f, [25, 95], [0, 1], clampBoth);
  const hi = spring({
    frame: Math.max(0, f - 95),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const pulvLabel = interpolate(f, [110, 135], [0, 1], clampBoth);
  const lensReveal = interpolate(f, [140, 175], [0, 1], clampBoth);
  const fold = interpolate(f, [205, 330], [0, 1], {
    ...clampBoth,
    easing: Easing.inOut(Easing.cubic),
  });
  const chips = interpolate(f, [340, 370], [0, 1], clampBoth);

  const ang = lerp(-16, 52, fold);
  const lowerLevel = lerp(0.9, 0.3, fold);

  return (
    <>
    <CameraRig move="macroPush" dur={400}>
    <Frame
      scene={3}
      tag="বৈজ্ঞানিক ব্যাখ্যা"
      title={
        <>
          <span style={{ color: colors.sunlight }}>পুলভিনাস</span>
          <br />
          পাতার বিশেষ অংশ
        </>
      }
      subtitle="Pulvinus — পাতার নড়াচড়ার বিশেষ অংশ"
    >
      <svg
        width="1080"
        height="1000"
        style={{
          position: "absolute",
          top: 620,
          transform: `scale(${zoom})`,
          transformOrigin: "50% 30%",
        }}
      >
        <LeafDefs p="pv" />
        <defs>
          <linearGradient id="pv-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f3a2c" stopOpacity={0.85} />
            <stop offset="1" stopColor="#0f1f18" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="pv-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colors.sunlight} />
            <stop offset="1" stopColor={colors.warmGold} />
          </linearGradient>
          <linearGradient id="pv-pet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fb552" />
            <stop offset="1" stopColor="#5f8f3a" />
          </linearGradient>
          <clipPath id="pv-lens">
            <circle r={170} />
          </clipPath>
          <marker id="pv-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <polygon points="0 0, 10 4, 0 8" fill={colors.sunlight} />
          </marker>
        </defs>

        {/* Cutaway card */}
        <rect x={50} y={40} width={980} height={880} rx={44} fill="url(#pv-card)" stroke={colors.forestGreen} strokeWidth={1.6} />

        {/* Stem with vascular bundles */}
        <rect x={212} y={130} width={78} height={700} rx={36} fill="url(#pv-stem)" />
        <line x1={236} y1={150} x2={236} y2={810} stroke="#c8e6a0" strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />
        <line x1={266} y1={150} x2={266} y2={810} stroke="#c8e6a0" strokeOpacity={0.25} strokeWidth={4} strokeLinecap="round" />

        {/* Petiole + leaf, rotating around the joint */}
        <g transform={`translate(${PIV.x} ${PIV.y}) rotate(${ang})`}>
          <path d={`M0,-8 L${PLEN},-4 L${PLEN},4 L0,8Z`} fill="url(#pv-pet)" stroke="#4a7a2c" strokeWidth={1.5} strokeLinejoin="round" />
          <line x1={10} y1={0} x2={PLEN} y2={0} stroke="#d4f0a8" strokeOpacity={0.35} strokeWidth={1.4} />
          <g transform={`translate(${PLEN} 0)`}>
            <LeafSprig fold={fold} scale={1.3} p="pvl" />
          </g>
          {/* signal travelling back towards the joint */}
          {sig > 0 && sig < 1 && (
            <g transform={`translate(${(1 - sig) * PLEN} 0)`}>
              <circle r={16 + Math.sin(f / 3) * 3} fill={colors.glow} opacity={0.3} />
              <circle r={6} fill="#fff" />
            </g>
          )}
        </g>

        {/* The pulvinus itself */}
        <g>
          <circle
            cx={PIV.x + 14}
            cy={PIV.y}
            r={36 + hi * 10}
            fill="none"
            stroke={colors.sunlight}
            strokeWidth={3}
            strokeDasharray={hi > 0 ? "none" : "4 4"}
            opacity={0.35 + hi * 0.4}
          />
          <ellipse cx={PIV.x + 14} cy={PIV.y} rx={36} ry={30} fill="url(#pv-gold)" stroke="#fff3c4" strokeWidth={2} />
          <ellipse cx={PIV.x + 6} cy={PIV.y - 6} rx={20} ry={10} fill="#fff" opacity={0.22} />
          <ellipse cx={PIV.x + 4} cy={PIV.y + 6} rx={6} ry={5} fill="#fff3c4" opacity={0.55} />
          <ellipse cx={PIV.x + 24} cy={PIV.y + 8} rx={6} ry={5} fill="#fff3c4" opacity={0.45} />
          <ellipse cx={PIV.x + 16} cy={PIV.y - 8} rx={5} ry={4} fill="#fff3c4" opacity={0.4} />
        </g>

        {/* Pulvinus label */}
        <g opacity={pulvLabel} transform={`translate(0 ${10 * (1 - pulvLabel)})`}>
          <path d={`M360,196 Q330,300 ${PIV.x + 18},${PIV.y - 38}`} fill="none" stroke={colors.sunlight} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.7} />
          <rect x={320} y={130} width={320} height={64} rx={32} fill={colors.sunlight} />
          <text x={480} y={174} textAnchor="middle" fontSize={36} fontWeight={800} fill={colors.deepForest}>
            Pulvinus
          </text>
        </g>

        {/* Magnifier */}
        <g opacity={lensReveal}>
          <path
            d={`M${PIV.x + 52},${PIV.y + 22} Q480,540 622,628`}
            fill="none"
            stroke={colors.sunlight}
            strokeWidth={2.2}
            strokeDasharray="6 5"
            markerEnd="url(#pv-arrow)"
            opacity={0.8}
          />
          <g transform="translate(790 650)">
            <circle r={180} fill="#0b1a12" stroke={colors.sunlight} strokeWidth={3.5} />
            <g clipPath="url(#pv-lens)">
              <rect x={-180} y={-180} width={360} height={360} fill="#10261b" />
              {/* upper (extensor) cells stay firm */}
              {[0, 1, 2].flatMap((j) =>
                Array.from({ length: 6 }, (_, i) => (
                  <MiniCell key={`u${j}-${i}`} x={-155 + i * 62} y={-52 - j * 56} w={56} h={52} level={0.9} />
                )),
              )}
              {/* lower (flexor) cells lose water */}
              {[0, 1, 2].flatMap((j) =>
                Array.from({ length: 6 }, (_, i) => (
                  <MiniCell key={`l${j}-${i}`} x={-155 + i * 62} y={52 + j * 56} w={56} h={52} level={lowerLevel} />
                )),
              )}
              {/* ions leaving lower cells */}
              {fold > 0.02 &&
                Array.from({ length: 14 }, (_, i) => {
                  const col = i % 6;
                  const row = Math.floor(i / 6);
                  const ph = (f / 40 + rnd(i + 3)) % 1;
                  return (
                    <circle
                      key={i}
                      cx={-155 + col * 62 + (rnd(i + 9) - 0.5) * 20}
                      cy={52 + row * 56 + ph * 34}
                      r={4}
                      fill={colors.ion}
                      opacity={Math.sin(ph * Math.PI) * Math.min(1, fold * 3)}
                    />
                  );
                })}
              {/* centre band with captions */}
              <rect x={-180} y={-27} width={360} height={54} fill="#0b1a12" opacity={0.92} />
              <text x={0} y={-6} textAnchor="middle" fontSize={21} fontWeight={600} fill={colors.mint}>
                ওপরের কোষ: ফোলা
              </text>
              <text x={0} y={19} textAnchor="middle" fontSize={21} fontWeight={600} fill={colors.coral}>
                নিচের কোষ: চুপসে যায়
              </text>
            </g>
            <circle r={172} fill="none" stroke="#fff" strokeOpacity={0.1} strokeWidth={8} />
          </g>
        </g>

        {/* Flow summary */}
        <g opacity={chips}>
          <text x={540} y={888} textAnchor="middle" fontSize={28} fontWeight={600} fill={colors.sage}>
            সংকেত → পুলভিনাস → প্রতিক্রিয়া
          </text>
        </g>
      </svg>
    </Frame>
    </CameraRig>
    </>
  );
};