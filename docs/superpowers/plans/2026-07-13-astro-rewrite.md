# Rakurs-site → Astro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переписать одностраничник Rakurs с монолитного `index.html` + dc-runtime на Astro: компоненты, контент-коллекции, честные EN-страницы, SEO из одного места, чистая статика для Gcore CDN.

**Architecture:** Astro 5 (static output) + content-коллекции (zod) как единый источник правды для продуктов/кейсов/FAQ; из них генерируются страницы, JSON-LD, llms.txt и sitemap. Интерактив — обычные TS-модули без React. RU в корне, EN под `/en/` через встроенный i18n-роутинг.

**Tech Stack:** Astro ^5, @astrojs/sitemap, @astrojs/check + TypeScript, vitest (только для чистых функций в `src/lib/`), zod (в составе Astro).

**Спека:** `docs/superpowers/specs/2026-07-13-rakurs-astro-rewrite-design.md`

---

## Исходники (референс до конца миграции — НЕ удалять до Task 23)

- `index.html` (1956 строк) — весь сайт. Ключевые строки:
  - 1–43 — head/SEO-мета (референс для Seo.astro)
  - 45–192 — `<style id="rk-fixes">` (spotlight, store-grid, scenes CSS)
  - 193–249 — JSON-LD: Organization (193), WebSite (213), ProfessionalService (224)
  - 258–321 — базовый `<style>` (reset, типографика)
  - 322–352 — nav; 353–503 — hero `#top` (+`<style>` на 371); 504–633 — `#pain`;
    634–707 — `#storefront`; 708–744 — `#how`; 745–812 — `#flagship`;
    813–861 — `#cases`; 862–912 — `#founders`; 913–964 — `#faq` (FAQPage JSON-LD на 949);
    965–1055 — `#form`; 1056–1108 — footer + кнопка чата (`sc-if chatClosed`, ~1101)
  - 1110–1760 — `class Component extends DCLogic`: **PRODUCTS (1115–1121), CASES (1124–1130), CHIPS (1132)**, state, методы setupLens/setupReveal/setupMagnet/setupPipe/setupReport/setupRoute/setupScrub/setupLang/setupNav
  - 1761–1788 — vanilla-скрипт: drag + стрелки store-grid
  - 1789–1844 — vanilla-скрипт: spotlight showcase controller
  - 1845–1956 — vanilla-скрипт: immersive product scenes
- `i18n.js` — словарь `window.__RAKURS_EN` «русская строка → английская». Источник ВСЕХ EN-переводов.
- `support.js` — референс поведения виджетов (скомпилированный dc-runtime).
- `llms.txt`, `llms-full.txt` — шаблоны для генераторов.
- `robots.txt`, `sitemap.xml` — референс для endpoints.

## Правила порта разметки (применять в каждой задаче порта)

1. `style="..."`-атрибуты → классы + scoped `<style>` в том же `.astro`-компоненте. Цвета/шрифты → `var(--...)` из tokens.css.
2. Биндинги dc-runtime `{{ expr }}` в тексте/атрибутах — удалить; данные приходят из props/коллекций, динамика — из скриптов через data-атрибуты.
3. `<sc-if value="{{ x }}">…</sc-if>` → обычный элемент с атрибутом `hidden` (или без него, если по умолчанию виден); переключение — в TS-скрипте.
4. `onClick="{{ fn }}"` → `data-action="fn-name"` + `addEventListener` в соответствующем `src/scripts/*.ts`.
5. Русские тексты секций → в `src/i18n/ru.ts`; компонент берёт строки из словаря по `locale`. EN-перевод искать в `i18n.js` по точной русской строке.
6. Ничего не «улучшать» визуально: классы/отступы/цвета переносятся 1:1.

## Целевая структура файлов

```
astro.config.mjs, package.json, tsconfig.json, vitest.config.ts, .gitignore
src/
  content.config.ts
  content/{products,cases,faq}/*.{ru,en}.md
  i18n/{ui.ts, ru.ts, en.ts}
  layouts/Base.astro
  components/{Seo,Nav,Hero,Pain,Storefront,ProductCard,How,Flagship,
              Cases,Founders,Faq,LeadForm,ChatWidget,Footer}.astro
  lib/{content.ts, jsonld.ts, llms.ts}
  lib/__tests__/{jsonld.test.ts, llms.test.ts}
  pages/{index.astro, robots.txt.ts, llms.txt.ts, llms-full.txt.ts}
  pages/products/[slug].astro, pages/cases/[slug].astro
  pages/en/{index.astro, products/[slug].astro, cases/[slug].astro}
  scripts/{nav.ts, reveal.ts, pipe.ts, report.ts, storefront.ts, scenes.ts,
           chat.ts, lead-form.ts}
  styles/{tokens.css, global.css}
public/{robots → нет, og.png, rakurs-team.jpg}   # robots генерируется endpoint'ом
.github/workflows/{ci.yml, deploy-pages.yml, deploy-gcore.yml}
```

---

### Task 1: Каркас Astro

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro`, `src/env.d.ts`

- [ ] **Step 1: package.json и установка зависимостей**

```json
{
  "name": "rakurs-site",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  }
}
```

Run: `npm install astro @astrojs/sitemap && npm install -D @astrojs/check typescript vitest`

- [ ] **Step 2: astro.config.mjs**

```js
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
```

⚠ GitHub Pages отдаёт сайт из подпути `/rakurs-site/` — если интерим-деплой пойдёт на Pages, добавить `base: '/rakurs-site/'`. Для Gcore/rakurs.ai `base` не нужен.

- [ ] **Step 3: tsconfig.json, .gitignore, env.d.ts**

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:
```
node_modules/
dist/
.astro/
```

`src/env.d.ts`:
```ts
/// <reference types="astro/client" />
```

- [ ] **Step 4: заглушка src/pages/index.astro**

```astro
---
---
<h1>Rakurs — Astro skeleton</h1>
```

- [ ] **Step 5: проверить сборку**

Run: `npm run build && ls dist/index.html`
Expected: билд без ошибок, `dist/index.html` существует. Старый корневой `index.html` не тронут.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: astro skeleton (config, i18n, sitemap)"`

