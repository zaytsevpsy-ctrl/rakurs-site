import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/llms';

export const GET: APIRoute = ({ site }) => {
  return new Response(robotsTxt(site!.href), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
