import type { Photo } from '@/content/photos';
import type { PhotoLocation } from '@/content/photo-locations';

export type LocationGroup = { location: PhotoLocation; photos: Photo[] };
export function validLocation(location: PhotoLocation) {
  return Boolean(location.id && location.city && location.country && /^[A-Z]{2}$/.test(location.countryCode)
    && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90
    && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180
    && location.coordinateSource.startsWith('https://'));
}
export function indexPhotoLocations(
  photos: Photo[], verified: PhotoLocation[], mocks: PhotoLocation[] = [], assignments: Record<string, string> = {},
) {
  const registry = new Map(verified.filter(l => l.source === 'verified' && validLocation(l)).map(l => [l.id, l]));
  const mockRegistry = new Map(mocks.filter(l => l.source === 'mock' && !registry.has(l.id) && validLocation(l)).map(l => [l.id, l]));
  const buckets = new Map<string, LocationGroup>();
  const unknown: Photo[] = [];
  for (const photo of photos) {
    // A supplied but unrecognized verified ID stays unknown; never relabel it as mock.
    const location = photo.locationId ? registry.get(photo.locationId) : mockRegistry.get(assignments[photo.id]);
    if (!location) { unknown.push(photo); continue; }
    const key = `${location.source}:${location.id}`;
    const group = buckets.get(key) ?? { location, photos: [] };
    group.photos.push(photo);
    buckets.set(key, group);
  }
  const groups = [...buckets.values()].sort((a, b) => a.location.city.localeCompare(b.location.city, 'en'));
  return { groups, unknown };
}

/** Pacific-centered equirectangular projection, shared by land and city markers. */
export function projectLocation(longitude: number, latitude: number) {
  return { x: ((longitude % 360) + 360) % 360 / 360, y: (90 - latitude) / 180 };
}

/** Merge nearby hit targets without moving any city's actual geographic position. */
export function clusterLocations(groups: LocationGroup[], width: number, height: number, zoom: number) {
  const clusters: LocationGroup[][] = [];
  const nearby = (a: LocationGroup, b: LocationGroup) => {
    const p = projectLocation(a.location.longitude, a.location.latitude);
    const q = projectLocation(b.location.longitude, b.location.latitude);
    return Math.hypot((p.x - q.x) * width * zoom, (p.y - q.y) * height * zoom) < 48;
  };
  for (const group of groups) {
    const matches = clusters.filter(cluster => cluster.some(other => nearby(group, other)));
    const merged = [group, ...matches.flat()];
    for (const match of matches) clusters.splice(clusters.indexOf(match), 1);
    clusters.push(merged);
  }
  return clusters;
}
