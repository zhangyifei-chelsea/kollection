"use client";

import { useEffect } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { photos } from "@/content/photos";

export function ExhibitionLightbox() {
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: ".gallery-wall",
      children: "a[data-pswp-src]",
      pswpModule: () => import("photoswipe"),
      loop: false,
      preload: [1, 1],
      returnFocus: false,
      trapFocus: true,
      escKey: true,
      arrowKeys: true,
      wheelToZoom: true,
      closeTitle: "Close photograph",
      zoomTitle: "Zoom photograph",
      arrowPrevTitle: "Previous photograph",
      arrowNextTitle: "Next photograph",
      errorMsg: "This photograph could not be loaded.",
      indexIndicatorSep: " / ",
      bgOpacity: 0.96,
      showHideAnimationType: "fade",
      padding: { top: 64, bottom: 88, left: 24, right: 24 },
    });

    lightbox.addFilter("domItemData", (itemData, _element, link) => {
      const photo = photos.find(
        (item) => item.fullscreenSrc === link.dataset.pswpSrc,
      );
      if (photo) itemData.alt = photo.alt;
      return itemData;
    });

    lightbox.on("uiRegister", () => {
      const pswp = lightbox.pswp;
      const ui = pswp?.ui;
      if (!pswp || !ui) return;

      pswp.on("destroy", () => {
        const slideElement = pswp.currSlide?.data.element;
        const wall = slideElement?.closest<HTMLElement>(".gallery-wall");
        const scrollLeft = wall?.scrollLeft;

        // PhotoSwipe's default focus restoration can scroll a horizontal wall.
        // Restore focus without scrolling, then return the wall to its prior offset.
        requestAnimationFrame(() => {
          slideElement?.focus({ preventScroll: true });
          if (wall && scrollLeft !== undefined) wall.scrollLeft = scrollLeft;
        });
      });

      ui.registerElement({
        name: "exhibition-caption",
        order: 9,
        isButton: false,
        appendTo: "root",
        html: "",
        onInit: (element, pswp) => {
          const update = () => {
            const item = photos.find(
              (photo) => photo.fullscreenSrc === pswp.currSlide?.data.src,
            );
            const text = item
              ? [item.id, item.title, item.event, item.date, item.credit]
                  .filter(Boolean)
                  .join(" · ")
              : "";
            element.textContent = text;
            element.setAttribute("aria-label", text || "Photograph metadata");
          };
          pswp.on("change", update);
          update();
        },
      });
    });

    lightbox.init();
    return () => lightbox.destroy();
  }, []);

  return null;
}
