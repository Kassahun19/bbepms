import { useEffect } from "react";
import amTranslationsRaw from "../locales/am.json";
const amTranslations = amTranslationsRaw;
const lowerCaseMap = {};
Object.keys(amTranslations).forEach((key) => {
  lowerCaseMap[key.trim().toLowerCase()] = amTranslations[key];
});
const getTranslation = (text) => {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (amTranslations[trimmed]) {
    return text.replace(trimmed, amTranslations[trimmed]);
  }
  const lower = trimmed.toLowerCase();
  if (lowerCaseMap[lower]) {
    return text.replace(trimmed, lowerCaseMap[lower]);
  }
  let match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    const prefix = match[1].trim();
    const inside = match[2].trim();
    const transPrefix = amTranslations[prefix] || lowerCaseMap[prefix.toLowerCase()];
    if (transPrefix) {
      if (/^\d+\s+entries$/i.test(inside)) {
        const num = inside.match(/\d+/)?.[0] || inside;
        return text.replace(trimmed, `${transPrefix} (${num} \u1218\u12DD\u1308\u1266\u127D)`);
      } else if (/^\d+$/i.test(inside)) {
        return text.replace(trimmed, `${transPrefix} (${inside})`);
      } else {
        const transInside = amTranslations[inside] || lowerCaseMap[inside.toLowerCase()] || inside;
        return text.replace(trimmed, `${transPrefix} (${transInside})`);
      }
    }
  }
  match = trimmed.match(/^Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+entries$/i);
  if (match) {
    return text.replace(trimmed, `\u12A8 ${match[3]} \u1218\u12DD\u1308\u1266\u127D ${match[1]} \u12A5\u1235\u12A8 ${match[2]} \u1260\u121B\u1233\u12E8\u1275 \u120B\u12ED`);
  }
  match = trimmed.match(/^Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+entries\s+\(filtered from\s+(\d+)\s+total entries\)$/i);
  if (match) {
    return text.replace(trimmed, `\u12A8 ${match[3]} \u1218\u12DD\u1308\u1266\u127D ${match[1]} \u12A5\u1235\u12A8 ${match[2]} \u1260\u121B\u1233\u12E8\u1275 \u120B\u12ED (\u1270\u1323\u122D\u1276 \u12A8 ${match[4]} \u1320\u1245\u120B\u120B \u1218\u12DD\u1308\u1266\u127D)`);
  }
  match = trimmed.match(/^Page\s+(\d+)\s+of\s+(\d+)$/i);
  if (match) {
    return text.replace(trimmed, `\u1308\u133D ${match[1]} \u12A8 ${match[2]}`);
  }
  match = trimmed.match(/^(\d+)\s+rows$/i);
  if (match) {
    return text.replace(trimmed, `${match[1]} \u1228\u12F5\u134E\u127D`);
  }
  match = trimmed.match(/^Show:\s*(\d+)$/i);
  if (match) {
    return text.replace(trimmed, `\u12A0\u1233\u12ED\u1361 ${match[1]}`);
  }
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
export const useGlobalTranslation = (language) => {
  useEffect(() => {
    if (language !== "am") {
      const walkAndRevert = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.__originalText !== void 0) {
            node.nodeValue = node.__originalText;
            delete node.__originalText;
            delete node.__translatedText;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.__originalPlaceholder !== void 0) {
            el.setAttribute("placeholder", el.__originalPlaceholder);
            delete el.__originalPlaceholder;
            delete el.__translatedPlaceholder;
          }
          if (el.__originalTitle !== void 0) {
            el.setAttribute("title", el.__originalTitle);
            delete el.__originalTitle;
            delete el.__translatedTitle;
          }
          if (el.__originalAriaLabel !== void 0) {
            el.setAttribute("aria-label", el.__originalAriaLabel);
            delete el.__originalAriaLabel;
            delete el.__translatedAriaLabel;
          }
          node.childNodes.forEach(walkAndRevert);
        }
      };
      walkAndRevert(document.body);
      return;
    }
    const translateNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue;
        if (val && val.trim()) {
          const trans = getTranslation(val);
          if (trans && trans !== val) {
            if (node.__originalText === void 0) {
              node.__originalText = val;
            }
            node.__translatedText = trans;
            node.nodeValue = trans;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        const placeholder = el.getAttribute("placeholder");
        if (placeholder && placeholder.trim()) {
          if (el.__translatedPlaceholder !== placeholder) {
            const trans = getTranslation(placeholder);
            if (trans) {
              if (el.__originalPlaceholder === void 0) {
                el.__originalPlaceholder = placeholder;
              }
              el.__translatedPlaceholder = trans;
              el.setAttribute("placeholder", trans);
            }
          }
        }
        const title = el.getAttribute("title");
        if (title && title.trim()) {
          if (el.__translatedTitle !== title) {
            const trans = getTranslation(title);
            if (trans) {
              if (el.__originalTitle === void 0) {
                el.__originalTitle = title;
              }
              el.__translatedTitle = trans;
              el.setAttribute("title", trans);
            }
          }
        }
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel && ariaLabel.trim()) {
          if (el.__translatedAriaLabel !== ariaLabel) {
            const trans = getTranslation(ariaLabel);
            if (trans) {
              if (el.__originalAriaLabel === void 0) {
                el.__originalAriaLabel = ariaLabel;
              }
              el.__translatedAriaLabel = trans;
              el.setAttribute("aria-label", trans);
            }
          }
        }
      }
    };
    const walkAndTranslate = (node) => {
      translateNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(walkAndTranslate);
      }
    };
    walkAndTranslate(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          if (mutation.target.__translatedText === mutation.target.nodeValue) {
            return;
          }
          delete mutation.target.__originalText;
          delete mutation.target.__translatedText;
          translateNode(mutation.target);
        } else if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            walkAndTranslate(node);
          });
        } else if (mutation.type === "attributes") {
          const el = mutation.target;
          if (mutation.attributeName === "placeholder") {
            if (el.getAttribute("placeholder") !== el.__translatedPlaceholder) {
              delete el.__originalPlaceholder;
              delete el.__translatedPlaceholder;
              translateNode(el);
            }
          } else if (mutation.attributeName === "title") {
            if (el.getAttribute("title") !== el.__translatedTitle) {
              delete el.__originalTitle;
              delete el.__translatedTitle;
              translateNode(el);
            }
          } else if (mutation.attributeName === "aria-label") {
            if (el.getAttribute("aria-label") !== el.__translatedAriaLabel) {
              delete el.__originalAriaLabel;
              delete el.__translatedAriaLabel;
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
      attributeFilter: ["placeholder", "title", "aria-label"]
    });
    return () => observer.disconnect();
  }, [language]);
};
