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

  // Каждый slug обязан существовать в обеих локалях: отсутствующий .en (или .ru)
  // файл — это ошибка сборки, а не молча укороченная страница.
  const slugsByLocale: Record<Locale, Set<string>> = { ru: new Set(), en: new Set() };
  for (const e of all) {
    const { slug, locale: l } = splitId(e.id);
    slugsByLocale[l].add(slug);
  }
  const missingEn = [...slugsByLocale.ru].filter((s) => !slugsByLocale.en.has(s));
  const missingRu = [...slugsByLocale.en].filter((s) => !slugsByLocale.ru.has(s));
  if (missingEn.length || missingRu.length) {
    const parts: string[] = [];
    if (missingEn.length) parts.push(`slugs without en pair: ${missingEn.join(', ')}`);
    if (missingRu.length) parts.push(`slugs without ru pair: ${missingRu.join(', ')}`);
    throw new Error(`${collection}: ${parts.join('; ')}`);
  }

  return all
    .filter((e) => splitId(e.id).locale === locale)
    .sort((a, b) => (a.data as { order: number }).order - (b.data as { order: number }).order)
    .map((e) => ({ ...e, slug: splitId(e.id).slug }));
}

/** Тип элемента, который возвращает getLocalized — для пропсов компонентов. */
export type LocalizedEntry<C extends CollectionKey> = Awaited<
  ReturnType<typeof getLocalized<C>>
>[number];
