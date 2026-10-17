import { PROFILE } from '../content/profile.js';
import { T, pagePath } from '../i18n.js';

export default function ContactPanel({ onClose }) {
  return (
    <div className="glass info-panel">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ font:'700 22px Fredoka' }}>{T.contactTitle}</div>
        <button className="icon-btn" onClick={onClose} aria-label={T.close}>×</button>
      </div>
      <div style={{ fontSize:15, lineHeight:1.5, opacity:.9 }}>{T.contactText}</div>
      <a className="link-btn" href={'mailto:' + PROFILE.email} target="_blank" rel="noopener noreferrer">✉ {PROFILE.email}</a>
      <div style={{ fontSize:13, opacity:.7 }}>{PROFILE.location}</div>
      <div style={{ fontSize:13, display:'flex', gap:14 }}><a href={pagePath('/faq')}>{T.faq}</a><a href={pagePath('/privacy')}>{T.privacy}</a></div>
    </div>
  );
}
