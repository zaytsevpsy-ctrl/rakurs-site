import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ЕДИНСТВЕННОЕ место, где живёт домен. Переезд на rakurs.ai = правка этой строки
// плюс удаление `base` ниже (на своём домене сайт живёт в корне, subpath не нужен).
export const SITE = 'https://zaytsevpsy-ctrl.github.io/rakurs-site/';

export default defineConfig({
  site: SITE,
  // GitHub Pages project page => сайт живёт под /rakurs-site/. Меняется вместе с SITE.
  base: '/rakurs-site/',
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
