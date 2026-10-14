import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retrieve, answerQuestion, FALLBACK, NO_ANSWER } from './rag.js';

// Hand-made 3-d "embeddings": axis 0 ≈ banking, axis 1 ≈ education, axis 2 ≈ running events.
const index = [
  { id:'ambank', text:'AmBank credit papers, Qwen3 fine-tuning', vector:[1, 0, 0] },
  { id:'education', text:'TARUMT, Data Science, CGPA 3.74', vector:[0, 1, 0] },
  { id:'run-for-peace', text:'RunForPeace charity run, 1M+ users', vector:[0, 0, 1] },
];

test('retrieve ranks the section closest to the question first', () => {
  const hits = retrieve([0.9, 0.3, 0], index);
  assert.equal(hits[0].id, 'ambank');
  assert.equal(hits[1].id, 'education');
});

test('retrieve returns nothing for a question unrelated to any section', () => {
  // "What's the weather?" points away from every topic axis.
  assert.deepEqual(retrieve([-1, -1, -1], index), []);
});

// Fake adapters for the two OpenAI calls: embeddings map known phrases onto the topic axes above.
const embedOf = { 'What did Ray do at AmBank?':[1, .1, 0], 'What is the weather today?':[-1, -1, -1] };
const fakeDeps = (reply = 'He fine-tuned Qwen3 to read credit papers.') => {
  const calls = [];
  return { calls, index, embed:async q => embedOf[q], complete:async ({ question, context }) => { calls.push({ question, context }); return reply; } };
};

test('answerQuestion answers from the matching sections only', async () => {
  const deps = fakeDeps();
  const answer = await answerQuestion('What did Ray do at AmBank?', deps);
  assert.equal(answer, 'He fine-tuned Qwen3 to read credit papers.');
  assert.match(deps.calls[0].context, /AmBank credit papers/);
  assert.doesNotMatch(deps.calls[0].context, /RunForPeace/);
});

test('answerQuestion replies with the fallback, without calling the model, when nothing relevant is found', async () => {
  const deps = fakeDeps();
  assert.equal(await answerQuestion('What is the weather today?', deps), FALLBACK);
  assert.equal(deps.calls.length, 0);
});

test('answerQuestion replies with the fallback when the model finds the sections do not cover the question', async () => {
  // Related section found (AmBank), but the model reports the answer isn't in it.
  const deps = fakeDeps(NO_ANSWER);
  assert.equal(await answerQuestion('What did Ray do at AmBank?', deps), FALLBACK);
});

test('answerQuestion rejects empty and over-long questions without calling anything', async () => {
  const deps = fakeDeps();
  await assert.rejects(answerQuestion('   ', deps), /question/i);
  await assert.rejects(answerQuestion('a'.repeat(501), deps), /500/);
  assert.equal(deps.calls.length, 0);
});
