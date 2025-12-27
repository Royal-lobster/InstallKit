import { CheckIcon, PackageIcon } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@/lib/utils";
import type { App } from "../../lib/data/apps";

interface AppCardProps {
	app: App;
	isSelected: boolean;
	onToggle: (appId: string) => void;
}

export function AppCard({ app, isSelected, onToggle }: AppCardProps) {
	const [iconError, setIconError] = React.useState(false);

	return (
		<button
			type="button"
			onClick={() => onToggle(app.id)}
			className={cn(
				"group flex items-center gap-2.5 border px-2.5 py-2 text-left transition-colors",
				"hover:bg-muted/50",
				"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-card",
			)}
		>
			<div className="flex size-5 shrink-0 items-center justify-center">
				{iconError ? (
					<PackageIcon className="size-5 text-muted-foreground" />
				) : (
					<img
						src={app.iconUrl}
						alt=""
						className="size-5 object-contain"
						onError={() => setIconError(true)}
					/>
				)}
			</div>
			<span className="min-w-0 flex-1 truncate font-mono text-xs">
				{app.name}
			</span>
			<div
				className={cn(
					"flex size-4 shrink-0 items-center justify-center border transition-colors",
					isSelected
						? "border-primary bg-primary text-primary-foreground"
						: "border-muted-foreground/30 bg-transparent",
				)}
			>
				{isSelected && <CheckIcon className="size-2.5" weight="bold" />}
			</div>
		</button>
	);
}
