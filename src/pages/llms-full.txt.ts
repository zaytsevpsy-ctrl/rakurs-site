import type { APIRoute } from 'astro';
import { getLocalized } from '../lib/content';
import { buildLlmsFull } from '../lib/llms';

export const GET: APIRoute = async ({ site }) => {
  const products = await getLocalized('products', 'ru');
  return new Response(
    buildLlmsFull(
      site!.href,
      products.map((p) => ({ jsonldName: p.data.jsonldName, jsonldDesc: p.data.jsonldDesc })),
    ),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