---

### Task 2: Дизайн-токены и глобальные стили

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [ ] **Step 1: tokens.css** (значения собраны из index.html; при порте секций встретится новый цвет — добавлять сюда)

```css
:root {
  /* фон/поверхности */
  --bg: #F9F5EC;
  --bg-alt: #F3EEE3;
  --bg-card: #FBF7EF;
  --bg-dark: #1B1815;
  --bg-footer: #17140F;
  --surface-white: #fff;
  /* текст */
  --ink: #241F1B;
  --ink-on-dark: #F1EAE0;
  --ink-muted-dark: #A2968A;
  /* акценты */
  --accent: #E37722;
  --accent-link: #B35F17;
  --accent-soft: #E9C7A3;
  /* границы */
  --border: #E4DBCD;
  --border-hover: #D8CDBB;
  /* шрифты */
  --font-body: 'Inter', system-ui, sans-serif;
  --font-head: 'Manrope', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  /* повторяющиеся размеры */
  --pad-x: clamp(20px, 5vw, 64px);
  --section-pad-y: clamp(52px, 7vh, 80px);
}
```

- [ ] **Step 2: global.css** — портировать базовый стиль из `index.html:258–321` (reset, body, a, заголовки и т.д.), заменив hex-значения на `var(--...)`. Начало:

```css
@import './tokens.css';

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); overflow-x: hidden; max-width: 100%; }
body { font-family: var(--font-body); color: var(--ink); -webkit-font-smoothing: antialiased; }
a { color: var(--accent-link); text-decoration: none; }
/* …остальное из index.html:262–321 без изменений семантики… */
```

Блок `rk-fixes` (`index.html:45–192`) сюда НЕ тащить — его части уедут в scoped-стили Storefront/сцен (Task 10, 18).

- [ ] **Step 3: подключить в заглушку** — в `src/pages/index.astro` добавить `import '../styles/global.css';` во frontmatter. Run: `npm run build` → билд ок, в dist появился css.

- [ ] **Step 4: Commit** — `git commit -am "feat: design tokens + global styles"`

---

### Task 3: Seo.astro и Base.astro

**Files:**
- Create: `src/components/Seo.astro`, `src/layouts/Base.astro`

- [ ] **Step 1: Seo.astro** (референс мета-набора: `index.html:6–31`)

```astro
---
interface Props {
  title: string;
  description: string;
  /** путь страницы без локали и без ведущего слэша: '' | 'products/b1' | … */
  path: string;
  locale: 'ru' | 'en';
  ogImage?: string;
}
const { title, description, path, locale, ogImage = 'og.png' } = Astro.props;
const site = Astro.site!;
const ruUrl = new URL(path, site);
const enUrl = new URL(`en/${path}`, site);
const canonical = locale === 'ru' ? ruUrl : enUrl;
const ogImageUrl = new URL(ogImage, site);
---
<title>{title}</title>
<meta name="description" content={description} />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
<link rel="canonical" href={canonical} />
<link rel="alternate" hreflang="ru" href={ruUrl} />
<link rel="alternate" hreflang="en" href={enUrl} />
<link rel="alternate" hreflang="x-default" href={ruUrl} />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Rakurs" />
<meta property="og:locale" content={locale === 'ru' ? 'ru_RU' : 'en_US'} />
<meta property="og:locale:alternate" content={locale === 'ru' ? 'en_US' : 'ru_RU'} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImageUrl} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Rakurs — готовые ИИ-решения для бизнеса. Ready-made AI solutions, fixed price." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageUrl} />
```

- [ ] **Step 2: Base.astro** (favicon — data-uri из `index.html:31`; шрифты — из 254–257; keywords/author — из 9–10)

```astro
---
import Seo from '../components/Seo.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  path: string;
  locale: 'ru' | 'en';
}
const { title, description, path, locale } = Astro.props;
const goatcounter = import.meta.env.PUBLIC_GOATCOUNTER_CODE;
---
<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Seo {title} {description} {path} {locale} />
    <meta name="author" content="Rakurs — Andrey Zaytsev, Egor" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23E37722'/%3E%3Ctext x='32' y='47' font-family='ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' font-size='42' font-weight='700' text-anchor='middle' fill='%23F9F5EC'%3Er%3C/text%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    {goatcounter && (
      <script is:inline data-goatcounter={`https://${goatcounter}.goatcounter.com/count`} async src="https://gc.zgo.at/count.js"></script>
    )}
    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: перевести заглушку index.astro на Base** (title/description — из `index.html:7–8`):

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Rakurs — ИИ-автоматизация бизнеса: готовые ИИ-решения и диагностика операционных потерь | AI Automation Agency"
  description="Rakurs находит, где бизнес теряет деньги, и закрывает это готовыми ИИ-решениями: ИИ-ассистент для продаж 24/7, автоматизация обработки заявок, ИИ-база знаний, генератор КП. Фиксированная цена, запуск за 1–3 недели. AI automation for business: fixed price, launch in 1–3 weeks."
  path=""
  locale="ru"
>
  <h1>skeleton</h1>
