import type { BookChapter } from './book';
import { artifactBookData } from './artifactBookData';
import { extractCanonicalJournalPrompts, type CanonicalPrompt } from './canonicalPrompts';

export type CanonicalBookBlockKind =
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'pause'
  | 'divider'
  | 'image'
  | 'image-full'
  | 'spacer';

export type CanonicalBookBlock = {
  id: string;
  kind: CanonicalBookBlockKind;
  text: string;
  alt?: string;
  size?: number;
  className?: string;
  sourcePage?: number;
};

export type CanonicalBookChapter = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  kind?: string;
  sourcePageStart: number;
  sourcePageEnd: number;
  blocks: CanonicalBookBlock[];
  journalPrompts?: CanonicalPrompt[];
};

type BookGroupLike = {
  id: string;
  eyebrow: string;
  title: string;
};

type ArtifactChapter = typeof artifactBookData.chapters[number];
type ArtifactSection = ArtifactChapter['sections'][number];
type ArtifactBlock = ArtifactSection['blocks'][number];

const artifactChapterMap: Record<string, string[]> = {
  epigrafe: ['epigrafe'],
  'nota-do-autor': ['nota-do-autor'],
  creditos: ['creditos'],
  quebra1: ['quebra1'],
  quebra2: ['quebra2'],
  quebra3: ['quebra3'],
  fund1: ['fund1'],
  fund2: ['fund2'],
  fund3: ['fund3'],
  acol1: ['acol1'],
  acol2: ['acol2'],
  pilar1: ['pilar1'],
  pilar2: ['pilar2'],
  interludio: ['interludio'],
  pilar3: ['pilar3'],
  caderno1: ['caderno1'],
  pilar4: ['pilar4'],
  pilar5: ['pilar5'],
  pilar6: ['pilar6'],
  caderno2: ['caderno2'],
  pilar7: ['pilar7'],
  pilar8: ['pilar8'],
  pilar9: ['pilar9'],
  caderno3: ['caderno3'],
  enc1: ['enc1'],
  caderno4: ['caderno4'],
  enc2: ['enc2'],
  enc3: ['enc3'],
  'nao-e-autoajuda': ['quebra1'],
  'o-desacreditado': ['quebra2'],
  'alem-da-autoajuda': ['quebra3'],
  'triade-humana': ['fund1'],
  'autor-ferramenta-presenca': ['fund2'],
  'dualidade-trialidade': ['fund3'],
  prefacio: ['acol1'],
  introducao: ['acol2'],
  reconhecimento: ['pilar1'],
  familia: ['pilar2'],
  luto: ['pilar3'],
  trabalho: ['pilar4'],
  dor: ['pilar5'],
  desejo: ['pilar6'],
  fe: ['pilar7'],
  escassez: ['pilar8'],
  vazio: ['pilar9'],
  'carta-final': ['enc1'],
  epilogo: ['enc2', 'enc3', 'enc4'],
};

const directivePattern = /^\[\[(titulo|subtitulo|h1|h2|paragrafo|paragraph|imagem|capa|espaco):([\s\S]*?)(?:\|([\s\S]*?))?\]\]$/i;

