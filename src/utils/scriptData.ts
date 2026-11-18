import type {
  ExecutorId,
  ExecutorProfile,
  NewUpdateInput,
  OfficialScriptInput,
  ScriptChangeItem,
  ScriptRelease,
  UpdateCategory,
} from '../types/script.ts';
import { DEFAULT_SCRIPT_VERSION } from './officialScript.ts';

export const CREDITS_LINE = 'MADE BY RGB5.6 AGROX AND THE DEVELOPER ALEX';

export const SCRIPT_COMING_SOON = false;

export const AUTHORIZED_UPDATE_EMAIL = 'aminmiami97@gmail.com';

export const SCRIPT_UPDATE_LIMITS = {
  ID_MAX: 128,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  VERSION_MIN: 5,
  VERSION_MAX: 24,
  VERSION_PATTERN: /^[0-9]+\.[0-9]+\.[0-9]+$/,
  CODENAME_MIN: 1,
  CODENAME_MAX: 60,
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MIN: 8,
  DESCRIPTION_MAX: 500,
} as const;

export const SCRIPT_CONFIG_LIMITS = {
  DOC_ID: 'live',
  VERSION_MIN: 1,
  VERSION_MAX: 40,
  RELEASE_TITLE_MIN: 3,
  RELEASE_TITLE_MAX: 120,
  RELEASE_MESSAGE_MIN: 8,
  RELEASE_MESSAGE_MAX: 400,
  CODE_MIN: 10,
  CODE_MAX: 200000,
} as const;

export const EXECUTOR_URLS = {
  solara: 'https://getsolara.dev/download/',
  xeno: 'https://www.xeno.now/download',
} as const;

export const INITIAL_RELEASES: ScriptRelease[] = [];

export function canUserPublishUpdates(
  user: { email?: string | null; emailVerified?: boolean | null } | null | undefined
): boolean {
  if (!user || typeof user.email !== 'string') {
    return false;
  }
  if (user.emailVerified === false) {
    return false;
  }
  return user.email.trim().toLowerCase() === AUTHORIZED_UPDATE_EMAIL;
}

export function formatVersionDisplay(version: string): string {
  const trimmed = version.trim();
  if (!trimmed) {
    return DEFAULT_SCRIPT_VERSION;
  }
  return /^[vV]/.test(trimmed) ? trimmed : `v${trimmed}`;
}

export function validateOfficialScriptInput(
  input: OfficialScriptInput
): { valid: boolean; error?: string } {
  const version = input.version.trim();
  if (
    version.length < SCRIPT_CONFIG_LIMITS.VERSION_MIN ||
    version.length > SCRIPT_CONFIG_LIMITS.VERSION_MAX
  ) {
    return {
      valid: false,
      error: `Version must be between ${SCRIPT_CONFIG_LIMITS.VERSION_MIN} and ${SCRIPT_CONFIG_LIMITS.VERSION_MAX} characters.`,
    };
  }
  const releaseTitle = input.releaseTitle.trim();
  if (
    releaseTitle.length < SCRIPT_CONFIG_LIMITS.RELEASE_TITLE_MIN ||
    releaseTitle.length > SCRIPT_CONFIG_LIMITS.RELEASE_TITLE_MAX
  ) {
    return {
      valid: false,
      error: `Release title must be between ${SCRIPT_CONFIG_LIMITS.RELEASE_TITLE_MIN} and ${SCRIPT_CONFIG_LIMITS.RELEASE_TITLE_MAX} characters.`,
    };
  }
  const releaseMessage = input.releaseMessage.trim();
  if (
    releaseMessage.length < SCRIPT_CONFIG_LIMITS.RELEASE_MESSAGE_MIN ||
    releaseMessage.length > SCRIPT_CONFIG_LIMITS.RELEASE_MESSAGE_MAX
  ) {
    return {
      valid: false,
      error: `Release notification message must be between ${SCRIPT_CONFIG_LIMITS.RELEASE_MESSAGE_MIN} and ${SCRIPT_CONFIG_LIMITS.RELEASE_MESSAGE_MAX} characters.`,
    };
  }
  const code = input.code.trim();
  if (
    code.length < SCRIPT_CONFIG_LIMITS.CODE_MIN ||
    input.code.length > SCRIPT_CONFIG_LIMITS.CODE_MAX
  ) {
    return {
      valid: false,
      error: `Script code must be between ${SCRIPT_CONFIG_LIMITS.CODE_MIN} and ${SCRIPT_CONFIG_LIMITS.CODE_MAX} characters.`,
    };
  }
  return { valid: true };
}

