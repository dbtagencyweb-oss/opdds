import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  FileText,
  Headphones,
  Highlighter,
  MessageCircle,
  Minus,
  Plus,
  Share2,
  Sparkles,
} from 'lucide-react';

type MentorLens = 'contraponto' | 'pergunta' | 'ancora';

type Props = {
  title: string;
  chapterLabel?: string;
  summary?: string;
  pages: string[][];
  pageIndex: number;
  setPageIndex: (i: number) => void;
  fontSize: number;
  globalPage?: number;
  totalBookPages?: number;
  chapterPage?: number;
  chapterPageTotal?: number;
  chapterIndex?: number;
  chapterTotal?: number;
  chapterKind?: string;
  coverImageUrl?: string;
  audioUrl?: string | null;
  pdfUrl?: string;
  playAudio: (url: string | null, title: string | null) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onFontIncrease: () => void;
  onFontDecrease: () => void;
  onOpenPdf: () => void;
  onShare: () => void;
};

const mentorCopy: Record<MentorLens, { label: string; title: string; body: string }> = {
  contraponto: {
    label: 'Contraponto',
    title: 'Olhe de outro ângulo',
    body:
      'Antes de aceitar a voz que te diminui, separe fato de sentença. O que aconteceu pode ser real; a conclusão de que você não serve talvez seja só um julgamento antigo tentando parecer verdade.',
  },
  pergunta: {
    label: 'Pergunta',
    title: 'Leitura ativa',
    body:
      'Qual frase deste trecho descreve você sem te esmagar? Marque mentalmente essa frase e volte para ela quando a leitura começar a tocar num ponto sensível.',
  },
  ancora: {
    label: 'Âncora',
    title: 'Volte para o presente',
    body:
      'Respire uma vez antes de avançar. O objetivo desta página não é te consertar; é te devolver presença suficiente para continuar sem se abandonar.',
  },
};

