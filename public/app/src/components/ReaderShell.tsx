import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  Heart,
  Headphones,
  Home,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Moon,
  MoreVertical,
  Pause,
  Plus,
  Play,
  Printer,
  RotateCw,
  StickyNote,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import type { CanonicalBookChapter } from '../data/canonicalBook';

const PdfPageCanvas = lazy(() => import('./PdfPageCanvas'));

type AudioTrack = {
  label: string;
  url: string;
  coverUrl?: string | null;
};

type ChapterNavItem = {
  id: string;
  title: string;
  summary: string;
  pdfPage: number;
  groupId: string;
  roman?: string;
  audioTracks?: AudioTrack[];
};

type AudioProgressEntry = {
  heard: boolean;
  currentTime: number;
  duration: number;
  updatedAt: string;
};

type ReaderNoteItem = {
  id: string;
  page: number;
  chapterId: string;
  title: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type TextBlock = {
  kind: 'heading' | 'subheading' | 'paragraph' | 'divider' | 'image' | 'image-full' | 'spacer';
  text: string;
  alt?: string;
  size?: number;
  className?: string;
};

type ReaderHeaderDirectives = {
  hideHeader: boolean;
  hideEyebrow: boolean;
  hideTitle: boolean;
  eyebrow?: string;
  title?: string;
};

const brokenSeparatorGlyphPattern = '[\\u0013\\u0014\\u25A0-\\u25A3\\u25A8-\\u25AB\\u25AD-\\u25AF\\u25CC\\u25FB-\\u25FE\\uFFFC]';

const normalizeReaderSeparators = (value = '') =>
  value
    .replace(new RegExp(`\\b(Pilar\\s+[IVXLCDM]+)\\s*(?:${brokenSeparatorGlyphPattern}|\\uFFFD)+\\s*`, 'gi'), '$1 - ')
    .replace(/[\u0013\u0014\u25A0-\u25A3\u25A8-\u25AB\u25AD-\u25AF\u25CC\u25FB-\u25FE\uFFFC]/g, '—')
    .replace(/\s*[—–-]\s*/g, ' — ')
    .replace(/\b(Pilar\s+[IVXLCDM]+)\s+—\s+/gi, '$1 - ')
    .replace(/\s{2,}/g, ' ')
    .trim();

type Props = {
  title: string;
  chapterLabel?: string;
  summary?: string;
  pages: string[][];
  pageIndex: number;
  setPageIndex: (i: number) => void;
  fontSize: number;
  chapterPage?: number;
  chapterPageTotal?: number;
  chapterIndex?: number;
  chapterTotal?: number;
  chapterKind?: string;
  chapterSections?: readonly string[];
  canonicalChapter?: CanonicalBookChapter | null;
  journalAnswers?: Record<string, string>;
  onJournalAnswerChange?: (promptId: string, value: string) => void;
  coverImageUrl?: string;
  audioTracks?: AudioTrack[];
  pdfUrl?: string;
  pdfTextPages?: readonly string[];
  pdfPageTitles?: Record<number, string>;
  pdfCurrentPage: number;
  totalPdfPages: number;
  chapters: ChapterNavItem[];
  onPdfPageChange: (page: number) => void;
  onPdfDocumentReady: (pages: number) => void;
  onSelectChapter: (index: number) => void;
  playAudio: (url: string | null, title: string | null, coverUrl?: string | null) => void;
  audioProgress?: Record<string, AudioProgressEntry>;
  activeAudioUrl?: string | null;
  isAudioPlaying?: boolean;
  audioCurrentTime?: number;
  audioDuration?: number;
  audioVolume?: number;
  audioPlaybackRate?: number;
  audioFrequencies?: number[];
  onAudioSeek?: (value: number) => void;
  onAudioVolumeChange?: (value: number) => void;
  onAudioPlaybackRateChange?: () => void;
  onOpenAudioFullscreen?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isPageBookmarked?: boolean;
  pageNote?: string;
  readerNotes?: ReaderNoteItem[];
  noteSaveStatus?: 'idle' | 'saving' | 'saved';
  onTogglePageBookmark?: () => void;
  onPageNoteChange?: (value: string) => void;
  onOpenCurrentLetter?: () => void;
  currentLetterTitle?: string;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
  onOpenPdf: () => void;
  onExitReader?: () => void;
  showNarrationButton?: boolean;
  sensoryTrackTitle?: string;
  isSensoryTrackPlaying?: boolean;
  onToggleSensoryTrack?: () => void;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  initialMode?: 'edition' | 'text';
};

const groupLabels: Record<string, string> = {
  manifesto: '1 · Manifesto',
  abertura: '2 · Abertura',
  quebra: 'Quebra de expectativa',
  fundamentos: 'Fundamentos da obra',
  acolhimento: 'Acolhimento e orientação',
  sobrevivencia: 'Ato I · A Sobrevivência',
  reconstrucao: 'Ato II · A Reconstrução',
  continuidade: 'Ato III · A Continuidade',
  encerramento: 'Encerramento',
};

const openingContents: Array<ChapterNavItem & { index: -1; kind: string }> = [
  { id: 'cover', title: 'Início / Capa', summary: '', pdfPage: 1, groupId: 'inicio', index: -1, kind: 'Livro' },
  { id: 'opening', title: 'Abertura', summary: '', pdfPage: 4, groupId: 'inicio', index: -1, kind: 'Livro' },
  { id: 'author-note', title: 'Nota do autor', summary: '', pdfPage: 5, groupId: 'inicio', index: -1, kind: 'Livro' },
  { id: 'copyright', title: 'Créditos e direitos', summary: '', pdfPage: 7, groupId: 'inicio', index: -1, kind: 'Livro' },
  { id: 'summary-1', title: 'Sumário', summary: '', pdfPage: 8, groupId: 'inicio', index: -1, kind: 'Livro' },
  { id: 'summary-2', title: 'Sumário dos pilares', summary: '', pdfPage: 9, groupId: 'inicio', index: -1, kind: 'Livro' },
];

const cleanLabel = (value = '') => {
  let repaired = String(value ?? '');
  try {
    if (/[ÃÂâð]/.test(repaired)) {
      const bytes = Uint8Array.from(Array.from(repaired).map((char) => char.charCodeAt(0) & 255));
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      if (!decoded.includes('\uFFFD')) repaired = decoded;
    }
  } catch {
    // Mantém o texto original e aplica correções pontuais abaixo.
  }

  const badChar = '[\\uFFFD\\u00EF\\u00BF\\u00BD]+';
  return repaired
    .replaceAll('Ã¡', 'á')
    .replaceAll('Ãà', 'à')
    .replaceAll('Ã¢', 'â')
    .replaceAll('Ã£', 'ã')
    .replaceAll('Ã©', 'é')
    .replaceAll('Ãª', 'ê')
    .replaceAll('Ã­', 'í')
    .replaceAll('Ã³', 'ó')
    .replaceAll('Ã´', 'ô')
    .replaceAll('Ãµ', 'õ')
    .replaceAll('Ãº', 'ú')
    .replaceAll('Ã§', 'ç')
    .replaceAll('Ã�', 'Í')
    .replaceAll('Ã‰', 'É')
    .replaceAll('ÃŠ', 'Ê')
    .replaceAll('Ãƒ', 'Ã')
    .replaceAll('Ã‡', 'Ç')
    .replaceAll('Â·', '·')
    .replaceAll('Â ', ' ')
    .replaceAll('â€œ', '"')
    .replaceAll('â€', '"')
    .replaceAll('â€˜', "'")
    .replaceAll('â€™', "'")
    .replaceAll('â€”', '—')
    .replaceAll('â€“', '–')
    .replaceAll('–', '–')
    .replaceAll('—', '—')
    .replaceAll('−', '−')
    .replace(new RegExp(`N${badChar}O`, 'g'), 'NÃO')
    .replace(new RegExp(`n${badChar}o`, 'g'), 'não')
    .replace(new RegExp(`${badChar}\\s*AUTOAJUDA`, 'g'), 'É AUTOAJUDA')
    .replace(new RegExp(`${badChar}\\s*autoajuda`, 'g'), 'é autoajuda')
    .replace(new RegExp(`EXPERI${badChar}NCIA`, 'g'), 'EXPERIÊNCIA')
    .replace(new RegExp(`experi${badChar}ncia`, 'g'), 'experiência')
    .replace(new RegExp(`${badChar}ncora pr${badChar}tica`, 'gi'), 'Âncora prática')
    .replace(new RegExp(`${badChar}NCORA PR${badChar}TICA`, 'g'), 'ÂNCORA PRÁTICA')
    .replace(new RegExp(`pr${badChar}tica`, 'g'), 'prática')
    .replace(new RegExp(`Pr${badChar}tica`, 'g'), 'Prática')
    .replace(new RegExp(`Presen${badChar}a`, 'g'), 'Presença')
    .replace(new RegExp(`presen${badChar}a`, 'g'), 'presença')
    .replace(new RegExp(`Consci${badChar}ncia`, 'g'), 'Consciência')
    .replace(new RegExp(`consci${badChar}ncia`, 'g'), 'consciência')
    .replace(new RegExp(`Tr${badChar}ade`, 'g'), 'Tríade')
    .replace(new RegExp(`TR${badChar}ADE`, 'g'), 'TRÍADE')
    .replace(new RegExp(`CONTEMPOR${badChar}NEAS`, 'g'), 'CONTEMPORÂNEAS')
    .replace(new RegExp(`Contempor${badChar}neas`, 'g'), 'Contemporâneas')
    .replace(new RegExp(`contempor${badChar}neas`, 'g'), 'contemporâneas')
    .replace(new RegExp(`Orienta${badChar}o`, 'g'), 'Orientação')
    .replace(new RegExp(`orienta${badChar}o`, 'g'), 'orientação')
    .replace(new RegExp(`ORIENTA${badChar}O`, 'g'), 'ORIENTAÇÃO')
    .replace(new RegExp(`Reconstru${badChar}o`, 'g'), 'Reconstrução')
    .replace(new RegExp(`reconstru${badChar}o`, 'g'), 'reconstrução')
    .replace(new RegExp(`Cr${badChar}ditos`, 'g'), 'Créditos')
    .replace(new RegExp(`Sum${badChar}rio`, 'g'), 'Sumário')
    .replace(new RegExp(`In${badChar}cio`, 'g'), 'Início')
    .replace(new RegExp(`P${badChar}gina`, 'g'), 'Página')
    .replace(new RegExp(`p${badChar}gina`, 'g'), 'página')
    .replace(new RegExp(`se${badChar}${badChar}o`, 'g'), 'seção')
    .replace(new RegExp(`anota${badChar}${badChar}es`, 'g'), 'anotações')
    .replace(/[\u0013\u0014\u25A0-\u25A3\u25A8-\u25AB\u25AD-\u25AF\u25CC\u25FB-\u25FE\uFFFC]/g, '—');
};

const pageMarkerPattern = /^[-–—]\s*\d+\s*[-–—]\s*/;

const repairReaderText = (value = '') =>
  normalizeReaderSeparators(cleanLabel(value)
    .replaceAll('Orienta??o', 'Orientação')
    .replaceAll('orienta??o', 'orientação')
    .replaceAll('ORIENTAÃ‡ÃƒO', 'ORIENTAÇÃO')
    .replaceAll('Reconstru??o', 'Reconstrução')
    .replaceAll('reconstru??o', 'reconstrução')
    .replaceAll('RECONSTRUÃ‡ÃƒO', 'RECONSTRUÇÃO'));

const compactSpacedHeading = (line: string) => {
  const clean = line.trim();
  const withoutSpaces = clean.replace(/\s+/g, '');
  const uppercaseCount = clean.match(/[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/g)?.length ?? 0;
  if (withoutSpaces.length < 4 || uppercaseCount < 4) return clean;
  if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ](?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]){3,}/.test(clean) || clean.includes('  ')) {
    return clean
      .split(/\s{2,}/)
      .map((chunk) => chunk.replace(/\s+/g, ''))
      .join(' ');
  }
  return clean;
};

