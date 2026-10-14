import { useState } from 'react';
import { PROFILE, JOURNEY, SKILLS, EDUCATION, HIGHLIGHTS } from '../content/profile.js';
import { iconUrl } from '../scene/textures.js';

const TABS = ['Profile', 'Journey', 'Skills', 'Education', 'Highlights'];

function Profile() {
  return (
    <>
      <div style={{ display:'flex', gap:16, alignItems:'center' }}>
        <img src={PROFILE.portrait} alt={PROFILE.fullName} className="about-portrait" />
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <div className="about-label">Preferred name</div><div style={{ font:'700 22px Fredoka' }}>{PROFILE.preferredName}</div>
          <div className="about-label" style={{ marginTop:6 }}>Full name</div><div style={{ fontWeight:700 }}>{PROFILE.fullName}</div>
        </div>
      </div>
      <div className="about-label">What I bring</div>
      <div className="strengths">{PROFILE.strengths.map(s => (
        <div key={s.title} className="strength">
          <img src={iconUrl(s.icon, '#ffcf8a')} alt="" width={34} height={34} />
          <div><b>{s.title}</b><p>{s.text}</p></div>
        </div>
      ))}</div>
      {PROFILE.summary.map(p => <p key={p} style={{ margin:0, lineHeight:1.6 }}>{p}</p>)}
      <div style={{ fontSize:13, opacity:.7 }}>📍 {PROFILE.location}</div>
    </>
  );
}

function Journey() {
  return (
    <div className="timeline">
      {JOURNEY.map(j => (
        <div key={j.when + j.role} className="tl-item">
          <div className="about-label">{j.when}</div>
          <div style={{ font:'600 18px Fredoka' }}>{j.role}</div>
          <div style={{ fontSize:13, opacity:.75, marginBottom:6 }}>{j.org}</div>
          <ul className="room-bullets">{j.points.map(p => <li key={p}>{p}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function Skills() {
  return SKILLS.map(s => (
    <div key={s.group} style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div className="about-label">{s.group}</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{s.items.map(i => <span key={i} className="tag">{i}</span>)}</div>
    </div>
  ));
}

function Education() {
  return (
    <>
      <div className="about-label">{EDUCATION.when}</div>
      <div style={{ font:'600 20px Fredoka' }}>{EDUCATION.degree}</div>
      <div style={{ opacity:.8 }}>{EDUCATION.school}</div>
      <ul className="room-bullets">{EDUCATION.points.map(p => <li key={p}>{p}</li>)}</ul>
    </>
  );
}

function Highlights() {
  return HIGHLIGHTS.map(h => (
    <div key={h.title} style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ font:'600 18px Fredoka' }}>{h.title}</div>
      <div className="about-label">{h.where}</div>
      <p style={{ margin:0, lineHeight:1.55 }}>{h.text}</p>
      {h.images && <div className="photo-row">{h.images.map(im => <img key={im.src} src={im.src} alt={im.alt} loading="lazy" />)}</div>}
    </div>
  ));
}

const PANES = { Profile, Journey, Skills, Education, Highlights };

// Game-style character sheet: Ray stands on the platform in the 3D scene (left), details slide in on the right.
export default function AboutScreen({ onClose }) {
  const [tab, setTab] = useState('Profile'), Pane = PANES[tab];
  return (
    <div className="about-panel glass">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div>
          <div className="about-label">Player profile</div>
          <div style={{ font:'700 clamp(28px,3vw,38px) Fredoka', lineHeight:1.05 }}>{PROFILE.preferredName}</div>
          <div style={{ fontWeight:700, opacity:.85 }}>{PROFILE.title}</div>
          <div style={{ fontSize:13, opacity:.7, marginTop:2 }}>{PROFILE.tagline}</div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="about-body"><Pane /></div>
    </div>
  );
}
