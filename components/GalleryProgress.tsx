type Props = { progress: number; overflow: boolean; title: string };
export function GalleryProgress({ progress, overflow, title }: Props) {
  return (
    <div
      className={`gallery-progress ${overflow ? "" : "no-overflow"}`}
      role="progressbar"
      aria-label={`${title} scroll progress`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <span style={{ transform: `translateX(${progress * 300}%)` }} />
    </div>
  );
}
