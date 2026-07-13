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
