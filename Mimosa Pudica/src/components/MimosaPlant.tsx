import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";
import {
  LeafFilters,
  DewBead,
  Trichomes,
  LeafVeins,
  wobble,
  microTremor,
  breathe,
  nrand,
  ContactShadow,
} from "./Realism";

const P = "mp"; // filter prefix

/** One leaflet: lenticular blade, veins, cuticle gloss, dew, night-fold curl */
const Leaflet = ({
  x,
  y,
  angle,
  foldProgress,
  size = 1,
  delay = 0,
  side = 1,
}: {
  x: number;
  y: number;
  angle: number;
  foldProgress: number;
  size?: number;
  delay?: number;
  side?: 1 | -1;
}) => {
  const f = useCurrentFrame();
  const fold = Math.max(0, Math.min(1, foldProgress - delay * 0.06));
  // Leaflets fold upward & inward like closing hands, not flat rotation
  const foldAngle = fold * 78 * side;
  const droopAngle = fold * fold * 22 * -side; // late-stage gravity droop
  const flutter = microTremor(f + delay * 37, 0.5, `lf${x}${y}`);
  // When folded we see the paler abaxial (underside) surface
  const underside = fold;
  const h = 15 * size;
  const w = 4.6 * size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle + foldAngle + droopAngle + flutter})`}>
      {/* Blade — narrow oblong with pointed tip */}
      <path
        d={`M0,0 Q${-w},${-h * 0.45} ${-w * 0.82},${-h * 0.8} Q0,${-h * 1.22} ${w * 0.82},${-h * 0.8} Q${w},${-h * 0.45} 0,0 Z`}
        fill={underside > 0.5 ? `url(#${P}-leafBack)` : `url(#${P}-leafGrad)`}
        stroke="#1B4A30"
        strokeWidth={0.4}
        opacity={0.96}
        filter={`url(#${P}-cuticle)`}
      />
      {/* Pinnate venation */}
      <LeafVeins w={w} h={h} pairs={5} />
      {/* Cuticle specular streak follows light */}
      <ellipse
        cx={-w * 0.25}
        cy={-h * 0.55}
        rx={w * 0.4}
        ry={h * 0.32}
        fill={`url(#${P}-specular)`}
        opacity={0.55 + wobble(f + delay * 11, 0.6, x) * 0.2}
      />
      {/* Margin cilia (fine hairs on edge) */}
      {[...Array(4)].map((_, i) => (
        <line
          key={i}
          x1={-w * 0.75 + i * 0.4}
          y1={-h * (0.3 + i * 0.18)}
          x2={-w * 0.75 - 1.4 + i * 0.4}
          y2={-h * (0.32 + i * 0.18)}
          stroke="#BFE6CD"
          strokeWidth={0.3}
          opacity={0.5}
        />
      ))}
      {/* Occasional dew bead catching light */}
      {nrand(`dew${x}${y}`) > 0.72 && (
        <DewBead cx={w * 0.2} cy={-h * 0.6} r={1.1 * size} idPrefix={P} shimmerSeed={`${x}-${y}`} />
      )}
    </g>
  );
};

