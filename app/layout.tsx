import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./(layout)/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstallKit - Homebrew App Picker",
  description:
    "Select apps and generate a brew install command. Install your Mac essentials faster.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
