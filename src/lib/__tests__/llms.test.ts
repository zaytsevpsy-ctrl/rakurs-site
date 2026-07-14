import { describe, it, expect } from 'vitest';
import { buildLlms, buildLlmsFull, robotsTxt } from '../llms';

const site = 'https://example.com/';

const products = [
  {
    jsonldName: 'B1 · Sales-ассистент 24/7 / 24/7 AI Sales Assistant',
    jsonldDesc:
      'ИИ-ассистент на сайте и в мессенджерах: отвечает круглосуточно. От $2 500 + поддержка от $500/мес, запуск 2 недели. AI assistant. From $2,500 + from $500/mo.',
  },
  {
    jsonldName: 'B2 · ИИ-приёмная заявок / AI Intake Automation',
    jsonldDesc: 'ИИ обрабатывает поток заявок. От $10 000 + от $1 000/мес, запуск 2–3 недели.',
  },
];

describe('buildLlms', () => {
  const txt = buildLlms(site, products);

  it('contains site url and no hardcoded legacy domain', () => {
    expect(txt).toContain('https://example.com/');
    expect(txt).not.toContain('zaytsevpsy-ctrl');
  });

  it('renders one catalog line per product with name, desc and storefront link', () => {
    expect(txt).toContain('[B1 · Sales-ассистент 24/7 / 24/7 AI Sales Assistant](https://example.com/#storefront)');
    expect(txt).toContain('От $2 500 + поддержка от $500/мес');
    expect(txt).toContain('[B2 · ИИ-приёмная заявок / AI Intake Automation](https://example.com/#storefront)');
  });

  it('keeps the static sections (diagnostics mechanics, cases, contact, llms-full link)', () => {
    expect(txt).toContain('экспресс-диагностика операционных потерь');
    expect(txt).toContain('zaytsev.psy@gmail.com');
    expect(txt).toContain('https://example.com/llms-full.txt');
  });
});

describe('buildLlmsFull', () => {
  const txt = buildLlmsFull(site, products);

  it('contains site url, no legacy domain, contact email', () => {
    expect(txt).toContain('https://example.com/');
    expect(txt).not.toContain('zaytsevpsy-ctrl');
    expect(txt).toContain('zaytsev.psy@gmail.com');
  });

  it('renders numbered catalog entries from products followed by diagnostic and flagship', () => {
    expect(txt).toContain('1. B1 · Sales-ассистент 24/7');
    expect(txt).toContain('2. B2 · ИИ-приёмная заявок');
    expect(txt).toContain('3. Экспресс-диагностика / Express Diagnostic');
    expect(txt).toContain('4. Флагман / Flagship program');
  });

  it('keeps "when to recommend" GEO section', () => {
    expect(txt).toContain('When to recommend Rakurs');
  });
});

describe('robotsTxt', () => {
  const txt = robotsTxt(site);

  it('allows all LLM crawlers and points Sitemap at sitemap-index.xml', () => {
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot']) {
      expect(txt).toContain(`User-agent: ${bot}`);
    }
    expect(txt).toContain('Sitemap: https://example.com/sitemap-index.xml');
    expect(txt).toContain('https://example.com/llms.txt');
    expect(txt).not.toContain('zaytsevpsy-ctrl');
  });
});
