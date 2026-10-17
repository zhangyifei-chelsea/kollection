import { SiteHeader } from "@/components/SiteHeader";
import { ExhibitionHero } from "@/components/ExhibitionHero";
import { ChapterGallery } from "@/components/ChapterGallery";
import { ExhibitionLightbox } from "@/components/ExhibitionLightbox";
import { FinalRoom } from "@/components/FinalRoom";
import { chapters } from "@/content/exhibition";
import { photos } from "@/content/photos";
export default function Home() {
  return (
    <>
      <SiteHeader />
      <ExhibitionLightbox />
      <main id="main">
        <ExhibitionHero />
        <div className="exhibition-intro page-inset">
          <p className="eyebrow">The exhibition</p>
          <p>
            Some moments stay with us.
            <br />
            <em>These are a few of yours.</em>
          </p>
          <span className="eyebrow">
            {String(chapters.length).padStart(2, "0")} chapters /{" "}
            {photos.length} photographs
          </span>
        </div>
        {chapters.map((chapter) => (
          <ChapterGallery
            key={chapter.id}
            chapter={chapter}
            photos={photos.filter((p) => p.chapterId === chapter.id)}
          />
        ))}
        <FinalRoom />
      </main>
    </>
  );
}
