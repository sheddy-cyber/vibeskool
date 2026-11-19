import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./FistBump.module.css";

/* Closing scene: a learner's arm (blue hoodie) and a tutor's arm (green
   cardigan) come in from either side and meet in a fist bump. The impact
   lines are the three VibeSkool bars. Each call to action sits under the
   arm it belongs to.

   viewBox 0 0 800 280. Fists meet at (400, 190). The buttons sit inside
   the same panel, under each arm. */

const EASE = [0.22, 1, 0.36, 1];
const CONTACT_DELAY = 0.75; // when the fists touch

const LEARNER = { skin: "#B9784F", shade: "#9E6440", sleeve: "#1A73E8", cuff: "#1662C9", kind: "hoodie" };
const TUTOR = { skin: "#7A4A2E", shade: "#633B24", sleeve: "#1FA463", cuff: "#178A52", kind: "cardigan" };

/* One forearm + fist, drawn facing right. Local origin = wrist, centre line. */
function Arm({ c }) {
  return (
    <g>
      {/* sleeve running off the edge of the stage */}
      <rect x="-420" y="-54" width="418" height="108" rx="26" fill={c.sleeve} />
      {c.kind === "hoodie" ? (
        <g>
          <rect x="-46" y="-50" width="44" height="100" rx="14" fill={c.cuff} />
          {[-36, -26, -16].map((x) => (
            <path key={x} d={`M${x} -40 v80`} stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </g>
      ) : (
        <g>
          <rect x="-40" y="-52" width="38" height="104" rx="12" fill={c.cuff} />
          <path d="M-52 -52 v104" stroke="#FFFFFF" strokeWidth="4" />
          <circle cx="-120" cy="-22" r="5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="-120" cy="16" r="5" fill="#FFFFFF" opacity="0.9" />
        </g>
      )}

      {/* wrist and back of the hand */}
      <rect x="-12" y="-32" width="42" height="64" rx="14" fill={c.skin} />
      <rect x="8" y="-44" width="62" height="88" rx="28" fill={c.skin} />

      {/* curled fingers, bottom to top so each sits over the one below */}
      {[22, 0, -22, -44].map((y) => (
        <rect key={y} x="44" y={y} width="50" height="23" rx="11.5" fill={c.skin} stroke={c.shade} strokeWidth="2.2" />
      ))}

      {/* thumb folded across the top */}
      <rect x="16" y="-54" width="62" height="21" rx="10.5" fill={c.skin} stroke={c.shade} strokeWidth="2.2" />
      <path d="M30 -10 q10 6 4 18" fill="none" stroke={c.shade} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

function Bars({ go }) {
  const bars = [
    { x: 362, y: 94, r: -32, h: 30, fill: "#F2553D", d: 0 },
    { x: 400, y: 78, r: 0, h: 40, fill: "#1A73E8", d: 0.06 },
    { x: 438, y: 94, r: 32, h: 34, fill: "#1FA463", d: 0.12 },
  ];
  return (
    <g>
      {bars.map((b) => (
        <motion.g
          key={b.fill}
          style={{ originX: 0.5, originY: 1 }}
          initial={{ opacity: 0, scale: 0, y: 14 }}
          animate={go ? { opacity: 1, scale: 1, y: 0 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: CONTACT_DELAY + b.d }}
        >
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.6, delay: CONTACT_DELAY + 1 + b.d * 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <rect
              x={b.x - 7}
              y={b.y - b.h}
              width="14"
              height={b.h}
              rx="7"
              fill={b.fill}
              transform={`rotate(${b.r} ${b.x} ${b.y + 26})`}
            />
          </motion.g>
        </motion.g>
      ))}
    </g>
  );
}

export default function FistBump({ onLearn, onTeach }) {
  // One trigger for the whole scene. Only the vertical margin is inset, so
  // narrow screens (where the arms start off to the sides) still fire it.
  const ref = useRef(null);
  const go = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });

  return (
    <div className={styles.wrap} ref={ref}>
      <div className={styles.stage}>
        <svg viewBox="0 0 800 280" className={styles.svg} aria-hidden="true">
          {/* impact ripple */}
          <motion.circle
            cx="400"
            cy="190"
            fill="none"
            stroke="#1A73E8"
            strokeWidth="2"
            initial={{ r: 30, opacity: 0 }}
            animate={go ? { r: [30, 150], opacity: [0.45, 0] } : undefined}
            transition={{ duration: 0.9, delay: CONTACT_DELAY, ease: "easeOut" }}
          />

          {/* learner from the left */}
          <motion.g
            initial={{ x: -260 }}
            animate={go ? { x: [-260, 10, 0] } : undefined}
            transition={{ duration: 0.95, times: [0, 0.78, 1], ease: EASE }}
          >
            <g transform="translate(306 190)">
              <Arm c={LEARNER} />
            </g>
          </motion.g>

          {/* tutor from the right (same arm, mirrored) */}
          <motion.g
            initial={{ x: 260 }}
            animate={go ? { x: [260, -10, 0] } : undefined}
            transition={{ duration: 0.95, times: [0, 0.78, 1], ease: EASE }}
          >
            <g transform="translate(494 190) scale(-1 1)">
              <Arm c={TUTOR} />
            </g>
          </motion.g>

          <Bars go={go} />
        </svg>

      <div className={styles.actions}>
        <motion.div
          className={styles.side}
          initial={{ opacity: 0, y: 12 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: CONTACT_DELAY + 0.25, ease: EASE }}
        >
          <button type="button" onClick={onLearn} className={`${styles.cta} ${styles.ctaPrimary}`}>
            <span className={styles.full}>Start learning for free</span>
            <span className={styles.short}>Start learning</span>
          </button>
        </motion.div>
        <motion.div
          className={styles.side}
          initial={{ opacity: 0, y: 12 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: CONTACT_DELAY + 0.35, ease: EASE }}
        >
          <button type="button" onClick={onTeach} className={`${styles.cta} ${styles.ctaDark}`}>
            I'm a tutor
          </button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
