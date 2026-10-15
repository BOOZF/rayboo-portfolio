export default function StartButton({ ready, onStart }) {
  return (
    <div className="start-wrap">
      <button className="start-btn" onClick={onStart} disabled={!ready} style={{ cursor:ready ? 'pointer' : 'progress', opacity:ready ? 1 : .7 }}>{ready ? 'Start journey →' : 'Loading…'}</button>
      <div className="start-caption">Let's walk through my journey together</div>
    </div>
  );
}
