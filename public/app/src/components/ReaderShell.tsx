import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  Headphones,
  Highlighter,
  Home,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
  Plus,
  Play,
  Share2,
  StickyNote,
  Volume2,
  X,
} from 'lucide-react';

const PdfPageCanvas = lazy(() => import('./PdfPageCanvas'));

type ChapterNavItem = {
  id: string;
  title: string;
  summary: string;
  pdfPage: number;
  groupId: string;
  roman?: string;
};

type AudioTrack = {
  label: string;
  url: string;
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
};

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
  chapterSections?: string[];
  coverImageUrl?: string;
  audioTracks?: AudioTrack[];
  pdfUrl?: string;
  pdfTextPages?: readonly string[];
  pdfCurrentPage: number;
  totalPdfPages: number;
  chapters: ChapterNavItem[];
  onPdfPageChange: (page: number) => void;
  onPdfDocumentReady: (pages: number) => void;
  onSelectChapter: (index: number) => void;
  playAudio: (url: string | null, title: string | null) => void;
  audioProgress?: Record<string, AudioProgressEntry>;
  activeAudioUrl?: string | null;
  isAudioPlaying?: boolean;
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
  onShare: () => void;
  onExitReader?: () => void;
  showNarrationButton?: boolean;
};

const groupLabels: Record<string, string> = {
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
  let repaired = value;
  try {
    if (/[Ãâð]/.test(value)) {
      const bytes = Uint8Array.from(Array.from(value).map((char) => char.charCodeAt(0) & 255));
      repaired = new TextDecoder('utf-8').decode(bytes);
    }
  } catch {
    repaired = value
      .replaceAll('Ã¡', 'á')
      .replaceAll('Ã©', 'é')
      .replaceAll('Ã­', 'í')
      .replaceAll('Ã³', 'ó')
      .replaceAll('Ãº', 'ú')
      .replaceAll('Ã£', 'ã')
      .replaceAll('Ãµ', 'õ')
      .replaceAll('Ã§', 'ç')
      .replaceAll('Ãª', 'ê')
      .replaceAll('Ã´', 'ô')
      .replaceAll('Â·', '·')
      .replaceAll('â€”', '—')
      .replaceAll('â€“', '–');
  }

  const badChar = '[\\uFFFD\\u00EF\\u00BF\\u00BD]';
  return repaired
    .replace(new RegExp(`N${badChar}O`, 'g'), 'N\u00c3O')
    .replace(new RegExp(`n${badChar}o`, 'g'), 'n\u00e3o')
    .replace(new RegExp(`${badChar}\\s*AUTOAJUDA`, 'g'), '\u00c9 AUTOAJUDA')
    .replace(new RegExp(`${badChar}\\s*autoajuda`, 'g'), '\u00e9 autoajuda')
    .replace(new RegExp(`EXPERI${badChar}NCIA`, 'g'), 'EXPERI\u00caNCIA')
    .replace(new RegExp(`experi${badChar}ncia`, 'g'), 'experi\u00eancia')
    .replace(new RegExp(`${badChar}ncora pr${badChar}tica`, 'gi'), '\u00c2ncora pr\u00e1tica')
    .replace(new RegExp(`${badChar}NCORA PR${badChar}TICA`, 'g'), '\u00c2NCORA PR\u00c1TICA')
    .replace(new RegExp(`pr${badChar}tica`, 'g'), 'pr\u00e1tica')
    .replace(new RegExp(`Pr${badChar}tica`, 'g'), 'Pr\u00e1tica')
    .replace(new RegExp(`Presen${badChar}a`, 'g'), 'Presen\u00e7a')
    .replace(new RegExp(`presen${badChar}a`, 'g'), 'presen\u00e7a')
    .replace(new RegExp(`Consci${badChar}ncia`, 'g'), 'Consci\u00eancia')
    .replace(new RegExp(`consci${badChar}ncia`, 'g'), 'consci\u00eancia')
    .replace(new RegExp(`Tr${badChar}ade`, 'g'), 'Tr\u00edade')
    .replace(new RegExp(`TR${badChar}ADE`, 'g'), 'TR\u00cdADE')
    .replace(new RegExp(`Orienta${badChar}+o`, 'g'), 'Orientação')
    .replace(new RegExp(`orienta${badChar}+o`, 'g'), 'orientação')
    .replace(new RegExp(`ORIENTA${badChar}+O`, 'g'), 'ORIENTAÇÃO')
    .replace(new RegExp(`Reconstru${badChar}+o`, 'g'), 'Reconstrução')
    .replace(new RegExp(`reconstru${badChar}+o`, 'g'), 'reconstrução');
};

