// Asks the real "Ask about Ray" pipeline (OpenAI + knowledge/index.js) a question for every part of the résumé and
// self-introduction deck, and reports any that fall back to "I don't have that detail". Run: node scripts/eval-chat.mjs
import { answerQuestion, FALLBACK, FALLBACK_ZH } from '../server/rag.js';
import { openaiDeps } from '../server/openai.js';
import index from '../knowledge/index.js';

if (!process.env.OPENAI_API_KEY) process.loadEnvFile('.env');
const deps = openaiDeps({ key:process.env.OPENAI_API_KEY, model:process.env.OPENAI_MODEL || 'gpt-5-mini', index });

// [question, words the answer must mention (case-insensitive; 'a|b' accepts either)]
const COVERED = [
  ['What is his tech stack?', ['python']], ['What programming languages does he know?', ['typescript']], ['What frameworks does Ray use?', ['next']],
  ['Which databases has he worked with?', ['postgres']], ['How does he deploy applications?', ['kubernetes']], ['What LLM libraries does he use?', ['lang']],
  ['Has he used Dify?', ['scada|water']], ['Does he use AI coding tools?', ['claude']], ['Does he know LangChain?', ['langchain']], ['What is MCP experience?', ['mcp']],
  ['Can he self-host LLMs?', ['vllm']], ['Has he fine-tuned a model?', ['qwen']], ['What machine learning has he done?', ['xgboost']],
  ['Where does Ray work now?', ['huawei']], ['When did he join Huawei?', ['2025']], ['What did he do at CMG?', ['team']], ['Was he an intern?', ['intern']],
  ['What did he build during his internship?', ['blood']], ['Tell me about the internal productivity tools', ['postgresql']],
  ['Tell me about the WhatsApp chatbot', ['whatsapp']], ['What is the no-code agent builder?', ['agent']], ["What did he do for Madam Kwan's?", ['mini program']],
  ['Tell me about RunForPeace', ['1']], ['Tell me about the form app', ['react native']], ['What is the sales dashboard?', ['pricing']],
  ['Tell me about MyGOV', ['ui']], ['What is the SCADA project?', ['root']], ['What did he do for the bank on credit papers?', ['80']], ['What is the sales intelligence platform?', ['xgboost']],
  ['What internal management tools did he build?', ['risk']], ['Where did he study?', ['tarumt']], ['What was his CGPA?', ['3.74']], ['Did he get any awards?', ['scholarship|president']],
  ['Did he do any sports at university?', ['badminton']], ['Has he spoken at events?', ['nus']], ['Which industries has he worked in?', ['bank']],
  ['How can I contact Ray?', ['zhengfengboo0710@gmail.com']], ['Where is Ray based?', ['kuala lumpur']], ['Has he led a team?', ['lead']],
  ['What does he do in pre-sales?', ['demo']], ['Is he a full-stack developer?', ['react']], ['What is his background?', ['ai|data science|computer science']],
];
// asked from the Chinese site: answers must come back in Simplified Chinese and still carry the facts
const COVERED_ZH = [
  ['他的技术栈是什么？', ['python']], ['Ray 在哪里读书？', ['tarumt']], ['他的 CGPA 是多少？', ['3.74']], ['怎么联系 Ray？', ['zhengfengboo0710@gmail.com']],
  ['他在银行信贷文件项目上取得了什么成果？', ['80']], ['他会自托管大模型吗？', ['vllm']], ['RunForPeace 是什么？', ['100|一百|百万']], ['他用过 Dify 吗？', ['scada|水处理']],
];
// questions the knowledge must NOT answer (the guardrail should fall back, never invent)
const NOT_COVERED = ["What is Ray's salary?", "What is Ray's home address?", "What is Ray's phone number?"];

let fails = 0;
const run = async ([q, must], expectFallback, lang = 'en') => {
  const a = await answerQuestion(q, deps, { lang }), fell = a === FALLBACK || a === FALLBACK_ZH;
  const ok = expectFallback ? fell : !fell && must.every(w => w.split('|').some(x => a.toLowerCase().includes(x))) && (lang === 'zh' ? /[\u4e00-\u9fff]/.test(a) && !/[們個這過於與網頁處體點]/.test(a) : !/[\u4e00-\u9fff]{4}/.test(a));
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${q}${ok ? '' : '\n      → ' + a.replace(/\n/g, ' ').slice(0, 220)}`);
};
for (let i = 0; i < COVERED.length; i += 6) await Promise.all(COVERED.slice(i, i + 6).map(c => run(c, false)));
await Promise.all(COVERED_ZH.map(c => run(c, false, 'zh')));
await Promise.all(NOT_COVERED.map(q => run([q, []], true)));
await run(['Ray 的工资是多少？', []], true, 'zh');
const total = COVERED.length + COVERED_ZH.length + NOT_COVERED.length + 1;
console.log(`\n${total - fails}/${total} passed`);
process.exitCode = fails ? 1 : 0;
