import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../styles/theme";

/** Animated electrical signal traveling along a path */
export const SignalPath = ({
  path,
  progress = 0,
  color = colors.glow,
  width = 3,
}: {
  path: string;
  progress?: number;
  color?: string;
  width?: number;
}) => {
  const f = useCurrentFrame();
  const dashOffset = 200 - progress * 200;
  const glowPulse = 0.4 + Math.sin(f / 6) * 0.15;

  return (
    <g>
      {/* Background dim path */}
      <path
        d={path}
        fill="none"
        stroke={colors.forestGreen}
        strokeWidth={width + 2}
        opacity={0.2}
        strokeLinecap="round"
      />
      {/* Animated signal */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray="8 12"
        strokeDashoffset={dashOffset}
        opacity={progress > 0.01 ? 0.8 : 0}
        strokeLinecap="round"
      />
      {/* Glow overlay */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={width + 6}
        strokeDasharray="4 16"
        strokeDashoffset={dashOffset - f * 0.5}
        opacity={progress > 0.01 ? glowPulse * progress : 0}
        strokeLinecap="round"
        filter="url(#signalGlow)"
      />
    </g>
  );
};

/** SVG filter definition for the signal glow — include this once */
export const SignalGlowFilter = () => (
  <defs>
    <filter id="signalGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);
