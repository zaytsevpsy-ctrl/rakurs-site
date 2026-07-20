// Builders that rebuild the legacy schema.org JSON-LD blocks (index.html:193–249)
// from content-collection data, so pages can render them instead of hardcoding copies.
// All static strings below are copied 1:1 from the legacy blocks. All URLs are derived
// from the `site` parameter (assumed to end with '/') rather than hardcoded.

export type ProductLd = {
  jsonldName: string;
  jsonldDesc: string;
  priceFrom: number;
};

export type FaqLd = {
  question: string;
  answer: string;
};

export function organization(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${site}#org`,
    name: 'Rakurs',
    alternateName: ['Ракурс', 'Rakurs AI', 'Rakurs Automation'],
    url: site,
    logo: `${site}og.png`,
    email: 'info@rakurs.dev',
    description:
      'Rakurs — студия ИИ-автоматизации бизнеса. Находим, где бизнес теряет деньги, и закрываем это готовыми ИИ-решениями с фиксированной ценой: ИИ-ассистент для продаж, автоматизация обработки заявок, ИИ-база знаний по документации, генератор коммерческих предложений. Rakurs is an AI automation studio: we find where a business loses money and close the gaps with ready-made AI solutions at a fixed price.',
    slogan:
      'Под нашим ракурсом видно, где утекают деньги / From our angle, your losses have nowhere to hide',
    knowsLanguage: ['ru', 'en'],
    areaServed: 'Worldwide',
    founder: [
      {
        '@type': 'Person',
        name: 'Andrey Zaytsev',
        jobTitle: 'Co-founder, business psychologist — organizational diagnostics',
      },
      { '@type': 'Person', name: 'Egor', jobTitle: 'Co-founder, AI automation engineer' },
    ],
  };
}

export function website(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}#website`,
    url: site,
    name: 'Rakurs — готовые ИИ-решения для бизнеса',
    publisher: { '@id': `${site}#org` },
    inLanguage: ['ru', 'en'],
  };
}

export function professionalService(site: string, products: ProductLd[]) {
  const productOffers = products.map((p) => ({
    '@type': 'Offer',
    price: String(p.priceFrom),
    priceCurrency: 'USD',
    itemOffered: {
      '@type': 'Service',
      name: p.jsonldName,
      description: p.jsonldDesc,
    },
  }));

  const diagnosticOffer = {
    '@type': 'Offer',
    price: '1500',
    priceCurrency: 'USD',
    itemOffered: {
      '@type': 'Service',
      name: 'Экспресс-диагностика операционных потерь / Express Diagnostic of Operational Losses',
      description:
        '3–5 дней, фиксированная цена $1 500–3 000: топ-3 дыры в деньгах и какое решение закрывает самую дорогую. Стоимость зачитывается в цену решения. 3–5 days, fixed price, credited toward the solution.',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${site}#service`,
    name: 'Rakurs — ИИ-автоматизация бизнеса / AI Business Automation',
    url: site,
    parentOrganization: { '@id': `${site}#org` },
    description:
      'Диагностика операционных потерь и готовые ИИ-решения: запуск за 1–3 недели, фиксированная цена, сопровождение по подписке. Express diagnostics of operational losses and ready-made AI solutions: launch in 1–3 weeks, fixed price, subscription support.',
    priceRange: '$2,500–$10,000+',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Готовые ИИ-решения Rakurs / Rakurs AI solutions',
      itemListElement: [...productOffers, diagnosticOffer],
    },
  };
}

/** Самостоятельный Service для детальной страницы продукта (/products/<slug>/).
 *  Структура itemOffered — та же, что в professionalService(); provider
 *  ссылается на общий #org с лендинга. */
export function productService(site: string, p: ProductLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.jsonldName,
    description: p.jsonldDesc,
    offers: { '@type': 'Offer', price: String(p.priceFrom), priceCurrency: 'USD' },
    provider: { '@id': `${site}#org` },
  };
}

export function faqPage(items: FaqLd[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
