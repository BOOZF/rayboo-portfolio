export default function Flash({ opacity, duration }) {
  return <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', background:'radial-gradient(circle at 50% 50%,#ffffff,#e6e9ff 55%,#b9c4ff)', opacity, transition:`opacity ${duration} ease` }} />;
}
