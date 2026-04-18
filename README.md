# Finance OS — Your personal financial OS

A complete, professional personal finance web app with dashboards, transactions,
analytics, budgets, cash flow projection and optional bank integration via
Pluggy (Open Finance Brasil). Dark/light themes, 8 languages, 100% client-side
persistence and Firebase-based authentication (optional).

---

## ✨ Features

### Core
- **Authentication** — Firebase OAuth (Google + Microsoft) or local-only mode
- **Dashboard** — 4 KPI cards (count-up animation), balance-over-time line
  chart, expense-by-category donut, 6-month bars, recent 10 transactions
- **Transactions** — full CRUD in a slide-in drawer with:
  - Income / Expense / Transfer types
  - Split transactions (e.g. R$300 → R$200 Food + R$100 Transport)
  - Bulk actions (delete, recategorize)
  - Filters (date range, category, type, account, tags)
  - Real-time search
  - CSV export
  - Inline edit via pencil icon
  - Recurrence (daily / weekly / monthly)
- **Analytics** — 90-day expense heatmap, category breakdown, top-5 bars,
  month-over-month comparison table, 30-day rolling average, biggest
  expense + most-frequent expense stat cards
- **Cash Flow** — waterfall visualization, 30-day projected balance from
  recurring transactions, next-7-days upcoming panel
- **Budgets** — monthly per-category with color graduation
  (0–60 % blue · 60–85 % amber · 85–100 % orange · over red), health
  score, drag-to-reorder
- **Accounts** — cash / checking / savings / credit / investment, color tags,
  net-worth widget, per-account balance with blue/red color rule
- **Settings** — theme toggle · language selector · Firebase config editor ·
  Pluggy API keys · JSON import/export · clear all · recurring manager

### Visual Identity
- **Dark theme** (default): `#0a0a0f / #111118 / #1e1e2e / #e2e8f0`
- **Light theme**: `#f8fafc / #ffffff / #e2e8f0 / #0f172a`
- **Strict color rule**: blue `#3b82f6` for positive · red `#ef4444` for
  negative · muted gray for zero — applied everywhere (cards, tables, charts,
  inputs, badges, sidebar balance)
- Inter font, Grok/Linear-inspired layout, subtle glow on hover

### Monetary Precision (CRITICAL)
Every amount flows through `round2(x) = Math.round((x + ε) * 100) / 100`:
- Transaction creation, updates, and splits
- Account balances and totals
- Budget tracking
- Chart aggregations
- Pluggy-sourced values (absolute value always rounded)
- Displayed values (via `formatCurrency` with locale-aware `Intl.NumberFormat`)

This means: **the user always gets exactly the number they typed — zero drift.**

### i18n (8 languages)
pt-BR · en-US · es · fr · de · it · zh · ja — full translation map for
labels, nav, chart titles, empty states, toasts, modals, errors. Currency
format auto-adapts per locale (`R$ 1.500,00` for pt-BR, `$1,500.00` for
en-US, `€1.500,00` for es/de/it, `¥…` for zh/ja, etc.).

### Bank Integration (optional — Pluggy)
- Requires user-provided `CLIENT_ID` / `CLIENT_SECRET` in Settings →
  Integrations (stored XOR + base64 obfuscated)
- "Connect via Open Finance" opens Pluggy's official widget (no credentials
  ever touch Finance OS)
- 10 supported banks listed (Nubank, Itaú, Bradesco, Santander, Banco do
  Brasil, Caixa, C6, Inter, BTG, XP)
- Last 90 days of transactions auto-imported and mapped:
  `CREDIT → income`, `DEBIT → expense`
- Green shield "🔒 Secured by Open Finance Brasil" on connected cards
- Deduplication by Pluggy transaction ID; never overwrites manually edited
  transactions
- Auto-sync on app load (silent background) + manual "Sync now" button

### UX
- Keyboard shortcuts: **N** = new transaction · **F** = focus search
- 200 ms slide/fade animations on all modals/drawers
- Count-up animation on KPI numbers
- Toast notifications for every CRUD action
- Empty states with illustration + CTA
- Confirmation modals for every destructive action
- Responsive (desktop-first, tablet-ok)
- Zero console errors on load
- All localStorage keys namespaced with `financeOS_`

---

## 🧰 Stack
- **React 18** + **TypeScript**
- **Vite 6** build
- **Tailwind CSS 3** (CSS-variable driven theming)
- **Recharts** (line, bar, donut, waterfall)
- **Zustand** store with manual localStorage persistence
- **date-fns** for dates
- **Firebase Auth** (OAuth Google + Microsoft)
- **Pluggy API + Connect Widget** (bank integration, optional)
- **lucide-react** icons

---

## 🚀 Quick start

```bash
npm install          # dependencies already installed
npm run build        # bundle → ./dist
pm2 start ecosystem.config.cjs   # serves on :3000 via vite preview
curl http://localhost:3000       # HTTP 200
```