const isDecorativeOrLooseMarker = (line: string) =>
  /^([IVXLCDM]+|\d+)$/.test(line.trim());

const normalizePdfHeading = (line: string) => {
  const clean = line.trim();
  const withoutSpaces = clean.replace(/\s+/g, '');
  const uppercaseCount = clean.match(/\p{Lu}/gu)?.length ?? 0;
  if (withoutSpaces.length < 4 || uppercaseCount < 4) return clean.replace(/\s+/g, ' ');

  const looksLetterSpaced = /^\p{Lu}(?:\s+\p{Lu}){3,}/u.test(clean) || /\s{2,}/.test(clean);
  if (!looksLetterSpaced) return clean.replace(/\s+/g, ' ');

  return repairExtractedHeading(clean
    .split(/\s{2,}/)
    .map((chunk) => chunk.replace(/\s+/g, ''))
    .filter(Boolean)
    .join(' '));
};

const repairExtractedHeading = (value: string) => {
  const normalized = repairReaderText(value).replace(/\s+/g, ' ').trim();
  const compact = normalized
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toUpperCase();

  const fixes: Record<string, string> = {
    PILARI: 'PILAR I',
    PILARII: 'PILAR II',
    PILARIII: 'PILAR III',
    PILARIV: 'PILAR IV',
    PILARV: 'PILAR V',
    PILARVI: 'PILAR VI',
    PILARVII: 'PILAR VII',
    PILARVIII: 'PILAR VIII',
    PILARIX: 'PILAR IX',
    TRIADEDA: 'TRÍADE DA',
    OSPILARES: 'OS PILARES',
    TRIADEDAATOIOSPILARES: 'TRÍADE DO ATO I · OS PILARES',
    MANIFESTODEABERTURA: 'MANIFESTO DE ABERTURA',
    ANCORAPRATICA: 'ÂNCORA PRÁTICA',
    PORQUEESTELIVRONAOEAUTOAJUDA: 'POR QUE ESTE LIVRO NÃO É AUTOAJUDA',
    PORQUEESTELIVRONAOAUTOAJUDA: 'POR QUE ESTE LIVRO NÃO É AUTOAJUDA',
  };

  return fixes[compact] ?? normalized;
};

const normalizeAudioLookup = (value = '') =>
  repairReaderText(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const formatReaderAudioTime = (value = 0) => {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const sectionAudioLabel = (section: string) => {
  const normalized = normalizeAudioLookup(section);
  if (normalized.includes('abertura')) return 'abertura';
  if (normalized.includes('limiar')) return 'limiar';
  if (normalized.includes('raiz')) return 'raiz';
  if (normalized.includes('vazio')) return 'vazio';
  if (normalized.includes('peso')) return 'peso';
  if (normalized.includes('escape')) return 'escape';
  if (normalized.includes('projecao')) return 'projecao';
  if (normalized.includes('erosao')) return 'erosao';
  if (normalized.includes('permanencia')) return 'permanencia';
  if (normalized.includes('fenda')) return 'fenda';
  if (normalized.includes('manifesto')) return 'manifesto';
  if (normalized.includes('narrativa')) return 'narrativa';
  if (normalized.includes('consciencia')) return 'consciencia';
  if (normalized.includes('julgamento')) return 'julgamento';
  if (normalized.includes('presenca')) return 'presenca';
  if (normalized.includes('ancora')) return 'ancora';
  if (normalized.includes('carta')) return 'carta';
  if (normalized.includes('regra')) return 'regra';
  if (normalized.includes('fecho')) return 'fecho';
  if (normalized.includes('reflexao')) return 'reflexao';
  return '';
};

const pdfZoomClamp = (value: number) => Math.max(0.8, Math.min(2.4, Number(value.toFixed(2))));
const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const isHeadingLine = (line: string) => {
  const clean = line.trim();
  if (!clean || clean.length > 88) return false;
  const letters = clean.replace(/[^A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç]/g, '');
  if (letters.length < 4) return false;
  const lowerLetters = letters.replace(/[^a-záàâãéêíóôõúç]/g, '').length;
  return lowerLetters / letters.length < 0.28;
};

const readerCommandNamePattern = {
  hideHeader: String.raw`(?:cabecalho|header)`,
  eyebrow: String.raw`(?:cabecalho\s*[-—–]\s*sec(?:a|ã)o|header\s*[-—–]\s*eyebrow)`,
  title: String.raw`(?:cabecalho\s*[-—–]\s*titulo|header\s*[-—–]\s*title)`,
  bodyTitle: String.raw`(?:titulo|subtitulo|paragrafo|paragraph)`,
};

const readerCommandRegex = (namePattern: string, suffix = '') =>
  new RegExp(String.raw`^\[\[\s*${namePattern}\s*${suffix}\s*\]\]$`, 'i');

const matchReaderCommandValue = (line: string, namePattern: string) =>
  line.trim().match(new RegExp(String.raw`^\[\[\s*${namePattern}\s*:\s*(.*?)\s*\]\]$`, 'i'));

const isReaderCommandLine = (line: string) => {
  const clean = line.trim();
  return readerCommandRegex(readerCommandNamePattern.hideHeader, ':\\s*ocultar').test(clean)
    || Boolean(matchReaderCommandValue(clean, readerCommandNamePattern.eyebrow))
    || Boolean(matchReaderCommandValue(clean, readerCommandNamePattern.title))
    || Boolean(matchReaderCommandValue(clean, readerCommandNamePattern.bodyTitle));
};

const parseReaderHeaderDirectives = (text: string): ReaderHeaderDirectives => {
  const directives: ReaderHeaderDirectives = {
    hideHeader: false,
    hideEyebrow: false,
    hideTitle: false,
  };

  text.replace(/\r/g, '').split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (readerCommandRegex(readerCommandNamePattern.hideHeader, ':\\s*ocultar').test(line)) directives.hideHeader = true;

    const eyebrowMatch = matchReaderCommandValue(line, readerCommandNamePattern.eyebrow);
    if (eyebrowMatch) {
      const value = repairReaderText(eyebrowMatch[1].trim());
      if (value) directives.eyebrow = value;
      else directives.hideEyebrow = true;
    }

    const titleMatch = matchReaderCommandValue(line, readerCommandNamePattern.title);
    if (titleMatch) {
      const value = repairReaderText(titleMatch[1].trim());
      if (value) directives.title = value;
      else directives.hideTitle = true;
    }
  });

  return directives;
};

