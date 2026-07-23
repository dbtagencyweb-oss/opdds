import { OPDDS_CANONICAL_BOOK_INDEX } from './opdds-canonical-book-data';

export type BookContextInput = {
  message: string;
  topic?: string;
  readerContext?: string;
  context?: Record<string, unknown>;
};

export type BookReference = {
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
};

export type BookGrounding = {
  context: string;
  references: BookReference[];
};

type CanonicalChapter = typeof OPDDS_CANONICAL_BOOK_INDEX.chapters[number];
type CanonicalSection = CanonicalChapter['sections'][number];

type SearchHit = {
  chapter: CanonicalChapter;
  section: CanonicalSection;
  score: number;
};

const PILLAR_THEMES: Record<string, string[]> = {
  pilar1: ['reconhecimento', 'negação', 'começar', 'não se corrigir antes de se reconhecer'],
  pilar2: ['família', 'lealdade', 'pertencimento', 'herança emocional'],
  interludio: ['pertencimento', 'rejeição', 'fenda', 'entre vínculos'],
  pilar3: ['luto', 'ausência', 'quebra de laços', 'perda'],
  pilar4: ['trabalho', 'valor', 'identidade', 'produtividade'],
  pilar5: ['dor', 'fuga', 'anestesia', 'escape'],
  pilar6: ['desejo', 'amor', 'frustração', 'projeção'],
  pilar7: ['fé', 'sentido', 'desencanto', 'erosão'],
  pilar8: ['escassez', 'medo', 'sustentação', 'falta'],
  pilar9: ['vazio', 'presença', 'continuidade', 'permanência'],
};

const normalize = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') =>
  Array.from(new Set(normalize(value).split(' ').filter((word) => word.length >= 4)));

