"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Chapter } from "@/content/exhibition";
import type { Photo } from "@/content/photos";
import { queueGalleryImage } from "@/lib/image-load-queue";
import { GalleryImage } from "./GalleryImage";
import { GalleryProgress } from "./GalleryProgress";
export function ChapterGallery({
  chapter,
  photos,
}: {
  chapter: Chapter;
  photos: Photo[];
}) {
  const wall = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [state, setState] = useState({ progress: 0, overflow: true });
  const measure = useCallback(() => {
    const el = wall.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      progress: max > 1 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0,
      overflow: max > 1,
    });
  }, []);
  useEffect(() => {
    const el = wall.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    let imageObserver: IntersectionObserver | undefined;
    const chapterObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !imageObserver) {
          imageObserver = new IntersectionObserver(
            (imageEntries) => {
              for (const imageEntry of imageEntries) {
                if (!imageEntry.isIntersecting) continue;
                const image = imageEntry.target as HTMLImageElement;
                imageObserver?.unobserve(image);
                queueGalleryImage(image);
              }
            },
            { root: el, rootMargin: "0px 480px 0px 480px", threshold: 0 },
          );
          el.querySelectorAll<HTMLImageElement>(
            "img[data-gallery-src]",
          ).forEach((image) => {
            if (!image.dataset.loaded) imageObserver?.observe(image);
          });
        } else if (!entry.isIntersecting && imageObserver) {
          imageObserver.disconnect();
          imageObserver = undefined;
        }
      },
      { rootMargin: "240px 0px 240px 0px", threshold: 0 },
    );
    if (sectionRef.current) chapterObserver.observe(sectionRef.current);
    measure();
    return () => {
      resizeObserver.disconnect();
      chapterObserver.disconnect();
      imageObserver?.disconnect();
    };
  }, [measure, photos]);
  function move(direction: number) {
    const el = wall.current;
    if (el)
      el.scrollBy({
        left: direction * el.clientWidth * 0.78,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <section
      ref={sectionRef}
      id={chapter.id}
      className={`chapter chapter-${chapter.theme}`}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="chapter-heading page-inset">
        <div className="chapter-meta eyebrow">
          <span>
            Chapter {String(chapter.index).padStart(2, "0")}{" "}
            <span className="meta-slash">/ 04</span>
          </span>
          <span>{String(photos.length).padStart(2, "0")} works</span>
        </div>
        <div className="chapter-title-row">
          <div>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            <p>{chapter.subtitle}</p>
          </div>
          <div className="gallery-controls">
            <button
              aria-label={`Scroll ${chapter.title} gallery left`}
              aria-controls={`${chapter.id}-wall`}
              disabled={!state.overflow || state.progress < 0.001}
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              aria-label={`Scroll ${chapter.title} gallery right`}
              aria-controls={`${chapter.id}-wall`}
              disabled={!state.overflow || state.progress > 0.999}
              onClick={() => move(1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div
        ref={wall}
        id={`${chapter.id}-wall`}
        className="gallery-wall"
        role="region"
        aria-label={`${chapter.title} photographs. Use left and right arrow keys to scroll.`}
        tabIndex={0}
        onScroll={measure}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(e.key === "ArrowRight" ? 1 : -1);
          }
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            wall.current?.scrollTo({
              left: e.key === "Home" ? 0 : wall.current.scrollWidth,
              behavior: "instant",
            });
          }
        }}
      >
        {photos.map((photo) => (
          <GalleryImage key={photo.id} photo={photo} />
        ))}
      </div>
      <div className="gallery-footer page-inset">
        <span className="eyebrow">
          {String(chapter.index).padStart(2, "0")}{" "}
          <span className="footer-note">/ A collection of moments</span>
        </span>
        <GalleryProgress {...state} title={chapter.title} />
        <span className="eyebrow scroll-hint">
          Scroll to explore <span aria-hidden="true">↔</span>
        </span>
      </div>
    </section>
  );
}
