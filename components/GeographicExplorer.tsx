'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { Photo } from '@/content/photos';
import { verifiedPhotoLocations } from '@/content/photo-locations';
import { enableMockLocations, mockLocations, mockPhotoLocationIds } from '@/content/mock-photo-locations';
import { indexPhotoLocations } from '@/lib/photo-geography';
import { ExploreGallery } from './ExploreGallery';

const InteractivePhotoMap = dynamic(() => import('./InteractivePhotoMap'), {
  ssr: false,
  loading: () => <div className="photo-map-placeholder" role="status">Loading the world map. The city list is available below.</div>,
});

export default function GeographicExplorer({ photos }: { photos: Photo[] }) {
  const params = useSearchParams();
  const { groups, unknown } = indexPhotoLocations(photos, verifiedPhotoLocations,
    enableMockLocations ? mockLocations : [], enableMockLocations ? mockPhotoLocationIds : {});
  const countries = [...new Map(groups.map(group => [group.location.countryCode, group.location.country])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'en'));
  const rawCountry = params.get('country') ?? '';
  const country = countries.some(([code]) => code === rawCountry) ? rawCountry : '';
  const visible = groups.filter(group => !country || group.location.countryCode === country);
  const city = params.get('city') ?? '';
  const selected = visible.find(group => group.location.id === city);
  const unlocated = city === 'unknown' && !country && unknown.length > 0;
  const invalid = Boolean((rawCountry && !country) || (city && !selected && !unlocated));
  const results = unlocated ? unknown : selected ? selected.photos : visible.flatMap(group => group.photos);
  const hasMock = groups.some(group => group.location.source === 'mock');
  const heading = unlocated ? 'Location unknown' : selected ? selected.location.city : country
    ? countries.find(([code]) => code === country)![1] : 'All locations';

  function update(values: Record<string, string>) {
    const query = new URLSearchParams(params.toString());
    query.set('view', 'map');
    for (const [key, value] of Object.entries(values)) {
      if (value) query.set(key, value); else query.delete(key);
    }
    window.history.pushState(null, '', `?${query}`);
  }
  function selectCity(id: string) {
    const group = groups.find(item => item.location.id === id);
    if (group) update({ city: id, country: group.location.countryCode });
  }

  return <div className="geographic-explorer">
    <header className="geography-heading">
      <div><p className="eyebrow">The collection / Places</p><h2>A sense of place.</h2></div>
      <p>Follow a city into the collection.<br/>Choose a marker, or browse the list.</p>
    </header>
    {hasMock && <aside className="mock-location-notice" aria-label="Demonstration location data">
      <p className="eyebrow">Demonstration locations</p>
      <p>These photo-to-city assignments are fictional, for exploring this feature. They do not identify where the photographs were taken.</p>
    </aside>}
    <div className="geography-filters">
      <label>Country / region<select aria-label="Country / region" value={country} onChange={event => update({ country: event.target.value, city: '' })}>
        <option value="">All countries and regions</option>
        {countries.map(([code, name]) => <option key={code} value={code}>{name} · {groups.filter(group => group.location.countryCode === code).reduce((sum, group) => sum + group.photos.length, 0)}</option>)}
      </select></label>
      <label>City<select aria-label="City" value={selected?.location.id ?? (unlocated ? 'unknown' : '')} onChange={event => {
        if (event.target.value === 'unknown') update({ country: '', city: 'unknown' });
        else if (event.target.value) selectCity(event.target.value);
        else update({ city: '' });
      }}>
        <option value="">All cities</option>
        {visible.map(group => <option key={group.location.id} value={group.location.id}>{group.location.city} · {group.photos.length}</option>)}
        {!country && unknown.length > 0 && <option value="unknown">Location unknown · {unknown.length}</option>}
      </select></label>
      <button className="geography-reset" onClick={() => update({ country: '', city: '' })}>Clear filters ↗</button>
    </div>
    {invalid && <p className="geography-status" role="status">That location is unavailable. Showing the available locations instead.</p>}
    {groups.length > 0 ? <InteractivePhotoMap key={country} groups={visible} selectedCity={selected?.location.id} onSelect={selectCity}/>
      : <p className="geography-empty">No mapped photo locations are available yet. Photographs without a location remain accessible below.</p>}
    <div className="location-index-heading"><h3 id="location-list-title">Browse cities</h3><span className="eyebrow">{visible.length} {visible.length === 1 ? 'city' : 'cities'}</span></div>
    <ul className="location-list" aria-labelledby="location-list-title">
      {visible.map(group => <li key={group.location.id}><button aria-pressed={selected?.location.id === group.location.id} onClick={() => selectCity(group.location.id)}>
        <span><strong>{group.location.city}</strong><small>{group.location.country}{group.location.source === 'mock' ? ' · Mock assignment' : ''}</small></span>
        <span className="location-count">{group.photos.length}<span className="sr-only"> photographs</span><span aria-hidden="true"> ↗</span></span>
      </button></li>)}
    </ul>
    {unknown.length > 0 && <button className="geography-unknown" aria-pressed={unlocated} onClick={() => update({ country: '', city: 'unknown' })}>Location unknown · {unknown.length} photographs</button>}
    <section className="geography-results calendar-results" aria-labelledby="geography-results-title">
      <div className="results-heading" aria-live="polite" aria-atomic="true"><div><h2 id="geography-results-title">{heading}</h2>
        {selected && <p className="geography-result-note">{selected.location.country} · {selected.location.source === 'mock' ? 'Mock photo assignment' : 'Verified photo location'}</p>}
      </div><p className="eyebrow">{results.length} {results.length === 1 ? 'photograph' : 'photographs'}</p></div>
      {results.length > 0 ? <ExploreGallery key={`${country}:${city}`} photos={results}/>
        : <p className="geography-empty">No photographs have a known location for this selection. Use Location unknown or choose another city.</p>}
    </section>
  </div>;
}
