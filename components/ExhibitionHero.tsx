import Image from "next/image";
import { exhibition } from "@/content/exhibition";
import { photos } from "@/content/photos";
export function ExhibitionHero() {
  const hero = photos[0];
  return (
    <section id="entrance" className="entrance page-inset">
      <div className="hero-copy">
        <p className="eyebrow">A celebration in photographs</p>
        <h1>
          {exhibition.title.split(" ").slice(0, -2).join(" ")}
          <br />
          of <em>{exhibition.title.split(" ").at(-1)}.</em>
        </h1>
        <p className="hero-subtitle">{exhibition.subtitle}</p>
        <div className="hero-date">
          <span className="tiny-rule" />
          {exhibition.date}
        </div>
        <a href="#spotlight" className="explore">
          Explore the exhibition <span aria-hidden="true">↓</span>
        </a>
      </div>
      <figure className="hero-art">
        <div className="hero-photo">
          <Image
            src={hero.gallerySrc}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            preload
            unoptimized
            sizes="(max-width: 767px) 85vw, 48vw"
          />
        </div>
        <figcaption>
          <span>A study in light</span>
          <span>{hero.id}</span>
        </figcaption>
      </figure>
      <div className="entrance-bottom">
        <span>Four chapters. A thousand little moments.</span>
        <span>
          SCROLL TO DISCOVER <span aria-hidden="true">↓</span>
        </span>
      </div>
    </section>
  );
}
