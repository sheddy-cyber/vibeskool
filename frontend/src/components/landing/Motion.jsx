import React from "react";
import { motion } from "framer-motion";
import styles from "./Motion.module.css";

export const EASE = [0.22, 1, 0.36, 1];

/* Headline reveal: each word rises out of its own mask. */
export function MaskText({ text, as = "h2", className, delay = 0, onMount = false, stagger = 0.055 }) {
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = onMount
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-60px" } };

  return (
    <Tag
      className={className}
      aria-label={text}
      {...trigger}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className={styles.mask} aria-hidden="true">
            <motion.span
              className={styles.word}
              variants={{
                hidden: { y: "110%" },
                show: { y: "0%", transition: { duration: 0.8, ease: EASE } },
              }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/* Container that staggers its <Item> children in when scrolled into view. */
export function Stagger({ as = "div", className, children, delay = 0, gap = 0.07, exit, show, ...rest }) {
  const Tag = motion[as];
  // Pass `show` to drive it from outside (e.g. content swapped by tabs);
  // otherwise it plays the first time it scrolls into view.
  const trigger =
    typeof show === "boolean"
      ? { animate: show ? "show" : "hidden" }
      : { whileInView: "show", viewport: { once: true, margin: "-60px" } };
  return (
    <Tag
      className={className}
      initial="hidden"
      exit={exit}
      {...trigger}
      variants={{ show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Item({ as = "div", className, children, y = 16, ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
