// Language of this page, from its address: /zh, /zh/faq … are Chinese (Simplified), everything else English.
// Switching language is a link to the other address, so each language has its own indexable URL.
const path = typeof location !== 'undefined' ? location.pathname : '/';
export const LANG = path === '/zh' || path.startsWith('/zh/') ? 'zh' : 'en';

// The same page in the other language (/ ⇄ /zh, /faq ⇄ /zh/faq).
export function otherLangPath() {
  if (LANG === 'zh') return path.replace(/^\/zh/, '') || '/';
  return path === '/' ? '/zh' : '/zh' + path;
}
export const pagePath = p => (LANG === 'zh' ? '/zh' : '') + p; // a site page in the current language

const UI = {
  en: {
    switchTo:'中文', switchLabel:'切换到中文',
    home:'Home', about:'About', projects:'Projects', contact:'Contact',
    introHi:"Hi, I'm Ray", introText:'Walk the star bridge and step into each bubble to explore my journey.',
    start:'Start journey →', loading:'Loading…', startCaption:"Let's walk through my journey together",
    keys:['WASD Move', 'Mouse Look', 'Shift Run', 'Space Jump', 'E Enter'],
    touchHints:['Left thumb: walk (push far to run)', 'Right thumb: look'], jump:'Jump',
    enterBubble:'Enter bubble',
    contactTitle:'Contact', contactText:'Building enterprise AI that ships. Happy to talk projects, roles or ideas.', faq:'FAQ', privacy:'Privacy policy',
    close:'Close',
    playerProfile:'Player profile', tabs:{ Profile:'Profile', Journey:'Journey', Skills:'Skills', Education:'Education', Highlights:'Highlights' },
    preferredName:'Preferred name', fullName:'Full name', whatIBring:'What I bring',
    chapter:(n, t) => `CHAPTER ${n} / ${t}`, backLong:'Back to space (Esc)', backShort:'Back', backLabel:'Back to space',
    prev:'Prev', next:'Next', finish:'Finish', enlarge:'⤢ Enlarge', enlargeLabel:'Enlarge: ', deployAgent:'Deploy agent',
    askTitle:'Ask about Ray', askSub:"Answers from Ray's portfolio", askHello:"Hi! I'm Ray's assistant. Ask me anything about his work, projects or skills.",
    askPlaceholder:'Ask a question…', askSend:'Send', askClose:'Close chat',
    askSuggestions:['What does Ray do?', 'What did he achieve on bank credit papers?', 'What is his tech stack?'],
    askError:'Something went wrong. Please try again.', askOffline:'I could not reach the assistant. Please check your connection and try again.',
  },
  zh: {
    switchTo:'EN', switchLabel:'Switch to English',
    home:'首页', about:'关于我', projects:'项目', contact:'联系',
    introHi:'你好，我是 Ray', introText:'走过星桥，进入每个泡泡，探索我的历程。',
    start:'开始旅程 →', loading:'加载中…', startCaption:'一起走过我的历程吧',
    keys:['WASD 移动', '鼠标 视角', 'Shift 奔跑', '空格 跳跃', 'E 进入'],
    touchHints:['左手拇指：行走（推到底奔跑）', '右手拇指：转动视角'], jump:'跳跃',
    enterBubble:'进入泡泡',
    contactTitle:'联系我', contactText:'打造真正能落地的企业级 AI。欢迎聊项目、职位或任何想法。', faq:'常见问题', privacy:'隐私政策',
    close:'关闭',
    playerProfile:'角色档案', tabs:{ Profile:'简介', Journey:'经历', Skills:'技能', Education:'教育', Highlights:'亮点' },
    preferredName:'常用名', fullName:'全名', whatIBring:'我的优势',
    chapter:(n, t) => `第 ${n} / ${t} 章`, backLong:'返回星空 (Esc)', backShort:'返回', backLabel:'返回星空',
    prev:'上一章', next:'下一章', finish:'完成', enlarge:'⤢ 放大', enlargeLabel:'放大：', deployAgent:'部署智能体',
    askTitle:'问问 Ray', askSub:'答案来自 Ray 的作品集', askHello:'你好！我是 Ray 的助手。关于他的工作、项目或技能，尽管问我。',
    askPlaceholder:'输入你的问题…', askSend:'发送', askClose:'关闭对话',
    askSuggestions:['Ray 是做什么的？', '他在银行信贷文件项目上取得了什么成果？', '他的技术栈是什么？'],
    askError:'出了点问题，请再试一次。', askOffline:'无法连接到助手，请检查网络后再试。',
  },
};
export const T = UI[LANG];

// Overlay translated fields onto the English original: objects merge key by key, arrays of objects merge item by
// item (so image paths, colours and diagram types stay shared), anything else in the overlay replaces the original.
export function localize(base, over) {
  if (over === undefined) return base;
  if (Array.isArray(base) && Array.isArray(over) && base.some(b => b && typeof b === 'object')) return base.map((b, i) => localize(b, over[i]));
  if (base && over && typeof base === 'object' && typeof over === 'object' && !Array.isArray(over)) {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = localize(base[k], over[k]);
    return out;
  }
  return over;
}
