import { describe, it, expect } from 'vitest';
import { organization, website, professionalService, productService, faqPage } from '../jsonld';

const site = 'https://example.com/';

describe('jsonld', () => {
  it('productService builds a standalone Service with provider ref to #org', () => {
    const svc = productService(site, {
      jsonldName: 'B1 · X / Y',
      jsonldDesc: 'desc',
      priceFrom: 2500,
    });
    expect(svc).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'B1 · X / Y',
      description: 'desc',
      offers: { '@type': 'Offer', price: '2500', priceCurrency: 'USD' },
      provider: { '@id': 'https://example.com/#org' },
    });
  });

  it('organization has stable @id derived from site', () => {
    const org = organization(site);
    expect(org['@id']).toBe('https://example.com/#org');
    expect(org.name).toBe('Rakurs');
    expect(org.founder).toHaveLength(2);
  });

  it('organization copies static content 1:1 from legacy', () => {
    const org = organization(site);
    expect(org['@context']).toBe('https://schema.org');
    expect(org['@type']).toBe('Organization');
    expect(org.alternateName).toEqual(['Ракурс', 'Rakurs AI', 'Rakurs Automation']);
    expect(org.url).toBe('https://example.com/');
    expect(org.logo).toBe('https://example.com/og.png');
    expect(org.email).toBe('info@rakurs.dev');
    expect(org.description).toBe(
      'Rakurs — студия ИИ-автоматизации бизнеса. Находим, где бизнес теряет деньги, и закрываем это готовыми ИИ-решениями с фиксированной ценой: ИИ-ассистент для продаж, автоматизация обработки заявок, ИИ-база знаний по документации, генератор коммерческих предложений. Rakurs is an AI automation studio: we find where a business loses money and close the gaps with ready-made AI solutions at a fixed price.',
    );
    expect(org.slogan).toBe(
      'Под нашим ракурсом видно, где утекают деньги / From our angle, your losses have nowhere to hide',
    );
    expect(org.knowsLanguage).toEqual(['ru', 'en']);
    expect(org.areaServed).toBe('Worldwide');
    expect(org.founder).toEqual([
      { '@type': 'Person', name: 'Andrey Zaytsev', jobTitle: 'Co-founder, business psychologist — organizational diagnostics' },
      { '@type': 'Person', name: 'Egor', jobTitle: 'Co-founder, AI automation engineer' },
    ]);
  });

  it('website references org', () => {
    expect(website(site).publisher['@id']).toBe('https://example.com/#org');
  });

  it('website copies static content 1:1 from legacy', () => {
    const site_ = website(site);
    expect(site_['@context']).toBe('https://schema.org');
    expect(site_['@type']).toBe('WebSite');
    expect(site_['@id']).toBe('https://example.com/#website');
    expect(site_.url).toBe('https://example.com/');
    expect(site_.name).toBe('Rakurs — готовые ИИ-решения для бизнеса');
    expect(site_.inLanguage).toEqual(['ru', 'en']);
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
    expect(offers[0].priceCurrency).toBe('USD');
    expect(offers[0].itemOffered).toEqual({ '@type': 'Service', name: 'B1 / X', description: 'd1' });
    expect(offers[1].price).toBe('10000');
    expect(offers[1].itemOffered).toEqual({ '@type': 'Service', name: 'B2 / Y', description: 'd2' });
    expect(offers[2].itemOffered.name).toMatch(/диагностика/i);
  });

  it('professionalService header fields and diagnostic offer copied 1:1 from legacy', () => {
    const svc = professionalService(site, []);
    expect(svc['@context']).toBe('https://schema.org');
    expect(svc['@type']).toBe('ProfessionalService');
    expect(svc['@id']).toBe('https://example.com/#service');
    expect(svc.name).toBe('Rakurs — ИИ-автоматизация бизнеса / AI Business Automation');
    expect(svc.url).toBe('https://example.com/');
    expect(svc.parentOrganization).toEqual({ '@id': 'https://example.com/#org' });
    expect(svc.description).toBe(
      'Диагностика операционных потерь и готовые ИИ-решения: запуск за 1–3 недели, фиксированная цена, сопровождение по подписке. Express diagnostics of operational losses and ready-made AI solutions: launch in 1–3 weeks, fixed price, subscription support.',
    );
    expect(svc.priceRange).toBe('$2,500–$10,000+');
    expect(svc.areaServed).toBe('Worldwide');
    expect(svc.hasOfferCatalog['@type']).toBe('OfferCatalog');
    expect(svc.hasOfferCatalog.name).toBe('Готовые ИИ-решения Rakurs / Rakurs AI solutions');

    const diagnostic = svc.hasOfferCatalog.itemListElement[0];
    expect(diagnostic).toEqual({
      '@type': 'Offer',
      price: '1500',
      priceCurrency: 'USD',
      itemOffered: {
        '@type': 'Service',
        name: 'Экспресс-диагностика операционных потерь / Express Diagnostic of Operational Losses',
        description:
          '3–5 дней, фиксированная цена $1 500–3 000: топ-3 дыры в деньгах и какое решение закрывает самую дорогую. Стоимость зачитывается в цену решения. 3–5 days, fixed price, credited toward the solution.',
      },
    });
  });

  it('faqPage maps question/answer pairs', () => {
    const f = faqPage([{ question: 'Q?', answer: 'A.' }]);
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });

  it('faqPage has correct schema.org structure', () => {
    const f = faqPage([
      { question: 'Q1?', answer: 'A1.' },
      { question: 'Q2?', answer: 'A2.' },
    ]);
    expect(f['@context']).toBe('https://schema.org');
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'Q1?',
      acceptedAnswer: { '@type': 'Answer', text: 'A1.' },
    });
  });

  it('no URL is hardcoded to the legacy github pages domain', () => {
    const other = 'https://another-domain.test/';
    expect(organization(other).url).toBe('https://another-domain.test/');
    expect(website(other)['@id']).toBe('https://another-domain.test/#website');
    expect(professionalService(other, []).url).toBe('https://another-domain.test/');
  });
});
