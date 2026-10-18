import { calendarDate } from './photo-calendar';
export function monthDays(month: string) {
  const [year, m] = month.split('-').map(Number);
  const first = new Date(`${month}-01T00:00:00Z`).getUTCDay();
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((first + count) / 7) * 7 }, (_, i) => calendarDate(year, m - 1, i - first + 1));
}
export function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split('-').map(Number);
  return calendarDate(year, m - 1 + delta, 1).slice(0, 7);
}
