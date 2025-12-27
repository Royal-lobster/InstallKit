import { CATEGORIES } from "../../_schema";
import type { AppCategory } from "../../_schema";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface CategoryFilterProps {
	selectedCategory: AppCategory | "all";
	onCategoryChange: (category: AppCategory | "all") => void;
}

export function CategoryFilter({
	selectedCategory,
	onCategoryChange,
}: CategoryFilterProps) {
	return (
		<ToggleGroup
			value={[selectedCategory]}
			onValueChange={(values) => {
				const newValue = values.find((v) => v !== selectedCategory);
				if (newValue) {
					onCategoryChange(newValue as AppCategory | "all");
				}
			}}
			spacing={1}
			className="flex-wrap"
		>
			<ToggleGroupItem
				value="all"
				className="px-2.5 py-1 font-mono text-[11px]"
			>
				All
			</ToggleGroupItem>
			{CATEGORIES.map((category) => (
				<ToggleGroupItem
					key={category.id}
					value={category.id}
					className="px-2.5 py-1 font-mono text-[11px]"
				>
					{category.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
