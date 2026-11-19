import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* Original flat illustrations for VibeSkool.
   One palette, faceless figures, no gradients. All text is real copy.
   Neutrals are theme tokens (--il-*, defined in index.css) so each scene
   has a light and a dark version; brand colours and skin tones are fixed. */

const C = {
  ink: "var(--il-text)",
  hair: "var(--il-hair)",
  ink2: "var(--il-ink2)",
  code: "var(--il-code)",
  muted: "var(--il-muted)",
  line: "var(--il-line)",
  white: "var(--il-card)",
  card2: "var(--il-card-2)",
  blue: "#1A73E8",
  blueSoft: "var(--il-blue-soft)",
  bgBlue: "var(--il-bg-blue)",
  bgGreen: "var(--il-bg-green)",
  coral: "#F2553D",
  green: "#1FA463",
  amber: "#F4B740",
  metal: "var(--il-metal)",
  metalDark: "var(--il-metal-dark)",
};

const EASE = [0.22, 1, 0.36, 1];
const ONCE = { once: true, margin: "-40px" };

/* Appears when scrolled into view, then drifts gently. */
function Pop({ delay = 0, float = 4, period = 6, children }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={ONCE}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      <motion.g
        animate={{ y: [0, -float, 0] }}
        transition={{ duration: period, delay: delay + 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.g>
    </motion.g>
  );
}

function useSafeId(prefix) {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, "");
}

function Shadow({ id }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" style={{ floodColor: "#05070B", floodOpacity: "var(--il-shadow-op)" }} />
    </filter>
  );
}

/* Figure seen behind a laptop. (cx, by) is the centre of the shoulder line. */
function Person({ cx, by, skin, skinShade, hair, hairStyle = "short", shirt, glasses = false }) {
  const hx = cx;
  const hy = by - 46;
  return (
    <g>
      {hairStyle === "long" && (
        <path
          d={`M${hx - 34} ${hy - 4} q0 -40 34 -40 q34 0 34 40 v46 q-6 10 -16 10 v-40 h-36 v40 q-10 0 -16 -10 z`}
          fill={hair}
        />
      )}
      {/* torso */}
      <path d={`M${cx - 64} ${by + 60} v-34 q0 -30 30 -30 h68 q30 0 30 30 v34 z`} fill={shirt} />
      {/* neck */}
      <path d={`M${cx - 11} ${by - 18} h22 v18 q-11 8 -22 0 z`} fill={skinShade} />
      {/* ears */}
      <circle cx={hx - 29} cy={hy + 2} r="6" fill={skinShade} />
      <circle cx={hx + 29} cy={hy + 2} r="6" fill={skinShade} />
      {/* head */}
      <ellipse cx={hx} cy={hy} rx="29" ry="33" fill={skin} />
      {hairStyle === "short" && (
        <path
          d={`M${hx - 30} ${hy - 2} q-2 -38 30 -38 q32 0 30 38 q-8 -20 -30 -22 q-18 0 -30 22 z`}
          fill={hair}
        />
      )}
      {hairStyle === "bun" && (
        <>
          <circle cx={hx} cy={hy - 40} r="14" fill={hair} />
          <path
            d={`M${hx - 30} ${hy - 2} q-2 -38 30 -38 q32 0 30 38 q-4 -14 -30 -18 q-26 4 -30 18 z`}
            fill={hair}
          />
        </>
      )}
      {hairStyle === "curly" && (
        <g fill={hair}>
          {[-24, -12, 0, 12, 24].map((dx, i) => (
            <circle key={i} cx={hx + dx} cy={hy - 26 - (i % 2) * 6} r="13" />
          ))}
          <circle cx={hx - 28} cy={hy - 10} r="9" />
          <circle cx={hx + 28} cy={hy - 10} r="9" />
        </g>
      )}
      {hairStyle === "long" && (
        <path d={`M${hx - 30} ${hy - 4} q-2 -36 30 -36 q32 0 30 36 q-12 -16 -30 -18 q-18 2 -30 18 z`} fill={hair} />
      )}
      {glasses && (
        <g fill="none" stroke={C.hair} strokeWidth="2.2">
          <rect x={hx - 22} y={hy - 2} width="17" height="12" rx="5" />
          <rect x={hx + 5} y={hy - 2} width="17" height="12" rx="5" />
          <path d={`M${hx - 5} ${hy + 3} h10`} />
        </g>
      )}
    </g>
  );
}

