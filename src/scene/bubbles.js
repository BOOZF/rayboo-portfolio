import { bakeMesh } from './models.js';
import { bubbleLabel, radialTex } from './textures.js';

export const BUBBLE_R = 1.9;

export const BUBBLE_LIFT = 1.9; // bubble centre height above the deck, so each bubble sits cradled in its ring

const rimMat = (T, color) => new T.ShaderMaterial({
  transparent:true, depthWrite:false, blending:T.AdditiveBlending, side:T.FrontSide,
  uniforms:{ uColor:{ value:new T.Color(color) }, uGlow:{ value:.6 } },
  vertexShader:`varying vec3 vN; varying vec3 vV; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader:`uniform vec3 uColor; uniform float uGlow; varying vec3 vN; varying vec3 vV;
    void main() { float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.6); gl_FragColor = vec4(uColor * f * (.8 + uGlow * 1.6), f); }`,
});

// Soap-bubble shell (Meshy bubble shape + iridescent glass), a coloured fresnel rim, a glow core and the floating label card.
export function buildBubbles(T, scene, doors, pods, bubbleSrc, env) {
  const { geo } = bakeMesh(T, bubbleSrc), bb = geo.boundingBox, c = bb.getCenter(new T.Vector3());
  geo.translate(-c.x, -c.y, -c.z); const s = BUBBLE_R / (Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y) / 2);
  const shell = new T.MeshPhysicalMaterial({ color:0xffffff, roughness:.04, metalness:0, transparent:true, opacity:.1, iridescence:1, iridescenceIOR:1.3,
    iridescenceThicknessRange:[120, 760], envMap:env, envMapIntensity:.45, depthWrite:false, specularIntensity:.6 });
  const items = doors.map((d, i) => {
    const group = new T.Group(); group.position.copy(pods[i]).add(new T.Vector3(0, BUBBLE_LIFT, 0)); scene.add(group);
    const ball = new T.Mesh(geo, shell); ball.scale.setScalar(s); ball.renderOrder = 2; group.add(ball);
    const rim = new T.Mesh(geo, rimMat(T, d.color)); rim.scale.setScalar(s * 1.01); rim.renderOrder = 3; group.add(rim);
    const glow = new T.Sprite(new T.SpriteMaterial({ map:radialTex(T, [[0, d.color + '55'], [.4, d.color + '18'], [1, d.color + '00']]), blending:T.AdditiveBlending, depthWrite:false, transparent:true }));
    glow.scale.setScalar(BUBBLE_R * 2.4); group.add(glow);
    const label = new T.Sprite(new T.SpriteMaterial({ map:bubbleLabel(T, d), transparent:true, depthWrite:false, toneMapped:false }));
    label.scale.set(1.3, 2.6, 1); label.renderOrder = 4; group.add(label);
    return { i, group, rim, glow, label, base:group.position.clone(), near:0 };
  });
  return {
    items,
    update(t, nearIdx, dt, camPos) {
      items.forEach(b => {
        b.near += ((b.i === nearIdx ? 1 : 0) - b.near) * Math.min(1, dt * 6);
        b.group.position.copy(b.base).add({ x:0, y:Math.sin(t * .7 + b.i) * .35, z:0 });
        b.group.rotation.y = t * .15 + b.i; b.group.scale.setScalar(1 + b.near * .06 + Math.sin(t * 1.6 + b.i) * .012);
        b.rim.material.uniforms.uGlow.value = .35 + b.near * .9;
        b.glow.material.opacity = .35 + b.near * .65;
        // keep the label card in front of the orb core, on the side facing the camera
        b.label.position.copy(camPos).sub(b.group.position).normalize().multiplyScalar(BUBBLE_R * .55).applyQuaternion(b.group.quaternion.clone().invert());
      });
    },
  };
}
