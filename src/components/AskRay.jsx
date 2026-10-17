import { useEffect, useRef, useState } from 'react';
import { LANG, T } from '../i18n.js';

const MAX = 500;

// Floating "Ask about Ray" chat. Answers come from /api/chat, which only uses the files in knowledge/.
export default function AskRay({ raised, behindPanel }) {
  const [open, setOpen] = useState(false), [input, setInput] = useState(''), [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([{ from:'bot', text:T.askHello }]);
  const list = useRef(null), field = useRef(null);
  useEffect(() => { list.current && list.current.scrollTo(0, list.current.scrollHeight); }, [msgs, open]);
  useEffect(() => { if (open && field.current) field.current.focus(); }, [open]);

  const ask = async q => {
    q = q.trim(); if (!q || busy) return;
    setMsgs(m => [...m, { from:'me', text:q }]); setInput(''); setBusy(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ question:q, lang:LANG }) });
      const data = await r.json().catch(() => ({}));
      setMsgs(m => [...m, { from:'bot', text:data.answer || data.error || T.askError }]);
    } catch {
      setMsgs(m => [...m, { from:'bot', text:T.askOffline }]);
    } finally { setBusy(false); }
  };

  return (
    <div className={'ask' + (raised ? ' raised' : '') + (behindPanel ? ' behind-panel' : '')}>
      {open && (
        <div className="ask-panel glass" role="dialog" aria-label={T.askTitle}>
          <div className="ask-head">
            <img src="/assets/ray-headshot.webp" alt="" width={34} height={34} />
            <div><b>{T.askTitle}</b><span>{T.askSub}</span></div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label={T.askClose}>×</button>
          </div>
          <div className="ask-list" ref={list} aria-live="polite">
            {msgs.map((m, i) => <div key={i} className={'ask-msg ' + m.from}>{m.text}</div>)}
            {busy && <div className="ask-msg bot typing"><span /><span /><span /></div>}
            {msgs.length === 1 && <div className="ask-suggest">{T.askSuggestions.map(s => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
          </div>
          <form className="ask-form" onSubmit={e => { e.preventDefault(); ask(input); }}>
            <input ref={field} value={input} maxLength={MAX} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Escape' && setOpen(false)} placeholder={T.askPlaceholder} aria-label="Your question" />
            <button type="submit" disabled={busy || !input.trim()} aria-label={T.askSend}>➤</button>
          </form>
        </div>
      )}
      <button className="ask-fab" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span aria-hidden="true">{open ? '×' : '✦'}</span><span className="ask-fab-label">{T.askTitle}</span>
      </button>
    </div>
  );
}
