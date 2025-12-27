#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APPS_FILE = join(__dirname, '../src/routes/_brew-picker/_data/apps.ts')

async function checkSimpleIcon(name) {
  try {
    const res = await fetch(`https://cdn.simpleicons.org/${name}`, {
      method: 'HEAD',
    })
    return res.ok
  } catch {
    return false
  }
}

function getBrewHomepage(caskName) {
  try {
    const output = execSync(`brew info --cask --json=v2 ${caskName}`, {
      encoding: 'utf-8',
      timeout: 10000,
    })
    const data = JSON.parse(output)
    return data.casks?.[0]?.homepage || null
  } catch {
    return null
  }
}

function extractDomain(url) {
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    return null
  }
}

async function main() {
  console.log('Reading apps.ts...')
  let content = readFileSync(APPS_FILE, 'utf-8')

  const appBlockRegex =
    /\{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*brewName:\s*['"]([^'"]+)['"][^}]+iconUrl:\s*simpleIcon\(['"]([^'"]+)['"]\)/g

  const matches = [...content.matchAll(appBlockRegex)]
  console.log(`Found ${matches.length} apps with simpleIcon...`)

  const toFix = []

  for (const match of matches) {
    const [fullMatch, id, name, brewName, iconName] = match
    process.stdout.write(`Checking ${name} (${iconName})... `)

    const hasIcon = await checkSimpleIcon(iconName)
    if (hasIcon) {
      console.log('✓')
    } else {
      console.log('✗ MISSING')
      toFix.push({ id, name, brewName, iconName, fullMatch })
    }
  }

  console.log(`\n${toFix.length} apps need favicon fallback`)

  if (toFix.length === 0) {
    console.log('All icons are valid!')
    return
  }

  console.log('\nFetching homepages from brew...')
  const fixes = []

  for (const app of toFix) {
    process.stdout.write(`Getting homepage for ${app.brewName}... `)
    const homepage = getBrewHomepage(app.brewName)
    if (homepage) {
      const domain = extractDomain(homepage)
      console.log(domain)
      fixes.push({ ...app, domain })
    } else {
      console.log('NOT FOUND')
    }
  }

  console.log(`\nApplying ${fixes.length} fixes...`)

  for (const fix of fixes) {
    const oldPattern = `simpleIcon('${fix.iconName}')`
    const newValue = `favicon("${fix.domain}")`
    content = content.replace(oldPattern, newValue)
    console.log(`  ${fix.name}: ${fix.iconName} → ${fix.domain}`)
  }

  writeFileSync(APPS_FILE, content)
  console.log('\nDone! Updated apps.ts')
}

main().catch(console.error)
