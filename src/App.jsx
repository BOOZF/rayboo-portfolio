import { useEffect, useRef, useState } from 'react';
import { DOORS } from './doors/index.js';
import { World } from './scene/World.js';
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

export default function App() {
  const mount = useRef(null), world = useRef(null), keyHandler = useRef(() => {});
  const [ready, setReady] = useState(false), [started, setStarted] = useState(false);
  const [prompt, setPrompt] = useState(-1), [project, setProject] = useState(-1), [chapter, setChapter] = useState(0);
  const [panel, setPanel] = useState(''), [flash, setFlash] = useState({ o:0, d:'.6s' });

  useEffect(() => {
    const w = world.current = new World(mount.current, DOORS, {
      onReady:() => setReady(true),
      onPrompt:setPrompt,
      onEnter:i => { setProject(i); setChapter(0); },
      onFlash:(o, d) => setFlash({ o, d }),
      onKey:k => keyHandler.current(k),
    });
    return () => w.dispose();
  }, []);

  const W = () => world.current;
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
    { label:'Home', key:'home', go:() => { W().goHome(); setStarted(false); setPanel(''); } },
    { label:'About', key:'about', go:togglePanel('about') },
    { label:'Projects', key:'projects', go:togglePanel('projects') },
    { label:'Contact', key:'contact', go:togglePanel('contact') },
  ];
  const inRoom = project >= 0;

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', background:'#03040c' }}>
      <div ref={mount} style={{ position:'absolute', inset:0 }} />
      <Sidebar nav={nav} active={panel || (started ? '' : 'home')} showProjects={panel === 'projects'} doors={DOORS}
        onTeleport={i => { W().teleport(i); setStarted(true); setPanel(''); }} />
      {!started && !panel && <IntroCard />}
      {prompt >= 0 && !inRoom && !panel && <DoorPrompt door={DOORS[prompt]} onOpen={() => W().enter(prompt)} />}
      {started && !inRoom && panel !== 'about' && <ControlsHint />}
      {panel === 'contact' && <ContactPanel onClose={() => setPanel('')} />}
      {panel === 'about' && <AboutScreen onClose={closeAbout} />}
      {!started && panel !== 'about' && <StartButton ready={ready} onStart={() => { W().start(); setStarted(true); setPanel(''); }} />}
      {inRoom && <ProjectRoom door={DOORS[project]} chapter={chapter} total={DOORS[project].chapters.length}
        onChapter={setChapter} onPrev={() => stepChapter(-1)} onNext={() => stepChapter(1)} onClose={closeRoom} />}
      <AskRay raised={inRoom} behindPanel={panel === 'about'} />
      <Flash opacity={flash.o} duration={flash.d} />
    </div>
  );
}
