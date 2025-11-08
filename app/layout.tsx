import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapse - Your Second Brain",
  description: "Capture, organize, and search your thoughts intelligently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

