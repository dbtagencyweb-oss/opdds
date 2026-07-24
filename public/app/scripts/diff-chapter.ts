import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { artifactBookData } from '../src/data/artifactBookData';
import { repairCanonicalText } from '../src/data/canonicalBook';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawPages: string[] = JSON.parse(readFileSync(path.join(__dirname, 'pdf-extracted.json'), 'utf-8'));

const normalize = (value = '') =>
  repairCanonicalText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Collapse letter-spaced headings ("t r i a d e" -> "triade") back into words,
// and drop lone page-number tokens — both are pure noise for a body-text diff
// (headings live in section.title metadata, not in the body blocks we diff).
const collapseLetterSpacing = (words: string[]): string[] => {
  const out: string[] = [];
  let i = 0;
  while (i < words.length) {
    if (words[i].length === 1 && /[a-z0-9]/.test(words[i])) {
      let j = i;
      while (j < words.length && words[j].length === 1 && /[a-z0-9]/.test(words[j])) j++;
      if (j - i >= 4) { i = j; continue; } // drop letter-spaced heading runs entirely (title-case noise)
    }
    out.push(words[i]);
    i++;
  }
  return out;
};

let fullText = '';
const pageStartOffsets: number[] = [];
rawPages.forEach((page) => {
  pageStartOffsets.push(fullText.length);
  fullText += normalize(page) + ' ';
});
const fullWords = collapseLetterSpacing(fullText.split(' ').filter(Boolean)).filter((w) => !/^\d+$/.test(w));
fullText = ' ' + fullWords.join(' ') + ' ';
// Recompute page offsets against the cleaned text by re-scanning page by page.
{
  let cursor = 0;
  pageStartOffsets.length = 0;
  rawPages.forEach((page) => {
    pageStartOffsets.push(cursor);
    const words = collapseLetterSpacing(normalize(page).split(' ').filter(Boolean)).filter((w) => !/^\d+$/.test(w));
    cursor += words.join(' ').length + 1;
  });
}

const blockText = (block: any): string => {
  if ('items' in block && Array.isArray(block.items)) return block.items.join(' ');
  return block.text ?? '';
};

// Longest Common Subsequence based word-level diff (simple O(n*m) DP; fine for chapter-sized text).
function diffWords(a: string[], b: string[]) {
  const n = a.length, m = b.length;
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  type Op = { type: 'same' | 'del' | 'ins'; word: string };
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ type: 'same', word: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ type: 'del', word: a[i] }); i++; }
    else { ops.push({ type: 'ins', word: b[j] }); j++; }
  }
  while (i < n) { ops.push({ type: 'del', word: a[i] }); i++; }
  while (j < m) { ops.push({ type: 'ins', word: b[j] }); j++; }
  return ops;
}

const chapterIds = process.argv.slice(2);
for (const chapterId of chapterIds) {
  const idx = (artifactBookData.chapters as any[]).findIndex((c) => c.id === chapterId);
  const chapter = (artifactBookData.chapters as any[])[idx];
  if (!chapter) { console.log(`\n=== ${chapterId}: NOT FOUND ===`); continue; }
  const nextChapter = (artifactBookData.chapters as any[])[idx + 1];

  const canonicalFullText = chapter.sections.flatMap((s: any) => s.blocks.map(blockText)).join(' ');
  const canonicalWords = normalize(canonicalFullText).split(' ').filter(Boolean);

  const candidateBlocks: string[] = chapter.sections.flatMap((s: any) => s.blocks).map(blockText).filter((t: string) => t && t.split(/\s+/).length >= 6);
  const proseBlocks = candidateBlocks.filter((t) => /[a-zà-öø-ÿ]/.test(t));
  let startIdx = -1;
  for (const block of proseBlocks.length ? proseBlocks : candidateBlocks) {
    const needle = normalize(block).split(' ').slice(0, 8).join(' ');
    startIdx = needle ? fullText.indexOf(needle) : -1;
    if (startIdx !== -1) break;
  }
  if (startIdx === -1) { console.log(`\n=== ${chapterId}: could not locate start in PDF ===`); continue; }

  // Find end: locate the next chapter's start needle, else take a generous fixed window.
  let endIdx = fullText.length;
  if (nextChapter) {
    const nextBlocks: string[] = nextChapter.sections.flatMap((s: any) => s.blocks).map(blockText).filter((t: string) => t && t.split(/\s+/).length >= 6 && /[a-zà-öø-ÿ]/.test(t));
    for (const block of nextBlocks) {
      const needle = normalize(block).split(' ').slice(0, 8).join(' ');
      const found = needle ? fullText.indexOf(needle, startIdx + 10) : -1;
      if (found !== -1) { endIdx = found; break; }
    }
  }

  const rawSlice = fullText.slice(startIdx, endIdx);
  const rawWords = rawSlice.split(' ').filter(Boolean);

  const ops = diffWords(canonicalWords, rawWords);
  const startPage = (() => {
    let page = 1;
    for (let k = 0; k < pageStartOffsets.length; k++) { if (pageStartOffsets[k] <= startIdx) page = k + 1; else break; }
    return page;
  })();

  console.log(`\n\n========== ${chapterId} :: "${chapter.title}" (canonical=${canonicalWords.length}w, pdf=${rawWords.length}w, startPage~${startPage}) ==========`);

  // Collapse the diff into readable runs with context, skip long stretches of "same".
  let out = '';
  let i = 0;
  while (i < ops.length) {
    if (ops[i].type === 'same') {
      let j = i;
      while (j < ops.length && ops[j].type === 'same') j++;
      const runLen = j - i;
      if (runLen > 6) {
        out += ops.slice(i, i + 3).map((o) => o.word).join(' ') + ' ... ' + ops.slice(j - 3, j).map((o) => o.word).join(' ') + '\n';
      } else {
        out += ops.slice(i, j).map((o) => o.word).join(' ') + '\n';
      }
      i = j;
    } else {
      let j = i;
      const chunk: string[] = [];
      while (j < ops.length && ops[j].type !== 'same') { chunk.push(`${ops[j].type === 'del' ? '[-CANON-' : '[+PDF+'}${ops[j].word}]`); j++; }
      out += chunk.join(' ') + '\n';
      i = j;
    }
  }
  console.log(out);
}
