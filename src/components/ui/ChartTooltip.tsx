import type { ReactNode } from 'react';
import { resolveCategoryColor, semanticColor } from '../../types';

// ============================================================
// Global chart tooltip — Finance OS
// ------------------------------------------------------------
// Single source of truth for every Recharts tooltip in the app.
// Enforces the strict dark styling and the blue/red color rule.
//
//   background : #111118
//   border     : 1px solid #1e1e2e
//   radius     : 8px
//   padding    : 10px 14px
//   text       : #e2e8f0
//
// It NEVER inherits a slice/bar color as background — per-entry
// colors are applied only to the leading dot and the formatted value
// line, following the strict blue/red rule.
// ============================================================

export interface ChartTooltipEntry {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string | number;
  payload?: any;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;

  /** Locale-aware currency formatter, usually `money` from useI18n. */
  money: (v: number) => string;

  /** Optional translated label for the x-axis value (e.g. category name). */
  labelFormatter?: (label: string | number | undefined) => string;

  /**
   * How to colorize each entry's value:
   *  - 'semantic' → blue for >0, red for <0, gray for 0 (default)
   *  - 'category' → use the category palette (payload.name key)
   *  - 'dataKey'  → income dataKey → blue, expense → red, net → semantic
   *  - 'entryType'→ reads payload.type ('income'|'expense'|'net')
   *  - 'fixed'    → one forced color
   */
  colorMode?: 'semantic' | 'category' | 'dataKey' | 'entryType' | 'fixed';

  /** When colorMode = 'fixed' */
  fixedColor?: string;

  /**
   * Per-entry translated name, e.g. receives `entry.name`
   * (which is typically the Bar dataKey like 'income'/'expense'/'value')
   * and returns a user-facing, localized label.
   */
  nameFormatter?: (entry: ChartTooltipEntry) => string;

  /** Optional extra lines rendered after the values (localized). */
  footer?: ReactNode;
}

function colorForEntry(
  entry: ChartTooltipEntry,
  mode: NonNullable<ChartTooltipProps['colorMode']>,
  fixed?: string
): string {
  const value = Number(entry.value ?? 0);
  switch (mode) {
    case 'category': {
      const key = (entry.payload?.name ?? entry.name ?? '') as string;
      return resolveCategoryColor(key);
    }
    case 'dataKey': {
      const k = String(entry.dataKey ?? entry.name ?? '').toLowerCase();
      if (k === 'income') return '#3b82f6';
      if (k === 'expense') return '#ef4444';
      return semanticColor(value);
    }
    case 'entryType': {
      const t = String(entry.payload?.type ?? '').toLowerCase();
      if (t === 'income') return '#3b82f6';
      if (t === 'expense') return '#ef4444';
      return semanticColor(value);
    }
    case 'fixed':
      return fixed || '#3b82f6';
    case 'semantic':
    default:
      return semanticColor(value);
  }
}

export function ChartTooltip({
  active,
  payload,
  label,
  money,
  labelFormatter,
  colorMode = 'semantic',
  fixedColor,
  nameFormatter,
  footer,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const resolvedLabel =
    labelFormatter !== undefined ? labelFormatter(label) : label;

  return (
    <div
      style={{
        background: '#111118',
        border: '1px solid #1e1e2e',
        borderRadius: 8,
        padding: '10px 14px',
        color: '#e2e8f0',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        minWidth: 140,
        pointerEvents: 'none',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {resolvedLabel !== undefined && resolvedLabel !== '' && (
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            marginBottom: payload.length ? 6 : 0,
            color: '#e2e8f0',
          }}
        >
          {String(resolvedLabel)}
        </div>
      )}
      {payload.map((entry, idx) => {
        const c = colorForEntry(entry, colorMode, fixedColor);
        const displayName = nameFormatter
          ? nameFormatter(entry)
          : (entry.name as string) ?? '';
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              lineHeight: '18px',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: c,
                flexShrink: 0,
              }}
            />
            {displayName && (
              <span style={{ color: '#e2e8f0' }}>{displayName}:</span>
            )}
            <span style={{ color: c, fontWeight: 600 }}>
              {money(Number(entry.value ?? 0))}
            </span>
          </div>
        );
      })}
      {footer && (
        <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// Standard cursor overlay for <Tooltip cursor={CHART_CURSOR} />
export const CHART_CURSOR = { fill: 'rgba(255,255,255,0.04)' } as const;

// Subtle hover stroke for <Bar activeBar={CHART_ACTIVE_BAR} />
export const CHART_ACTIVE_BAR = {
  stroke: 'rgba(255,255,255,0.15)',
  strokeWidth: 1,
} as const;
