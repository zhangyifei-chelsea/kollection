'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Photo } from '@/content/photos';
import { verifiedPhotoLocations } from '@/content/photo-locations';
import { enableMockLocations, mockLocations, mockPhotoLocationIds } from '@/content/mock-photo-locations';
import { indexPhotoLocations } from '@/lib/photo-geography';
import InteractivePhotoMap from '@/components/InteractivePhotoMap';

export function ArchiveMap({ photos, renderPhotos }: { photos: Photo[]; renderPhotos: (items: Photo[]) => ReactNode }) {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [mapVersion, setMapVersion] = useState(0);
  const { groups, unknown } = indexPhotoLocations(photos, verifiedPhotoLocations, enableMockLocations ? mockLocations : [], enableMockLocations ? mockPhotoLocationIds : {});
  const countries = [...new Map(groups.map(group => [group.location.countryCode, group.location.country])).entries()];
  const visible = groups.filter(group => !country || group.location.countryCode === country);
  const selected = visible.find(group => group.location.id === city);
  const results = selected ? selected.photos : visible.flatMap(group => group.photos);
  return <div className="archive-map">
    {groups.some(group => group.location.source === 'mock') && <p className="map-demo-note" role="note">照片已随机分配至城市，仅用于地图浏览，不代表真实拍摄地点。分配结果在刷新后保持不变。</p>}
    <div className="archive-map-filters">
      <label>国家 / 地区<select value={country} onChange={event => { setCountry(event.target.value); setCity(''); setMapVersion(value => value + 1); }}><option value="">全部国家 / 地区</option>{countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
      <button onClick={() => { setCountry(''); setCity(''); setMapVersion(value => value + 1); }}>清除筛选 ↺</button>
      <span role="status">{selected ? 1 : visible.length} 个城市 · {results.length} 张照片</span>
    </div>
    <InteractivePhotoMap key={mapVersion} groups={visible} selectedCity={selected?.location.id} onSelect={setCity}/>
    <nav className="archive-map-cities" aria-label="按城市浏览照片"><button aria-pressed={!selected} onClick={() => { setCity(''); setMapVersion(value => value + 1); }}>全部地点</button>{visible.map(group => <button key={group.location.id} aria-pressed={group.location.id === selected?.location.id} onClick={() => setCity(group.location.id)}>{group.location.city}<span>{group.photos.length}</span></button>)}</nav>
    <header className="map-results-heading"><h2>{selected ? `${selected.location.city}, ${selected.location.country}` : 'Across the map.'}</h2><p>{results.length} 张照片</p></header>
    {results.length ? renderPhotos(results) : <p>当前筛选下没有照片。</p>}
    {unknown.length > 0 && <section><h2>尚未分配地点</h2>{renderPhotos(unknown)}</section>}
  </div>;
}
