export default function StartButton({ ready, onStart }) {
  return (
    <div style={{ position:'absolute', left:'50%', bottom:24, transform:'translateX(-50%)', zIndex:8, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <button className="start-btn" onClick={onStart} disabled={!ready} style={{ cursor:ready ? 'pointer' : 'progress', opacity:ready ? 1 : .7 }}>{ready ? 'Start journey →' : 'Loading…'}</button>
      <div style={{ fontSize:13, textShadow:'0 2px 8px rgba(0,0,0,.8)', textAlign:'center' }}>Let's walk through my journey together</div>
    </div>
  );
}
