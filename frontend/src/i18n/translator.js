import amTranslationsRaw from "../locales/am.json";
const amTranslations = amTranslationsRaw;
export function t(text) {
  if (!text) return "";
  return amTranslations[text] || text;
}
export default t;