const titleCommandClass = (styles = '') =>
  styles
    .split(/[,\s]+/)
    .map((style) => style.trim().toLowerCase())
    .filter(Boolean)
    .map((style) => {
      if (['bold', 'negrito'].includes(style)) return 'reader-title-bold';
      if (['italic', 'italico', 'itálico'].includes(style)) return 'reader-title-italic';
      if (['caps', 'maiusculo', 'maiúsculo', 'uppercase'].includes(style)) return 'reader-title-caps';
      if (['espacado', 'espaçado', 'spaced', 'tracking'].includes(style)) return 'reader-title-spaced';
      if (['dourado', 'gold'].includes(style)) return 'reader-title-gold';
      if (['centralizado', 'centro', 'center'].includes(style)) return 'reader-align-center';
      if (['direita', 'right'].includes(style)) return 'reader-align-right';
      return '';
    })
    .filter(Boolean)
    .join(' ');

const paragraphCommandClass = (styles = '') =>
  styles
    .split(/[,\s]+/)
    .map((style) => style.trim().toLowerCase())
    .filter(Boolean)
    .map((style) => {
      if (['bold', 'negrito'].includes(style)) return 'reader-title-bold';
      if (['italic', 'italico', 'itálico'].includes(style)) return 'reader-title-italic';
      if (['caps', 'maiusculo', 'maiúsculo', 'uppercase'].includes(style)) return 'reader-title-caps';
      if (['minusculo', 'minúsculo', 'lowercase'].includes(style)) return 'reader-title-lower';
      if (['centralizado', 'centro', 'center'].includes(style)) return 'reader-align-center';
      if (['direita', 'right'].includes(style)) return 'reader-align-right';
      return '';
    })
    .filter(Boolean)
    .join(' ');
const parsePdfTextBlocks = (text: string): TextBlock[] => {
  const normalized = text
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/\r/g, '');

  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const value = paragraph
      .join(' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\s*\[br\]\s*/gi, '[br]')
      .trim();
    if (value) blocks.push({ kind: 'paragraph', text: value });
    paragraph = [];
  };

  normalized.split('\n').forEach((rawLine) => {
    let line = repairReaderText(rawLine.trim());
    if (!line) {
      flushParagraph();
      return;
    }

    line = line.replace(pageMarkerPattern, '').replace(/^—\s*\d+\s*—\s*/, '').trim();
    if (!line) return;
    if (isReaderCommandLine(line) && !/^\[\[(?:titulo|subtitulo|paragrafo|paragraph):/i.test(line)) return;
    if (isDecorativeOrLooseMarker(line)) return;

    const titleCommandMatch = line.match(/^\[\[(titulo|subtitulo):(.+?)(?:\|(.*?))?\]\]$/i);
    if (titleCommandMatch) {
      flushParagraph();
      blocks.push({
        kind: titleCommandMatch[1].toLowerCase() === 'subtitulo' ? 'subheading' : 'heading',
        text: repairReaderText(titleCommandMatch[2].trim()),
        className: titleCommandClass(titleCommandMatch[3] || ''),
      });
      return;
    }

    const paragraphCommandMatch = line.match(/^\[\[(?:paragrafo|paragraph):(.+?)(?:\|(.*?))?\]\]$/i);
    if (paragraphCommandMatch) {
      flushParagraph();
      blocks.push({
        kind: 'paragraph',
        text: repairReaderText(paragraphCommandMatch[1].trim()),
        className: paragraphCommandClass(paragraphCommandMatch[2] || ''),
      });
      return;
    }

    if (/^\[br\]$/i.test(line)) {
      flushParagraph();
      blocks.push({ kind: 'spacer', text: '', size: 18 });
      return;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph();
      blocks.push({ kind: 'divider', text: '' });
      return;
    }

    const fullImageMatch = line.match(/^\[\[(?:capa|imagem-full):(.+?)(?:\|(.*?))?\]\]$/i);
    if (fullImageMatch) {
      flushParagraph();
      blocks.push({
        kind: 'image-full',
        text: fullImageMatch[1].trim(),
        alt: (fullImageMatch[2] || '').trim(),
      });
      return;
    }

    const imageMatch = line.match(/^\[\[imagem:(.+?)(?:\|(.*?))?\]\]$/i) || line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushParagraph();
      const markdownStyle = line.startsWith('![');
      blocks.push({
        kind: 'image',
        text: (markdownStyle ? imageMatch[2] : imageMatch[1]).trim(),
        alt: (markdownStyle ? imageMatch[1] : imageMatch[2] || '').trim(),
      });
      return;
    }

    const spacerMatch = line.match(/^\[\[espaco:(\d{1,3})\]\]$/i);
    if (spacerMatch) {
      flushParagraph();
      blocks.push({ kind: 'spacer', text: '', size: Math.min(120, Math.max(8, Number(spacerMatch[1]) || 24)) });
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      blocks.push({ kind: 'paragraph', text: line.replace(/\s+/g, ' ') });
      return;
    }

    paragraph.push(line.replace(/\s+/g, ' '));
  });

  flushParagraph();
  return blocks;
};

