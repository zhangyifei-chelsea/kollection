import definition from './mochamaru.json';
import { photos } from '@/content/photos';
export type VoteImage = { id: string; src: string; width: number; height: number; alt: string; background: string };
export type VoteOption = { id: string; title: string; description: string | null; cover: VoteImage; images: VoteImage[]; displayOrder: number };

// Editorial preview options; no voting service is connected.
export const voteDefinition = definition;
export function voteImage(id: string): VoteImage {
  const photo = photos.find((item) => item.id === id);
  if (!photo) throw new Error(`Unknown voting photograph: ${id}`);
  return { id, src: photo.gallerySrc, width: photo.galleryWidth, height: photo.galleryHeight, alt: photo.alt, background: photo.dominantColor ?? '#d4c9bc' };
}
export const initialVoteOptions: VoteOption[] = definition.options.filter((option) => option.isActive).sort((a, b) => a.displayOrder - b.displayOrder).map((option) => ({
  id: option.id, title: option.title, description: option.description, cover: voteImage(option.coverImageId), images: option.additionalImageIds.map(voteImage), displayOrder: option.displayOrder,
}));
