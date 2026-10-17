export default {
  id:'agent-builder', title:'No-Code Agent Builder', sub:'Internal platform for self-serve AI agents', era:'Internal platform · 2025',
  color:'#4fe3e3', icon:'chip', role:'AI Team Lead', tags:['mastra-ai', 'RAG', 'TypeScript', 'Multi-agent', 'LangGraph'],
  chapters:[
    { title:'The Problem', text:'Once the first bots shipped, requests for AI came from every department, and a single AI team could not build a custom agent for each one.',
      bullets:['Every department had its own data, tools and workflows', 'Hand-building each agent did not scale'],
      caption:'"Can we get one of those bots too?"',
      diagram:{ type:'queue', target:{ label:'One AI team', sub:'building every agent by hand' }, items:[{ from:'HR', text:'Policy Q&A bot' }, { from:'Finance', text:'Invoice lookup agent' }, { from:'Sales', text:'Product spec assistant' }, { from:'Support', text:'Ticket triage bot' }] } },
    { title:'The Build', text:'A platform where anyone can assemble an agent through a UI, with no code required.',
      bullets:['Create custom agents in a no-code UI', 'Attach tools by pasting API links and defining their schemas', 'Build a separate knowledge base for each agent', 'RAG powered by mastra-ai in TypeScript', 'Draws on our earlier multi-agent work with LangGraph'],
      caption:'"So we gave them the workshop, not just the bot."',
      diagram:{ type:'builder', name:'New agent · no code', fields:[{ label:'Instructions', items:['Role & tone', 'Guardrails'] }, { label:'Tools · paste an API link + schema', items:['GET /orders', 'POST /tickets', '+ Add tool'] }, { label:'Knowledge base', items:['SOP.pdf', 'FAQ.docx', '+ Upload'] }, { label:'Engine', items:['mastra-ai', 'RAG'] }] } },
    { title:'The Impact', text:'Departments self-serve their own agents, and the AI team focuses on the platform instead of a queue of one-off requests.',
      bullets:['Knowledge and tools are configured by the people who own them', 'Every new agent reuses the same RAG and tool-calling foundation'],
      caption:'"The queue turned into a catalogue."',
      diagram:{ type:'flow', steps:[{ label:'Departments', sub:'own their data & tools' }, { label:'Agent Builder', sub:'no-code UI', accent:true }, { label:'Their own agents', sub:'shared RAG + tool calling' }] } },
  ],
};
