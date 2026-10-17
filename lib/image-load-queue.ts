const MAX_ACTIVE_REQUESTS = 3;
const waiting: HTMLImageElement[] = [];
const queued = new Set<HTMLImageElement>();
const active = new Set<HTMLImageElement>();

function pumpQueue() {
  while (active.size < MAX_ACTIVE_REQUESTS && waiting.length > 0) {
    const image = waiting.shift();
    if (!image) continue;
    queued.delete(image);
    const source = image.dataset.gallerySrc;
    if (!source || !image.isConnected) continue;
    active.add(image);
    const release = () => {
      active.delete(image);
      pumpQueue();
    };
    image.addEventListener('load', release, { once: true });
    image.addEventListener('error', release, { once: true });
    image.src = source;
    image.dataset.loaded = 'true';
  }
}

export function queueGalleryImage(image: HTMLImageElement) {
  if (image.dataset.loaded || queued.has(image) || active.has(image)) return;
  queued.add(image);
  waiting.push(image);
  pumpQueue();
}
