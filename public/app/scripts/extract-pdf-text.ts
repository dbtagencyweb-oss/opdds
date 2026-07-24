import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, '../../media/downloads/o-poder-dos-desacreditados.pdf');

async function main() {
  // legacy build works in Node without DOM/worker setup.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  console.log('Total pages:', doc.numPages);

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let raw = (content.items as any[]).map((item) => item.str ?? '').join(' ');
    const text = raw
      // De-hyphenate words split across a line wrap: a lowercase letter, a
      // hyphen, then whitespace, then a lowercase continuation
      // ("trei- nada" -> "treinada"). Real compound words in this text never
      // have whitespace around their hyphen ("bem-intencionada"), so this is safe.
      .replace(/(\p{Ll})-\s+(\p{Ll})/gu, '$1$2')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
    if (i % 20 === 0 || i === doc.numPages) console.log(`Extracted page ${i}/${doc.numPages}`);
  }

  writeFileSync(
    path.join(__dirname, 'pdf-extracted.json'),
    JSON.stringify(pages, null, 2),
    'utf-8',
  );
  console.log('Done. Written to scripts/pdf-extracted.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
