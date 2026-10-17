import { useEffect, useRef, useState } from 'react';

const SUGGESTIONS = ['What does Ray do?', 'What did he achieve on bank credit papers?', 'What is his tech stack?'];
const MAX = 500;

// Floating "Ask about Ray" chat. Answers come from /api/chat, which only uses the files in knowledge/.
export default function AskRay({ raised, behindPanel }) {
  const [open, setOpen] = useState(false), [input, setInput] = useState(''), [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([{ from:'bot', text:"Hi! I'm Ray's assistant. Ask me anything about his work, projects or skills." }]);
  const list = useRef(null), field = useRef(null);
  useEffect(() => { list.current && list.current.scrollTo(0, list.current.scrollHeight); }, [msgs, open]);
  useEffect(() => { if (open && field.current) field.current.focus(); }, [open]);

  const ask = async q => {
    q = q.trim(); if (!q || busy) return;
    setMsgs(m => [...m, { from:'me', text:q }]); setInput(''); setBusy(true);
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ question:q }) });
      const data = await r.json().catch(() => ({}));
      setMsgs(m => [...m, { from:'bot', text:data.answer || data.error || 'Something went wrong. Please try again.' }]);
    } catch {
      setMsgs(m => [...m, { from:'bot', text:'I could not reach the assistant. Please check your connection and try again.' }]);
    } finally { setBusy(false); }
  };

  return (
    <div className={'ask' + (raised ? ' raised' : '') + (behindPanel ? ' behind-panel' : '')}>
      {open && (
        <div className="ask-panel glass" role="dialog" aria-label="Ask about Ray">
          <div className="ask-head">
            <img src="/assets/ray-headshot.webp" alt="" width={34} height={34} />
            <div><b>Ask about Ray</b><span>Answers from Ray's portfolio</span></div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="ask-list" ref={list} aria-live="polite">
            {msgs.map((m, i) => <div key={i} className={'ask-msg ' + m.from}>{m.text}</div>)}
            {busy && <div className="ask-msg bot typing"><span /><span /><span /></div>}
            {msgs.length === 1 && <div className="ask-suggest">{SUGGESTIONS.map(s => <button key={s} onClick={() => ask(s)}>{s}</button>)}</div>}
          </div>
          <form className="ask-form" onSubmit={e => { e.preventDefault(); ask(input); }}>
            <input ref={field} value={input} maxLength={MAX} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Escape' && setOpen(false)} placeholder="Ask a question…" aria-label="Your question" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">➤</button>
          </form>
        </div>
      )}
      <button className="ask-fab" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span aria-hidden="true">{open ? '×' : '✦'}</span><span className="ask-fab-label">Ask about Ray</span>
      </button>
    </div>
  );
}
