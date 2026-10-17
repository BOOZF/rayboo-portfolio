const img = f => '/assets/doors/sales-intel/' + f;
export default {
  id:'sales-intel', title:'Sales Intelligence', sub:'Win-rate ML + knowledge graph agent', era:'Enterprise sales · Current',
  color:'#ffe066', icon:'bars', role:'Technical PIC', tags:['XGBoost', 'SHAP', 'Knowledge graph', 'PD Agent', 'Risk analysis'],
  chapters:[
    { title:'The Problem', text:'Deal knowledge was scattered across project reviews, strategy plans and targets, and the sales data was messy. Management needed to know which deals would win and what to do next.',
      caption:'"Which deals will close, and why?"', images:[{ src:img('overview.webp'), alt:'Sales intelligence overview: win-rate prediction, pipeline, deal list, knowledge graph and risk analysis', kind:'wide' }] },
    { title:'The Build', text:'I am the technical PIC; my manager is the business PIC.',
      bullets:['XGBoost win-rate model trained on messy, real sales data', 'SHAP analysis surfaces the positive and negative drivers behind each deal', 'Knowledge graph unifies project reviews, strategy plans and targets', 'Combines structured and unstructured data into one queryable model'],
      caption:'"Every deal, scored and explained."', images:[{ src:img('deal-win-rate.webp'), alt:'Win-rate analysis for one deal: AI win rate, agent insights and SHAP key drivers', kind:'wide' }] },
    { title:'The Impact', text:'A PD Agent recommends the next best move for each deal, and management gets automated reports instead of compiling them by hand.',
      bullets:['Automated chart generation and summarised insights', 'AI-driven risk identification built into management processes'],
      caption:'"From gut feel to next best action."', images:[{ src:img('sales-assistant.webp'), alt:'Sales assistant chatbot giving a deal win rate, key drivers and recommended next actions', kind:'wide' }] },
  ],
};
