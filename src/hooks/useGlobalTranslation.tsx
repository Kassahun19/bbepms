import { useEffect } from 'react';
import amTranslationsRaw from '../locales/am.json';

const amTranslations = amTranslationsRaw as Record<string, string>;

// Pre-build a case-insensitive lookup map
const lowerCaseMap: Record<string, string> = {};
Object.keys(amTranslations).forEach(key => {
  lowerCaseMap[key.trim().toLowerCase()] = amTranslations[key];
});

const getTranslation = (text: string): string | null => {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Exact match
  if (amTranslations[trimmed]) {
    return text.replace(trimmed, amTranslations[trimmed]);
  }

  // 2. Case-insensitive match
  const lower = trimmed.toLowerCase();
  if (lowerCaseMap[lower]) {
    return text.replace(trimmed, lowerCaseMap[lower]);
  }

  // 3. Dynamic patterns: "All (5)" or "Found (10)" or "Districts (4)"
  let match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    const prefix = match[1].trim();
    const inside = match[2].trim();
    const transPrefix = amTranslations[prefix] || lowerCaseMap[prefix.toLowerCase()];
    if (transPrefix) {
      if (/^\d+\s+entries$/i.test(inside)) {
        const num = inside.match(/\d+/)?.[0] || inside;
        return text.replace(trimmed, `${transPrefix} (${num} መዝገቦች)`);
      } else if (/^\d+$/i.test(inside)) {
        return text.replace(trimmed, `${transPrefix} (${inside})`);
      } else {
        const transInside = amTranslations[inside] || lowerCaseMap[inside.toLowerCase()] || inside;
        return text.replace(trimmed, `${transPrefix} (${transInside})`);
      }
    }
  }

  // 4. Pagination pattern 1: "Showing 1 to 25 of 150 entries"
  match = trimmed.match(/^Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+entries$/i);
  if (match) {
    return text.replace(trimmed, `ከ ${match[3]} መዝገቦች ${match[1]} እስከ ${match[2]} በማሳየት ላይ`);
  }

  // 5. Pagination pattern 2: "Showing 1 to 25 of 150 entries (filtered from 300 total entries)"
  match = trimmed.match(/^Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+entries\s+\(filtered from\s+(\d+)\s+total entries\)$/i);
  if (match) {
    return text.replace(trimmed, `ከ ${match[3]} መዝገቦች ${match[1]} እስከ ${match[2]} በማሳየት ላይ (ተጣርቶ ከ ${match[4]} ጠቅላላ መዝገቦች)`);
  }

  // 6. "Page 1 of 5"
  match = trimmed.match(/^Page\s+(\d+)\s+of\s+(\d+)$/i);
  if (match) {
    return text.replace(trimmed, `ገጽ ${match[1]} ከ ${match[2]}`);
  }

  // 7. "10 rows"
  match = trimmed.match(/^(\d+)\s+rows$/i);
  if (match) {
    return text.replace(trimmed, `${match[1]} ረድፎች`);
  }

  // 8. "Show: 10"
  match = trimmed.match(/^Show:\s*(\d+)$/i);
  if (match) {
    return text.replace(trimmed, `አሳይ፡ ${match[1]}`);
  }

  // 9. Trailing colon or bullet match: e.g. "Region:" or "• Region:"
  const cleanPrefixMatch = trimmed.match(/^([•\-\*\s:]*)(.+?)([:\s]*)$/);
  if (cleanPrefixMatch) {
    const lead = cleanPrefixMatch[1];
    const core = cleanPrefixMatch[2];
    const trail = cleanPrefixMatch[3];
    const transCore = amTranslations[core] || lowerCaseMap[core.toLowerCase()];
    if (transCore && transCore !== core) {
      return text.replace(trimmed, `${lead}${transCore}${trail}`);
    }
  }

  return null;
};

