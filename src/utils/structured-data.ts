import { SITE } from 'astrowind:config';
import type { ImageMetadata } from 'astro';
import type { JsonLdNode, Post } from '~/types';

const siteUrl = String(SITE.site).replace(/\/$/, '');
const siteOrigin = new URL(siteUrl).origin;
const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;
const hasFileExtension = (pathname: string) => /\.[a-z0-9]+$/i.test(pathname.split('/').pop() || '');

const normalizeInternalUrl = (url: URL): string => {
  if (url.origin !== siteOrigin) return String(url);

  if (SITE.trailingSlash && url.pathname !== '/' && !url.pathname.endsWith('/') && !hasFileExtension(url.pathname)) {
    url.pathname = `${url.pathname}/`;
  } else if (SITE.trailingSlash === false && url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  return String(url);
};

export const toAbsoluteUrl = (url: string | URL | undefined): string | undefined => {
  if (!url) return undefined;

  const value = String(url);
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return normalizeInternalUrl(new URL(value));
  }

  return normalizeInternalUrl(new URL(value.startsWith('/') ? value : `/${value}`, `${siteUrl}/`));
};

export const createBreadcrumbSchema = (items: Array<{ name: string; item?: string | URL }>): JsonLdNode => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, item }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    ...(item ? { item: toAbsoluteUrl(item) } : {}),
  })),
});

export const createComoServiceSchema = (): JsonLdNode => ({
  '@type': 'Service',
  '@id': `${siteUrl}/#industrial-additive-manufacturing-precision-materials-service`,
  name: 'Advanced Materials, Additive Manufacturing, and Technical Supply Services',
  serviceType:
    'Advanced materials, industrial 3D printing, metal and ceramic materials, additive manufacturing equipment, industrial components, and technical supply coordination',
  provider: { '@id': organizationId },
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  audience: {
    '@type': 'Audience',
    audienceType:
      'Engineering, procurement, product development, industrial OEM, aerospace, automotive, semiconductor, electronics, and research teams',
  },
  description:
    'Como Precision supports industrial projects across advanced materials, 3D printing services, metal and ceramic materials, additive manufacturing equipment, selected industrial components, finishing, inspection, and import/export coordination.',
  url: toAbsoluteUrl('/'),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Como Precision service scope',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Advanced materials',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'New material technology review' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Synthetic material supply' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Metal 3D printing powders' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'New ceramic materials' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'High-performance fibers and composites' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Manufacturing capabilities',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Industrial 3D printing services' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Titanium alloy additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Copper additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LPBF metal additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SLS and MJF production networks' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Precision ceramic CNC machining' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Finishing and post-processing support' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Technical supply and project support',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Additive manufacturing equipment supply' } },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Mechanical and electrical equipment sourcing' },
          },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Power and electronic component sourcing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CAD and drawing review' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Prototype and production quotation support' } },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Inspection and quality-assurance coordination' },
          },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Import and export coordination' } },
        ],
      },
    ],
  },
});

export const createFAQPageSchema = (items: Array<{ title: string; description?: string }>): JsonLdNode => ({
  '@type': 'FAQPage',
  mainEntity: items
    .filter((item) => item.title && item.description)
    .map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.description,
      },
    })),
});

export const createItemListSchema = (
  name: string,
  items: Array<{ name: string; description?: string; url: string | URL }>
): JsonLdNode => ({
  '@type': 'ItemList',
  name,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: toAbsoluteUrl(item.url),
    item: {
      '@type': 'Thing',
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
      url: toAbsoluteUrl(item.url),
    },
  })),
});

export const createArticleSchema = ({
  post,
  url,
  image,
}: {
  post: Post;
  url: string | URL;
  image?: ImageMetadata | string;
}): JsonLdNode => {
  const imageUrl = typeof image === 'string' ? toAbsoluteUrl(image) : toAbsoluteUrl(image?.src);

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: {
      '@id': `${url}#webpage`,
    },
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished: post.publishDate.toISOString(),
    dateModified: (post.updateDate || post.publishDate).toISOString(),
    author: {
      '@type': 'Organization',
      name: post.author || SITE.name,
      url: siteUrl,
    },
    publisher: { '@id': organizationId },
    ...(post.category?.title ? { articleSection: post.category.title } : {}),
    ...(post.tags?.length ? { keywords: post.tags.map((tag) => tag.title).join(', ') } : {}),
  };
};

export const structuredDataIds = {
  organization: organizationId,
  website: websiteId,
};