const clip = (value = '', maxLength = 620) => {
  const clean = String(value).replace(/\s+/g, ' ').trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 3)}...` : clean;
};

const readRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

const allSections = () =>
  OPDDS_CANONICAL_BOOK_INDEX.chapters.flatMap((chapter) =>
    chapter.sections.map((section) => ({ chapter, section })),
  );

const chapterById: Map<string, CanonicalChapter> = new Map(
  OPDDS_CANONICAL_BOOK_INDEX.chapters.map((chapter) => [chapter.id, chapter]),
);

const sectionById: Map<string, { chapter: CanonicalChapter; section: CanonicalSection }> = new Map(
  OPDDS_CANONICAL_BOOK_INDEX.chapters.flatMap((chapter) =>
    chapter.sections.map((section) => [section.id, { chapter, section }] as const),
  ),
);

const currentContextIds = (context?: Record<string, unknown>) => {
  const currentChapter = readRecord(context?.currentChapter);
  const mindFlow = readRecord(context?.mindFlow);
  const canonicalSchema = readRecord(mindFlow?.canonicalSchema);
  const currentCanonicalUnit = readRecord(canonicalSchema?.currentCanonicalUnit);
  const currentCanonicalPillar = readRecord(canonicalSchema?.currentCanonicalPillar);
  const finalProject = readRecord(canonicalSchema?.finalProject);
  const currentPillar = readRecord(finalProject?.currentPillar);

  return [
    readString(currentChapter?.id),
    readString(currentCanonicalUnit?.id),
    readString(currentCanonicalPillar?.canonical_unit_id),
    readString(currentPillar?.canonicalUnitId),
    readString(currentPillar?.id).replace(/^pillar_0?/, 'pilar'),
  ].filter(Boolean);
};

const scoreSection = (haystackTokens: string[], haystack: string, chapter: CanonicalChapter, section: CanonicalSection) => {
  const target = normalize([
    chapter.id,
    chapter.title,
    chapter.groupId || '',
    section.id,
    section.title,
    section.text,
    ...(PILLAR_THEMES[chapter.id] || []),
  ].join(' '));

  let score = 0;
  for (const token of haystackTokens) {
    if (target.includes(token)) score += token.length > 7 ? 3 : 1;
  }

  for (const theme of PILLAR_THEMES[chapter.id] || []) {
    if (haystack.includes(normalize(theme))) score += 15;
  }

  if (haystack.includes(normalize(chapter.title))) score += 8;
  if (haystack.includes(normalize(section.title))) score += 5;
  if (chapter.kind === 'caderno' && /\b(diario|caderno|escrevi|respondi|pergunta)\b/.test(haystack)) score += 8;
  if (section.title.toLowerCase().includes('carta') && /\b(carta|escrevi|autor|sustentacao)\b/.test(haystack)) score += 7;
  if (section.title.toLowerCase().includes('âncora') && /\b(ancora|pratica|pausa|gesto)\b/.test(haystack)) score += 7;
  if (chapter.audioTracks.length && /\b(audio|ouvi|escutar|trilha|narra)\b/.test(haystack)) score += 5;

  return score;
};

const searchCanonicalBook = (input: BookContextInput): SearchHit[] => {
  const haystack = normalize([
    input.topic,
    input.message,
    input.readerContext,
    JSON.stringify(input.context || {}),
  ].filter(Boolean).join(' '));
  const tokens = tokenize(haystack).slice(0, 90);
  const currentIds = currentContextIds(input.context);
  const hits: SearchHit[] = [];

  for (const { chapter, section } of allSections()) {
    let score = scoreSection(tokens, haystack, chapter, section);
    if (currentIds.includes(chapter.id) || currentIds.includes(section.id)) score += 30;
    if (score > 0) hits.push({ chapter, section, score });
  }

  for (const id of currentIds) {
    const chapter = chapterById.get(id);
    if (chapter?.sections[0]) hits.push({ chapter, section: chapter.sections[0], score: 40 });
    const resolved = sectionById.get(id);
    if (resolved) hits.push({ ...resolved, score: 45 });
  }

  const unique = new Map<string, SearchHit>();
  for (const hit of hits.sort((a, b) => b.score - a.score)) {
    const key = `${hit.chapter.id}:${hit.section.id}`;
    if (!unique.has(key)) unique.set(key, hit);
  }

  return Array.from(unique.values()).slice(0, 4);
};

const audioSummary = (chapter: CanonicalChapter) => {
  if (!chapter.audioTracks.length) return 'Sem áudio mapeado nesta unidade.';
  const labels = chapter.audioTracks.map((track) => track.label).slice(0, 12);
  return `Áudios mapeados: ${labels.join('; ')}.`;
};

const journalSummary = (chapter: CanonicalChapter) => {
  if (chapter.kind !== 'caderno') return '';
  const prompts = chapter.journalPrompts.map((prompt) => prompt.text).slice(0, 8);
  return prompts.length ? `Caderno de presença: ${prompts.join(' | ')}` : 'Caderno de presença disponível.';
};

const connectedResources = (chapter: CanonicalChapter) => {
  const sections = chapter.sections.map((section) => section.title);
  const resources = [
    sections.some((title) => /carta/i.test(title)) ? 'carta guiada' : '',
    sections.some((title) => /âncora|ancora/i.test(title)) ? 'âncora prática' : '',
    chapter.kind === 'caderno' ? 'campos privados de diário/caderno' : '',
    chapter.audioTracks.length ? 'áudios de leitura' : '',
  ].filter(Boolean);
  return resources.length ? `Recursos conectados: ${resources.join(', ')}.` : '';
};

export function buildOpddsBookGrounding(input: BookContextInput): BookGrounding {
  const hits = searchCanonicalBook(input);
  const currentIds = currentContextIds(input.context);
  const currentChapter = currentIds.map((id) => chapterById.get(id)).find(Boolean);
  const bookMeta = OPDDS_CANONICAL_BOOK_INDEX.meta;

  const header = [
    `Livro canônico: ${bookMeta.title}, ${bookMeta.author}, versão ${bookMeta.version}.`,
    'Fonte de verdade: estrutura chapter -> sections[] -> blocks[] usada pelo leitor interativo; não mapear como páginas fixas do PDF.',
    'Use estes trechos como cânone. Se uma referência não aparecer abaixo, diga que não tem contexto suficiente em vez de inventar.',
    currentChapter ? `Unidade atual do leitor: ${currentChapter.title} (${currentChapter.id}).` : '',
  ].filter(Boolean).join('\n');

  const hitText = hits.map((hit, index) => {
    const excerpt = clip(hit.section.text, index === 0 ? 820 : 520);
    return [
      `Referência ${index + 1}: ${hit.chapter.title} > ${hit.section.title}`,
      `IDs: chapter=${hit.chapter.id}; section=${hit.section.id}; tipo=${hit.chapter.kind}; grupo=${hit.chapter.groupId || 'sem grupo'}.`,
      `Trecho canônico: ${excerpt || 'Seção sem texto corrido; use apenas título e função editorial.'}`,
      audioSummary(hit.chapter),
      journalSummary(hit.chapter),
      connectedResources(hit.chapter),
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const context = [
    header,
    hitText || 'Nenhum trecho específico foi encontrado. Declare a lacuna e peça mais contexto; não improvise conteúdo do livro.',
  ].join('\n\n');

  return {
    context,
    references: hits.map((hit) => ({
      chapterId: hit.chapter.id,
      chapterTitle: hit.chapter.title,
      sectionId: hit.section.id,
      sectionTitle: hit.section.title,
    })),
  };
}

export const buildOpddsBookContext = (input: BookContextInput) => buildOpddsBookGrounding(input).context;
