import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Frame } from "./Frame";
import {
  RealMimosa,
  Hand,
  Ground,
  LightRays,
  Fireflies,
  mimosaTip,
  clamp01,
} from "../components/Botanical";
import { colors } from "../styles/theme";

const PX = 540;
const PY = 915;
const PS = 1.25;

/** Scene 1 — THE MYSTERY: finger touches mimosa, leaves fold */
export const MysteryScene = () => {
  const f = useCurrentFrame();
  const clampBoth = {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;

  const tip = mimosaTip(PX, PY, PS, 0, 1);

  // Camera slowly pushes in
  const zoom = interpolate(f, [0, 280], [1, 1.1], {
    extrapolateRight: "clamp",
  });

  // Hand comes in, waits, touches, then pulls away
  const handP = interpolate(f, [40, 140, 188, 250], [0, 1, 1, 0], {
    ...clampBoth,
  });
  const ripple = clamp01((f - 142) / 40);

  // Leaves fold from the touched leaf downwards
  const fold = interpolate(f, [152, 240], [0, 1], {
    ...clampBoth,
    easing: Easing.out(Easing.cubic),
  });

  const rayOpacity = interpolate(f, [0, 30, 140, 160], [0, 0.55, 0.55, 0.25], {
    extrapolateRight: "clamp",
  });

  const textReveal = interpolate(f, [170, 195], [0, 1], clampBoth);

  return (
    <Frame
      scene={0}
      tag="রহস্যের শুরু"
      title={
        <>
          একটা স্পর্শ…
          <br />
          <span style={{ color: colors.signal }}>আর পাতা বন্ধ!</span>
        </>
      }
      subtitle="লজ্জাবতী গাছ কি সত্যিই লজ্জা পায়?"
    >
      <svg
        width="1080"
        height="1050"
        style={{
          position: "absolute",
          top: 580,
          transform: `scale(${zoom})`,
          transformOrigin: "50% 40%",
        }}
      >
        <defs>
          <radialGradient id="my-halo" cx="0.5" cy="0.55" r="0.55">
            <stop offset="0" stopColor={colors.sunlight} stopOpacity={0.16} />
            <stop offset="1" stopColor={colors.sunlight} stopOpacity={0} />
          </radialGradient>
        </defs>

        <circle cx={PX} cy={560} r={430} fill="url(#my-halo)" />
        <LightRays opacity={rayOpacity} h={950} />

        <Ground x={PX} y={PY} w={780} layer="back" id="my-gr" />
        <RealMimosa
          x={PX}
          y={PY}
          scale={PS}
          foldProgress={fold}
          cascade
          showGlow={f > 150 && f < 300}
          idPrefix="my"
        />
        <Ground x={PX} y={PY} w={780} layer="front" id="my-gr" />

        <Fireflies count={16} h={900} seed={3} />

        <Hand x={tip.x} y={tip.y} progress={handP} pulse={ripple} />

        {/* Flash text at the fold moment */}
        {textReveal > 0 && (
          <g
            opacity={textReveal}
            transform={`translate(0 ${12 * (1 - textReveal)})`}
          >
            <rect
              x={190}
              y={60}
              width={700}
              height={86}
              rx={43}
              fill={colors.deepForest}
              opacity={0.88}
              stroke={colors.signal}
              strokeWidth={1.8}
            />
            <circle cx={250} cy={103} r={9} fill={colors.signal} />
            <circle cx={250} cy={103} r={16 + (f % 30) * 0.4} fill="none" stroke={colors.signal} strokeOpacity={0.4} />
            <text
              x={560}
              y={116}
              textAnchor="middle"
              fontSize={38}
              fontWeight={700}
              fill={colors.paper}
            >
              গাছটি কীভাবে জানল?
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};