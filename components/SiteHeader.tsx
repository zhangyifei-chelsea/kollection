"use client";
import Link from "next/link";

export function SiteHeader(_props: { exhibitionPage?: boolean }) {
  return (
    <header className="site-header page-inset flex items-center justify-between">
      <Link
        href={"/"}
        className="wordmark"
        aria-label="Moments of K — entrance"
      >
        MOMENTS OF K<span className="wordmark-dot">.</span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="desktop-nav flex items-center gap-10"
      >
        <Link href={"/"}>Calendar</Link>
        <Link href="/explore">Explore</Link>
        <Link href={"/about"}>About & credits</Link>
        <span className="edition">2026 EDITION</span>
      </nav>
      <details className="mobile-menu">
        <summary>
          Menu <span aria-hidden="true">＋</span>
        </summary>
        <nav
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a"))
              event.currentTarget.closest("details")?.removeAttribute("open");
          }}
        >
          <Link href="/">Calendar</Link>
          <Link href="/explore">Explore</Link>
          <Link href={"/about"}>About & credits</Link>
        </nav>
      </details>
    </header>
  );
}
