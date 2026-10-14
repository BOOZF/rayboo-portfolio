import { radialTex } from './textures.js';

const starMat = (T, size) => new T.ShaderMaterial({
  transparent:true, depthWrite:false, blending:T.AdditiveBlending,
  uniforms:{ uTime:{ value:0 }, uSize:{ value:size }, uPx:{ value:Math.min(devicePixelRatio, 2) } },
  vertexShader:`attribute float aSize; attribute float aSeed; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uTime, uSize, uPx;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
      vA = .55 + .45 * sin(uTime * (.6 + aSeed * 1.8) + aSeed * 40.); vC = color;
      gl_PointSize = aSize * uSize * uPx * (300. / -mv.z); }`,
  fragmentShader:`varying vec3 vC; varying float vA;
    void main() { float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); a *= a; gl_FragColor = vec4(vC * a * vA * 1.6, a * vA); }`,
});

function starField(T, count, rMin, rMax, size, box) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), sz = new Float32Array(count), seed = new Float32Array(count);
  const tints = [[1, 1, 1], [.75, .85, 1], [1, .85, .65], [.85, .75, 1]], v = new T.Vector3();
  for (let i = 0; i < count; i++) {
    if (box) v.set((Math.random() - .5) * box[0], (Math.random() - .5) * box[1], box[2] - Math.random() * box[3]);
    else v.randomDirection().multiplyScalar(rMin + Math.random() * (rMax - rMin));
    v.toArray(pos, i * 3); const c = tints[Math.random() * tints.length | 0]; col.set(c, i * 3);
    sz[i] = Math.pow(Math.random(), 3) * 3 + .4; seed[i] = Math.random();
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
  g.setAttribute('aSize', new T.BufferAttribute(sz, 1)); g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
  return new T.Points(g, starMat(T, size));
}

// Sky dome (the Meshy galaxy image, mirrored so it tiles seamlessly), twinkling star shells, near-field dust and nebula glows.
export function buildGalaxy(T, scene) {
  const sky = new T.Mesh(new T.SphereGeometry(600, 64, 32), new T.MeshBasicMaterial({ side:T.BackSide, depthWrite:false, toneMapped:false, color:0x8a8aa6 }));
  sky.renderOrder = -10; scene.add(sky);
  new T.TextureLoader().load('/assets/galaxy-sky.jpg', t => {
    t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.MirroredRepeatWrapping; t.repeat.set(4, 2); t.anisotropy = 8;
    sky.material.map = t; sky.material.needsUpdate = true;
  });
  const far = starField(T, 5000, 250, 520, 1.6), near = starField(T, 1600, 0, 0, .55, [140, 70, 40, 230]);
  scene.add(far, near);
  const nebulae = [[0x6a4cff, -120, 40, -260, 220], [0xff4fa8, 160, -30, -200, 180], [0x3fa9ff, -40, -60, -120, 160], [0x9b6bff, 90, 70, 40, 200]].map(([c, x, y, z, s]) => {
    const col = new T.Color(c), rgb = `${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0}`;
    const sp = new T.Sprite(new T.SpriteMaterial({ map:radialTex(T, [[0, `rgba(${rgb},.16)`], [.4, `rgba(${rgb},.05)`], [1, `rgba(${rgb},0)`]]), blending:T.AdditiveBlending, depthWrite:false, transparent:true }));
    sp.position.set(x, y, z); sp.scale.setScalar(s); scene.add(sp); return sp;
  });
  return {
    update(t, camPos) { sky.position.copy(camPos); far.position.copy(camPos).multiplyScalar(.85); far.material.uniforms.uTime.value = near.material.uniforms.uTime.value = t; nebulae.forEach((n, i) => { n.material.rotation = t * .01 * (i % 2 ? 1 : -1); }); },
  };
}
