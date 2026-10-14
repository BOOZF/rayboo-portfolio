// Vercel serverless function: POST /api/chat { question } → { answer }
import { createChatHandler } from '../server/chatHandler.js';
import { answerQuestion } from '../server/rag.js';
import { openaiDeps } from '../server/openai.js';
import index from '../knowledge/index.js';

const deps = openaiDeps({ key:process.env.OPENAI_API_KEY, model:process.env.OPENAI_MODEL || 'gpt-5-mini', index });
export default createChatHandler({ answer:q => answerQuestion(q, deps) });
