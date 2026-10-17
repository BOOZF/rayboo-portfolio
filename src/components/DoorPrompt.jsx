import { T } from '../i18n.js';
export default function DoorPrompt({ door, onOpen }) {
  return (
    <button className="door-prompt" onClick={onOpen} style={{ borderColor:door.color + '88' }}>
      <span className="key-cap">E</span>
      <span style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1 }}>
        <span style={{ font:'600 20px Fredoka' }}>{T.enterBubble}</span>
        <span style={{ fontSize:12, opacity:.8 }}>{door.num} · {door.title}</span>
      </span>
    </button>
  );
}
