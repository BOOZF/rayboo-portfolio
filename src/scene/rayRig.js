import { bakeMesh } from './models.js';

const ss = (x, e0, e1) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// The character ships without a skeleton: skin the legs, spine and head procedurally from height bands.
// Landmarks (model units, feet at 0): crotch .52, hip joint .6, knee .32, waist .8, neck 1.46. Mesh faces +Z.
export function rigRay(T, src, env) {
  const { geo, mat } = bakeMesh(T, src), height = geo.boundingBox.max.y;
  mat.envMap = env; mat.envMapIntensity = .6;
  const pos = geo.attributes.position, n = pos.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), leg = ss(y, .66, .5) * (y < .52 ? 1 : ss(Math.abs(x), 0, .08)), knee = ss(y, .38, .26);
    const up = ss(y, .76, .96), head = ss(y, 1.42, 1.52), body = 1 - leg, side = x < 0 ? 3 : 5;
    si.set([1, 2, side, side + 1], i * 4);
    sw.set([body * (1 - up), body * up, leg * (1 - knee), leg * knee], i * 4);
    if (head > 0) { si.set([2, 7], i * 4 + 1); sw.set([body * up * (1 - head), body * up * head], i * 4 + 1); }
  }
  geo.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
  const bone = (parent, x, y, z) => { const b = new T.Bone(); b.position.set(x, y, z); parent && parent.add(b); return b; };
  const root = bone(null, 0, 0, 0), hipY = .62, hips = bone(root, 0, hipY, 0), spine = bone(hips, 0, .18, -.02);
  const leg = s2 => { const thigh = bone(hips, s2 * .13, -.02, 0); return { thigh, shin:bone(thigh, 0, -.28, 0) }; };
  const L = leg(-1), R = leg(1), head = bone(spine, 0, .66, .02);
  const mesh = new T.SkinnedMesh(geo, mat); mesh.add(root); mesh.updateMatrixWorld(true);
  mesh.bind(new T.Skeleton([root, hips, spine, L.thigh, L.shin, R.thigh, R.shin, head]));
  mesh.frustumCulled = false;
  return { mesh, height, rig:{ hips, spine, head, L, R, hipY } };
}

// Walking/running pose (stride phase ph, gait amount a 0..1, run blend rn, airborne ab, crouch cr, turn lean).
// Positive thigh X trails a leg behind; positive shin X bends the knee; positive spine X leans forward.
export function poseWalk(g, { t, ph, a, rn, ab, cr, vy, lean, look }) {
  const gnd = 1 - ab, br = Math.sin(t * 2.1), idle = 1 - a, sw = Math.sin(ph);
  const legA = (.5 + .35 * rn) * a, kneeA = (.7 + .7 * rn) * a;
  [g.L, g.R].forEach((leg, i) => {
    const s2 = i ? 1 : -1, ls = Math.sin(ph + (i ? Math.PI : 0)), lc = Math.cos(ph + (i ? Math.PI : 0));
    leg.thigh.rotation.set(-ls * legA * gnd - (i ? .35 : .85) * ab - .75 * cr, 0, s2 * (.03 * a + .02 * idle));
    leg.shin.rotation.x = (Math.max(0, lc) * kneeA + .05 * a) * gnd + (i ? .6 : 1.3) * ab + 1.35 * cr;
  });
  const bob = (Math.abs(Math.cos(ph)) - .64) * (.035 + .05 * rn) * a * gnd;
  g.hips.position.y = g.hipY + bob - .13 * cr;
  g.hips.rotation.set(0, sw * (.1 + .05 * rn) * a * gnd, sw * .07 * a * gnd + Math.sin(t * 1.1) * .012 * idle);
  const leanF = (.04 + .18 * rn) * a * gnd + .32 * cr - vy * .015 * ab;
  g.spine.rotation.set(leanF + br * .006 * idle, -sw * (.12 + .06 * rn) * a * gnd, -sw * .05 * a * gnd + lean * 1.6);
  g.spine.scale.set(1 + br * .008 * idle, 1 + br * .01 * idle, 1 + br * .008 * idle);
  g.head.rotation.set(-leanF * .6 + Math.cos(ph * 2) * .02 * a, look + sw * .06 * a, sw * .03 * a - lean * .8);
}
