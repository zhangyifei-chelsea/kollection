/* eslint-disable @next/next/no-img-element -- Local vector geography; no image optimization required. */
'use client';

import { useEffect, useRef, useState } from 'react';
import { clusterLocations, projectLocation, type LocationGroup } from '@/lib/photo-geography';

type Camera = { x: number; y: number; zoom: number };
const world: Camera = { x: .5, y: .5, zoom: 1 };
const pacific: Camera = { ...projectLocation(180, 25), zoom: 2 };
function limit(camera: Camera): Camera {
  const zoom = Math.min(16, Math.max(1, camera.zoom));
  const edge = .5 / zoom;
  return { zoom, x: Math.min(1 - edge, Math.max(edge, camera.x)), y: Math.min(1 - edge, Math.max(edge, camera.y)) };
}
export default function InteractivePhotoMap({ groups, selectedCity, onSelect }: {
  groups: LocationGroup[]; selectedCity?: string; onSelect: (id: string) => void;
}) {
  const [camera, setCamera] = useState(pacific);
  const [size, setSize] = useState({ width: 1000, height: 500 });
  const [touchPan, setTouchPan] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; camera: Camera } | null>(null);
  const selected = groups.find(group => group.location.id === selectedCity);
  const longitude = selected?.location.longitude;
  const latitude = selected?.location.latitude;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (longitude === undefined || latitude === undefined) return;
    const position = projectLocation(longitude, latitude);
    // Reveal the selected city when filters/list/history change, without shifting its coordinates.
    const id = requestAnimationFrame(() => setCamera(limit({ ...position, zoom: size.width < 600 ? 16 : 8 })));
    return () => cancelAnimationFrame(id);
  }, [longitude, latitude, size.width]);

  function zoom(factor: number) { setCamera(current => limit({ ...current, zoom: current.zoom * factor })); }
  const clusters = clusterLocations(groups, size.width, size.height, camera.zoom);
  return <figure className="photo-map">
    <div className={`photo-map-frame${touchPan ? ' touch-pan-enabled' : ''}`} ref={frame}
      role="region" aria-label="Interactive world photo map" aria-describedby="map-help" tabIndex={0}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const steps: Record<string, [number, number]> = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] };
        const step = steps[event.key];
        if (step) { event.preventDefault(); setCamera(current => limit({ ...current, x: current.x + step[0] * .12 / current.zoom, y: current.y + step[1] * .12 / current.zoom })); }
        if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(2); }
        if (event.key === '-') { event.preventDefault(); zoom(.5); }
        if (event.key === 'Home') { event.preventDefault(); setCamera(pacific); }
      }}
      onPointerDown={event => {
        if ((event.target as HTMLElement).closest('button') || (event.pointerType === 'touch' && !touchPan) || event.button !== 0) return;
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, camera };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const start = drag.current;
        if (!start || event.pointerId !== start.id) return;
        setCamera(limit({ ...start.camera,
          x: start.camera.x - (event.clientX - start.x) / size.width / start.camera.zoom,
          y: start.camera.y - (event.clientY - start.y) / size.height / start.camera.zoom }));
      }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}>
      <div className="photo-map-land" style={{ transform: `translate(${(.5-camera.x)*100*camera.zoom}%, ${(.5-camera.y)*100*camera.zoom}%) scale(${camera.zoom})` }} aria-hidden="true">
        <img src="/maps/world-land.svg" width="1000" height="500" alt="" draggable={false}/>
      </div>
      <div className="photo-map-controls" aria-label="Map controls">
        <button aria-label="Zoom in" disabled={camera.zoom >= 16} onClick={() => zoom(2)}>+</button>
        <button aria-label="Zoom out" disabled={camera.zoom <= 1} onClick={() => zoom(.5)}>−</button>
        <button className="map-world-button" onClick={() => setCamera(pacific)} aria-label="Reset to Pacific view">Pacific</button>
        <button className="map-world-button" onClick={() => setCamera(world)} aria-label="Reset to world view">World</button>
        <button className="map-pan-button" aria-pressed={touchPan} onClick={() => setTouchPan(!touchPan)}>Touch pan</button>
      </div>
      {clusters.map(cluster => {
        const points = cluster.map(group => projectLocation(group.location.longitude, group.location.latitude));
        const point = { x: points.reduce((n,p) => n+p.x, 0) / points.length, y: points.reduce((n,p) => n+p.y, 0) / points.length };
        const x = .5 + (point.x-camera.x)*camera.zoom, y = .5 + (point.y-camera.y)*camera.zoom;
        if (x < -.02 || x > 1.02 || y < -.02 || y > 1.02) return null;
        const single = cluster.length === 1 ? cluster[0] : undefined;
        const count = cluster.reduce((sum, group) => sum + group.photos.length, 0);
        const label = single ? `${single.location.city}, ${count} photographs${single.location.source === 'mock' ? ', mock assignment' : ''}`
          : `Zoom to ${cluster.length} cities: ${cluster.map(group => group.location.city).join(', ')}. ${count} photographs`;
        return <button key={cluster.map(group => group.location.id).sort().join(':')} className={`map-marker${single && single.location.id === selectedCity ? ' selected' : ''}${single ? '' : ' map-cluster'}`}
          style={{ left: `${x*100}%`, top: `${y*100}%` }} aria-label={label} title={label}
          aria-pressed={single ? single.location.id === selectedCity : undefined}
          data-map-city={single?.location.id} data-map-cluster={single ? undefined : 'true'}
          onClick={() => {
            if (single) onSelect(single.location.id);
            else {
              setCamera(limit({ ...point, zoom: Math.min(16, camera.zoom * 4) }));
              frame.current?.focus({ preventScroll: true });
            }
          }}>
          <span className="map-marker-dot">{count}</span>
          <span className="map-marker-label">{single ? single.location.city : `${cluster.length} cities`}</span>
        </button>;
      })}
      {groups.length === 0 && <p className="map-no-locations">No photographed cities in this selection.</p>}
    </div>
    <figcaption><span id="map-help">Drag to pan · + / − to zoom · Home to reset. Nearby cities group together; select a group to zoom in. On touch screens, enable Touch pan to drag, or use the city list.</span>
      <span>Land: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> · Coordinates: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span>
    </figcaption>
  </figure>;
}
