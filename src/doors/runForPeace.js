const img = f => '/assets/doors/run-for-peace/' + f;
export default {
  id:'run-for-peace', title:'RunForPeace', sub:'Charity fun-run platform · 1M+ users', era:'Side project · 2025',
  color:'#4de0a0', icon:'heart', role:'UI/UX, frontend & AI assistant', tags:['Landing page', 'Registration', 'RAG agent', 'High traffic', '1M+ users'],
  link:{ url:'https://runforpeace.com.my/', label:'Visit runforpeace.com.my' },
  chapters:[
    { title:'The Problem', text:'Run for Peace is a nationwide charity fun run. It needed a landing page and event registration that could survive a nationwide launch: more than a million user interactions.',
      caption:'"Peace starts with me."', images:[{ src:img('site.webp'), alt:'RunForPeace landing page with AI assistant panel', kind:'wide' }] },
    { title:'The Build', text:'A personal side project, built end to end alongside the day job.',
      bullets:['UI/UX design and frontend development for the web system', 'Event registration and landing page engineered for 1M+ interactions', 'A RAG agent built into the site answers runners\' questions about the event'],
      caption:'"An AI assistant on the start line."', images:[{ src:img('assistant.webp'), alt:'The RAG-powered AI Assistant panel beside the RunForPeace landing page', kind:'wide' }] },
    { title:'The Impact', text:'The platform launched and carried the event\'s traffic, with the assistant on hand for every runner.',
      bullets:['1M+ user interactions handled', 'Testing, deployment and UX refinement ahead of launch'],
      caption:'"A million clicks, one finish line."', highlight:{ value:'1M+', label:'user interactions handled by the registration platform' } },
  ],
};
