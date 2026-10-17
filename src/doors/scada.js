const img = f => '/assets/doors/scada/' + f;
export default {
  id:'scada', title:'Water-Treatment SCADA AI', sub:'Root-cause analysis for plant operators', era:'Government utilities · 2025',
  color:'#4fb3ff', icon:'drop', role:'AI solution & live demo', tags:['Dify', 'RCA workflow', 'LLM + RAG', 'SCADA', 'Anomaly detection'],
  chapters:[
    { title:'The Problem', text:'At a government water-treatment plant, abnormal incidents arrive as floods of SCADA alarms. Engineers had to trace each one manually through sensor data and old incident records before they could act.',
      bullets:['Critical infrastructure, so slow diagnosis is costly', 'The knowledge sat across alarm logs and past incident reports'],
      caption:'"Every shift started with a wall of alarms."', highlight:{ value:'Alarm floods', label:'traced by hand through sensor data and past incident reports' } },
    { title:'The Build', text:'An AI root-cause-analysis layer that plant engineers can query and act on. I demoed it to the client and walked them through the design.',
      bullets:['AI-powered RCA workflow built on Dify', 'Multi-step workflows combining SCADA sensor data, alarm logs and historical incidents', 'LLM + RAG to identify probable root causes', 'Recommends corrective actions for operators'],
      caption:'"Live demo: from alarm to probable cause."', images:[{ src:img('demo.webp'), alt:'Demo of the SCADA AI solution on a large screen', kind:'photo' }] },
    { title:'The Impact', text:'Anomaly detection and root-cause investigation are automated, so engineers spend their time fixing the problem instead of searching for it.',
      bullets:['Less manual troubleshooting time', 'More accurate fault diagnosis in critical processes', 'Faster incident response through AI orchestration'],
      caption:'"And the control room finally went quiet."', highlight:{ value:'Alarm → action', label:'root cause found and a fix recommended, automatically, for plant engineers' } },
  ],
};
