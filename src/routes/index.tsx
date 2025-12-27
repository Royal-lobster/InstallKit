import { createFileRoute } from "@tanstack/react-router";
import Fuse from "fuse.js";
import * as React from "react";
import {
	APPS,
	type App,
	type AppCategory,
	CATEGORIES,
	generateBrewCommand,
} from "../lib/data/apps";
import { AppCard } from "./_brew-picker/app-card";
import { CategoryFilter } from "./_brew-picker/category-filter";
import { CategorySection } from "./_layout/category-section";
import { CommandFooter } from "./_layout/command-footer";
import { Header } from "./_layout/header";

export const Route = createFileRoute("/")({ component: TakeOver });

const fuse = new Fuse(APPS, {
	keys: ["name", "description", "brewName"],
	threshold: 0.4,
	ignoreLocation: true,
});

function TakeOver() {
	const [selectedApps, setSelectedApps] = React.useState<Set<string>>(
		new Set(),
	);
	const [selectedCategory, setSelectedCategory] = React.useState<
		AppCategory | "all"
	>("all");
	const [searchQuery, setSearchQuery] = React.useState("");
	const [copied, setCopied] = React.useState(false);

	const filteredApps = React.useMemo(() => {
		let apps: App[];

		if (searchQuery.trim()) {
			const results = fuse.search(searchQuery.trim());
			apps = results.map((r) => r.item);
		} else {
			apps = APPS;
		}

		if (selectedCategory !== "all") {
			apps = apps.filter((app) => app.category === selectedCategory);
		}

		return apps;
	}, [searchQuery, selectedCategory]);

	const appsByCategory = React.useMemo(() => {
		const grouped = new Map<AppCategory, App[]>();
		for (const category of CATEGORIES) {
			const categoryApps = filteredApps.filter(
				(app) => app.category === category.id,
			);
			if (categoryApps.length > 0) {
				grouped.set(category.id, categoryApps);
			}
		}
		return grouped;
	}, [filteredApps]);

	const brewCommand = generateBrewCommand(Array.from(selectedApps));

	const handleToggle = (appId: string) => {
		setSelectedApps((prev) => {
			const next = new Set(prev);
			if (next.has(appId)) {
				next.delete(appId);
			} else {
				next.add(appId);
			}
			return next;
		});
	};

	const handleCopy = async () => {
		if (!brewCommand) return;
		await navigator.clipboard.writeText(brewCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleClearAll = () => {
		setSelectedApps(new Set());
	};

	const showCategorySections = selectedCategory === "all";

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header
				selectedCount={selectedApps.size}
				onClearAll={handleClearAll}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			<main className="flex-1 pb-24">
				<div className="mx-auto max-w-6xl px-4 py-4">
					<CategoryFilter
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
					/>

					<div className="mt-6">
						{filteredApps.length > 0 ? (
							showCategorySections ? (
								<div className="space-y-8">
									{Array.from(appsByCategory.entries()).map(
										([categoryId, apps]) => (
											<CategorySection
												key={categoryId}
												categoryId={categoryId}
												apps={apps}
												selectedApps={selectedApps}
												onToggle={handleToggle}
											/>
										),
									)}
								</div>
							) : (
								<div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{filteredApps.map((app) => (
										<AppCard
											key={app.id}
											app={app}
											isSelected={selectedApps.has(app.id)}
											onToggle={handleToggle}
										/>
									))}
								</div>
							)
						) : (
							<div className="py-16 text-center font-mono text-sm text-muted-foreground">
								No apps found for "{searchQuery}"
							</div>
						)}
					</div>
				</div>
			</main>

			<CommandFooter
				brewCommand={brewCommand}
				selectedCount={selectedApps.size}
				copied={copied}
				onCopy={handleCopy}
			/>
		</div>
	);
}
