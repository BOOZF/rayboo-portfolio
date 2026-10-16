import { useEffect, useState } from 'react';
import { iconUrl } from '../scene/textures.js';
import ChapterDiagram from './ChapterDiagram.jsx';

// Screenshot area for one chapter: phone screens sit side by side, wide shots and photos fill the frame.
// A chapter without its own screenshot but with a `highlight` shows the key result over the project's screenshots, dimmed.
function Visual({ door, chapter, onZoom }) {
  const imgs = chapter.images || [];
  if (!imgs.length && chapter.diagram) return <ChapterDiagram diagram={chapter.diagram} />;
  if (!imgs.length && chapter.highlight) {
    const backdrop = door.chapters.flatMap(c => c.images || []).slice(0, 3);
    return (
      <div className="room-visual room-highlight">
        {backdrop.length > 0 && <div className="hl-backdrop" aria-hidden="true">{backdrop.map(im => <img key={im.src} src={im.src} alt="" />)}</div>}
        <div className="hl-card">
          <img src={iconUrl(door.icon, door.color)} alt="" width={56} height={56} />
          <b style={{ color:door.color }}>{chapter.highlight.value}</b>
          <span>{chapter.highlight.label}</span>
        </div>
      </div>
    );
  }
  if (!imgs.length) return (
    <div className="room-visual room-illustration" style={{ background:`radial-gradient(circle at 50% 45%,${door.color}33,transparent 65%)` }}>
      <img src={iconUrl(door.icon, door.color)} alt="" width={180} height={180} />
    </div>
  );
  return (
    <div className={'room-visual' + (imgs[0].kind === 'phone' ? ' phones' : '')}>
      {imgs.map(im => (
        <button key={im.src} type="button" className={'shot-btn ' + im.kind} onClick={() => onZoom(im)} aria-label={'Enlarge: ' + im.alt}>
          <img src={im.src} alt={im.alt} className={'shot ' + im.kind} loading="lazy" />
        </button>
      ))}
      <span className="zoom-hint" aria-hidden="true">⤢ Enlarge</span>
    </div>
  );
}

export default function ProjectRoom({ door, chapter, total, onChapter, onPrev, onNext, onClose }) {
  const ch = door.chapters[chapter], last = chapter === total - 1, [zoom, setZoom] = useState(null);
  useEffect(() => setZoom(null), [door, chapter]);
  // Esc closes the enlarged screenshot first, before it would close the room
  useEffect(() => {
    if (!zoom) return;
    const onKey = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); setZoom(null); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [zoom]);
  return (
    <div className="room" style={{ '--accent':door.color, background:`radial-gradient(ellipse at 25% 35%,${door.color}2a,transparent 55%),radial-gradient(ellipse at 85% 80%,#5b3fd622,transparent 60%),#05060f` }}>
      <div className="room-stars" />
      <div className="room-body">
        <div className="room-media">
          <Visual door={door} chapter={ch} onZoom={setZoom} />
          <div className="room-caption">{ch.caption}</div>
        </div>
        <div className="room-card glass">
          <div style={{ display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap' }}>
            <span style={{ font:'700 40px Fredoka', color:door.color }}>{door.num}</span>
            <span style={{ font:'600 13px Fredoka', letterSpacing:'.2em', opacity:.7 }}>CHAPTER {chapter + 1} / {total}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ font:'700 clamp(26px,3.2vw,40px) Fredoka', lineHeight:1.05 }}>{door.title}</div>
            <div style={{ fontSize:15, fontWeight:700, opacity:.85 }}>{door.sub}</div>
            <div style={{ fontSize:13, opacity:.65 }}>{door.era} · {door.role}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ font:'600 20px Fredoka', color:door.color }}>{ch.title}</div>
            <div style={{ fontSize:16, lineHeight:1.55, textWrap:'pretty' }}>{ch.text}</div>
            {ch.bullets && <ul className="room-bullets">{ch.bullets.map(b => <li key={b}>{b}</li>)}</ul>}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {door.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          {door.link && <a className="link-btn" href={door.link.url} target="_blank" rel="noopener noreferrer" style={{ background:door.color, color:'#120f1a' }}>{door.link.label} ↗</a>}
        </div>
      </div>
      <div className="room-bar">
        <button className="ghost-btn" onClick={onClose} aria-label="Back to space">← <span className="back-long">Back to space (Esc)</span><span className="back-short">Back</span></button>
        <div className="room-dots">
          {door.chapters.map((c, i) => <button key={c.title} aria-label={c.title} onClick={() => onChapter(i)} className="dot" style={{ background:i === chapter ? door.color : 'rgba(255,255,255,.25)' }} />)}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="ghost-btn" onClick={onPrev} disabled={chapter === 0}>Prev</button>
          <button className="primary-btn" onClick={onNext}>{last ? 'Finish' : 'Next'}</button>
        </div>
      </div>
      {zoom && (
        <div className="zoom" role="dialog" aria-label={zoom.alt} onClick={() => setZoom(null)}>
          <img src={zoom.src} alt={zoom.alt} />
          <button className="icon-btn zoom-close" aria-label="Close">×</button>
        </div>
      )}
    </div>
  );
}
