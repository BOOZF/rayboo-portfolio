import { PROFILE } from '../content/profile.js';

export default function IntroCard() {
  return (
    <div className="intro-card glass">
      <img src="/assets/ray-headshot.webp" alt="" width={72} height={72} className="intro-photo" />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div className="intro-title">Hi, I'm {PROFILE.preferredName.split(' ')[0]}</div>
        <div className="intro-text">Walk the star bridge and step into each bubble to explore my journey.</div>
      </div>
    </div>
  );
}
