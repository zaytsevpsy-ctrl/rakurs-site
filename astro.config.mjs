import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ЕДИНСТВЕННОЕ место, где живёт домен: canonical, hreflang, OG, sitemap,
// robots и llms.txt вычисляются от этой константы на билде.
// Сайт живёт в корне домена (Gcore CDN → rakurs.io), без subpath.
export const SITE = 'https://rakurs.io/';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ru', locales: { ru: 'ru', en: 'en' } },
    }),
  ],
});
