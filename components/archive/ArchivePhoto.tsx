import Image from 'next/image';

type ArchivePhotoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
};

/** Complete, unmasked photographs; image proportions are preserved by the layout. */
export function ArchivePhoto({ src, alt, width, height, className = '', sizes = '(max-width: 700px) 11vw, 100px' }: ArchivePhotoProps) {
  return <span className={`archive-photo ${className}`}>
    <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="archive-photo-image"/>
  </span>;
}
