# rakurs-site — Astro (RU + EN)

Сайт студии ИИ-автоматизации Rakurs. Полностью статический Astro-сайт, две локали
(RU — дефолтная, EN — под `/en/`), контент в Markdown-коллекциях, SEO/GEO-артефакты
(sitemap, robots.txt, llms.txt) генерируются на билде из того же контента.

Это v5+ переписывание легаси-версии (`index.html` + `i18n.js` + `support.js`,
один гигантский HTML-файл с рантайм-переводом). Архитектура и весь контент теперь
живут в `src/`; корневые легаси-файлы временно остаются рядом как референс (см.
«Статус легаси» ниже).

## Быстрый старт

```bash
npm i
npm run dev      # локальный сервер с хот-релоадом
npm run build    # прод-сборка в dist/
npm run check    # astro check (типы, шаблоны, схемы контента)
npm test         # vitest — 16 тестов (jsonld, llms.txt)
```

Node: `^20.19.0 || >=22.12.0` (см. `engines` в `package.json`).

## Где править контент

Весь редакционный контент лежит в трёх content-коллекциях
(`src/content.config.ts` задаёт схемы через Zod):

- **`src/content/products/*.ru.md` / `*.en.md`** — карточки продуктов витрины
  (B1…B6). Ключевые поля фронтматтера: `code`, `tag`, `hole`, `title`, `desc`,
  `demo`, `gets` (список буллетов), **`price`** (человекочитаемая строка,
  `"от $2 500 + от $500/мес"`), **`priceFrom`** (число для JSON-LD `Offer`),
  `launch`, `cta`, `jsonldName` / `jsonldDesc` (двуязычное описание для
  JSON-LD и llms.txt). Тело markdown — секции детальной страницы продукта.
- **`src/content/cases/*.ru.md` / `*.en.md`** — карточки кейсов (before/after,
  метрика, заметка). Поля: `tab`, `num`, `before`, `after`, `metric`,
  `metricLabel`, `note`.
- **`src/content/faq/*.ru.md` / `*.en.md`** — вопросы/ответы (`question`,
  `answer`), рендерятся в секцию FAQ и в JSON-LD `FAQPage`.

Каждый файл существует в паре `<slug>.ru.md` + `<slug>.en.md` — соответствие
между локалями идёт по общему `<slug>`.

**Цены меняются в одном месте.** `price` / `priceFrom` правятся только во
фронтматтере продукта — дальше значение само расходится в HTML витрины,
JSON-LD `Offer` (`src/lib/jsonld.ts`) и в каталог `llms.txt` /
`llms-full.txt` (`src/lib/llms.ts`, поле `jsonldDesc`). Sed по всему репо
для смены цены больше не нужен.

Тексты интерфейса, которые не относятся к конкретной сущности из коллекции
(заголовки секций, лейблы кнопок, футер, копирайты, тексты калькулятора и
т.п.) — в `src/i18n/ru.ts` и `src/i18n/en.ts` (общий тип полей — `src/i18n/ui.ts`).

## Структура проекта

```
src/
  components/       Astro-компоненты секций (Hero, Storefront, Cases, Faq, …)
  content/           content-коллекции: products/ cases/ faq/ (ru+en markdown)
  content.config.ts  Zod-схемы коллекций
  i18n/              ru.ts / en.ts — статические строки интерфейса, ui.ts — тип
  layouts/Base.astro общий HTML-shell (head, шрифты, курсор-линза, GoatCounter)
  lib/               content.ts (загрузка+сортировка коллекций), jsonld.ts,
                     llms.ts — генераторы JSON-LD и llms.txt из контента
  pages/             index.astro (RU), en/index.astro (EN),
                     products/[slug].astro, cases/[slug].astro (+ en/-варианты),
                     robots.txt.ts, llms.txt.ts, llms-full.txt.ts — API-роуты
  scripts/           ванильный TS для интерактива (nav, chat, calculator, …)
  styles/            global.css, tokens.css
public/              статика, копируется в dist/ как есть (rakurs-team.jpg)
```

26 страниц на выходе (RU-лендинг + детальные страницы продуктов/кейсов, те же
под `/en/`, плюс sitemap-index.xml + sitemap-0.xml / robots.txt / llms.txt).

## SEO / GEO

- `src/components/Seo.astro` + `src/layouts/Base.astro` — canonical,
  hreflang (`ru` / `en` / `x-default`), OG/Twitter-мета на каждой странице.