</Base>
```

- [ ] **Step 4: проверить**

Run: `npm run build && grep -o 'hreflang="en"' dist/index.html && grep -o 'rel="canonical"' dist/index.html`
Expected: по одному совпадению; canonical указывает на SITE.

- [ ] **Step 5: Commit** — `git commit -am "feat: Base layout + Seo component (canonical, hreflang, OG)"`

---

### Task 4: Контент-коллекции

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`,
  `src/content/products/{b1..b6}.{ru,en}.md` (12 файлов),
  `src/content/cases/{insurance,fintech,smart-tv,it-crisis,railway,marketplaces}.{ru,en}.md` (12),
  `src/content/faq/{q1..q7}.{ru,en}.md` (14)

- [ ] **Step 1: content.config.ts**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    order: z.number(),          // 1..6 — порядок в витрине
    code: z.string(),           // 'B1 · Sales-ассистент 24/7'
    tag: z.string(),
    hole: z.string(),           // '// дыра: …'
    title: z.string(),
    desc: z.string(),
    demo: z.enum(['chat', 'intake', 'kb', 'kp', 'panel', 'employee']),
    gets: z.array(z.string()).min(1),
    price: z.string(),          // 'от $2 500 + от $500/мес'
    priceFrom: z.number(),      // 2500 — для JSON-LD Offer
    launch: z.string(),
    cta: z.string(),
    note: z.string().default(''),
    jsonldName: z.string(),     // 'B1 · Sales-ассистент 24/7 / 24/7 AI Sales Assistant'
    jsonldDesc: z.string(),     // двуязычное описание для Offer (см. index.html:239–244)
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    order: z.number(),
    tab: z.string(),
    num: z.string(),            // 'дело №011'
    before: z.string(),
    after: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    note: z.string(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    order: z.number(),
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { products, cases, faq };
```

- [ ] **Step 2: helper src/lib/content.ts**

```ts
import { getCollection, type CollectionKey } from 'astro:content';

export type Locale = 'ru' | 'en';

/** 'b1.ru' → { slug: 'b1', locale: 'ru' } */
export function splitId(id: string): { slug: string; locale: Locale } {
  const m = /^(.+)\.(ru|en)$/.exec(id);
  if (!m) throw new Error(`content id без локали: "${id}" (ожидается <slug>.<ru|en>)`);
  return { slug: m[1], locale: m[2] as Locale };
}

/** Все записи коллекции для локали, отсортированные по order. */
export async function getLocalized<C extends CollectionKey>(collection: C, locale: Locale) {
  const all = await getCollection(collection);
  return all
    .filter((e) => splitId(e.id).locale === locale)
    .sort((a, b) => (a.data as any).order - (b.data as any).order)
    .map((e) => ({ ...e, slug: splitId(e.id).slug }));
}
```

- [ ] **Step 3: контент продуктов.** Источник RU-полей: массив `PRODUCTS` — `index.html:1115–1121` (шесть объектов, поля переносятся 1:1). `jsonldName`/`jsonldDesc`/`priceFrom` — из JSON-LD Offer-ов `index.html:239–244`. EN-поля — перевод каждой русской строки по словарю `i18n.js`. Эталон `src/content/products/b1.ru.md`:

```markdown
---
order: 1
code: "B1 · Sales-ассистент 24/7"
tag: "с этого начинают"
hole: "// дыра: заявки остывают за ночь"
title: "Заявки больше не остывают до утра"
desc: "ИИ-ассистент отвечает на сайте и в мессенджерах круглосуточно: квалифицирует лид, записывает на встречу и передаёт в CRM. Заметная доля клиентов готова оставить заявку вечером — а к утру она уже холодная."
demo: "chat"
gets:
  - "ловит вечерние и ночные заявки"
  - "сам квалифицирует и назначает встречу"
  - "опция: новый продающий лендинг в комплекте"
price: "от $2 500 + от $500/мес"
priceFrom: 2500
launch: "запуск 2 недели"
cta: "Хочу это решение"
note: "Демо-сценарий такого ассистента — в чате на этой странице, в правом нижнем углу."
jsonldName: "B1 · Sales-ассистент 24/7 / 24/7 AI Sales Assistant"
jsonldDesc: "ИИ-ассистент на сайте и в мессенджерах: отвечает круглосуточно, квалифицирует лиды, записывает на встречу, передаёт в CRM. От $2 500 + поддержка от $500/мес, запуск 2 недели. AI assistant that answers leads 24/7, qualifies them and books meetings. From $2,500 + from $500/mo."
---

Тело страницы /products/b1 — расширенное описание (Task 20). Пока пусто.
```

`b1.en.md`: те же `order/demo/priceFrom/jsonldName/jsonldDesc`, текстовые поля — из `i18n.js` (например, `desc` → значение ключа с русским desc). Аналогично b2–b6.

- [ ] **Step 4: контент кейсов.** Источник RU: массив `CASES` — `index.html:1124–1130`. EN — по `i18n.js` (переводы всех шести кейсов есть в начале файла, строки 2–34). Эталон `insurance.ru.md`:

```markdown
---
order: 1
tab: "Страховая"
num: "дело №011"
before: "Оператор заполняет каждую заявку вручную"
after: "Оператор подтверждает готовый разбор"
metric: "+30%"
metricLabel: "к скорости обработки"
note: "ИИ-обработка заявок прямо внутри CRM, штат операторов сокращён."
---
```

Слаги: insurance(№011), fintech(№007), smart-tv(№009), it-crisis(№004), railway(№002), marketplaces(№010).

- [ ] **Step 5: контент FAQ.** Источник: секция `#faq` `index.html:913–948` — 7 пар вопрос/ответ (RU), плюс FAQPage JSON-LD на 949 (сверить тексты). EN — по `i18n.js`. Формат `q1.ru.md`: frontmatter `order/question/answer`.

- [ ] **Step 6: проверка схем.** Временно добавить в `index.astro` frontmatter:

```ts
import { getLocalized } from '../lib/content';
const products = await getLocalized('products', 'ru');
if (products.length !== 6) throw new Error(`products ru: ${products.length} != 6`);
```

Run: `npm run build` → билд ок. Затем испортить поле в любом файле (удалить `price`) → `npm run build` падает с zod-ошибкой и именем файла → вернуть поле. Проверочный throw из index.astro убрать в Task 7.

- [ ] **Step 7: Commit** — `git commit -am "feat: content collections (products, cases, faq) ru+en"`

---

### Task 5: UI-словари i18n

**Files:**
- Create: `src/i18n/ru.ts`, `src/i18n/en.ts`, `src/i18n/ui.ts`

- [ ] **Step 1: структура словаря.** Все тексты секций, НЕ входящие в коллекции (hero, pain, how, flagship, founders, подписи кнопок, nav, footer, форма). `src/i18n/ru.ts`:

```ts
export const ru = {
  nav: {
    cases: 'Кейсы',        // точные строки взять при порте Nav (index.html:322–352)
    // …остальные пункты меню
  },
  hero: { /* заполняется в Task 8 из index.html:353–503 */ },
  pain: { /* Task 9 */ },
  how: { /* Task 9 */ },
  flagship: { /* Task 9 */ },
  founders: { /* Task 9 */ },
  storefront: { /* Task 10: заголовок секции, подписи */ },
  cases: { /* Task 11: заголовок секции */ },
  faq: { /* Task 11: заголовок секции */ },
  form: { /* Task 12: лейблы, плейсхолдеры, чипы (index.html:1132), состояния */ },
  footer: { /* Task 7 */ },
  chat: { /* Task 12/19: приветствие из state.chat (index.html:1144), кнопка */ },
} as const;
export type Dict = typeof ru;
```

`src/i18n/en.ts`:

```ts
import type { Dict } from './ru';
export const en: Dict = { /* та же структура; значения — из i18n.js */ };
```

Типизация `en: Dict` гарантирует: пропущенный ключ = ошибка `astro check`, а не молча русский текст (замена рантайм-словаря снята с контроля → на контроль компилятора).

`src/i18n/ui.ts`:

```ts
import { ru, type Dict } from './ru';
import { en } from './en';
import type { Locale } from '../lib/content';
export function t(locale: Locale): Dict {
  return locale === 'ru' ? ru : en;
}
```

- [ ] **Step 2: заполнение** происходит по мере порта секций (Task 7–12): при порте секции её строки уходят в `ru.ts`, перевод из `i18n.js` — в `en.ts`. В этой задаче создать файлы со структурой выше и секцией `nav`+`footer`, заполненной реальными строками из `index.html:322–352, 1056–1108`.

- [ ] **Step 3: проверить** — `npm run check` без ошибок. Commit: `git commit -am "feat: typed i18n dictionaries skeleton"`

---

### Task 6: JSON-LD библиотека

**Files:**
- Create: `src/lib/jsonld.ts`, `src/lib/__tests__/jsonld.test.ts`, `vitest.config.ts`

- [ ] **Step 1: vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/lib/__tests__/**/*.test.ts'] } });
```

- [ ] **Step 2: failing test** (данные-эталоны — из `index.html:193–249`):

```ts
import { describe, it, expect } from 'vitest';
import { organization, website, professionalService, faqPage } from '../jsonld';

const site = 'https://example.com/';

describe('jsonld', () => {
  it('organization has stable @id derived from site', () => {
    const org = organization(site);
    expect(org['@id']).toBe('https://example.com/#org');
    expect(org.name).toBe('Rakurs');
    expect(org.founder).toHaveLength(2);
  });
  it('website references org', () => {
    expect(website(site).publisher['@id']).toBe('https://example.com/#org');
  });
  it('professionalService builds one Offer per product + diagnostic', () => {
    const products = [
      { jsonldName: 'B1 / X', jsonldDesc: 'd1', priceFrom: 2500 },
      { jsonldName: 'B2 / Y', jsonldDesc: 'd2', priceFrom: 10000 },
    ];
    const svc = professionalService(site, products);
    const offers = svc.hasOfferCatalog.itemListElement;
    expect(offers).toHaveLength(3); // 2 продукта + диагностика
    expect(offers[0].price).toBe('2500');
    expect(offers[2].itemOffered.name).toMatch(/диагностика/i);
  });
  it('faqPage maps question/answer pairs', () => {
    const f = faqPage([{ question: 'Q?', answer: 'A.' }]);
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });
});
```

Run: `npm test` → FAIL (модуля нет).

- [ ] **Step 3: реализация src/lib/jsonld.ts.** Содержимое блоков переносится 1:1 из `index.html:193–249`, но все URL строятся от параметра `site`, а Offer-ы — из продуктов:

```ts
type ProductLd = { jsonldName: string; jsonldDesc: string; priceFrom: number };
type FaqLd = { question: string; answer: string };

export function organization(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site}#org`,
    name: 'Rakurs',
    alternateName: ['Ракурс', 'Rakurs AI', 'Rakurs Automation'],
    url: site,
    logo: `${site}og.png`,
    email: 'zaytsev.psy@gmail.com',
    description: '…',   // точный текст из index.html:203
    slogan: '…',        // index.html:204
    knowsLanguage: ['ru', 'en'],
    areaServed: 'Worldwide',
    founder: [
      { '@type': 'Person', name: 'Andrey Zaytsev', jobTitle: 'Co-founder, business psychologist — organizational diagnostics' },
      { '@type': 'Person', name: 'Egor', jobTitle: 'Co-founder, AI automation engineer' },
    ],
  };
}

