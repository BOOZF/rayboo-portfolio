const img = f => '/assets/doors/mygov/' + f;
export default {
  id:'mygov', title:'MyGOV AI Assistant', sub:'Government super app POC', era:'Huawei APAC · 2025',
  color:'#a98bff', icon:'shield', role:'Sole builder of the POC app UI', tags:['React', 'AI chatbot', 'Governance controls', 'Tool calling', 'Pre-sales'],
  chapters:[
    { title:'The Problem', text:"Malaysian citizens deal with many agencies to check summonses, STR status and more. The government wanted a single super app, with an AI assistant, that integrates them all.",
      caption:'"Apa yang boleh saya bantu hari ini?"', images:[{ src:img('home.webp'), alt:'MyGOV AI assistant welcome screen', kind:'phone' }] },
    { title:'The Build', text:'An end-to-end POC: a production-level app connecting multiple government agencies.',
      bullets:['Sole builder of the POC-ready React app UI', 'AI chatbot with governance controls, knowledge-based answers and tool calling', 'I presented the live demo; our Head of AI pitched the Huawei product stack'],
      caption:'"Check your summons by just asking."', images:[{ src:img('chat.webp'), alt:'Assistant answering a summons and agency services question', kind:'phone' }] },
    { title:'The Impact', text:'We reached the final round against AWS. The client chose AWS for cloud services, but adopted my UI, UX flow and design in their build.',
      bullets:['We lost on infrastructure, not on the solution'],
      caption:'"The design shipped, even though the cloud deal went elsewhere."', highlight:{ value:'Final round', label:'against AWS, and the client adopted my UI, UX flow and design' } },
  ],
};
