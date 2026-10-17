// Asks the real "Ask about Ray" pipeline (OpenAI + knowledge/index.js) a question for every part of the résumé and
// self-introduction deck, and reports any that fall back to "I don't have that detail". Run: node scripts/eval-chat.mjs
import { answerQuestion, FALLBACK } from '../server/rag.js';
import { openaiDeps } from '../server/openai.js';
import index from '../knowledge/index.js';

if (!process.env.OPENAI_API_KEY) process.loadEnvFile('.env');
const deps = openaiDeps({ key:process.env.OPENAI_API_KEY, model:process.env.OPENAI_MODEL || 'gpt-5-mini', index });

// [question, words the answer must mention (case-insensitive)]
const COVERED = [
  ['What is his tech stack?', ['python']], ['What programming languages does he know?', ['typescript']], ['What frameworks does Ray use?', ['next']],
  ['Which databases has he worked with?', ['postgres']], ['How does he deploy applications?', ['kubernetes']], ['What LLM libraries does he use?', ['lang']],
  ['Has he used Dify?', ['scada']], ['Does he use AI coding tools?', ['claude']], ['Does he know LangChain?', ['langchain']], ['What is MCP experience?', ['mcp']],
  ['Can he self-host LLMs?', ['vllm']], ['Has he fine-tuned a model?', ['qwen']], ['What machine learning has he done?', ['xgboost']],
  ['Where does Ray work now?', ['huawei']], ['When did he join Huawei?', ['2025']], ['What did he do at CMG?', ['team']], ['Was he an intern?', ['intern']],
  ['What did he build during his internship?', ['blood']], ['Tell me about the internal productivity tools', ['postgresql']],
  ['Tell me about the WhatsApp chatbot', ['whatsapp']], ['What is the no-code agent builder?', ['agent']], ["What did he do for Madam Kwan's?", ['mini program']],
  ['Tell me about RunForPeace', ['1']], ['Tell me about the form app', ['react native']], ['What is the sales dashboard?', ['pricing']],
  ['Tell me about MyGOV', ['ui']], ['What is the SCADA project?', ['root']], ['What did he do for the bank on credit papers?', ['80']], ['What is the sales intelligence platform?', ['xgboost']],
  ['What internal management tools did he build?', ['risk']], ['Where did he study?', ['tarumt']], ['What was his CGPA?', ['3.74']], ['Did he get any awards?', ["president"]],
  ['Did he do any sports at university?', ['badminton']], ['Has he spoken at events?', ['nus']], ['Which industries has he worked in?', ['bank']],
  ['How can I contact Ray?', ['zhengfengboo0710@gmail.com']], ['Where is Ray based?', ['kuala lumpur']], ['Has he led a team?', ['lead']],
  ['What does he do in pre-sales?', ['demo']], ['Is he a full-stack developer?', ['react']], ['What is his background?', ['ai']],
];
// questions the knowledge must NOT answer (the guardrail should fall back, never invent)
const NOT_COVERED = ["What is Ray's salary?", "What is Ray's home address?", "What is Ray's phone number?"];

let fails = 0;
const run = async ([q, must], expectFallback) => {
  const a = await answerQuestion(q, deps), fell = a === FALLBACK;
  const ok = expectFallback ? fell : !fell && must.every(w => a.toLowerCase().includes(w));
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${q}${ok ? '' : '\n      → ' + a.replace(/\n/g, ' ').slice(0, 220)}`);
};
for (let i = 0; i < COVERED.length; i += 6) await Promise.all(COVERED.slice(i, i + 6).map(c => run(c, false)));
await Promise.all(NOT_COVERED.map(q => run([q, []], true)));
console.log(`\n${COVERED.length + NOT_COVERED.length - fails}/${COVERED.length + NOT_COVERED.length} passed`);
process.exitCode = fails ? 1 : 0;