/** A pinna: rachis with N leaflet pairs, pulvinus at base, thorn-prickled axis */
const Pinna = ({
  x,
  y,
  angle,
  length = 120,
  pairs = 8,
  foldProgress,
  droopProgress = 0,
  seed = 0,
}: {
  x: number;
  y: number;
  angle: number;
  length?: number;
  pairs?: number;
  foldProgress: number;
  droopProgress?: number;
  seed?: number;
}) => {
  const f = useCurrentFrame();
  const droop = droopProgress * 34 + wobble(f + seed * 90, 0.5, seed) * 1.2;
  // Rachis gently curved, thicker near base
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle + droop})`}>
      {/* Basal pulvinus — swollen joint that drives the movement */}
      <ellipse cx={0} cy={0} rx={4.4} ry={3} fill="#7FAF8E" stroke="#3E6B4C" strokeWidth={0.6} />
      <ellipse cx={-1} cy={-1} rx={1.6} ry={1} fill="#CFEBD6" opacity={0.7} />
      {/* Curved rachis with two-tone shading for cylindrical volume */}
      <path
        d={`M0,0 Q${length * 0.5},${-5 - nrand(`r${seed}`) * 3} ${length},${-2}`}
        stroke={colors.emerald}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M2,-0.8 Q${length * 0.5},-5.4 ${length - 2},-2.6`}
        stroke="#8FDCAE"
        strokeWidth={0.7}
        fill="none"
        opacity={0.5}
      />
      {/* Tiny prickles along rachis */}
      {[...Array(5)].map((_, i) => {
        const t = 0.15 + i * 0.18;
        const px = length * t;
        const py = -5 * Math.sin(Math.PI * t) - 1;
        return (
          <line key={i} x1={px} y1={py} x2={px + 1} y2={py - 3.2} stroke="#DCEFD8" strokeWidth={0.5} opacity={0.6} />
        );
      })}
      {/* Leaflet pairs — distal ones slightly smaller (real morphology) */}
      {Array.from({ length: pairs }, (_, i) => {
        const t = (i + 1) / (pairs + 1);
        const px = length * t;
        const py = -5 * Math.sin(Math.PI * t);
        const sz = (0.72 + 0.38 * (1 - t)) * (1 - i / (pairs * 3));
        return (
          <g key={i}>
            {/* secondary pulvini at each petiolule */}
            <circle cx={px} cy={py} r={1.3} fill="#8FBF9C" />
            <Leaflet x={px} y={py} angle={-8} foldProgress={foldProgress} size={sz} delay={i} side={-1} />
            <Leaflet x={px} y={py} angle={8} foldProgress={foldProgress} size={sz} delay={i + 1} side={1} />
          </g>
        );
      })}
      {/* Terminal leaflet pair fused at tip */}
      <Leaflet x={length} y={-2} angle={0} foldProgress={foldProgress} size={0.6} delay={pairs} side={1} />
    </g>
  );
};

