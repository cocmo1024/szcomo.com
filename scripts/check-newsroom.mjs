import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const catalogOnly = args.has('--catalog-only');
const errors = [];

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const catalog = await readJson(path.join(projectRoot, 'src', 'data', '3d-news-sources.json'), { sources: [] });
const sourceIds = new Set();
for (const source of catalog.sources || []) {
  if (!source.id || sourceIds.has(source.id)) errors.push(`SOURCE_ID: ${source.id || '(missing)'}`);
  sourceIds.add(source.id);
  if (!/^https:\/\//.test(source.homepageUrl || '')) errors.push(`SOURCE_HOME_URL: ${source.id}`);
  if (source.mode === 'feed' && !/^https:\/\//.test(source.feedUrl || '')) errors.push(`SOURCE_FEED_URL: ${source.id}`);
  if (!['feed', 'watch'].includes(source.mode)) errors.push(`SOURCE_MODE: ${source.id}`);
  if (!source.role) errors.push(`SOURCE_ROLE: ${source.id}`);
  if (![1, 2, 3].includes(source.tier)) errors.push(`SOURCE_TIER: ${source.id}`);
}
if (sourceIds.size < 20) errors.push('SOURCE_CATALOG_TOO_SMALL');

let snapshot;
if (!catalogOnly) {
  const localConfig = await readJson(path.join(projectRoot, 'newsroom.config.local.json'));
  if (localConfig?.workspace) {
    const workspacePath = path.resolve(projectRoot, localConfig.workspace);
    const relativeWorkspace = path.relative(projectRoot, workspacePath);
    if (!relativeWorkspace || relativeWorkspace.startsWith('..') || path.isAbsolute(relativeWorkspace)) {
      errors.push('WORKSPACE_OUTSIDE_PROJECT');
    } else {
      snapshot = await readJson(path.join(workspacePath, 'current.json'));
      if (!snapshot) errors.push('LOCAL_SNAPSHOT_MISSING');
    }
  }
}

if (snapshot) {
  if (snapshot.status !== 'local-editorial-material-only') errors.push('SNAPSHOT_PUBLICATION_GUARD');
  if (!Number.isFinite(Date.parse(snapshot.pulledAt || ''))) errors.push('SNAPSHOT_DATE');
  const itemIds = new Set();
  const links = new Set();
  let previousTime = Number.POSITIVE_INFINITY;
  for (const item of snapshot.items || []) {
    if (!item.id || itemIds.has(item.id)) errors.push(`ITEM_ID: ${item.id || '(missing)'}`);
    itemIds.add(item.id);
    if (!/^https?:\/\//.test(item.link || '') || links.has(item.link)) errors.push(`ITEM_LINK: ${item.id}`);
    links.add(item.link);
    if (!sourceIds.has(item.sourceId)) errors.push(`ITEM_SOURCE: ${item.id}`);
    if (!item.title || item.title.length > 180) errors.push(`ITEM_TITLE: ${item.id}`);
    if (typeof item.summary !== 'string' || item.summary.length > 320) errors.push(`ITEM_SUMMARY: ${item.id}`);
    const timestamp = Date.parse(item.publishedAt || '');
    if (!Number.isFinite(timestamp)) errors.push(`ITEM_DATE: ${item.id}`);
    if (timestamp > previousTime) errors.push(`ITEM_SORT: ${item.id}`);
    previousTime = timestamp;
  }
}

if (errors.length) {
  console.error(JSON.stringify({ ok: false, errors }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      catalogSources: sourceIds.size,
      feedSources: catalog.sources.filter((source) => source.mode === 'feed').length,
      localSnapshotChecked: Boolean(snapshot),
      localItems: snapshot?.items?.length,
    },
    null,
    2
  )
);
