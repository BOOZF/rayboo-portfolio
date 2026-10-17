import { useEffect, useRef, useState } from 'react';
import { DOORS } from './doors/index.js';
import Sidebar from './components/Sidebar.jsx';
import IntroCard from './components/IntroCard.jsx';
import StartButton from './components/StartButton.jsx';
import DoorPrompt from './components/DoorPrompt.jsx';
import ControlsHint from './components/ControlsHint.jsx';
import ContactPanel from './components/ContactPanel.jsx';
import AboutScreen from './components/AboutScreen.jsx';
import ProjectRoom from './components/ProjectRoom.jsx';
import Flash from './components/Flash.jsx';
import AskRay from './components/AskRay.jsx';
import TouchControls from './components/TouchControls.jsx';
import useTouchDevice from './components/useTouchDevice.js';
import { T } from './i18n.js';

// Stand-in until the 3D chunk has loaded: any call on it is a harmless no-op.
const NO_WORLD = new Proxy({}, { get:() => () => {} });

export default function App() {
  const mount = useRef(null), world = useRef(null), keyHandler = useRef(() => {});
  const [ready, setReady] = useState(false), [started, setStarted] = useState(false);
  const [prompt, setPrompt] = useState(-1), [project, setProject] = useState(-1), [chapter, setChapter] = useState(0);
  const [panel, setPanel] = useState(''), [flash, setFlash] = useState({ o:0, d:'.6s' });
  const touch = useTouchDevice();

  // three.js loads as its own chunk, so the header and intro paint before the 3D engine has downloaded
  useEffect(() => {
    let w, dead = false;
    import('./scene/World.js').then(({ World }) => {
      if (dead) return;
      w = world.current = new World(mount.current, DOORS, {
        onReady:() => setReady(true),
        onPrompt:setPrompt,
        onEnter:i => { setProject(i); setChapter(0); },
        onFlash:(o, d) => setFlash({ o, d }),
        onKey:k => keyHandler.current(k),
      });
    });
    return () => { dead = true; if (w) w.dispose(); };
  }, []);

  const W = () => world.current || NO_WORLD;
  useEffect(() => { W().setWaving(panel === 'contact'); }, [panel, ready]);
  const closeRoom = () => {
    setFlash({ o:1, d:'.35s' });
    setTimeout(() => { W().exitRoom(); setProject(-1); setFlash({ o:0, d:'.7s' }); }, 400);
  };
  const stepChapter = d => {
    const c = chapter + d, n = DOORS[project].chapters.length;
    if (c >= n) closeRoom(); else if (c >= 0) setChapter(c);
  };
  const closeAbout = () => { W().closeAbout(); setPanel(''); };
  const togglePanel = key => () => {
    if (panel === 'about') W().closeAbout();
    if (key === 'about' && panel !== 'about') { if (W().openAbout()) setPanel('about'); return; }
    setPanel(panel === key ? '' : key);
  };
  // keyboard shortcuts for the overlays; World forwards every keydown here
  useEffect(() => {
    keyHandler.current = k => {
      if (project >= 0) { if (k === 'escape') closeRoom(); if (k === 'arrowright') stepChapter(1); if (k === 'arrowleft') stepChapter(-1); return; }
      if (k === 'escape' && panel === 'about') closeAbout(); else if (k === 'escape' && panel) setPanel('');
    };
  });

  const nav = [
    { label:T.home, key:'home', go:() => { W().goHome(); setStarted(false); setPanel(''); } },
    { label:T.about, key:'about', go:togglePanel('about') },
    { label:T.projects, key:'projects', go:togglePanel('projects') },
    { label:T.contact, key:'contact', go:togglePanel('contact') },
  ];
  const inRoom = project >= 0;

  return (
    <div className={touch ? 'is-touch' : ''} style={{ position:'fixed', inset:0, overflow:'hidden', background:'#03040c' }}>
      {/* the scene fades in once its models have loaded, instead of popping in */}
      <div ref={mount} style={{ position:'absolute', inset:0, opacity:ready ? 1 : 0, transition:'opacity .8s ease' }} />
      <Sidebar nav={nav} active={panel || (started ? '' : 'home')} showProjects={panel === 'projects'} doors={DOORS}
        onTeleport={i => { if (!ready) return; W().teleport(i); setStarted(true); setPanel(''); }} />
      {/* intro card + start button share one stack so on phones they line up instead of overlapping */}
      {!started && panel !== 'about' && (
        <div className="home-stack">
          {!panel && <IntroCard />}
          <StartButton ready={ready} onStart={() => { W().start(); setStarted(true); setPanel(''); }} />
        </div>
      )}
      {prompt >= 0 && !inRoom && !panel && <DoorPrompt door={DOORS[prompt]} onOpen={() => W().enter(prompt)} />}
      {started && !inRoom && panel !== 'about' && <ControlsHint touch={touch} />}
      {touch && started && !inRoom && panel !== 'about' && <TouchControls world={W} />}
      {panel === 'contact' && <ContactPanel onClose={() => setPanel('')} />}
      {panel === 'about' && <AboutScreen onClose={closeAbout} />}
      {inRoom && <ProjectRoom door={DOORS[project]} chapter={chapter} total={DOORS[project].chapters.length}
        onChapter={setChapter} onPrev={() => stepChapter(-1)} onNext={() => stepChapter(1)} onClose={closeRoom} />}
      <AskRay raised={inRoom} behindPanel={panel === 'about'} />
      <Flash opacity={flash.o} duration={flash.d} />
    </div>
  );
}
