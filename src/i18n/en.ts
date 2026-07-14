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
  hero: {
    // источник переводов: i18n.js (window.__RAKURS_EN), ключи "// диагностика
    // операционных потерь...", "Находим, где ваш бизнес теряет"/"деньги"/
    // ". И закрываем это готовыми ИИ-решениями.", "Подобрать решение",
    // "Смотреть витрину ↓", "дыра_0N · ...", "КЛИЕНТЫ ПЛАТЯТ"/"ДОХОДИТ ДО ВАС", "Лид"
    eyebrow: '// operational loss diagnostics and ready-made AI solutions',
    headlineBefore: 'We find where your business is losing ',
    headlineHighlight: 'money',
    headlineAfter: '. And we close those gaps with ready-made AI solutions.',
    subline:
      "We don't sell \"AI adoption\" — we close the holes your money leaks through. Fixed price, launch in 1–2 weeks, payback calculated before we start.",
    ctaPrimary: 'Find Your Solution',
    ctaSecondary: 'View Showcase ↓',
    note: "First step—a 20-minute conversation. If it turns out you don't need us, we'll say so.",
    pipeLabelIn: 'CLIENTS PAY',
    pipeLabelOut: 'REACHES YOU',
    pipeLead: 'Lead',
    leak1Title: 'leak_01 · People',
    leak1Desc: 'burnout, churn',
    leak2Title: 'leak_02 · Handoffs',
    leak2Desc: 'requests get lost',
    leak3Title: 'leak_03 · Routine',
    leak3Desc: 'engineer as operator',
    pipeCaption: 'Money comes in — and leaks out through the holes. We close them.',
  },
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