export function website(site: string) { /* index.html:213–222, url от site */ }

export function professionalService(site: string, products: ProductLd[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site}#service`,
    // …шапка из index.html:229–234…
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Готовые ИИ-решения Rakurs / Rakurs AI solutions',
      itemListElement: [
        ...products.map((p) => ({
          '@type': 'Offer',
          price: String(p.priceFrom),
          priceCurrency: 'USD',
          itemOffered: { '@type': 'Service', name: p.jsonldName, description: p.jsonldDesc },
        })),
        { '@type': 'Offer', price: '1500', priceCurrency: 'USD',
          itemOffered: { '@type': 'Service', name: '…', description: '…' } }, // диагностика, index.html:245
      ],
    },
  };
}

export function faqPage(items: FaqLd[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  };
}
```

Все `'…'` — точные строки из указанных строк index.html (копипаст, не пересочинять).

- [ ] **Step 4:** `npm test` → PASS. Commit: `git commit -am "feat: jsonld builders from content (tested)"`

---

### Task 7: index.astro каркас + Nav + Footer

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Nav.astro.** Порт `index.html:322–352` по правилам порта. Props: `{ locale: Locale }`; тексты — `t(locale).nav`; ссылки секций — якоря `#pain, #storefront, …` как в оригинале; переключатель языка — обычная ссылка: с RU-страницы на `/en/<path>`, с EN — на `/<path>` (передавать `path` пропсом). Бургер-кнопка — разметка без логики (логика в Task 16).

