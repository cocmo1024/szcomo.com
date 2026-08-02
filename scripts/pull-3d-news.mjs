import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(projectRoot, 'src', 'data', '3d-news-sources.json');
const localConfigPath = path.join(projectRoot, 'newsroom.config.local.json');
const parser = new Parser({ timeout: 20000 });
const userAgent = 'ComoPrecisionLocalNewsroom/1.0 (+https://szcomo.com/)';
const now = new Date();
const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [key, value = 'true'] = argument.replace(/^--/, '').split('=');
    return [key, value];
  })
);

const readJson = async (filePath, fallback) => {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
};

const localConfig = await readJson(localConfigPath);
if (!localConfig?.workspace) {
  console.error(
    'Missing newsroom.config.local.json. Copy newsroom.config.example.json and set a local workspace path.'
  );
  process.exit(1);
}

const workspacePath = path.resolve(projectRoot, localConfig.workspace);
const relativeWorkspace = path.relative(projectRoot, workspacePath);
if (!relativeWorkspace || relativeWorkspace.startsWith('..') || path.isAbsolute(relativeWorkspace)) {
  console.error('The local newsroom workspace must be a dedicated folder inside this website project.');
  process.exit(1);
}

const defaultDays = Number(args.get('days') || localConfig.defaultDays || 7);
const perSourceLimit = Number(args.get('per-source') || 40);
const maxItems = Number(args.get('max-items') || 500);

