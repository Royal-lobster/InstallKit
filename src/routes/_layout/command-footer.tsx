import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommandFooter({
	brewCommand,
	selectedCount,
	copied,
	onCopy,
}: {
	brewCommand: string;
	selectedCount: number;
	copied: boolean;
	onCopy: () => void;
}) {
	return (
		<footer className="fixed inset-x-0 bottom-0 border-t border-border bg-background">
			<div className="mx-auto max-w-6xl px-4 py-3">
				<div className="flex items-stretch gap-2">
					<div
						className={cn(
							"flex flex-1 items-center overflow-x-auto border border-border bg-card px-3 font-mono text-xs",
							!brewCommand && "text-muted-foreground",
						)}
					>
						<code className="whitespace-nowrap">
							{brewCommand || "$ brew install --cask ..."}
						</code>
					</div>
					<Button
						onClick={onCopy}
						disabled={!brewCommand}
						className="h-auto shrink-0 gap-1.5 px-4 py-2.5 font-mono text-xs"
					>
						{copied ? (
							<>
								<CheckIcon className="size-3.5" weight="bold" />
								COPIED
							</>
						) : (
							<>
								<CopyIcon className="size-3.5" />
								COPY
							</>
						)}
					</Button>
				</div>
				{selectedCount > 0 && (
					<p className="mt-2 font-mono text-[10px] text-muted-foreground">
						{selectedCount} app{selectedCount !== 1 && "s"} selected
					</p>
				)}
			</div>
		</footer>
	);
}
