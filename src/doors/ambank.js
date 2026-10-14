export default {
  id:'ambank', title:'AmBank Credit-Paper AI', sub:'Credit-paper extraction & automation', era:'Huawei APAC · 2025',
  color:'#ff7fc8', icon:'doc', role:'POC lead engineer', tags:['Qwen3 fine-tuning', 'Document AI', 'Limited-GPU design', 'Banking', 'Knowledge transfer'],
  chapters:[
    { title:'The Problem', text:"Relationship managers (RMs) turn long credit papers into structured fields by hand. The first version of the extraction pipeline reached only about 30% accuracy.",
      bullets:['L1, L2 and L3 values must land in the right fields, to AmBank\'s standard', 'It had to run on limited hardware and GPU resources'],
      caption:'"Hundreds of pages, a handful of numbers that matter."',
      diagram:{ type:'flow', steps:[{ label:'Credit paper', sub:'long, unstructured' }, { label:'Manual reading', sub:'by relationship managers' }, { label:'L1 / L2 / L3 fields', sub:'v1 pipeline: ~30% accurate', accent:true }] } },
    { title:'The Build', text:'A robust, repeatable extraction workflow designed for the hardware the bank actually had.',
      bullets:['Fine-tuned Qwen3 to read credit papers into RM-aligned markdown', 'Extracts L1, L2 and L3 values into the right fields', 'RMs keep refining the templates toward 100%'],
      caption:'"Teach the model to read like an RM."',
      diagram:{ type:'flow', steps:[{ label:'Credit paper', sub:'PDF' }, { label:'Fine-tuned Qwen3', sub:'limited-GPU design', accent:true }, { label:'RM-aligned markdown', sub:'AmBank standard' }, { label:'L1–L3 fields', sub:'filled in' }] } },
    { title:'The Impact', text:'Extraction accuracy rose from 30% to 80% after I joined, and data matching exceeded 90% accuracy.',
      bullets:['Supported the sales closure with technical consultation and demos', 'Ran knowledge-transfer sessions and code walkthroughs for the client team'],
      caption:'"30% → 80%, and still climbing."',
      diagram:{ type:'bars', title:'Accuracy', rows:[{ label:'Extraction · v1 before I joined', value:30, dim:true }, { label:'Extraction · after', value:80 }, { label:'Data matching', value:92, display:'90%+' }] } },
  ],
};
