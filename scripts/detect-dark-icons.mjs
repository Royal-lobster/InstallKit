#!/usr/bin/env node

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPS_FILE = join(__dirname, "../src/lib/data/apps.ts");

const BRIGHTNESS_THRESHOLD = 50;
const DARK_PIXEL_RATIO_THRESHOLD = 0.7;

async function analyzeIconBrightness(url) {
	try {
		const img = await loadImage(url);
		const canvas = createCanvas(img.width, img.height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		let darkPixels = 0;
		let totalOpaquePixels = 0;

		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			if (a < 128) continue;

			totalOpaquePixels++;
			const brightness = (r + g + b) / 3;

			if (brightness < BRIGHTNESS_THRESHOLD) {
				darkPixels++;
			}
		}

		if (totalOpaquePixels === 0) return { isDark: false, ratio: 0 };

		const darkRatio = darkPixels / totalOpaquePixels;
		return {
			isDark: darkRatio > DARK_PIXEL_RATIO_THRESHOLD,
			ratio: darkRatio,
		};
	} catch (error) {
		console.error(`  Error loading ${url}: ${error.message}`);
		return { isDark: false, ratio: 0, error: true };
	}
}

function extractAppsFromFile(content) {
	const apps = [];
	const appRegex =
		/\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],[\s\S]*?iconUrl:\s*(?:simpleIcon|favicon)\(['"]([^'"]+)['"]\)/g;

	let match = appRegex.exec(content);
	while (match !== null) {
		const [, id, name, iconParam] = match;
		const isSimpleIcon = match[0].includes("simpleIcon");
		const iconUrl = isSimpleIcon
			? `https://cdn.simpleicons.org/${iconParam.toLowerCase().replace(/\s+/g, "")}`
			: `https://icons.duckduckgo.com/ip3/${iconParam}.ico`;

		apps.push({ id, name, iconUrl, isSimpleIcon });
		match = appRegex.exec(content);
	}
	return apps;
}

async function main() {
	console.log("Reading apps.ts...");
	const content = readFileSync(APPS_FILE, "utf-8");

	const apps = extractAppsFromFile(content);
	console.log(`Found ${apps.length} apps\n`);

	const darkIcons = [];

	for (const app of apps) {
		process.stdout.write(`Analyzing ${app.name}... `);
		const result = await analyzeIconBrightness(app.iconUrl);

		if (result.error) {
			console.log("ERROR");
		} else if (result.isDark) {
			console.log(`DARK (${(result.ratio * 100).toFixed(1)}% dark pixels)`);
			darkIcons.push(app.id);
		} else {
			console.log(`OK (${(result.ratio * 100).toFixed(1)}% dark pixels)`);
		}
	}

	console.log("\n--- Summary ---");
	console.log(`Total apps: ${apps.length}`);
	console.log(`Dark icons needing inversion: ${darkIcons.length}`);

	if (darkIcons.length > 0) {
		console.log("\nIcons that need invertInDark: true:");
		for (const id of darkIcons) {
			console.log(`  - ${id}`);
		}

		console.log("\nApplying changes to apps.ts...");
		let updatedContent = content;

		for (const id of darkIcons) {
			const pattern = new RegExp(
				`(id:\\s*['"]${id}['"][\\s\\S]*?iconUrl:\\s*(?:simpleIcon|favicon)\\(['"][^'"]+['"]\\))`,
				"g",
			);

			updatedContent = updatedContent.replace(pattern, (match) => {
				if (match.includes("invertInDark")) return match;
				return `${match},\n    invertInDark: true`;
			});
		}

		writeFileSync(APPS_FILE, updatedContent);
		console.log("Done! Updated apps.ts with invertInDark flags.");
	}
}

main().catch(console.error);
