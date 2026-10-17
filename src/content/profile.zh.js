// Chinese (Simplified) About-screen and contact content; same shape as profile.en.js.
import * as en from './profile.en.js';

export const PROFILE = {
  ...en.PROFILE,
  title:'AI 解决方案架构师',
  tagline:'把早期 AI 打造成真正落地的产品',
  location:'马来西亚 吉隆坡',
  summary:[
    '我站在软件工程、数据科学与应用 AI 的交汇处。我喜欢从头到尾负责一个问题：从杂乱的数据和模型，到客户可以直接点击使用的界面。',
    '目前我为政府、工业和银行客户交付 AI 解决方案：搭建 POC、现场演示，并为需求匹配合适的技术栈。',
  ],
  strengths:[
    { icon:'spark', title:'端到端交付', text:'从杂乱的数据和模型，到客户直接点击使用的界面。在 MyGOV 项目中，尽管云服务合约给了另一家供应商，客户仍采用了我的 UI、UX 流程和设计。' },
    { icon:'chip', title:'在真实限制下做生产级 AI', text:'用 vLLM 在 GPU 服务器上自托管大模型；在有限 GPU 上微调 Qwen3，把银行信贷文件抽取准确率从约 30% 提升到 80%。' },
    { icon:'chat', title:'带队与沟通', text:'曾被挑选领导新成立的 AI 团队；如今负责 POC、客户现场演示和售前，把业务需求变成能落地的 AI。' },
  ],
};

export const JOURNEY = [
  { when:'2025 年 9 月 – 至今', role:'AI 解决方案架构师', org:'Huawei Technologies · APAC Enterprise (EBG)',
    points:['为政府、工业和银行 AI 项目做 POC、客户演示与售前方案', 'MyGOV 超级应用、水处理 SCADA AI、银行信贷文件、内部销售智能平台'] },
  { when:'2025 年 1 月 – 2025 年 8 月', role:'AI 软件开发工程师 · 团队负责人', org:'CMG Technologies (CMGI)',
    points:['被挑选领导新成立的 AI 团队：利益相关方管理、交付负责，以及业务 ↔ AI 的沟通转化', 'WhatsApp AI 聊天机器人、无代码智能体构建平台、小程序后台（Next.js、Kubernetes）', '把大型 PostgreSQL 数据表自动整理成 JSON 文档的代码生成 AI', '用 vLLM、Ollama 和 llama.cpp 在 GPU 服务器上自托管大模型'] },
  { when:'2024 年 6 月 – 2024 年 11 月', role:'AI 软件开发工程师 · 实习生', org:'CMG Technologies (CMGI)',
    points:['在成熟框架出现之前探索前沿 AI：结构化输出、工具调用、多智能体', '小程序前后端对接；Kubernetes 预发布环境', '带数据可视化的验血报告分析界面'] },
  { when:'个人项目', role:'独立开发者', org:'个人',
    points:['RunForPeace：带 RAG 助手的慈善路跑平台，100 万+ 用户', 'Form App：基于 React Native 和 Prisma 的表单系统，UI/UX 从零设计', '销售看板，季节性定价设置可实时同步到线上网站'] },
];

export const SKILLS = [
  { group:'应用 AI', items:['Harness engineering', '结构化输出', 'RAG / GraphRAG', '知识图谱', '多智能体', 'LangGraph', 'mastra-ai', 'MCP', 'A2A', 'Dify'] },
  { group:'模型部署', items:['vLLM', 'llama.cpp', 'Ollama', 'liteLLM', 'LM Studio', 'KV 缓存管理'] },
  { group:'机器学习与数据科学', items:['XGBoost', 'SHAP', '特征工程', 'TensorFlow', 'PyTorch'] },
  { group:'全栈开发', items:['TypeScript', 'Python', 'JavaScript', 'SQL', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Flask', 'React Native', 'TailwindCSS'] },
  { group:'数据与部署', items:['Postgres', 'MySQL', 'MS SQL', 'Docker', 'Kubernetes', 'CI/CD', 'Huawei Cloud'] },
  { group:'交付', items:['POC 与售前', '客户演示', '利益相关方管理', '项目管理'] },
  { group:'AI 辅助开发', items:['Claude Code', 'Cursor', 'Copilot'] },
];

export const EDUCATION = {
  school:'Tunku Abdul Rahman University of Management and Technology (TARUMT)',
  degree:'计算机科学学士（数据科学）',
  when:'2021 年 9 月 – 2024 年 11 月',
  points:['CGPA 3.74 / 4.00', '2 次校长名单 · 2 次院长名单', '50% 奖学金', '羽毛球社代表', '人工智能、机器学习、数据科学、数据工程、数据结构与算法'],
};

export const HIGHLIGHTS = [
  { ...en.HIGHLIGHTS[0], title:'评委与演讲嘉宾 · AI Singapore 黑客松', where:'新加坡国立大学（NUS）',
    text:'受邀代表 Huawei 面向 AI 社区：担任评审团成员评估参赛团队，并在台上分享业界视角。',
    images:[{ ...en.HIGHLIGHTS[0].images[0], alt:'Ray 在 NUS 黑客松台上演讲' }, { ...en.HIGHLIGHTS[0].images[1], alt:'Ray 在评审团席上' }] },
];
