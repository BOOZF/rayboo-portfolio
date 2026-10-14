const HINTS = ['WASD Move', 'Mouse Look', 'Shift Run', 'Space Jump', 'E Enter'];

export default function ControlsHint() {
  return (
    <div className="controls-hint">
      {HINTS.map((h, i) => <span key={h}>{i > 0 && <span style={{ opacity:.35, marginRight:14 }}>|</span>}{h}</span>)}
    </div>
  );
}
