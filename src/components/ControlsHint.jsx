import { T } from '../i18n.js';

// Desktop: one row split by dividers. Touch: items wrap freely on narrow screens, so no dividers.
export default function ControlsHint({ touch }) {
  return (
    <div className="controls-hint">
      {(touch ? T.touchHints : T.keys).map((h, i) => <span key={h}>{!touch && i > 0 && <span style={{ opacity:.35, marginRight:14 }}>|</span>}{h}</span>)}
    </div>
  );
}
