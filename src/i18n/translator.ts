import amTranslationsRaw from '../locales/am.json';

const amTranslations = amTranslationsRaw as Record<string, string>;

export function t(text: string): string {
  if (!text) return '';
  return amTranslations[text] || text;
}

export default t;
