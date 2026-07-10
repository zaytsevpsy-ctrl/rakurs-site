# Переезд на rakurs.ai — чеклист (15 минут)

Все SEO-артефакты зашиты под текущий адрес GitHub Pages. При покупке домена:

## 1. Подключить домен к GitHub Pages
1. Репо `rakurs-site` → Settings → Pages → Custom domain → `rakurs.ai` → Save (создастся файл `CNAME`).
2. У регистратора: A-записи корня → 185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153; CNAME `www` → `zaytsevpsy-ctrl.github.io`.
3. Через 10–30 мин включить Enforce HTTPS.

## 2. Заменить URL во всех файлах (одна команда)
В папке сайта (Git Bash / WSL):
```bash
grep -rl 'zaytsevpsy-ctrl.github.io/rakurs-site' --include='*.html' --include='*.txt' --include='*.xml' --include='*.js' . \
  | xargs sed -i 's|https://zaytsevpsy-ctrl.github.io/rakurs-site/|https://rakurs.ai/|g'
```
Файлы, которые затронет: `index.html` (canonical, hreflang, og:url, og:image, twitter:image, JSON-LD ×3), `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`.

## 3. Проверить и переотправить
1. Тест: https://search.google.com/test/rich-results (FAQ + Organization должны подхватиться).
2. Google Search Console: добавить property `rakurs.ai` → отправить `https://rakurs.ai/sitemap.xml`.
3. Bing Webmaster Tools: то же (Bing питает ChatGPT Search — важно для GEO).
4. Проверить https://rakurs.ai/llms.txt и /robots.txt отдаются.
5. Обновить ссылку сайта в LinkedIn-профилях, Telegram-канале, подписях email.

## 4. Email на домене (рекомендуется)
hello@rakurs.ai (Zoho Mail бесплатно / Google Workspace) → заменить zaytsev.psy@gmail.com в футере, FAQ, llms.txt, llms-full.txt, JSON-LD и FormSubmit.
