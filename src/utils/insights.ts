import { getCollection, type CollectionEntry } from 'astro:content';

export type InsightEntry = CollectionEntry<'insights'>;

export const getInsightSlug = (entry: InsightEntry): string => entry.id.replace(/\.(md|mdx)$/i, '');

export const getInsightHref = (entry: InsightEntry): string => `/insights/${getInsightSlug(entry)}/`;

export const getPublishedInsights = async (): Promise<InsightEntry[]> => {
  const entries = await getCollection('insights', ({ data }) => !data.draft);

  return entries.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
};

export const getInsightReadingTime = (entry: InsightEntry): number => {
  const words = entry.body?.trim().split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.ceil(words / 220));
};

export const getRelatedInsights = (current: InsightEntry, entries: InsightEntry[], limit = 3): InsightEntry[] => {
  const currentTags = new Set(current.data.tags.map((tag) => tag.toLowerCase()));

  return entries
    .filter((entry) => entry.id !== current.id)
    .map((entry) => ({
      entry,
      score:
        (entry.data.category === current.data.category ? 3 : 0) +
        entry.data.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || b.entry.data.publishDate.valueOf() - a.entry.data.publishDate.valueOf())
    .slice(0, limit)
    .map(({ entry }) => entry);
};