export const EXECUTOR_PROFILES: ExecutorProfile[] = [
  {
    id: 'solara',
    name: 'Solara',
    tagline: 'Primary external execution target with stabilized Drawing & RenderStepped hooks.',
    compatibilityScore: 'Verified Live',
    frameOverhead: '< 0.35 ms / frame',
    downloadUrl: EXECUTOR_URLS.solara,
    recommendedFlags: ['Drawing.new = true', 'RenderStepped = true', 'MarketplaceService = true'],
    supportedApis: ['Drawing.new', 'CoreGui', 'RunService.RenderStepped', 'TweenService', 'MarketplaceService'],
    notes:
      'Runs the released RGB SCRIPTS loader with throttled ESP updates and instant cleanup on re-execute.',
  },
  {
    id: 'xeno',
    name: 'Xeno',
    tagline: 'High-throughput execution profile with Drawing ESP & CoreGui animation support.',
    compatibilityScore: 'Verified Live',
    frameOverhead: '< 0.28 ms / frame',
    downloadUrl: EXECUTOR_URLS.xeno,
    recommendedFlags: ['Drawing.new = true', 'UIScale = auto', 'SmoothTweens = true'],
    supportedApis: ['Drawing.new', 'CoreGui', 'RunService.RenderStepped', 'UserInputService', 'TweenService'],
    notes:
      'Runs the released RGB SCRIPTS GUI seamlessly with responsive viewport scaling and Drawing toggles.',
  },
];

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

export function isValidSemver(version: string): boolean {
  return SEMVER_REGEX.test(version.trim());
}

export function compareSemver(a: string, b: string): number {
  const matchA = SEMVER_REGEX.exec(a.trim());
  const matchB = SEMVER_REGEX.exec(b.trim());
  if (!matchA || !matchB) {
    return a.localeCompare(b);
  }
  const partsA = [Number(matchA[1]), Number(matchA[2]), Number(matchA[3])];
  const partsB = [Number(matchB[1]), Number(matchB[2]), Number(matchB[3])];
  for (let i = 0; i < 3; i += 1) {
    if (partsA[i] !== partsB[i]) {
      return partsA[i] - partsB[i];
    }
  }
  return 0;
}

export function sortReleasesDesc(releases: ScriptRelease[]): ScriptRelease[] {
  return [...releases].sort((a, b) => compareSemver(b.version, a.version));
}

export function getLatestVersion(releases: ScriptRelease[]): string {
  if (releases.length === 0) {
    return '1.4.3';
  }
  const sorted = sortReleasesDesc(releases);
  return sorted[0].version;
}

export function suggestNextVersion(
  currentVersion: string,
  hasExistingReleases = true
): string {
  if (!hasExistingReleases) {
    return '1.0.0';
  }
  const match = SEMVER_REGEX.exec(currentVersion.trim());
  if (!match) {
    return '1.0.1';
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]) + 1;
  return `${major}.${minor}.${patch}`;
}

export interface FlattenedChange extends ScriptChangeItem {
  version: string;
  codename: string;
}

export function flattenChanges(releases: ScriptRelease[]): FlattenedChange[] {
  const sorted = sortReleasesDesc(releases);
  return sorted.flatMap((release) =>
    release.changes.map((change) => ({
      ...change,
      version: release.version,
      codename: release.codename,
    }))
  );
}

export function filterChanges(
  changes: FlattenedChange[],
  options: {
    query?: string;
    category?: UpdateCategory | 'All';
  }
): FlattenedChange[] {
  const normalizedQuery = (options.query ?? '').trim().toLowerCase();
  const category = options.category ?? 'All';

  return changes.filter((item) => {
    if (category !== 'All' && item.category !== category) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const haystack = [
        item.title,
        item.description,
        item.category,
        item.version,
        item.codename,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    }

    return true;
  });
}

export function validateNewUpdate(input: NewUpdateInput): { valid: boolean; error?: string } {
  const version = input.version.trim();
  if (
    version.length < SCRIPT_UPDATE_LIMITS.VERSION_MIN ||
    version.length > SCRIPT_UPDATE_LIMITS.VERSION_MAX ||
    !SCRIPT_UPDATE_LIMITS.VERSION_PATTERN.test(version)
  ) {
    return { valid: false, error: 'Version must follow semantic format (e.g. 1.0.0).' };
  }
  const codename = input.codename.trim() || 'Script Patch';
  if (codename.length > SCRIPT_UPDATE_LIMITS.CODENAME_MAX) {
    return { valid: false, error: 'Codename must be 60 characters or fewer.' };
  }
  const title = input.title.trim();
  if (title.length < SCRIPT_UPDATE_LIMITS.TITLE_MIN || title.length > SCRIPT_UPDATE_LIMITS.TITLE_MAX) {
    return {
      valid: false,
      error: `Update title must be between ${SCRIPT_UPDATE_LIMITS.TITLE_MIN} and ${SCRIPT_UPDATE_LIMITS.TITLE_MAX} characters.`,
    };
  }
  const description = input.description.trim();
  if (
    description.length < SCRIPT_UPDATE_LIMITS.DESCRIPTION_MIN ||
    description.length > SCRIPT_UPDATE_LIMITS.DESCRIPTION_MAX
  ) {
    return {
      valid: false,
      error: `Description must be between ${SCRIPT_UPDATE_LIMITS.DESCRIPTION_MIN} and ${SCRIPT_UPDATE_LIMITS.DESCRIPTION_MAX} characters.`,
    };
  }
  if (
    input.category !== 'Added' &&
    input.category !== 'Improved' &&
    input.category !== 'Fixed' &&
    input.category !== 'Security'
  ) {
    return { valid: false, error: 'Category must be Added, Improved, Fixed, or Security.' };
  }
  return { valid: true };
}

