import { ru, type Dict } from './ru';
import { en } from './en';
import type { Locale } from '../lib/content';

export function t(locale: Locale): Dict {
  return locale === 'ru' ? ru : en;
}
