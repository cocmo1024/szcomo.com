# Local 3D Printing Newsroom

This project uses a **local research → editorial processing → reviewed publication** workflow. Fetched headlines are source material, not website content.

## Publication boundary

- Feed snapshots, dashboard filters, review queues, and working briefs stay in the local newsroom folder.
- No fetch command writes into `src/content/insights/`.
- No scheduled workflow commits or publishes fetched material.
- An article appears on `/insights/` only after a reviewed Markdown/MDX file is deliberately placed in `src/content/insights/` and its frontmatter is changed from `draft: true` to `draft: false`.
- Network-based articles must disclose that they are original summaries based on the listed public sources.
- Any image requires an original source page, creator or publisher credit, and a verified license or permission basis.

## Local workspace

The machine-specific location is defined in the ignored `newsroom.config.local.json` file. This checkout currently writes to:

`会话_20260802_100713_本地建站/3D新闻源`

The tracked `newsroom.config.example.json` documents the portable format without publishing the local working material.

## Pull source material

The default pull covers the previous seven days:

```bash
npm run news:pull
```

Filter the pull by date, category, source, or any combination:

```bash
npm run news:pull -- --from=2026-07-27 --to=2026-08-02
npm run news:pull -- --category="Metal AM"
npm run news:pull -- --source=tct-magazine,voxelmatters
npm run news:pull -- --role=research-authority,materials-official --tier=1
npm run news:pull -- --from=2026-07-27 --to=2026-08-02 --category="Research & Standards" --source=nist-news,3d-printing-industry
```

Dates written as `YYYY-MM-DD` use the Asia/Shanghai editorial day boundary. Categories, source IDs, source roles, and tiers may be comma-separated. Source values use IDs from `src/data/3d-news-sources.json`.

The catalog is deliberately layered:

- independent specialist and regional media;
- standards, regulators, associations, and research institutions;
- journals, research indexes, and industry events;
- equipment and materials manufacturers;
- software, workflow, inspection, and post-processing providers;
- service bureaus and official application companies.

Company-owned sources are evidence of what that company announced, not independent confirmation. The dashboard labels official and institutional sources accordingly.

Each pull creates:

- `current.json` — the current normalized source-material selection.
- `pulls/pull_*.json` — timestamped pull evidence.
- `dashboard.html` — a local search and filtering interface with selection checkboxes.
- `reviews/review_*.md` — a review queue containing verification and image-rights prompts.

The data remains metadata-only: title, short feed excerpt, original date, classification, attribution, and original URL. Full articles and publisher images are not downloaded.

## Create a weekly working brief

Open `dashboard.html`, filter the period and categories, select useful items, then copy their IDs. Create a local draft brief:

```bash
npm run news:brief -- --ids=id1,id2,id3
```

A category-based draft is also available:

```bash
npm run news:brief -- --category="Metal AM" --limit=8
```

The resulting file is placed under the local `drafts/` folder and always begins with `draft: true`. It contains:

- the selected source register;
- a clear external-information disclosure;
- prompts for confirmed facts, second-source checks, relevance, and editorial angle;
- an image decision and attribution register;
- an Astro-compatible article frontmatter structure for later use.

The generated brief is not finished copy. Rewrite it into an original synthesis after opening and verifying every selected source.

## Image use

Do not download or reuse an image merely because it appears on a source page. Before adding any image, record:

1. local image path;
2. descriptive alt text;
3. creator or publisher credit;
4. original source page;
5. license, press-use term, written permission, or confirmation that Como owns the image;
6. required caption or credit wording.

The public article schema requires all attribution fields whenever a cover image is declared. If those facts are unavailable, publish without that image.

## Weekly editorial routine

1. Pull the desired seven-day period into the local newsroom.
2. Filter by category, source, date, and keyword in `dashboard.html`.
3. Open candidate originals and remove weak, duplicated, promotional, or unverifiable items.
4. Create a selected weekly brief.
5. Verify facts and add a second source where useful.
6. Write an original summary that separates reported facts, company claims, and Como analysis.
7. Add an image only after completing the attribution and rights record.
8. Keep `draft: true` during fact, language, link, SEO, and visual review.
9. Move the finished article into `src/content/insights/`.
10. Change to `draft: false` only with explicit publication approval, then run `npm run check` and `npm run build` before any push.

## Validation

```bash
npm run news:check
npm run check
npm run build
```

`npm run news:check` validates both the tracked source catalog and the current local snapshot when present. The normal site check validates the catalog without requiring another operator's local newsroom files.
