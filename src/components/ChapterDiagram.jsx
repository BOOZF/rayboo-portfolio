// Drawn visuals for chapters that have no screenshot. A chapter sets `diagram: { type, ... }`:
//   flow    { steps:[{ label, sub }] }                      boxes joined by arrows
//   bars    { title, rows:[{ label, value, display, dim }] } horizontal percentage bars
//   queue   { items:[{ from, text }], target }               stacked request cards waiting on one team
//   builder { name, fields:[{ label, items:[] }] }          mock no-code agent configuration form

function Flow({ steps }) {
  return (
    <div className="dg-flow">
      {steps.map((s, i) => (
        <div key={s.label} className="dg-flow-item">
          {i > 0 && <span className="dg-arrow" aria-hidden="true">→</span>}
          <div className={'dg-node' + (s.accent ? ' accent' : '')}>
            <b>{s.label}</b>{s.sub && <span>{s.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Bars({ title, rows }) {
  return (
    <div className="dg-bars">
      {title && <div className="about-label">{title}</div>}
      {rows.map(r => (
        <div key={r.label} className="dg-bar-row">
          <div className="dg-bar-head"><span>{r.label}</span><b style={{ opacity:r.dim ? .6 : 1 }}>{r.display || r.value + '%'}</b></div>
          <div className="dg-bar-track"><div className={'dg-bar-fill' + (r.dim ? ' dim' : '')} style={{ width:r.value + '%' }} /></div>
        </div>
      ))}
    </div>
  );
}

function Queue({ items, target }) {
  return (
    <div className="dg-queue">
      <div className="dg-queue-stack">
        {items.map((it, i) => (
          <div key={it.from} className="dg-ticket" style={{ '--i':i }}>
            <span className="dg-ticket-from">{it.from}</span><span>{it.text}</span>
          </div>
        ))}
      </div>
      <span className="dg-arrow" aria-hidden="true">→</span>
      <div className="dg-node accent"><b>{target.label}</b><span>{target.sub}</span></div>
    </div>
  );
}

function Builder({ name, fields }) {
  return (
    <div className="dg-builder">
      <div className="dg-builder-bar"><span className="dg-dot" /><span className="dg-dot" /><span className="dg-dot" /><b>{name}</b></div>
      {fields.map(f => (
        <div key={f.label} className="dg-field">
          <div className="about-label">{f.label}</div>
          <div className="dg-chips">{f.items.map(x => <span key={x} className="dg-chip">{x}</span>)}</div>
        </div>
      ))}
      <div className="dg-builder-foot"><span className="dg-btn">Deploy agent</span></div>
    </div>
  );
}

const TYPES = { flow:Flow, bars:Bars, queue:Queue, builder:Builder };

export default function ChapterDiagram({ diagram }) {
  const D = TYPES[diagram.type];
  return <div className="room-visual room-diagram">{D && <D {...diagram} />}</div>;
}