export default function ReaderShell({
  title,
  chapterLabel = 'Livro',
  summary,
  pages,
  pageIndex,
  setPageIndex,
  fontSize,
  globalPage,
  totalBookPages,
  chapterPage,
  chapterPageTotal,
  chapterIndex,
  chapterTotal,
  chapterKind = 'Livro',
  coverImageUrl,
  audioUrl,
  pdfUrl,
  playAudio,
  isFavorite,
  onToggleFavorite,
  onFontIncrease,
  onFontDecrease,
  onOpenPdf,
  onShare,
}: Props) {
  const [mode, setMode] = useState<'text' | 'pdf'>('text');
  const [lens, setLens] = useState<MentorLens>('contraponto');
  const currentPage = pages[pageIndex] ?? [];
  const progress = Math.round(((pageIndex + 1) / Math.max(1, pages.length)) * 100);
  const bookProgress = totalBookPages && globalPage ? Math.round((globalPage / totalBookPages) * 100) : progress;

  const pageLead = useMemo(() => {
    const text = currentPage.join(' ');
    return text.length > 210 ? `${text.slice(0, 210).trim()}...` : text;
  }, [currentPage]);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
  }, []);

  const goPrevious = () => setPageIndex(Math.max(0, pageIndex - 1));
  const goNext = () => setPageIndex(Math.min(Math.max(0, pages.length - 1), pageIndex + 1));

  return (
    <section className="reader-stage">
      <div className="reader-topbar">
        <div className="min-w-0">
          <p className="kicker">{chapterLabel}</p>
          <h2 className="reader-title">{title}</h2>
        </div>

        <div className="reader-actions" aria-label="Controles do leitor">
          <div className="segmented-control" role="tablist" aria-label="Modo de leitura">
            <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
              <Highlighter size={16} />
              <span>Texto</span>
            </button>
            <button className={mode === 'pdf' ? 'active' : ''} onClick={() => setMode('pdf')}>
              <FileText size={16} />
              <span>PDF</span>
            </button>
          </div>
          <button className="icon-button" onClick={onToggleFavorite} title={isFavorite ? 'Remover favorito' : 'Adicionar favorito'}>
            <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-button" onClick={onShare} title="Compartilhar capítulo">
            <Share2 size={18} />
          </button>
          <button className="icon-button" onClick={onOpenPdf} title="Baixar PDF">
            <DownloadCloud size={18} />
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div className="reader-grid">
          <article className="kindle-surface">
            <div className="book-meta">
              <span>Página {globalPage ?? pageIndex + 1} de {totalBookPages ?? Math.max(1, pages.length)}</span>
              <span>{chapterKind} · {chapterPage ?? pageIndex + 1}/{chapterPageTotal ?? Math.max(1, pages.length)}</span>
              <span>{bookProgress}% do livro</span>
            </div>

            {pageIndex === 0 && (
              <div className="chapter-coverlet">
                <div
                  className="chapter-cover-art"
                  style={coverImageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(6, 7, 8, 0.08), rgba(6, 7, 8, 0.76)), url(${coverImageUrl})` } : undefined}
                />
                <div className="chapter-cover-copy">
                  <p className="kicker">{chapterKind}</p>
                  <h1>{title}</h1>
                  <span>Seção {(chapterIndex ?? 0) + 1} de {chapterTotal ?? 1}</span>
                </div>
              </div>
            )}

            <div className="page-copy" style={{ fontSize: `${fontSize}px` }}>
              {currentPage.map((paragraph, index) => (
                <p key={`${pageIndex}-${index}`}>{paragraph}</p>
              ))}
            </div>

            <div className="reader-footer">
              <button className="page-button" onClick={goPrevious} disabled={pageIndex === 0} title="Página anterior">
                <ChevronLeft size={20} />
              </button>
              <div className="progress-track reader-global-progress" aria-label={`Progresso do livro ${bookProgress}%`}>
                <span style={{ width: `${bookProgress}%` }} />
              </div>
              <button className="page-button" onClick={goNext} disabled={pageIndex >= pages.length - 1} title="Próxima página">
                <ChevronRight size={20} />
              </button>
            </div>
          </article>

          <aside className="mentor-panel" aria-label="Mentor de leitura">
            <div className="mentor-header">
              <div className="mentor-mark">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="kicker">Mentor de leitura</p>
                <h3>Contrapontos para continuar</h3>
              </div>
            </div>

            <div className="mentor-tabs">
              {(Object.keys(mentorCopy) as MentorLens[]).map((item) => (
                <button key={item} className={lens === item ? 'active' : ''} onClick={() => setLens(item)}>
                  {mentorCopy[item].label}
                </button>
              ))}
            </div>

            <div className="mentor-card">
              <p className="mentor-card-title">{mentorCopy[lens].title}</p>
              <p>{mentorCopy[lens].body}</p>
            </div>

            <div className="mentor-card quiet">
              <p className="mentor-card-title">Trecho em foco</p>
              <p>{pageLead || summary || 'Escolha uma página para receber um contraponto de leitura.'}</p>
            </div>

            <div className="reader-toolrow">
              <button className="tool-button" onClick={onFontDecrease} title="Diminuir fonte">
                <Minus size={16} />
              </button>
              <span>{fontSize}px</span>
              <button className="tool-button" onClick={onFontIncrease} title="Aumentar fonte">
                <Plus size={16} />
              </button>
              {audioUrl && (
                <button className="listen-button" onClick={() => playAudio(audioUrl, title)}>
                  <Headphones size={16} />
                  Ouvir
                </button>
              )}
            </div>

            <button className="mentor-message" type="button">
              <MessageCircle size={16} />
              Perguntar ao mentor
            </button>
          </aside>
        </div>
      ) : (
        <div className="pdf-frame">
          {pdfUrl ? (
            <iframe title={`PDF ${title}`} src={pdfUrl} />
          ) : (
            <div>PDF não disponível</div>
          )}
        </div>
      )}
    </section>
  );
}
