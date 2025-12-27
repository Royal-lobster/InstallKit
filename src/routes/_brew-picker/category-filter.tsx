import { cn } from "@/lib/utils";
import { type AppCategory, CATEGORIES } from "../../lib/data/apps";

interface CategoryFilterProps {
	selectedCategory: AppCategory | "all";
	onCategoryChange: (category: AppCategory | "all") => void;
}

export function CategoryFilter({
	selectedCategory,
	onCategoryChange,
}: CategoryFilterProps) {
	return (
		<div className="flex flex-wrap gap-1.5">
			<FilterButton
				isSelected={selectedCategory === "all"}
				onClick={() => onCategoryChange("all")}
			>
				All
			</FilterButton>
			{CATEGORIES.map((category) => (
				<FilterButton
					key={category.id}
					isSelected={selectedCategory === category.id}
					onClick={() => onCategoryChange(category.id)}
				>
					{category.label}
				</FilterButton>
			))}
		</div>
	);
}

function FilterButton({
	children,
	isSelected,
	onClick,
}: {
	children: React.ReactNode;
	isSelected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"border px-2.5 py-1 font-mono text-[11px] transition-colors",
				"hover:bg-muted/50",
				"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				isSelected
					? "border-primary bg-primary text-primary-foreground"
					: "border-border bg-card text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
		</button>
	);
}