export const repairCanonicalText = (value = '') => {
  let text = String(value ?? '');
  if (/[\u00c2\u00c3\u00e2\u00ef\u00bf\u00bd]/.test(text)) {
    try {
      const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 255));
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (decoded && !decoded.includes('\uFFFD')) text = decoded;
    } catch {
      // Manual replacements below cover the common mojibake pairs.
    }
  }

  const replacements: Array<[string, string]> = [
    ['\u00c3\u00a1', 'á'], ['\u00c3\u00a0', 'à'], ['\u00c3\u00a2', 'â'], ['\u00c3\u00a3', 'ã'],
    ['\u00c3\u00a9', 'é'], ['\u00c3\u00aa', 'ê'], ['\u00c3\u00ad', 'í'], ['\u00c3\u00b3', 'ó'],
    ['\u00c3\u00b4', 'ô'], ['\u00c3\u00b5', 'õ'], ['\u00c3\u00ba', 'ú'], ['\u00c3\u00a7', 'ç'],
    ['\u00c3\u0081', 'Á'], ['\u00c3\u0080', 'À'], ['\u00c3\u0082', 'Â'], ['\u00c3\u0083', 'Ã'],
    ['\u00c3\u0089', 'É'], ['\u00c3\u008a', 'Ê'], ['\u00c3\u008d', 'Í'], ['\u00c3\u0093', 'Ó'],
    ['\u00c3\u0094', 'Ô'], ['\u00c3\u0095', 'Õ'], ['\u00c3\u009a', 'Ú'], ['\u00c3\u0087', 'Ç'],
    ['\u00c2\u00b7', '·'], ['\u00c2 ', ' '], ['\u00c2', ''],
    ['\u00e2\u20ac\u201d', '—'], ['\u00e2\u20ac\u201c', '–'], ['\u00e2\u20ac\u0153', '"'], ['\u00e2\u20ac\u009d', '"'],
    ['\u00e2\u20ac\u02dc', "'"], ['\u00e2\u20ac\u2122', "'"], ['\u00e2\u02c6\u017e', '∞'],
  ];

  replacements.forEach(([bad, good]) => {
    text = text.split(bad).join(good);
  });

  return text.replace(/\uFFFD/g, '');
};

const normalizeBookText = (value = '') =>
  repairCanonicalText(value)
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const stripReaderHeaderDirectives = (text: string) =>
  text
    .split('\n')
    .filter((line) => !/^\[\[(header|eyebrow|titulo-header|cabecalho|cabecalho-secao|cabecalho-titulo):(.*?)\]\]$/i.test(line.trim()))
    .join('\n');

const blockId = (chapterId: string, sourcePage: number, index: number) =>
  `${chapterId}-p${sourcePage}-${String(index + 1).padStart(3, '0')}`;

const createBlock = (
  chapterId: string,
  sourcePage: number,
  index: number,
  block: Omit<CanonicalBookBlock, 'id' | 'sourcePage'>,
): CanonicalBookBlock => ({
  id: blockId(chapterId, sourcePage, index),
  sourcePage,
  ...block,
});

const parseLineCommand = (
  chapterId: string,
  sourcePage: number,
  index: number,
  line: string,
): CanonicalBookBlock | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (trimmed === '---') return createBlock(chapterId, sourcePage, index, { kind: 'divider', text: '' });
  if (/^\[br\]$/i.test(trimmed)) return createBlock(chapterId, sourcePage, index, { kind: 'spacer', text: '', size: 22 });

  const match = trimmed.match(directivePattern);
  if (!match) return null;
  const [, rawKind, rawPayload] = match;
  const kind = rawKind.toLowerCase();
  const payload = normalizeBookText(rawPayload);

  if (kind === 'titulo' || kind === 'h1') {
    return createBlock(chapterId, sourcePage, index, { kind: 'heading', text: payload });
  }
  if (kind === 'subtitulo' || kind === 'h2') {
    return createBlock(chapterId, sourcePage, index, { kind: 'subheading', text: payload });
  }
  if (kind === 'paragrafo' || kind === 'paragraph') {
    return createBlock(chapterId, sourcePage, index, { kind: 'paragraph', text: payload });
  }
  if (kind === 'espaco') {
    const size = Number.parseInt(payload, 10);
    return createBlock(chapterId, sourcePage, index, {
      kind: 'spacer',
      text: '',
      size: Number.isFinite(size) ? Math.max(8, Math.min(160, size)) : 32,
    });
  }
  if (kind === 'imagem' || kind === 'capa') {
    const [src, alt = ''] = payload.split('|').map((part) => part.trim());
    if (!src) return null;
    return createBlock(chapterId, sourcePage, index, {
      kind: kind === 'capa' ? 'image-full' : 'image',
      text: src,
      alt,
    });
  }

  return null;
};

