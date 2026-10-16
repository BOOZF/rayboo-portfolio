// Ray: the Meshy-rigged character and its clips. World moves him around; this only picks and blends the animation.
//   wave  – Big_Wave_Hello on the home screen, Wave_One_Hand on About / Contact (looped)
//   idle  – first frame of Wave_One_Hand (a relaxed stand) plus a little breathing, since the pack has no idle clip
//   walk / run – blended by ground speed, played faster or slower so the feet roughly match the speed
const CLIPS = { hello:'Big_Wave_Hello', wave:'Wave_One_Hand', walk:'Walking', run:'Running' };
const WALK_SPEED = 3.4, RUN_SPEED = 6.2; // World's walking and running speeds (units/s)

// The clips carry their own hips offset (Big_Wave_Hello stands 25 cm to the side): pin every clip's hips X/Z to the
// same spot so Ray stays centred, and World alone moves him.
function stripRootMotion(clip, ref) {
  clip.tracks.filter(t => /Hips\.position$/.test(t.name)).forEach(t => {
    const v = t.values;
    for (let i = 0; i < v.length; i += 3) { v[i] = ref.x; v[i + 2] = ref.z; }
  });
  return clip;
}

// Pose touch-ups on top of the clips, in degrees.
// RELAX turns about Ray's own body axes (z: front-to-back, x: side-to-side), so the shoulders drop straight down instead
// of rolling the arms behind his back (the clips stand with the shoulders shrugged); the arms then open a little and
// swing slightly forward so they hang naturally in front of the jacket.
// STANCE (bone-local Z) sets the feet a bit wider with the soles kept flat.
const RELAX = { LeftShoulder:[['z', -16]], RightShoulder:[['z', 16]], LeftArm:[['z', 10], ['x', -8]], RightArm:[['z', -10], ['x', -8]] };
const AXES = { x:[1, 0, 0], z:[0, 0, 1] };
const STANCE = { LeftUpLeg:-5, RightUpLeg:5, LeftFoot:5, RightFoot:-5 };