Visit `/` — you'll be redirected to `/login` on first run. Choose any option:
- **Google / Microsoft** — requires Firebase config (paste JSON in the "⚙️
  Set up authentication" modal, or in Settings → Integrations)
- **Continue without login (local mode)** — skips auth, goes straight to
  the dashboard

On first run, 3 months of realistic Brazilian seed data is loaded
(~40+ transactions, 4 accounts, 5 budgets). Clear it in
**Settings → Data → Clear all data**.

---

## 🔗 URLs (functional entry points)

Client-side routes (all SPA, served via `public/_redirects`):
| Path             | Purpose                                  |
|------------------|------------------------------------------|
| `/login`         | Firebase OAuth or local-mode entry       |
| `/`              | Dashboard                                |
| `/transactions`  | List / create / split / bulk / CSV       |
| `/analytics`     | Heatmap, breakdown, MoM, rolling avg     |
| `/cashflow`      | Waterfall + projection + upcoming        |
| `/budgets`       | Monthly budgets with health score        |
| `/accounts`      | Manual + connected (Pluggy) accounts     |
| `/settings`      | Theme, language, auth, Pluggy, data      |

External API calls (only when Pluggy keys are configured):
- `POST https://api.pluggy.ai/auth` — exchange client creds for apiKey
- `POST https://api.pluggy.ai/connect_token` — create widget token
- `GET  https://api.pluggy.ai/accounts?itemId=…` — list bank accounts
- `GET  https://api.pluggy.ai/transactions?accountId=…&from=…` — last 90 d

---

## 📦 Data model

```ts
type TransactionType = 'income' | 'expense' | 'transfer';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;             // always round2()
  category: string;           // Food | Transport | Housing | Health |
                              // Entertainment | Salary | Investment | Other
  accountId: string;
  toAccountId?: string;       // for transfers
  date: string;               // ISO
  description: string;
  tags: string[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  parentId?: string;          // for split children
  externalId?: string;        // Pluggy transaction ID
  isManuallyEdited?: boolean; // protect against sync overwrite
  source?: 'manual' | 'pluggy';
  createdAt: string;
}

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'checking' | 'savings' | 'credit' | 'investment';
  initialBalance: number;     // always round2()
  color: string;
  isConnected?: boolean;
  pluggyItemId?: string;
  pluggyAccountId?: string;
  bankLogo?: string;
  bankName?: string;
  lastSynced?: string;
  createdAt: string;
}

interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;       // always round2()
  month: string;              // YYYY-MM
  order: number;              // drag-to-reorder
}
```

### Storage (all keys prefixed with `financeOS_`)
| Key                             | Content                                |
|---------------------------------|----------------------------------------|
| `financeOS_transactions`        | Transaction[] (JSON)                   |
| `financeOS_accounts`            | Account[] (JSON)                       |
| `financeOS_budgets`             | Budget[] (JSON)                        |
| `financeOS_theme`               | `"dark"` \| `"light"`                  |
| `financeOS_lang`                | SupportedLanguage                      |
| `financeOS_sidebar_collapsed`   | boolean                                |
| `financeOS_user`                | AuthUser                               |
| `financeOS_firebase_config`     | FirebaseConfig                         |
| `financeOS_pluggy_creds`        | `{ clientId, clientSecret }` XOR+b64   |
| `financeOS_pluggy_items`        | `{ id, connectorName, logo }[]`        |
| `financeOS_seeded`              | boolean (first-run seed guard)         |

---

## 🔐 Security notes
- Pluggy credentials are XOR+base64 obfuscated in localStorage (not real
  encryption — enough to prevent casual inspection). The secret is never
  logged anywhere.
- Firebase config is stored as plain JSON — it contains only public keys
  (this is how Firebase is designed to work).
- All network calls to Pluggy happen directly from the browser over HTTPS;
  no backend/intermediary.
- Auto-sync on load runs silently and will not throw visible errors to
  avoid breaking first-time users.

---

## 🧪 Deployment status
- **Platform**: Cloudflare Pages (SPA via `public/_redirects`)
- **Build output**: `./dist`
- **Dev server**: PM2 (`ecosystem.config.cjs`) — `vite preview` on port 3000
- **Tech**: React 18 + TypeScript + Vite + Tailwind + Firebase + Pluggy
- **Last updated**: 2025-04-18

---

## 🗺️ Not implemented / next steps
- Code-splitting (current bundle ~975 kB → 260 kB gzipped; acceptable but
  can be split per route with `React.lazy`)
- Drag-and-drop for transactions (currently only budgets support it)
- Multi-currency per account (currently one currency follows the UI
  language)
- Recurring transactions auto-materialization (projection uses them
  already; actual auto-creation of upcoming transactions would be a next
  step)
- Pluggy webhook-driven sync (currently pull-only; auto + manual button)