- [ ] **Step 2: Footer.astro.** Порт `index.html:1056–1108` (кнопку чата `sc-if` НЕ включать — она уйдёт в ChatWidget, Task 12).

- [ ] **Step 3: собрать index.astro:**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import { organization, website, professionalService } from '../lib/jsonld';
import { getLocalized } from '../lib/content';

const locale = 'ru';
const site = Astro.site!.href;
const products = await getLocalized('products', locale);
const ld = [
  organization(site),
  website(site),
  professionalService(site, products.map((p) => p.data)),
];
---
<Base title="…как в Task 3…" description="…" path="" locale={locale}>
  <Fragment slot="head">
    {ld.map((obj) => (
      <script is:inline type="application/ld+json" set:html={JSON.stringify(obj)} />
    ))}
  </Fragment>
  <Nav locale={locale} path="" />
  <main><!-- секции добавляются в Task 8–12 --></main>
  <Footer locale={locale} />
</Base>
```

- [ ] **Step 4: проверить** — `npm run build && grep -c 'application/ld+json' dist/index.html` → Expected: `3`. Визуально: `npm run dev` → nav и footer выглядят как на старом сайте.

- [ ] **Step 5: Commit** — `git commit -am "feat: page shell with Nav, Footer, JSON-LD from collections"`

---

### Task 8: Hero (труба)

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`, `src/i18n/ru.ts`, `src/i18n/en.ts`

- [ ] **Step 1:** портировать `index.html:353–503` (секция `#top` + её `<style>` на 371) в `Hero.astro` по правилам порта. SVG-труба и подписи — как есть; динамические значения (`{{ scrub }}` и т.п.) заменить статичными стартовыми значениями с data-атрибутами (`data-pipe-value`), оживление — Task 17. Тексты → `ru.ts`/`en.ts` секция `hero`.
- [ ] **Step 2:** подключить `<Hero locale={locale} />` в `index.astro` внутрь `<main>`.
- [ ] **Step 3:** `npm run build && npm run check` → ок; в dev сверить с оригиналом бок о бок (открыть старый `index.html` файлом рядом).
- [ ] **Step 4: Commit** — `git commit -am "feat: hero section (static markup)"`

---

### Task 9: Pain, How, Flagship, Founders

**Files:**
- Create: `src/components/Pain.astro`, `src/components/How.astro`, `src/components/Flagship.astro`, `src/components/Founders.astro`
- Modify: `src/pages/index.astro`, `src/i18n/{ru,en}.ts`

- [ ] **Step 1:** `Pain.astro` ← `index.html:504–633`. Дашборд-виджет с `{{ loss }}`/`{{ share }}` — статичные стартовые значения + `data-report`-атрибуты (логика — Task 17).
- [ ] **Step 2:** `How.astro` ← `index.html:708–744`; `Flagship.astro` ← 745–812; `Founders.astro` ← 862–912 (фото `rakurs-team.jpg` положить в `public/`, путь `/rakurs-team.jpg`).
- [ ] **Step 3:** подключить все четыре в `index.astro` в исходном порядке (pain → storefront-заглушка → how → flagship → cases-заглушка → founders).
- [ ] **Step 4:** `npm run build && npm run check` → ок; визуальная сверка. Commit: `git commit -am "feat: pain, how, flagship, founders sections"`

---

### Task 10: Storefront + ProductCard

**Files:**
- Create: `src/components/Storefront.astro`, `src/components/ProductCard.astro`
- Modify: `src/pages/index.astro`, `src/styles/global.css` (если что-то из rk-fixes общее), `src/i18n/{ru,en}.ts`

- [ ] **Step 1: ProductCard.astro.** Props: `{ product: <данные схемы products>, slug: string, locale: Locale }`. Разметка карточки — из секции `#storefront` (`index.html:634–707`): там карточки рендерились из `PRODUCTS` рантаймом; статический аналог — все поля из props. Заголовок карточки — ссылка на `/products/<slug>` (или `/en/products/<slug>`).
- [ ] **Step 2: Storefront.astro.** Обёртка секции + грид: `products.map(p => <ProductCard …/>)`. CSS `rk-store-*` и `rk-spot-*` из `index.html:45–192` перенести в scoped-стили этого компонента (стрелки/драг — разметка `rk-store-nav` создавалась скриптом `index.html:1761–1788`; в статике отрендерить кнопки `‹ ›` сразу, скрипт Task 18 их только оживит).
- [ ] **Step 3:** подключить в `index.astro`: `<Storefront products={products} locale={locale} />` (коллекция уже загружена в Task 7).
- [ ] **Step 4:** `npm run build && grep -c 'B[1-6] ·' dist/index.html` → Expected: ≥ 6. Визуальная сверка карточек. Commit: `git commit -am "feat: storefront rendered from products collection"`

