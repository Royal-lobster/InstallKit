import { PackageIcon } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface AppIconProps {
	iconUrl: string;
	invertInDark?: boolean;
	size?: "sm" | "md";
	className?: string;
}

const sizeClasses = {
	sm: "size-5",
	md: "size-6",
} as const;

export function AppIcon({
	iconUrl,
	invertInDark,
	size = "sm",
	className,
}: AppIconProps) {
	const [hasError, setHasError] = React.useState(false);

	const sizeClass = sizeClasses[size];

	if (hasError) {
		return (
			<PackageIcon
				className={cn(sizeClass, "text-muted-foreground", className)}
			/>
		);
	}

	return (
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
