# Finance OS

## Project Overview
- **Name**: Finance OS
- **Goal**: Professional personal finance management web app with a Grok/Linear-inspired dark UI.
- **Features**: Dashboard KPIs, full transactions CRUD with split & bulk actions, analytics (heatmap, trends, MoM), cash flow waterfall + 30-day projection, budgets with health score, multi-account net worth, settings with JSON import/export.

## URLs
- **Production**: Not deployed yet (local/sandbox only)
- **Local**: http://localhost:3000

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **State**: Zustand with `persist` middleware (localStorage)
- **Styling**: Tailwind CSS 3 (dark-only theme)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Dates**: date-fns
- **Routing**: React Router v7

## Data Architecture
All data is **persisted to localStorage** via Zustand's `persist` middleware under the key `finance-os-storage`. The app is **fully offline** after first load.

### Data Models
- `Account` — `{ id, name, type (cash|checking|savings|credit|investment), initialBalance, color }`
- `Transaction` — `{ id, type (income|expense|transfer), amount, category, accountId, transferToAccountId?, date, description, tags[], recurrence, parentId? }`
- `Budget` — `{ id, category, monthlyLimit, month (YYYY-MM) }`
- `Settings` — `{ currency, dateFormat }`

### Seed data
On first load, 3 months of realistic Brazilian financial data is generated:
- ~R$ 3.500 monthly salary + occasional freelance
- Fixed costs: rent (R$ 1.200), internet, utilities, health plan, subscriptions
- Variable: food, transport, entertainment, healthcare
- Monthly R$ 500 investment transfer
- 5 accounts (Nubank, Itaú, Cash, Credit Card, XP), 50+ transactions, 5 budgets

## Pages & Routes
| Route | Description |
|---|---|
| `/` | **Dashboard** — 4 KPIs, 12-month balance area chart, donut category breakdown, income vs expense bars, recent activity |
| `/transactions` | **Transactions** — table with filters, search, bulk select (delete / recategorize), split modal, CSV export, in-drawer editing |
| `/analytics` | **Analytics** — 16-week heatmap, category progress bars, top 5 ranking, 30-day spending trend + rolling avg, MoM comparison table, biggest/most-frequent stat cards |
| `/cash-flow` | **Cash Flow** — waterfall chart (income sources → expense categories → net), 30-day balance projection from recurring, upcoming 7-day list, color-coded flow breakdown |
| `/budgets` | **Budgets** — per-category monthly limits, color-graduated progress bars (blue → amber → orange → red), health score, drag-to-reorder |
| `/accounts` | **Accounts** — multi-account cards with current balance, this-month in/out, net worth widget, asset vs liability split |
| `/settings` | **Settings** — currency & date format, JSON import/export, clear data, reset to seed, recurring transactions manager, keyboard shortcut reference |

## Visual Design Rules (Strict)
- **Positive** numbers / income / gains → `#3b82f6` (blue)
- **Negative** numbers / expenses / losses → `#ef4444` (red)
- **Zero** → muted gray
- Rule applied consistently across **all** cards, tables, charts, badges, inputs
- Theme: near-black bg (`#0a0a0f`), surface cards (`#111118`), border (`#1e1e2e`), Inter font

## Interactions
- Slide-in drawer for New/Edit Transaction (200ms animation)
- Numbers animate/count up on the Dashboard (spring easing)
- Card hover glow (blue or red per context)
- Toast notifications for every action
- Confirmation dialogs for destructive actions
- Empty states with CTAs
- Drag to reorder budgets
- Keyboard shortcuts: `N` = new transaction, `F` = focus search, `Esc` = close dialogs

## User Guide
1. **First load** — seed data is created automatically. You'll see the Dashboard with 3 months of transactions.
2. **Add a transaction** — press `N` or click "New Transaction" in any page. Choose Income / Expense / Transfer, fill amount, category, account, date. Optionally add tags and recurrence.
3. **Split** — in Transactions, click the scissors icon on any expense to split it across categories (the parts must sum to the original).
4. **Bulk actions** — check multiple rows in the Transactions table to delete or recategorize in bulk.
5. **Budgets** — go to Budgets, create limits per category for the current month. Drag rows to reorder. Watch the health score update.
6. **Backup** — Settings → Export JSON. To restore, Settings → Import JSON.
7. **Reset** — Settings → "Reset to Seed" to restore the demo dataset. Or "Clear All Data" to start empty.

## Project Structure
```
webapp/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── ecosystem.config.cjs       # PM2 config
├── public/_redirects           # SPA fallback for Cloudflare Pages
└── src/
    ├── main.tsx
    ├── App.tsx                 # Router + global shortcuts
    ├── index.css
    ├── types/
    │   └── index.ts            # Transaction, Account, Budget types + categories
    ├── lib/
    │   ├── utils.ts            # formatCurrency, color helpers, CSV, aggregations
    │   └── seed.ts             # 3-month BR seed data generator
    ├── store/
    │   └── useStore.ts         # Zustand store with persist
    ├── components/
    │   ├── TransactionDrawer.tsx
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── PageHeader.tsx
    │   │   └── EmptyState.tsx
    │   └── ui/
    │       ├── Card.tsx
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Drawer.tsx
    │       ├── Modal.tsx       # Modal + Confirm
    │       ├── Toasts.tsx
    │       ├── Money.tsx       # Color-coded animated currency
    │       └── Badge.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── Transactions.tsx    # includes SplitModal
        ├── Analytics.tsx
        ├── CashFlow.tsx
        ├── Budgets.tsx
        ├── Accounts.tsx
        └── Settings.tsx
```

## Deployment
- **Platform**: Cloudflare Pages (static output)
- **Status**: Built locally (`dist/`), served via Vite preview on port 3000
- **Build**: `npm run build` → outputs to `dist/`
- **Start (sandbox)**: `pm2 start ecosystem.config.cjs` (vite preview on port 3000)
- **Deploy**: `npm run deploy` (via Wrangler)
- **Last Updated**: 2026-04-16

## Features Not Yet Implemented
- Multi-currency per transaction (currently a global setting only)
- Goal tracking (savings goals with progress)
- Bill reminders / email notifications
- Data sync across devices (cloud backend)
- PWA / offline service worker (app works offline but isn't installable yet)
- Tablet/mobile responsive polish (desktop-first; works on tablet)

## Recommended Next Steps
1. Add PWA manifest + service worker for installable offline-first
2. Add chart drill-down (click category to filter transactions)
3. Add savings goals feature linked to accounts
4. Add account reconciliation workflow
5. Integrate a bank-sync API (OpenFinance Brasil) as an optional backend
