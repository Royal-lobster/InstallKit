import { CheckIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface SelectionCheckboxProps {
	isSelected: boolean;
}

export function SelectionCheckbox({ isSelected }: SelectionCheckboxProps) {
	return (
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
	);
}
