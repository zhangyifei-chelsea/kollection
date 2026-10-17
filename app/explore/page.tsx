import { Suspense } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { ExplorerViews } from '@/components/ExplorerViews';
import { photos } from '@/content/photos';

export const metadata = { title: 'Explore — Moments of K' };
export default function ExplorePage() {
  return <>
    <SiteHeader exhibitionPage={false}/>
    <main id="main" className="explore-page page-inset">
      <header className="explore-intro">
        <p className="eyebrow">Moments of K / Explore</p>
        <h1>Every day,<br/><em>a different memory.</em></h1>
        <p>A quieter way through the collection. Follow the photographs through time.</p>
      </header>
      <Suspense fallback={<p>Opening the collection…</p>}>
        <ExplorerViews photos={photos}/>
      </Suspense>
      <footer className="explore-footer"><Link href="/">← Return to the exhibition</Link></footer>
    </main>
  </>;
}
