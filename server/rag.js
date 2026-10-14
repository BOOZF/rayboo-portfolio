// File-based RAG for the "Ask about Ray" chat: no database, the index lives in knowledge/.

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

// Below this similarity a section is treated as unrelated to the question (tuned for text-embedding-3-small).
export const MIN_SCORE = .3;

// Sections of the knowledge index related to the question vector, best first, at most k.
export function retrieve(queryVector, index, { k = 5, minScore = MIN_SCORE } = {}) {
  return index.map(c => ({ ...c, score:cosine(queryVector, c.vector) }))
    .filter(c => c.score >= minScore).sort((a, b) => b.score - a.score).slice(0, k);
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
  const hits = retrieve(await embed(question), index);
  if (!hits.length) return FALLBACK;
  const context = hits.map(h => h.text).join('\n\n---\n\n');
  const reply = (await complete({ question, context })).trim();
  return !reply || reply.includes(NO_ANSWER) ? FALLBACK : reply;
}
