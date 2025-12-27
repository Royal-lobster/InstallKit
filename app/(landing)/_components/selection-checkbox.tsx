"use client";

import { CheckIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface SelectionCheckboxProps {
	isSelected: boolean;
	onToggle?: (appId: string) => void;
	appId?: string;
}

export function SelectionCheckbox({
	isSelected,
	onToggle,
	appId,
}: SelectionCheckboxProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => appId && onToggle?.(appId)}
			onKeyDown={(e) => {
				if ((e.key === "Enter" || e.key === " ") && appId) {
					e.preventDefault();
					onToggle?.(appId);
				}
			}}
			className={cn(
				"flex size-4 shrink-0 items-center justify-center border transition-colors cursor-pointer",
				isSelected
					? "border-primary bg-primary text-primary-foreground"
					: "border-muted-foreground/30 bg-transparent",
			)}
		>
			{isSelected && <CheckIcon className="size-2.5" weight="bold" />}
		</div>
	);
}
