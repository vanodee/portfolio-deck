import bezier from "bezier-easing";

// Design System §6 easing curves. bezier-easing handles the >1 overshoot
// output of the flip curve correctly.

/** Flip — slight overshoot, card "snapping" face-up. */
export const flipEase = bezier(0.34, 1.56, 0.64, 1);

/** Scale-open — deliberate, weighty. */
export const openEase = bezier(0.22, 1, 0.36, 1);

/** Same curve as openEase, as raw control points — for libraries (Framer
 * Motion) that want an [x1,y1,x2,y2] array rather than an eased function. */
export const openEaseBezierPoints = [0.22, 1, 0.36, 1] as const;

export const easeOut = bezier(0, 0, 0.58, 1);
export const easeIn = bezier(0.42, 0, 1, 1);
export const easeInOut = bezier(0.42, 0, 0.58, 1);

/** Deal — dealt card decelerating into place. */
export const expoOut = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** Shuffle settle — drop with a tiny overshoot. */
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
