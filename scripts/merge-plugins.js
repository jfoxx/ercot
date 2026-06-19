#!/usr/bin/env node
/**
 * One-time migration: merge xwalk plugin definitions from blocks/_NAME.json
 * into ue/models/blocks/NAME.json so both da and xwalk plugins coexist.
 *
 * After running this, ue/models/blocks/*.json become the single source of
 * truth and package-for-Xwalk.json is no longer needed.
 *
 * Usage: node scripts/merge-plugins.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Blocks that exist in both ue/models/blocks/ and blocks/_NAME.json
const DUAL_SOURCE = [
  'accordion', 'card', 'card-carousel', 'cards', 'carousel',
  'columns', 'fragment', 'hero', 'quote', 'search',
  'section-title', 'table', 'tabs', 'video',
];

// Blocks that only exist as blocks/_NAME.json (no ue/models counterpart yet)
const XWALK_ONLY = ['embed', 'form', 'modal'];

function read(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function write(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

function uePath(name) {
  return resolve(root, `ue/models/blocks/${name}.json`);
}

function xwalkPath(name) {
  return resolve(root, `blocks/${name}/_${name}.json`);
}

// Merge xwalk plugins into existing DA definitions, matched by component id
function mergeDual(name) {
  const daPath = uePath(name);
  const xwPath = xwalkPath(name);

  if (!existsSync(xwPath)) {
    console.warn(`  SKIP ${name}: no xwalk file at ${xwPath}`);
    return;
  }

  const da = read(daPath);
  const xw = read(xwPath);

  // Build a lookup of xwalk definitions by id
  const xwById = Object.fromEntries(
    (xw.definitions || []).map((d) => [d.id, d]),
  );

  da.definitions = (da.definitions || []).map((def) => {
    const xwDef = xwById[def.id];
    if (!xwDef) {
      console.warn(`  WARN ${name}: no xwalk definition for id="${def.id}"`);
      return def;
    }
    return {
      ...def,
      plugins: {
        ...def.plugins,
        xwalk: xwDef.plugins?.xwalk,
      },
    };
  });

  write(daPath, da);
  console.log(`  UPDATED  ue/models/blocks/${name}.json`);
}

// Copy xwalk-only blocks directly into ue/models/blocks/
function copyXwalkOnly(name) {
  const xwPath = xwalkPath(name);
  if (!existsSync(xwPath)) {
    console.warn(`  SKIP ${name}: no xwalk file at ${xwPath}`);
    return;
  }
  const data = read(xwPath);
  write(uePath(name), data);
  console.log(`  CREATED  ue/models/blocks/${name}.json`);
}

console.log('Merging xwalk plugins into ue/models/blocks/...\n');
console.log('Dual-source blocks:');
DUAL_SOURCE.forEach(mergeDual);

console.log('\nxwalk-only blocks (copy to ue/models):');
XWALK_ONLY.forEach(copyXwalkOnly);

console.log('\nDone. Run `npm run build:json` to regenerate the root-level JSON files.');