const pageMarkerPattern = /^[-–—]\s*\d+\s*[-–—]\s*/;

const repairReaderText = (value = '') =>
  cleanLabel(value)
    .replaceAll('Orienta\u00c3\u00a7\u00c3\u00a3o', 'Orienta\u00e7\u00e3o')
    .replaceAll('orienta\u00c3\u00a7\u00c3\u00a3o', 'orienta\u00e7\u00e3o')
    .replaceAll('ORIENTA\u00c3\u0087\u00c3\u0083O', 'ORIENTA\u00c7\u00c3O')
    .replaceAll('Reconstru\u00c3\u00a7\u00c3\u00a3o', 'Reconstru\u00e7\u00e3o')
    .replaceAll('reconstru\u00c3\u00a7\u00c3\u00a3o', 'reconstru\u00e7\u00e3o')
    .replaceAll('RECONSTRU\u00c3\u0087\u00c3\u0083O', 'RECONSTRU\u00c7\u00c3O');

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

const sectionAudioLabel = (section: string) => {
  const normalized = normalizeAudioLookup(section);
  if (normalized.includes('limiar')) return 'limiar';
  if (normalized.includes('manifesto')) return 'manifesto';
  if (normalized.includes('narrativa')) return 'narrativa';
  if (normalized.includes('consciencia')) return 'consciencia';
  if (normalized.includes('julgamento')) return 'julgamento';
  if (normalized.includes('presenca')) return 'presenca';
  if (normalized.includes('ancora')) return 'ancora';
  if (normalized.includes('carta') || normalized.includes('fecho')) return 'fecho';
  return '';
};

const isHeadingLine = (line: string) => {
  const clean = line.trim();
  if (!clean || clean.length > 88) return false;
  const letters = clean.replace(/[^A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç]/g, '');
  if (letters.length < 4) return false;
  const lowerLetters = letters.replace(/[^a-záàâãéêíóôõúç]/g, '').length;
  return lowerLetters / letters.length < 0.28;
};

