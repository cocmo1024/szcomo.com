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
  name: 'Industrial Additive Manufacturing and Precision Materials Services',
  serviceType:
    'Industrial 3D printing, metal powder supply, titanium additive manufacturing, copper additive manufacturing, and precision ceramic machining',
  provider: { '@id': organizationId },
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  audience: {
    '@type': 'Audience',
    audienceType:
      'Engineering, procurement, product development, industrial OEM, aerospace, automotive, semiconductor, and research teams',
  },
  description:
    'Como Precision provides industrial additive manufacturing and precision material services across metal powders, titanium and copper 3D printing, advanced technical ceramics, finishing, and quality-assurance coordination.',
  url: toAbsoluteUrl('/'),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Como Precision service scope',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Material platforms',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Metal 3D printing powders' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Titanium alloy additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Copper additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Advanced technical ceramics' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Process capabilities',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'LPBF metal additive manufacturing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SLS and MJF production networks' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Precision ceramic CNC machining' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Finishing and post-processing support' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Project support',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CAD and drawing review' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Prototype and production quotation support' } },
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Inspection and quality-assurance coordination' },
          },
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
