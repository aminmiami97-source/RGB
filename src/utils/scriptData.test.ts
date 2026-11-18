import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_OFFICIAL_SCRIPT,
  DEFAULT_RELEASE_MESSAGE,
  DEFAULT_RELEASE_TITLE,
  DEFAULT_SCRIPT_VERSION,
} from './officialScript';
import {
  AUTHORIZED_UPDATE_EMAIL,
  CREDITS_LINE,
  EXECUTOR_PROFILES,
  EXECUTOR_URLS,
  INITIAL_RELEASES,
  SCRIPT_COMING_SOON,
  SCRIPT_CONFIG_LIMITS,
  applyNewUpdate,
  canUserPublishUpdates,
  compareSemver,
  filterChanges,
  flattenChanges,
  formatVersionDisplay,
  getLatestVersion,
  groupFirestoreUpdatesIntoReleases,
  isValidSemver,
  suggestNextVersion,
  validateNewUpdate,
  validateOfficialScriptInput,
} from './scriptData';

test('official script release defaults are populated and SCRIPT_COMING_SOON is false', () => {
  assert.deepEqual(INITIAL_RELEASES, []);
  assert.equal(getLatestVersion(INITIAL_RELEASES), '1.4.3');
  assert.equal(SCRIPT_COMING_SOON, false);
  assert.equal(DEFAULT_SCRIPT_VERSION, 'v1.4.3 [BETA]');
  assert.ok(DEFAULT_OFFICIAL_SCRIPT.includes('local SCRIPT_NAME = "RGB SCRIPTS"'));
  assert.ok(DEFAULT_OFFICIAL_SCRIPT.includes('local VERSION = "v1.4.3 [BETA]"'));
  assert.ok(DEFAULT_OFFICIAL_SCRIPT.includes('RGB5.6 AGROX'));
  assert.ok(DEFAULT_OFFICIAL_SCRIPT.includes('ALEX'));
  assert.equal(formatVersionDisplay('v1.4.3 [BETA]'), 'v1.4.3 [BETA]');
  assert.equal(formatVersionDisplay('1.4.3'), 'v1.4.3');
  assert.equal(EXECUTOR_URLS.solara, 'https://getsolara.dev/download/');
  assert.equal(EXECUTOR_URLS.xeno, 'https://www.xeno.now/download');
  assert.equal(EXECUTOR_PROFILES[0].downloadUrl, EXECUTOR_URLS.solara);
  assert.equal(EXECUTOR_PROFILES[1].downloadUrl, EXECUTOR_URLS.xeno);
});

test('validateOfficialScriptInput enforces blueprint bounds on live script edits', () => {
  const valid = validateOfficialScriptInput({
    version: DEFAULT_SCRIPT_VERSION,
    releaseTitle: DEFAULT_RELEASE_TITLE,
    releaseMessage: DEFAULT_RELEASE_MESSAGE,
    code: DEFAULT_OFFICIAL_SCRIPT,
  });
  assert.equal(valid.valid, true);

  assert.equal(
    validateOfficialScriptInput({
      version: '',
      releaseTitle: DEFAULT_RELEASE_TITLE,
      releaseMessage: DEFAULT_RELEASE_MESSAGE,
      code: DEFAULT_OFFICIAL_SCRIPT,
    }).valid,
    false
  );

  assert.equal(
    validateOfficialScriptInput({
      version: DEFAULT_SCRIPT_VERSION,
      releaseTitle: 'Hi',
      releaseMessage: DEFAULT_RELEASE_MESSAGE,
      code: DEFAULT_OFFICIAL_SCRIPT,
    }).valid,
    false
  );

  assert.equal(
    validateOfficialScriptInput({
      version: DEFAULT_SCRIPT_VERSION,
      releaseTitle: DEFAULT_RELEASE_TITLE,
      releaseMessage: DEFAULT_RELEASE_MESSAGE,
      code: 'short',
    }).valid,
    false
  );

  assert.equal(
    validateOfficialScriptInput({
      version: DEFAULT_SCRIPT_VERSION,
      releaseTitle: DEFAULT_RELEASE_TITLE,
      releaseMessage: DEFAULT_RELEASE_MESSAGE,
      code: 'x'.repeat(SCRIPT_CONFIG_LIMITS.CODE_MAX + 1),
    }).valid,
    false
  );
});