export function rigRay(T, gltf, env) {
  const model = gltf.scene;
  model.traverse(o => {
    if (!o.isMesh) return;
    o.frustumCulled = false; // skinned bounds don't follow the animation
    const m = o.material;
    m.metalness = 0; m.metalnessMap = null; m.roughness = .7; m.envMap = env; m.envMapIntensity = .6;
    m.emissiveIntensity = .18; // Meshy bakes the colour map into emissive too; a touch keeps him readable in deep space
    m.needsUpdate = true;
  });
  const mixer = new T.AnimationMixer(model), act = {}, bones = {};
  model.traverse(o => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  // reference hips spot: the relaxed stand at the start of Wave_One_Hand
  const hipsTrack = (gltf.animations.find(a => a.name === CLIPS.wave) || gltf.animations[0]).tracks.find(t => /Hips\.position$/.test(t.name));
  const ref = hipsTrack ? { x:hipsTrack.values[0], z:hipsTrack.values[2] } : { x:0, z:0 };
  Object.entries(CLIPS).forEach(([k, name]) => {
    const clip = gltf.animations.find(a => a.name === name);
    if (!clip) return;
    const a = act[k] = mixer.clipAction(stripRootMotion(clip, ref));
    a.play(); a.setEffectiveWeight(0);
  });
  // idle: a paused copy of the gentle wave at its neutral first frame
  const waveClip = gltf.animations.find(a => a.name === CLIPS.wave);
  if (waveClip) { const a = act.idle = mixer.clipAction(stripRootMotion(waveClip.clone(), ref)); a.play(); a.paused = true; a.time = 0; a.setEffectiveWeight(1); }

  // measure the standing pose so World can scale him to a fixed height with feet on the deck
  mixer.update(0); model.updateMatrixWorld(true);
  const box = new T.Box3();
  model.traverse(o => { if (o.isSkinnedMesh) { o.computeBoundingBox(); box.union(o.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
  const holder = new T.Group(); holder.add(model);
  model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  const spine = bones.Spine1 || bones.Spine, baseY = model.position.y, toes = [bones.LeftToeBase, bones.RightToeBase].filter(Boolean);
  const v = new T.Vector3(), toeY = () => Math.min(...toes.map(b => model.worldToLocal(b.getWorldPosition(v)).y));
  const toeY0 = toes.length ? toeY() : 0;
  let lift = 0;
  const mq = new T.Quaternion(), pq = new T.Quaternion(), dq = new T.Quaternion(), axis = new T.Vector3();
  // pose touch-ups are added on top of the clip pose once per frame: remember the clip pose so the next frame starts
  // from it again (the mixer doesn't rewrite a bone whose blended value hasn't changed, so += would pile up)
  const tuned = [...new Set([...Object.keys(RELAX), ...Object.keys(STANCE), spine && spine.name.replace(/^mixamorig:?/, '')])].map(n => bones[n]).filter(Boolean);
  const clipPose = tuned.map(b => b.quaternion.clone());

  const weight = { hello:0, wave:0, idle:1, walk:0, run:0 };
  return {
    mesh:holder, height:box.max.y - box.min.y,
    // mode: 'hello' | 'wave' | 'move' (move covers standing still too); speed in units/s
    update(dt, { mode, speed, t }) {
      const moving = mode === 'move' && speed > .2, rn = Math.max(0, Math.min(1, (speed - WALK_SPEED) / (RUN_SPEED - WALK_SPEED)));
      const target = { hello:mode === 'hello' ? 1 : 0, wave:mode === 'wave' ? 1 : 0, walk:moving ? 1 - rn : 0, run:moving ? rn : 0 };
      target.idle = mode === 'move' && !moving ? 1 : 0;
      const k = 1 - Math.exp(-10 * dt);
      for (const n in weight) {
        weight[n] += (target[n] - weight[n]) * k;
        if (act[n]) act[n].setEffectiveWeight(weight[n]);
      }
      // a wave restarts from its beginning each time it fades back in
      ['hello', 'wave'].forEach(n => { if (act[n] && target[n] && weight[n] < .05) act[n].time = 0; });
      if (act.walk) act.walk.timeScale = Math.max(.6, Math.min(1.5, speed / WALK_SPEED));
      if (act.run) act.run.timeScale = Math.max(.8, Math.min(1.3, speed / RUN_SPEED));
      tuned.forEach((b, i) => b.quaternion.copy(clipPose[i]));
      mixer.update(dt);
      tuned.forEach((b, i) => clipPose[i].copy(b.quaternion));
      const D = Math.PI / 180, standing = weight.idle + weight.hello + weight.wave;
      const relax = standing + .6 * (weight.walk + weight.run);
      model.updateMatrixWorld(true);
      model.getWorldQuaternion(mq);
      for (const n in RELAX) {
        const b = bones[n]; if (!b) continue;
        b.parent.getWorldQuaternion(pq); pq.invert();
        for (const [ax, deg] of RELAX[n]) {
          axis.fromArray(AXES[ax]).applyQuaternion(mq).applyQuaternion(pq).normalize(); // Ray's body axis, in the bone's parent frame
          b.quaternion.premultiply(dq.setFromAxisAngle(axis, deg * D * relax));
        }
        b.updateMatrixWorld(true);
      }
      for (const n in STANCE) if (bones[n]) bones[n].rotation.z += STANCE[n] * D * weight.idle;
      if (spine && weight.idle > .01) spine.rotation.x += Math.sin(t * 2.1) * .015 * weight.idle; // breathing
      // keep the planted foot on the deck while standing or waving (the wave clips float a few cm)
      if (toes.length) {
        model.updateMatrixWorld(true);
        lift += ((toeY() - toeY0) * standing - lift) * Math.min(1, dt * 12);
        model.position.y = baseY - lift;
      }
    },
  };
}
