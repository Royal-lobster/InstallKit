"use client";

import { PackageIcon } from "@phosphor-icons/react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

interface AppIconProps {
  iconUrl: string;
  invertInDark?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const sizePx = {
  sm: 20,
  md: 24,
} as const;

const sizeClasses = {
  sm: "size-5",
  md: "size-6",
} as const;

const isFaviconUrl = (url: string) =>
  url.startsWith("https://icons.duckduckgo.com/");

export function AppIcon({
  iconUrl,
  invertInDark,
  size = "sm",
  className,
}: AppIconProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClass = sizeClasses[size];
  const pixelSize = sizePx[size];

  if (hasError) {
    return (
      <PackageIcon
        className={cn(sizeClass, "text-muted-foreground", className)}
      />
    );
  }

  if (isFaviconUrl(iconUrl)) {
    return (
      <Image
        src={iconUrl}
        alt=""
        width={pixelSize}
        height={pixelSize}
        className={cn(
          sizeClass,
          "object-contain",
          invertInDark && "dark:invert",
          className,
        )}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    // biome-ignore lint/performance/noImgElement: External SVG icons from simpleicons
    <img
      src={iconUrl}
      alt=""
      className={cn(
        sizeClass,
        "object-contain",
        invertInDark && "dark:invert",
        className,
      )}
      onError={() => setHasError(true)}
    />
  );
}