test('only verified aminmiami97@gmail.com is authorized to publish updates or edit script', () => {
  assert.equal(AUTHORIZED_UPDATE_EMAIL, 'aminmiami97@gmail.com');
  assert.equal(canUserPublishUpdates(null), false);
  assert.equal(canUserPublishUpdates(undefined), false);
  assert.equal(
    canUserPublishUpdates({ email: 'other@gmail.com', emailVerified: true }),
    false
  );
  assert.equal(
    canUserPublishUpdates({ email: 'aminmiami97@gmail.com', emailVerified: false }),
    false
  );
  assert.equal(
    canUserPublishUpdates({ email: 'aminmiami97@gmail.com', emailVerified: true }),
    true
  );
  assert.equal(
    canUserPublishUpdates({ email: '  AminMiami97@gmail.com ', emailVerified: true }),
    true
  );
});

test('semver comparison, validation, and suggestion work accurately', () => {
  assert.equal(isValidSemver('1.0.0'), true);
  assert.equal(isValidSemver('1.4.3'), true);
  assert.equal(isValidSemver('v1.0'), false);
  assert.ok(compareSemver('1.0.10', '1.0.2') > 0);
  assert.equal(suggestNextVersion('1.0.0', false), '1.0.0');
  assert.equal(suggestNextVersion('1.4.3', true), '1.4.4');
});

test('groupFirestoreUpdatesIntoReleases groups and sorts updates by semver and timestamp', () => {
  const grouped = groupFirestoreUpdatesIntoReleases([
    {
      id: 'u-1',
      version: '1.0.0',
      codename: 'Initial Release',
      title: 'Initial RGB Core',
      description: 'First RGB script core feature set.',
      category: 'Added',
      createdAtIso: '2026-11-17T08:00:00Z',
    },
    {
      id: 'u-2',
      version: '1.4.3',
      codename: 'Patch',
      title: 'Box ESP Hotfix',
      description: 'Fixed lingering Box ESP drawings on toggle off.',
      category: 'Fixed',
      createdAtIso: '2026-11-18T03:50:00Z',
    },
  ]);

  assert.equal(grouped.length, 2);
  assert.equal(grouped[0].version, '1.4.3');
  assert.equal(grouped[1].version, '1.0.0');

  const flat = flattenChanges(grouped);
  const fixedOnly = filterChanges(flat, { category: 'Fixed' });
  assert.equal(fixedOnly.length, 1);
  assert.equal(fixedOnly[0].title, 'Box ESP Hotfix');
});

test('validateNewUpdate enforces schema bounds and applyNewUpdate prepends new version', () => {
  const invalid = validateNewUpdate({
    version: 'bad',
    codename: 'Test',
    title: 'Ok',
    description: 'short',
    category: 'Added',
  });
  assert.equal(invalid.valid, false);

  const validInput = {
    version: '1.4.4',
    codename: 'Patch',
    title: 'Faster ESP Toggle Response',
    description: 'Improves responsiveness when toggling ESP visuals in game.',
    category: 'Improved' as const,
  };
  assert.equal(validateNewUpdate(validInput).valid, true);

  const nextReleases = applyNewUpdate(
    INITIAL_RELEASES,
    validInput,
    '2026-11-18T04:00:00Z'
  );
  assert.equal(getLatestVersion(nextReleases), '1.4.4');
  assert.equal(nextReleases.length, 1);
  assert.equal(nextReleases[0].changes[0].title, 'Faster ESP Toggle Response');
  assert.ok(CREDITS_LINE.includes('RGB5.6 AGROX'));
});
