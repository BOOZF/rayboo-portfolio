import { useRef, useState } from 'react';
import { joystick } from '../scene/joystick.js';
import { T } from '../i18n.js';

const RADIUS = 56, LOOK_SPEED = 1.6;

/**
 * Phone / tablet controls over the 3D view: a floating joystick wherever the left thumb lands (push to the edge to run),
 * drag anywhere on the right half to look, and a Jump button.
 */
export default function TouchControls({ world }) {
  const fingers = useRef({}), [stick, setStick] = useState(null);

  const down = e => {
    if (e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = { x:e.clientX, y:e.clientY }, hasStick = Object.values(fingers.current).some(f => f.role === 'stick');
    const role = p.x < innerWidth / 2 && !hasStick ? 'stick' : 'look';
    fingers.current[e.pointerId] = { role, start:p, last:p };
    if (role === 'stick') setStick({ start:p, knob:p });
  };
  const move = e => {
    const f = fingers.current[e.pointerId]; if (!f) return;
    const p = { x:e.clientX, y:e.clientY };
    if (f.role === 'stick') {
      const m = joystick(f.start, p, RADIUS);
      world().setStick(m);
      setStick({ start:f.start, knob:{ x:f.start.x + m.x * RADIUS, y:f.start.y - m.y * RADIUS }, run:m.run });
    } else {
      world().look((p.x - f.last.x) * LOOK_SPEED, (p.y - f.last.y) * LOOK_SPEED);
    }
    f.last = p;
  };
  const up = e => {
    const f = fingers.current[e.pointerId]; if (!f) return;
    delete fingers.current[e.pointerId];
    if (f.role === 'stick') { world().setStick({ x:0, y:0, run:false }); setStick(null); }
  };

  return (
    <>
      <div className="touch-surface" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      {stick && (
        <div className={'stick' + (stick.run ? ' run' : '')} style={{ left:stick.start.x, top:stick.start.y, width:RADIUS * 2, height:RADIUS * 2 }} aria-hidden="true">
          <div className="stick-knob" style={{ transform:`translate(${stick.knob.x - stick.start.x}px, ${stick.knob.y - stick.start.y}px)` }} />
        </div>
      )}
      <button className="touch-btn touch-jump" onPointerDown={e => { e.stopPropagation(); world().jump(); }} aria-label={T.jump}>⤒<span>{T.jump}</span></button>
    </>
  );
}