- sitemap — генерируется автоматически интеграцией `@astrojs/sitemap`
  (i18n-aware, см. `astro.config.mjs`); файлы `sitemap-index.xml` + `sitemap-0.xml`,
  в Search Console отправлять `sitemap-index.xml` (robots.txt уже указывает на него).
- `robots.txt`, `llms.txt`, `llms-full.txt` — рендерятся как API-роуты
  (`src/pages/robots.txt.ts`, `llms.txt.ts`, `llms-full.txt.ts`) из того же
  контента коллекций — каталог продуктов и цены не расходятся с сайтом.
- JSON-LD (`Organization`, `WebSite`, `ProfessionalService` с каталогом
  Offer, `FAQPage`) собирается в `src/lib/jsonld.ts` из коллекций
  products/faq.

## Деплой

**CI** (`.github/workflows/ci.yml`) гоняется на каждый push в `main` и
`astro-rewrite` и на каждый PR: `npm ci` → `astro check` → `vitest` →
`astro build`. Это чистый guard-рейл, ничего не публикует.

**Прод-деплой на Gcore** (`.github/workflows/deploy-gcore.yml`) — билдит
сайт и синкает `dist/` в Gcore Object Storage (S3-совместимое хранилище)
через `aws s3 sync`. Джоба выключена по умолчанию (`if: vars.GCORE_ENABLED
== 'true'`) — пока Gcore не настроен, воркфлоу существует, но не срабатывает.

Чтобы включить деплой на Gcore:

1. В панели Gcore создать **bucket** в Object Storage (S3-совместимый).
2. Там же выпустить **API-ключи** (Access Key / Secret Key) с правом записи
   в этот bucket.
3. В настройках репозитория на GitHub:
   - `Settings → Secrets and variables → Actions → Secrets`:
     добавить `GCORE_S3_KEY` (Access Key) и `GCORE_S3_SECRET` (Secret Key).
   - `Settings → Secrets and variables → Actions → Variables`:
     добавить `GCORE_BUCKET` (имя bucket), `GCORE_S3_ENDPOINT` (S3-эндпоинт
     Gcore, без `https://`), `GCORE_ENABLED` = `true`.
4. Поверх bucket в Gcore создать **CDN-ресурс** (origin = bucket), включить
   HTTPS/кастомный домен на CDN-ресурсе.
5. Запушить в `main` (или запустить воркфлоу вручную через
   `workflow_dispatch`) — деплой сихронизирует `dist/` в bucket и (если
   настроено) очистит кэш CDN.

Пока `GCORE_ENABLED` не выставлен — GitHub Pages из корня репозитория на
`main` продолжает как ни в чём не бывало отдавать старую (легаси) версию
сайта, новая ветка/код её не трогает.

## Переезд на rakurs.ai

Единственная правка — в `astro.config.mjs`:

```js
export const SITE = 'https://rakurs.ai/';
```

и удаление строки `base: '/rakurs-site/'` чуть ниже (на своём домене сайт
живёт в корне, subpath не нужен — см. комментарии в файле). Всё остальное
(canonical, hreflang, sitemap, OG-урлы, JSON-LD, llms.txt) вычисляется из
`SITE`/`base` на билде — руками по файлам ничего искать не нужно.

Дальше — DNS на новый домен (Gcore CDN) и Google Search Console / Bing
Webmaster Tools: добавить новое свойство `rakurs.ai`, отправить новый
`sitemap-index.xml`.

(Старый `DOMAIN_MIGRATION.md` в корне описывает sed-миграцию легаси-версии
на GitHub Pages — актуален только для легаси-файлов; чек-лист под
Astro-архитектуру появится отдельно.)

## После деплоя (одноразовый чек-лист)

1. Google Search Console: добавить сайт, отправить `sitemap.xml`.
2. Bing Webmaster Tools: то же (Bing питает ChatGPT Search).
3. Проверить активацию FormSubmit (тестовая заявка → письмо → activation-ссылка).
4. Rich Results Test: https://search.google.com/test/rich-results — проверить,
   что Organization/FAQ подхватываются.

## Статус легаси

Корневые `index.html`, `i18n.js`, `support.js`, `og.png`, `robots.txt`,
`sitemap.xml`, `llms.txt`, `llms-full.txt`, `rakurs-team.jpg` — это старая
(pre-Astro) версия сайта, которую сейчас раздаёт GitHub Pages с `main`.
Они специально оставлены как референс, пока новая версия не проверена
сквозь деплой и не сверена руками с легаси. Удаление легаси-файлов и
финальное переключение GitHub Pages/DNS на новую версию — отдельный коммит
после того, как Gcore-деплой пройдёт проверку.
