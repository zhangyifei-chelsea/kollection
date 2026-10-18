import type { ChapterId } from './exhibition';

export type Photo = {
  id: string;
  chapterId: ChapterId;
  gallerySrc: string;
  fullscreenSrc: string;
  width: number;
  height: number;
  galleryWidth: number;
  galleryHeight: number;
  galleryBytes: number;
  fullscreenWidth: number;
  fullscreenHeight: number;
  fullscreenBytes: number;
  alt: string;
  title: string;
  event?: string;
  /** Confirmed event category, separate from editorial content tags. */
  eventType?: string;
  /** Confirmed local capture time as curated text; date stays a literal capture date. */
  captureTime?: string;
  date?: string;
  credit?: string;
  /** Confirmed capture location only; demonstration assignments live separately. */
  locationId?: string;
  tags: string[];
  dominantColor: string;
};
