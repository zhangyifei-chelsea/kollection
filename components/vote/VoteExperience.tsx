'use client';
import { useState } from 'react';
import type { VoteImage, VoteOption } from '@/content/vote';

// Existing optimized derivatives and intrinsic proportions; no originals on this page.
function Photograph({ image }: { image: VoteImage }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" style={{ background: image.background }} />;
}
export function VoteExperience({ initialOptions, question }: { initialOptions: VoteOption[]; question: string }) {
  const [selected, setSelected] = useState('');
  return <div className="vote-experience">
    <p className="vote-instruction" role="note">Style preview only. Voting is unavailable; selections are not submitted or saved.</p>
    <fieldset className="vote-choices">
      <legend>{question}</legend>
      <p className="vote-instruction">Explore the styles and select one to preview.</p>
      <div className="vote-grid">
        {initialOptions.map((option, index) => <div className="vote-option" key={option.id}>
          <label className={`vote-card${selected === option.id ? ' is-selected' : ''}`}>
            <input type="radio" name="mochamaru-style" aria-label={option.title} aria-describedby={option.description ? `description-${option.id}` : undefined} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} />
            <span className="vote-card-image"><Photograph image={option.cover} /></span>
            <span className="vote-card-copy"><span className="vote-card-number">{String(index + 1).padStart(2, '0')}</span><span className="vote-card-title">{option.title}</span><span className="vote-selection" aria-hidden="true" /><span className="vote-card-description" id={`description-${option.id}`}>{option.description}</span></span>
          </label>
          {option.images.length > 0 && <details className="vote-more"><summary>More from this style</summary>{option.images.map((image) => <Photograph key={image.id} image={image} />)}</details>}
        </div>)}
      </div>
    </fieldset>
  </div>;
}
