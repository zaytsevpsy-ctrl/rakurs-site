import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Naming convention across all three collections is '<slug>.<ru|en>.md'. Astro's
// default glob() id generator slugifies the whole filename (dots get stripped, e.g.
// 'b1.ru.md' -> 'b1ru'), which breaks that convention — so every collection below
// supplies its own generateId that only strips the '.md' extension and keeps the
// '<slug>.<locale>' id intact for src/lib/content.ts's splitId().
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products', generateId }),
  schema: z.object({
    order: z.number(), // 1..6 — порядок в витрине
    code: z.string(), // 'B1 · Sales-ассистент 24/7'
    tag: z.string(),
    hole: z.string(), // '// дыра: …'
    title: z.string(),
    desc: z.string(),
    demo: z.enum(['chat', 'intake', 'kb', 'kp', 'panel', 'employee']),
    gets: z.array(z.string()).min(1),
    price: z.string(), // 'от $2 500 + от $500/мес'
    priceFrom: z.number(), // 2500 — для JSON-LD Offer
    launch: z.string(),
    cta: z.string(),
    note: z.string().default(''),
    jsonldName: z.string(),
    jsonldDesc: z.string(),
  }).strict(),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases', generateId }),
  schema: z.object({
    order: z.number(),
    tab: z.string(),
    num: z.string(), // 'дело №011'
    before: z.string(),
    after: z.string(),
    metric: z.string(),
    metricLabel: z.string(),
    note: z.string(),
  }).strict(),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq', generateId }),
  schema: z.object({
    order: z.number(),
    question: z.string(),
    answer: z.string(),
  }).strict(),
});

export const collections = { products, cases, faq };
