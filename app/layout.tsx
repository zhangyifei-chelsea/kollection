import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Kollection-K / Moments of K",
  description:
    "A calendar-first photographic scrapbook. Discover the moments, piece by piece.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
