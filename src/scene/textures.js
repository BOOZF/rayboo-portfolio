// Canvas-drawn textures and icons, shared by the 3D bubbles and the HTML overlays.

export function makeTex(T, w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

export function radialTex(T, stops) {
  return makeTex(T, 128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    stops.forEach(([at, c]) => gr.addColorStop(at, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}

// Line icon centred on (0,0), about 180px across; caller sets stroke/fill colour and line width.
export function drawIcon(g, icon) {
  const b = () => g.beginPath();
  switch (icon) {
    case 'drop': b(); g.moveTo(0, -95); g.bezierCurveTo(30, -40, 70, 0, 70, 40); g.arc(0, 40, 70, 0, Math.PI); g.bezierCurveTo(-70, 0, -30, -40, 0, -95); g.stroke(); break;
    case 'doc': g.strokeRect(-55, -80, 110, 160); for (let i = 0; i < 4; i++) { b(); g.moveTo(-30, -40 + i * 30); g.lineTo(30, -40 + i * 30); g.stroke(); } break;
    case 'chat': b(); g.roundRect(-80, -70, 160, 110, 26); g.stroke(); b(); g.moveTo(-30, 40); g.lineTo(-50, 85); g.lineTo(10, 40); g.stroke(); break;
    case 'bars': [[-75, 40], [-30, 80], [15, 120], [60, 160]].forEach(([x, hh]) => g.fillRect(x, 80 - hh, 32, hh)); break;
    case 'chip': g.strokeRect(-55, -55, 110, 110); g.strokeRect(-22, -22, 44, 44); for (let i = -1; i <= 1; i++) { b(); g.moveTo(i * 30, -55); g.lineTo(i * 30, -85); g.moveTo(i * 30, 55); g.lineTo(i * 30, 85); g.moveTo(-55, i * 30); g.lineTo(-85, i * 30); g.moveTo(55, i * 30); g.lineTo(85, i * 30); g.stroke(); } break;
    case 'shield': b(); g.moveTo(0, -90); g.lineTo(70, -60); g.lineTo(60, 30); g.quadraticCurveTo(40, 70, 0, 95); g.quadraticCurveTo(-40, 70, -60, 30); g.lineTo(-70, -60); g.closePath(); g.stroke(); break;
    case 'bag': b(); g.roundRect(-70, -35, 140, 120, 14); g.stroke(); b(); g.arc(0, -35, 38, Math.PI, 0); g.stroke(); break;
    case 'heart': b(); g.moveTo(0, 80); g.bezierCurveTo(-110, 10, -70, -90, 0, -40); g.bezierCurveTo(70, -90, 110, 10, 0, 80); g.stroke(); break;
    default: for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; b(); g.moveTo(Math.cos(a) * 35, Math.sin(a) * 35); g.lineTo(Math.cos(a) * 85, Math.sin(a) * 85); g.stroke(); } b(); g.arc(0, 0, 20, 0, 7); g.fill();
  }
}

function strokeIcon(g, icon, color, x, y, scale) {
  g.save(); g.translate(x, y); g.scale(scale, scale);
  g.strokeStyle = color; g.fillStyle = color; g.shadowColor = color; g.shadowBlur = 30; g.lineWidth = 14; g.lineCap = g.lineJoin = 'round';
  drawIcon(g, icon); g.restore();
}

const iconCache = {};
export function iconUrl(icon, color) {
  const k = icon + color;
  if (!iconCache[k]) { const c = document.createElement('canvas'); c.width = c.height = 256; strokeIcon(c.getContext('2d'), icon, color, 128, 128, 1); iconCache[k] = c.toDataURL(); }
  return iconCache[k];
}

// Break text into lines no wider than maxW. Latin words wrap at spaces; Chinese, which has no spaces, can break
// between any two characters.
export function wrapText(g, text, maxW) {
  // tokens: runs of spaces, single Chinese characters, or Latin words; the original spacing is kept
  const tokens = text.match(/\s+|[\u3000-\u9fff\uff00-\uffef]|[^\s\u3000-\u9fff\uff00-\uffef]+/g) || [];
  const lines = []; let cur = '';
  tokens.forEach(tk => {
    if (/^\s+$/.test(tk)) { if (cur) cur += ' '; return; }
    const t = cur + tk;
    if (cur.trim() && g.measureText(t.trimEnd()).width > maxW) { lines.push(cur.trimEnd()); cur = tk; } else cur = t;
  });
  if (cur.trim()) lines.push(cur.trimEnd());
  return lines;
}

// Floating card inside each bubble: number, title, subtitle and icon on a transparent background.
export function bubbleLabel(T, door) {
  return makeTex(T, 512, 1024, (g, w) => {
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.shadowColor = door.color; g.shadowBlur = 26;
    g.font = '700 170px Fredoka'; g.fillText(door.num, w / 2, 250);
    g.shadowColor = 'rgba(0,0,20,.8)'; g.shadowBlur = 14;
    g.font = '700 62px Fredoka';
    const lines = wrapText(g, door.title, 440);
    lines.forEach((l, i) => g.fillText(l, w / 2, 350 + i * 68));
    let fs = 34; g.font = '700 ' + fs + 'px "Nunito Sans"';
    while (g.measureText(door.sub).width > 450 && fs > 22) { fs -= 2; g.font = '700 ' + fs + 'px "Nunito Sans"'; }
    g.globalAlpha = .85; g.fillText(door.sub, w / 2, 350 + lines.length * 68 + 6); g.globalAlpha = 1;
    strokeIcon(g, door.icon, door.color, w / 2, 740, .9);
  });
}