---

### Task 11: Cases + FAQ

**Files:**
- Create: `src/components/Cases.astro`, `src/components/Faq.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Cases.astro.** Разметка ← `index.html:813–861`; данные — `getLocalized('cases', locale)`, передаются props. Табы/свайп — статичная разметка всех кейсов (первый активен), переключение — Task 18.
- [ ] **Step 2: Faq.astro.** Разметка ← `index.html:913–948`; данные — коллекция `faq`. FAQPage JSON-LD: в `index.astro` добавить `faqPage(faqItems.map(f => f.data))` в массив `ld` (вместо инлайна на строке 949).
- [ ] **Step 3:** подключить обе секции; `npm run build && grep -c 'FAQPage' dist/index.html` → Expected: `1`; `grep -c 'дело №' dist/index.html` → ≥ 6.
- [ ] **Step 4: Commit** — `git commit -am "feat: cases and faq from collections, FAQPage JSON-LD generated"`

---

### Task 12: LeadForm + ChatWidget (разметка)

**Files:**
- Create: `src/components/LeadForm.astro`, `src/components/ChatWidget.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: LeadForm.astro** ← `index.html:965–1055`. Чипы болей — из `t(locale).form.chips` (исходник: `CHIPS`, `index.html:1132`). `<form>` — обычный HTML `method="POST"` на FormSubmit-endpoint (найти точный URL/поля в разметке формы и `support.js`-методе submit; сохранить hidden-поля FormSubmit: `_subject`, `_captcha` и т.д. как в оригинале). Состояния submitted/error — блоки с `hidden`, переключение в Task 19.
- [ ] **Step 2: ChatWidget.astro** — плавающая кнопка (`index.html:~1101–1106`) + панель чата (разметка внутри `x-dc`, найти по `chatOpen`/`chat` в 965–1108). Панель по умолчанию `hidden`. Приветствие — `t(locale).chat.greeting` (исходник: `index.html:1144`, обе локали там же).
- [ ] **Step 3:** подключить; `npm run build && npm run check` → ок. Сверить форму визуально. Commit: `git commit -am "feat: lead form + chat widget markup"`

---

### Task 13: EN-страница лендинга

**Files:**
- Create: `src/pages/en/index.astro`

- [ ] **Step 1:** скопировать `src/pages/index.astro` в `src/pages/en/index.astro`, заменив `const locale = 'ru'` → `'en'`, и title/description на английские (взять из `index.html:28–29` + расширить description по смыслу существующего twitter:description). Всё остальное идентично — компоненты уже locale-aware.
- [ ] **Step 2:** к этому моменту `en.ts` должен быть полностью заполнен (заполнялся по мере Task 7–12). `npm run check` ловит пропуски типом `Dict`.
- [ ] **Step 3:** `npm run build` → появился `dist/en/index.html`. Проверка «EN без JS»: `grep -c 'Ready-made\|fixed price\|AI assistant' dist/en/index.html` → > 0, кириллических строк из hero нет: `grep -c 'Заявки больше не остывают' dist/en/index.html` → `0`.
- [ ] **Step 4:** sitemap: `npm run build && cat dist/sitemap-index.xml` → существует; в `dist/sitemap-0.xml` есть `/` и `/en/` с `xhtml:link` альтернативами.
- [ ] **Step 5: Commit** — `git commit -am "feat: static EN landing at /en/ (real pages, no runtime translation)"`

---

### Task 14: robots.txt + llms.txt + llms-full.txt endpoints

**Files:**
- Create: `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `src/lib/llms.ts`, `src/lib/__tests__/llms.test.ts`
- Delete (в Task 23, не сейчас): корневые `robots.txt`, `llms.txt`, `llms-full.txt`, `sitemap.xml`

- [ ] **Step 1: failing test** для builder-а:

```ts
import { describe, it, expect } from 'vitest';
import { buildLlms, buildLlmsFull } from '../llms';

const products = [{ code: 'B1 · Sales-ассистент 24/7', price: 'от $2 500 + от $500/мес', launch: 'запуск 2 недели', jsonldDesc: 'd' }] as any[];

