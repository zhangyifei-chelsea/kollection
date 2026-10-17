/** City coordinates and capture assignments are separate facts. */
export type PhotoLocation = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  coordinateSource: string;
  source: 'verified' | 'mock';
};

/** Add confirmed cities here, then set Photo.locationId in the photo source. */
export const verifiedPhotoLocations: (PhotoLocation & { source: 'verified' })[] = [];
