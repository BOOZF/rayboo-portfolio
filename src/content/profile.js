// About-screen and contact content, from the self-introduction deck and résumé.
export const PROFILE = {
  preferredName:'Ray Boo',
  fullName:'Boo Zheng Feng',
  title:'AI Solution Architect',
  tagline:'Turning early-stage AI into shipped, real-world products',
  location:'Kuala Lumpur, Malaysia',
  portrait:'/assets/about/portrait.webp',
  email:'zhengfengboo0710@gmail.com',
  summary:[
    'I sit at the intersection of software engineering, data science and applied AI. I like owning a problem end to end, from messy data and models to a working UI a client can click through.',
    'Today I deliver AI solutions across government, industrial and banking clients at Huawei APAC: building the POC, demoing it live and mapping it to the right stack.',
  ],
  // "What I bring": each strength backed by one piece of proof from the projects
  strengths:[
    { icon:'spark', title:'Ships end to end', text:'From messy data and models to the UI a client clicks through. On MyGOV the client adopted my UI, UX flow and design even though the cloud deal went to AWS.' },
    { icon:'chip', title:'Production AI under real constraints', text:'Self-hosted LLMs on GPU servers with vLLM, and a Qwen3 fine-tune on limited GPUs that lifted AmBank credit-paper extraction from about 30% to 80%.' },
    { icon:'chat', title:'Leads and translates', text:'Hand-picked to lead a new AI team; today I run POCs, live client demos and pre-sales, turning business needs into AI that ships.' },
  ],
};

export const JOURNEY = [
  { when:'Sep 2025 – now', role:'AI Solution Architect', org:'Huawei Technologies · APAC Enterprise (EBG)',
    points:['POCs, client demos and pre-sales solutioning across government, industrial and banking AI', 'MyGOV super app, water-treatment SCADA AI, AmBank credit papers, internal sales intelligence'] },
  { when:'Jan 2025 – Aug 2025', role:'AI Software Developer · Team Lead', org:'CMG Technologies (CMGI)',
    points:['Hand-picked to lead the new AI team: stakeholder management, delivery ownership and business ↔ AI translation', 'WhatsApp AI chatbot, no-code agent builder, mini program back office (Next.js, Kubernetes)', 'Code-generation AI that documents large PostgreSQL tables as JSON', 'Self-hosted LLMs on GPU servers with vLLM, Ollama and llama.cpp'] },
  { when:'Jun 2024 – Nov 2024', role:'AI Software Developer · Intern', org:'CMG Technologies (CMGI)',
    points:['Explored frontier AI before mature frameworks existed: structured output, tool calling, multi-agent', 'Mini program frontend and backend integration; Kubernetes staging', 'Blood-result analysis UI with data visualisation'] },
  { when:'Side projects', role:'Builder', org:'Independent',
    points:['RunForPeace: charity fun-run platform with a RAG assistant, 1M+ users', 'Form App: React Native form system with Prisma, UI/UX designed from scratch', 'Sales dashboard with seasonal pricing controls that update the live site in real time'] },
];

export const SKILLS = [
  { group:'Applied AI', items:['Harness engineering', 'Structured output', 'RAG / GraphRAG', 'Knowledge graphs', 'Multi-agent', 'LangGraph', 'mastra-ai', 'MCP', 'A2A', 'Dify'] },
  { group:'Model hosting', items:['vLLM', 'llama.cpp', 'Ollama', 'liteLLM', 'LM Studio', 'KV-cache handling'] },
  { group:'ML & data science', items:['XGBoost', 'SHAP', 'Feature engineering', 'TensorFlow', 'PyTorch'] },
  { group:'Full-stack', items:['TypeScript', 'Python', 'JavaScript', 'SQL', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Flask', 'React Native', 'TailwindCSS'] },
  { group:'Data & deploy', items:['Postgres', 'MySQL', 'MS SQL', 'Docker', 'Kubernetes', 'CI/CD', 'Huawei Cloud'] },
  { group:'Delivery', items:['POC & pre-sales', 'Client demos', 'Stakeholder management', 'Project management'] },
  { group:'AI-assisted dev', items:['Claude Code', 'Cursor', 'Copilot'] },
];

export const EDUCATION = {
  school:'Tunku Abdul Rahman University of Management and Technology (TARUMT)',
  degree:'Bachelor of Computer Science (Data Science)',
  when:'Sep 2021 – Nov 2024',
  points:['CGPA 3.74 / 4.00', "2× President's List · 2× Dean's List", '50% scholarship award', 'Badminton Club representative', 'AI, machine learning, data science, data engineering, data structures & algorithms'],
};

export const HIGHLIGHTS = [
  { title:'Judge & Speaker · AI Singapore Hackathon', where:'National University of Singapore (NUS)',
    text:'Invited to represent Huawei to the AI community: evaluated teams on the judging panel and shared an industry perspective on stage.',
    images:[{ src:'/assets/about/nus-stage.webp', alt:'Ray speaking on stage at the NUS hackathon' }, { src:'/assets/about/nus-panel.webp', alt:'Ray on the judging panel' }] },
];
