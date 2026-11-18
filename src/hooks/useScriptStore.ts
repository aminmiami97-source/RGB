import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OperationType, db, handleFirestoreError } from '../lib/firebase';
import type {
  ExecutorId,
  LiveScriptState,
  NewUpdateInput,
  OfficialScriptInput,
  ScriptRelease,
  UpdateCategory,
} from '../types/script';
import {
  DEFAULT_OFFICIAL_SCRIPT,
  DEFAULT_RELEASE_MESSAGE,
  DEFAULT_RELEASE_TITLE,
  DEFAULT_SCRIPT_UPDATED_AT,
  DEFAULT_SCRIPT_VERSION,
} from '../utils/officialScript';
import {
  type FirestoreScriptUpdateRecord,
  INITIAL_RELEASES,
  canUserPublishUpdates,
  groupFirestoreUpdatesIntoReleases,
  validateNewUpdate,
  validateOfficialScriptInput,
} from '../utils/scriptData';

const LEGACY_STORAGE_KEYS = ['rgb_script_releases_v1', 'rgb_script_releases_v2'];
const EXECUTOR_KEY = 'rgb_active_executor_v1';
const RELEASE_DISMISSED_KEY = 'rgb_release_notice_dismissed_v1';

interface PublisherUser {
  uid: string;
  email?: string | null;
  emailVerified?: boolean | null;
}

function loadStoredExecutor(): ExecutorId {
  try {
    const raw = window.localStorage.getItem(EXECUTOR_KEY);
    return raw === 'xeno' ? 'xeno' : 'solara';
  } catch {
    return 'solara';
  }
}

function parseTimestampIso(value: unknown, fallback = new Date().toISOString()): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return value;
  }
  return fallback;
}

function mapSnapshotDocsToReleases(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>
): ScriptRelease[] {
  const records: FirestoreScriptUpdateRecord[] = [];
  for (const item of docs) {
    const data = item.data();
    const version = typeof data.version === 'string' ? data.version : '1.0.0';
    const codename = typeof data.codename === 'string' ? data.codename : 'Script Patch';
    const title = typeof data.title === 'string' ? data.title : '';
    const description = typeof data.description === 'string' ? data.description : '';
    const rawCategory = data.category;
    const category: UpdateCategory =
      rawCategory === 'Added' ||
      rawCategory === 'Improved' ||
      rawCategory === 'Fixed' ||
      rawCategory === 'Security'
        ? rawCategory
        : 'Added';

    if (!title || !description) {
      continue;
    }

    records.push({
      id: item.id,
      version,
      codename,
      title,
      description,
      category,
      createdAtIso: parseTimestampIso(data.createdAt),
    });
  }
  return groupFirestoreUpdatesIntoReleases(records);
}

const DEFAULT_LIVE_SCRIPT: LiveScriptState = {
  version: DEFAULT_SCRIPT_VERSION,
  releaseTitle: DEFAULT_RELEASE_TITLE,
  releaseMessage: DEFAULT_RELEASE_MESSAGE,
  code: DEFAULT_OFFICIAL_SCRIPT,
  updatedAt: DEFAULT_SCRIPT_UPDATED_AT,
  isFromCloud: false,
};