export const parseCanonicalBookPage = (
  chapterId: string,
  sourcePage: number,
  pageText: string,
): CanonicalBookBlock[] => {
  const source = stripReaderHeaderDirectives(normalizeBookText(pageText));
  if (!source) return [];

  const blocks: CanonicalBookBlock[] = [];
  const paragraphs = source
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 1) {
      const commandBlock = parseLineCommand(chapterId, sourcePage, blocks.length, lines[0]);
      if (commandBlock) {
        blocks.push(commandBlock);
        return;
      }
    }

    const joined = normalizeBookText(lines.join('\n'));
    if (!joined) return;

    const looksLikeTitle =
      joined.length <= 72 &&
      !/[.!?;:]$/.test(joined) &&
      (paragraphIndex === 0 || /^[\p{Lu}0-9\s—–-]+$/u.test(joined));

    blocks.push(createBlock(chapterId, sourcePage, blocks.length, {
      kind: looksLikeTitle ? 'subheading' : 'paragraph',
      text: joined,
      className: paragraphIndex === 0 ? 'lead' : undefined,
    }));
  });

  return blocks;
};

export const buildCanonicalBookChapters = (
  chapters: BookChapter[],
  pageTexts: readonly string[],
  pageTitles: Record<number, string>,
  groups: readonly BookGroupLike[],
): CanonicalBookChapter[] =>
  chapters.map((chapter, index) => {
    const nextChapter = chapters[index + 1];
    const start = Math.max(1, chapter.pdfPage);
    const end = Math.max(start, (nextChapter?.pdfPage ?? pageTexts.length + 1) - 1);
    const blocks = pageTexts
      .slice(start - 1, end)
      .flatMap((pageText, pageIndex) => parseCanonicalBookPage(chapter.id, start + pageIndex, pageText));
    const group = groups.find((item) => item.id === chapter.groupId);

    return {
      id: chapter.id,
      title: repairCanonicalText(pageTitles[start] || chapter.title),
      eyebrow: repairCanonicalText(group?.eyebrow || chapter.chapter?.toString() || 'Livro'),
      summary: repairCanonicalText(chapter.summary),
      kind: chapter.kind,
      sourcePageStart: start,
      sourcePageEnd: end,
      blocks,
    };
  });

