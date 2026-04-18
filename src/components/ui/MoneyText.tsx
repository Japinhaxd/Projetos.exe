import { useI18n } from '../../i18n/useI18n';
import { signColor } from '../../lib/money';
import { useCountUp } from '../../hooks/useCountUp';

interface Props {
  value: number;
  animate?: boolean;
  colored?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** If provided, override sign logic (useful for Dashboard where expense card should be red). */
  forceColor?: 'pos' | 'neg' | 'zero';
  /** Pretty sign prefix (+ / -). */
  showSign?: boolean;
}

export function MoneyText({
  value,
  animate = false,
  colored = true,
  size = 'md',
  className = '',
  forceColor,
  showSign = false,
}: Props) {
  const { money } = useI18n();
  const animated = useCountUp(value, animate ? 650 : 0);
  const display = animate ? animated : value;

  const colorKey = forceColor ?? signColor(value);
  const colorClass = !colored
    ? ''
    : colorKey === 'pos'
    ? 'text-pos'
    : colorKey === 'neg'
    ? 'text-neg'
    : 'text-zero';

  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-semibold',
    xl: 'text-3xl font-bold tracking-tight',
  }[size];

  const prefix = showSign && value > 0 ? '+' : '';

  return (
    <span className={`${colorClass} ${sizeClass} tabular-nums ${className}`}>
      {prefix}
      {money(display)}
    </span>
  );
}
