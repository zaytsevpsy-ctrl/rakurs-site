// Типизированный словарь UI-строк лендинга, НЕ покрытых content collections
// (products/cases/faq — см. src/content/*). Здесь — заголовки секций, навигация,
// футер, кнопки, подписи форм и т.п.
//
// `ru` — источник истины по ключам и структуре. `Dict = typeof ru` НЕ использует
// `as const`, поэтому листовые значения выводятся как `string` (а не литералы) —
// это специально: en.ts должен иметь те же ключи, но вправе иметь любые строки.
// Не добавляйте `as const` сюда — это сломает типизацию en.ts (см. src/i18n/en.ts).

export const ru = {
  nav: {
    // точные строки из index.html:322–352
    brand: 'rakurs',
    solutions: 'Решения',
    how: 'Как работаем',
    cases: 'Кейсы',
    founders: 'Основатели',
    cta: 'Улучшить бизнес',
    // переключатель языка (data-lang-toggle): текущий язык · альтернативный язык
    langCurrent: 'RU',
    langAlt: 'EN',
    // aria-label бургера (data-nav-burger); в legacy site это data-i18n-skip
    // и никогда не переводилось рантайм-переводчиком — здесь переведено вручную
    burgerLabel: 'Меню',
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
    // точные строки из index.html:1056–1108 (без плавающего чат-кнопки — Task 12)
    brand: 'rakurs',
    tagline: 'готовые ИИ‑решения и диагностика операционных потерь',
    email: 'zaytsev.psy@gmail.com',
  },
};

export type Dict = typeof ru;
