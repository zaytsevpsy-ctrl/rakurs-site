// EN translations. Typed against `Dict` (= typeof ru, leaves widened to `string`
// because ru.ts has no `as const`) — a missing/extra key here is a compile error
// (`npm run check` / `astro check`), so this dict can never silently drift from ru.ts.
import type { Dict } from './ru';

export const en: Dict = {
  nav: {
    // источник переводов: i18n.js (window.__RAKURS_EN)
    brand: 'rakurs',
    solutions: 'Solutions',
    how: 'How we work',
    cases: 'Case Studies',
    founders: 'Founders',
    cta: 'Improve Your Business',
    langCurrent: 'EN',
    langAlt: 'RU',
    // "Меню" не переводился в legacy i18n.js (data-i18n-skip на бургере) —
    // переведено вручную для этого словаря
    burgerLabel: 'Menu',
  },
  hero: {}, // Task 8
  pain: {}, // Task 9
  how: {}, // Task 9
  flagship: {}, // Task 9
  founders: {}, // Task 9
  storefront: {}, // Task 10
  cases: {}, // Task 11
  faq: {}, // Task 11
  form: {}, // Task 12
  chat: {}, // Task 12
  footer: {
    brand: 'rakurs',
    tagline: 'ready-made AI solutions and operational loss diagnostics',
    email: 'zaytsev.psy@gmail.com',
  },
};
