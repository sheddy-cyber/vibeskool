/* True on phones and tablets: no hover, and a finger rather than a mouse.
   For wording ("tap" rather than "hover") and touch-only behaviour. */
export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: none) and (pointer: coarse)').matches

/* True when the screen is phone-sized. */
export const isPhone = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 560px)').matches
