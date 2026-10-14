const img = f => '/assets/doors/fnb-chatbot/' + f;
export default {
  id:'fnb-chatbot', title:'F&B Service Chatbot', sub:'WhatsApp AI for POS customer service', era:'CMG Technologies · 2024–2025',
  color:'#ffb84d', icon:'chat', role:'AI Team Lead', tags:['WhatsApp', 'LLM', 'Tool calling', 'Self-hosted LLMs', 'TypeScript', 'Python'],
  chapters:[
    { title:'The Problem', text:'Restaurants on our F&B point-of-sale system were answering every WhatsApp message by hand: orders, menu questions, allergy checks and complaints all landed on the same small customer-service team.',
      bullets:['Mid-2024: no mature agent framework yet, and many models had no native tool calling', 'Orders had to match the live menu, not a stale copy'],
      caption:'"Can I order the nasi lemak, but without peanuts?"', images:[{ src:img('order-intent.webp'), alt:'WhatsApp chat: the bot answers a no-peanuts nasi lemak request with a menu card', kind:'phone' }] },
    { title:'The Build', text:'A customer-service agent that lives in WhatsApp and talks to the POS database directly.',
      bullets:['Detects order intent and fires a structured order template', 'Reads the live menu straight from the database', 'SOP-driven recommendations: allergy checks always come first', 'Structured output and ReAct-style tool calling enforced by hand', 'Backend deployed in TypeScript and Python, with LLMs self-hosted on local GPU servers (Ollama, vLLM, llama.cpp)'],
      caption:'"So the bot learned the menu, and the rules."', images:[{ src:img('order-confirm.webp'), alt:'WhatsApp chat: order built from the live menu, teh tarik added, total confirmed', kind:'phone' }] },
    { title:'The Impact', text:'Routine questions are answered instantly, and people step in only when it matters.',
      bullets:['Complaints are captured and handed to a human agent in one tap', 'A back-office console lets the CS team manage every request', 'Admins customise the bot\'s prompt themselves, with no developer needed', 'Built on the same stack as our first shipped bot: an internal help-desk chatbot that lets staff check ticket status on WhatsApp'],
      caption:'"Routine answers by the bot, the hard cases by people."', images:[{ src:img('human-handoff.webp'), alt:'WhatsApp chat: late-order complaint escalated with Connect to Human Agent', kind:'phone' }] },
  ],
};
