import * as T from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildGalaxy } from './galaxy.js';
import { buildBubbles } from './bubbles.js';
import { buildWalkway, WALK } from './walkway.js';
import { rigRay, poseWalk } from './rayRig.js';
import { makeTex, radialTex } from './textures.js';

const RAY_H = 1.95;
const smooth = k => k * k * (3 - 2 * k);
const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
const wrapAngle = a => ((a % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;

/**
 * Space walkway scene (Honkai: Star Rail style): Ray walks down a floating bridge, project bubbles hover over pods left and right.
 * Phases: intro → turning → walk ⇄ entering → room, plus 'about' (character-select pose) from intro or walk.
 * cb: onReady(), onPrompt(i|-1), onEnter(i), onFlash(opacity, duration), onKey(key) for overlay shortcuts.
 */
export class World {
  phase = 'intro'; keys = {}; yaw = 0; pitch = .12; vx = 0; vz = 0; speed = 0; amp = 0; stride = 0; lean = 0;
  jy = 0; vy = 0; land = 0; airB = 0; scale0 = 1; prompt = -1; snap = true; dead = false;
  stick = { x:0, y:0, run:false }; jumpQueued = false; // touch input (see TouchControls)
  deck = { y:0, halfWidth:1.6, zMin:-40, zMax:10 }; // walkable area until the walkway loads

  constructor(el, doors, cb) { this.el = el; this.doors = doors; this.cb = cb; this.boot(); }

  async boot() {
    try { await Promise.all([document.fonts.load('700 100px Fredoka'), document.fonts.load('700 40px "Nunito Sans"')]); } catch { /* fall back to system fonts */ }
    if (this.dead) return;
    this.initScene(); this.bindInput();
    this.raf = requestAnimationFrame(this.loop);
    try { await this.loadModels(); } catch (e) { console.warn('model load failed', e); }
    if (!this.dead) this.cb.onReady();
  }

  initScene() {
    const el = this.el, r = this.renderer = new T.WebGLRenderer({ antialias:true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setSize(el.clientWidth, el.clientHeight);
    r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1; r.outputColorSpace = T.SRGBColorSpace;
    el.appendChild(r.domElement); r.domElement.style.display = 'block';
    const scene = this.scene = new T.Scene(); scene.background = new T.Color(0x03040c);
    this.cam = new T.PerspectiveCamera(60, el.clientWidth / el.clientHeight, .05, 2000);
    const pm = new T.PMREMGenerator(r); this.env = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
    scene.add(new T.HemisphereLight(0xb8c8ff, 0x3a1f5c, 1.1));
    const key = new T.DirectionalLight(0xfff0e0, 1.9); key.position.set(2, 4, 4); scene.add(key);
    const rim = new T.DirectionalLight(0x7f8cff, 1.6); rim.position.set(-3, 2, -4); scene.add(rim);
    this.galaxy = buildGalaxy(T, scene);
    // Ray: root carries position + facing, holder carries hop/squash, the rigged mesh goes in once loaded
    const root = this.root = new T.Group(); scene.add(root);
    this.holder = new T.Group(); root.add(this.holder);
    const blob = this.blob = new T.Mesh(new T.PlaneGeometry(1.1, .8), new T.MeshBasicMaterial({ map:radialTex(T, [[0, 'rgba(0,0,0,.5)'], [1, 'rgba(0,0,0,0)']]), transparent:true, depthWrite:false }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = .02; root.add(blob);
    // character-select platform for the About screen
    const ringTex = makeTex(T, 256, 256, (g, w) => { g.strokeStyle = '#9fb4ff'; g.shadowColor = '#7f9cff'; g.shadowBlur = 18; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 20, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 44, 0, 7); g.stroke(); });
    this.platform = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), new T.MeshBasicMaterial({ map:ringTex, transparent:true, opacity:0, blending:T.AdditiveBlending, depthWrite:false, toneMapped:false }));
    this.platform.rotation.x = -Math.PI / 2; this.platform.position.y = .04; root.add(this.platform);
    // dust puffs kicked up by footsteps and landings
    const dustTex = radialTex(T, [[0, 'rgba(200,220,255,.9)'], [1, 'rgba(200,220,255,0)']]);
    this.dust = Array.from({ length:14 }, () => { const m = new T.Sprite(new T.SpriteMaterial({ map:dustTex, transparent:true, depthWrite:false, blending:T.AdditiveBlending, opacity:0 })); m.visible = false; scene.add(m); return { m, life:0 }; });
    // the composer renders off-screen, so it needs its own MSAA target or thin bright rails shimmer as the camera moves
    const pr = r.getPixelRatio(), rt = new T.WebGLRenderTarget(el.clientWidth * pr, el.clientHeight * pr, { type:T.HalfFloatType, samples:4 });
    const composer = this.composer = new EffectComposer(r, rt);
    composer.addPass(new RenderPass(scene, this.cam));
    // high threshold so only the neon strips and bubbles glow, not the sky or specular glints
    composer.addPass(new UnrealBloomPass(new T.Vector2(el.clientWidth, el.clientHeight), .45, .4, .9));
    composer.addPass(new OutputPass());
    this.last = performance.now();
  }

  async loadModels() {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [boy, bubble, walkway] = await Promise.all(['ray-boy', 'bubble', WALK.file].map(n => loader.loadAsync('/assets/' + n + '.glb')));
    if (this.dead) return;
    const ray = rigRay(T, boy.scene, this.env);
    this.scale0 = RAY_H / ray.height; this.holder.add(ray.mesh); this.rig = ray.rig;
    const w = buildWalkway(T, this.scene, walkway.scene, this.env);
    this.deck = { y:w.deckY, halfWidth:w.halfWidth, zMin:w.zMin, zMax:w.zMax, zStart:w.zStart };
    this.pods = w.pods;
    this.bubbles = buildBubbles(T, this.scene, this.doors, w.pods, bubble.scene, this.env);
    if (this.phase === 'intro') { this.home(); this.snap = true; }
  }

  bindInput() {
    const c = this.renderer.domElement, on = (t, ev, f, o) => { t.addEventListener(ev, f, o); return () => t.removeEventListener(ev, f, o); };
    const look = (dx, dy) => this.look(dx, dy);
    let drag = false;
    this.offs = [
      on(window, 'resize', () => { const w = this.el.clientWidth, h = this.el.clientHeight; this.renderer.setSize(w, h); this.composer.setSize(w, h); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); }),
      on(window, 'keydown', e => {
        if (e.target.closest && e.target.closest('input, textarea')) return; // typing in the chat box must not move Ray
        const k = e.key.toLowerCase(); this.keys[k] = true;
        if (k === 'e' && this.prompt >= 0 && this.phase === 'walk') this.enter(this.prompt);
        if ([' ', 'arrowup', 'arrowdown'].includes(k) && this.phase === 'walk') e.preventDefault();
        this.cb.onKey(k);
      }),
      on(window, 'keyup', e => { this.keys[e.key.toLowerCase()] = false; }),
      on(window, 'blur', () => { this.keys = {}; }),
      on(window, 'mousemove', e => { if (this.phase !== 'walk') return; if (document.pointerLockElement === c) look(e.movementX, e.movementY); else if (drag) look(e.movementX * 1.4, e.movementY * 1.4); }),
      on(c, 'mousedown', () => { drag = true; this.lock(); }),
      on(window, 'mouseup', () => { drag = false; }),
    ];
  }

  lock(force) {
    if (!force && this.phase !== 'walk') return;
    // pointer lock is for mouse look only: Android Chrome honours it for touch too, which then routes every touch
    // to the canvas and the on-screen joystick never receives a finger
    if (matchMedia('(pointer: coarse)').matches) return;
    try { const p = this.renderer.domElement.requestPointerLock(); p && p.catch && p.catch(() => {}); } catch { /* pointer lock unsupported */ }
  }
  unlock() { document.exitPointerLock && document.exitPointerLock(); }

  // ---- touch input (phone / tablet) ----
  look(dx, dy) { if (this.phase !== 'walk') return; this.yaw -= dx * .0022; this.pitch = Math.max(-.35, Math.min(.85, this.pitch + dy * .0022)); }
  setStick(m) { this.stick = m; }
  jump() { if (this.phase === 'walk') this.jumpQueued = true; }
  setPrompt(i) { if (i !== this.prompt) { this.prompt = i; this.cb.onPrompt(i); } }

  // Ray at the start of the walkway, facing the camera
  home() {
    this.root.position.set(0, this.deck.y, this.deck.zStart ?? this.deck.zMax - 5); this.root.rotation.y = 0;
    this.vx = this.vz = this.jy = this.vy = 0; this.yaw = 0; this.pitch = .12;
  }

  // ---- phase changes driven by the UI ----
  start() {
    if (this.phase !== 'intro' || !this.rig) return;
    this.phase = 'turning'; this.turnT0 = performance.now(); this.yaw = 0; this.pitch = .12; this.lock(true);
  }
  // Walk to the deck edge beside the pod, turn to face it, hop toward the bubble, flash into the room
  enter(i) {
    if (!this.bubbles || this.phase !== 'walk') return;
    const pod = this.pods[i], side = Math.sign(pod.x), R = this.root, face = side * Math.PI / 2;
    this.phase = 'entering'; this.unlock(); this.setPrompt(-1);
    // camera ends up behind Ray, looking out over the railing at the bubble
    this.anim = { i, t0:performance.now(), from:R.position.clone(), to:new T.Vector3(side * this.deck.halfWidth, this.deck.y, pod.z), face,
      yaw0:this.yaw, dyaw:wrapAngle(face + Math.PI - this.yaw), bubble:this.bubbles.items[i].group.position };
    setTimeout(() => this.cb.onFlash(1, '.5s'), 1000);
    setTimeout(() => { if (this.dead) return; this.phase = 'room'; this.cb.onEnter(i); setTimeout(() => this.cb.onFlash(0, '1s'), 200); }, 1550);
  }
  // Stand on the walkway just past bubble i, facing on down the walkway
  parkAt(i) {
    const pod = this.pods[i];
    this.root.position.set(Math.sign(pod.x) * (this.deck.halfWidth - .6), this.deck.y, pod.z + 1.2);
    this.root.rotation.y = Math.PI; this.vx = this.vz = this.jy = this.vy = 0; this.yaw = 0; this.pitch = .12;
    this.snap = true; this.anim = null; this.phase = 'walk';
  }
  exitRoom() { if (this.phase === 'room') this.parkAt(this.anim.i); }
  teleport(i) { if (this.bubbles && ['walk', 'intro', 'about'].includes(this.phase)) { this.aboutFrom = null; this.parkAt(i); } }
  goHome() {
    if (!['walk', 'intro', 'about'].includes(this.phase)) return;
    this.home(); this.phase = 'intro'; this.snap = true; this.aboutFrom = null; this.unlock(); this.setPrompt(-1);
  }
  openAbout() {
    if (!['walk', 'intro'].includes(this.phase)) return false;
    this.aboutFrom = { phase:this.phase, rot:this.root.rotation.y }; this.phase = 'about'; this.unlock(); this.setPrompt(-1); this.vx = this.vz = 0;
    return true;
  }
  closeAbout() {
    if (this.phase !== 'about' || !this.aboutFrom) return;
    this.phase = this.aboutFrom.phase; this.root.rotation.y = this.aboutFrom.rot; this.aboutFrom = null;
  }

  puff(x, z) { const d = this.dust.find(q => q.life <= 0) || this.dust[0]; d.life = 1; d.m.position.set(x, this.deck.y + .08, z); d.m.visible = true; }

  loop = now => {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(.05, (now - this.last) / 1000), t = now / 1000; this.last = now;
    const R = this.root, k = this.keys;
    let moving = false, run = false, look = 0, crouch = 0, hop = 0;

    if (this.phase === 'walk') {
      const st = this.stick, touch = st.x || st.y;
      run = !!k.shift || st.run; const spd = run ? 6.2 : 3.4;
      // keyboard gives full-speed directions; the thumb-stick gives an analogue push (0..1)
      const f = touch ? st.y : (k.w || k.arrowup ? 1 : 0) - (k.s || k.arrowdown ? 1 : 0), s = touch ? st.x : (k.d ? 1 : 0) - (k.a ? 1 : 0);
      if (k.arrowleft) this.yaw += 1.8 * dt; if (k.arrowright) this.yaw -= 1.8 * dt;
      let tvx = 0, tvz = 0;
      if (f || s) {
        const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw), dx = -sy * f + cy * s, dz = -cy * f - sy * s, l = Math.hypot(dx, dz);
        const push = touch ? Math.min(1, Math.hypot(f, s)) : 1;
        tvx = dx / l * spd * push; tvz = dz / l * spd * push;
      }
      const acc = damp(f || s ? 8 : 11, dt);
      this.vx += (tvx - this.vx) * acc; this.vz += (tvz - this.vz) * acc;
      R.position.x = Math.max(-this.deck.halfWidth, Math.min(this.deck.halfWidth, R.position.x + this.vx * dt));
      R.position.z = Math.max(this.deck.zMin, Math.min(this.deck.zMax, R.position.z + this.vz * dt));
      this.speed = Math.hypot(this.vx, this.vz); moving = this.speed > .15;
      if (this.speed > .25) R.rotation.y += wrapAngle(Math.atan2(this.vx, this.vz) - R.rotation.y) * damp(11, dt);
      if ((k[' '] && !this.jumpHeld || this.jumpQueued) && this.jy <= 0) { this.vy = 4.8; this.jy = .001; this.jumpHeld = !!k[' ']; }
      this.jumpQueued = false;
      if (!k[' ']) this.jumpHeld = false;
      // the ring Ray is walking past raises the prompt: measure to the railing beside each ring, so the ring on his side wins
      let best = -1, bd = 4.2;
      (this.pods || []).forEach((p, i) => { const d = Math.hypot(Math.sign(p.x) * this.deck.halfWidth - R.position.x, p.z - R.position.z); if (d < bd) { bd = d; best = i; } });
      this.setPrompt(best);
    } else if (this.phase === 'turning') {
      const tt = (now - this.turnT0) / 1000, sp = Math.max(0, Math.min(1, (tt - .16) / .58)), e = sp < .5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2;
      R.rotation.y = e * Math.PI;
      crouch = tt < .16 ? Math.sin(tt / .16 * Math.PI / 2) : tt < .3 ? 1 - (tt - .16) / .14 : (tt > .74 && tt < .96 ? Math.sin((tt - .74) / .22 * Math.PI) * .8 : 0);
      hop = tt > .2 && tt < .74 ? Math.sin((tt - .2) / .54 * Math.PI) * .12 : 0;
      if (tt >= .96) this.phase = 'walk';
    } else if (this.phase === 'entering') {
      const a = this.anim, tt = (now - a.t0) / 1000, e = smooth(Math.min(1, tt / .9));
      R.position.lerpVectors(a.from, a.to, e); moving = e < 1;
      R.rotation.y += wrapAngle((e < .7 && a.from.distanceTo(a.to) > .3 ? Math.atan2(a.to.x - a.from.x, a.to.z - a.from.z) : a.face) - R.rotation.y) * damp(10, dt);
      this.yaw = a.yaw0 + a.dyaw * smooth(Math.min(1, tt / .9)); this.pitch += (-.05 - this.pitch) * damp(3, dt);
      if (tt > .9 && tt < 1.4) hop = Math.sin((tt - .9) / .5 * Math.PI) * .5;
    } else if (this.phase === 'about') {
      R.rotation.y += wrapAngle(Math.sin(t * .45) * .45 - R.rotation.y) * damp(3, dt); look = Math.sin(t * .6) * .15;
    } else if (this.phase === 'intro') {
      look = Math.sin(t * .7) * .28;
    }
    if (this.phase !== 'walk') { this.vx = this.vz = 0; this.speed += ((moving ? 2.2 : 0) - this.speed) * damp(10, dt); }

    // jump arc + landing puffs
    if (this.jy > 0) {
      this.vy -= 13 * dt; this.jy += this.vy * dt;
      if (this.jy <= 0) { this.jy = 0; if (this.vy < -2) { this.land = 1; this.puff(R.position.x - .15, R.position.z); this.puff(R.position.x + .15, R.position.z); } this.vy = 0; }
    }
    this.land = Math.max(0, this.land - dt * 4);

    // gait: stride phase advances with distance travelled; lean into turns
    const prevRot = this.prevRot ?? R.rotation.y; this.prevRot = R.rotation.y;
    this.amp += (Math.min(1, this.speed / 2.6) - this.amp) * damp(10, dt);
    const prevStride = this.stride; this.stride += this.jy > 0 ? 0 : this.speed * dt / (run ? 1.9 : 1.25);
    this.lean += (Math.max(-.08, Math.min(.08, -wrapAngle(R.rotation.y - prevRot) / Math.max(dt, .001) * .02)) - this.lean) * damp(8, dt);
    if (this.speed > .6 && this.jy <= 0 && Math.floor(prevStride * 2) !== Math.floor(this.stride * 2)) this.puff(R.position.x + (Math.random() - .5) * .2, R.position.z + (Math.random() - .5) * .2);
    this.airB += ((this.jy > 0 ? 1 : 0) - this.airB) * damp(14, dt);
    const rn = Math.max(0, Math.min(1, (this.speed - 3.6) / 2)) * this.amp, cr = Math.min(1.2, crouch + this.land * .9);
    if (this.rig) poseWalk(this.rig, { t, ph:this.stride * Math.PI * 2, a:this.amp, rn, ab:this.airB, cr, vy:this.vy, lean:this.lean, look });
    const sq = Math.max(-.05, Math.min(.07, this.vy * .014)) * this.airB - .05 * this.land, S = this.scale0;
    this.holder.position.y = hop + this.jy;
    this.holder.scale.set(S * (1 - sq * .5), S * (1 + sq), S * (1 - sq * .5));
    this.blob.scale.setScalar(1 / (1 + this.jy * .8)); this.blob.material.opacity = 1 / (1 + this.jy * 1.5);
    this.platform.material.opacity += ((this.phase === 'about' ? .9 : 0) - this.platform.material.opacity) * damp(4, dt);
    this.platform.rotation.z = t * .3;
    this.dust.forEach(p => { if (p.life <= 0) return; p.life -= dt * 1.6; const kk = Math.max(0, p.life); p.m.scale.setScalar(.2 + (1 - kk) * .55); p.m.position.y += dt * .25; p.m.material.opacity = kk * .3; if (kk <= 0) p.m.visible = false; });

    this.updateCamera(dt, t, run);
    this.galaxy.update(t, this.cam.position);
    if (this.bubbles) this.bubbles.update(t, this.prompt, dt, this.cam.position);
    this.composer.render();
  };

  updateCamera(dt, t, run) {
    const cam = this.cam, R = this.root, portrait = cam.aspect < 1;
    const P = R.position.clone().add(new T.Vector3(0, 1.35 + this.jy * .6, 0));
    let pos, target, fov;
    if (this.phase === 'intro') {
      const a = Math.sin(t * .12) * .35;
      pos = P.clone().add(new T.Vector3(Math.sin(a) * 4.4, .2, Math.cos(a) * 4.4)); target = P.clone().add(new T.Vector3(0, portrait ? -.75 : -.3, 0)); fov = portrait ? 62 : 50;
    } else if (this.phase === 'about') {
      // character-select framing: Ray centre-left (desktop) or upper-centre (phone), details panel on the other side
      pos = portrait ? P.clone().add(new T.Vector3(0, -.2, 9.3)) : P.clone().add(new T.Vector3(1.55, -.15, 4.3));
      target = portrait ? P.clone().add(new T.Vector3(0, -1.95, 0)) : P.clone().add(new T.Vector3(1.55, -.35, 0)); fov = 50;
    } else {
      // follow camera steered by yaw/pitch; while entering it swings round to frame the bubble
      const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw), cp = Math.cos(this.pitch), spi = Math.sin(this.pitch);
      const back = new T.Vector3(sy * cp, spi, cy * cp), focus = this.anim && this.phase !== 'walk';
      pos = P.clone().addScaledVector(back, 4.2).add(new T.Vector3(0, .45, 0));
      target = focus ? this.anim.bubble.clone() : P.clone().addScaledVector(back, -10).add(new T.Vector3(0, .45, 0));
      fov = focus ? 58 : run && this.speed > 4 ? 72 : 64;
    }
    const lf = this.snap ? 1 : damp(this.phase === 'walk' ? 10 : 3.5, dt); this.snap = false;
    cam.position.lerp(pos, lf);
    this.camTarget = this.camTarget ? this.camTarget.lerp(target, lf) : target.clone();
    cam.lookAt(this.camTarget);
    cam.fov += (fov - cam.fov) * damp(4, dt); cam.updateProjectionMatrix();
  }

  dispose() {
    this.dead = true; cancelAnimationFrame(this.raf);
    (this.offs || []).forEach(f => f());
    if (this.renderer) { this.renderer.dispose(); this.renderer.domElement.remove(); }
  }
}
