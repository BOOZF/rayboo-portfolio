import { PROFILE } from '../content/profile.js';

export default function ContactPanel({ onClose }) {
  return (
    <div className="glass info-panel">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ font:'700 22px Fredoka' }}>Contact</div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div style={{ fontSize:15, lineHeight:1.5, opacity:.9 }}>Building enterprise AI that ships. Happy to talk projects, roles or ideas.</div>
      <a className="link-btn" href={'mailto:' + PROFILE.email} target="_blank" rel="noopener noreferrer">✉ {PROFILE.email}</a>
      <div style={{ fontSize:13, opacity:.7 }}>{PROFILE.location}</div>
    </div>
  );
}
