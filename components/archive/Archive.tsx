'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { photos, type Photo } from '@/content/photos';
import { chapters } from '@/content/exhibition';
import { indexPhotoDates, dateLabel, CALENDAR_START, CALENDAR_END, clampCalendarDate } from '@/lib/photo-calendar';
import { monthDays, shiftMonth } from '@/lib/archive-calendar';
import { ArchivePhoto } from './ArchivePhoto';
import { PhotoDetails } from './PhotoDetails';
import { CalendarSeams } from './CalendarSeams';
import { ArchiveMap } from './ArchiveMap';
import { displayPhotoLocation } from '@/lib/display-photo-location';
import './archive.css';
const index = indexPhotoDates(photos);
const initialDate = clampCalendarDate(index.dates.at(-1) ?? '2026-10-01');
const sections = ['Calendar', 'Map', 'Collections', 'Search', 'About'] as const;
export type Section = typeof sections[number];
const symbols = ['▦', '◎', '▧', '⌕', 'ⓘ'];
function Viewer({ items, start, close }: { items: Photo[]; start: number; close: () => void }) {
  const [position, setPosition] = useState(start);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const photo = items[position];
  const move = (delta: number) => setPosition(p => (p + delta + items.length) % items.length);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    for (const delta of [-1, 1]) { const img = new window.Image(); img.src = items[(position + delta + items.length) % items.length].fullscreenSrc; }
  }, [position, items]);
  return <dialog ref={dialog} className="archive-viewer" aria-label="Photograph viewer" onCancel={e => { e.preventDefault(); close(); }} onKeyDown={e => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
    <div className="viewer-toolbar"><span>{position + 1} / {items.length}</span><button onClick={close} autoFocus aria-label="Close photograph viewer">Close ×</button></div>
    <div className="viewer-content"><div className="viewer-stage" onTouchStart={e => { touch.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touch.current !== null && Math.abs(e.changedTouches[0].clientX - touch.current) > 45) move(e.changedTouches[0].clientX < touch.current ? 1 : -1); touch.current = null; }}>
      {/* Fullscreen derivatives preserve the source aspect ratio and color. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.fullscreenSrc} alt={photo.alt} width={photo.fullscreenWidth} height={photo.fullscreenHeight}/>
    </div><PhotoDetails photo={photo}/></div><div className="viewer-toolbar"><button onClick={() => move(-1)}>← Previous</button><button onClick={() => move(1)}>Next →</button></div>
  </dialog>;
}
export function Archive({ initialSection = 'Calendar' }: { initialSection?: Section }) {
  const [section, setSection] = useState<Section>(initialSection);
  const [expanded, setExpanded] = useState(false);
  const [month, setMonth] = useState(initialDate.slice(0, 7));
  const [selected, setSelected] = useState(initialDate);
  const [query, setQuery] = useState('');
  const [viewer, setViewer] = useState<{ items: Photo[]; start: number } | null>(null);
  const days = monthDays(month);
  const memories = index.dated.get(selected) ?? [];
  const [featuredId, setFeaturedId] = useState('');
  const featured = memories.find(p => p.id === featuredId) ?? memories[0];
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
  function select(date: string) { if (date < CALENDAR_START || date > CALENDAR_END) return; setSelected(date); setFeaturedId(''); if (!date.startsWith(month)) setMonth(date.slice(0, 7)); }
  function navigate(delta: number) { const next = shiftMonth(month, delta); if (next < CALENDAR_START.slice(0, 7) || next > CALENDAR_END.slice(0, 7)) return; setMonth(next); select(index.dates.find(d => d.startsWith(next)) ?? `${next}-01`); }
  function dayKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const delta = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 } as Record<string, number>)[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const date = days[i + delta];
    if (date && date >= CALENDAR_START && date <= CALENDAR_END) { select(date); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)?.focus()); }
  }
  const results = photos.filter(p => [p.id, p.title, p.date, p.event, ...p.tags, displayPhotoLocation(p)?.city].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase().trim()));
  function photoGrid(items: Photo[]) { return <div className="archive-photo-grid">{items.map((p, i) => <button key={p.id} onClick={() => setViewer({ items, start: i })} aria-label={`Open ${p.id}: ${p.title}`}><span className="photo-grid-image"><ArchivePhoto src={p.gallerySrc} alt={p.alt} width={p.galleryWidth} height={p.galleryHeight} sizes="(max-width: 600px) 45vw, 25vw"/></span></button>)}</div>; }
  return <div className={`archive ${expanded ? 'rail-expanded' : ''}`}>
    <aside className="archive-rail"><button className="rail-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}>{expanded ? '←' : '→'}</button><nav aria-label="Archive navigation">{sections.map((s, i) => <button key={s} title={s} aria-label={s} aria-current={section === s ? 'page' : undefined} onClick={() => setSection(s)}><span aria-hidden="true">{symbols[i]}</span><span className="rail-label">{s}</span></button>)}</nav><Link className="rail-vote" href="/vote" title="Mochamaru Vote" aria-label="Mochamaru Vote">♡<span className="rail-label">Vote</span></Link></aside>
    <main id="main" className="archive-main">
    {section === 'Calendar' ? <><section className="calendar-section" aria-labelledby="month-heading"><div className="archive-intro"><p className="hand-note archive-signature">PHOTO ARCHIVE / MOMENTS OF K</p></div><div className="month-heading"><div><h1 id="month-heading">{monthLabel}.<span>{month.slice(0, 4)}</span></h1></div><div className="month-controls"><button disabled={month === CALENDAR_START.slice(0, 7)} aria-label="Previous month" onClick={() => navigate(-1)}>←</button><button disabled={month === CALENDAR_END.slice(0, 7)} aria-label="Next month" onClick={() => navigate(1)}>→</button></div></div>
    <div className="calendar-board" role="group" aria-label={`${monthLabel} ${month.slice(0, 4)} calendar`}><div className="weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((date, i) => { const items = index.dated.get(date) ?? []; const active = date === selected; return <button key={date} disabled={date < CALENDAR_START || date > CALENDAR_END} data-date={date} className={`calendar-day ${date.startsWith(month) ? '' : 'adjacent'} ${active ? 'selected' : ''}`} aria-pressed={active} aria-label={`${dateLabel(date)}, ${items.length} photographs`} onClick={() => select(date)} onKeyDown={e => dayKey(e, i)}><span className="day-number">{Number(date.slice(-2))}</span>{items[0] && <span className="day-print"><ArchivePhoto src={items[0].gallerySrc} alt={items[0].alt} width={items[0].galleryWidth} height={items[0].galleryHeight} sizes="(max-width: 700px) 15vw, 170px"/></span>}{items.length > 0 && <span className="day-count">{items.length > 1 ? `+${items.length - 1}` : '·'}</span>}</button>; })}<CalendarSeams weeks={days.length / 7}/></div></div>
    </section>
    <section id="memories" className="memory-section" aria-label={`Photographs from ${dateLabel(selected)}`}>{featured ? <><div className="memory-layout"><button className="memory-photo-button" aria-label={`Open photograph ${featured.id}`} onClick={() => setViewer({ items: memories, start: memories.indexOf(featured) })}><ArchivePhoto src={featured.gallerySrc} alt={featured.alt} width={featured.galleryWidth} height={featured.galleryHeight} sizes="(max-width: 700px) 90vw, 60vw" className="memory-photo"/></button><PhotoDetails photo={featured}/></div><div className="memory-filmstrip" aria-label="Photographs from selected date">{memories.map(p => <button key={p.id} aria-label={`Select ${p.id}`} aria-pressed={p.id === featured.id} onClick={() => setFeaturedId(p.id)}><Image src={p.gallerySrc} alt={p.alt} width={120} height={90} sizes="100px"/></button>)}</div></> : <div className="empty-memory"><span aria-hidden="true">✧</span><h3>A quiet day in the archive.</h3><p>No photographs with a verified capture date for this day.</p><button onClick={() => { const next = index.dates.find(d => d > selected) ?? index.dates[0]; if (next) select(next); }}>Find a day with photographs →</button></div>}</section></> : <section className="secondary-section"><p className="archive-eyebrow">KOLLECTION-K / THE ARCHIVE</p><h1>{section}</h1>{section === 'Map' && <ArchiveMap photos={photos} renderPhotos={photoGrid}/>}{section === 'Collections' && <>{chapters.map(c => <section className="collection" key={c.id}><h2>{c.title}</h2><p>{c.subtitle}</p>{photoGrid(photos.filter(p => p.chapterId === c.id))}</section>)}<section className="collection"><h2>Awaiting a date</h2><p>These photographs stay outside the calendar until their capture dates are confirmed.</p>{photoGrid(index.undated)}</section></>}{section === 'Search' && <><label className="archive-search">Find a moment<input type="search" placeholder="Date, title, tag, or photo ID…" value={query} onChange={e => setQuery(e.target.value)}/></label><p role="status">{results.length} photographs</p>{photoGrid(results)}</>}{section === 'About' && <div className="about-copy"><h2>Moments of K</h2><p>A photographic scrapbook. A place for the light, the small details, and the moments we choose to keep.</p><p>{photos.length} photographs, {index.dates.length} capture dates, four curated collections. Dates come from the existing EXIF-derived capture metadata; they do not imply an event date or a location.</p><p>{index.undated.length} photographs await date curation. 地图中的演示地点为随机分配，不代表真实拍摄地点。活动名称及摄影信息可在核实后补充。</p><Link href="/vote">Visit Mochamaru Vote ↗</Link></div>}</section>}
    <footer className="archive-footer"><span>KOLLECTION-K / MOMENTS OF K</span><button onClick={() => setSection('About')}>About this archive ↗</button><Link href="/vote">Mochamaru Vote ↗</Link></footer></main>{viewer && <Viewer items={viewer.items} start={viewer.start} close={() => setViewer(null)}/>}</div>;
}
