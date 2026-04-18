/** Generate a short unique id — safe for localStorage data. */
export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${prefix ? '_' : ''}${time}${rand}`;
}
