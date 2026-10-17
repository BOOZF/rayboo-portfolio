import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapText } from './textures.js';

// Fake canvas context: every character is 10px wide.
const g = { measureText:t => ({ width:t.length * 10 }) };

test('English titles wrap at spaces', () => {
  assert.deepEqual(wrapText(g, 'No-Code Agent Builder', 130), ['No-Code Agent', 'Builder']);
});

test('Chinese titles, which have no spaces, still wrap between characters', () => {
  assert.deepEqual(wrapText(g, '无代码智能体构建平台', 60), ['无代码智能体', '构建平台']);
});

test('mixed Chinese and Latin keeps the Latin word whole', () => {
  assert.deepEqual(wrapText(g, '水处理厂 SCADA AI', 90), ['水处理厂', 'SCADA AI']);
});
