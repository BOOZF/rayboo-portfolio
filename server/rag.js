// File-based RAG for the "Ask about Ray" chat: no database, the index lives in knowledge/.

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

// Below this similarity a section is treated as unrelated to the question (tuned for text-embedding-3-small).
export const MIN_SCORE = .3;

const words = text => new Set((text.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]*/g) || []).map(w => w.replace(/[.-]+$/, '')));
const STOP = new Set('a an and are about any as at be by can could did do does for from had has have he her him his how i in is it its me my of on or ray ray\'s she so tell that the their them they this to was we what when where which who whom why will with would you your'.split(' '));

// Distinctive words of the question (names, acronyms, tools) that appear in only a few sections.
function keyTerms(query, index) {
  const sets = index.map(c => c.words || (c.words = words(c.text))), maxDf = Math.max(2, index.length * .15);
  return [...words(query)].filter(w => w.length > 1 && !STOP.has(w)).filter(w => { const df = sets.filter(s => s.has(w)).length; return df > 0 && df <= maxDf; });
}

// Sections of the knowledge index related to the question, best first, at most k. Ranking is by embedding similarity,
// plus a boost for sections that literally name a distinctive word of the question (embeddings blur acronyms like MCP).
export function retrieve(queryVector, index, { k = 5, minScore = MIN_SCORE, query = '' } = {}) {
  const terms = query ? keyTerms(query, index) : [];
  return index.map(c => {
    const named = terms.filter(w => (c.words || words(c.text)).has(w)).length;
    return { ...c, score:cosine(queryVector, c.vector) + named * .15, named };
  }).filter(c => c.score >= minScore || c.named).sort((a, b) => b.score - a.score).slice(0, k)
    .map(({ words:_w, named:_n, ...c }) => c);
}

// Token the model is told to reply with when the sections don't contain the answer.
export const NO_ANSWER = 'NO_ANSWER';

export const MAX_QUESTION = 500;

// Raised for bad visitor input; the HTTP layer turns it into a 400.
export class InvalidQuestion extends Error {}

// Guardrail reply when the knowledge folder doesn't cover the question.
export const FALLBACK = "I don't have that detail about Ray yet. For anything beyond what's here, please reach out to him directly at zhengfengboo0710@gmail.com, and he'll be happy to help.";

/**
 * Answer a visitor's question about Ray from the knowledge index.
 * deps: { index, embed(question) → vector, complete({ question, context }) → text }
 */
export async function answerQuestion(question, { index, embed, complete }) {
  question = typeof question === 'string' ? question.trim() : '';
  if (!question) throw new InvalidQuestion('Please type a question.');
  if (question.length > MAX_QUESTION) throw new InvalidQuestion(`Questions are limited to ${MAX_QUESTION} characters.`);
  const hits = retrieve(await embed(question), index, { k:6, query:question });
  if (!hits.length) return FALLBACK;
  const context = hits.map(h => h.text).join('\n\n---\n\n');
  // the model occasionally says NO_ANSWER (or nothing) with the answer right there in the context, so it gets a second try
  for (let attempt = 0; attempt < 2; attempt++) {
    const reply = (await complete({ question, context })).trim();
    if (reply && !reply.includes(NO_ANSWER)) return reply;
  }
  return FALLBACK;
}
