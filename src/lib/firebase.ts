import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';
import {
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { AuthUser, FirebaseConfig } from '../types';

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export function initFirebase(config: FirebaseConfig): Auth {
  if (_app) return _auth!;
  try {
    _app = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          appId: config.appId,
          messagingSenderId: config.messagingSenderId,
          storageBucket: config.storageBucket,
        });
    _auth = getAuth(_app);
    setPersistence(_auth, browserLocalPersistence).catch(() => {});
    return _auth;
  } catch (e) {
    console.error('Firebase init failed', e);
    throw e;
  }
}

export function getAuthInstance(): Auth | null {
  return _auth;
}

function userToAuthUser(u: User, provider: 'google' | 'microsoft'): AuthUser {
  return {
    uid: u.uid,
    displayName: u.displayName || u.email?.split('@')[0] || 'User',
    email: u.email || '',
    photoURL: u.photoURL || '',
    provider,
  };
}

export async function loginWithGoogle(): Promise<AuthUser> {
  if (!_auth) throw new Error('Firebase not initialized');
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(_auth, provider);
  return userToAuthUser(cred.user, 'google');
}

export async function loginWithMicrosoft(): Promise<AuthUser> {
  if (!_auth) throw new Error('Firebase not initialized');
  const provider = new OAuthProvider('microsoft.com');
  provider.setCustomParameters({ prompt: 'consent' });
  const cred = await signInWithPopup(_auth, provider);
  return userToAuthUser(cred.user, 'microsoft');
}

export async function firebaseLogout(): Promise<void> {
  if (_auth) {
    try {
      await signOut(_auth);
    } catch {}
  }
}

export function subscribeAuth(
  cb: (user: AuthUser | null, provider?: 'google' | 'microsoft') => void,
): () => void {
  if (!_auth) return () => {};
  return onAuthStateChanged(_auth, (u) => {
    if (u) {
      const providerData = u.providerData[0]?.providerId || '';
      const provider: 'google' | 'microsoft' = providerData.includes('microsoft')
        ? 'microsoft'
        : 'google';
      cb(userToAuthUser(u, provider), provider);
    } else {
      cb(null);
    }
  });
}

export function validateFirebaseConfig(raw: string): FirebaseConfig | null {
  try {
    // Accept either pure JSON or the common `const firebaseConfig = { ... };` snippet
    let text = raw.trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];
    // Tolerant parse — convert JS-like object to JSON
    text = text
      .replace(/([,{]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      .replace(/'/g, '"')
      .replace(/,\s*}/g, '}');
    const obj = JSON.parse(text);
    if (!obj.apiKey || !obj.authDomain || !obj.projectId || !obj.appId) return null;
    return obj as FirebaseConfig;
  } catch {
    return null;
  }
}
