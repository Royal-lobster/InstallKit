"use client";

import { AppShell } from "@/app/(layout)/app-shell";
import { AppSelector } from "../(landing)/_components/app-selector";
import { InstallKitProvider } from "../(landing)/_hooks/use-installkit";

interface AppSelectionLayoutProps {
  kitName?: string;
  kitDescription?: string;
  initialSelectedAppIds?: string[];
  initialCustomPackages?: Array<{
    token: string;
    name: string;
    type: "cask" | "formula";
  }>;
}

export function AppSelectionLayout({
  kitName,
  kitDescription,
  initialSelectedAppIds = [],
  initialCustomPackages = [],
}: AppSelectionLayoutProps) {
  return (
    <InstallKitProvider
      initialSelectedAppIds={initialSelectedAppIds}
      initialCustomPackages={initialCustomPackages}
      kitName={kitName}
      kitDescription={kitDescription}
    >
      <AppShell>
        <AppSelector />
      </AppShell>
    </InstallKitProvider>
  );
}
