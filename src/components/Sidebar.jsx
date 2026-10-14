import { PROFILE } from '../content/profile.js';

export default function Sidebar({ nav, active, showProjects, doors, onTeleport }) {
  return (
    <div className="sidebar">
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <img src="/assets/ray-headshot.webp" alt={PROFILE.preferredName} width={56} height={56} className="avatar" />
        <div style={{ display:'flex', flexDirection:'column', gap:2, textShadow:'0 2px 8px rgba(0,0,0,.6)' }}>
          <div style={{ font:'700 24px Fredoka', lineHeight:1 }}>{PROFILE.preferredName}</div>
          <div style={{ fontSize:13, fontWeight:700 }}>{PROFILE.title}</div>
          <div style={{ fontSize:11, opacity:.8 }}>{PROFILE.fullName}</div>
        </div>
      </div>
      <nav className="glass" style={{ display:'flex', flexDirection:'column', gap:4, padding:8 }}>
        {nav.map(n => (
          <button key={n.label} className={'nav-btn' + (active === n.key ? ' active' : '')} onClick={n.go}>
            <span className="nav-dot" />{n.label}
          </button>
        ))}
      </nav>
      {showProjects && (
        <div className="glass" style={{ display:'flex', flexDirection:'column', gap:2, padding:8, maxHeight:'50vh', overflow:'auto' }}>
          {doors.map((d, i) => (
            <button key={d.id} className="proj-link" onClick={() => onTeleport(i)}>
              <span style={{ font:'600 13px Fredoka', color:d.color }}>{d.num}</span><span style={{ fontWeight:700 }}>{d.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
