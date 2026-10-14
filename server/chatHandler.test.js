import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChatHandler } from './chatHandler.js';
import { InvalidQuestion } from './rag.js';

// Minimal stand-ins for Node's IncomingMessage (as Vercel parses it) and ServerResponse.
const request = (method, body, ip = '1.1.1.1') => ({ method, body, headers:{ 'x-forwarded-for':ip }, socket:{ remoteAddress:ip } });
const response = () => {
  const res = { statusCode:200, headers:{}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b ? JSON.parse(b) : undefined; } };
  return res;
};
const send = async (handler, req) => { const res = response(); await handler(req, res); return res; };

test('POST with a question returns the answer as JSON', async () => {
  const handler = createChatHandler({ answer:async q => `About "${q}": he led the AI team.` });
  const res = await send(handler, request('POST', { question:'What was his role at CMG?' }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { answer:'About "What was his role at CMG?": he led the AI team.' });
});

test('anything but POST is refused with 405', async () => {
  const handler = createChatHandler({ answer:async () => 'unused' });
  const res = await send(handler, request('GET'));
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
});

test('a missing body or an invalid question is a 400 with a readable message', async () => {
  const handler = createChatHandler({ answer:async () => { throw new InvalidQuestion('Please type a question.'); } });
  assert.equal((await send(handler, request('POST', undefined))).statusCode, 400);
  const res = await send(handler, request('POST', { question:'' }));
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error:'Please type a question.' });
});

test('a visitor asking more than 10 questions a minute gets 429; other visitors are unaffected', async () => {
  let now = 0;
  const handler = createChatHandler({ answer:async () => 'ok', now:() => now });
  for (let i = 0; i < 10; i++) assert.equal((await send(handler, request('POST', { question:'hi' }, '9.9.9.9'))).statusCode, 200);
  const limited = await send(handler, request('POST', { question:'hi' }, '9.9.9.9'));
  assert.equal(limited.statusCode, 429);
  assert.equal((await send(handler, request('POST', { question:'hi' }, '8.8.8.8'))).statusCode, 200);
  now = 61_000; // a minute later the visitor can ask again
  assert.equal((await send(handler, request('POST', { question:'hi' }, '9.9.9.9'))).statusCode, 200);
});

test('an OpenAI failure becomes a 502 with a friendly message, not a crash', async () => {
  const handler = createChatHandler({ answer:async () => { throw new Error('upstream 500'); } });
  const res = await send(handler, request('POST', { question:'hi' }));
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /try again/i);
});
