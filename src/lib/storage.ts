// ============================================================
// localStorage helpers — all keys prefixed with financeOS_
// ============================================================

export const LS_KEYS = {
  transactions: 'financeOS_transactions',
  accounts: 'financeOS_accounts',
  budgets: 'financeOS_budgets',
  theme: 'financeOS_theme',
  lang: 'financeOS_lang',
  firebase: 'financeOS_firebase_config',
  user: 'financeOS_user',
  pluggy: 'financeOS_pluggy_creds',
  pluggyItems: 'financeOS_pluggy_items',
  seeded: 'financeOS_seeded',
  sidebarCollapsed: 'financeOS_sidebar_collapsed',
} as const;

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('lsSet failed', key, e);
  }
}

export function lsRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function lsClearAll(): void {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('financeOS_')) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// ============================================================
// XOR + base64 obfuscation for Pluggy creds at rest.
// This is NOT real encryption — it prevents casual inspection
// of localStorage. Never log the decrypted value.
// ============================================================

const XOR_KEY = 'financeOS::pluggy::v1';

function xor(input: string, key: string): string {
  let out = '';
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return out;
}

export function obfuscate(plain: string): string {
  if (!plain) return '';
  try {
    return btoa(unescape(encodeURIComponent(xor(plain, XOR_KEY))));
  } catch {
    return '';
  }
}

export function deobfuscate(encoded: string): string {
  if (!encoded) return '';
  try {
    return xor(decodeURIComponent(escape(atob(encoded))), XOR_KEY);
  } catch {
    return '';
  }
}
