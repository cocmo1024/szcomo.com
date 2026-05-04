import { getPermalink } from './utils/permalinks';

const currentYear = new Date().getFullYear();
const emailHref = 'mailto:info@szcomo.com';

export const headerData = {
  links: [
    {
      text: 'Powders',
      href: 'https://metal3dpowder.com/',
    },
    {
      text: 'Titanium',
      href: 'https://titanium3dp.com/',
    },
    {
      text: 'Ceramic',
      href: 'https://ceramiccnc.com/',
    },
    {
      text: 'Copper',
      href: 'https://copper3dp.com/',
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [{ text: 'Email', href: emailHref, title: 'Email info@szcomo.com' }],
};

export const footerData = {
  links: [
    {
      title: 'Platforms',
      links: [
        { text: 'Metal powders', href: 'https://metal3dpowder.com/' },
        { text: 'Titanium 3D printing', href: 'https://titanium3dp.com/' },
        { text: 'Copper 3D printing', href: 'https://copper3dp.com/' },
        { text: 'Precision ceramics', href: 'https://ceramiccnc.com/' },
      ],
    },
    {
      title: 'Services',
      links: [
        { text: 'Industrial 3D printing', href: getPermalink('/#services') },
        { text: 'Metal AM powders', href: 'https://metal3dpowder.com/' },
        { text: 'Ceramic machining', href: 'https://ceramiccnc.com/' },
        { text: 'Project review', href: getPermalink('/#contact') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About', href: getPermalink('/about') },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'Privacy', href: getPermalink('/privacy') },
        { text: 'Terms', href: getPermalink('/terms') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [{ ariaLabel: 'Email', icon: 'tabler:mail', href: emailHref }],
  footNote: `
    &copy; ${currentYear} Como Precision - Suzhou Como Precision Materials Co., Ltd. - All rights reserved.
  `,
};
