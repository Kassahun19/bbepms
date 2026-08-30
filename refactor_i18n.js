const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths("src/components/landing/*.tsx"); // Just testing one dir first

const sourceFiles = project.getSourceFiles();
const extractedTexts = new Set();

sourceFiles.forEach(sourceFile => {
    let modified = false;

    // We will inject a custom Trans component to avoid needing to inject hooks!
    // import { Trans } from '../../i18n/Trans';
    // Then replace JsxText with <Trans>Text</Trans>

    const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
    for (const jsxText of jsxTexts) {
        const text = jsxText.getLiteralText();
        if (text.trim().length > 0 && /[a-zA-Z]/.test(text)) {
            extractedTexts.add(text.trim());
        }
    }
    
    // For attributes, we'll extract them too
    const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    for (const attr of jsxAttributes) {
        const name = attr.getName();
        if (['placeholder', 'title', 'label', 'aria-label'].includes(name)) {
            const init = attr.getInitializer();
            if (init && init.getKind() === SyntaxKind.StringLiteral) {
                const text = init.getLiteralValue();
                if (text.trim().length > 0 && /[a-zA-Z]/.test(text)) {
                    extractedTexts.add(text.trim());
                }
            }
        }
    }
});

fs.writeFileSync('extracted.json', JSON.stringify(Array.from(extractedTexts), null, 2));
console.log(`Extracted ${extractedTexts.size} strings.`);
