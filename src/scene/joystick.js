// Virtual thumb-stick maths for touch devices. Pure, so it is unit-tested.

const DEAD_ZONE = .15; // fraction of the radius ignored, so a resting thumb doesn't drift
const RUN_AT = .95;    // pushed (almost) to the edge = run

/**
 * Turn a drag from `start` to `current` (screen px) into movement.
 * Returns { x: right -1..1, y: forward -1..1, run }.
 */
export function joystick(start, current, radius) {
  const dx = current.x - start.x, dy = current.y - start.y, dist = Math.hypot(dx, dy);
  if (dist < radius * DEAD_ZONE) return { x:0, y:0, run:false };
  const mag = Math.min(1, dist / radius), k = mag / dist;
  return { x:dx * k, y:-dy * k, run:mag >= RUN_AT };
}
