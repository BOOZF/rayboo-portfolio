// HTTP layer for POST /api/chat. Plain Node (req, res) so it runs on Vercel and in the Vite dev server alike.
import { InvalidQuestion } from './rag.js';

const json = (res, status, body) => {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body));
};

const LIMIT = 10, WINDOW_MS = 60_000;

const clientIp = req => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

/**
 * deps: { answer(question) → Promise<string>, now?() → ms }
 * Rate limiting is per server instance (in memory): enough to stop casual spamming of the OpenAI key.
 */
export function createChatHandler({ answer, now = Date.now }) {
  const seen = new Map(); // ip → timestamps of recent questions
  return async (req, res) => {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error:'Use POST.' }); }
    const ip = clientIp(req), t = now(), recent = (seen.get(ip) || []).filter(x => t - x < WINDOW_MS);
    if (recent.length >= LIMIT) { seen.set(ip, recent); return json(res, 429, { error:'You are asking quickly! Please wait a minute and try again.' }); }
    seen.set(ip, [...recent, t]);
    const question = req.body && typeof req.body === 'object' ? req.body.question : undefined;
    if (typeof question !== 'string') return json(res, 400, { error:'Please type a question.' });
    try {
      json(res, 200, { answer:await answer(question) });
    } catch (e) {
      if (e instanceof InvalidQuestion) return json(res, 400, { error:e.message });
      console.error('chat failed', e);
      json(res, 502, { error:'The assistant is unavailable right now. Please try again in a moment.' });
    }
  };
}