const artifactBlockToCanonical = (
  chapterId: string,
  sourcePage: number,
  index: number,
  block: ArtifactBlock,
): CanonicalBookBlock[] => {
  const kind = 'type' in block ? block.type : '';
  if (kind === 'p') {
    return [createBlock(chapterId, sourcePage, index, {
      kind: 'paragraph',
      text: normalizeBookText(block.text ?? ''),
      className: 'lead' in block && block.lead ? 'lead' : undefined,
    })];
  }
  if (kind === 'pause') {
    const text = normalizeBookText(block.text ?? '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const sentenceCount = (text.match(/[.!?…]+/g) ?? []).length;
    const shouldKeepAsPause = wordCount <= 18 && text.length <= 140 && sentenceCount <= 2;

    return [createBlock(chapterId, sourcePage, index, {
      kind: shouldKeepAsPause ? 'pause' : 'paragraph',
      text,
    })];
  }
  if (kind === 'divider') {
    return [createBlock(chapterId, sourcePage, index, {
      kind: 'divider',
      text: normalizeBookText(block.text ?? ''),
    })];
  }
  if (kind === 'step-header') {
    return [createBlock(chapterId, sourcePage, index, {
      kind: 'subheading',
      text: normalizeBookText(block.text ?? ''),
    })];
  }
  if (kind === 'list' && 'items' in block && Array.isArray(block.items)) {
    return block.items.map((item, itemIndex) => createBlock(chapterId, sourcePage, index + itemIndex, {
      kind: 'paragraph',
      text: `• ${normalizeBookText(String(item ?? ''))}`,
      className: 'reader-canonical-list-item',
    }));
  }
  return [];
};

const isCadernoPrompt = (text: string) => {
  const clean = normalizeBookText(text);
  if (!clean) return false;
  if (/^caderno de presen[çc]a$/i.test(clean)) return false;
  if (/^ato\s+/i.test(clean)) return false;
  if (/^tr[íi]ade\s+/i.test(clean)) return false;
  if (/^reflex[ãa]o/i.test(clean)) return false;
  if (/^antes de /i.test(clean)) return false;
  if (/^ap[óo]s atravessar/i.test(clean)) return false;
  if (/^n[ãa]o procure/i.test(clean)) return false;
  if (/^nem toda travessia/i.test(clean)) return false;
  if (/^escreva aqui/i.test(clean)) return false;
  if (clean.includes('_____')) return false;
  return clean.includes('?') || /^\d+\./.test(clean);
};

const cadernoPromptText = (text: string) => {
  const clean = normalizeBookText(text).replace(/\s+/g, ' ').trim();
  const numberedQuestion = clean.match(/\d+\.\s*([^?]+\?)/);
  return numberedQuestion?.[1]?.trim() || clean;
};

const artifactSectionToCanonicalBlocks = (
  chapterId: string,
  sourcePage: number,
  section: ArtifactSection,
  sectionIndex: number,
  startIndex: number,
  includeHeading: boolean,
) => {
  let blockIndex = startIndex;
  const blocks: CanonicalBookBlock[] = [];
  if (includeHeading && section.title) {
    blocks.push(createBlock(chapterId, sourcePage, blockIndex++, {
      kind: sectionIndex === 0 ? 'subheading' : 'heading',
      text: normalizeBookText(section.title),
      className: 'reader-canonical-section-title',
    }));
  }
  section.blocks.forEach((block) => {
    const converted = artifactBlockToCanonical(chapterId, sourcePage, blockIndex, block);
    blockIndex += Math.max(1, converted.length);
    blocks.push(...converted);
  });
  return blocks;
};

export const buildArtifactCanonicalBookChapters = (
  chapters: BookChapter[],
  pageTexts: readonly string[],
  pageTitles: Record<number, string>,
  groups: readonly BookGroupLike[],
): CanonicalBookChapter[] => {
  const fallback = buildCanonicalBookChapters(chapters, pageTexts, pageTitles, groups);
  const artifactById = new Map<string, ArtifactChapter>(artifactBookData.chapters.map((chapter) => [chapter.id, chapter]));

  return chapters.map((chapter, index) => {
    if (chapter.id === 'capa-digital') {
      const cover = artifactBookData.meta.cover;
      const group = groups.find((item) => item.id === chapter.groupId);
      return {
        id: chapter.id,
        title: repairCanonicalText(cover?.title || chapter.title),
        eyebrow: repairCanonicalText(group?.eyebrow || 'Abertura'),
        summary: repairCanonicalText(cover?.tagline || chapter.summary),
        kind: chapter.kind,
        sourcePageStart: chapter.pdfPage,
        sourcePageEnd: chapter.pdfPage,
        blocks: [
          createBlock(chapter.id, chapter.pdfPage, 0, {
            kind: 'subheading',
            text: repairCanonicalText(cover?.imprint || 'DBT Agency'),
            className: 'reader-digital-cover-imprint',
          }),
          createBlock(chapter.id, chapter.pdfPage, 1, {
            kind: 'heading',
            text: repairCanonicalText(cover?.title || chapter.title),
            className: 'reader-digital-cover-title',
          }),
          createBlock(chapter.id, chapter.pdfPage, 2, {
            kind: 'pause',
            text: repairCanonicalText(cover?.tagline || chapter.summary),
            className: 'reader-digital-cover-tagline',
          }),
          createBlock(chapter.id, chapter.pdfPage, 3, {
            kind: 'paragraph',
            text: repairCanonicalText(cover?.author || 'Diego Bock Tavares'),
            className: 'reader-digital-cover-author',
          }),
        ],
      };
    }

    if (chapter.id === 'epigrafe') {
      const group = groups.find((item) => item.id === chapter.groupId);
      return {
        id: chapter.id,
        title: repairCanonicalText(chapter.title),
        eyebrow: repairCanonicalText(group?.eyebrow || 'Abertura'),
        summary: repairCanonicalText(chapter.summary),
        kind: chapter.kind,
        sourcePageStart: chapter.pdfPage,
        sourcePageEnd: chapter.pdfPage,
        blocks: [
          createBlock(chapter.id, chapter.pdfPage, 0, {
            kind: 'paragraph',
            text: [
              'Toda travessia começa muito antes do primeiro passo. Ela começa no instante em que você deixa de lutar contra si mesmo.',
              'Foi escrito para oferecer um lugar onde você possa respirar antes de continuar.',
              'Talvez, ao longo destas páginas, você reconheça partes da sua história que permaneceram silenciosas por tempo demais.',
              'Entre. Sem pressa. Sem precisar provar nada.',
              'Este não é um livro sobre vencer. É um livro sobre não se abandonar.',
            ].join('[br][br]'),
            className: 'reader-opening-single-block',
          }),
        ],
      };
    }

    if (chapter.id === 'nota-do-autor') {
      const group = groups.find((item) => item.id === chapter.groupId);
      return {
        id: chapter.id,
        title: repairCanonicalText(chapter.title),
        eyebrow: repairCanonicalText(group?.eyebrow || 'Abertura'),
        summary: repairCanonicalText(chapter.summary),
        kind: chapter.kind,
        sourcePageStart: chapter.pdfPage,
        sourcePageEnd: chapter.pdfPage,
        blocks: [
          createBlock(chapter.id, chapter.pdfPage, 0, {
            kind: 'subheading',
            text: 'Nota do autor',
            className: 'reader-canonical-section-title',
          }),
          createBlock(chapter.id, chapter.pdfPage, 1, {
            kind: 'paragraph',
            text: 'Este livro nasceu de vivências reais, atravessadas com os recursos que estavam disponíveis em cada momento. Algumas palavras foram organizadas com apoio de ferramentas contemporâneas. Todas foram pensadas, revisadas, escolhidas e assumidas por mim.',
            className: 'lead',
          }),
          createBlock(chapter.id, chapter.pdfPage, 2, {
            kind: 'paragraph',
            text: 'Nada aqui foi escrito para impressionar. Foi escrito para sustentar presença.',
          }),
          createBlock(chapter.id, chapter.pdfPage, 3, {
            kind: 'paragraph',
            text: 'Se algo ressoar, fique. Se não, siga sem culpa.',
          }),
          createBlock(chapter.id, chapter.pdfPage, 4, {
            kind: 'paragraph',
            text: '— Diego Bock Tavares',
          }),
        ],
      };
    }

    const artifactIds = artifactChapterMap[chapter.id] ?? [];
    const artifactChapters = artifactIds.map((id) => artifactById.get(id)).filter(Boolean) as ArtifactChapter[];
    if (!artifactChapters.length) return fallback[index];

    let blockIndex = 0;
    const blocks = artifactChapters.flatMap((artifactChapter) => {
      const headingBlocks: CanonicalBookBlock[] = artifactChapters.length > 1
        ? [createBlock(chapter.id, chapter.pdfPage, blockIndex++, {
          kind: 'heading',
          text: normalizeBookText(artifactChapter.title),
        })]
        : [];
      const includeSectionHeadings = artifactChapter.sections.length > 1;
      const bodyBlocks = artifactChapter.sections.flatMap((section, sectionIndex) => {
        const converted = artifactSectionToCanonicalBlocks(
          chapter.id,
          chapter.pdfPage,
          section,
          sectionIndex,
          blockIndex,
          includeSectionHeadings,
        );
        blockIndex += Math.max(1, converted.length);
        return converted;
      });
      return [...headingBlocks, ...bodyBlocks];
    });

    const firstArtifact = artifactChapters[0];
    const group = groups.find((item) => item.id === chapter.groupId);
    const journalPrompts = firstArtifact.kind === 'caderno'
      ? extractCanonicalJournalPrompts(firstArtifact.id, firstArtifact.sections)
      : undefined;
    return {
      id: chapter.id,
      title: repairCanonicalText(pageTitles[chapter.pdfPage] || firstArtifact.title || chapter.title),
      eyebrow: repairCanonicalText(firstArtifact.part || group?.eyebrow || chapter.chapter?.toString() || 'Livro'),
      summary: repairCanonicalText(chapter.summary),
      kind: firstArtifact.kind || chapter.kind,
      sourcePageStart: chapter.pdfPage,
      sourcePageEnd: Math.max(chapter.pdfPage, (chapters[index + 1]?.pdfPage ?? pageTexts.length + 1) - 1),
      blocks: blocks.length ? blocks : fallback[index].blocks,
      journalPrompts,
    };
  });
};