/** Full Mimosa pudica plant — multi-depth, hairy stem, pink flower head, soil base */
export const MimosaPlant = ({
  x = 540,
  y = 900,
  scale = 1,
  foldProgress = 0,
  showGlow = false,
}: {
  x?: number;
  y?: number;
  scale?: number;
  foldProgress?: number;
  showGlow?: boolean;
}) => {
  const f = useCurrentFrame();
  const sway = wobble(f, 0.5, 1) * 2.6;
  const br = breathe(f, 5, 0.008);
  const droop = foldProgress;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * br})`}>
      <LeafFilters idPrefix={P} />

      {/* Ground contact shadow */}
      <ContactShadow cx={0} cy={4} rx={90 * scale} ry={12} opacity={0.4} />

      {/* Soil mound with crumb texture */}
      <path d="M-70,6 Q0,-14 70,6 L70,14 L-70,14 Z" fill="#2E2018" />
      {[...Array(16)].map((_, i) => (
        <circle
          key={i}
          cx={-60 + nrand(`soil${i}`) * 120}
          cy={2 + nrand(`soilY${i}`) * 9}
          r={0.8 + nrand(`soilR${i}`) * 1.8}
          fill={i % 3 ? "#3D2C20" : "#241812"}
          opacity={0.9}
        />
      ))}

      {/* Main stem — thorny, hairy, quadrangular look via twin strokes */}
      <path
        d={`M0,0 Q${-6 + sway},${-80} ${-4 + sway},${-160} Q${sway},${-240} ${2 + sway},${-320}`}
        stroke={colors.forestGreen}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-1.4,-4 Q${-7 + sway},${-80} ${-5 + sway},${-160} Q${-1 + sway},${-240} ${0.6 + sway},${-316}`}
        stroke="#7FC49A"
        strokeWidth={1.4}
        fill="none"
        opacity={0.5}
      />
      {/* Trichome belts at three stem heights */}
      <Trichomes x1={-3 + sway * 0.3} y1={-60} x2={-4 + sway * 0.6} y2={-140} count={10} len={4.5} seed="t1" />
      <Trichomes x1={-2 + sway * 0.7} y1={-190} x2={0 + sway} y2={-270} count={10} len={4.5} seed="t2" />
      {/* Prickles at nodes */}
      {[-100, -180, -260].map((ny, i) => (
        <g key={i} transform={`translate(${-4 + sway * (ny / -320)} ${ny})`}>
          <path d="M0,0 L-5,-7 L1,-2 Z" fill="#E4DCC8" opacity={0.85} />
          <path d="M0,0 L5,-7 L-1,-2 Z" fill="#D2CBB4" opacity={0.8} />
        </g>
      ))}

      {/* Petiole junction pulvinus (the famous swelling) */}
      <ellipse
        cx={2 + sway}
        cy={-320}
        rx={7}
        ry={5}
        fill="#87B896"
        stroke={colors.forestGreen}
        strokeWidth={1.2}
      />
      <ellipse cx={0 + sway} cy={-322} rx={2.6} ry={1.6} fill="#E2F5E6" opacity={0.65} />

      {/* Upper crown: four pinnae in a mimicosa "hand" spread */}
      <g transform={`translate(${2 + sway} ${-320})`}>
        <Pinna x={0} y={0} angle={-52} length={132} pairs={9} foldProgress={foldProgress} droopProgress={droop} seed={1} />
        <Pinna x={0} y={0} angle={-128} length={126} pairs={8} foldProgress={foldProgress} droopProgress={droop} seed={2} />
        <Pinna x={0} y={0} angle={52} length={130} pairs={9} foldProgress={foldProgress} droopProgress={droop} seed={3} />
        <Pinna x={0} y={0} angle={128} length={124} pairs={8} foldProgress={foldProgress} droopProgress={droop} seed={4} />
      </g>

      {/* Lower leaf whorl, delayed folding like real sequential response */}
      <g transform={`translate(${-1 + sway * 0.7} ${-180})`}>
        <ellipse cx={0} cy={0} rx={5} ry={3.6} fill="#7FAF8E" stroke={colors.forestGreen} strokeWidth={0.8} />
        <Pinna x={0} y={0} angle={-58} length={96} pairs={7} foldProgress={Math.max(0, foldProgress - 0.15)} droopProgress={Math.max(0, droop - 0.15)} seed={5} />
        <Pinna x={0} y={0} angle={-122} length={90} pairs={6} foldProgress={Math.max(0, foldProgress - 0.15)} droopProgress={Math.max(0, droop - 0.15)} seed={6} />
        <Pinna x={0} y={0} angle={58} length={94} pairs={7} foldProgress={Math.max(0, foldProgress - 0.2)} droopProgress={Math.max(0, droop - 0.2)} seed={7} />
        <Pinna x={0} y={0} angle={122} length={88} pairs={6} foldProgress={Math.max(0, foldProgress - 0.2)} droopProgress={Math.max(0, droop - 0.2)} seed={8} />
      </g>

      {/* Pink globular flower head on its own stalk (signature of M. pudica) */}
      <g transform={`translate(${26 + sway * 0.5} ${-250})`}>
        <line x1={-20} y1={20} x2={0} y2={0} stroke={colors.emerald} strokeWidth={1.6} />
        {[...Array(22)].map((_, i) => {
          const a = nrand(`fl${i}`) * Math.PI * 2;
          const r = nrand(`flr${i}`) * 7;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r * 0.85;
          const st = 3 + nrand(`fls${i}`) * 3;
          return (
            <g key={i}>
              <line x1={px} y1={py} x2={px + Math.cos(a) * st} y2={py + Math.sin(a) * st} stroke="#F2A9C4" strokeWidth={0.7} opacity={0.9} />
              <circle cx={px + Math.cos(a) * st} cy={py + Math.sin(a) * st} r={1.1} fill="#E56FA1" />
            </g>
          );
        })}
        <circle cx={0} cy={0} r={3.4} fill="#D9578F" opacity={0.8} />
        <circle cx={-1.2} cy={-1.2} r={1.1} fill="#FFD3E4" opacity={0.9} />
      </g>

      {/* Signal glow travelling through the pulvinus when touched */}
      {showGlow && (
        <g>
          {[0, 1, 2].map((i) => {
            const cyc = ((f * 1.6 + i * 14) % 42) / 42;
            return (
              <ellipse
                key={i}
                cx={2 + sway}
                cy={-320}
                rx={8 + cyc * 46}
                ry={6 + cyc * 34}
                fill="none"
                stroke={colors.glow}
                strokeWidth={2 - cyc * 1.6}
                opacity={(1 - cyc) * 0.5}
              />
            );
          })}
          <ellipse cx={2 + sway} cy={-320} rx={10} ry={7} fill={colors.glow} opacity={0.18 + Math.sin(f / 9) * 0.08} style={{ filter: "blur(4px)" }} />
        </g>
      )}

      {/* Ambient depth: blurred background pinna behind the plant */}
      <g opacity={0.3} style={{ filter: "blur(3px)" }} transform={`translate(${-70 + sway * 0.4} ${-140}) scale(0.8)`}>
        <Pinna x={0} y={0} angle={-40} length={100} pairs={6} foldProgress={Math.max(0, foldProgress - 0.3)} droopProgress={droop * 0.6} seed={9} />
      </g>
    </g>
  );
};
