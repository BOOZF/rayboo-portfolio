export default function Flash({ opacity, duration }) {
  return <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', background:'#03040c', opacity, transition:`opacity ${duration} ease` }} />;
}
