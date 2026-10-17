'use client';
import { useEffect, useRef } from 'react';
import type { Photo } from '@/content/photos';
import { ExhibitionLightbox } from './ExhibitionLightbox';
import { GalleryImage } from './GalleryImage';
import { queueGalleryImage } from '@/lib/image-load-queue';

export function ExploreGallery({ photos }: { photos: Photo[] }) {
  const gallery = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        queueGalleryImage(entry.target as HTMLImageElement);
      }
    }, { rootMargin: '240px' });
    gallery.current?.querySelectorAll('img[data-gallery-src]').forEach(image => observer.observe(image));
    return () => observer.disconnect();
  }, [photos]);
  return <><ExhibitionLightbox/><div ref={gallery} className="explore-gallery" data-photo-gallery>{photos.map(photo => <GalleryImage key={photo.id} photo={photo} />)}</div></>;
}
