import { photos } from './photos';
import type { PhotoLocation } from './photo-locations';

/** MOCK LOCATION DATA — fictional photo assignments, never capture evidence.
 * City coordinates themselves are from the linked GeoNames records (CC BY 4.0).
 * Disable this flag when replacing the demonstration with verified metadata.
 */
export const enableMockLocations = true;
export const mockLocations: PhotoLocation[] = [
  { id: 'seoul', city: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.566, longitude: 126.9784, coordinateSource: 'https://www.geonames.org/1835848/seoul.html', source: 'mock' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6895, longitude: 139.69171, coordinateSource: 'https://www.geonames.org/1850147/tokyo.html', source: 'mock' },
  { id: 'osaka', city: 'Osaka', country: 'Japan', countryCode: 'JP', latitude: 34.69379, longitude: 135.50107, coordinateSource: 'https://www.geonames.org/1853909/osaka.html', source: 'mock' },
  { id: 'los-angeles', city: 'Los Angeles', country: 'United States', countryCode: 'US', latitude: 34.05223, longitude: -118.24368, coordinateSource: 'https://www.geonames.org/5368361/los-angeles.html', source: 'mock' },
  { id: 'hong-kong', city: 'Hong Kong', country: 'Hong Kong SAR', countryCode: 'HK', latitude: 22.27832, longitude: 114.17469, coordinateSource: 'https://www.geonames.org/1819729/hong-kong.html', source: 'mock' },
  { id: 'shanghai', city: 'Shanghai', country: 'China', countryCode: 'CN', latitude: 31.22222, longitude: 121.45806, coordinateSource: 'https://www.geonames.org/1796236/shanghai.html', source: 'mock' },
];

// MOCK LOCATION DATA: deterministic IDs keep assignments stable when photo order changes.
export const mockPhotoLocationIds: Record<string, string> = Object.fromEntries(
  photos.map(photo => {
    let hash = 2166136261;
    for (const char of photo.id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    return [photo.id, mockLocations[(hash >>> 0) % mockLocations.length].id];
  }),
);