const parseBoundary = (value, isEnd) => {
  if (!value) return undefined;
  const raw = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T${isEnd ? '23:59:59.999' : '00:00:00.000'}+08:00` : value;
  const timestamp = Date.parse(raw);
  if (!Number.isFinite(timestamp)) throw new Error(`Invalid ${isEnd ? '--to' : '--from'} date: ${value}`);
  return new Date(timestamp);
};

const fromDate = parseBoundary(args.get('from'), false) || new Date(now.valueOf() - defaultDays * 86400000);
const toDate = parseBoundary(args.get('to'), true) || now;
if (fromDate > toDate) throw new Error('--from must be earlier than --to.');

const splitList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const requestedSourceIds = new Set(splitList(args.get('source')));
const requestedCategories = splitList(args.get('category')).map((category) => category.toLowerCase());
const requestedRoles = splitList(args.get('role')).map((role) => role.toLowerCase());
const requestedTiers = splitList(args.get('tier')).map(Number);

const relevanceTerms = [
  '3d print',
  '3-d print',
  'additive manufactur',
  'additively manufactur',
  'powder bed fusion',
  'laser powder bed fusion',
  'binder jet',
  'directed energy deposition',
  'wire arc additive',
  'waam',
  'material extrusion',
  'vat photopolymer',
  'stereolithograph',
  'selective laser sinter',
  'electron beam melting',
  '3mf',
];

const categoryRules = [
  {
    category: 'Research & Standards',
    terms: ['standard', 'research', 'study', 'laborator', 'university', 'qualification', 'certification', 'nist'],
  },
  {
    category: 'Metal AM',
    terms: [
      'metal',
      'titanium',
      'copper',
      'nickel',
      'steel',
      'aluminium',
      'aluminum',
      'powder',
      'lpbf',
      'slm',
      'ded',
      'waam',
      'binder jet',
    ],
  },
  {
    category: 'Healthcare',
    terms: ['medical', 'dental', 'bioprint', 'tissue', 'implant', 'prosthe', 'healthcare'],
  },
  {
    category: 'Polymers & Composites',
    terms: ['polymer', 'resin', 'filament', 'composite', 'thermoplastic', 'fdm', 'fff', 'sla', 'sls', 'mjf'],
  },
  {
    category: 'Business & Market',
    terms: [
      'acquisition',
      'partnership',
      'revenue',
      'funding',
      'investment',
      'expansion',
      'appoint',
      'insolvency',
      'market',
    ],
  },
  {
    category: 'Industrial Applications',
    terms: [
      'aerospace',
      'automotive',
      'defence',
      'defense',
      'space',
      'energy',
      'tooling',
      'production',
      'manufacturing',
    ],
  },
  {
    category: 'Desktop & Software',
    terms: ['desktop', 'slicer', 'firmware', 'software', 'open source', 'maker', 'prusa', 'bambu'],
  },
];

const decodeEntities = (value = '') =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

const cleanText = (value = '', limit = 320) => {
  const text = decodeEntities(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matchesTerm = (haystack, term) => new RegExp(`\\b${escapeRegex(term)}`, 'i').test(haystack);

const canonicalizeUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim());
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return undefined;
  }
};

const getPublishedAt = (item) => {
  const rawDate = item.isoDate || item.pubDate || item.published || item.updated || item.date;
  const timestamp = Date.parse(rawDate || '');
  if (!Number.isFinite(timestamp) || timestamp < fromDate.valueOf() || timestamp > toDate.valueOf()) return undefined;
  return new Date(timestamp).toISOString();
};

const isRelevant = (source, title, summary) => {
  if (source.filterMode === 'all') return true;
  const haystack = `${title} ${summary}`;
  return relevanceTerms.some((term) => matchesTerm(haystack, term));
};

const inferCategory = (title, summary) => {
  const haystack = `${title} ${summary}`;
  return categoryRules.find((rule) => rule.terms.some((term) => matchesTerm(haystack, term)))?.category || 'General AM';
};

const shouldExcludeItem = (source, title, summary) => {
  if (/\bold$/i.test(title) || /has moved to a new location/i.test(summary)) return true;
  if (source.id === 'sculpteo') {
    return /\b(rejoint|europ[eé]en|impression|nouveau|nouvelle|pour|avec|dans|une|des)\b/i.test(title);
  }
  return false;
};

const titleFingerprint = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an|and|or|to|of|for|in|on|with|by|from)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const createId = (link) => createHash('sha256').update(link).digest('hex').slice(0, 16);

const normalizeItem = (source, item) => {
  const title = cleanText(item.title, 180);
  const link = canonicalizeUrl(item.link || item.guid);
  const publishedAt = getPublishedAt(item);
  const summary = cleanText(item.contentSnippet || item.summary || item.description || item.content || '', 320);
  if (!title || title.length < 8 || !link || !publishedAt || !isRelevant(source, title, summary)) return undefined;
  if (shouldExcludeItem(source, title, summary)) return undefined;

  const category = inferCategory(title, summary);
  if (requestedCategories.length && !requestedCategories.includes(category.toLowerCase())) return undefined;

  return {
    id: createId(link),
    title,
    summary,
    link,
    publishedAt,
    sourceId: source.id,
    sourceName: source.name,
    sourceRole: source.role,
    sourceHomepage: source.homepageUrl,
    category,
  };
};

const fetchSource = async (source) => {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(source.feedUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': userAgent,
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const feed = await parser.parseString(await response.text());
    const items = (feed.items || [])
      .map((item) => normalizeItem(source, item))
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
      .slice(0, perSourceLimit);

    return {
      items,
      health: {
        sourceId: source.id,
        sourceName: source.name,
        status: 'ok',
        checkedAt,
        feedItems: feed.items?.length || 0,
        acceptedItems: items.length,
      },
    };
  } catch (error) {
    return {
      items: [],
      health: {
        sourceId: source.id,
        sourceName: source.name,
        status: 'failed',
        checkedAt,
        feedItems: 0,
        acceptedItems: 0,
        error: cleanText(error instanceof Error ? error.message : String(error), 160),
      },
    };
  }
};

const sourceCatalog = await readJson(sourcePath, { sources: [] });
const knownSourceIds = new Set(sourceCatalog.sources.map((source) => source.id));
for (const sourceId of requestedSourceIds) {
  if (!knownSourceIds.has(sourceId)) throw new Error(`Unknown source id: ${sourceId}`);
}
const knownRoles = new Set(sourceCatalog.sources.map((source) => source.role.toLowerCase()));
for (const role of requestedRoles) {
  if (!knownRoles.has(role)) throw new Error(`Unknown source role: ${role}`);
}
if (requestedTiers.some((tier) => ![1, 2, 3].includes(tier))) throw new Error('--tier accepts 1, 2, or 3.');

const feedSources = sourceCatalog.sources.filter(
  (source) =>
    source.mode === 'feed' &&
    (!requestedSourceIds.size || requestedSourceIds.has(source.id)) &&
    (!requestedRoles.length || requestedRoles.includes(source.role.toLowerCase())) &&
    (!requestedTiers.length || requestedTiers.includes(source.tier))
);
if (!feedSources.length) throw new Error('The selected sources do not contain a fetchable public feed.');

const results = await Promise.all(feedSources.map((source) => fetchSource(source)));
const health = results.map((result) => result.health);
const byLink = new Map();
for (const item of results.flatMap((result) => result.items)) byLink.set(item.link, item);

const byTitle = new Map();
for (const item of [...byLink.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))) {
  const fingerprint = titleFingerprint(item.title);
  if (!fingerprint || byTitle.has(fingerprint)) continue;
  byTitle.set(fingerprint, item);
}

const items = [...byTitle.values()]
  .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  .slice(0, maxItems);
const pulledAt = new Date().toISOString();
const snapshot = {
  version: 1,
  status: 'local-editorial-material-only',
  pulledAt,
  query: {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    categories: requestedCategories,
    sources: [...requestedSourceIds],
    roles: requestedRoles,
    tiers: requestedTiers,
  },
  policy: {
    publication: 'Never publish this snapshot directly. Select, verify, rewrite, attribute, and review first.',
    copyright: sourceCatalog.policy?.copyright,
  },
  stats: {
    catalogSources: sourceCatalog.sources.length,
    fetchedSources: feedSources.length,
    healthyFeeds: health.filter((entry) => entry.status === 'ok').length,
    failedFeeds: health.filter((entry) => entry.status === 'failed').length,
    items: items.length,
  },
  health,
  items,
};

const fileStamp = pulledAt.replace(/[:.]/g, '-');
const pullsPath = path.join(workspacePath, 'pulls');
const reviewsPath = path.join(workspacePath, 'reviews');
await mkdir(pullsPath, { recursive: true });
await mkdir(reviewsPath, { recursive: true });

const snapshotFile = path.join(pullsPath, `pull_${fileStamp}.json`);
const currentFile = path.join(workspacePath, 'current.json');
const dashboardFile = path.join(workspacePath, 'dashboard.html');
const reviewFile = path.join(reviewsPath, `review_${fileStamp}.md`);

const countBy = (values) =>
  [...values.reduce((counts, value) => counts.set(value, (counts.get(value) || 0) + 1), new Map()).entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

const markdownReview = `# 3D printing news review queue

> Local editorial material only. Do not publish this file or copy source wording into an article.

- Pulled: ${pulledAt}
- Period: ${fromDate.toISOString()} to ${toDate.toISOString()}
- Items: ${items.length}
- Healthy feeds: ${snapshot.stats.healthyFeeds}/${feedSources.length}

## Category overview

${
  countBy(items.map((item) => item.category))
    .map(([category, count]) => `- ${category}: ${count}`)
    .join('\n') || '- No matching items'
}

## Editorial rules

- Select only developments relevant to Como Precision's audience.
- Open and verify every selected original source; use a second source for material claims where practical.
- Write an original synthesis and state that it is based on the linked public information.
- Do not imply independent testing, customer proof, certification, or endorsement.
- If an image is needed, record its publisher or creator, original URL, credit line, and license or permission basis.
- Keep the article as \`draft: true\` until wording, facts, links, and image rights are reviewed.

## Candidate items

${
  items
    .map(
      (item, index) => `### ${index + 1}. ${item.title}

- Select: [ ]
- ID: \`${item.id}\`
- Date: ${item.publishedAt}
- Category: ${item.category}
- Source: ${item.sourceName}
- Source type: ${item.sourceRole}
- Original: ${item.link}
- Feed excerpt: ${item.summary || '(none)'}
- Why it matters:
- Facts to verify:
- Possible angle:
- Related source:
- Image needed: No / Yes — source and permission required
`
    )
    .join('\n') || 'No items matched this pull.'
}
`;

const dashboardData = JSON.stringify({ snapshot, sources: sourceCatalog.sources }).replace(/</g, '\\u003c');
const dashboardHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Como 3D Newsroom — Local</title>
  <style>
    :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#050709;color:#f8fafc}*{box-sizing:border-box}body{margin:0}.wrap{width:min(1180px,calc(100% - 32px));margin:auto}.top{padding:52px 0 30px;border-bottom:1px solid #20242b}.eyebrow,.meta,.label{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#8994a5}.top h1{font-size:clamp(36px,7vw,72px);line-height:.98;margin:14px 0 18px}.warning{max-width:760px;color:#b7c0cc;line-height:1.7}.stats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #20242b}.stat{padding:22px 16px;border-right:1px solid #20242b}.stat:first-child{padding-left:0}.stat:last-child{border:0}.stat strong{display:block;font-size:24px}.filters{display:grid;grid-template-columns:2fr repeat(5,1fr);gap:12px;padding:28px 0;border-bottom:1px solid #20242b}input,select,button{width:100%;border:1px solid #303640;background:#0a0d11;color:#f8fafc;padding:12px;font:inherit}button{cursor:pointer;font-weight:700}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 0}.list{border-top:1px solid #20242b}.item{display:grid;grid-template-columns:150px minmax(0,1fr) 210px;gap:28px;padding:24px 0;border-bottom:1px solid #20242b}.item h2{font-size:21px;line-height:1.35;margin:0 0 10px}.item a{color:inherit;text-decoration:none}.item a:hover{text-decoration:underline}.summary{color:#aab4c2;line-height:1.6;margin:0;font-size:14px}.source{color:#cbd5e1;margin-top:7px;font-weight:700}.category{text-align:right}.badge{display:inline-block;border:1px solid #38404b;padding:4px 7px;margin-top:10px;font-size:10px;text-transform:uppercase;letter-spacing:.1em}.select{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:18px;color:#aab4c2;font-size:13px}.select input{width:auto}.selection{position:sticky;bottom:0;background:rgba(5,7,9,.96);border-top:1px solid #38404b;padding:14px 0}.selection-row{display:flex;gap:12px;align-items:center}.selection code{flex:1;overflow:auto;color:#aab4c2}.selection button{width:auto}.empty{padding:50px 0;color:#8994a5}.sources{padding:36px 0 80px}.sources summary{cursor:pointer;font-size:22px;font-weight:700}.source-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 28px;margin-top:24px}.source-grid a{color:#b7c0cc;text-decoration:none;font-size:14px}.source-grid small{color:#6f7a89;margin-left:7px}@media(max-width:820px){.stats{grid-template-columns:repeat(2,1fr)}.filters{grid-template-columns:1fr 1fr}.filters input[type=search]{grid-column:1/-1}.item{grid-template-columns:1fr}.category{text-align:left}.select{justify-content:flex-start}.source-grid{grid-template-columns:1fr}.selection-row{align-items:flex-start;flex-direction:column}.selection button{width:100%}}@media(max-width:500px){.filters{grid-template-columns:1fr}.filters input[type=search]{grid-column:auto}.stats{grid-template-columns:1fr 1fr}.stat strong{font-size:19px}}
  </style>
</head>
<body>
  <header class="top"><div class="wrap"><div class="eyebrow">Local editorial workspace</div><h1>3D Newsroom</h1><p class="warning">This is a private source-material pool. Filter, select, verify, synthesize, attribute, and review before anything is moved into the public website.</p></div></header>
  <section><div class="wrap stats"><div class="stat"><strong>${items.length}</strong><span class="meta">Pulled items</span></div><div class="stat"><strong>${sourceCatalog.sources.length}</strong><span class="meta">Catalog sources</span></div><div class="stat"><strong>${snapshot.stats.healthyFeeds}</strong><span class="meta">Healthy feeds</span></div><div class="stat"><strong>${fromDate.toISOString().slice(0, 10)}</strong><span class="meta">Period start</span></div></div></section>
  <main class="wrap">
    <section class="filters"><input id="q" type="search" placeholder="Search title, excerpt, or source"><input id="from" type="date"><input id="to" type="date"><select id="category"><option value="">All categories</option></select><select id="role"><option value="">All source types</option></select><select id="source"><option value="">All sources</option></select></section>
    <div class="toolbar"><strong id="count"></strong><button id="clear" style="width:auto">Clear filters</button></div>
    <section id="list" class="list"></section>
    <details class="sources"><summary>${sourceCatalog.sources.length} source directory</summary><div id="sources" class="source-grid"></div></details>
  </main>
  <aside class="selection"><div class="wrap selection-row"><strong id="selected-count">0 selected</strong><code id="selected-ids">Select items to build a draft brief.</code><button id="copy">Copy selected IDs</button></div></aside>
  <script type="application/json" id="newsroom-data">${dashboardData}</script>
  <script>
    const data=JSON.parse(document.getElementById('newsroom-data').textContent);const items=data.snapshot.items;const selected=new Set();
    const q=document.getElementById('q'),from=document.getElementById('from'),to=document.getElementById('to'),category=document.getElementById('category'),role=document.getElementById('role'),source=document.getElementById('source'),list=document.getElementById('list'),count=document.getElementById('count');
    const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    [...new Set(items.map(x=>x.category))].sort().forEach(v=>category.insertAdjacentHTML('beforeend','<option>'+safe(v)+'</option>'));
    [...new Set(items.map(x=>x.sourceRole))].sort().forEach(v=>role.insertAdjacentHTML('beforeend','<option value="'+safe(v)+'">'+safe(v.replaceAll('-',' '))+'</option>'));
    [...new Set(items.map(x=>x.sourceName))].sort().forEach(v=>source.insertAdjacentHTML('beforeend','<option>'+safe(v)+'</option>'));
    from.value=data.snapshot.query.from.slice(0,10);to.value=data.snapshot.query.to.slice(0,10);
    function updateSelection(){const ids=[...selected];document.getElementById('selected-count').textContent=ids.length+' selected';document.getElementById('selected-ids').textContent=ids.length?ids.join(','):'Select items to build a draft brief.'}
    function render(){const term=q.value.trim().toLowerCase();const matches=items.filter(x=>(!term||(x.title+' '+x.summary+' '+x.sourceName).toLowerCase().includes(term))&&(!category.value||x.category===category.value)&&(!role.value||x.sourceRole===role.value)&&(!source.value||x.sourceName===source.value)&&(!from.value||x.publishedAt.slice(0,10)>=from.value)&&(!to.value||x.publishedAt.slice(0,10)<=to.value));count.textContent=matches.length+' matching items';list.innerHTML=matches.length?matches.map(x=>{const official=x.sourceRole.endsWith('-official');const institutional=['association','standards-authority','standards-consortium','regulatory-authority','research-authority','research-center'].includes(x.sourceRole);const badge=official?'Official source':institutional?'Institutional source':'';return '<article class="item"><div class="meta">'+safe(x.publishedAt.slice(0,10))+'<div class="source">'+safe(x.sourceName)+'</div></div><div><h2><a target="_blank" rel="noopener noreferrer" href="'+safe(x.link)+'">'+safe(x.title)+'</a></h2><p class="summary">'+safe(x.summary)+'</p></div><div class="category"><span class="label">'+safe(x.category)+'</span>'+(badge?'<div class="badge">'+badge+'</div>':'')+'<label class="select"><input type="checkbox" data-id="'+safe(x.id)+'" '+(selected.has(x.id)?'checked':'')+'> Select</label></div></article>'}).join(''):'<p class="empty">No source material matches these filters.</p>';list.querySelectorAll('[data-id]').forEach(box=>box.addEventListener('change',()=>{box.checked?selected.add(box.dataset.id):selected.delete(box.dataset.id);updateSelection()}))}
    [q,from,to,category,role,source].forEach(el=>el.addEventListener('input',render));document.getElementById('clear').addEventListener('click',()=>{q.value='';category.value='';role.value='';source.value='';from.value=data.snapshot.query.from.slice(0,10);to.value=data.snapshot.query.to.slice(0,10);render()});
    document.getElementById('copy').addEventListener('click',async()=>{const text=[...selected].join(',');if(!text)return;try{await navigator.clipboard.writeText(text)}catch{const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();document.execCommand('copy');area.remove()}document.getElementById('copy').textContent='Copied'});
    document.getElementById('sources').innerHTML=data.sources.sort((a,b)=>a.role.localeCompare(b.role)||a.name.localeCompare(b.name)).map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+safe(x.homepageUrl)+'">'+safe(x.name)+'<small>'+safe(x.role.replaceAll('-',' ')+' · '+(x.mode==='feed'?'feed':'watch'))+'</small></a>').join('');render();updateSelection();
  </script>
</body>
</html>`;

await Promise.all([
  writeFile(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8'),
  writeFile(currentFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8'),
  writeFile(dashboardFile, dashboardHtml, 'utf8'),
  writeFile(reviewFile, markdownReview, 'utf8'),
]);

console.log(
  JSON.stringify(
    {
      localOnly: true,
      period: snapshot.query,
      sources: snapshot.stats,
      workspace: workspacePath,
      dashboard: dashboardFile,
      review: reviewFile,
      snapshot: snapshotFile,
    },
    null,
    2
  )
);

if (!snapshot.stats.healthyFeeds) process.exitCode = 1;