const parsePdfTextBlocks = (text: string): TextBlock[] => {
  const normalized = text
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/\r/g, '');

  const blocks: TextBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const value = paragraph.join(' ').replace(/\s+/g, ' ').trim();
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
    if (isDecorativeOrLooseMarker(line)) return;

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

    const heading = repairExtractedHeading(normalizePdfHeading(line));
    if (heading.length > 2 && (isHeadingLine(line) || isHeadingLine(heading))) {
      flushParagraph();
      const kind = heading.length <= 18 ? 'subheading' : 'heading';
      const previous = blocks[blocks.length - 1];
      if (previous?.kind === kind) previous.text = repairExtractedHeading(`${previous.text} ${heading}`.replace(/\s+/g, ' ').trim());
      else blocks.push({ kind, text: heading });
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
  coverImageUrl,
  audioTracks = [],
  pdfUrl,
  pdfTextPages = [],
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
  onShare,
  onExitReader,
  showNarrationButton = true,
}: Props) {
  const [mode, setMode] = useState<'edition' | 'text'>('text');
  const [contentsOpen, setContentsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesTab, setNotesTab] = useState<'current' | 'all'>('current');
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.45);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [isNarratingPage, setIsNarratingPage] = useState(false);
  const [activeNarrationChar, setActiveNarrationChar] = useState<number | null>(null);
  const [expandedAudioTab, setExpandedAudioTab] = useState<number | null>(null);
  const [activeAudioTab, setActiveAudioTab] = useState<number | null>(null);
  const readerShellRef = useRef<HTMLElement | null>(null);
  const narrationRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pdfProgress = Math.round((pdfCurrentPage / Math.max(1, totalPdfPages)) * 100);
  const heardInChapter = audioTracks.filter((track) => audioProgress[track.url]?.heard).length;
  const openingEntry = openingContents.find((entry) => entry.pdfPage === pdfCurrentPage && pdfCurrentPage < (chapters[0]?.pdfPage ?? 1));
  const displayTitle = repairReaderText(openingEntry?.title || title);
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
  const textBlocks = pdfTextBlocks.length ? pdfTextBlocks : [];

  const narrationData = useMemo(() => {
    let cursor = 0;
    const ranges: Array<{ blockIndex: number; wordIndex: number; start: number; end: number }> = [];
    const textParts: string[] = [];
    textBlocks.forEach((block, blockIndex) => {
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
  }, [textBlocks]);

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
    return [{ id: 'inicio', label: 'Início e sumário', items: openingContents }, ...chapterGroups];
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
      if (event.key === 'ArrowLeft') onPdfPageChange(Math.max(1, pdfCurrentPage - 1));
      if (event.key === 'ArrowRight') onPdfPageChange(Math.min(totalPdfPages, pdfCurrentPage + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPdfPageChange, pdfCurrentPage, totalPdfPages]);

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
    <section ref={readerShellRef} className={`reader-stage immersive-reader ${mode === 'text' ? 'reader-clean-mode' : ''} ${contentsOpen ? 'contents-open' : ''} ${pdfFullscreen ? 'native-fullscreen' : ''}`}>
      <div className="reader-bookbar">
        <button className="reader-index-trigger" onClick={() => setContentsOpen(true)} title="Abrir índice">
          <Menu size={21} />
          <span>
            <small>{chapterLabel}</small>
            <strong>{displayTitle}</strong>
          </span>
        </button>

        <div className="reader-actions" aria-label="Controles do leitor">
          <div className="segmented-control" role="tablist" aria-label="Modo de leitura">
            <button className={mode === 'edition' ? 'active' : ''} onClick={() => setMode('edition')}>
              <BookOpen size={16} />
              <span>Edição</span>
            </button>
            <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
              <Highlighter size={16} />
              <span>Texto</span>
            </button>
          </div>
          {mode === 'text' && (
            <div className="reader-format-controls" aria-label="Ajustes do texto">
              <button onClick={onFontDecrease} title="Diminuir texto"><Minus size={15} /></button>
              <span>{fontSize}px</span>
              <button onClick={onFontIncrease} title="Aumentar texto"><Plus size={15} /></button>
              <button onClick={() => setLetterSpacing((value) => value >= 1.2 ? 0 : Number((value + 0.2).toFixed(1)))}>Kerning {letterSpacing.toFixed(1)}</button>
              <button onClick={() => setLineHeight((value) => value >= 1.9 ? 1.35 : Number((value + 0.1).toFixed(2)))}>Linha {lineHeight.toFixed(2)}</button>
            </div>
          )}
          {mode === 'edition' && (
            <div className="reader-format-controls" aria-label="Zoom do PDF">
              <button onClick={() => setPdfZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(2))))}>−</button>
              <span>{Math.round(pdfZoom * 100)}%</span>
              <button onClick={() => setPdfZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}>+</button>
              <button onClick={togglePdfFullscreen} title={pdfFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
                {pdfFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          )}
          <button
            className={`icon-button reader-page-bookmark-button ${isPageBookmarked ? 'active' : ''}`}
            onClick={onTogglePageBookmark}
            title={isPageBookmarked ? 'Remover marcação da página' : 'Marcar página'}
          >
            <Bookmark size={18} fill={isPageBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-button" onClick={onShare} title="Compartilhar capítulo"><Share2 size={18} /></button>
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
          <button className="icon-button" onClick={onOpenPdf} title="Baixar PDF"><DownloadCloud size={18} /></button>
        </div>
      </div>

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
              {group.items.map((chapter) => (
                <button
                  key={chapter.id}
                  className={chapter.index >= 0 ? (chapter.index === chapterIndex ? 'active' : '') : (chapter.pdfPage === pdfCurrentPage ? 'active' : '')}
                  onClick={() => chapter.index >= 0 ? selectChapter(chapter.index) : selectPdfPage(chapter.pdfPage)}
                >
                  <small>{chapter.roman ? `Pilar ${chapter.roman}` : `Página ${chapter.pdfPage}`}</small>
                  <strong>{cleanLabel(chapter.title)}</strong>
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      {mode === 'edition' ? (
        <div className={`pdf-reader-shell ${pdfFullscreen ? 'pdf-fullscreen-shell' : ''}`}>
          <div className="pdf-reader-meta">
            <span>Página {pdfCurrentPage} de {totalPdfPages}</span>
            <span>{displayChapterKind} · seção {chapterIndex + 1}/{chapterTotal}</span>
            <span>{pdfProgress}% do livro</span>
          </div>

          <div className="pdf-page-stage">
            {pdfUrl ? (
              <Suspense fallback={<div className="pdf-page-status">Preparando a edição completa...</div>}>
                <PdfPageCanvas url={pdfUrl} page={pdfCurrentPage} zoom={pdfZoom} onDocumentReady={onPdfDocumentReady} />
              </Suspense>
            ) : (
              <div className="pdf-page-status">PDF não disponível.</div>
            )}
          </div>

          <div className="reader-view-controls pdf-zoom-controls">
            <button onClick={() => setPdfZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(2))))}>−</button>
            <span>Zoom {Math.round(pdfZoom * 100)}%</span>
            <button onClick={() => setPdfZoom((value) => Math.min(1.8, Number((value + 0.1).toFixed(2))))}>+</button>
            <button
              className="reader-fullscreen-toggle"
              onClick={() => setPdfFullscreen((value) => !value)}
              title={pdfFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              aria-label={pdfFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {pdfFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>

          {audioTracks.length > 0 && (
            <div className="reader-audio-chapters">
              <span><Headphones size={17} /> Ouvir esta parte {heardInChapter > 0 ? `· ${heardInChapter}/${audioTracks.length} ouvidos` : ''}</span>
              <div>
                {audioTracks.map((track) => (
                  <button
                    key={track.url}
                    className={activeAudioUrl === track.url && isAudioPlaying ? 'active-audio' : ''}
                    onClick={() => playAudio(track.url, `${displayTitle} · ${cleanLabel(track.label)}`)}
                  >
                    {cleanLabel(track.label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="reader-reflection-panel">
            <div>
              <p className="kicker">Minha marca nesta página</p>
              <h3>Página {pdfCurrentPage}</h3>
            </div>
            <textarea
              value={pageNote}
              onChange={(event) => onPageNoteChange?.(event.target.value)}
              placeholder="Anote uma frase, um incômodo ou uma lembrança para voltar depois..."
              aria-label="Nota da página atual"
            />
          </div>

          <div className="pdf-reader-navigation">
            <button
              className="page-button"
              onClick={() => onPdfPageChange(Math.max(1, pdfCurrentPage - 1))}
              disabled={pdfCurrentPage <= 1}
              title="Página anterior"
            >
              <ChevronLeft size={21} />
            </button>
            <div>
              <div className="progress-track reader-global-progress">
                <span style={{ width: `${pdfProgress}%` }} />
              </div>
              <small>{displayTitle}</small>
            </div>
            <button
              className="page-button"
              onClick={() => onPdfPageChange(Math.min(totalPdfPages, pdfCurrentPage + 1))}
              disabled={pdfCurrentPage >= totalPdfPages}
              title="Próxima página"
            >
              <ChevronRight size={21} />
            </button>
          </div>
        </div>
      ) : (
        <>
        <div className="reader-chapter-strip">
          {chapterSections.length > 0 && (
            <div className="reader-section-tabs compact">
              {chapterSections.map((section, index) => {
                const audioLabel = sectionAudioLabel(section);
                const sectionTrack = audioLabel
                  ? audioTracks.find((track) => normalizeAudioLookup(track.label).includes(audioLabel))
                  : null;
                const active = Boolean(sectionTrack && activeAudioUrl === sectionTrack.url && isAudioPlaying && activeAudioTab === index);
                const expanded = expandedAudioTab === index || active;
                const tabLabel = cleanLabel(section);
                return (
                  <div
                    key={`${section}-${index}`}
                    className={`reader-section-audio-tab ${expanded ? 'expanded' : ''} ${active ? 'active-audio' : ''}`}
                    onClickCapture={() => setActiveAudioTab(index)}
                    title={sectionTrack ? `Ouvir ${cleanLabel(sectionTrack.label)}` : tabLabel}
                  >
                    <button
                      type="button"
                      className="reader-section-audio-trigger"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedAudioTab((current) => current === index ? null : index);
                      }}
                    >
                      <span>{index + 1}</span>
                      <strong>{tabLabel}</strong>
                    </button>
                    {sectionTrack && (
                      <button
                        type="button"
                        className="reader-section-audio-play"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveAudioTab(index);
                          playAudio(sectionTrack.url, `${displayTitle} - ${cleanLabel(sectionTrack.label)}`);
                        }}
                        aria-label={`Ouvir ${tabLabel}`}
                      >
                        <Play size={13} fill="currentColor" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {audioTracks.length > 0 && chapterSections.length === 0 && (
            <div className="reader-strip-audio">
              <strong><Headphones size={16} /> Ouvir esta parte</strong>
              {audioTracks.map((track) => (
                <button
                  key={track.url}
                  className={activeAudioUrl === track.url && isAudioPlaying ? 'active-audio' : ''}
                  onClick={() => playAudio(track.url, `${displayTitle} · ${cleanLabel(track.label)}`)}
                >
                  {cleanLabel(track.label)}
                </button>
              ))}
            </div>
          )}
        </div>
        <article className="kindle-surface reader-text-surface">
          {isPageBookmarked && (
            <div className="reader-page-bookmark-ribbon" aria-hidden="true">
              <Bookmark fill="currentColor" size={42} />
            </div>
          )}
          <div className="book-meta">
            <span>Página {pdfCurrentPage} de {totalPdfPages}</span>
            <span>{displayChapterKind}</span>
            <span>{pdfProgress}% do livro</span>
          </div>
          <div className="chapter-coverlet">
            <div className="chapter-cover-art" style={coverImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(6,7,8,.08), rgba(6,7,8,.76)), url(${coverImageUrl})` } : undefined} />
            <div className="chapter-cover-copy">
              <p className="kicker">{displayChapterKind}</p>
              <h1>{displayTitle}</h1>
              <span>Texto extraído da página {pdfCurrentPage} da edição completa</span>
            </div>
          </div>
          <div className="page-copy pdf-text-copy" style={{ fontSize: `${fontSize}px`, letterSpacing: `${letterSpacing}px`, lineHeight }}>
            {textBlocks.length ? textBlocks.map((block, index) => {
              if (block.kind === 'heading') return <h2 key={`${pdfCurrentPage}-${index}`}>{renderNarrationText(block, index)}</h2>;
              if (block.kind === 'subheading') return <h3 key={`${pdfCurrentPage}-${index}`}>{renderNarrationText(block, index)}</h3>;
              if (block.kind === 'divider') return <hr className="reader-content-divider" key={`${pdfCurrentPage}-${index}`} />;
              if (block.kind === 'image') {
                return (
                  <figure className="reader-content-image" key={`${pdfCurrentPage}-${index}`}>
                    <img src={block.text} alt={block.alt || ''} loading="lazy" />
                    {block.alt && <figcaption>{block.alt}</figcaption>}
                  </figure>
                );
              }
              if (block.kind === 'image-full') {
                return (
                  <figure className="reader-content-image reader-content-image-full" key={`${pdfCurrentPage}-${index}`}>
                    <img src={block.text} alt={block.alt || ''} loading="lazy" />
                    {block.alt && <figcaption>{block.alt}</figcaption>}
                  </figure>
                );
              }
              if (block.kind === 'spacer') return <div className="reader-content-spacer" style={{ height: `${block.size ?? 24}px` }} key={`${pdfCurrentPage}-${index}`} />;
              return <p className={/^\d+\.\s+/.test(block.text) ? 'reader-list-line' : undefined} key={`${pdfCurrentPage}-${index}`}>{renderNarrationText(block, index)}</p>;
            }) : (
              <p>Não foi possível extrair texto desta página. Use o modo Edição para visualizar a página original.</p>
            )}
          </div>
          <div className="reader-text-note-panel">
            <div>
              <p className="kicker">Minha marca nesta página</p>
              <h3>Página {pdfCurrentPage}</h3>
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
          <div className="reader-text-tools">
            <button onClick={onFontDecrease}><Minus size={16} /></button>
            <span>{fontSize}px</span>
            <button onClick={onFontIncrease}><Plus size={16} /></button>
            <button onClick={() => setLetterSpacing((value) => value >= 1.2 ? 0 : Number((value + 0.2).toFixed(1)))}>Kerning {letterSpacing.toFixed(1)}</button>
            <button onClick={() => setLineHeight((value) => value >= 1.9 ? 1.35 : Number((value + 0.1).toFixed(2)))}>Linha {lineHeight.toFixed(2)}</button>
            {displaySummary && <small>{displaySummary}</small>}
          </div>
          <div className="pdf-reader-navigation">
            <button className="page-button" onClick={() => onPdfPageChange(Math.max(1, pdfCurrentPage - 1))} disabled={pdfCurrentPage <= 1}><ChevronLeft size={21} /></button>
            <div className="reader-nav-divider" aria-hidden="true" />
            <button className="page-button" onClick={() => onPdfPageChange(Math.min(totalPdfPages, pdfCurrentPage + 1))} disabled={pdfCurrentPage >= totalPdfPages}><ChevronRight size={21} /></button>
          </div>
          <div className="reader-page-progress-footer">
            <span>{pdfProgress}% do livro</span>
            <strong>Página {pdfCurrentPage} de {totalPdfPages}</strong>
            <div className="progress-track reader-global-progress"><span style={{ width: `${pdfProgress}%` }} /></div>
          </div>
        </article>
        <div className="reader-footer-actions">
        {showNarrationButton && (
          <div className="reader-narration-controls reader-narration-footer">
            <button
              onClick={togglePageNarration}
              className={isNarratingPage ? 'active' : ''}
              title={isNarratingPage ? 'Parar narração' : 'Narrar página'}
              aria-label={isNarratingPage ? 'Parar narração' : 'Narrar página'}
            >
              <Volume2 size={15} />
            </button>
          </div>
        )}
        {onExitReader && (
          <button className="reader-footer-exit-button" onClick={onExitReader} title="Voltar ao menu principal">
            <Home size={16} />
            <span>Voltar ao menu</span>
          </button>
        )}
        </div>
        </>
      )}
    </section>
  );
}