export const useGlobalTranslation = (language: string) => {
  useEffect(() => {
    if (language !== 'am') {
      // Revert to original text and attributes when switching to English
      const walkAndRevert = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if ((node as any).__originalText !== undefined) {
            node.nodeValue = (node as any).__originalText;
            delete (node as any).__originalText;
            delete (node as any).__translatedText;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if ((el as any).__originalPlaceholder !== undefined) {
            el.setAttribute('placeholder', (el as any).__originalPlaceholder);
            delete (el as any).__originalPlaceholder;
            delete (el as any).__translatedPlaceholder;
          }
          if ((el as any).__originalTitle !== undefined) {
            el.setAttribute('title', (el as any).__originalTitle);
            delete (el as any).__originalTitle;
            delete (el as any).__translatedTitle;
          }
          if ((el as any).__originalAriaLabel !== undefined) {
            el.setAttribute('aria-label', (el as any).__originalAriaLabel);
            delete (el as any).__originalAriaLabel;
            delete (el as any).__translatedAriaLabel;
          }
          node.childNodes.forEach(walkAndRevert);
        }
      };
      walkAndRevert(document.body);
      return;
    }

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        if (val && val.trim()) {
          const trans = getTranslation(val);
          if (trans && trans !== val) {
            if ((node as any).__originalText === undefined) {
              (node as any).__originalText = val;
            }
            (node as any).__translatedText = trans;
            node.nodeValue = trans;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        
        // Placeholder attribute
        const placeholder = el.getAttribute('placeholder');
        if (placeholder && placeholder.trim()) {
          if ((el as any).__translatedPlaceholder !== placeholder) {
            const trans = getTranslation(placeholder);
            if (trans) {
              if ((el as any).__originalPlaceholder === undefined) {
                (el as any).__originalPlaceholder = placeholder;
              }
              (el as any).__translatedPlaceholder = trans;
              el.setAttribute('placeholder', trans);
            }
          }
        }

        // Title attribute
        const title = el.getAttribute('title');
        if (title && title.trim()) {
          if ((el as any).__translatedTitle !== title) {
            const trans = getTranslation(title);
            if (trans) {
              if ((el as any).__originalTitle === undefined) {
                (el as any).__originalTitle = title;
              }
              (el as any).__translatedTitle = trans;
              el.setAttribute('title', trans);
            }
          }
        }

        // Aria-Label attribute
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim()) {
          if ((el as any).__translatedAriaLabel !== ariaLabel) {
            const trans = getTranslation(ariaLabel);
            if (trans) {
              if ((el as any).__originalAriaLabel === undefined) {
                (el as any).__originalAriaLabel = ariaLabel;
              }
              (el as any).__translatedAriaLabel = trans;
              el.setAttribute('aria-label', trans);
            }
          }
        }
      }
    };

    const walkAndTranslate = (node: Node) => {
      translateNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(walkAndTranslate);
      }
    };

    // Execute initial walk
    walkAndTranslate(document.body);

    // Dynamic Mutation Observer for continuous UI updates
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
          if ((mutation.target as any).__translatedText === mutation.target.nodeValue) {
            return;
          }
          delete (mutation.target as any).__originalText;
          delete (mutation.target as any).__translatedText;
          translateNode(mutation.target);
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            walkAndTranslate(node);
          });
        } else if (mutation.type === 'attributes') {
          const el = mutation.target as HTMLElement;
          if (mutation.attributeName === 'placeholder') {
             if (el.getAttribute('placeholder') !== (el as any).__translatedPlaceholder) {
                 delete (el as any).__originalPlaceholder;
                 delete (el as any).__translatedPlaceholder;
                 translateNode(el);
             }
          } else if (mutation.attributeName === 'title') {
             if (el.getAttribute('title') !== (el as any).__translatedTitle) {
                 delete (el as any).__originalTitle;
                 delete (el as any).__translatedTitle;
                 translateNode(el);
             }
          } else if (mutation.attributeName === 'aria-label') {
             if (el.getAttribute('aria-label') !== (el as any).__translatedAriaLabel) {
                 delete (el as any).__originalAriaLabel;
                 delete (el as any).__translatedAriaLabel;
                 translateNode(el);
             }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });

    return () => observer.disconnect();
  }, [language]);
};
