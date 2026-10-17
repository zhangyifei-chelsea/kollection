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
  date?: string;
  credit?: string;
  tags: string[];
  dominantColor: string;
};
