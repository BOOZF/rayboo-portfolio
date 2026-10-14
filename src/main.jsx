import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// No StrictMode: its dev-only double mount would leave the three.js scene torn down.
// Deter casual saving of photos and screenshots: no right-click "Save image", no drag-out, no long-press save.
// (Nothing shown in a browser can be fully protected; this stops the easy paths.)
const guarded = e => e.target instanceof Element && e.target.closest('img, canvas, .room-visual');
document.addEventListener('contextmenu', e => { if (guarded(e)) e.preventDefault(); });
document.addEventListener('dragstart', e => { if (guarded(e)) e.preventDefault(); });

createRoot(document.getElementById('root')).render(<App />)
