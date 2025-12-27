import { type App, type AppCategory, CATEGORIES } from "../../lib/data/apps";
import { AppCard } from "../_brew-picker/app-card";

export function CategorySection({
	categoryId,
	apps,
	selectedApps,
	onToggle,
}: {
	categoryId: AppCategory;
	apps: App[];
	selectedApps: Set<string>;
	onToggle: (appId: string) => void;
}) {
	const category = CATEGORIES.find((c) => c.id === categoryId);
	if (!category) return null;

	return (
		<section>
			<div className="mb-3 flex items-center gap-2">
				<h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
					{category.label}
				</h2>
				<span className="font-mono text-[10px] text-muted-foreground/60">
					({apps.length})
				</span>
				<div className="h-px flex-1 bg-border" />
			</div>
			<div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{apps.map((app) => (
					<AppCard
						key={app.id}
						app={app}
						isSelected={selectedApps.has(app.id)}
						onToggle={onToggle}
					/>
				))}
			</div>
		</section>
	);
}
