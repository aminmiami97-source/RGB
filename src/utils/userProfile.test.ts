import test from 'node:test';
import assert from 'node:assert/strict';
import {
  USER_PROFILE_LIMITS,
  sanitizeDisplayName,
  sanitizePhotoUrl,
  validateProfilePayload,
} from './userProfile';

test('sanitizeDisplayName falls back safely and respects 120-char blueprint limit', () => {
  assert.equal(sanitizeDisplayName('  Alex Dev  ', 'alex@example.com'), 'Alex Dev');
  assert.equal(sanitizeDisplayName('', 'alex@example.com'), 'alex');
  const longName = 'A'.repeat(200);
  assert.equal(
    sanitizeDisplayName(longName, 'alex@example.com').length,
    USER_PROFILE_LIMITS.DISPLAY_NAME_MAX
  );
});

test('sanitizePhotoUrl omits empty or oversized URLs', () => {
  assert.equal(sanitizePhotoUrl(''), undefined);
  assert.equal(sanitizePhotoUrl(`https://example.com/${'a'.repeat(500)}`), undefined);
  assert.equal(sanitizePhotoUrl('https://lh3.googleusercontent.com/avatar.png'), 'https://lh3.googleusercontent.com/avatar.png');
});

test('validateProfilePayload enforces blueprint invariants', () => {
  assert.equal(
    validateProfilePayload({
      uid: 'user_123-abc',
      displayName: 'Alex',
      email: 'alex@example.com',
      preferredExecutor: 'solara',
    }).valid,
    true
  );

  assert.equal(
    validateProfilePayload({
      uid: 'bad/id',
      displayName: 'Alex',
      email: 'alex@example.com',
      preferredExecutor: 'solara',
    }).valid,
    false
  );

  assert.equal(
    validateProfilePayload({
      uid: 'user_123',
      displayName: '',
      email: 'alex@example.com',
      preferredExecutor: 'xeno',
    }).valid,
    false
  );
});