describe('llms builders', () => {
  it('llms.txt contains site url and every product code', () => {
    const txt = buildLlms('https://example.com/', products);
    expect(txt).toContain('https://example.com/');
    expect(txt).toContain('B1');
    expect(txt).toContain('$2 500');
  });
  it('llms-full contains launch terms', () => {
    expect(buildLlmsFull('https://example.com/', products)).toContain('запуск 2 недели');
  });
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: src/lib/llms.ts.** Взять текст существующих `llms.txt` / `llms-full.txt` как template-literal, заменив: хардкод URL → параметр `site`, блок с перечнем продуктов/цен → генерация из `products.map(...)`. Статичные разделы (о компании, «когда рекомендовать Rakurs») остаются литералами.
- [ ] **Step 3: endpoints:**

```ts
// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { getLocalized } from '../lib/content';
import { buildLlms } from '../lib/llms';

export const GET: APIRoute = async ({ site }) => {
  const products = await getLocalized('products', 'ru');
  return new Response(buildLlms(site!.href, products.map((p) => p.data)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

`llms-full.txt.ts` — аналогично с `buildLlmsFull`. `robots.txt.ts` — содержимое текущего `robots.txt` (все LLM-боты сохраняются!) литералом, строка `Sitemap:` → `` `Sitemap: ${site.href}sitemap-index.xml` ``.

- [ ] **Step 4:** `npm test` → PASS; `npm run build && head -5 dist/llms.txt dist/robots.txt` → файлы на месте, URL от SITE.
- [ ] **Step 5: Commit** — `git commit -am "feat: robots/llms.txt generated from content at build time"`

---

### Task 15: Скрипты — nav, scrollspy, reveal

**Files:**
- Create: `src/scripts/nav.ts`, `src/scripts/reveal.ts`
- Modify: `src/components/Nav.astro`, `src/pages/index.astro` (и en/)

- [ ] **Step 1: nav.ts** — порт поведения `setupNav`/`setupRoute` из `support.js` (найти по имени метода): бургер open/close, scrollspy (подсветка активного пункта по IntersectionObserver), плавный скролл к якорям. Экспорт `initNav()`, навешивание по `data-*`-атрибутам из Task 7.
- [ ] **Step 2: reveal.ts** — порт `setupReveal` (+`setupMagnet`/`setupLens`, если они дают видимый эффект — проверить в старом сайте; если это только курсор-«линза», переносить как есть). Экспорт `initReveal()`.
- [ ] **Step 3: подключение** — в `Nav.astro`:

```astro
<script>
  import { initNav } from '../scripts/nav';
  initNav();
</script>
```

Аналогично reveal в index-страницах (или в Base — один раз).

- [ ] **Step 4:** `npm run check` → ок. Ручная проверка в `npm run dev`: бургер на мобильной ширине, подсветка меню при скролле, reveal-анимации секций — поведение совпадает со старым сайтом.
- [ ] **Step 5: Commit** — `git commit -am "feat: nav/scrollspy/reveal scripts (vanilla TS)"`

---

### Task 16: Скрипты — труба (pipe) и калькулятор потерь

**Files:**
- Create: `src/scripts/pipe.ts`, `src/scripts/report.ts`
- Modify: `src/components/Hero.astro`, `src/components/Pain.astro`

- [ ] **Step 1: pipe.ts** — порт `setupPipe` + `setupScrub` из `support.js`: драг кружка, обновление подписей/цифр трубы. Начальное значение — `data-pipe-value` из Task 8.
- [ ] **Step 2: report.ts** — порт `setupReport`: слайдеры/инпуты потерь (`loss`, `share`), пересчёт цифр дашборда в Pain.
- [ ] **Step 3:** подключить `<script>` в Hero/Pain; `npm run check`; ручная проверка: перетаскивание кружка меняет цифры, калькулятор считает как старый сайт (сверить одинаковые входы → одинаковые выходы).
- [ ] **Step 4: Commit** — `git commit -am "feat: hero pipe scrub + loss report interactivity"`

---

### Task 17: Скрипты — storefront, spotlight, сцены, кейсы

**Files:**
- Create: `src/scripts/storefront.ts`, `src/scripts/scenes.ts`
- Modify: `src/components/Storefront.astro`, `src/components/Cases.astro`

- [ ] **Step 1: storefront.ts** — порт ТРЁХ vanilla-скриптов из `index.html`: drag+стрелки (1761–1788), spotlight-контроллер (1789–1844) — они уже без React, почти копипаст в TS с типами. Убрать `setInterval`-поллинг DOM (там он ждал React-рендер) — в статике элементы есть сразу, инициализация напрямую.
- [ ] **Step 2: scenes.ts** — порт «immersive product scenes» (`index.html:1845–1956` + связанные методы Component, если есть). Переключение кейс-табов в Cases — сюда же или в storefront.ts (по фактическому коду).
- [ ] **Step 3:** подключить, `npm run check`, ручная сверка: свайп карточек, стрелки, раскрытие карточки (spotlight), пиксельные сценки-демо, переключение кейсов.
- [ ] **Step 4: Commit** — `git commit -am "feat: storefront drag/spotlight/scenes + cases tabs"`

---

### Task 18: Скрипты — чат и форма

**Files:**
- Create: `src/scripts/chat.ts`, `src/scripts/lead-form.ts`
- Modify: `src/components/ChatWidget.astro`, `src/components/LeadForm.astro`

- [ ] **Step 1: chat.ts** — порт демо-сценария чата из `support.js` (методы вокруг `state.chat`, `chatBusy`, `openChat`): открытие/закрытие панели, скриптованные ответы, рендер сообщений через DOM API (createElement, не innerHTML для пользовательского ввода). Локаль приветствия — по `document.documentElement.lang` (уже верная на каждой странице), НЕ по `navigator.language`.
- [ ] **Step 2: lead-form.ts** — порт submit-логики: валидация полей, выбор чипов, POST на FormSubmit (fetch либо нативный submit — как в оригинале), показ submitted/error блоков.
- [ ] **Step 3:** `npm run check`; ручная проверка чата (сценарий проходит) и формы (тестовая отправка на FormSubmit доходит — как в старом README).
- [ ] **Step 4: Commit** — `git commit -am "feat: chat demo + lead form logic (no React, no dc-runtime)"`

---

### Task 19: Страницы продуктов и кейсов

**Files:**
- Create: `src/pages/products/[slug].astro`, `src/pages/cases/[slug].astro`, `src/pages/en/products/[slug].astro`, `src/pages/en/cases/[slug].astro`
- Modify: `src/content/products/*.md`, `src/content/cases/*.md` (тела страниц), `src/components/ProductCard.astro` (ссылки уже стоят с Task 10)

- [ ] **Step 1: products/[slug].astro:**

```astro
---
import { render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Footer from '../../components/Footer.astro';
import LeadForm from '../../components/LeadForm.astro';
import { getLocalized } from '../../lib/content';

export async function getStaticPaths() {
  const products = await getLocalized('products', 'ru');
  return products.map((p) => ({ params: { slug: p.slug }, props: { entry: p } }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<Base
  title={`${d.code} — ${d.title} | Rakurs`}
  description={d.desc}
  path={`products/${entry.slug}`}
  locale="ru"
>
  <Fragment slot="head">
    <script is:inline type="application/ld+json" set:html={JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Service',
      name: d.jsonldName, description: d.jsonldDesc,
      offers: { '@type': 'Offer', price: String(d.priceFrom), priceCurrency: 'USD' },
      provider: { '@id': `${Astro.site!.href}#org` },
    })} />
  </Fragment>
  <Nav locale="ru" path={`products/${entry.slug}`} />
  <main>
    <!-- шапка: code, title, desc, gets, price, launch — вёрстка по мотивам ProductCard -->
    <Content />
    <LeadForm locale="ru" />
  </main>
  <Footer locale="ru" />
</Base>
```

EN-вариант — тот же файл в `en/products/` с `locale='en'` и `getLocalized(…, 'en')`. `cases/[slug].astro` — аналогично (title из `tab`+`after`, JSON-LD не нужен).

- [ ] **Step 2: тела страниц.** В `.md`-файлах продуктов написать расширенное описание (2–4 абзаца: боль → что делает решение → что входит → как запускаем; материал — `desc`+`gets`+`note`+`jsonldDesc`, для кейсов — before/after/metric/note). Это единственный НОВЫЙ контент в проекте; RU пишется по существующим текстам, EN — перевод.
- [ ] **Step 3:** `npm run build && ls dist/products/b1/index.html dist/en/cases/insurance/index.html` → существуют; sitemap содержит новые URL.
- [ ] **Step 4: Commit** — `git commit -am "feat: product and case detail pages (ru+en) with Service JSON-LD"`

---

### Task 20: CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1:**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2:** запушить, убедиться что workflow зелёный (`gh run watch`).
- [ ] **Step 3: Commit** уже сделан пушем.

---

### Task 21: Деплой на Gcore (+ интерим)

**Files:**
- Create: `.github/workflows/deploy-gcore.yml`
- Modify: `README.md`

- [ ] **Step 1: deploy-gcore.yml** (Gcore Object Storage — S3-совместимый; endpoint у аккаунта вида `s-ed1.cloud.gcore.lu`, уточнить в панели Gcore):

```yaml
name: Deploy to Gcore
on:
  push: { branches: [main] }
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ vars.GCORE_ENABLED == 'true' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run build
      - name: Sync to Gcore Object Storage
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.GCORE_S3_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.GCORE_S3_SECRET }}
        run: |
          aws s3 sync dist/ "s3://${{ vars.GCORE_BUCKET }}/" \
            --endpoint-url "https://${{ vars.GCORE_S3_ENDPOINT }}" \
            --delete
```

- [ ] **Step 2: настройка руками (документировать в README):** создать bucket в Gcore Object Storage → API-ключи → в GitHub: secrets `GCORE_S3_KEY/SECRET`, vars `GCORE_BUCKET`, `GCORE_S3_ENDPOINT`, `GCORE_ENABLED=true` → CDN-ресурс Gcore с origin=bucket → проверить выдачу. До этого момента прод остаётся старым сайтом на GitHub Pages — новый код ему не мешает.
- [ ] **Step 3:** обновить README: как собирать, где контент, как деплоится, что при переезде на rakurs.ai меняется ОДНА константа `SITE` в `astro.config.mjs` (+DNS+Search Console по DOMAIN_MIGRATION.md).
- [ ] **Step 4: Commit** — `git commit -am "ci: gcore deploy workflow + docs"`

---

### Task 22: Финальная сверка

- [ ] **Step 1: Side-by-side:** открыть старый сайт и `npm run preview`, пройти все секции RU и EN, все виджеты. Чек-лист: nav/бургер/scrollspy, труба, калькулятор, карточки+spotlight+сцены+свайп, кейсы, FAQ, форма (тестовая отправка), чат, переключатель языка (ведёт на парную страницу).
- [ ] **Step 2: SEO-проверки:** Rich Results Test для `/` (Organization, ProfessionalService, FAQPage) и `/products/b1` (Service); `curl -s <preview>/en/ | grep -c 'lang="en"'` → 1; Lighthouse на `/` — Performance/SEO не хуже старого (ожидаемо сильно лучше: без React/Babel из unpkg).
- [ ] **Step 3:** зафиксировать результаты в PR/коммит-сообщении.

---

### Task 23: Удаление легаси

**Files:**
- Delete: `index.html`, `support.js`, `i18n.js`, `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`, `.nojekyll` (если уходим с Pages)
- Modify: `README.md`, `DOMAIN_MIGRATION.md`

- [ ] **Step 1:** только ПОСЛЕ того как Gcore-деплой проверен и (при переезде) DNS переключён. `git rm index.html support.js i18n.js llms.txt llms-full.txt robots.txt sitemap.xml`.
- [ ] **Step 2:** `DOMAIN_MIGRATION.md` переписать: миграция = правка `SITE` в astro.config.mjs + DNS + Search Console (sed-инструкция устарела).
- [ ] **Step 3:** `npm run build && npm test && npm run check` → всё зелёное. Commit: `git commit -am "chore: remove legacy monolith (index.html, dc-runtime, i18n dictionary)"`

---

## Замечание о тестировании

Артефакт проекта — статический HTML, поэтому основная проверка каждой задачи — `astro build` (zod-схемы валидируют контент, битые слаги роняют `getStaticPaths`) + `astro check` (типы, полнота словарей `Dict`) + grep по `dist/`. Vitest покрывает только чистые функции с логикой (`jsonld.ts`, `llms.ts`, `content.ts`). Поведение виджетов сверяется вручную со старым сайтом — он остаётся в репо как эталон до Task 23.
