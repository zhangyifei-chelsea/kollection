import { exhibition } from "@/content/exhibition";
export function FinalRoom() {
  return (
    <section id="credits" className="final-room page-inset">
      <p className="eyebrow">The moments continue</p>
      <h2>
        Happy Birthday, <em>K.</em>
      </h2>
      <p className="dedication">{exhibition.dedication}</p>
      <p className="closing-date">21 / 10 / 2026</p>
      <div className="credits">
        <div>
          <p className="eyebrow">About this exhibition</p>
          <p>
            A small collection, for someone who means so much.
          </p>
        </div>
        <div>
          <p className="eyebrow">Photography &amp; permissions</p>
          <p>
            Photographs supplied for this exhibition.
            <br />
            Photographer credits and publication permissions to be confirmed.
          </p>
        </div>
      </div>
      <footer>
        <a className="wordmark" href="#entrance">
          MOMENTS OF K.
        </a>
        <span className="eyebrow">A birthday photo exhibition · 2026</span>
        <a href="#entrance" className="back-top">
          Back to the entrance ↑
        </a>
      </footer>
    </section>
  );
}
