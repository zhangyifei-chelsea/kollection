"use client";
import { chapters } from "@/content/exhibition";
export function SiteHeader({ exhibitionPage = true }: { exhibitionPage?: boolean }) {
  return (
    <header className="site-header page-inset flex items-center justify-between">
      <a
        href={exhibitionPage ? "#entrance" : "/#entrance"}
        className="wordmark"
        aria-label="Moments of K — entrance"
      >
        MOMENTS OF K<span className="wordmark-dot">.</span>
      </a>
      <nav
        aria-label="Main navigation"
        className="desktop-nav flex items-center gap-10"
      >
        <a href={exhibitionPage ? "#spotlight" : "/#spotlight"}>Exhibition</a>
        <a href="/explore">Explore</a>
        <a href={exhibitionPage ? "#credits" : "/#credits"}>About & credits</a>
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
          {chapters.map((c) => (
            <a key={c.id} href={`${exhibitionPage ? "" : "/"}#${c.id}`}>
              {String(c.index).padStart(2, "0")} — {c.title}
            </a>
          ))}
          <a href="/explore">Explore</a>
          <a href={exhibitionPage ? "#credits" : "/#credits"}>About & credits</a>
        </nav>
      </details>
    </header>
  );
}
