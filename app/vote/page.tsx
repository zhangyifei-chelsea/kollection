import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { VoteExperience } from '@/components/vote/VoteExperience';
import { initialVoteOptions, voteDefinition } from '@/content/vote';
import './vote.css';

export const metadata = { title: 'The Mochamaru Edit — Moments of K', description: 'Explore Mochamaru styles. A visual preview; voting is unavailable.' };
export default function VotePage() {
  return <>
    <SiteHeader exhibitionPage={false} />
    <main id="main" className="vote-page page-inset">
      <header className="vote-intro">
        <p className="eyebrow">Interactive experience / 01</p>
        <h1>The Mochamaru <em>Edit.</em></h1>
        <p className="vote-preface">Four ways of seeing. One feeling that stays.</p>
      </header>
      <VoteExperience initialOptions={initialVoteOptions} question={voteDefinition.question} />
      <footer className="vote-footer"><Link href="/">← Return to the exhibition</Link><span>Moments of K / A little collection of love</span></footer>
    </main>
  </>;
}