function mapScriptConfigSnapshot(data: Record<string, unknown> | undefined): LiveScriptState {
  if (!data || data.published !== true) {
    return DEFAULT_LIVE_SCRIPT;
  }
  const version =
    typeof data.version === 'string' && data.version.trim()
      ? data.version.trim()
      : DEFAULT_SCRIPT_VERSION;
  const releaseTitle =
    typeof data.releaseTitle === 'string' && data.releaseTitle.trim()
      ? data.releaseTitle.trim()
      : DEFAULT_RELEASE_TITLE;
  const releaseMessage =
    typeof data.releaseMessage === 'string' && data.releaseMessage.trim()
      ? data.releaseMessage.trim()
      : DEFAULT_RELEASE_MESSAGE;
  const code =
    typeof data.code === 'string' && data.code.trim().length >= 10
      ? data.code
      : DEFAULT_OFFICIAL_SCRIPT;

  return {
    version,
    releaseTitle,
    releaseMessage,
    code,
    updatedAt: parseTimestampIso(data.updatedAt, DEFAULT_SCRIPT_UPDATED_AT),
    isFromCloud: true,
  };
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function useScriptStore() {
  const [releases, setReleases] = useState<ScriptRelease[]>(INITIAL_RELEASES);
  const [updatesLoading, setUpdatesLoading] = useState<boolean>(true);
  const [liveScript, setLiveScript] = useState<LiveScriptState>(DEFAULT_LIVE_SCRIPT);
  const [scriptLoading, setScriptLoading] = useState<boolean>(true);
  const [activeExecutor, setActiveExecutorState] = useState<ExecutorId>(loadStoredExecutor);
  const [liveSyncEnabled, setLiveSyncEnabled] = useState<boolean>(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => new Date().toISOString());
  const [dismissedReleaseKey, setDismissedReleaseKey] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(RELEASE_DISMISSED_KEY);
    } catch {
      return null;
    }
  });
  const [copyFeedback, setCopyFeedback] = useState<{
    visible: boolean;
    executor: ExecutorId;
    version: string;
    copiedAt: number;
  } | null>(null);

  const feedbackTimerRef = useRef<number | null>(null);

  const latestVersion = useMemo(() => liveScript.version, [liveScript.version]);

  const currentReleaseKey = `${liveScript.version}::${liveScript.updatedAt}`;
  const releaseNoticeVisible = dismissedReleaseKey !== currentReleaseKey;

  const dismissReleaseNotice = useCallback(() => {
    setDismissedReleaseKey(currentReleaseKey);
    try {
      window.sessionStorage.setItem(RELEASE_DISMISSED_KEY, currentReleaseKey);
    } catch {
      // Ignore storage errors
    }
  }, [currentReleaseKey]);

  // Clear any legacy seeded localStorage entries so empty update log starts clean
  useEffect(() => {
    try {
      for (const key of LEGACY_STORAGE_KEYS) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Real-time Firestore listener for public published script updates
  useEffect(() => {
    if (!liveSyncEnabled) {
      return;
    }

    const updatesQuery = query(collection(db, 'updates'), where('published', '==', true));
    const unsubscribe = onSnapshot(
      updatesQuery,
      (snapshot) => {
        setReleases(mapSnapshotDocsToReleases(snapshot.docs));
        setLastSyncedAt(new Date().toISOString());
        setUpdatesLoading(false);
      },
      (err) => {
        setUpdatesLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'updates');
      }
    );

    return () => unsubscribe();
  }, [liveSyncEnabled]);

  // Real-time Firestore listener for the live official script (/scriptConfig/live)
  useEffect(() => {
    if (!liveSyncEnabled) {
      return;
    }

    const scriptDocRef = doc(db, 'scriptConfig', 'live');
    const unsubscribe = onSnapshot(
      scriptDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setLiveScript(mapScriptConfigSnapshot(snapshot.data() as Record<string, unknown>));
        } else {
          setLiveScript(DEFAULT_LIVE_SCRIPT);
        }
        setLastSyncedAt(new Date().toISOString());
        setScriptLoading(false);
      },
      (err) => {
        setScriptLoading(false);
        handleFirestoreError(err, OperationType.GET, 'scriptConfig/live');
      }
    );

    return () => unsubscribe();
  }, [liveSyncEnabled]);

  const setActiveExecutor = useCallback((executor: ExecutorId) => {
    setActiveExecutorState(executor);
    try {
      window.localStorage.setItem(EXECUTOR_KEY, executor);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const publishUpdate = useCallback(
    async (input: NewUpdateInput, publisher: PublisherUser | null | undefined) => {
      if (!canUserPublishUpdates(publisher) || !publisher?.uid) {
        throw new Error('Only aminmiami97@gmail.com is authorized to add updates.');
      }

      const validation = validateNewUpdate(input);
      if (!validation.valid) {
        throw new Error(validation.error ?? 'Invalid update payload.');
      }

      const suffix = Math.random().toString(36).slice(2, 8);
      const updateId = `upd-${Date.now()}-${suffix}`;
      const updatePath = `updates/${updateId}`;
      const payload = {
        id: updateId,
        version: input.version.trim(),
        codename: (input.codename.trim() || 'Script Patch').slice(0, 60),
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        published: true,
        authorUid: publisher.uid,
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, 'updates', updateId), payload);
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, updatePath);
      }
    },
    []
  );

  const deleteUpdate = useCallback(
    async (updateId: string, publisher: PublisherUser | null | undefined) => {
      if (!canUserPublishUpdates(publisher)) {
        throw new Error('Only aminmiami97@gmail.com is authorized to remove updates.');
      }
      const updatePath = `updates/${updateId}`;
      try {
        await deleteDoc(doc(db, 'updates', updateId));
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, updatePath);
      }
    },
    []
  );

  const updateOfficialScript = useCallback(
    async (input: OfficialScriptInput, publisher: PublisherUser | null | undefined) => {
      if (!canUserPublishUpdates(publisher) || !publisher?.uid) {
        throw new Error('Only aminmiami97@gmail.com is authorized to edit the official script.');
      }

      const check = validateOfficialScriptInput(input);
      if (!check.valid) {
        throw new Error(check.error ?? 'Invalid script configuration.');
      }

      const payload = {
        id: 'live',
        version: input.version.trim(),
        releaseTitle: input.releaseTitle.trim(),
        releaseMessage: input.releaseMessage.trim(),
        code: input.code,
        published: true,
        updatedByUid: publisher.uid,
        updatedAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, 'scriptConfig', 'live'), payload, { merge: false });
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'scriptConfig/live');
      }
    },
    []
  );

  const refreshNow = useCallback(async () => {
    const updatesQuery = query(collection(db, 'updates'), where('published', '==', true));
    try {
      const [updatesSnapshot, scriptSnapshot] = await Promise.all([
        getDocsFromServer(updatesQuery),
        getDocFromServer(doc(db, 'scriptConfig', 'live')),
      ]);
      setReleases(mapSnapshotDocsToReleases(updatesSnapshot.docs));
      if (scriptSnapshot.exists()) {
        setLiveScript(mapScriptConfigSnapshot(scriptSnapshot.data() as Record<string, unknown>));
      } else {
        setLiveScript(DEFAULT_LIVE_SCRIPT);
      }
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'updates');
    }
  }, []);

  const copyScriptToPC = useCallback(
    async (overrideExecutor?: ExecutorId) => {
      const target = overrideExecutor ?? activeExecutor;
      await copyTextWithFallback(liveScript.code);

      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }

      setCopyFeedback({
        visible: true,
        executor: target,
        version: liveScript.version,
        copiedAt: Date.now(),
      });

      feedbackTimerRef.current = window.setTimeout(() => {
        setCopyFeedback((prev) => (prev ? { ...prev, visible: false } : null));
      }, 6000);

      return liveScript.code;
    },
    [activeExecutor, liveScript.code, liveScript.version]
  );

  const downloadScriptToPC = useCallback(() => {
    try {
      const cleanVersion = liveScript.version.replace(/[^a-zA-Z0-9._-]+/g, '_');
      const blob = new Blob([liveScript.code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `RGB_SCRIPTS_${cleanVersion}.lua`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // Clipboard fallback remains available via copyScriptToPC
    }
  }, [liveScript.code, liveScript.version]);

  const dismissCopyFeedback = useCallback(() => {
    setCopyFeedback(null);
  }, []);

  return {
    releases,
    updatesLoading,
    liveScript,
    scriptLoading,
    latestVersion,
    activeExecutor,
    setActiveExecutor,
    liveSyncEnabled,
    setLiveSyncEnabled,
    lastSyncedAt,
    publishUpdate,
    deleteUpdate,
    updateOfficialScript,
    refreshNow,
    copyScriptToPC,
    downloadScriptToPC,
    copyFeedback,
    dismissCopyFeedback,
    releaseNoticeVisible,
    dismissReleaseNotice,
  };
}
