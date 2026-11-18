import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../lib/firebase';
import type { ExecutorId } from '../types/script';
import {
  type UserProfileRecord,
  sanitizeDisplayName,
  sanitizePhotoUrl,
  validateProfilePayload,
} from '../utils/userProfile';

export function useAuthProfile(
  activeExecutor: ExecutorId,
  onSyncExecutor: (executor: ExecutorId) => void
) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const activeExecutorRef = useRef<ExecutorId>(activeExecutor);

  useEffect(() => {
    activeExecutorRef.current = activeExecutor;
  }, [activeExecutor]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Only subscribe to Firestore user profile when auth is ready and user is signed in
  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    const userPath = `users/${user.uid}`;
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfileRecord;
          setProfile(data);
          if (data.preferredExecutor === 'solara' || data.preferredExecutor === 'xeno') {
            onSyncExecutor(data.preferredExecutor);
          }
          return;
        }

        // First-time Google sign-in: provision UserProfile document
        const fallbackExecutor = activeExecutorRef.current;
        const displayName = sanitizeDisplayName(user.displayName, user.email);
        const email = (user.email ?? '').trim();
        const photoURL = sanitizePhotoUrl(user.photoURL);
        const validation = validateProfilePayload({
          uid: user.uid,
          displayName,
          email,
          photoURL,
          preferredExecutor: fallbackExecutor,
        });
        if (!validation.valid) {
          setAuthError(validation.error ?? 'Unable to initialize profile.');
          return;
        }

        const payload: Record<string, unknown> = {
          uid: user.uid,
          displayName,
          email,
          preferredExecutor: fallbackExecutor,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (photoURL) {
          payload.photoURL = photoURL;
        }

        try {
          await setDoc(userDocRef, payload);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, userPath);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, userPath);
      }
    );

    return () => unsubscribe();
  }, [authReady, user, onSyncExecutor]);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = (error as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in popup was closed before completing.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Please allow popups for this site to sign in with Google.');
      } else {
        setAuthError('Unable to sign in with Google right now. Please try again.');
      }
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutAccount = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOut(auth);
      setProfile(null);
    } catch {
      setAuthError('Unable to sign out right now.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const updatePreferredExecutor = useCallback(
    async (executor: ExecutorId) => {
      onSyncExecutor(executor);
      if (!user || !profile) {
        return;
      }

      const userPath = `users/${user.uid}`;
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userDocRef, {
          preferredExecutor: executor,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      }
    },
    [user, profile, onSyncExecutor]
  );

  return {
    user,
    authReady,
    profile,
    authBusy,
    authError,
    signInWithGoogle,
    signOutAccount,
    updatePreferredExecutor,
  };
}
