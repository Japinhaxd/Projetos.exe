import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { AuthUser } from '../types';

// ============================================================
// Firebase configuration — sourced exclusively from Vite env
// vars at build time. There is NO runtime config modal anymore;
// keys live in `.env` / hosting environment.
// ============================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

/**
 * True only when every required env var is present at build time.
 * Login UI uses this to gracefully fall back to "local mode" when
 * Firebase has not been provisioned yet.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

/**
 * Initialize Firebase using the env-driven config. Idempotent — safe
 * to call multiple times. Throws if env vars are missing.
 */
export function initFirebase(): Auth {
  if (_auth) return _auth;
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase environment variables are missing (VITE_FIREBASE_*).',
    );
  }
  _app = getApps().length
    ? getApps()[0]
    : initializeApp({
        apiKey: firebaseConfig.apiKey!,
        authDomain: firebaseConfig.authDomain!,
        projectId: firebaseConfig.projectId!,
        appId: firebaseConfig.appId!,
        messagingSenderId: firebaseConfig.messagingSenderId,
        storageBucket: firebaseConfig.storageBucket,
      });
  _auth = getAuth(_app);
  setPersistence(_auth, browserLocalPersistence).catch(() => {});
  return _auth;
}

export function getAuthInstance(): Auth | null {
  return _auth;
}

function userToAuthUser(u: User): AuthUser {
  return {
    uid: u.uid,
    displayName: u.displayName || u.email?.split('@')[0] || 'User',
    email: u.email || '',
    photoURL: u.photoURL || '',
    provider: 'google',
  };
}

export async function loginWithGoogle(): Promise<AuthUser> {
  const auth = initFirebase();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return userToAuthUser(cred.user);
}

export async function firebaseLogout(): Promise<void> {
  if (_auth) {
    try {
      await signOut(_auth);
    } catch {}
  }
}

export function subscribeAuth(
  cb: (user: AuthUser | null) => void,
): () => void {
  if (!_auth) return () => {};
  return onAuthStateChanged(_auth, (u) => {
    cb(u ? userToAuthUser(u) : null);
  });
}
