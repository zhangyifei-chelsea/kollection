import type { Photo } from '@/content/photos';
import { verifiedPhotoLocations } from '@/content/photo-locations';
import { enableMockLocations, mockLocations, mockPhotoLocationIds } from '@/content/mock-photo-locations';

/** Fictional assignments stay separate; an explicit verified assignment always wins. */
export function displayPhotoLocation(photo: Photo) {
  if (photo.locationId) return verifiedPhotoLocations.find(location => location.id === photo.locationId);
  return enableMockLocations ? mockLocations.find(location => location.id === mockPhotoLocationIds[photo.id]) : undefined;
}
