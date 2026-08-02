import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const insightSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishDate: z.coerce.date(),
    updateDate: z.coerce.date().optional(),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Como Precision'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    researchBased: z.boolean().default(false),
    externalResearch: z
      .object({
        disclosure: z.string().min(10),
        sources: z
          .array(
            z.object({
              title: z.string().min(1),
              publisher: z.string().min(1),
              url: z.string().url(),
              accessedDate: z.coerce.date(),
            })
          )
          .min(1),
      })
      .optional(),
    cover: z
      .object({
        image: z.string().startsWith('/'),
        alt: z.string().min(5),
        credit: z.string().min(1),
        sourceUrl: z.string().url(),
        license: z.string().min(1),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    if (data.researchBased && !data.externalResearch) {
      context.addIssue({
        code: 'custom',
        path: ['externalResearch'],
        message: 'Research-based articles require a disclosure and at least one attributed source.',
      });
    }
  });

const insights = defineCollection({
  loader: glob({ base: './src/content/insights', pattern: '**/*.{md,mdx}' }),
  schema: insightSchema,
});

export const collections = { insights };
