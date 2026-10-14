import { bakeMesh } from './models.js';

// Meshy spaceship catwalk. The model runs along X, so it is turned 90° to run along Z. Measured after that turn
// (model units, top-down render): walkable deck ±.114 wide, four open rings beside it, listed left then right in walking order.
export const WALK = { file:'catwalk', turn:Math.PI / 2, scale:16, halfDeck:.114, deckY:.166, endCap:.045, pods:[[-.396, .62], [.394, .61], [-.39, -.66], [.25, -.66]] };

// Each section has a railing across both ends; chained end to end those would wall off the path, so drop every
// triangle above the deck surface in the last few % of the length, within the deck's width.
function dropEndRails(geo) {
  const p = geo.attributes.position, idx = geo.index.array, half = geo.boundingBox.max.z - geo.boundingBox.min.z, keep = [];
  const deckTop = WALK.deckY + .012, zCut = half / 2 - half * WALK.endCap;
  for (let i = 0; i < idx.length; i += 3) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 3; k++) { x += p.getX(idx[i + k]); y += p.getY(idx[i + k]); z += p.getZ(idx[i + k]); }
    x /= 3; y /= 3; z /= 3;
    if (!(Math.abs(z) > zCut && y > deckTop && Math.abs(x) < WALK.halfDeck + .06)) keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  geo.setIndex(keep);
}

// Three catwalk sections end to end along -Z: an empty lead-in where Ray starts, then two sections whose rings hold the bubbles.
// Returns the 8 ring positions in walking order (left, right, left, right…), the deck height, walkable Z range and start Z.
export function buildWalkway(T, scene, src, env) {
  const { geo, mat } = bakeMesh(T, src), S = WALK.scale;
  geo.rotateY(WALK.turn); geo.computeBoundingBox(); const bb = geo.boundingBox;
  geo.translate(-(bb.min.x + bb.max.x) / 2, 0, -(bb.min.z + bb.max.z) / 2);
  dropEndRails(geo);
  mat.envMap = env; mat.envMapIntensity = .7; mat.emissive = new T.Color(0x9fb8ff); mat.emissiveMap = mat.map; mat.emissiveIntensity = .22;
  const len = (bb.max.z - bb.min.z) * S, z0 = 0, sections = [z0 + len, z0, z0 - len];
  const meshes = sections.map(z => { const m = new T.Mesh(geo, mat); m.scale.setScalar(S); m.position.z = z; scene.add(m); return m; });
  meshes[1].updateMatrixWorld(true);
  const hit = new T.Raycaster(new T.Vector3(0, 50, z0), new T.Vector3(0, -1, 0)).intersectObject(meshes[1])[0];
  const deckY = hit ? hit.point.y : .23;
  const pods = sections.slice(1).flatMap(z => WALK.pods.map(([x, pz]) => new T.Vector3(x * S, deckY, z + pz * S)));
  return { pods, deckY, halfWidth:WALK.halfDeck * S - .35, zMax:sections[0] + len / 2 - 1, zMin:sections[2] - len / 2 + 1.5, zStart:pods[0].z + 9 };
}
