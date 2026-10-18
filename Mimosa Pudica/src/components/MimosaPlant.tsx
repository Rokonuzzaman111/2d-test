import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors } from "../styles/theme";

/** Renders a single Mimosa pudica leaflet pair that can fold */
const LeafletPair = ({
  x,
  y,
  angle,
  foldProgress,
  size = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  angle: number;
  foldProgress: number;
  size?: number;
  delay?: number;
}) => {
  // Each pair has two small oval leaflets, mirrored
  const fold = Math.max(0, Math.min(1, foldProgress - delay * 0.08));
  const leftAngle = -35 - fold * 50;
  const rightAngle = 35 + fold * 50;
  const scale = size * (1 - fold * 0.05);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      {/* Left leaflet */}
      <g transform={`rotate(${leftAngle})`}>
        <ellipse
          cx={0}
          cy={-14}
          rx={5}
          ry={14}
          fill={colors.leafGreen}
          stroke={colors.emerald}
          strokeWidth={0.8}
          opacity={0.9}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-26}
          stroke={colors.emerald}
          strokeWidth={0.5}
          opacity={0.6}
        />
      </g>
      {/* Right leaflet */}
      <g transform={`rotate(${rightAngle})`}>
        <ellipse
          cx={0}
          cy={-14}
          rx={5}
          ry={14}
          fill={colors.lightLeaf}
          stroke={colors.emerald}
          strokeWidth={0.8}
          opacity={0.9}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-26}
          stroke={colors.emerald}
          strokeWidth={0.5}
          opacity={0.6}
        />
      </g>
    </g>
  );
};

/** A compound leaf (pinna) with multiple leaflet pairs along a rachis */
const Pinna = ({
  x,
  y,
  angle,
  length = 120,
  pairs = 8,
  foldProgress,
  droopProgress = 0,
}: {
  x: number;
  y: number;
  angle: number;
  length?: number;
  pairs?: number;
  foldProgress: number;
  droopProgress?: number;
}) => {
  const droop = droopProgress * 25;
  const spacing = length / (pairs + 1);
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${angle + droop})`}
    >
      {/* Rachis (main axis of the pinna) */}
      <line
        x1={0}
        y1={0}
        x2={length}
        y2={0}
        stroke={colors.emerald}
        strokeWidth={2}
        opacity={0.7}
      />
      {/* Leaflet pairs along the rachis */}
      {Array.from({ length: pairs }, (_, i) => (
        <LeafletPair
          key={i}
          x={spacing * (i + 1)}
          y={0}
          angle={0}
          foldProgress={foldProgress}
          size={0.7 + 0.3 * (1 - i / pairs)}
          delay={i}
        />
      ))}
    </g>
  );
};

/** Full Mimosa pudica plant illustration with multiple pinnae */
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
  const { fps } = useVideoConfig();
  const sway = Math.sin(f / 60) * 2;
  const droop = foldProgress;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Main stem */}
      <path
        d={`M0,0 Q${-5 + sway},${-80} ${-3 + sway},${-160} Q${sway},${-240} ${2 + sway},${-320}`}
        stroke={colors.forestGreen}
        strokeWidth={5}
        fill="none"
        opacity={0.9}
      />
      {/* Petiole junction (where pinnae meet stem) */}
      <circle
        cx={2 + sway}
        cy={-320}
        r={6}
        fill={colors.emerald}
        stroke={colors.forestGreen}
        strokeWidth={1.5}
      />

      {/* Four pinnae radiating from the petiole */}
      <g transform={`translate(${2 + sway} ${-320})`}>
        <Pinna
          x={0} y={0} angle={-45}
          length={130} pairs={9}
          foldProgress={foldProgress}
          droopProgress={droop}
        />
        <Pinna
          x={0} y={0} angle={-135}
          length={125} pairs={8}
          foldProgress={foldProgress}
          droopProgress={droop}
        />
        <Pinna
          x={0} y={0} angle={45}
          length={130} pairs={9}
          foldProgress={foldProgress}
          droopProgress={droop}
        />
        <Pinna
          x={0} y={0} angle={135}
          length={125} pairs={8}
          foldProgress={foldProgress}
          droopProgress={droop}
        />
      </g>

      {/* Second leaf, lower on stem */}
      <g transform={`translate(${-1 + sway * 0.7} ${-180})`}>
        <circle cx={0} cy={0} r={4} fill={colors.emerald} />
        <Pinna
          x={0} y={0} angle={-55}
          length={95} pairs={7}
          foldProgress={Math.max(0, foldProgress - 0.15)}
          droopProgress={Math.max(0, droop - 0.15)}
        />
        <Pinna
          x={0} y={0} angle={-125}
          length={90} pairs={6}
          foldProgress={Math.max(0, foldProgress - 0.15)}
          droopProgress={Math.max(0, droop - 0.15)}
        />
        <Pinna
          x={0} y={0} angle={55}
          length={95} pairs={7}
          foldProgress={Math.max(0, foldProgress - 0.2)}
          droopProgress={Math.max(0, droop - 0.2)}
        />
        <Pinna
          x={0} y={0} angle={125}
          length={90} pairs={6}
          foldProgress={Math.max(0, foldProgress - 0.2)}
          droopProgress={Math.max(0, droop - 0.2)}
        />
      </g>

      {/* Glow effect at touch point */}
      {showGlow && (
        <circle
          cx={2 + sway}
          cy={-320}
          r={40 + Math.sin(f / 8) * 5}
          fill="none"
          stroke={colors.glow}
          strokeWidth={2}
          opacity={0.3 + Math.sin(f / 12) * 0.15}
        />
      )}
    </g>
  );
};