/* Laptop seen from behind, with the VibeSkool mark on the lid. */
function LaptopBack({ cx, top, w = 180, h = 112 }) {
  const x = cx - w / 2;
  const s = 0.9;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} rx="10" fill={C.metal} />
      <rect x={x - 12} y={top + h - 4} width={w + 24} height="9" rx="4.5" fill={C.metalDark} />
      <g transform={`translate(${cx - 16 * s} ${top + h / 2 - 16 * s}) scale(${s})`}>
        <g transform="rotate(-12 16 16)" opacity="0.9">
          <rect x="5.95" y="9.5" width="5.2" height="13" rx="2.6" fill="#FFFFFF" />
          <rect x="13.4" y="4" width="5.2" height="24" rx="2.6" fill="#FFFFFF" />
          <rect x="20.85" y="7.5" width="5.2" height="17" rx="2.6" fill="#FFFFFF" />
        </g>
      </g>
    </g>
  );
}

function Plant({ x, y }) {
  return (
    <g>
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={{ rotate: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d={`M${x + 22} ${y} q-26 -20 -18 -52 q22 10 18 52 z`} fill={C.green} />
        <path d={`M${x + 22} ${y} q22 -22 12 -58 q-24 16 -12 58 z`} fill="#178A52" />
        <path d={`M${x + 22} ${y} q-4 -30 6 -44`} stroke="#0F6B3E" strokeWidth="2" fill="none" />
      </motion.g>
      <path d={`M${x} ${y} h44 l-5 40 q-1 6 -7 6 h-20 q-6 0 -7 -6 z`} fill={C.coral} />
    </g>
  );
}

function Mug({ x, y }) {
  return (
    <g>
      <path d={`M${x + 30} ${y + 10} q12 0 12 11 q0 11 -12 11`} fill="none" stroke={C.ink2} strokeWidth="4" />
      <rect x={x} y={y} width="32" height="38" rx="6" fill={C.ink2} />
      <rect x={x + 7} y={y + 12} width="18" height="4" rx="2" fill={C.amber} />
    </g>
  );
}

function Check({ cx, cy, r = 13, bg = C.green }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <path
        d={`M${cx - r * 0.4} ${cy} l${r * 0.28} ${r * 0.3} l${r * 0.55} -${r * 0.6}`}
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/* ── Learner + AI ────────────────────────────────────────── */
export function LearnerScene({ className, title = "A learner asks AI why their code fails, then fixes it" }) {
  const sh = useSafeId("sh");
  return (
    <svg viewBox="0 0 560 440" className={className} role="img" aria-label={title}>
      <defs>
        <Shadow id={sh} />
      </defs>
      <rect x="10" y="40" width="540" height="390" rx="32" fill={C.bgBlue} />

      {/* desk */}
      <rect x="60" y="346" width="440" height="14" rx="7" fill={C.ink2} />
      <rect x="96" y="360" width="10" height="70" fill={C.ink2} />
      <rect x="454" y="360" width="10" height="70" fill={C.ink2} />

      <Person cx={280} by={206} skin="#B9784F" skinShade="#9E6440" hair={C.hair} hairStyle="curly" shirt={C.blue} />
      <LaptopBack cx={280} top={236} />
      <Mug x={118} y={308} />
      <Plant x={410} y={300} />

      {/* prompt bubble */}
      <Pop delay={0.3} period={6}>
        <g filter={`url(#${sh})`}>
          <rect x="30" y="70" width="214" height="78" rx="18" fill={C.white} />
          <path d="M200 146 l18 18 l-2 -18 z" fill={C.white} />
        </g>
        <text x="50" y="98" fontSize="12" fontWeight="600" fill={C.muted}>You</text>
        <text x="50" y="122" fontSize="15" fontWeight="500" fill={C.ink}>Why does my fetch</text>
        <text x="50" y="140" fontSize="15" fontWeight="500" fill={C.ink}>return a 404?</text>
      </Pop>

      {/* reply card */}
      <Pop delay={1.1} period={7}>
        <g filter={`url(#${sh})`}>
          <rect x="330" y="96" width="206" height="104" rx="18" fill={C.white} />
        </g>
        <rect x="350" y="114" width="28" height="18" rx="6" fill={C.blueSoft} />
        <text x="356" y="127.5" fontSize="11" fontWeight="700" fill={C.blue}>AI</text>
        <text x="350" y="154" fontSize="14" fill={C.ink}>The server can't find</text>
        <text x="350" y="172" fontSize="14" fill={C.ink}>that URL. Check the</text>
        <text x="350" y="190" fontSize="14" fill={C.ink}>path on line 12.</text>
      </Pop>

      {/* fixed badge */}
      <Pop delay={1.9} float={3} period={5}>
        <g filter={`url(#${sh})`}>
          <rect x="54" y="244" width="118" height="40" rx="20" fill={C.white} />
        </g>
        <Check cx={76} cy={264} r={11} />
        <text x="95" y="269" fontSize="14" fontWeight="600" fill={C.ink}>200 OK</text>
      </Pop>
    </svg>
  );
}

/* ── Tutor pairing with a student ────────────────────────── */
export function PairingScene({ className, title = "A tutor and a student editing the same code together" }) {
  const sh = useSafeId("sh");
  const reduce = useReducedMotion();
  const lines = [
    [0, 92, C.coral], [0, 132, C.code], [16, 104, C.blue], [16, 70, C.code], [0, 40, C.code],
  ];
  return (
    <svg viewBox="0 0 560 440" className={className} role="img" aria-label={title}>
      <defs>
        <Shadow id={sh} />
      </defs>
      <rect x="10" y="40" width="540" height="390" rx="32" fill={C.bgGreen} />


      {/* shared editor */}
      <g filter={`url(#${sh})`}>
        <rect x="186" y="60" width="188" height="128" rx="16" fill={C.white} />
      </g>
      <rect x="186" y="60" width="188" height="30" rx="16" fill={C.card2} />
      <rect x="186" y="76" width="188" height="14" fill={C.card2} />
      <text x="202" y="80" fontSize="11.5" fontWeight="600" fill={C.muted}>cart.js · 2 people</text>
      {lines.map(([indent, w, col], i) => (
        <motion.rect
          key={i}
          x={204 + indent}
          y={102 + i * 16}
          width={w}
          height="7"
          rx="3.5"
          fill={col}
          opacity={col === C.code ? 0.22 : 0.85}
          style={{ originX: 0 }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={ONCE}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.09, ease: EASE }}
        />
      ))}
      {/* cursors */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={ONCE}
        transition={{ delay: 0.9 }}
      >
        <motion.g
          animate={{ x: [0, 20, 20, -14, 0] }}
          transition={{ duration: 8, times: [0, 0.2, 0.5, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.rect
            x="312" y="114" width="2.5" height="16" fill={C.green}
            animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
          />
          <rect x="312" y="104" width="46" height="13" rx="4" fill={C.green} />
          <text x="317" y="113.5" fontSize="9.5" fontWeight="700" fill="#fff">Amara</text>
        </motion.g>
        <motion.g
          animate={{ x: [0, 0, 26, 26, 0] }}
          transition={{ duration: 8, times: [0, 0.3, 0.55, 0.85, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="290" y="146" width="2.5" height="16" fill={C.coral} />
          <rect x="290" y="162" width="34" height="13" rx="4" fill={C.coral} />
          <text x="295" y="171.5" fontSize="9.5" fontWeight="700" fill="#fff">Sara</text>
        </motion.g>
      </motion.g>

      {/* desk */}
      <rect x="40" y="356" width="480" height="14" rx="7" fill={C.ink2} />
      <rect x="76" y="370" width="10" height="60" fill={C.ink2} />
      <rect x="474" y="370" width="10" height="60" fill={C.ink2} />

      <g transform="translate(150 0)">
        <g transform="scale(0.86) translate(-150 52)">
          <Person cx={150} by={226} skin="#7A4A2E" skinShade="#633B24" hair={C.hair} hairStyle="bun" shirt={C.green} glasses />
          <LaptopBack cx={150} top={254} w={164} h={104} />
        </g>
      </g>
      <g transform="translate(410 0)">
        <g transform="scale(0.86) translate(-410 52)">
          <Person cx={410} by={226} skin="#F0C9A0" skinShade="#DDB088" hair="#6B3B22" hairStyle="long" shirt={C.coral} />
          <LaptopBack cx={410} top={254} w={164} h={104} />
        </g>
      </g>

      {/* help bubble */}
      <Pop delay={1.5} period={6.5}>
        <g filter={`url(#${sh})`}>
          <rect x="398" y="72" width="138" height="58" rx="16" fill={C.white} />
        </g>
        <text x="414" y="96" fontSize="13" fontWeight="600" fill={C.ink}>Got it, thanks!</text>
        <text x="414" y="115" fontSize="12" fill={C.muted}>3 of 3 checks pass</text>
      </Pop>
    </svg>
  );
}

/* ── The web stack, page to database ─────────────────────── */
export function StackArt({ className, title = "Front end, back end and database connected" }) {
  const reduce = useReducedMotion();
  const flow = reduce
    ? {}
    : { animate: { strokeDashoffset: [0, -22] }, transition: { duration: 1.1, repeat: Infinity, ease: "linear" } };
  const blink = (d) =>
    reduce ? {} : { animate: { opacity: [1, 0.25, 1] }, transition: { duration: 1.6, delay: d, repeat: Infinity } };
  return (
    <svg viewBox="0 0 300 250" className={className} role="img" aria-label={title}>
      <motion.path d="M150 86 V118 M150 168 V196" stroke={C.metalDark} strokeWidth="2.5" strokeDasharray="5 6" {...flow} />

      {/* browser */}
      <rect x="40" y="10" width="220" height="80" rx="12" fill={C.white} stroke={C.line} strokeWidth="1.5" />
      <path d="M40 30 h220" stroke={C.line} strokeWidth="1.5" />
      <circle cx="54" cy="20" r="3.5" fill={C.metal} />
      <circle cx="66" cy="20" r="3.5" fill={C.metal} />
      <rect x="56" y="44" width="92" height="9" rx="4.5" fill={C.code} opacity="0.85" />
      <rect x="56" y="60" width="132" height="6" rx="3" fill={C.metal} />
      <rect x="196" y="54" width="48" height="20" rx="10" fill={C.blue} />

      {/* server */}
      <rect x="90" y="118" width="120" height="50" rx="10" fill={C.ink2} />
      <rect x="104" y="132" width="56" height="6" rx="3" fill="#55607A" />
      <rect x="104" y="148" width="40" height="6" rx="3" fill="#55607A" />
      <motion.circle cx="190" cy="135" r="4" fill={C.green} {...blink(0)} />
      <motion.circle cx="190" cy="151" r="4" fill={C.amber} {...blink(0.8)} />

      {/* database */}
      <path d="M106 204 v28 a44 12 0 0 0 88 0 v-28" fill={C.blueSoft} stroke={C.blue} strokeWidth="1.8" />
      <path d="M106 218 a44 12 0 0 0 88 0" fill="none" stroke={C.blue} strokeWidth="1.8" opacity="0.5" />
      <ellipse cx="150" cy="204" rx="44" ry="12" fill={C.white} stroke={C.blue} strokeWidth="1.8" />
    </svg>
  );
}
