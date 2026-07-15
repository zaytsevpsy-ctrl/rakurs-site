# Запуск на rakurs.io — чеклист

Сайт уже собирается под `https://rakurs.io/` (константа `SITE` в
`astro.config.mjs`) — canonical, hreflang, OG-урлы, JSON-LD, sitemap,
robots.txt и llms.txt вычисляются из неё на билде. Никакого sed по файлам:
если домен когда-нибудь снова поменяется — правится одна строка.

## 1. Хостинг: Gcore (статика + CDN)

1. Gcore → Object Storage → создать bucket; выпустить API-ключи с правом записи.
2. GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `GCORE_S3_KEY`, `GCORE_S3_SECRET`
   - Variables: `GCORE_BUCKET`, `GCORE_S3_ENDPOINT` (без `https://`), `GCORE_ENABLED` = `true`
3. Gcore → CDN → создать ресурс с origin = bucket, включить HTTPS.
4. Push в `main` (или запустить `Deploy to Gcore` вручную) — workflow
   зальёт `dist/` в bucket.

## 2. DNS

У регистратора: CNAME (или A/ALIAS, как скажет Gcore) корня `rakurs.io` →
CNAME-цель CDN-ресурса Gcore. Дождаться выпуска HTTPS-сертификата на CDN.

## 3. Проверить и переотправить

1. https://rakurs.io/ и https://rakurs.io/en/ открываются, переключатель языка работает.
2. https://rakurs.io/robots.txt и /llms.txt отдаются.
3. Rich Results Test: https://search.google.com/test/rich-results
   (Organization, ProfessionalService, FAQPage на `/`; Service на `/products/b1/`).
4. Google Search Console: property `rakurs.io` → отправить
   `https://rakurs.io/sitemap-index.xml`.
5. Bing Webmaster Tools: то же (Bing питает ChatGPT Search — важно для GEO).
6. Проверить активацию FormSubmit (тестовая заявка → письмо → activation-ссылка).
7. Обновить ссылку сайта в LinkedIn-профилях, Telegram-канале, подписях email.

## 4. После проверки: убрать легаси

Старые `index.html`, `support.js`, `i18n.js`, корневые `og.png`, `robots.txt`,
`sitemap.xml`, `llms.txt`, `llms-full.txt`, `rakurs-team.jpg`, `.nojekyll` —
удалить отдельным коммитом; отключить GitHub Pages в настройках репозитория
(или оставить как резерв до стабилизации DNS).

## 5. Email на домене (рекомендуется)

hello@rakurs.io (Zoho Mail бесплатно / Google Workspace) → заменить
zaytsev.psy@gmail.com в `src/i18n/*` (футер), `src/lib/jsonld.ts`,
`src/lib/llms.ts` и endpoint FormSubmit в `src/components/LeadForm.astro`
(+ `src/scripts/lead-form.ts` не трогать — он читает endpoint из data-атрибута).
