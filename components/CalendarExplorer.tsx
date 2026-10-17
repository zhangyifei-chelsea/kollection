'use client';
import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Photo } from '@/content/photos';
import { calendarDate, dateLabel, indexPhotoDates, validDate } from '@/lib/photo-calendar';
import { ExploreGallery } from './ExploreGallery';

const months = Array.from({length: 12}, (_, i) => new Intl.DateTimeFormat('en', {month: 'long', timeZone: 'UTC'}).format(new Date(Date.UTC(2000, i))));
export function CalendarExplorer({ photos }: { photos: Photo[] }) {
  const params = useSearchParams();
  const {dated, undated, dates} = indexPhotoDates(photos);
  const fallback = dates.at(-1) ?? '2026-01-01';
  const rawDate = params.get('date');
  const selected = rawDate === 'unknown' ? 'unknown' : validDate(rawDate ?? undefined) ? rawDate! : fallback;
  const rawMonth = params.get('month');
  const monthKey = rawMonth && validDate(`${rawMonth}-01`) ? rawMonth : (selected === 'unknown' ? fallback : selected).slice(0, 7);
  const [year, month] = monthKey.split('-').map(Number);
  const dayCount = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offset = (new Date(`${monthKey}-01T00:00:00Z`).getUTCDay() + 6) % 7;
  const results = selected === 'unknown' ? undated : dated.get(selected) ?? [];
  const years = [...new Set([...dates.map(d => Number(d.slice(0, 4))), year])].sort((a,b) => a-b);
  const grid = useRef<HTMLDivElement>(null);
  function update(next: Record<string, string>) {
    const query = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => query.set(key, value));
    window.history.pushState(null, '', `?${query}`);
  }
  function navigateMonth(delta: number) {
    const next = calendarDate(year, month - 1 + delta, 1).slice(0,7);
    if (Number(next.slice(0,4)) >= 1000 && Number(next.slice(0,4)) <= 9999) update({month: next});
  }
  function focusDate(date: string) {
    if (Number(date.slice(0,4)) < 1000 || Number(date.slice(0,4)) > 9999) return;
    if (date.slice(0,7) !== monthKey) update({month: date.slice(0,7)});
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus());
  }
  return <>
    <div className="calendar-layout">
      <section className="calendar" aria-labelledby="calendar-heading">
        <div className="calendar-top"><h2 id="calendar-heading">A moment in time</h2><span className="eyebrow">Calendar</span></div>
        <div className="calendar-navigation">
          <button aria-label="Previous month" onClick={() => navigateMonth(-1)}>←</button>
          <label><span className="sr-only">Month</span><select value={month-1} onChange={e => update({month: `${year}-${String(Number(e.target.value)+1).padStart(2,'0')}`})}>{months.map((name,i) => <option key={name} value={i}>{name}</option>)}</select></label>
          <label><span className="sr-only">Year</span><select value={year} onChange={e => update({month: `${e.target.value}-${String(month).padStart(2,'0')}`})}>{years.map(y => <option key={y}>{y}</option>)}</select></label>
          <button aria-label="Next month" onClick={() => navigateMonth(1)}>→</button>
        </div>
        <div className="calendar-days" aria-hidden="true">{['M','T','W','T','F','S','S'].map((d,i) => <span key={i}>{d}</span>)}</div>
        <div className="calendar-grid" ref={grid} role="group" aria-label={`${months[month-1]} ${year}. Arrow keys move by day or week; Page Up and Page Down change month.`}>
          {Array.from({length: offset}, (_,i) => <span key={`blank-${i}`} />)}
          {Array.from({length: dayCount}, (_,i) => {
            const date = `${monthKey}-${String(i+1).padStart(2,'0')}`;
            const count = dated.get(date)?.length ?? 0;
            return <button key={date} data-date={date} className={count ? 'has-photos' : ''} aria-pressed={selected === date} aria-label={`${dateLabel(date)}, ${count} photographs`} tabIndex={date === (selected.startsWith(monthKey) ? selected : `${monthKey}-01`) ? 0 : -1} onClick={() => update({date, month: monthKey})} onKeyDown={e => {
              const steps: Record<string, number> = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7};
              const delta = steps[e.key];
              let target: string | undefined;
              if (delta) target = calendarDate(year,month-1,i+1+delta);
              if (e.key === 'Home') target = `${monthKey}-01`;
              if (e.key === 'End') target = `${monthKey}-${dayCount}`;
              if (e.key === 'PageUp' || e.key === 'PageDown') {
                const next = calendarDate(year,month-1+(e.key === 'PageUp' ? -1 : 1),1);
                const last = new Date(Date.UTC(Number(next.slice(0,4)),Number(next.slice(5,7)),0)).getUTCDate();
                target = next.slice(0,8)+String(Math.min(i+1,last)).padStart(2,'0');
              }
              if (target) {e.preventDefault(); focusDate(target);}
            }}><span>{i+1}</span><small>{count > 0 ? `${count} ${count === 1 ? 'work' : 'works'}` : '—'}</small></button>;
          })}
        </div>
        <p className="calendar-note">Marked dates hold photographs. Select any day to explore.</p>
        {undated.length > 0 && <button className="undated-link" aria-pressed={selected === 'unknown'} onClick={() => update({date:'unknown'})}>Date unknown · {undated.length} photographs</button>}
      </section>
      <aside className="calendar-aside"><p className="eyebrow">The collection, day by day</p><p>Return to a day.<br/><em>Discover what stayed.</em></p><span>{photos.length} photographs across {dates.length} recorded dates.</span><button onClick={() => update({date:fallback,month:fallback.slice(0,7)})}>Latest photographed date ↗</button></aside>
    </div>
    <section className="calendar-results" aria-labelledby="results-heading">
      <div className="results-heading" aria-live="polite" aria-atomic="true"><h2 id="results-heading">{selected === 'unknown' ? 'Date unknown' : dateLabel(selected)}</h2><p className="eyebrow">{results.length} {results.length === 1 ? 'photograph' : 'photographs'}</p></div>
      {results.length ? <ExploreGallery key={selected} photos={results}/> : <p className="calendar-empty">No photographs are recorded for this date. Choose a marked day to continue exploring.</p>}
    </section>
  </>;
}
