import type { Photo } from '@/content/photos';

export function validDate(value?: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value;
}
export function indexPhotoDates(photos: Photo[]) {
  const dated = new Map<string, Photo[]>();
  const undated: Photo[] = [];
  for (const photo of photos) {
    if (!validDate(photo.date)) { undated.push(photo); continue; }
    dated.set(photo.date, [...(dated.get(photo.date) ?? []), photo]);
  }
  return { dated, undated, dates: [...dated.keys()].sort() };
}
export function calendarDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date.toISOString().slice(0, 10);
}
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