export interface FirestoreScriptUpdateRecord {
  id: string;
  version: string;
  codename: string;
  title: string;
  description: string;
  category: UpdateCategory;
  createdAtIso: string;
}

export function groupFirestoreUpdatesIntoReleases(
  records: FirestoreScriptUpdateRecord[]
): ScriptRelease[] {
  if (records.length === 0) {
    return [];
  }

  const sortedRecords = [...records].sort((a, b) => {
    const timeDiff = Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso);
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) {
      return timeDiff;
    }
    return b.id.localeCompare(a.id);
  });

  const byVersion = new Map<string, ScriptRelease>();
  for (const record of sortedRecords) {
    const cleanVersion = record.version.trim();
    const changeItem: ScriptChangeItem = {
      id: record.id,
      title: record.title,
      description: record.description,
      category: record.category,
      timestamp: record.createdAtIso,
    };

    const existing = byVersion.get(cleanVersion);
    if (existing) {
      existing.changes.push(changeItem);
    } else {
      byVersion.set(cleanVersion, {
        version: cleanVersion,
        codename: record.codename || 'Script Update',
        releasedAt: record.createdAtIso,
        summary: record.title,
        isInitial: cleanVersion === '1.0.0',
        changes: [changeItem],
      });
    }
  }

  return sortReleasesDesc(Array.from(byVersion.values()));
}

export function applyNewUpdate(
  releases: ScriptRelease[],
  input: NewUpdateInput,
  nowIso: string
): ScriptRelease[] {
  const cleanVersion = input.version.trim();
  const newChange: ScriptChangeItem = {
    id: `rgb-${cleanVersion.replace(/\./g, '')}-${Date.now()}`,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    timestamp: nowIso,
  };

  const existingIndex = releases.findIndex((r) => r.version === cleanVersion);
  if (existingIndex >= 0) {
    const updated = releases.map((release, idx) =>
      idx === existingIndex
        ? {
            ...release,
            releasedAt: nowIso,
            changes: [newChange, ...release.changes],
          }
        : release
    );
    return sortReleasesDesc(updated);
  }

  const createdRelease: ScriptRelease = {
    version: cleanVersion,
    codename: input.codename.trim() || 'Live Patch',
    releasedAt: nowIso,
    summary: input.title.trim(),
    changes: [newChange],
  };

  return sortReleasesDesc([createdRelease, ...releases]);
}

export function generateLuaScript(version: string, executor: ExecutorId): string {
  const targetLabel = executor === 'solara' ? 'Solara' : 'Xeno';
  const executorFlag = executor === 'solara' ? 'SafeYield = true' : 'PoolDrawings = true';

  return `--[[
  RGB Script Hub — Version ${version} (COMING SOON)
  Target Executor Profile: ${targetLabel} (Solara & Xeno Supported)
  ${CREDITS_LINE}
]]

local getEnv = (typeof(getgenv) == "function" and getgenv()) or _G
if getEnv.__RGB_CLEANUP then
    pcall(getEnv.__RGB_CLEANUP)
end

local executorName = (typeof(identifyexecutor) == "function" and identifyexecutor()) or "${targetLabel}"
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

getEnv.RGB_CONFIG = {
    Version = "${version}",
    TargetProfile = "${targetLabel}",
    DetectedExecutor = tostring(executorName),
    ${executorFlag},
    IsolateEnv = true,
    AutoReattach = true,
}

local connections = {}

local function safeConnect(signal, callback)
    local conn = signal:Connect(callback)
    table.insert(connections, conn)
    return conn
end

getEnv.__RGB_CLEANUP = function()
    for _, conn in ipairs(connections) do
        if conn.Connected then
            conn:Disconnect()
        end
    end
    table.clear(connections)
end

local function bootstrapRGB()
    local localPlayer = Players.LocalPlayer
    if not localPlayer then return end

    safeConnect(RunService.Heartbeat, function()
        -- RGB v${version} lightweight frame dispatcher (${targetLabel})
    end)

    print(string.format("[RGB v%s] Ready on %s — %s", getEnv.RGB_CONFIG.Version, executorName, "${CREDITS_LINE}"))
end

bootstrapRGB()
`;
}

export function formatRelativeTime(isoString: string, referenceMs = Date.now()): string {
  const parsed = Date.parse(isoString);
  if (Number.isNaN(parsed)) {
    return isoString;
  }
  const diffSeconds = Math.max(0, Math.floor((referenceMs - parsed) / 1000));
  if (diffSeconds < 60) {
    return diffSeconds <= 5 ? 'Just now' : `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return new Date(parsed).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
