import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { formatCurrency } from '../../lib/utils';
import { useStore } from '../../store/useStore';

interface MoneyProps {
  value: number;
  className?: string;
  animate?: boolean;
  neutralZero?: boolean;
  forceSign?: boolean;
  signInvert?: boolean; // use to display an expense amount with red color even if stored positive
}

export function Money({
  value,
  className,
  animate = false,
  neutralZero = true,
  forceSign = false,
  signInvert = false,
}: MoneyProps) {
  const currency = useStore(s => s.settings.currency);
  const [displayed, setDisplayed] = useState(animate ? 0 : value);
  const prev = useRef(displayed);

  useEffect(() => {
    if (!animate) {
      setDisplayed(value);
      return;
    }
    const start = prev.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = start + (end - start) * eased;
      setDisplayed(cur);
      if (t < 1) raf = requestAnimationFrame(step);
      else prev.current = end;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const displayValue = signInvert ? -Math.abs(displayed) : displayed;
  const colorSource = signInvert ? -Math.abs(value) : value;

  const colorClass =
    colorSource > 0
      ? 'text-pos'
      : colorSource < 0
      ? 'text-neg'
      : neutralZero
      ? 'text-muted'
      : 'text-text';

  let formatted = formatCurrency(Math.abs(displayValue), currency);
  if (displayValue < 0) formatted = '-' + formatted;
  else if (forceSign && displayValue > 0) formatted = '+' + formatted;

  return <span className={clsx(colorClass, 'tabular-nums', className)}>{formatted}</span>;
}
