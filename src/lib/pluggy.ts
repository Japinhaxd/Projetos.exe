import type { Account, PluggyCredentials, Transaction } from '../types';
import { round2 } from './money';
import { LS_KEYS, lsGet, lsSet } from './storage';

const API = 'https://api.pluggy.ai';

interface PluggyItem {
  id: string;
  itemId?: string;
  connector?: { name?: string; imageUrl?: string };
  status?: string;
}

interface PluggyAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  itemId: string;
}

interface PluggyTransaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  date: string;
  type: 'CREDIT' | 'DEBIT';
  category?: string;
}

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

// ==========================================================
// Auth — NEVER log responses that could contain credentials.
// ==========================================================
export async function getApiKey(creds: PluggyCredentials): Promise<string> {
  const res = await fetch(`${API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
    }),
  });
  if (!res.ok) throw new Error('Pluggy auth failed');
  const data = await res.json();
  return data.apiKey as string;
}

export async function getConnectToken(apiKey: string): Promise<string> {
  const res = await fetch(`${API}/connect_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Pluggy connect token failed');
  const data = await res.json();
  return data.accessToken as string;
}

export async function fetchAccounts(
  apiKey: string,
  itemId: string,
): Promise<PluggyAccount[]> {
  const res = await fetch(`${API}/accounts?itemId=${encodeURIComponent(itemId)}`, {
    headers: { 'X-API-KEY': apiKey },
  });
  if (!res.ok) throw new Error('Pluggy accounts fetch failed');
  const data = await res.json();
  return (data.results || []) as PluggyAccount[];
}

export async function fetchTransactions(
  apiKey: string,
  accountId: string,
  from?: string,
): Promise<PluggyTransaction[]> {
  const params = new URLSearchParams({ accountId });
  if (from) params.set('from', from);
  const res = await fetch(`${API}/transactions?${params.toString()}`, {
    headers: { 'X-API-KEY': apiKey },
  });
  if (!res.ok) throw new Error('Pluggy transactions fetch failed');
  const data = await res.json();
  return (data.results || []) as PluggyTransaction[];
}

// ==========================================================
// Connect widget
// ==========================================================
export function openPluggyConnect(
  connectToken: string,
  onSuccess: (itemId: string, connectorName?: string, connectorLogo?: string) => void,
  onError: (err: any) => void,
) {
  if (typeof window === 'undefined' || !window.PluggyConnect) {
    onError(new Error('Pluggy SDK not loaded'));
    return;
  }
  const pluggyConnect = new window.PluggyConnect({
    connectToken,
    includeSandbox: true,
    onSuccess: ({ item }: { item: PluggyItem }) => {
      onSuccess(
        item.id || (item as any).itemId || '',
        item.connector?.name,
        item.connector?.imageUrl,
      );
    },
    onError,
    onClose: () => {},
  });
  pluggyConnect.init();
}

// ==========================================================
// Sync logic — idempotent, dedupes by externalId, never
// overwrites manually edited transactions.
// ==========================================================
export function mapPluggyCategory(pluggyCat?: string): string {
  if (!pluggyCat) return 'Other';
  const c = pluggyCat.toLowerCase();
  if (/(food|restaurant|grocer|mercado|aliment)/.test(c)) return 'Food';
  if (/(transport|uber|gas|taxi|bus|metro)/.test(c)) return 'Transport';
  if (/(home|rent|housing|aluguel|util)/.test(c)) return 'Housing';
  if (/(health|pharma|medic|saúde|hospital)/.test(c)) return 'Health';
  if (/(entertain|movie|music|spotify|netflix|lazer)/.test(c)) return 'Entertainment';
  if (/(salary|payroll|salário)/.test(c)) return 'Salary';
  if (/(invest|stock|fund)/.test(c)) return 'Investment';
  return 'Other';
}

export interface SyncResult {
  accountsSynced: number;
  transactionsAdded: number;
  transactionsSkipped: number;
}

/**
 * Sync one Pluggy item: fetches accounts and last 90 days of transactions.
 * Upserts to localStorage via the passed helpers.
 */
export async function syncPluggyItem(
  apiKey: string,
  itemId: string,
  existingAccounts: Account[],
  existingTransactions: Transaction[],
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Account,
  addTransactionsBatch: (list: Omit<Transaction, 'id' | 'createdAt'>[]) => void,
  updateAccount: (id: string, patch: Partial<Account>) => void,
  connectorName?: string,
  connectorLogo?: string,
): Promise<SyncResult> {
  const result: SyncResult = {
    accountsSynced: 0,
    transactionsAdded: 0,
    transactionsSkipped: 0,
  };

  const pluggyAccounts = await fetchAccounts(apiKey, itemId);
  const from = new Date(Date.now() - 90 * 86_400_000).toISOString().split('T')[0];

  const existingExtIds = new Set(
    existingTransactions.map((t) => t.externalId).filter(Boolean) as string[],
  );

  for (const pa of pluggyAccounts) {
    result.accountsSynced++;
    // Find or create the account
    let acc = existingAccounts.find(
      (a) => a.pluggyItemId === itemId && a.pluggyAccountId === pa.id,
    );
    if (!acc) {
      acc = addAccount({
        name: pa.name || connectorName || 'Banco',
        type: pa.type?.toLowerCase().includes('credit') ? 'credit' : 'checking',
        initialBalance: round2(pa.balance || 0),
        color: '#3b82f6',
        isConnected: true,
        pluggyItemId: itemId,
        pluggyAccountId: pa.id,
        bankLogo: connectorLogo,
        bankName: connectorName,
        lastSynced: new Date().toISOString(),
      });
    } else {
      updateAccount(acc.id, {
        lastSynced: new Date().toISOString(),
        bankLogo: connectorLogo || acc.bankLogo,
        bankName: connectorName || acc.bankName,
      });
    }

    const pluggyTxs = await fetchTransactions(apiKey, pa.id, from);
    const toAdd: Omit<Transaction, 'id' | 'createdAt'>[] = [];

    for (const pt of pluggyTxs) {
      if (existingExtIds.has(pt.id)) {
        result.transactionsSkipped++;
        continue;
      }
      // Skip if a manually-edited version exists with same externalId (shouldn't happen)
      const manuallyEdited = existingTransactions.find(
        (t) => t.externalId === pt.id && t.isManuallyEdited,
      );
      if (manuallyEdited) {
        result.transactionsSkipped++;
        continue;
      }
      const type: Transaction['type'] = pt.type === 'CREDIT' ? 'income' : 'expense';
      toAdd.push({
        type,
        amount: round2(Math.abs(pt.amount)),
        category: mapPluggyCategory(pt.category),
        accountId: acc.id,
        date: pt.date,
        description: pt.description || '—',
        tags: [],
        recurrence: 'none',
        externalId: pt.id,
        source: 'pluggy',
      });
      existingExtIds.add(pt.id);
    }
    if (toAdd.length > 0) {
      addTransactionsBatch(toAdd);
      result.transactionsAdded += toAdd.length;
    }
  }

  // Remember the itemId so we can sync again later
  const items = lsGet<{ id: string; connectorName?: string; connectorLogo?: string }[]>(
    LS_KEYS.pluggyItems,
    [],
  );
  if (!items.find((x) => x.id === itemId)) {
    lsSet(LS_KEYS.pluggyItems, [
      ...items,
      { id: itemId, connectorName, connectorLogo },
    ]);
  }

  return result;
}

export function getStoredPluggyItems(): {
  id: string;
  connectorName?: string;
  connectorLogo?: string;
}[] {
  return lsGet(LS_KEYS.pluggyItems, []);
}

export function removeStoredPluggyItem(itemId: string) {
  const items = getStoredPluggyItems();
  lsSet(
    LS_KEYS.pluggyItems,
    items.filter((x) => x.id !== itemId),
  );
}
