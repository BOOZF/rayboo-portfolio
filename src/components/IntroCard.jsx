import { T } from '../i18n.js';

export default function IntroCard() {
  return (
    <div className="intro-card glass">
      <img src="/assets/ray-headshot.webp" alt="" width={72} height={72} className="intro-photo" />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div className="intro-title">{T.introHi}</div>
        <div className="intro-text">{T.introText}</div>
      </div>
    </div>
  );
}
