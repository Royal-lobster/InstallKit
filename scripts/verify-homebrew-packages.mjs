#!/usr/bin/env node

/**
 * Script to verify which Homebrew packages are casks vs formulas
 * Queries Homebrew API to determine package type and updates apps.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPS_FILE = path.join(__dirname, "../src/lib/data/apps.ts");

// Homebrew API endpoints
const BREW_FORMULA_API = "https://formulae.brew.sh/api/formula.json";
const BREW_CASK_API = "https://formulae.brew.sh/api/cask.json";

async function fetchBrewData() {
	console.log("📦 Fetching Homebrew formula and cask data...\n");

	try {
		const [formulasRes, casksRes] = await Promise.all([
			fetch(BREW_FORMULA_API),
			fetch(BREW_CASK_API),
		]);

		if (!formulasRes.ok || !casksRes.ok) {
			throw new Error("Failed to fetch Homebrew data");
		}

		const formulas = await formulasRes.json();
		const casks = await casksRes.json();

		// Create lookup objects
		const formulaNames = new Set(formulas.map((f) => f.name));
		const caskNames = new Set(casks.map((c) => c.token));

		return { formulaNames, caskNames };
	} catch (error) {
		console.error("❌ Error fetching Homebrew data:", error.message);
		process.exit(1);
	}
}

function extractBrewNames(appsContent) {
	const brewNameRegex = /brewName:\s*"([^"]+)"/g;
	const brewNames = new Set();
	let match = brewNameRegex.exec(appsContent);

	while (match !== null) {
		brewNames.add(match[1]);
		match = brewNameRegex.exec(appsContent);
	}

	return brewNames;
}

function verifyPackages(brewNames, formulaNames, caskNames) {
	const results = {
		verified: [],
		unverified: [],
		casks: [],
		formulas: [],
	};

	for (const brewName of brewNames) {
		const isCask = caskNames.has(brewName);
		const isFormula = formulaNames.has(brewName);

		const record = {
			name: brewName,
			isCask,
			isFormula,
		};

		if (isCask || isFormula) {
			results.verified.push(record);
			if (isCask) results.casks.push(brewName);
			if (isFormula) results.formulas.push(brewName);
		} else {
			results.unverified.push(record);
		}
	}

	return results;
}

function generateIsCaskMap(results) {
	const map = {};

	for (const record of results.verified) {
		map[record.name] = record.isCask;
	}

	return map;
}

function updateAppsFile(appsContent, isCaskMap) {
	let updated = appsContent;

	// For each app, add isCask property based on brewName
	// Find all app objects and update them
	const appObjectRegex =
		/\{\s*id:\s*"([^"]+)"[\s\S]*?brewName:\s*"([^"]+)"[\s\S]*?category:[\s\S]*?description:[\s\S]*?iconUrl:[^}]*?(invertInDark:[^}]*)?\}/g;

	updated = updated.replace(appObjectRegex, (match, id, brewName) => {
		const isCask = isCaskMap[brewName];

		if (isCask === undefined) {
			return match;
		}

		// Check if isCask already exists
		if (match.includes("isCask:")) {
			// Update existing isCask
			return match.replace(/isCask:\s*true|false/, `isCask: ${isCask}`);
		}

		// Add isCask property before iconUrl
		const isCaskLine = `\n\t\tisCask: ${isCask},`;
		return match.replace(/(iconUrl:[\s\S]*?),/, `$1,${isCaskLine}`);
	});

	return updated;
}

function printReport(results) {
	console.log("\n📊 Verification Report:\n");
	console.log(`✅ Verified: ${results.verified.length}`);
	console.log(`   - Casks: ${results.casks.length}`);
	console.log(`   - Formulas: ${results.formulas.length}`);
	console.log(`❓ Unverified: ${results.unverified.length}\n`);

	if (results.unverified.length > 0) {
		console.log("⚠️  Packages not found in Homebrew:");
		results.unverified.forEach((pkg) => {
			console.log(`   - ${pkg.name}`);
		});
		console.log();
	}

	console.log("📦 Casks:");
	results.casks.forEach((name) => console.log(`   - ${name}`));

	console.log("\n🔧 Formulas:");
	results.formulas.forEach((name) => console.log(`   - ${name}`));
}

async function main() {
	console.log("🍺 Homebrew Package Verifier\n");
	console.log("=".repeat(50) + "\n");

	// Fetch Homebrew data
	const { formulaNames, caskNames } = await fetchBrewData();

	// Read apps.ts
	const appsContent = fs.readFileSync(APPS_FILE, "utf-8");

	// Extract brew names
	const brewNames = extractBrewNames(appsContent);
	console.log(`Found ${brewNames.size} unique brew packages to verify.\n`);

	// Verify packages
	const results = verifyPackages(brewNames, formulaNames, caskNames);

	// Print report
	printReport(results);

	// Generate isCask map
	const isCaskMap = generateIsCaskMap(results);

	// Update apps.ts with isCask values
	console.log("\n" + "=".repeat(50));
	console.log("\n📝 Updating apps.ts with isCask property...\n");

	const updatedContent = updateAppsFile(appsContent, isCaskMap);
	fs.writeFileSync(APPS_FILE, updatedContent);

	console.log("✅ Successfully updated apps.ts!");
	console.log(
		"\nNow you should update the generateBrewCommand function to use the isCask property.\n",
	);
}

main().catch((error) => {
	console.error("❌ Error:", error);
	process.exit(1);
});