export default function ReaderShell({
  title,
  chapterLabel = 'Livro',
  summary,
  pages,
  pageIndex,
  setPageIndex,
  fontSize,
  chapterPage,
  chapterPageTotal,
  chapterIndex = 0,
  chapterTotal = 1,
  chapterKind = 'Livro',
  chapterSections = [],
  canonicalChapter = null,
  journalAnswers = {},
  onJournalAnswerChange,
  coverImageUrl,
  audioTracks = [],
  pdfUrl,
  pdfTextPages = [],
  pdfPageTitles = {},
  pdfCurrentPage,
  totalPdfPages,
  chapters,
  onPdfPageChange,
  onPdfDocumentReady,
  onSelectChapter,
  playAudio,
  audioProgress = {},
  activeAudioUrl = null,
  isAudioPlaying = false,
  audioCurrentTime = 0,
  audioDuration = 0,
  audioVolume = 0.84,
  audioPlaybackRate = 1,
  audioFrequencies = [],
  onAudioSeek,
  onAudioVolumeChange,
  onAudioPlaybackRateChange,
  onOpenAudioFullscreen,
  isFavorite,
  onToggleFavorite,
  isPageBookmarked = false,
  pageNote = '',
  readerNotes = [],
  noteSaveStatus = 'idle',
  onTogglePageBookmark,
  onPageNoteChange,
  onOpenCurrentLetter,
  currentLetterTitle,
  onFontIncrease,
  onFontDecrease,
  onOpenPdf,
  onExitReader,
  showNarrationButton = true,
  sensoryTrackTitle,
  isSensoryTrackPlaying = false,
  onToggleSensoryTrack,
  darkMode = true,
  onToggleTheme,
  initialMode = 'text',
}: Props) {
  const [mode, setMode] = useState<'edition' | 'text'>(initialMode);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesTab, setNotesTab] = useState<'current' | 'all'>('current');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.85);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [pdfOptionsOpen, setPdfOptionsOpen] = useState(false);
  const [isNarratingPage, setIsNarratingPage] = useState(false);
  const [activeNarrationChar, setActiveNarrationChar] = useState<number | null>(null);
  const [expandedAudioTab, setExpandedAudioTab] = useState<number | null>(null);
  const [activeAudioTab, setActiveAudioTab] = useState<number | null>(null);
  const [expandedContentsChapterId, setExpandedContentsChapterId] = useState<string | null>(null);
  const [pageNavVisible, setPageNavVisible] = useState(true);
  const [reflowPageIndex, setReflowPageIndex] = useState(0);
  const [reflowTotalPages, setReflowTotalPages] = useState(1);
  const [reflowPageStep, setReflowPageStep] = useState(1);
  const readerShellRef = useRef<HTMLElement | null>(null);
  const textSurfaceRef = useRef<HTMLElement | null>(null);
  const reflowViewportRef = useRef<HTMLDivElement | null>(null);
  const reflowColumnsRef = useRef<HTMLDivElement | null>(null);
  const pdfContinuousRef = useRef<HTMLDivElement | null>(null);
  const pdfPageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pdfScrollFromUserRef = useRef(false);
  const sectionAnchorRefs = useRef<Record<string, HTMLElement | null>>({});
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const swipeRef = useRef<{ x: number; y: number; time: number; pinching: boolean } | null>(null);
  const pageNavTimerRef = useRef<number | null>(null);
  const narrationRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pdfProgress = Math.round((pdfCurrentPage / Math.max(1, totalPdfPages)) * 100);
  const heardInChapter = audioTracks.filter((track) => audioProgress[track.url]?.heard).length;
  const pdfPageNumbers = useMemo(
    () => Array.from({ length: Math.max(1, totalPdfPages) }, (_, index) => index + 1),
    [totalPdfPages],
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (mode !== 'edition') return;
    if (pdfScrollFromUserRef.current) {
      pdfScrollFromUserRef.current = false;
      return;
    }
    const target = pdfPageRefs.current[pdfCurrentPage];
    target?.scrollIntoView({ block: 'start' });
  }, [mode, pdfCurrentPage]);

  const updatePdfCurrentPageFromScroll = () => {
    const scroller = pdfContinuousRef.current;
    if (!scroller) return;
    const viewportTop = scroller.getBoundingClientRect().top + 72;
    let closestPage = pdfCurrentPage;
    let closestDistance = Number.POSITIVE_INFINITY;
    Object.entries(pdfPageRefs.current).forEach(([page, element]) => {
      if (!element) return;
      const distance = Math.abs(element.getBoundingClientRect().top - viewportTop);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = Number(page);
      }
    });
    if (closestPage !== pdfCurrentPage) {
      pdfScrollFromUserRef.current = true;
      onPdfPageChange(closestPage);
    }
  };

  const openingEntry = openingContents.find((entry) => entry.pdfPage === pdfCurrentPage && pdfCurrentPage < (chapters[0]?.pdfPage ?? 1));
  const overridePageTitle = repairReaderText(pdfPageTitles[pdfCurrentPage] || '');
  const displayTitle = repairReaderText(overridePageTitle || openingEntry?.title || title);
  const displaySummary = repairReaderText(summary || '');
  const displayChapterKind = repairReaderText(openingEntry?.kind || chapterKind);
  const displayCurrentLetterTitle = repairReaderText(currentLetterTitle || '');
  const sortedReaderNotes = useMemo(
    () => [...readerNotes].filter((note) => note.note.trim() || note.page === pdfCurrentPage).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [pdfCurrentPage, readerNotes],
  );
  const pdfTextBlocks = useMemo(
    () => parsePdfTextBlocks(pdfTextPages[pdfCurrentPage - 1] || ''),
    [pdfCurrentPage, pdfTextPages],
  );
  const headerDirectives = useMemo(
    () => parseReaderHeaderDirectives(pdfTextPages[pdfCurrentPage - 1] || ''),
    [pdfCurrentPage, pdfTextPages],
  );
  const textBlocks = pdfTextBlocks.length ? pdfTextBlocks : [];
  const firstBlockIsHeader = false;
  const pageDisplayTitle = headerDirectives.title ?? displayTitle;
  const pageDisplayEyebrow = headerDirectives.eyebrow ?? displayChapterKind;
  const bodyTextBlocks = textBlocks;
  const resolvedChapterIndex = typeof chapterIndex === 'number' && chapterIndex >= 0
    ? chapterIndex
    : Math.max(0, chapters.findIndex((chapter, index) => {
        const next = chapters[index + 1];
        return pdfCurrentPage >= chapter.pdfPage && (!next || pdfCurrentPage < next.pdfPage);
      }));
  const reflowChapter = chapters[resolvedChapterIndex];
  const reflowStartPage = reflowChapter?.pdfPage ?? pdfCurrentPage;
  const reflowEndPage = Math.max(
    reflowStartPage,
    Math.min(totalPdfPages, (chapters[resolvedChapterIndex + 1]?.pdfPage ?? totalPdfPages + 1) - 1),
  );
  const reflowTextSource = useMemo(
    () => {
      const start = Math.max(1, reflowStartPage);
      const end = Math.max(start, reflowEndPage);
      return pdfTextPages
        .slice(start - 1, end)
        .join('\n\n');
    },
    [pdfTextPages, reflowEndPage, reflowStartPage],
  );
  const activeCanonicalChapter = canonicalChapter?.id === reflowChapter?.id ? canonicalChapter : null;
  const canonicalTextBlocks = useMemo<TextBlock[]>(
    () => (activeCanonicalChapter?.blocks ?? [])
      .filter((block) => block.kind !== 'image' && block.kind !== 'image-full')
      .map((block) => ({
        kind: block.kind === 'pause' ? 'paragraph' : block.kind,
        text: block.text,
        alt: block.alt,
        size: block.size,
        className: [block.className, block.kind === 'pause' ? 'reader-canonical-pause' : ''].filter(Boolean).join(' ') || undefined,
      })),
    [activeCanonicalChapter],
  );
  const reflowBlocks = useMemo(
    () => canonicalTextBlocks.length ? canonicalTextBlocks : parsePdfTextBlocks(reflowTextSource),
    [canonicalTextBlocks, reflowTextSource],
  );
  const firstDropcapBlockIndex = useMemo(
    () => reflowBlocks.findIndex((block) => {
      if (block.kind !== 'paragraph') return false;
      if (block.className?.includes('reader-canonical-pause')) return false;
      if (block.className?.includes('reader-digital-cover')) return false;
      const cleanText = repairReaderText(block.text).replace(/\s+/g, ' ').trim();
      return cleanText.length >= 90 && cleanText.split(/\s+/).length >= 14;
    }),
    [reflowBlocks],
  );
  const isJournalChapter = activeCanonicalChapter?.kind === 'caderno';
  const journalPrompts = activeCanonicalChapter?.journalPrompts ?? [];
  const reflowHeaderDirectives = useMemo(
    () => parseReaderHeaderDirectives(reflowTextSource),
    [reflowTextSource],
  );
  const reflowDisplayTitle = activeCanonicalChapter?.title
    ?? reflowHeaderDirectives.title
    ?? repairReaderText(reflowChapter?.title || pageDisplayTitle);
  const reflowDisplayEyebrow = activeCanonicalChapter?.eyebrow
    ?? reflowHeaderDirectives.eyebrow
    ?? repairReaderText(groupLabels[reflowChapter?.groupId || ''] || pageDisplayEyebrow);
  const reflowSourcePageStart = activeCanonicalChapter?.sourcePageStart ?? reflowStartPage;
  const reflowSourcePageEnd = activeCanonicalChapter?.sourcePageEnd ?? reflowEndPage;
  const progressBase = resolvedChapterIndex === 0 && reflowPageIndex === 0
    ? 0
    : (resolvedChapterIndex + (reflowPageIndex / Math.max(1, reflowTotalPages))) / Math.max(1, chapters.length);
  const reflowProgress = Math.round(
    Math.max(0, Math.min(1, progressBase)) * 100,
  );
  const activeReaderAudioTrack = audioTracks.find((track) => activeAudioUrl === track.url) ?? audioTracks[0] ?? null;
  const activeReaderAudioPlaying = Boolean(activeReaderAudioTrack && activeAudioUrl === activeReaderAudioTrack.url && isAudioPlaying);
  const activeReaderAudioProgress = audioDuration > 0 ? Math.max(0, Math.min(100, (audioCurrentTime / audioDuration) * 100)) : 0;
  const activeReaderAudioBars = audioFrequencies.length ? audioFrequencies.slice(0, 18) : [20, 46, 32, 64, 38, 54, 30, 44, 26, 36, 22, 30];

  useEffect(() => {
    setExpandedContentsChapterId((current) => current ?? reflowChapter?.id ?? chapters[resolvedChapterIndex]?.id ?? null);
  }, [chapters, reflowChapter?.id, resolvedChapterIndex]);

  const scrollToAudioSection = (section: string) => {
    const key = sectionAudioLabel(section);
    const element = key ? sectionAnchorRefs.current[key] : null;
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const registerSectionAnchor = (block: TextBlock, element: HTMLElement | null) => {
    const key = sectionAudioLabel(block.text);
    if (key) sectionAnchorRefs.current[key] = element;
  };

  const audioTrackForBlock = (block: TextBlock) => {
    const cleanText = repairReaderText(block.text).replace(/\[br\]/gi, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    if (!cleanText || cleanText.length > 56 || wordCount > 5) return null;
    const key = sectionAudioLabel(block.text);
    if (!key) return null;
    return audioTracks.find((track) => sectionAudioLabel(track.label) === key) ?? null;
  };

  const renderAudioCue = (block: TextBlock) => {
    const track = audioTrackForBlock(block);
    if (!track) return null;
    const active = activeAudioUrl === track.url && isAudioPlaying;
    return (
      <button
        type="button"
        className={`reader-inline-audio-cue ${active ? 'active' : ''}`}
        onClick={(event) => {
          event.stopPropagation();
          playAudio(track.url, `${displayTitle} · ${cleanLabel(track.label)}`, track.coverUrl);
        }}
        title={`Ouvir: ${cleanLabel(track.label)}`}
        aria-label={`Ouvir ${cleanLabel(track.label)}`}
      >
        <Headphones size={13} />
      </button>
    );
  };

  const revealPageNavigation = () => {
    setPageNavVisible(true);
    if (pageNavTimerRef.current) window.clearTimeout(pageNavTimerRef.current);
    pageNavTimerRef.current = window.setTimeout(() => {
      setPageNavVisible(false);
    }, 2800);
  };

  useEffect(() => {
    revealPageNavigation();
    return () => {
      if (pageNavTimerRef.current) window.clearTimeout(pageNavTimerRef.current);
    };
  }, [mode, pdfCurrentPage]);

  useEffect(() => {
    if (mode !== 'text') return;
    const alignTop = () => {
      const surface = textSurfaceRef.current;
      if (!surface) return;
      const scrollArea = surface.querySelector<HTMLElement>('.page-copy');
      if (scrollArea) scrollArea.scrollTop = 0;
      surface.scrollTop = 0;
      const bookbar = readerShellRef.current?.querySelector<HTMLElement>('.reader-bookbar');
      const offset = (bookbar?.getBoundingClientRect().height || 0) + 10;
      const top = surface.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    };
    window.requestAnimationFrame(alignTop);
    const timer = window.setTimeout(alignTop, 60);
    const lateTimer = window.setTimeout(alignTop, 180);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(lateTimer);
    };
  }, [mode, pdfCurrentPage]);

  useEffect(() => {
    setReflowPageIndex(0);
  }, [fontSize, letterSpacing, lineHeight, resolvedChapterIndex, reflowTextSource]);

  useEffect(() => {
    if (mode !== 'text') return;
    const measure = () => {
      const viewport = reflowViewportRef.current;
      const columns = reflowColumnsRef.current;
      if (!viewport || !columns) return;
      const viewportStyle = window.getComputedStyle(viewport);
      const horizontalPadding =
        (Number.parseFloat(viewportStyle.paddingLeft) || 0) +
        (Number.parseFloat(viewportStyle.paddingRight) || 0);
      const parsedContentGuard = Number.parseFloat(viewportStyle.getPropertyValue('--reader-reflow-right-guard'));
      const contentGuard = Number.isFinite(parsedContentGuard) ? parsedContentGuard : 0;
      const measuredWidth = viewport.clientWidth - horizontalPadding - contentGuard;
      const width = Math.max(320, Math.floor(measuredWidth));
      const gap = Math.max(40, Math.min(72, Math.round(width * 0.08)));
      columns.style.setProperty('--reader-reflow-colw', `${width}px`);
      columns.style.setProperty('--reader-reflow-gap', `${gap}px`);
      setReflowPageStep(width + gap);
      const scrollWidth = Math.max(width, columns.scrollWidth);
      const total = scrollWidth <= width + Math.ceil(gap * 0.35)
        ? 1
        : Math.max(1, Math.ceil((scrollWidth - Math.ceil(gap * 0.35)) / (width + gap)));
      setReflowTotalPages(total);
      setReflowPageIndex((current) => clampNumber(current, 0, total - 1));
    };
    const frame = window.requestAnimationFrame(measure);
    const timer = window.setTimeout(measure, 90);
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [fontSize, letterSpacing, lineHeight, mode, reflowBlocks.length, reflowTextSource]);

  const touchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const first = touches[0];
    const second = touches[1];
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  };

  const handlePdfTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length === 2) {
      pinchRef.current = { distance: touchDistance(event.touches), zoom: pdfZoom };
      swipeRef.current = { x: 0, y: 0, time: 0, pinching: true };
      return;
    }
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      swipeRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        pinching: false,
      };
    }
  };

  const handlePdfTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 2 || !pinchRef.current?.distance) return;
    event.preventDefault();
    const ratio = touchDistance(event.touches) / pinchRef.current.distance;
    setPdfZoom(pdfZoomClamp(pinchRef.current.zoom * ratio));
  };

  const handlePdfTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (event.touches.length < 2) pinchRef.current = null;
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.pinching || event.changedTouches.length === 0 || pdfZoom > 1.08) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipe.x;
    const dy = touch.clientY - swipe.y;
    const elapsed = Date.now() - swipe.time;
    if (elapsed > 700 || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
    if (mode === 'text') {
      if (dx < 0) {
        setReflowPageIndex((current) => {
          if (current < reflowTotalPages - 1) return current + 1;
          if (resolvedChapterIndex < chapters.length - 1) {
            onSelectChapter(resolvedChapterIndex + 1);
            return 0;
          }
          return current;
        });
      }
      if (dx > 0) {
        setReflowPageIndex((current) => {
          if (current > 0) return current - 1;
          if (resolvedChapterIndex > 0) {
            onSelectChapter(resolvedChapterIndex - 1);
            return 0;
          }
          return current;
        });
      }
      return;
    }
    if (dx < 0 && pdfCurrentPage < totalPdfPages) onPdfPageChange(pdfCurrentPage + 1);
    if (dx > 0 && pdfCurrentPage > 1) onPdfPageChange(pdfCurrentPage - 1);
  };

  const narrationData = useMemo(() => {
    let cursor = 0;
    const ranges: Array<{ blockIndex: number; wordIndex: number; start: number; end: number }> = [];
    const textParts: string[] = [];
    const narrationBlocks = mode === 'text' ? reflowBlocks : textBlocks;
    narrationBlocks.forEach((block, blockIndex) => {
      if (!['heading', 'subheading', 'paragraph'].includes(block.kind)) return;
      const cleanText = block.text.replace(/\[br\]/gi, ' ').replace(/\s+/g, ' ').trim();
      let wordIndex = 0;
      for (const match of cleanText.matchAll(/\S+/g)) {
        ranges.push({
          blockIndex,
          wordIndex,
          start: cursor + match.index,
          end: cursor + match.index + match[0].length,
        });
        wordIndex += 1;
      }
      textParts.push(cleanText);
      cursor += cleanText.length + 2;
    });
    const text = textParts.join('\n\n');
    return { text, ranges };
  }, [mode, reflowBlocks, textBlocks]);

  const activeNarrationWord = useMemo(() => {
    if (activeNarrationChar === null) return null;
    return narrationData.ranges.find((range) => activeNarrationChar >= range.start && activeNarrationChar < range.end) ?? null;
  }, [activeNarrationChar, narrationData]);

  const groupedChapters = useMemo(() => {
    const chapterGroups = chapters.reduce<Array<{ id: string; label: string; items: Array<ChapterNavItem & { index: number }> }>>((groups, chapter, index) => {
      let group = groups.find((item) => item.id === chapter.groupId);
      if (!group) {
        group = { id: chapter.groupId, label: groupLabels[chapter.groupId] ?? 'Livro', items: [] };
        groups.push(group);
      }
      group.items.push({ ...chapter, index });
      return groups;
    }, []);
    return chapterGroups;
  }, [chapters]);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  const stopPageNarration = () => {
    window.speechSynthesis?.cancel();
    narrationRef.current = null;
    setIsNarratingPage(false);
    setActiveNarrationChar(null);
  };

  const startPageNarration = () => {
    if (!narrationData.text.trim() || !('speechSynthesis' in window)) return;
    stopPageNarration();
    const utterance = new SpeechSynthesisUtterance(narrationData.text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = 0.92;
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.charLength) setActiveNarrationChar(event.charIndex);
    };
    utterance.onend = () => {
      narrationRef.current = null;
      setIsNarratingPage(false);
      setActiveNarrationChar(null);
    };
    utterance.onerror = () => {
      narrationRef.current = null;
      setIsNarratingPage(false);
      setActiveNarrationChar(null);
    };
    narrationRef.current = utterance;
    setIsNarratingPage(true);
    window.speechSynthesis.speak(utterance);
  };

  const togglePageNarration = () => {
    if (isNarratingPage) stopPageNarration();
    else startPageNarration();
  };

  const renderNarrationText = (block: TextBlock, blockIndex: number) => {
    let wordIndex = 0;
    return block.text.split(/(\[br\]|\s+)/i).map((token, tokenIndex) => {
      if (/^\[br\]$/i.test(token)) return <br key={`${blockIndex}-${tokenIndex}`} />;
      if (!token.trim()) return token;
      const currentWordIndex = wordIndex;
      wordIndex += 1;
      const active = activeNarrationWord?.blockIndex === blockIndex && activeNarrationWord.wordIndex === currentWordIndex;
      return (
        <span className={active ? 'narration-word active' : 'narration-word'} key={`${blockIndex}-${tokenIndex}`}>
          {token}
        </span>
      );
    });
  };

  const renderFormattedText = (block: TextBlock, blockIndex: number) => {
    if (!/(\*\*|__|\*)/.test(block.text)) return renderNarrationText(block, blockIndex);
    const parts = block.text.split(/(\*\*.*?\*\*|__.*?__|\*[^*]+\*)/g).filter(Boolean);
    return parts.map((part, index) => {
      if (/^\*\*.*\*\*$/.test(part) || /^__.*__$/.test(part)) {
        return <strong key={`${blockIndex}-fmt-${index}`}>{part.replace(/^(\*\*|__)|(\*\*|__)$/g, '')}</strong>;
      }
      if (/^\*[^*]+\*$/.test(part)) {
        return <em key={`${blockIndex}-fmt-${index}`}>{part.slice(1, -1)}</em>;
      }
      return <span key={`${blockIndex}-fmt-${index}`}>{part.split(/\[br\]/i).map((piece, pieceIndex) => <span key={`${blockIndex}-fmt-${index}-${pieceIndex}`}>{pieceIndex > 0 && <br />}{piece}</span>)}</span>;
    });
  };

  useEffect(() => stopPageNarration, [pdfCurrentPage]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setPdfFullscreen(Boolean(fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode === 'text') {
        if (event.key === 'ArrowLeft') {
          setReflowPageIndex((current) => {
            if (current > 0) return current - 1;
            if (resolvedChapterIndex > 0) {
              onSelectChapter(resolvedChapterIndex - 1);
              return 0;
            }
            return current;
          });
        }
        if (event.key === 'ArrowRight') {
          setReflowPageIndex((current) => {
            if (current < reflowTotalPages - 1) return current + 1;
            if (resolvedChapterIndex < chapters.length - 1) {
              onSelectChapter(resolvedChapterIndex + 1);
              return 0;
            }
            return current;
          });
        }
        return;
      }
      if (event.key === 'ArrowLeft') onPdfPageChange(Math.max(1, pdfCurrentPage - 1));
      if (event.key === 'ArrowRight') onPdfPageChange(Math.min(totalPdfPages, pdfCurrentPage + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chapters.length, mode, onPdfPageChange, onSelectChapter, pdfCurrentPage, reflowTotalPages, resolvedChapterIndex, totalPdfPages]);

  const selectChapter = (index: number) => {
    onSelectChapter(index);
    setContentsOpen(false);
  };

  const selectPdfPage = (page: number) => {
    onPdfPageChange(page);
    setContentsOpen(false);
  };

  const togglePdfFullscreen = async () => {
    const target = (readerShellRef.current || document.documentElement) as HTMLElement & {
      webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
    };
    if (!target) return;
    try {
      const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } else {
        if (target.requestFullscreen) {
          await target.requestFullscreen({ navigationUI: 'hide' });
        } else if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen({ navigationUI: 'hide' });
        }
      }
    } catch {
      setPdfFullscreen((value) => !value);
    }
  };

  return (
    <section
      ref={readerShellRef}
      className={`reader-stage immersive-reader ${mode === 'text' ? 'reader-clean-mode' : 'reader-pdf-mode'} ${contentsOpen ? 'contents-open' : ''} ${pdfFullscreen ? 'native-fullscreen' : ''} ${pageNavVisible ? 'reader-page-nav-visible' : 'reader-page-nav-hidden'}`}
      onPointerDown={revealPageNavigation}
      onMouseMove={revealPageNavigation}
    >
      <svg className="reader-gradient-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="opdds-premium-bookmark-gradient" cx="38%" cy="28%" r="76%">
            <stop offset="0%" stopColor="#fff3bd" />
            <stop offset="58%" stopColor="#b17545" />
            <stop offset="100%" stopColor="#3b2d22" />
          </radialGradient>
        </defs>
      </svg>
      {mode === 'text' && (
      <div className="reader-bookbar">
        <button className="reader-index-trigger" onClick={() => setContentsOpen(true)} title="Abrir sumário">
          <Menu size={21} />
        </button>
        <div className="reader-bookbar-current" aria-label="Seção aberta">
          <span>{reflowDisplayEyebrow}</span>
          <strong>{reflowDisplayTitle}</strong>
        </div>

        <div className="reader-actions" aria-label="Controles do leitor">
          {mode === 'text' && (
            <div className="reader-format-controls" aria-label="Ajustes do texto">
              <button onClick={onFontDecrease} title="Diminuir texto">A−</button>
              <button onClick={onFontIncrease} title="Aumentar texto">A+</button>
              <button onClick={() => setLineHeight((value) => value >= 2.08 ? 1.65 : Number((value + 0.12).toFixed(2)))} title={`Ajuste das linhas: ${lineHeight.toFixed(2)}`}>≡</button>
            </div>
          )}
          {mode === 'text' && onToggleTheme && (
            <button className="icon-button reader-theme-button" onClick={onToggleTheme} title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <button
            className={`icon-button reader-page-bookmark-button ${isPageBookmarked ? 'active' : ''}`}
            onClick={onTogglePageBookmark}
            title={isPageBookmarked ? 'Remover marcação da página' : 'Marcar página'}
          >
            <Bookmark size={18} fill={isPageBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`icon-button reader-favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar capitulo'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`icon-button reader-notes-button ${pageNote.trim() ? 'has-note' : ''}`}
            onClick={() => {
              setNotesTab('current');
              setNotesOpen(true);
            }}
            title="Minhas anotações"
          >
            <StickyNote size={18} />
          </button>
          {mode === 'text' && onExitReader ? (
            <button
              className="icon-button reader-home-top-button"
              onClick={onExitReader}
              title="Voltar para a home"
            >
              <Home size={18} />
            </button>
          ) : (
            <button className="icon-button" onClick={onOpenPdf} title="Baixar PDF"><DownloadCloud size={18} /></button>
          )}
        </div>
      </div>
      )}

      {notesOpen && (
        <div className="reader-notes-backdrop" onClick={() => setNotesOpen(false)}>
          <aside className="reader-notes-popover" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Minhas anotações">
            <header>
              <div>
                <p className="kicker">Painel do leitor</p>
                <h2>Minhas anotações</h2>
              </div>
              <button onClick={() => setNotesOpen(false)} title="Fechar anotações"><X size={20} /></button>
            </header>
            <div className="reader-notes-tabs">
              <button className={notesTab === 'current' ? 'active' : ''} onClick={() => setNotesTab('current')}>Página atual</button>
              <button className={notesTab === 'all' ? 'active' : ''} onClick={() => setNotesTab('all')}>Minhas anotações</button>
            </div>
            {notesTab === 'current' ? (
              <section className="reader-note-editor">
                <div className="save-feedback-row">
                  <span>Página {pdfCurrentPage}</span>
                  <small className={`save-feedback ${noteSaveStatus}`}>
                    {noteSaveStatus === 'saving' ? 'Salvando...' : noteSaveStatus === 'saved' ? 'Salvo' : pageNote.trim() ? 'Salvo localmente' : 'Aguardando escrita'}
                  </small>
                </div>
                <textarea
                  value={pageNote}
                  onChange={(event) => onPageNoteChange?.(event.target.value)}
                  placeholder="Anote uma frase, um incômodo ou uma lembrança para voltar depois..."
                  aria-label="Nota da página atual"
                />
                <small>A anotação fica salva e vinculada a esta página.</small>
              </section>
            ) : (
              <section className="reader-notes-list">
                {sortedReaderNotes.length ? sortedReaderNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onPdfPageChange(note.page);
                      setNotesTab('current');
                    }}
                  >
                    <small>Página {note.page} · {cleanLabel(note.title)}</small>
                    <strong>{note.note.trim() || 'Página marcada sem texto'}</strong>
                  </button>
                )) : (
                  <p>Nenhuma anotação salva ainda.</p>
                )}
              </section>
            )}
          </aside>
        </div>
      )}

      {displayCurrentLetterTitle && (
      <div className="reader-quick-tools">
          <button onClick={onOpenCurrentLetter}>
            <Mail size={16} />
            {displayCurrentLetterTitle}
          </button>
      </div>
      )}

      <div className={`reader-contents-backdrop ${contentsOpen ? 'show' : ''}`} onClick={() => setContentsOpen(false)} />
      <aside className={`reader-contents-drawer ${contentsOpen ? 'open' : ''}`} aria-label="Índice do livro">
        <header>
          <div>
            <p className="kicker">O Poder dos Desacreditados</p>
            <h2>Índice</h2>
          </div>
          <button onClick={() => setContentsOpen(false)} title="Fechar índice"><X size={22} /></button>
        </header>
        <nav>
          {groupedChapters.map((group) => (
            <section key={group.id}>
              <p>{group.label}</p>
              {group.items.map((chapter) => {
                const isActiveChapter = chapter.index >= 0 ? chapter.index === chapterIndex : chapter.pdfPage === pdfCurrentPage;
                const isExpanded = expandedContentsChapterId === chapter.id || isActiveChapter;
                const chapterAudioTracks = chapter.index === chapterIndex
                  ? audioTracks
                  : (chapter.audioTracks ?? []);
                return (
                  <div className={`reader-toc-chapter ${isExpanded ? 'open' : ''}`} key={chapter.id}>
                    <button
                      className={`reader-toc-chapter-row ${isActiveChapter ? 'active' : ''}`}
                      onClick={() => {
                        setExpandedContentsChapterId(isExpanded && !isActiveChapter ? null : chapter.id);
                        if (chapter.index >= 0) onSelectChapter(chapter.index);
                        else onPdfPageChange(chapter.pdfPage);
                      }}
                    >
                      <span>
                        {chapter.roman && <small>Pilar {chapter.roman}</small>}
                        <strong>{repairReaderText(chapter.title)}</strong>
                      </span>
                      <ChevronRight size={12} />
                    </button>
                    {isExpanded && chapterAudioTracks.length > 0 && (
                      <div className="reader-toc-audio-list">
                        {chapterAudioTracks.map((track) => {
                          const heard = Boolean(audioProgress[track.url]?.heard);
                          const active = activeAudioUrl === track.url;
                          return (
                            <button
                              type="button"
                              key={`${chapter.id}-${track.url}`}
                              className={`reader-toc-audio-row ${active ? 'active' : ''} ${heard ? 'heard' : ''}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (chapter.index >= 0 && chapter.index !== chapterIndex) {
                                  onSelectChapter(chapter.index);
                                }
                                playAudio(track.url, `${repairReaderText(chapter.title)} · ${cleanLabel(track.label)}`, track.coverUrl);
                                setContentsOpen(false);
                              }}
                            >
                              <span>{cleanLabel(track.label)}</span>
                              <strong>{heard ? 'Ouvido' : 'Não ouvido'}</strong>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
          {onExitReader && (
            <div className="reader-contents-footer">
              <span>Após o epílogo</span>
              <button type="button" onClick={onExitReader}>
                Voltar para home
              </button>
            </div>
          )}
        </nav>
      </aside>

      {mode === 'edition' ? (
        <div className={`pdf-reader-shell pdf-continuous-shell ${pdfFullscreen ? 'pdf-fullscreen-shell' : ''}`}>
          {pdfFullscreen && (
            <button
              className="pdf-fullscreen-close"
              onClick={togglePdfFullscreen}
              title="Fechar tela cheia"
              aria-label="Fechar tela cheia"
            >
              <X size={22} />
            </button>
          )}
          <div className="pdf-chrome-toolbar">
            <button className="pdf-toolbar-menu-button" onClick={() => setContentsOpen(true)} title="Abrir índice">
              <Menu size={18} />
            </button>
            <strong className="pdf-document-title">O_Poder_dos_Desacreditados_FINAL_17-07-26.pdf</strong>
            <div className="pdf-toolbar-spacer pdf-toolbar-title-spacer" />
            <label className="pdf-page-counter">
              <input
                value={pdfCurrentPage}
                type="number"
                min={1}
                max={totalPdfPages}
                onChange={(event) => onPdfPageChange(clampNumber(Number(event.target.value) || 1, 1, totalPdfPages))}
              />
              <span>/ {totalPdfPages}</span>
            </label>
            <div className="pdf-toolbar-divider" />
            <button onClick={() => setPdfZoom((value) => pdfZoomClamp(value - 0.1))} title="Diminuir zoom"><Minus size={17} /></button>
            <span className="pdf-zoom-label">{Math.round(pdfZoom * 100)}%</span>
            <button onClick={() => setPdfZoom((value) => pdfZoomClamp(value + 0.1))} title="Aumentar zoom"><Plus size={17} /></button>
            <div className="pdf-toolbar-divider" />
            <button onClick={() => setPdfZoom(1)} title="Ajustar à página"><Maximize2 size={17} /></button>
            <button onClick={() => setPdfRotation((value) => (value + 90) % 360)} title="Girar visualização"><RotateCw size={17} /></button>
            <div className="pdf-toolbar-spacer" />
            <button className="pdf-app-home-button" onClick={onExitReader} title="Voltar para home"><Home size={18} /></button>
            <button onClick={onOpenPdf} title="Baixar PDF"><DownloadCloud size={18} /></button>
            <button onClick={() => window.print()} title="Imprimir"><Printer size={18} /></button>
            <div className="pdf-options-wrap">
              <button
                className="pdf-more-button"
                onClick={() => setPdfOptionsOpen((value) => !value)}
                title="Mais opções"
                aria-haspopup="menu"
                aria-expanded={pdfOptionsOpen}
              >
                <MoreVertical size={18} />
              </button>
              {pdfOptionsOpen && (
                <div className="pdf-options-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => setPdfOptionsOpen(false)}>Visualização de duas páginas</button>
                  <button type="button" role="menuitem" onClick={() => { togglePdfFullscreen(); setPdfOptionsOpen(false); }}>Apresentação</button>
                  <button type="button" role="menuitem" onClick={() => setPdfOptionsOpen(false)}>Propriedades do documento</button>
                </div>
              )}
            </div>
          </div>

          <div
            ref={pdfContinuousRef}
            className="pdf-continuous-scroll"
            onScroll={updatePdfCurrentPageFromScroll}
          >
            {pdfUrl ? (
              <Suspense fallback={<div className="pdf-page-status">Preparando a edição completa...</div>}>
                {pdfPageNumbers.map((page) => (
                  <div
                    className="pdf-continuous-page"
                    key={page}
                    ref={(element) => { pdfPageRefs.current[page] = element; }}
                  >
                    <PdfPageCanvas url={pdfUrl} page={page} zoom={pdfZoom} rotation={pdfRotation} onDocumentReady={onPdfDocumentReady} />
                  </div>
                ))}
              </Suspense>
            ) : (
              <div className="pdf-page-status">PDF não disponível.</div>
            )}
          </div>
        </div>
      ) : (
        <>
        <article
          ref={textSurfaceRef}
          className={`kindle-surface reader-text-surface reader-chapter-${(reflowChapter?.id || 'page').replace(/[^a-z0-9-]/gi, '-')} ${(activeReaderAudioTrack || (showNarrationButton && onToggleSensoryTrack)) ? 'reader-has-bottom-audio' : ''}`}
          style={{
            '--reader-extra-height': `${Math.max(0, fontSize - 16) * 42}px`,
          } as React.CSSProperties}
          onTouchStart={handlePdfTouchStart}
          onTouchEnd={handlePdfTouchEnd}
          onTouchCancel={handlePdfTouchEnd}
        >
          {isPageBookmarked && (
            <div className="reader-page-bookmark-ribbon" aria-hidden="true">
              <Bookmark fill="currentColor" size={42} />
            </div>
          )}
          <div className="book-meta">
            <span>Fôlego {reflowPageIndex + 1} de {reflowTotalPages}</span>
            <span>{reflowDisplayEyebrow}</span>
            <span>{reflowProgress}% do livro</span>
          </div>
          {!reflowHeaderDirectives.hideHeader && (
          <div className="chapter-coverlet">
            <div className="chapter-cover-art" style={coverImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(6,7,8,.08), rgba(6,7,8,.76)), url(${coverImageUrl})` } : undefined} />
            <div className="chapter-cover-copy">
              {!reflowHeaderDirectives.hideEyebrow && <p className="kicker">{reflowDisplayEyebrow}</p>}
              {!reflowHeaderDirectives.hideTitle && <h1>{reflowDisplayTitle}</h1>}
              <span>Leitura reflow · páginas-fonte {reflowSourcePageStart}–{reflowSourcePageEnd}</span>
            </div>
          </div>
          )}
          <div className="reader-reflow-viewport" ref={reflowViewportRef}>
            <div
              ref={reflowColumnsRef}
              className="page-copy pdf-text-copy reader-reflow-columns"
              style={{
                '--reader-font-size': `${fontSize}px`,
                '--reader-line-height': lineHeight,
                fontSize: `${fontSize}px`,
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
                transform: `translateX(-${reflowPageIndex * reflowPageStep}px)`,
              } as React.CSSProperties}
            >
            {isJournalChapter ? (
              <section className="reader-journal-form" aria-label="Caderno de presença">
                <p className="kicker">Caderno de presença</p>
                <h2>{reflowDisplayTitle}</h2>
                <span>Escreva sem obrigação de concluir. As respostas ficam na sua jornada privada e sincronizam quando sua conta está conectada.</span>
                <div className="reader-journal-fields">
                  {journalPrompts.map((prompt, promptIndex) => (
                    <label key={prompt.id} className="reader-journal-field">
                      <strong>{String(promptIndex + 1).padStart(2, '0')}</strong>
                      <span>{prompt.text}</span>
                      <textarea
                        value={journalAnswers[prompt.id] ?? ''}
                        onChange={(event) => onJournalAnswerChange?.(prompt.id, event.target.value)}
                        placeholder="Escreva aqui..."
                      />
                    </label>
                  ))}
                </div>
              </section>
            ) : reflowBlocks.length ? reflowBlocks.map((block, index) => {
              const blockIndex = index;
              if (block.kind === 'heading') return <h2 className={`${block.className || ''} reader-audio-markable`.trim()} ref={(element) => registerSectionAnchor(block, element)} key={`${pdfCurrentPage}-${blockIndex}`}>{renderFormattedText(block, blockIndex)}{renderAudioCue(block)}</h2>;
              if (block.kind === 'subheading') return <h3 className={`${block.className || ''} reader-audio-markable`.trim()} ref={(element) => registerSectionAnchor(block, element)} key={`${pdfCurrentPage}-${blockIndex}`}>{renderFormattedText(block, blockIndex)}{renderAudioCue(block)}</h3>;
              if (block.kind === 'divider') return <hr className="reader-content-divider" key={`${pdfCurrentPage}-${blockIndex}`} />;
              if (block.kind === 'image') {
                return (
                  <figure className="reader-content-image" key={`${pdfCurrentPage}-${blockIndex}`}>
                    <img src={block.text} alt={block.alt || ''} loading="lazy" />
                    {block.alt && <figcaption>{block.alt}</figcaption>}
                  </figure>
                );
              }
              if (block.kind === 'image-full') {
                return (
                  <figure className="reader-content-image reader-content-image-full" key={`${pdfCurrentPage}-${blockIndex}`}>
                    <img src={block.text} alt={block.alt || ''} loading="lazy" />
                    {block.alt && <figcaption>{block.alt}</figcaption>}
                  </figure>
                );
              }
              if (block.kind === 'spacer') return <div className="reader-content-spacer" style={{ height: `${block.size ?? 24}px` }} key={`${pdfCurrentPage}-${blockIndex}`} />;
              const inlineAudioCue = renderAudioCue(block);
              const cleanParagraphText = repairReaderText(block.text).replace(/\s+/g, ' ').trim();
              const isShortHighlight = cleanParagraphText.length < 120 || cleanParagraphText.split(/\s+/).length < 18 || block.className?.includes('reader-canonical-pause');
              const paragraphClasses = [
                /^\d+\.\s+/.test(block.text) ? 'reader-list-line' : '',
                inlineAudioCue ? 'reader-audio-markable reader-audio-section-line' : '',
                !isShortHighlight && blockIndex === firstDropcapBlockIndex ? 'reader-dropcap-enabled' : '',
                block.className || '',
              ].filter(Boolean).join(' ');
              return <p className={paragraphClasses || undefined} key={`${pdfCurrentPage}-${blockIndex}`}>{inlineAudioCue}{renderFormattedText(block, blockIndex)}</p>;
            }) : (
              <p>Não foi possível montar o texto deste capítulo. Use o modo Edição para visualizar a página original.</p>
            )}
            </div>
          </div>
          <div className="reader-text-note-panel reader-reflow-note-panel">
            <div>
              <p className="kicker">Minha marca nesta página</p>
              <h3>Fôlego {reflowPageIndex + 1}</h3>
              <small className={`save-feedback ${noteSaveStatus}`}>
                {noteSaveStatus === 'saving' ? 'Salvando...' : noteSaveStatus === 'saved' ? 'Salvo' : pageNote.trim() ? 'Salvo localmente' : 'Digite para salvar'}
              </small>
            </div>
            <textarea
              value={pageNote}
              onChange={(event) => onPageNoteChange?.(event.target.value)}
              placeholder="Anote uma frase, um incômodo ou uma lembrança para voltar depois..."
              aria-label="Nota da página atual"
            />
          </div>
          <button
            className="reader-side-page-button reader-side-page-prev floating-page-nav"
            onClick={() => {
              if (reflowPageIndex > 0) setReflowPageIndex((current) => current - 1);
              else if (resolvedChapterIndex > 0) onSelectChapter(resolvedChapterIndex - 1);
            }}
            disabled={reflowPageIndex <= 0 && resolvedChapterIndex <= 0}
            aria-label="Fôlego anterior"
          >
            <ChevronLeft size={21} />
          </button>
          <button
            className="reader-side-page-button reader-side-page-next floating-page-nav"
            onClick={() => {
              if (reflowPageIndex < reflowTotalPages - 1) setReflowPageIndex((current) => current + 1);
              else if (resolvedChapterIndex < chapters.length - 1) onSelectChapter(resolvedChapterIndex + 1);
            }}
            disabled={reflowPageIndex >= reflowTotalPages - 1 && resolvedChapterIndex >= chapters.length - 1}
            aria-label="Próximo fôlego"
          >
            <ChevronRight size={21} />
          </button>
          <div className="reader-bottom-stack">
            <div className="reader-page-progress-footer">
              <span>{reflowProgress}% do livro</span>
              <strong>Fôlego {reflowPageIndex + 1} de {reflowTotalPages}</strong>
              <div className="progress-track reader-global-progress"><span style={{ width: `${reflowProgress}%` }} /></div>
            </div>
            {(activeReaderAudioTrack || (showNarrationButton && onToggleSensoryTrack)) && mode === 'text' && (
              <div className="reader-bottom-audio-slot">
                {showNarrationButton && onToggleSensoryTrack && (
                  <button
                    type="button"
                    className={`reader-bottom-sensory-button ${isSensoryTrackPlaying ? 'active' : ''}`}
                    onClick={onToggleSensoryTrack}
                    title={isSensoryTrackPlaying ? 'Pausar trilha de fundo' : `Tocar trilha de fundo${sensoryTrackTitle ? `: ${sensoryTrackTitle}` : ''}`}
                    aria-label={isSensoryTrackPlaying ? 'Pausar trilha de fundo' : `Tocar trilha de fundo${sensoryTrackTitle ? `: ${sensoryTrackTitle}` : ''}`}
                  >
                    <Volume2 size={15} />
                  </button>
                )}
                {activeReaderAudioTrack && (
                  <div className="reader-top-audio-wrap">
                    <div className={`reader-top-audio-chip reader-compact-audio-player ${activeReaderAudioPlaying ? 'playing' : ''}`}>
                      <button
                        type="button"
                        className="reader-top-audio-play"
                        onClick={() => playAudio(activeReaderAudioTrack.url, `${displayTitle} · ${cleanLabel(activeReaderAudioTrack.label)}`, activeReaderAudioTrack.coverUrl)}
                        title={activeReaderAudioPlaying ? 'Pausar áudio desta parte' : 'Ouvir esta parte'}
                        aria-label={activeReaderAudioPlaying ? 'Pausar áudio desta parte' : 'Ouvir esta parte'}
                      >
                        {activeReaderAudioPlaying ? <Pause size={21} /> : <Play size={22} fill="currentColor" />}
                      </button>
                      <div className="reader-top-audio-current">
                        <span>{activeReaderAudioPlaying ? 'Ouvindo' : 'Ouvir'}</span>
                        <strong>{cleanLabel(activeReaderAudioTrack.label)}</strong>
                        <div className="reader-mini-audio-meter" aria-hidden="true">
                          {activeReaderAudioBars.map((value, index) => (
                            <i
                              key={`${index}-${value}`}
                              style={{ height: `${Math.max(4, Math.min(28, value / 3))}px` }}
                            />
                          ))}
                        </div>
                        <div className="reader-mini-audio-time">
                          <small>{formatReaderAudioTime(activeAudioUrl === activeReaderAudioTrack.url ? audioCurrentTime : audioProgress[activeReaderAudioTrack.url]?.currentTime || 0)}</small>
                          <small>{formatReaderAudioTime(activeAudioUrl === activeReaderAudioTrack.url ? audioDuration : audioProgress[activeReaderAudioTrack.url]?.duration || 0)}</small>
                        </div>
                        <div className="reader-mini-audio-progress">
                          <span style={{ width: `${activeAudioUrl === activeReaderAudioTrack.url ? activeReaderAudioProgress : 0}%` }} />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeAudioUrl === activeReaderAudioTrack.url ? activeReaderAudioProgress : 0}
                            onChange={(event) => onAudioSeek?.(Number(event.target.value))}
                            aria-label="Progresso do áudio desta parte"
                            disabled={activeAudioUrl !== activeReaderAudioTrack.url || !onAudioSeek}
                          />
                        </div>
                      </div>
                      <label className="reader-mini-volume" style={{ '--reader-volume-progress': `${Math.round(audioVolume * 100)}%` } as React.CSSProperties}>
                        <Volume2 size={15} />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(audioVolume * 100)}
                          onChange={(event) => onAudioVolumeChange?.(Number(event.target.value))}
                          aria-label="Volume do áudio"
                        />
                      </label>
                      <button
                        type="button"
                        className="reader-mini-speed"
                        onClick={onAudioPlaybackRateChange}
                        title="Velocidade do áudio"
                      >
                        {audioPlaybackRate % 1 === 0 ? audioPlaybackRate.toFixed(0) : audioPlaybackRate.toFixed(2).replace(/0$/, '')}x
                      </button>
                      <button
                        type="button"
                        className="reader-top-audio-minimize"
                        onClick={onOpenAudioFullscreen}
                        aria-label="Abrir player em tela cheia"
                        title="Abrir player em tela cheia"
                      >
                        <Maximize2 size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
        <div className="reader-footer-actions">
        <div className="reader-footer-right-controls">
          {false && showNarrationButton && onToggleSensoryTrack && (
            <div className="reader-narration-controls reader-narration-footer">
              <button
                onClick={onToggleSensoryTrack}
                className={isSensoryTrackPlaying ? 'active' : ''}
                title={isSensoryTrackPlaying ? 'Pausar trilha sensorial' : `Tocar trilha sensorial${sensoryTrackTitle ? `: ${sensoryTrackTitle}` : ''}`}
                aria-label={isSensoryTrackPlaying ? 'Pausar trilha sensorial' : `Tocar trilha sensorial${sensoryTrackTitle ? `: ${sensoryTrackTitle}` : ''}`}
              >
                <Volume2 size={15} />
              </button>
            </div>
          )}
        </div>
        </div>
        </>
      )}
    </section>
  );
}

