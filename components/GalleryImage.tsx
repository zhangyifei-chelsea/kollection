/* eslint-disable @next/next/no-img-element -- Explicit WebP paths and wall-root IntersectionObserver control image requests. */
import type { Photo } from "@/content/photos";

export function GalleryImage({ photo }: { photo: Photo }) {
  const caption = [photo.title, photo.event, photo.date, photo.credit]
    .filter(Boolean)
    .join(" · ");

  return (
    <figure
      className="gallery-work"
      style={{ "--aspect": photo.width / photo.height } as React.CSSProperties}
    >
      <a
        className="photo-surface photo-link"
        href={photo.gallerySrc}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${photo.alt} full-screen`}
        style={{ backgroundColor: photo.dominantColor }}
        data-pswp-src={photo.fullscreenSrc}
        data-pswp-width={photo.fullscreenWidth}
        data-pswp-height={photo.fullscreenHeight}
        data-photo-caption={caption}
        data-photo-alt={photo.alt}
      >
        <img
          data-gallery-src={photo.gallerySrc}
          alt={photo.alt}
          width={photo.galleryWidth}
          height={photo.galleryHeight}
          decoding="async"
          fetchPriority="low"
        />
        <noscript>
          <style>{"img[data-gallery-src]{display:none!important}"}</style>
          <img
            src={photo.gallerySrc}
            alt={photo.alt}
            width={photo.galleryWidth}
            height={photo.galleryHeight}
            loading="lazy"
          />
        </noscript>
      </a>
      <figcaption>
        <span>
          {photo.id} <span className="caption-divider">/</span> {photo.title}
        </span>
        <span className="sample-label">{photo.date ?? "Photograph"}</span>
      </figcaption>
    </figure>
  );
}
