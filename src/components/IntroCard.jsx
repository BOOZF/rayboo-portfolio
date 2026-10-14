import { PROFILE } from '../content/profile.js';

export default function IntroCard() {
  return (
    <div className="intro-card glass">
      <img src="/assets/ray-headshot.webp" alt="" width={72} height={72} style={{ width:72, height:72, flex:'none', borderRadius:16, objectFit:'cover', background:'radial-gradient(circle at 50% 35%,#3a4878,#1b2140)' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ font:'700 22px Fredoka' }}>Hi, I'm {PROFILE.preferredName.split(' ')[0]}</div>
        <div style={{ fontSize:15, lineHeight:1.35, textWrap:'pretty' }}>Walk the star bridge and step into each bubble to explore my journey.</div>
      </div>
    </div>
  );
}
