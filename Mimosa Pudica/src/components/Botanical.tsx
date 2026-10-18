import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";

/* ------------------------------------------------------------------ */
/*  Small math helpers                                                 */
/* ------------------------------------------------------------------ */
const RAD = Math.PI / 180;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
    const c = clamp01(t);
    return c * c * (3 - 2 * c);
};
/** deterministic pseudo random (Remotion needs frame-pure rendering) */
export const rnd = (n: number) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
};
const r2 = (n: number) => Math.round(n * 100) / 100;

const P = {
    leafLightA: "#6fcf55",
    leafLightB: "#b9f08a",
    leafDarkA: "#26803d",
    leafDarkB: "#5db853",
    rib: "#1f5a2c",
    pin: "#4f8a35",
    petiole: "#6c9a3a",
};

/* ------------------------------------------------------------------ */
/*  Gradient definitions shared by plant parts                         */
/* ------------------------------------------------------------------ */
export const LeafDefs = ({ p }: { p: string }) => (
    <defs>
        <linearGradient id={`${p}-lu`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor={P.leafLightA} />
            <stop offset="1" stopColor={P.leafLightB} />
        </linearGradient>
        <linearGradient id={`${p}-ld`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor={P.leafDarkA} />
            <stop offset="1" stopColor={P.leafDarkB} />
        </linearGradient>
        <linearGradient id={`${p}-stem`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f3320" />
            <stop offset="0.42" stopColor="#9a8650" />
            <stop offset="1" stopColor="#40612c" />
        </linearGradient>
        <radialGradient id={`${p}-pom`} cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#ffe3f1" />
            <stop offset="0.6" stopColor="#f59ccb" />
            <stop offset="1" stopColor="#d6428f" />
        </radialGradient>
        <radialGradient id={`${p}-glow`}>
            <stop offset="0" stopColor={colors.glow} stopOpacity={0.55} />
            <stop offset="1" stopColor={colors.glow} stopOpacity={0} />
        </radialGradient>
    </defs>
);

/* ------------------------------------------------------------------ */
/*  Leaflet / pinna                                                    */
/* ------------------------------------------------------------------ */
const leafPath = (L: number) => {
    const w = L * 0.27;
    return `M0,0 C${r2(L * 0.18)},${r2(-w * 1.2)} ${r2(L * 0.7)},${r2(-w * 1.2)} ${r2(L)},0 C${r2(L * 0.7)},${r2(w * 1.2)} ${r2(L * 0.18)},${r2(w * 1.2)} 0,0Z`;
};

/** One pinna: a thin stalk with pairs of leaflets that really fold forward */
export const Pinna = ({
    len,
    n,
    fold,
    p,
    sway = 0,
}: {
    len: number;
    n: number;
    fold: number;
    p: string;
    sway?: number;
}) => {
    const a = lerp(74, 8, fold);
    const items: ReactNode[] = [];
    for (let i = 0; i < n; i++) {
        const t = (i + 0.6) / (n + 0.1);
        const L = 21 * (1 - 0.45 * t) + 2;
        items.push(
            <g key={i} transform={`translate(${r2(t * len)} 0)`}>
                <g transform={`rotate(${r2(a)})`}>
                    <path d={leafPath(L)} fill={`url(#${p}-ld)`} stroke={P.rib} strokeOpacity={0.35} strokeWidth={0.6} />
                    <line x1={0} y1={0} x2={L * 0.88} y2={0} stroke={P.rib} strokeOpacity={0.4} strokeWidth={0.6} />
                </g>
                <g transform={`rotate(${r2(-a)})`}>
                    <path d={leafPath(L)} fill={`url(#${p}-lu)`} stroke={P.rib} strokeOpacity={0.35} strokeWidth={0.6} />
                    <line x1={0} y1={0} x2={L * 0.88} y2={0} stroke={P.rib} strokeOpacity={0.4} strokeWidth={0.6} />
                </g>
            </g>,
        );
    }
    return (
        <g transform={`rotate(${r2(sway)})`}>
            <path
                d={`M0,0 Q${r2(len / 2)},-2 ${r2(len)},1`}
                stroke={P.pin}
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
            />
            {items}
            <path
                d={leafPath(14)}
                transform={`translate(${r2(len - 1)} 0)`}
                fill={`url(#${p}-lu)`}
                stroke={P.rib}
                strokeOpacity={0.35}
                strokeWidth={0.6}
            />
        </g>
    );
};

const OPEN_OFF = [-58, -20, 18, 56];
const SHUT_OFF = [-13, -4.5, 4.5, 13];
const LEN_K = [0.78, 1, 1, 0.8];

/** A fan of four pinnae – use it as a small single leaf (pointing along +x) */
export const LeafSprig = ({
    fold = 0,
    scale = 1,
    p = "sp",
    sway = 0,
}: {
    fold?: number;
    scale?: number;
    p?: string;
    sway?: number;
}) => (
    <g transform={`scale(${scale})`}>
        <LeafDefs p={p} />
        {OPEN_OFF.map((o, k) => (
            <g key={k} transform={`rotate(${r2(lerp(o, SHUT_OFF[k], fold))})`}>
                <Pinna len={80 * LEN_K[k]} n={7} fold={fold} p={p} sway={sway} />
            </g>
        ))}
    </g>
);

/* ------------------------------------------------------------------ */
/*  Mimosa plant geometry                                              */
/* ------------------------------------------------------------------ */
export const MIMOSA_H = 430;
export const stemX = (h: number) =>
    Math.sin((h / MIMOSA_H) * Math.PI * 1.6) * 9;

type BranchDef = { h: number; side: 1 | -1; lp: number; pin: number; n: number };
export const BRANCHES: BranchDef[] = [
    { h: 392, side: 1, lp: 62, pin: 78, n: 7 },
    { h: 352, side: -1, lp: 66, pin: 84, n: 7 },
    { h: 300, side: 1, lp: 76, pin: 92, n: 8 },
    { h: 252, side: -1, lp: 80, pin: 94, n: 8 },
    { h: 202, side: 1, lp: 84, pin: 94, n: 8 },
    { h: 158, side: -1, lp: 86, pin: 92, n: 8 },
];
const openAngle = (i: number) => -40 + i * 7;
/** lower branches droop less so folded leaves never sink into the soil */
const shutAngle = (i: number) => 72 - i * 5;

const FLOWERS = [
    { x: -6, y: -488, r: 17, sx: -8.6, sy: -430 },
    { x: -32, y: -468, r: 13, sx: -8.6, sy: -420 },
];

export const mimosaTip = (x: number, y: number, s: number, bi = 0, k = 1) => {
    const b = BRANCHES[bi];
    const th = openAngle(bi) * RAD;
    const ex = stemX(b.h) + b.side * b.lp * Math.cos(th);
    const ey = -b.h + b.lp * Math.sin(th);
    const a2 = th + OPEN_OFF[k] * RAD;
    const L = b.pin * LEN_K[k] + 8;
    return {
        x: x + (ex + b.side * L * Math.cos(a2)) * s,
        y: y + (ey + L * Math.sin(a2)) * s,
    };
};
export const mimosaAttach = (x: number, y: number, s: number, bi: number) => {
    const b = BRANCHES[bi];
    return { x: x + stemX(b.h) * s, y: y - b.h * s };
};
export const mimosaStemPoint = (x: number, y: number, s: number, h: number) => ({
    x: x + stemX(h) * s,
    y: y - h * s,
});
export const mimosaFlower = (x: number, y: number, s: number, i = 0) => ({
    x: x + FLOWERS[i].x * s,
    y: y + FLOWERS[i].y * s,
});
/** Path of an electrical signal: touched leaflet → petiole → down the stem */
export const mimosaRoute = (x: number, y: number, s: number) => {
    const b = BRANCHES[0];
    const tip = mimosaTip(x, y, s, 0, 1);
    const th = openAngle(0) * RAD;
    const ex = x + (stemX(b.h) + b.side * b.lp * Math.cos(th)) * s;
    const ey = y + (-b.h + b.lp * Math.sin(th)) * s;
    let d = `M${r2(tip.x)},${r2(tip.y)} L${r2(ex)},${r2(ey)}`;
    for (let h = b.h; h >= 0; h -= 24) {
        d += ` L${r2(x + stemX(h) * s)},${r2(y - h * s)}`;
    }
    return d;
};

/* stem silhouette (tapered) */
const STEM_PATH = (() => {
    const left: string[] = [];
    const right: string[] = [];
    for (let h = 0; h <= MIMOSA_H; h += 14) {
        const w = lerp(13, 4, h / MIMOSA_H) / 2;
        left.push(`${r2(stemX(h) - w)},${-h}`);
        right.push(`${r2(stemX(h) + w)},${-h}`);
    }
    return `M${left.join(" L")} L${right.reverse().join(" L")}Z`;
})();

const PomPom = ({
    cx,
    cy,
    r,
    f,
    seed,
    p,
}: {
    cx: number;
    cy: number;
    r: number;
    f: number;
    seed: number;
    p: string;
}) => {
    const rays = 30;
    return (
        <g transform={`translate(${cx} ${cy}) rotate(${r2(Math.sin(f / 50 + seed) * 3)})`}>
            <circle r={r * 1.35} fill="#ff9bd0" opacity={0.12} />
            <circle r={r * 0.82} fill={`url(#${p}-pom)`} />
            {Array.from({ length: rays }, (_, i) => {
                const a = (i / rays) * Math.PI * 2 + seed;
                const len = r * (0.95 + 0.3 * rnd(i + seed * 9));
                const c = Math.cos(a);
                const s = Math.sin(a);
                return (
                    <g key={i}>
                        <line
                            x1={c * r * 0.3}
                            y1={s * r * 0.3}
                            x2={c * len}
                            y2={s * len}
                            stroke="#f8aad5"
                            strokeWidth={1.3}
                            strokeLinecap="round"
                            opacity={0.9}
                        />
                        <circle cx={c * len} cy={s * len} r={1.4} fill="#ffe9a8" />
                    </g>
                );
            })}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Mimosa pudica                                                      */
/* ------------------------------------------------------------------ */
export const RealMimosa = ({
    x,
    y,
    scale = 1,
    foldProgress = 0,
    showGlow = false,
    cascade = false,
    flowers = true,
    idPrefix = "mp",
    opacity = 1,
}: {
    x: number;
    y: number;
    scale?: number;
    foldProgress?: number;
    showGlow?: boolean;
    /** when true leaves fold one after the other, starting from the top */
    cascade?: boolean;
    flowers?: boolean;
    idPrefix?: string;
    opacity?: number;
}) => {
    const f = useCurrentFrame();
    const p = idPrefix;
    const N = BRANCHES.length;
    const foldFor = (i: number) => {
        if (!cascade) return smooth(foldProgress);
        const d = 0.1;
        return smooth(clamp01(foldProgress * (1 + d * (N - 1)) - i * d));
    };
    const globalFold = smooth(foldProgress);
    const plantSway = Math.sin(f / 55) * 0.5 * (1 - globalFold);

    const order = BRANCHES.map((_, i) => i).reverse();

    return (
        <g
            transform={`translate(${x} ${y}) rotate(${r2(plantSway)}) scale(${scale})`}
            opacity={opacity}
        >
            <LeafDefs p={p} />

            {showGlow && (
                <circle
                    cx={0}
                    cy={-300}
                    r={280}
                    fill={`url(#${p}-glow)`}
                    opacity={0.55 + 0.25 * Math.sin(f / 5)}
                />
            )}

            {/* stem */}
            <path d={STEM_PATH} fill={`url(#${p}-stem)`} />
            {/* thorns */}
            {Array.from({ length: 9 }, (_, i) => {
                const h = 45 + i * 42;
                const s = i % 2 === 0 ? 1 : -1;
                const sx = stemX(h);
                return (
                    <path
                        key={i}
                        d={`M${r2(sx)},${-h} L${r2(sx + s * 8)},${-h + 5} L${r2(sx)},${-h + 4}Z`}
                        fill="#b79e55"
                    />
                );
            })}

            {/* branches (lower first so upper leaves overlap) */}
            {order.map((i) => {
                const b = BRANCHES[i];
                const fo = foldFor(i);
                const sway = Math.sin(f / 42 + i * 1.7) * 2.2 * (1 - fo);
                const th = lerp(openAngle(i), shutAngle(i), fo) + sway;
                return (
                    <g key={i}>
                        <circle cx={stemX(b.h)} cy={-b.h} r={4.2} fill="#8a7a45" />
                        <g
                            transform={`translate(${r2(stemX(b.h))} ${-b.h}) scale(${b.side} 1) rotate(${r2(th)})`}
                        >
                            <path
                                d={`M0,0 Q${r2(b.lp * 0.5)},${r2(-6 + fo * 14)} ${b.lp},0`}
                                stroke={P.petiole}
                                strokeWidth={4.4}
                                strokeLinecap="round"
                                fill="none"
                            />
                            <g transform={`translate(${b.lp} 0)`}>
                                {OPEN_OFF.map((o, k) => (
                                    <g key={k} transform={`rotate(${r2(lerp(o, SHUT_OFF[k], fo))})`}>
                                        <Pinna
                                            len={b.pin * LEN_K[k]}
                                            n={b.n}
                                            fold={fo}
                                            p={p}
                                            sway={Math.sin(f / 33 + i + k) * 1.4 * (1 - fo)}
                                        />
                                    </g>
                                ))}
                            </g>
                        </g>
                    </g>
                );
            })}

            {/* flowers */}
            {flowers &&
                FLOWERS.map((fl, i) => (
                    <g key={i}>
                        <path
                            d={`M${fl.sx},${fl.sy} Q${r2((fl.sx + fl.x) / 2 - 4)},${r2((fl.sy + fl.y) / 2)} ${fl.x},${fl.y + fl.r * 0.6}`}
                            stroke="#7aa44a"
                            strokeWidth={2.2}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <PomPom cx={fl.x} cy={fl.y} r={fl.r} f={f} seed={i + 1} p={p} />
                    </g>
                ))}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Ground, grass, light and ambience                                  */
/* ------------------------------------------------------------------ */
export const Ground = ({
    x,
    y,
    w = 700,
    layer = "back",
    id = "gr",
}: {
    x: number;
    y: number;
    w?: number;
    layer?: "back" | "front";
    id?: string;
}) => {
    const f = useCurrentFrame();
    const greens = ["#2a7a3a", "#3f9a46", "#6cc152", "#1f6a36"];
    const count = layer === "back" ? 26 : 34;
    return (
        <g transform={`translate(${x} ${y})`}>
            {layer === "back" && (
                <>
                    <defs>
                        <radialGradient id={`${id}-soil`} cx="0.5" cy="0.35" r="0.7">
                            <stop offset="0" stopColor="#4a3524" />
                            <stop offset="1" stopColor="#150f0a" />
                        </radialGradient>
                    </defs>
                    <ellipse cx={0} cy={14} rx={w / 2} ry={34} fill={`url(#${id}-soil)`} />
                    <ellipse cx={0} cy={4} rx={70} ry={11} fill="#000" opacity={0.35} />
                    {Array.from({ length: 10 }, (_, i) => (
                        <ellipse
                            key={i}
                            cx={(rnd(i + 3) - 0.5) * w * 0.8}
                            cy={10 + rnd(i + 30) * 22}
                            rx={4 + rnd(i + 60) * 6}
                            ry={2.5 + rnd(i + 80) * 3}
                            fill="#6b5a44"
                            opacity={0.55}
                        />
                    ))}
                </>
            )}
            {Array.from({ length: count }, (_, i) => {
                const bx = (rnd(i + (layer === "back" ? 100 : 200)) - 0.5) * w * 0.94;
                const h = (layer === "back" ? 34 : 22) + rnd(i + 50) * 48;
                const lean = (rnd(i + 9) - 0.5) * 30;
                const sw = Math.sin(f / 32 + i * 0.7) * 5;
                const by = layer === "back" ? 4 : 14 + rnd(i + 5) * 10;
                return (
                    <path
                        key={i}
                        d={`M${r2(bx - 2.2)},${by} Q${r2(bx - 1 + lean * 0.3 + sw * 0.4)},${r2(by - h * 0.55)} ${r2(bx + lean + sw)},${r2(by - h)} Q${r2(bx + 2 + lean * 0.3 + sw * 0.4)},${r2(by - h * 0.5)} ${r2(bx + 2.2)},${by}Z`}
                        fill={greens[i % greens.length]}
                        opacity={layer === "back" ? 0.85 : 1}
                    />
                );
            })}
        </g>
    );
};

export const Fireflies = ({
    count = 14,
    w = 1080,
    h = 900,
    seed = 1,
    color = colors.sunlight,
}: {
    count?: number;
    w?: number;
    h?: number;
    seed?: number;
    color?: string;
}) => {
    const f = useCurrentFrame();
    return (
        <g>
            {Array.from({ length: count }, (_, i) => {
                const bx = rnd(i * 3 + seed) * w;
                const by = rnd(i * 5 + seed + 7) * h;
                const x = bx + Math.sin(f / 70 + i * 1.9) * 30 + Math.sin(f / 31 + i) * 8;
                const y = by + Math.cos(f / 90 + i * 2.3) * 24;
                const tw = 0.3 + 0.7 * Math.max(0, Math.sin(f / 18 + i * 1.7));
                return (
                    <g key={i} opacity={tw}>
                        <circle cx={x} cy={y} r={10} fill={color} opacity={0.16} />
                        <circle cx={x} cy={y} r={2.6} fill="#fff6c8" />
                    </g>
                );
            })}
        </g>
    );
};

export const LightRays = ({
    opacity = 0.4,
    h = 900,
}: {
    opacity?: number;
    h?: number;
}) => {
    const f = useCurrentFrame();
    const rays = [
        { x: 900, wd: 90, a: 0.9 },
        { x: 760, wd: 50, a: 0.6 },
        { x: 1020, wd: 120, a: 0.7 },
        { x: 640, wd: 36, a: 0.45 },
    ];
    return (
        <g opacity={opacity}>
            <defs>
                <linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={colors.sunlight} stopOpacity={0.35} />
                    <stop offset="1" stopColor={colors.sunlight} stopOpacity={0} />
                </linearGradient>
            </defs>
            {rays.map((r, i) => {
                const sh = Math.sin(f / 90 + i * 2) * 0.25 + 0.75;
                return (
                    <polygon
                        key={i}
                        points={`${r.x},0 ${r.x + r.wd},0 ${r.x + r.wd - 480},${h} ${r.x - r.wd * 0.2 - 480},${h}`}
                        fill="url(#rayG)"
                        opacity={r.a * sh}
                    />
                );
            })}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Hand with extended index finger (tip is at 0,0 when progress = 1)  */
/* ------------------------------------------------------------------ */
export const Hand = ({
    x,
    y,
    progress,
    pulse = 0,
}: {
    x: number;
    y: number;
    progress: number;
    /** 0..1 touch ripple */
    pulse?: number;
}) => {
    const f = useCurrentFrame();
    const e = smooth(progress);
    const dx = (1 - e) * 360;
    const dy = (1 - e) * 130;
    const tremor = Math.sin(f / 4) * (1 - e) * 1.6 + Math.sin(f / 9) * 0.6;
    const vis = clamp01(progress * 6);
    return (
        <g>
            {pulse > 0 && pulse < 1 && (
                <g>
                    <circle cx={x} cy={y} r={8 + pulse * 70} fill="none" stroke={colors.glow} strokeWidth={3 * (1 - pulse)} opacity={1 - pulse} />
                    <circle cx={x} cy={y} r={4 + pulse * 40} fill="none" stroke="#fff" strokeWidth={2 * (1 - pulse)} opacity={0.7 * (1 - pulse)} />
                </g>
            )}
            <g
                opacity={vis}
                transform={`translate(${r2(x + dx)} ${r2(y + dy + tremor)}) rotate(${r2(-4 + (1 - e) * 6)})`}
            >
                <defs>
                    <linearGradient id="hand-skin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f6d0ae" />
                        <stop offset="0.55" stopColor="#e3a982" />
                        <stop offset="1" stopColor="#c98760" />
                    </linearGradient>
                    <linearGradient id="hand-sleeve" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#2e5573" />
                        <stop offset="1" stopColor="#1d3a52" />
                    </linearGradient>
                </defs>
                {/* soft shadow */}
                <ellipse cx={230} cy={96} rx={230} ry={16} fill="#000" opacity={0.18} />
                {/* sleeve + cuff */}
                <path d="M440,-76 L760,-110 L760,130 L440,100 Q418,12 440,-76Z" fill="url(#hand-sleeve)" />
                <path d="M430,-72 Q410,12 430,96 L450,98 Q430,12 450,-74Z" fill="#e8eef2" opacity={0.9} />
                {/* wrist / forearm */}
                <path d="M240,-44 Q340,-58 440,-68 L440,92 Q340,84 240,68Z" fill="url(#hand-skin)" />
                {/* palm */}
                <ellipse cx={235} cy={14} rx={96} ry={62} fill="url(#hand-skin)" />
                {/* curled fingers */}
                {[0, 1, 2].map((i) => (
                    <g key={i}>
                        <rect x={104 + i * 6} y={18 + i * 22} width={104 - i * 8} height={26} rx={13} fill="url(#hand-skin)" />
                        <path
                            d={`M${118 + i * 6},${24 + i * 22} Q${112 + i * 6},${31 + i * 22} ${118 + i * 6},${38 + i * 22}`}
                            stroke="#8a5233"
                            strokeOpacity={0.4}
                            strokeWidth={1.4}
                            fill="none"
                        />
                    </g>
                ))}
                {/* thumb */}
                <ellipse cx={176} cy={-22} rx={52} ry={17} fill="url(#hand-skin)" transform="rotate(14 176 -22)" />
                {/* index finger */}
                <rect x={0} y={-14} width={230} height={28} rx={14} fill="url(#hand-skin)" />
                <path d="M92,-8 Q97,0 92,8" stroke="#8a5233" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
                <path d="M148,-8 Q153,0 148,8" stroke="#8a5233" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
                {/* nail + highlight */}
                <rect x={4} y={-13} width={26} height={9} rx={4.5} fill="#f9e1d4" stroke="#d9a58a" strokeWidth={0.8} />
                <rect x={20} y={-10} width={120} height={4} rx={2} fill="#fff" opacity={0.18} />
            </g>
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Electric signal                                                    */
/* ------------------------------------------------------------------ */
export const GlowFilter = ({ id = "sigGlow" }: { id?: string }) => (
    <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
);

const pathCache = new Map<string, SVGPathElement>();
export const pointOnPath = (d: string, t: number) => {
    let el = pathCache.get(d);
    if (!el) {
        el = document.createElementNS("http://www.w3.org/2000/svg", "path");
        el.setAttribute("d", d);
        pathCache.set(d, el);
    }
    const L = el.getTotalLength();
    const pt = el.getPointAtLength(clamp01(t) * L);
    return { x: pt.x, y: pt.y };
};

export const SignalStream = ({
    d,
    progress,
    color,
    width = 3,
    filterId = "sigGlow",
}: {
    d: string;
    progress: number;
    color: string;
    width?: number;
    filterId?: string;
}) => {
    const f = useCurrentFrame();
    const head = pointOnPath(d, progress);
    const sparks = [0.035, 0.075, 0.12].map((k) => pointOnPath(d, progress - k));
    return (
        <g>
            <path d={d} fill="none" stroke={color} strokeOpacity={0.14} strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" />
            {progress > 0.002 && (
                <path
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke={color}
                    strokeWidth={width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${progress} 2`}
                    filter={`url(#${filterId})`}
                />
            )}
            {progress > 0.002 && progress < 0.999 && (
                <>
                    {sparks.map((s, i) => (
                        <circle key={i} cx={s.x} cy={s.y} r={4 - i} fill={color} opacity={0.55 - i * 0.15} />
                    ))}
                    <circle cx={head.x} cy={head.y} r={13 + Math.sin(f / 3) * 2} fill={color} opacity={0.25} />
                    <circle cx={head.x} cy={head.y} r={5.5} fill="#ffffff" />
                </>
            )}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Plant cell (turgor)                                                */
/* ------------------------------------------------------------------ */
const superPts = (a: number, b: number, n: number, wob: number, seed: number) => {
    const pts: string[] = [];
    const N = 72;
    const e = 2 / n;
    for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        const rx = Math.sign(c) * Math.pow(Math.abs(c), e);
        const ry = Math.sign(s) * Math.pow(Math.abs(s), e);
        const k = wob * Math.sin(t * 7 + seed);
        pts.push(`${r2((a + k) * rx)},${r2((b + k) * ry)}`);
    }
    return `M${pts.join(" L")}Z`;
};

export const PlantCell = ({
    x,
    y,
    scale = 1,
    waterLevel,
    ionFlow = 0,
    id = "cell",
}: {
    x: number;
    y: number;
    scale?: number;
    waterLevel: number;
    /** 0..1 – ions drifting out of the vacuole */
    ionFlow?: number;
    id?: string;
}) => {
    const f = useCurrentFrame();
    const w = clamp01(waterLevel);
    const a = lerp(74, 100, w);
    const b = lerp(98, 120, w);
    const wob = (1 - w) * 8;
    const va = (a - 14) * (0.3 + 0.62 * w);
    const vb = (b - 14) * (0.3 + 0.62 * w);
    const rcx = (a - 9 + va) / 2;
    const rcy = (b - 9 + vb) / 2;

    const dirs = [
        [1, 0], [-1, 0], [0, 1], [0, -1], [0.78, 0.78], [-0.78, 0.78], [0.78, -0.78], [-0.78, -0.78],
    ];
    const pressure = clamp01((w - 0.5) * 2.2);

    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
            <defs>
                <radialGradient id={`${id}-cyto`} cx="0.5" cy="0.4" r="0.8">
                    <stop offset="0" stopColor="#2f6a45" />
                    <stop offset="1" stopColor="#173a28" />
                </radialGradient>
                <radialGradient id={`${id}-vac`} cx="0.4" cy="0.35" r="0.85">
                    <stop offset="0" stopColor="#a8e6ff" stopOpacity={0.9} />
                    <stop offset="1" stopColor="#2f8fd0" stopOpacity={0.85} />
                </radialGradient>
            </defs>

            {/* pressure arrows */}
            {pressure > 0 &&
                dirs.map(([dx, dy], i) => {
                    const px = dx * (a + 6);
                    const py = dy * (b + 6);
                    const ang = Math.atan2(dy, dx) / RAD;
                    const len = 16 + 10 * Math.sin(f / 7 + i);
                    return (
                        <g key={i} transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(ang)})`} opacity={pressure * 0.9}>
                            <line x1={0} y1={0} x2={len} y2={0} stroke={colors.sunlight} strokeWidth={3.5} strokeLinecap="round" />
                            <polygon points={`${len + 9},0 ${len - 2},-7 ${len - 2},7`} fill={colors.sunlight} />
                        </g>
                    );
                })}

            {/* cell wall + cytoplasm */}
            <path d={superPts(a, b, 4, wob, 1)} fill="#5faa4a" opacity={0.95} />
            <path d={superPts(a - 8, b - 8, 4, wob, 1)} fill={`url(#${id}-cyto)`} />

            {/* chloroplasts */}
            {Array.from({ length: 7 }, (_, i) => {
                const t = (i / 7) * Math.PI * 2 + 0.4;
                const cx = Math.cos(t) * rcx;
                const cy = Math.sin(t) * rcy;
                return (
                    <g key={i} transform={`translate(${r2(cx)} ${r2(cy)}) rotate(${r2(t / RAD + 90)})`}>
                        <ellipse rx={9} ry={5} fill="#34b04e" stroke="#1d7a35" strokeWidth={1} />
                        <line x1={-5} y1={0} x2={5} y2={0} stroke="#1d7a35" strokeWidth={1} />
                    </g>
                );
            })}

            {/* nucleus */}
            <g transform={`translate(${r2(-rcx * 0.7)} ${r2(-rcy * 0.72)})`}>
                <circle r={11} fill="#8a63c9" opacity={0.9} />
                <circle cx={-2} cy={-2} r={4} fill="#c9aef0" />
            </g>

            {/* vacuole */}
            <path d={superPts(va, vb, 2.6, wob * 0.5, 2)} fill={`url(#${id}-vac)`} stroke="#d3f2ff" strokeOpacity={0.6} strokeWidth={1.6} />
            <ellipse cx={-va * 0.3} cy={-vb * 0.45} rx={va * 0.35} ry={vb * 0.12} fill="#fff" opacity={0.28} />

            {/* bubbles in vacuole */}
            {w > 0.4 &&
                Array.from({ length: 5 }, (_, i) => {
                    const ph = (f / 70 + i / 5) % 1;
                    return (
                        <circle
                            key={i}
                            cx={(rnd(i + 11) - 0.5) * va * 1.0}
                            cy={vb * 0.5 - ph * vb * 1.0}
                            r={3 + rnd(i + 4) * 3}
                            fill="#e8f9ff"
                            opacity={0.5 * Math.sin(ph * Math.PI)}
                        />
                    );
                })}

            {/* ions */}
            {Array.from({ length: 8 }, (_, i) => {
                const t = (i / 8) * Math.PI * 2 + 0.2;
                const ph = (f / 50 + i / 8) % 1;
                const moving = ionFlow > 0.01;
                const rr = moving ? lerp(0.25, 1.05, ph) : 0.55 + 0.05 * Math.sin(f / 12 + i);
                const op = moving ? Math.sin(ph * Math.PI) : 0.7;
                return (
                    <g key={i} opacity={op}>
                        <circle cx={Math.cos(t) * a * rr * 0.9} cy={Math.sin(t) * b * rr * 0.9} r={5} fill={colors.ion} />
                        <text x={Math.cos(t) * a * rr * 0.9} y={Math.sin(t) * b * rr * 0.9 + 3} textAnchor="middle" fontSize={8} fontWeight={800} fill="#1b2b20">+</text>
                    </g>
                );
            })}
        </g>
    );
};

/** compact rectangular cell used in magnified tissue views */
export const MiniCell = ({
    x,
    y,
    w,
    h,
    level,
}: {
    x: number;
    y: number;
    w: number;
    h: number;
    level: number;
}) => {
    const lv = 0.35 + 0.6 * clamp01(level);
    return (
        <g transform={`translate(${x} ${y})`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#1b4430" stroke="#5faa4a" strokeWidth={2.6} />
            <rect x={-((w - 10) * lv) / 2} y={-((h - 10) * lv) / 2} width={(w - 10) * lv} height={(h - 10) * lv} rx={8} fill={colors.water} opacity={0.8} />
            <rect x={-((w - 10) * lv) / 2 + 4} y={-((h - 10) * lv) / 2 + 3} width={(w - 10) * lv * 0.45} height={4} rx={2} fill="#fff" opacity={0.35} />
        </g>
    );
};