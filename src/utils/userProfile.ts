import type { ExecutorId } from '../types/script';

export const USER_PROFILE_LIMITS = {
  UID_MAX: 128,
  UID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  DISPLAY_NAME_MAX: 120,
  EMAIL_MAX: 200,
  PHOTO_URL_MAX: 500,
} as const;

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredExecutor: ExecutorId;
  createdAt: unknown;
  updatedAt: unknown;
}

export function sanitizeDisplayName(rawName: string | null | undefined, email: string | null | undefined): string {
  const candidate = (rawName ?? '').trim();
  if (candidate.length >= 1) {
    return candidate.slice(0, USER_PROFILE_LIMITS.DISPLAY_NAME_MAX);
  }
  const fallback = (email ?? 'RGB User').split('@')[0]?.trim() || 'RGB User';
  return fallback.slice(0, USER_PROFILE_LIMITS.DISPLAY_NAME_MAX);
}

export function sanitizePhotoUrl(rawUrl: string | null | undefined): string | undefined {
  const trimmed = (rawUrl ?? '').trim();
  if (!trimmed || trimmed.length > USER_PROFILE_LIMITS.PHOTO_URL_MAX) {
    return undefined;
  }
  return trimmed;
}

export function validateProfilePayload(payload: {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredExecutor: ExecutorId;
}): { valid: boolean; error?: string } {
  if (!USER_PROFILE_LIMITS.UID_PATTERN.test(payload.uid) || payload.uid.length > USER_PROFILE_LIMITS.UID_MAX) {
    return { valid: false, error: 'Invalid user ID format.' };
  }
  const name = payload.displayName.trim();
  if (name.length < 1 || name.length > USER_PROFILE_LIMITS.DISPLAY_NAME_MAX) {
    return { valid: false, error: 'Display name must be between 1 and 120 characters.' };
  }
  const email = payload.email.trim();
  if (email.length < 3 || email.length > USER_PROFILE_LIMITS.EMAIL_MAX) {
    return { valid: false, error: 'Email must be between 3 and 200 characters.' };
  }
  if (payload.photoURL && payload.photoURL.length > USER_PROFILE_LIMITS.PHOTO_URL_MAX) {
    return { valid: false, error: 'Photo URL exceeds 500 characters.' };
  }
  if (payload.preferredExecutor !== 'solara' && payload.preferredExecutor !== 'xeno') {
    return { valid: false, error: 'Preferred executor must be Solara or Xeno.' };
  }
  return { valid: true };
}
