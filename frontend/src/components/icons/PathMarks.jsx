import React from "react";
import styles from "./PathMarks.module.css";

/* One drawn mark per learning path.
   40 × 40 grid, 1.5 stroke. Line work takes the current colour, a faint
   plane sits behind it, and each mark has a single accent detail: the
   part of the drawing that says what the path is about. */

const MARKS = {
  /* A browser window holding a tag */
  "full-stack-web": (
    <>
      <rect className={styles.p} x="5" y="8" width="30" height="24" rx="3.5" />
      <rect className={styles.l} x="5" y="8" width="30" height="24" rx="3.5" />
      <path className={styles.l} d="M5 14h30" />
      <circle className={styles.dot} cx="9" cy="11" r="1" />
      <circle className={styles.dot} cx="12.4" cy="11" r="1" />
      <path className={`${styles.l} ${styles.aS}`} d="m15.5 19.5-3.5 3.5 3.5 3.5M24.5 19.5l3.5 3.5-3.5 3.5M21.6 18.6l-3.2 8.8" />
    </>
  ),

  /* A phone with an app card on screen and a notification landing */
  "mobile-app": (
    <>
      <rect className={styles.p} x="11" y="5" width="18" height="30" rx="4.5" />
      <rect className={styles.l} x="11" y="5" width="18" height="30" rx="4.5" />
      <rect className={styles.l} x="14.5" y="11" width="11" height="7" rx="1.8" />
      <path className={styles.l} d="M14.5 22h11M14.5 25.5h6.5M18 31.2h4" />
      <circle className={`${styles.a} ${styles.ring}`} cx="28.5" cy="7" r="3.8" />
    </>
  ),

  /* Three blocks linked in a rising chain; the newest is lit */
  "blockchain-web3": (
    <>
      <rect className={styles.p} x="4" y="26" width="10" height="10" rx="2.4" />
      <rect className={styles.p} x="15" y="15" width="10" height="10" rx="2.4" />
      <rect className={styles.l} x="4" y="26" width="10" height="10" rx="2.4" />
      <rect className={styles.l} x="15" y="15" width="10" height="10" rx="2.4" />
      <path className={styles.l} d="M7 31h4M18 20h4" />
      <path className={styles.link} d="m12.2 26.2 4.6-4.6M23.2 15.2l4.6-4.6" />
      <rect className={styles.a} x="26" y="4" width="10" height="10" rx="2.4" />
    </>
  ),

  /* An arcade stick */
  "game-dev": (
    <>
      <path className={styles.p} d="M9 25.5h22a3 3 0 0 1 3 3V32a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3z" />
      <path className={styles.l} d="M9 25.5h22a3 3 0 0 1 3 3V32a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3z" />
      <path className={styles.l} d="M16.5 25.5c0-1.6 1.5-2.6 3.5-2.6s3.5 1 3.5 2.6M20 22.9V14.6" />
      <circle className={styles.l} cx="27.5" cy="30.2" r="1.6" />
      <circle className={styles.l} cx="11.5" cy="30.2" r="1.1" />
      <circle className={styles.a} cx="20" cy="10" r="5" />
    </>
  ),

  /* Layers from hardware up: the machine beneath the code */
  "os-low-level": (
    <>
      <path className={`${styles.l} ${styles.solid}`} d="M20 21.5 34 28.5 20 35.5 6 28.5z" />
      <path className={styles.p} d="M20 21.5 34 28.5 20 35.5 6 28.5z" />
      <path className={`${styles.l} ${styles.solid}`} d="M20 13 34 20 20 27 6 20z" />
      <path className={styles.p} d="M20 13 34 20 20 27 6 20z" />
      <path className={styles.a} d="M20 4.5 34 11.5 20 18.5 6 11.5z" />
      <path className={styles.onA} d="m16.4 10 2.6 1.5-2.6 1.5M21 13.6h3.2" />
    </>
  ),

  /* A small network: three inputs, two hidden units, one output that fires */
  "ai-ml": (
    <>
      <path
        className={styles.thin}
        d="M8 10 20 14.5M8 10l12 11M8 20l12-5.5M8 20l12 6.5M8 30l12-15.5M8 30l12-3.5M20 14.5l12 6M20 26.5l12-6"
      />
      {[[8, 10], [8, 20], [8, 30], [20, 14.5], [20, 26.5]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} className={`${styles.l} ${styles.solid}`} cx={cx} cy={cy} r="3.1" />
      ))}
      <circle className={styles.a} cx="32" cy="20.5" r="4.2" />
    </>
  ),
};

const FALLBACK = (
  <>
    <rect className={styles.p} x="6" y="6" width="28" height="28" rx="6" />
    <rect className={styles.l} x="6" y="6" width="28" height="28" rx="6" />
    <circle className={styles.a} cx="20" cy="20" r="4.5" />
  </>
);

export default function PathMark({ id, size = 40, className = "" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={`${styles.mark} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {MARKS[id] || FALLBACK}
    </svg>
  );
}
