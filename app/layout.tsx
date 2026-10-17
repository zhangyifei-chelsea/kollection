import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Moments of K — A Birthday Photo Exhibition",
  description:
    "A celebration in photographs. Four chapters of light, connection, and the moments in between.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to exhibition
        </a>
        {children}
      </body>
    </html>
  );
}
