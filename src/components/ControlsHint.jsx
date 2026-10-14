const KEYS = ['WASD Move', 'Mouse Look', 'Shift Run', 'Space Jump', 'E Enter'];
const TOUCH = ['Left thumb: walk (push far to run)', 'Right thumb: look'];

// Desktop: one row split by dividers. Touch: items wrap freely on narrow screens, so no dividers.
export default function ControlsHint({ touch }) {
  return (
    <div className="controls-hint">
      {(touch ? TOUCH : KEYS).map((h, i) => <span key={h}>{!touch && i > 0 && <span style={{ opacity:.35, marginRight:14 }}>|</span>}{h}</span>)}
    </div>
  );
}
