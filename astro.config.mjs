import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ЕДИНСТВЕННОЕ место, где живёт домен. Переезд на rakurs.ai = правка этой строки.
export const SITE = 'https://zaytsevpsy-ctrl.github.io/rakurs-site/';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
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
