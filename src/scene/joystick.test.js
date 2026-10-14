import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joystick } from './joystick.js';

// Screen coordinates: x grows right, y grows down. Joystick radius 60px.
const at = (x, y) => ({ x, y }), R = 60;

test('a tiny thumb wobble inside the dead zone does not move Ray', () => {
  assert.deepEqual(joystick(at(100, 100), at(104, 103), R), { x:0, y:0, run:false });
});

test('pushing the thumb straight up halfway walks Ray forward at half speed', () => {
  const m = joystick(at(100, 100), at(100, 70), R); // 30px of a 60px radius, upwards
  assert.equal(m.x, 0);
  assert.ok(Math.abs(m.y - .5) < .08, `forward ≈ .5, got ${m.y}`);
  assert.equal(m.run, false);
});

test('pushing past the edge is capped at full speed and makes Ray run', () => {
  const m = joystick(at(100, 100), at(220, 100), R); // 120px right: twice the radius
  assert.ok(Math.abs(m.x - 1) < 1e-9, `right = 1, got ${m.x}`);
  assert.ok(Math.abs(m.y) < 1e-9);
  assert.equal(m.run, true);
});

test('a diagonal push never exceeds full speed', () => {
  const m = joystick(at(0, 0), at(200, -200), R);
  assert.ok(Math.abs(Math.hypot(m.x, m.y) - 1) < 1e-9);
  assert.ok(m.x > 0 && m.y > 0, 'up-right = forward and right');
});
