// HTTP layer for POST /api/chat. Plain Node (req, res) so it runs on Vercel and in the Vite dev server alike.
import { InvalidQuestion } from './rag.js';

const json = (res, status, body) => {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body));
};

const LIMIT = 10, WINDOW_MS = 60_000;

// Error messages in the language of the page the visitor is on.
const ERR = {
  en:{ method:'Use POST.', busy:'You are asking quickly! Please wait a minute and try again.', empty:'Please type a question.', down:'The assistant is unavailable right now. Please try again in a moment.' },
  zh:{ method:'请使用 POST。', busy:'你问得太快啦！请稍等一分钟再试。', empty:'请输入你的问题。', down:'助手暂时无法使用，请稍后再试。' },
};

const clientIp = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

/**
 * deps: { answer(question, lang) → Promise<string>, now?() → ms }; the body may carry lang: 'zh' from the Chinese site
 * Rate limiting is per server instance (in memory): enough to stop casual spamming of the OpenAI key.
 */
export function createChatHandler({ answer, now = Date.now }) {
  const seen = new Map(); // ip → timestamps of recent questions
  return async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {}, lang = body.lang === 'zh' ? 'zh' : 'en', e = ERR[lang];
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error:e.method }); }
    const ip = clientIp(req), t = now(), recent = (seen.get(ip) || []).filter(x => t - x < WINDOW_MS);
    if (recent.length >= LIMIT) { seen.set(ip, recent); return json(res, 429, { error:e.busy }); }
    seen.set(ip, [...recent, t]);
    const question = body.question;
    if (typeof question !== 'string') return json(res, 400, { error:e.empty });
    try {
      json(res, 200, { answer:await answer(question, lang) });
    } catch (err) {
      if (err instanceof InvalidQuestion) return json(res, 400, { error:err.message });
      console.error('chat failed', err);
      json(res, 502, { error:e.down });
    }
  };
}
