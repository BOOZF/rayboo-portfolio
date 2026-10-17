import { T } from '../i18n.js';
export default function StartButton({ ready, onStart }) {
  return (
    <div className="start-wrap">
      <button className="start-btn" onClick={onStart} disabled={!ready} style={{ cursor:ready ? 'pointer' : 'progress', opacity:ready ? 1 : .7 }}>{ready ? T.start : T.loading}</button>
      <div className="start-caption">{T.startCaption}</div>
    </div>
  );
}
