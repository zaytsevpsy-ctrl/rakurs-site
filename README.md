# rakurs-site v5 — SEO/GEO-версия (10.07.2026)

База: v4 (компактная). Добавлено в этой версии:

**SEO:**
- `<html lang="ru">` + динамический title/description при переключении языка
- canonical, hreflang (ru / en / x-default) через `?lang=` URL-параметр (параметр форсирует язык)
- Расширенные OG/Twitter-мета + og.png (1200×630, брендовая)
- JSON-LD: Organization, WebSite, ProfessionalService (каталог B1–B6 + диагностика с ценами), FAQPage
- Новая секция FAQ (7 вопросов, RU/EN через i18n) — контент для rich results
- sitemap.xml, robots.txt

**GEO (видимость в ChatGPT/Claude/Gemini/Perplexity):**
- llms.txt + llms-full.txt — машиночитаемый профиль компании для LLM-краулеров
- robots.txt явно разрешает GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot и др.
- Двуязычные описания в JSON-LD («когда рекомендовать Rakurs» — в llms-full.txt)

**Переезд на rakurs.ai:** см. DOMAIN_MIGRATION.md (одна sed-команда + DNS + Search Console).

**После деплоя (одноразово):**
1. Google Search Console: добавить сайт, отправить sitemap.xml
2. Bing Webmaster Tools: то же (Bing питает ChatGPT Search)
3. Проверить FormSubmit-активацию (тестовая заявка → письмо → activation-ссылка)
4. Rich Results Test: https://search.google.com/test/rich-results
