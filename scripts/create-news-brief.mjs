import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = 'true'] = argument.replace(/^--/, '').split('=');
    return [key, value];
  })
);

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));
const localConfig = await readJson(path.join(projectRoot, 'newsroom.config.local.json'));
const workspacePath = path.resolve(projectRoot, localConfig.workspace);
const relativeWorkspace = path.relative(projectRoot, workspacePath);
if (!relativeWorkspace || relativeWorkspace.startsWith('..') || path.isAbsolute(relativeWorkspace)) {
  throw new Error('The newsroom workspace must remain inside this website project.');
}

const snapshot = await readJson(path.join(workspacePath, 'current.json'));
const requestedIds = new Set(
  String(args.get('ids') || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);
const requestedCategories = String(args.get('category') || '')
  .split(',')
  .map((category) => category.trim().toLowerCase())
  .filter(Boolean);
const limit = Number(args.get('limit') || 12);

if (!requestedIds.size && !requestedCategories.length) {
  console.error('Select items in dashboard.html, then run: npm run news:brief -- --ids=id1,id2');
  console.error('Or build a category brief: npm run news:brief -- --category="Metal AM" --limit=8');
  process.exit(1);
}

const selectedItems = snapshot.items
  .filter(
    (item) =>
      requestedIds.has(item.id) ||
      (requestedCategories.length && requestedCategories.includes(item.category.toLowerCase()))
  )
  .slice(0, limit);

const missingIds = [...requestedIds].filter((id) => !snapshot.items.some((item) => item.id === id));
if (missingIds.length) throw new Error(`Selected IDs were not found in current.json: ${missingIds.join(', ')}`);
if (!selectedItems.length) throw new Error('No source items matched the requested selection.');

const getIsoWeek = (date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

const today = new Date();
const week = args.get('week') || getIsoWeek(today);
const accessedDate = today.toISOString().slice(0, 10);
const yamlString = (value) => JSON.stringify(String(value));
const sourceRows = selectedItems
  .map(
    (item) => `    - title: ${yamlString(item.title)}
      publisher: ${yamlString(item.sourceName)}
      url: ${yamlString(item.link)}
      accessedDate: ${accessedDate}`
  )
  .join('\n');

const workingSections = selectedItems
  .map(
    (item, index) => `### ${index + 1}. ${item.title}

- Original source: [${item.sourceName}](${item.link})
- Published: ${item.publishedAt}
- Category: ${item.category}
- Source type: ${item.sourceRole}
- Feed excerpt for orientation only: ${item.summary || '(none)'}
- Confirmed facts:
- Second-source check:
- Why it matters to engineering or procurement readers:
- Keep / combine / exclude:
`
  )
  .join('\n');

const draft = `---
title: ${yamlString(`3D Printing Industry Weekly — ${week}`)}
description: ${yamlString('Editorial draft — replace with a concise reviewed description before publication.')}
publishDate: ${accessedDate}
category: 'Industry Weekly'
tags:
  - additive manufacturing
  - industry news
author: 'Como Precision'
featured: false
draft: true
researchBased: true
externalResearch:
  disclosure: ${yamlString('This article is an original Como Precision summary based on the publicly available sources listed below.')}
  sources:
${sourceRows}
# If an image is used, uncomment and complete every field below. Do not use an image without a verified use basis.
# cover:
#   image: '/images/insights/example.webp'
#   alt: 'Accurate descriptive alternative text'
#   credit: 'Creator or publisher credit line'
#   sourceUrl: 'https://original-source-page.example/'
#   license: 'License, written permission, press-use terms, or Como-owned'
---

> INTERNAL EDITORIAL DRAFT — not ready to publish. Rewrite from verified facts; do not copy source wording.

Opening: summarize the week's most relevant development and explain why it matters to the intended reader.

## Weekly overview

Write a concise synthesis across the selected developments. Distinguish reported facts, company claims, and Como analysis.

## Editorial working notes

${workingSections}
## What it may mean for additive manufacturing teams

Connect the verified developments to material selection, qualification, production, procurement, or project risk without inventing performance claims.

## Image decision and attribution

- Image needed: No / Yes
- Local file:
- Creator or publisher:
- Original source page:
- Direct image URL:
- License or permission basis:
- Required credit line:
- Caption:

Delete this working section only after any used image has complete attribution in frontmatter and a verified right to use it.
`;

const draftsPath = path.join(workspacePath, 'drafts');
await mkdir(draftsPath, { recursive: true });
const outputFile = path.join(draftsPath, `${week}-3d-printing-weekly-draft.md`);
await writeFile(outputFile, draft, 'utf8');

console.log(
  JSON.stringify(
    {
      localOnly: true,
      draft: true,
      selectedItems: selectedItems.length,
      output: outputFile,
      next: 'Verify, synthesize, attribute any image, and review. Do not copy this file into src/content/insights until ready.',
    },
    null,
    2
  )
);
