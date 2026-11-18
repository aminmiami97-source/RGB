import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_FREE_MODELS,
  buildRgbSystemPrompt,
  extractFreeModelIds,
  pickRandomFreeModel,
  validateChatMessages,
} from './chatConfig';
import { CREDITS_LINE, EXECUTOR_URLS, INITIAL_RELEASES } from './scriptData';

test('extractFreeModelIds filters free OpenRouter models and falls back when empty', () => {
  const extracted = extractFreeModelIds([
    { id: 'openai/gpt-4o', pricing: { prompt: '0.005', completion: '0.015' } },
    { id: 'google/gemma-3-27b-it:free', pricing: { prompt: '0', completion: '0' } },
    { id: 'meta-llama/llama-3.3-70b-instruct:free' },
  ]);
  assert.deepEqual(extracted, [
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
  ]);

  const fallback = extractFreeModelIds([{ id: 'paid/model', pricing: { prompt: '1', completion: '1' } }]);
  assert.deepEqual(fallback, [...FALLBACK_FREE_MODELS]);
});

test('pickRandomFreeModel respects exclusion list and random index', () => {
  const candidates = ['m1:free', 'm2:free', 'm3:free'];
  assert.equal(pickRandomFreeModel(candidates, ['m1:free'], () => 0), 'm2:free');
  assert.equal(pickRandomFreeModel(candidates, [], () => 0.99), 'm3:free');
});

test('validateChatMessages enforces valid non-empty user message', () => {
  assert.equal(validateChatMessages([]).valid, false);
  assert.equal(validateChatMessages([{ role: 'user', content: '   ' }]).valid, false);
  assert.equal(validateChatMessages([{ role: 'assistant', content: 'hi' }]).valid, false);

  const ok = validateChatMessages([{ role: 'user', content: 'What executors does RGB support?' }]);
  assert.equal(ok.valid, true);
  assert.equal(ok.sanitized?.length, 1);
});

test('buildRgbSystemPrompt includes released script details, executor URLs, AI model clarification, and strict scope rule', () => {
  const prompt = buildRgbSystemPrompt(INITIAL_RELEASES, 'v1.4.3 [BETA]');
  assert.ok(prompt.includes('RELEASED & AVAILABLE NOW'));
  assert.ok(prompt.includes('v1.4.3 [BETA]'));
  assert.ok(prompt.includes('Box ESP'));
  assert.ok(prompt.includes(EXECUTOR_URLS.solara));
  assert.ok(prompt.includes(EXECUTOR_URLS.xeno));
  assert.ok(prompt.includes(CREDITS_LINE));
  assert.ok(prompt.includes('AI model'));
  assert.ok(prompt.includes('ONLY answer questions about the RGB'));
});
