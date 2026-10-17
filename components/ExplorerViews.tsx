'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { Photo } from '@/content/photos';
import { CalendarExplorer } from './CalendarExplorer';

const GeographicExplorer = dynamic(() => import('./GeographicExplorer'), {
  loading: () => <p className="geography-loading" role="status">Opening the places collection…</p>,
});

export function ExplorerViews({ photos }: { photos: Photo[] }) {
  const params = useSearchParams();
  const map = params.get('view') === 'map';
  function href(view: string) {
    const query = new URLSearchParams(params.toString());
    query.set('view', view);
    return `?${query}`;
  }
  return <>
    <nav className="explorer-views" aria-label="Explore the collection">
      <a href={href('calendar')} aria-current={!map ? 'page' : undefined} onClick={event => {
        event.preventDefault(); window.history.pushState(null, '', href('calendar'));
      }}>By date <span>Calendar</span></a>
      <a href={href('map')} aria-current={map ? 'page' : undefined} onClick={event => {
        event.preventDefault(); window.history.pushState(null, '', href('map'));
      }}>By place <span>Geographic Explorer</span></a>
    </nav>
    {map ? <GeographicExplorer photos={photos}/> : <CalendarExplorer photos={photos}/>}
  </>;
}
