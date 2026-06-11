/// <reference types="vite/client" />
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, Home, Library, Headphones, Settings, Play, Pause, X, 
  ChevronRight, ChevronDown, ChevronLeft, AlertTriangle, Shield, Search, 
  Sun, Moon, ZoomIn, ZoomOut, Bookmark, LayoutGrid, Heart, Users, Cloud, 
  Briefcase, Zap, Anchor, Sparkles, CircleDashed, AlertCircle, RefreshCw, 
  Ghost, Flame, UserX, TrendingDown, Wind, Gauge, Lock, Key, HeartHandshake, 
  CloudRain, Activity, ArrowRightCircle, Coins, History, Share2, 
  MoreHorizontal, AlignJustify, List, FileDown, Wifi, WifiOff,
  Instagram, Send, Smartphone, Globe, PenTool, Music, Volume2, VolumeX, Mic, Info, Trash2
} from 'lucide-react';

// --- IMPORT DOS DADOS ---
import { bookContent as rawBookContent } from "./src/data/livro";

// --- 1. CONFIGURAÇÃO ---
// URL RELATIVA (Funciona no Localhost e no Servidor se a pasta 'media' estiver em 'public')
const BASE_MEDIA_URL = '/media/audio';
const VALID_ACCESS_TOKENS = ['OPDDS-2026', 'DESACREDITADOS', 'VIP-ALMA', 'DEMO123'];

// --- PALETA GOLD METALIC (Linear Gradient) ---
const GOLD_GRADIENT = "bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]";
const GOLD_TEXT = "text-[#bf953f]"; 
const GOLD_BORDER = "border-[#bf953f]/40";
const GOLD_BG_SUBTLE = "bg-[#bf953f]/10";

const ROUTES = {
  ACCESS: 'access', ONBOARDING: 'onboarding', HOME: 'home', BOOK: 'book',
  LIBRARY: 'library', SESSIONS: 'sessions', IGENT: 'igent', FAVORITES: 'favorites',
  HISTORY: 'history', MANIFESTO: 'manifesto', CONFIG: 'config'
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];

interface AudioState {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  progress: number;
  volume: number;
  isMuted: boolean;
}

// --- 2. MAPEAMENTO DE PASTAS ---
const FOLDER_MAP: Record<number, string> = {
  0: 'prefacio', 1: 'introducao', 2: 'pilar-01-vinculo', 3: 'pilar-02-familia',
  4: 'pilar-03-luto', 5: 'pilar-04-trabalho', 6: 'pilar-05-dor', 7: 'pilar-06-desejo',
  8: 'pilar-07-fe', 9: 'pilar-08-escassez', 10: 'pilar-09-vazio', 11: 'carta-final', 12: 'epilogo'
};

const BOOK_CONTENT = rawBookContent.map((chapter: any, index: number) => {
  const folder = FOLDER_MAP[index];
  let audios = [];
  
  // LÓGICA CORRIGIDA PARA SEUS ARQUIVOS (p1-1.mp3, p2-1.mp3...)
  // O índice 2 do array corresponde ao Pilar 1. O índice 3 ao Pilar 2, etc.
  if (index >= 2 && index <= 10) {
    const pilarNum = index - 1; // Ex: Index 2 -> Pilar 1
    audios = [
      { title: "1. Introdução", url: `${BASE_MEDIA_URL}/livro/${folder}/p${pilarNum}-1.mp3` },
      { title: "2. Aprofundamento", url: `${BASE_MEDIA_URL}/livro/${folder}/p${pilarNum}-2.mp3` },
      { title: "3. Prática", url: `${BASE_MEDIA_URL}/livro/${folder}/p${pilarNum}-3.mp3` },
      { title: "4. Integração", url: `${BASE_MEDIA_URL}/livro/${folder}/p${pilarNum}-4.mp3` }
    ];
  } else {
    // Capítulos normais
    audios = [{ title: "Ouvir Capítulo", url: `${BASE_MEDIA_URL}/livro/${folder}/audio.mp3` }];
  }

  return {
    id: `ch-${index}`,
    index: index,
    title: chapter.title,
    content: chapter.content || ["Conteúdo carregando..."],
    audios: audios
  };
});

const LIBRARY_THEMES = [
  { id: 'vinculo', title: 'Vínculo', icon: HeartHandshake, folder: 'pilar-01-vinculo', pilarNum: 1, desc: 'A necessidade de pertencer.' },
  { id: 'familia', title: 'Família', icon: Users, folder: 'pilar-02-familia', pilarNum: 2, desc: 'Lealdades invisíveis.' },
  { id: 'luto', title: 'Luto', icon: CloudRain, folder: 'pilar-03-luto', pilarNum: 3, desc: 'O que não volta.' },
  { id: 'trabalho', title: 'Trabalho', icon: Briefcase, folder: 'pilar-04-trabalho', pilarNum: 4, desc: 'Produção vs Valor.' },
  { id: 'dor', title: 'Dor', icon: Activity, folder: 'pilar-05-dor', pilarNum: 5, desc: 'O mensageiro ignorado.' },
  { id: 'desejo', title: 'Desejo', icon: Flame, folder: 'pilar-06-desejo', pilarNum: 6, desc: 'A força da mudança.' },
  { id: 'fe', title: 'Fé', icon: Sparkles, folder: 'pilar-07-fe', pilarNum: 7, desc: 'Sustentar a dúvida.' },
  { id: 'escassez', title: 'Escassez', icon: Coins, folder: 'pilar-08-escassez', pilarNum: 8, desc: 'O estado de urgência.' },
  { id: 'vazio', title: 'Vazio', icon: CircleDashed, folder: 'pilar-09-vazio', pilarNum: 9, desc: 'O lugar da criação.' },
].map(t => ({
  ...t,
  // Mapeia a tríade para os áudios do pilar (Consciência, Julgamento, Presença)
  // Usando os arquivos pX-1, pX-2, pX-3 que já existem na pasta do livro
  triad: [
    { label: "CONSCIÊNCIA", icon: Sparkles, color: "text-[#bf953f]", bg: "bg-[#bf953f]/10", border: "border-[#bf953f]/20", url: `${BASE_MEDIA_URL}/livro/${t.folder}/p${t.pilarNum}-1.mp3` },
    { label: "JULGAMENTO", icon: AlertCircle, color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", border: "border-[#d4af37]/20", url: `${BASE_MEDIA_URL}/livro/${t.folder}/p${t.pilarNum}-2.mp3` },
    { label: "PRESENÇA", icon: Anchor, color: "text-[#aa8c49]", bg: "bg-[#aa8c49]/10", border: "border-[#aa8c49]/20", url: `${BASE_MEDIA_URL}/livro/${t.folder}/p${t.pilarNum}-3.mp3` }
  ]
}));

// NOMES CORRIGIDOS (SEM .MP3, POIS O CÓDIGO ADICIONA)
const ONBOARDING_STEPS = [
  { title: "Limites", desc: "Este app não é terapia. É um espaço de acolhimento.", audio: "01-limites" },
  { title: "A Tríade", desc: "Consciência, Julgamento e Presença.", audio: "02-triade" },
  { title: "Expectativas", desc: "Não prometemos cura, prometemos companhia.", audio: "03-expectativas" },
  { title: "Crise", desc: "Em risco? Ligue 188 (CVV).", audio: "04-quando-nao-usar", isWarning: true },
  { title: "Portas", desc: "Livro, Biblioteca, Sessões e iGent. Escolha seu caminho.", audio: "05-portas" },
  { title: "Entrada", desc: "Use com consciência. Sem dependência.", audio: "06-entrada" },
];

const PRESENCE_DATA = [
  { id: 'pres-1', title: 'Voz 1', desc: 'Guiamento suave', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz1.mp3`, type: 'session' },
  { id: 'pres-2', title: 'Voz 2', desc: 'Guiamento médio', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz2.mp3`, type: 'session' },
  { id: 'pres-3', title: 'Voz 3', desc: 'Guiamento profundo', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz3.mp3`, type: 'session' }
];

const IGENT_TOPICS = [
  { id: 'culpa', label: 'Culpa', icon: AlertCircle, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'culpa' },
  { id: 'recaida', label: 'Recaída', icon: RefreshCw, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'recaida' },
  { id: 'luto', label: 'Luto', icon: Cloud, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'luto' },
  { id: 'desejo', label: 'Desejo', icon: Flame, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'desejo' },
  { id: 'fe', label: 'Fé', icon: Ghost, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'fe' },
  { id: 'solidao', label: 'Solidão', icon: UserX, color: GOLD_TEXT, border: GOLD_BORDER, bg: GOLD_BG_SUBTLE, audio: 'solidao' },
];

// --- UTILS & COMPONENTS ---

const playUISound = (type: 'click' | 'success' | 'toggle') => { try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); if (type === 'click') { osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05); } gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); osc.start(); osc.stop(ctx.currentTime + 0.05); } catch(e){} };
const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert("Link copiado!"); };

const GlassCard = ({ children, className = '', onClick }: any) => (
  <div onClick={(e) => { if(onClick) { playUISound('click'); onClick(e); } }} className={`glass-panel rounded-xl p-5 border border-white/5 shadow-lg backdrop-blur-md bg-white/5 transition-all duration-300 ${onClick ? `cursor-pointer hover:bg-white/10 hover:border-[#bf953f]/30 active:scale-[0.98]` : ''} ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }: any) => {
  const styles: any = { 
    primary: `${GOLD_GRADIENT} text-black font-bold shadow-lg shadow-[#bf953f]/20 border border-[#bf953f]/40`,
    secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-[#bf953f]/50", 
    ghost: `bg-transparent text-zinc-500 hover:${GOLD_TEXT}`,
    danger: "bg-red-900/20 text-red-400 border border-red-500/30 hover:bg-red-900/40"
  };
  return (<button onClick={(e) => { playUISound('click'); onClick && onClick(e); }} className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${styles[variant] || styles.primary} ${className}`}>{Icon && <Icon size={18} />} {children}</button>);
};

const AmbientPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio(`${BASE_MEDIA_URL}/ambient-loop.mp3`);
    audioRef.current.loop = true; audioRef.current.volume = 0.2;
    return () => { if(audioRef.current) audioRef.current.pause(); };
  }, []);
  const toggle = () => { if(!audioRef.current) return; if(isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(()=>{}); setIsPlaying(!isPlaying); };
  return null;
};

// --- TELAS ---

const AccessGate = ({ onAccessGranted }: any) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const handleValidate = () => { if (VALID_ACCESS_TOKENS.includes(token.trim().toUpperCase())) onAccessGranted(); else setError(true); };
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-[#050505] animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#bf953f]/10 via-transparent to-transparent opacity-40"></div>
      <div className="relative z-10 w-full max-w-sm text-center space-y-8">
        <div>
          <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl border-2 ${GOLD_BORDER} bg-black/50 backdrop-blur p-2`}>
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain opacity-90"/>
          </div>
          <h1 className={`text-3xl font-serif font-bold text-zinc-900 dark:${GOLD_TEXT} mb-2 tracking-wide`}>O PODER</h1>
          <p className="text-zinc-500 text-sm font-serif italic">"O fim é o começo."</p>
        </div>
        <div className="space-y-4">
           <input type="text" value={token} onChange={(e) => { setToken(e.target.value); setError(false); }} className={`w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-4 px-4 text-center text-zinc-900 dark:text-[#bf953f] uppercase tracking-[0.2em] font-mono shadow-sm focus:border-[#bf953f] outline-none transition-colors`} placeholder="TOKEN"/>
           {error && <div className="text-red-500 text-xs flex items-center justify-center gap-2"><AlertCircle size={14} /> Token inválido.</div>}
           <Button onClick={handleValidate} className="w-full">ENTRAR</Button>
        </div>
      </div>
    </div>
  );
};

const OnboardingModal = ({ onComplete, playAudio }: any) => {
  const [step, setStep] = useState(0);
  const data = ONBOARDING_STEPS[step];
  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
      <div className={`w-full max-w-md bg-[#0a0a0a] border ${GOLD_BORDER} rounded-2xl p-8 shadow-[0_0_40px_-10px_rgba(191,149,63,0.2)] relative overflow-hidden`}>
        <div className="flex justify-between items-center mb-6"><span className={`text-xs font-mono ${GOLD_TEXT} uppercase tracking-widest`}>Passo {step + 1}/{ONBOARDING_STEPS.length}</span>{data.isWarning && <AlertTriangle className="text-red-500 animate-pulse" size={20} />}</div>
        <h2 className="text-3xl font-serif text-white mb-4 leading-tight">{data.title}</h2>
        <p className="text-zinc-400 text-lg leading-relaxed mb-8">{data.desc}</p>
        {data.isWarning && (<div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"><p className="text-red-400 text-sm font-bold mb-1">Recurso de Emergência</p><p className="text-red-500 text-2xl font-bold">Ligue 188 (CVV)</p></div>)}
        <div className="space-y-3">
          <Button variant="secondary" onClick={() => playAudio(`${BASE_MEDIA_URL}/onboarding/${data.audio}.mp3`, data.title)} className="w-full justify-between group"><span>Ouvir Explicação</span> <Play size={16} className={`group-hover:translate-x-1 transition-transform ${GOLD_TEXT}`}/></Button>
          <Button variant={data.isWarning ? 'danger' : 'primary'} onClick={() => step < ONBOARDING_STEPS.length - 1 ? setStep(step + 1) : onComplete()} className="w-full">{step === ONBOARDING_STEPS.length - 1 ? 'Acessar o App' : 'Continuar'}</Button>
        </div>
        <div className="flex gap-1 mt-8">{ONBOARDING_STEPS.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-[#bf953f]' : 'bg-zinc-800'}`} />))}</div>
      </div>
    </div>
  );
};

const AudioPlayerBar = ({ state, togglePlay, setVolume, setMuted, close }: any) => {
  if (!state.currentUrl) return null;
  return (
    <div className={`fixed bottom-0 left-0 right-0 w-full bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-zinc-200 dark:${GOLD_BORDER} p-4 z-[100] animate-slide-up shadow-2xl`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className={`w-12 h-12 rounded-lg ${GOLD_GRADIENT} flex-shrink-0 flex items-center justify-center shadow-lg animate-pulse`}><Music size={18} className="text-black" /></div>
          <div className="min-w-0"><p className={`text-[10px] ${GOLD_TEXT} font-bold uppercase tracking-wider`}>Tocando Agora</p><p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{state.title}</p></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 group"><button onClick={() => setMuted(!state.isMuted)} className="text-zinc-400 hover:text-white">{state.isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button><input type="range" min="0" max="1" step="0.01" value={state.volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#bf953f]"/></div>
           <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white dark:bg-white text-black shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">{state.isPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor" className="ml-1"/>}</button>
           <button onClick={close} className="p-2 text-zinc-400 hover:text-red-400"><X size={24}/></button>
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800"><div className="h-full bg-[#bf953f] transition-all duration-300 shadow-[0_0_10px_#bf953f]" style={{ width: `${state.progress}%` }}></div></div>
    </div>
  );
};

const HomeView = ({ playAudio, navigate }: any) => {
  const lastChapter = parseInt(localStorage.getItem('opd_ch_idx') || '0');
  const chapter = BOOK_CONTENT[lastChapter];
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in pb-32">
      <header className="mt-4"><h1 className="text-3xl font-serif text-zinc-900 dark:text-white mb-1">Olá, Sobrevivente.</h1><p className="text-zinc-500 dark:text-zinc-400">Sua jornada continua.</p></header>
      <div className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl border ${GOLD_BORDER}`} onClick={() => navigate(ROUTES.BOOK)}>
        <img src="/capa.png" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" alt="Capa" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="relative p-6 flex items-center justify-between z-10">
           <div><span className={`text-xs font-bold ${GOLD_TEXT} uppercase tracking-wider mb-1 block`}>Continuar Leitura</span><h3 className="text-xl font-serif font-bold text-white mb-1">{chapter?.title || "Início"}</h3><p className="text-sm text-zinc-400">Toque para abrir onde parou</p></div>
           <div className={`w-12 h-12 rounded-full ${GOLD_GRADIENT} text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}><BookOpen size={24} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[ { t: 'Sobrevivência', file: 'sobrevivencia', i: AlertTriangle }, { t: 'Reconstrução', file: 'reconstrucao', i: RefreshCw }, { t: 'Continuidade', file: 'continuidade', i: Anchor } ].map((s, i) => (
          <GlassCard key={i} onClick={() => playAudio(`${BASE_MEDIA_URL}/home/${s.file}.wav`, s.t)} className={`flex items-center gap-4 hover:bg-white/5 group cursor-pointer border-l-4 border-l-transparent hover:border-l-[#bf953f]`}>
             <div className={`p-4 rounded-full ${GOLD_BG_SUBTLE} ${GOLD_TEXT} group-hover:scale-110 transition-transform`}><s.i size={24}/></div>
             <div><h3 className="font-bold text-zinc-900 dark:text-white text-lg">{s.t}</h3><p className="text-sm text-zinc-500">Áudio de apoio.</p></div>
             <Play size={20} className={`ml-auto text-zinc-600 dark:text-zinc-400 group-hover:${GOLD_TEXT}`} />
          </GlassCard>
        ))}
      </div>
      <Button className="w-full" icon={BookOpen} onClick={() => navigate(ROUTES.BOOK)}>Meus Livros</Button>
    </div>
  );
};

const LibraryView = ({ playAudio, toggleFavorite, isFavorite }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in pb-32">
      <h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6">Biblioteca</h2>
      <div className="space-y-4">
        {LIBRARY_THEMES.map(theme => (
          <div key={theme.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === theme.id ? `bg-zinc-50 dark:bg-zinc-900 border-[#bf953f]/50 shadow-xl` : `bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-[#bf953f]/30`}`}>
             <div onClick={() => setExpandedId(expandedId === theme.id ? null : theme.id)} className="p-5 flex items-center gap-4 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${GOLD_BG_SUBTLE} ${GOLD_TEXT}`}><theme.icon size={24} /></div>
                <div className="flex-1"><h3 className="font-bold text-zinc-900 dark:text-white text-lg">{theme.title}</h3><p className="text-sm text-zinc-500">{theme.desc}</p></div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(theme); }} className={`p-2 rounded-full hover:bg-white/10 ${isFavorite(theme.id) ? 'text-rose-500' : `text-zinc-400 hover:${GOLD_TEXT}`}`}><Heart size={20} fill={isFavorite(theme.id) ? "currentColor" : "none"} /></button>
                  <ChevronDown className={`text-zinc-400 transition-transform ${expandedId === theme.id ? `rotate-180 ${GOLD_TEXT}` : ''}`} />
                </div>
             </div>
             {expandedId === theme.id && (
               <div className="px-5 pb-5 pt-0 grid grid-cols-1 gap-3 animate-slide-down">
                 {theme.triad.map((item) => (
                   <button key={item.label} onClick={() => playAudio(item.url, `${theme.title}: ${item.label}`)} className={`flex items-center justify-between p-3 rounded-lg border ${item.border} ${item.bg} hover:brightness-110 transition-all group`}>
                      <div className="flex items-center gap-3">
                         <item.icon size={16} className={item.color} />
                         <span className={`text-xs font-bold ${item.color}`}>{item.label}</span>
                      </div>
                      <Play size={14} className={`${item.color} opacity-80`} />
                   </button>
                 ))}
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BookManager = ({ playAudio, audioState }: any) => {
  const [viewMode, setViewMode] = useState<'cover' | 'grid' | 'read'>('cover');
  const [chapterIdx, setChapterIdx] = useState(() => parseInt(localStorage.getItem('opd_ch_idx') || '0'));
  const [subPageIdx, setSubPageIdx] = useState(() => parseInt(localStorage.getItem('opd_page_idx') || '0'));
  const [fontSize, setFontSize] = useState(18);
  const [showNotes, setShowNotes] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>(() => JSON.parse(localStorage.getItem('opd_book_bookmarks') || '[]'));
  const [notes, setNotes] = useState<any>({});

  const currentChapter = BOOK_CONTENT[chapterIdx] || BOOK_CONTENT[0];
  const isPlaying = audioState.isPlaying && audioState.currentUrl === currentChapter.audioUrl;

  const paginatedText = useMemo(() => {
    const text = currentChapter.content;
    const pages = []; let currentPage = []; let charCount = 0; const limit = 550; 
    for (const p of text) { if(charCount + p.length > limit && currentPage.length > 0) { pages.push(currentPage); currentPage = []; charCount = 0; } currentPage.push(p); charCount += p.length; }
    if(currentPage.length > 0) pages.push(currentPage); return pages.length > 0 ? pages : [["..."]];
  }, [currentChapter]);

  useEffect(() => { localStorage.setItem('opd_ch_idx', chapterIdx.toString()); }, [chapterIdx]);
  useEffect(() => { localStorage.setItem('opd_page_idx', subPageIdx.toString()); }, [subPageIdx]);
  
  const toggleBookmark = () => { setBookmarks(prev => prev.includes(chapterIdx) ? prev.filter(b => b !== chapterIdx) : [...prev, chapterIdx]); playUISound('success'); };
  const changeChapter = (idx: number) => { setChapterIdx(idx); setSubPageIdx(0); setViewMode('read'); playUISound('click'); };
  const nextPage = () => { playUISound('click'); if(subPageIdx < paginatedText.length-1) setSubPageIdx(s=>s+1); else if(chapterIdx < BOOK_CONTENT.length-1) changeChapter(chapterIdx+1); };
  const prevPage = () => { playUISound('click'); if(subPageIdx > 0) setSubPageIdx(s=>s-1); else if(chapterIdx > 0) changeChapter(chapterIdx-1); };
  const generatePDF = () => { playUISound('success'); alert("Gerando PDF do capítulo..."); };
  const saveNote = () => { playUISound('success'); setShowNotes(false); };

  if (viewMode === 'cover') return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#bf953f]/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>
        <div className={`w-64 aspect-[2/3] rounded-sm shadow-2xl mb-8 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden border-2 ${GOLD_BORDER}`} onClick={() => setViewMode('read')}>
            <img src="/capa.png" alt="Capa" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-0 right-0 text-center"><h1 className="font-serif text-white text-2xl font-bold tracking-wider">O PODER</h1></div>
        </div>
        <div className="space-y-3 w-full max-w-xs relative z-10"><Button onClick={() => setViewMode('read')} className="w-full" icon={BookOpen}>Ler Agora</Button><Button variant="secondary" onClick={() => alert("Baixado")} className="w-full" icon={FileDown}>Baixar Livro</Button><Button variant="ghost" onClick={() => setViewMode('grid')} className="w-full" icon={LayoutGrid}>Ver os 9 Pilares</Button></div>
    </div>
  );

  if (viewMode === 'grid') return (<div className="h-full overflow-y-auto p-6 animate-fade-in pb-24"><button onClick={() => setViewMode('cover')} className="flex items-center gap-2 text-zinc-500 mb-6 hover:text-white"><ChevronLeft size={20}/> Voltar</button><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6">Os 9 Pilares</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{LIBRARY_THEMES.map((theme) => (<div key={theme.id} onClick={() => changeChapter(rawBookContent.findIndex(c => c.title.includes(theme.title)))} className={`p-4 rounded-xl border ${theme.border} bg-white/5 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-white/10 active:scale-95 transition-all aspect-square hover:${GOLD_BORDER}`}><theme.icon size={28} className={theme.color} /><span className={`text-sm font-bold ${theme.color}`}>{theme.title}</span></div>))}</div></div>);

  return (
    <div className="h-full flex flex-col bg-[#f5f5f0] dark:bg-[#111] transition-colors relative">
      <div className="flex items-center justify-between p-3 border-b border-zinc-300 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur sticky top-0 z-20 shadow-sm">
         <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={() => setShowTOC(!showTOC)}><List size={20} className={`text-zinc-500 hover:${GOLD_TEXT}`}/><div><p className="text-[10px] font-bold text-zinc-400 uppercase">Capítulo {chapterIdx+1}</p><p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">{currentChapter.title}</p></div></div>
         <div className="flex items-center gap-2"><button onClick={toggleBookmark} className={`p-2 rounded hover:bg-black/5 ${bookmarks.includes(chapterIdx) ? 'text-amber-500' : `text-zinc-400 hover:${GOLD_TEXT}`}`}><Bookmark size={18} fill={bookmarks.includes(chapterIdx) ? "currentColor" : "none"}/></button><button onClick={() => setShowNotes(!showNotes)} className={`p-2 text-zinc-400 hover:${GOLD_TEXT} hover:bg-black/5 rounded`}><PenTool size={18}/></button><button onClick={generatePDF} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-black/5 rounded"><FileDown size={18}/></button><div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div><button onClick={() => { setFontSize(f=>f-2); playUISound('click'); }} className="p-2 text-zinc-500 hover:bg-black/5 rounded"><ZoomOut size={16}/></button><button onClick={() => { setFontSize(f=>f+2); playUISound('click'); }} className="p-2 text-zinc-500 hover:bg-black/5 rounded"><ZoomIn size={16}/></button></div>
      </div>
      <div className="flex-1 overflow-hidden flex justify-center items-start p-4 md:p-8 bg-[#e8e8e3] dark:bg-[#0a0a0a]">
         <div className={`w-full max-w-2xl bg-white dark:bg-[#1a1a1a] shadow-2xl rounded-sm border-l-4 border-zinc-300 dark:border-zinc-800 h-full flex flex-col transition-all duration-300 ${showNotes ? 'mr-80' : ''}`}>
            <div className="p-6 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-end"><h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white leading-tight">{currentChapter.title}</h2></div>
            {currentChapter.audios && (
              <div className="px-6 py-4 grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900/30">
                {currentChapter.audios.map((a: any, i: number) => (<button key={i} onClick={() => playAudio(a.url, a.title)} className={`flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-[#bf953f] transition-all group`}><div className={`w-6 h-6 rounded-full ${GOLD_BG_SUBTLE} ${GOLD_TEXT} flex items-center justify-center text-xs font-bold`}>{i+1}</div><span className={`text-[10px] font-medium text-zinc-600 dark:text-zinc-300 line-clamp-1 group-hover:${GOLD_TEXT}`}>{a.title}</span></button>))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 md:p-10"><div className="font-serif text-zinc-800 dark:text-zinc-300 text-justify leading-relaxed transition-all" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>{paginatedText[subPageIdx]?.map((p: string, i: number) => <p key={i} className="mb-4 animate-fade-in">{p}</p>)}</div></div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center text-zinc-400 text-xs font-mono"><span>O Poder dos Desacreditados</span><span>{subPageIdx + 1} / {paginatedText.length}</span></div>
         </div>
      </div>
      {showNotes && (<div className="absolute right-0 top-[60px] bottom-0 w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 z-30 animate-slide-left flex flex-col"><div className="flex justify-between items-center mb-6"><h3 className={`font-bold text-zinc-900 dark:text-white flex items-center gap-2`}><PenTool size={16} className={GOLD_TEXT}/> Reflexões</h3><button onClick={() => setShowNotes(false)}><X size={20}/></button></div><textarea className={`flex-1 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-[#bf953f] mb-4 font-serif leading-relaxed`} placeholder="O que isso te fez sentir?" value={notes[chapterIdx] || ''} onChange={e => setNotes({...notes, [chapterIdx]: e.target.value})}></textarea><Button onClick={saveNote}>Salvar Reflexão</Button></div>)}
      {showTOC && (<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-start" onClick={() => setShowTOC(false)}><div className="w-72 bg-white dark:bg-zinc-900 h-full overflow-y-auto animate-slide-right border-r border-zinc-800" onClick={e => e.stopPropagation()}><div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><h3 className="font-bold text-xl text-zinc-900 dark:text-white">Índice</h3><button onClick={() => setShowTOC(false)}><X/></button></div><div className="p-2">{BOOK_CONTENT.map((ch, i) => (<button key={i} onClick={() => changeChapter(i)} className={`w-full text-left p-4 rounded-lg mb-1 text-sm transition-all ${i === chapterIdx ? `${GOLD_GRADIENT} text-black shadow-lg` : `text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:${GOLD_TEXT}`}`}><span className="opacity-70 text-[10px] uppercase block mb-1">Capítulo {i+1}</span><span className="font-bold">{ch.title}</span></button>))}</div></div></div>)}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur p-2 rounded-full shadow-xl border border-zinc-200 dark:border-zinc-700 z-40"><button onClick={prevPage} className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 transition-colors hover:${GOLD_TEXT}`}><ChevronLeft size={20}/></button><div className="h-4 w-px bg-zinc-300 dark:bg-zinc-600"></div><button onClick={nextPage} className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors hover:${GOLD_TEXT}`}><ChevronRight size={20}/></button></div>
    </div>
  );
};

const ConfigView = ({ navigate, isDarkMode, setIsDarkMode }: any) => {
  return (<div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in"><div className="flex items-center gap-3 mb-6"><Settings className="text-zinc-900 dark:text-white" size={28} /><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Configurações</h2></div><section><h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Globe size={16}/> Comunidade</h3><div className="grid grid-cols-3 gap-3"><Button variant="ghost" className="flex-col h-auto py-4"><Send size={24} className="mb-2 text-blue-400"/><span className="text-xs">Telegram</span></Button><Button variant="ghost" className="flex-col h-auto py-4"><Smartphone size={24} className="mb-2 text-green-400"/><span className="text-xs">WhatsApp</span></Button><Button variant="ghost" className="flex-col h-auto py-4"><Instagram size={24} className="mb-2 text-pink-400"/><span className="text-xs">Instagram</span></Button></div></section><section><h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Settings size={16}/> Preferências</h3><div className="space-y-3"><GlassCard className="flex items-center justify-between"><span className="text-zinc-900 dark:text-white font-medium">Tema Escuro</span><button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#bf953f]' : 'bg-zinc-300'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} /></button></GlassCard></div></section><div className="text-center text-xs text-zinc-500 pt-8"><p>O Poder dos Desacreditados v2.0</p></div></div>);
};

const SessionsView = ({ playAudio }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Sessões Guiadas</h2></div><div className="space-y-3">{PRESENCE_DATA.map(item => (<GlassCard key={item.id} onClick={() => playAudio(item.audio, item.title)} className="flex items-center gap-4 cursor-pointer hover:bg-white/10"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600"><Wind size={20} /></div><div className="flex-1"><h3 className="font-medium text-zinc-900 dark:text-white">{item.title}</h3><p className="text-sm text-zinc-500">{item.desc}</p></div><Play size={20} className={`text-zinc-400 hover:${GOLD_TEXT}`} /></GlassCard>))}</div></div>);
const IGentView = ({ playAudio }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><div className="text-center mb-8"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">iGent</h2><p className="text-zinc-500">Inteligência de Gestão Emocional.</p></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{IGENT_TOPICS.map(topic => (<button key={topic.id} onClick={() => playAudio(topic.audio, `iGent: ${topic.label}`)} className={`p-4 rounded-xl border ${topic.border} ${topic.bg} flex flex-col items-center justify-center gap-3 hover:scale-105 active:scale-95 group transition-all hover:${GOLD_BORDER}`}><topic.icon size={24} className={topic.color} /><span className={`text-sm font-medium ${topic.color}`}>{topic.label}</span></button>))}</div></div>);
const FavoritesView = ({ favorites, toggleFavorite }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><Heart className="text-rose-500" fill="currentColor"/> Favoritos</h2>{favorites.length === 0 ? <p className="text-zinc-500">Nenhum favorito salvo.</p> : (<div className="space-y-3">{favorites.map((fav: any) => (<GlassCard key={fav.id} className="flex items-center justify-between"><div><h3 className="font-medium text-zinc-900 dark:text-white">{fav.title}</h3></div><button onClick={() => toggleFavorite(fav)} className="text-rose-500"><Trash2 size={18} /></button></GlassCard>))}</div>)}</div>);
const HistoryView = ({ history }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><History size={24}/> Histórico</h2>{!history?.length ? <p className="text-zinc-500">Vazio.</p> : (<div className="space-y-3">{history.map((h: any, i: number) => <div key={i} className="p-3 border-b border-zinc-200 dark:border-zinc-800">{h.title}</div>)}</div>)}</div>);
const ManifestoView = ({ playAudio }: any) => (<div className="p-8 max-w-2xl mx-auto text-center space-y-8 animate-fade-in"><Shield size={48} className="mx-auto text-zinc-400" /><h1 className="text-3xl font-serif text-zinc-900 dark:text-white">Manifesto Ético</h1><div className="text-left space-y-4 text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed"><p>1. Acreditamos na autonomia humana. Não criamos dependência.</p><p>2. Acreditamos na verdade da dor.</p><p>3. Acreditamos na tríade.</p></div><div className="flex justify-center gap-3"><Button onClick={() => playAudio(`${BASE_MEDIA_URL}/manifesto/manifesto-dia-v1.mp3`, 'Manifesto')}><Play size={18} /> Ouvir</Button></div></div>);

const Sidebar = ({ current, navigate, isMobile, toggleAmbient, isAmbientPlaying, toggleTheme, isDarkMode }: any) => {
  const menus = [
    { label: "Jornada", items: [{ id: ROUTES.HOME, icon: Home, label: 'Início' }, { id: ROUTES.BOOK, icon: BookOpen, label: 'Livro' }, { id: ROUTES.LIBRARY, icon: Library, label: 'Biblioteca' }] },
    { label: "Ferramentas", items: [{ id: ROUTES.SESSIONS, icon: Headphones, label: 'Sessões' }, { id: ROUTES.IGENT, icon: Zap, label: 'iGent' }] },
    { label: "Pessoal", items: [{ id: ROUTES.FAVORITES, icon: Heart, label: 'Favoritos' }, { id: ROUTES.CONFIG, icon: Settings, label: 'Ajustes' }] }
  ];

  if (isMobile) {
    return (
      <>
        <button onClick={toggleAmbient} className={`fixed top-4 left-4 z-[70] p-2 rounded-full border border-white/20 shadow-lg ${isAmbientPlaying ? `${GOLD_GRADIENT} text-black animate-pulse` : 'bg-white/10 backdrop-blur text-zinc-300'}`}><Music size={20}/></button>
        <button onClick={toggleTheme} className="fixed top-4 right-4 z-[70] p-2 rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg text-zinc-800 dark:text-white hover:scale-110 transition-transform">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
        <div className="fixed bottom-0 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 flex justify-around p-3 z-40 pb-safe">
          {[ROUTES.HOME, ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS].map(r => {
            const item = menus.flatMap((m:any) => m.items).find((i:any) => i.id === r);
            const active = current === r;
            return <button key={r} onClick={() => navigate(r)} className={`flex flex-col items-center gap-1 transition-colors ${active ? GOLD_TEXT : 'text-zinc-400'}`}>{item && <item.icon size={24} strokeWidth={active ? 2.5 : 2} />}<span className="text-[10px] font-medium">{item?.label}</span></button>
          })}
        </div>
      </>
    );
  }

  return (
    <div className="w-64 bg-zinc-50 dark:bg-[#09090b] h-screen border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-8"><div className={`w-8 h-8 rounded-lg ${GOLD_GRADIENT} flex items-center justify-center overflow-hidden`}><img src="/logo.png" alt="P" className="w-full h-full object-cover" onError={(e:any) => {e.target.style.display='none'; e.target.parentNode.textContent='P'}}/></div><span className="font-serif font-bold text-lg text-zinc-900 dark:text-white tracking-tight">O PODER</span></div>
        <div className="space-y-6">
          {menus.map((group, idx) => (
            <div key={idx}><p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{group.label}</p><div className="space-y-1">{group.items.map((item:any) => (<button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${current === item.id ? `${GOLD_BG_SUBTLE} ${GOLD_TEXT}` : `text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:${GOLD_TEXT}`}`}><item.icon size={18} className={`transition-transform group-hover:scale-110 ${current === item.id ? GOLD_TEXT : 'text-zinc-400'}`} />{item.label}</button>))}</div></div>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
        <button onClick={toggleAmbient} className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-colors ${isAmbientPlaying ? `${GOLD_GRADIENT} text-black` : `hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:${GOLD_TEXT}`}`} title="Música"><Music size={20}/></button>
        <button onClick={toggleTheme} className={`flex-1 p-2 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors hover:${GOLD_TEXT}`} title="Tema">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [route, setRoute] = useState<Route>(ROUTES.ACCESS);
  const [access, setAccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, currentUrl: null, title: null, progress: 0, volume: 1, isMuted: false });

  const toggleFavorite = (item: any) => { setFavorites(prev => { const exists = prev.find((f:any) => f.id === item.id); return exists ? prev.filter((f:any) => f.id !== item.id) : [...prev, item]; }); };
  const isFavorite = (id: string) => favorites.some((f:any) => f.id === id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    audioRef.current = new Audio();
    audioRef.current.addEventListener('timeupdate', () => setAudioState(p => ({ ...p, progress: (audioRef.current!.currentTime / audioRef.current!.duration) * 100 || 0 })));
    audioRef.current.addEventListener('ended', () => setAudioState(p => ({ ...p, isPlaying: false, progress: 100 })));
    ambientAudioRef.current = new Audio(`${BASE_MEDIA_URL}/ambient-loop.mp3`);
    ambientAudioRef.current.loop = true; ambientAudioRef.current.volume = 0.2;
    
    const onboarded = localStorage.getItem('opd_onboarding_complete');
    if (!onboarded && access) setShowOnboardingModal(true);

    const style = document.createElement('style');
    style.innerHTML = `.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: translateY(100%); } .animate-slide-down { animation: slideDown 0.3s ease-out forwards; opacity: 0; transform-origin: top; } .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; opacity: 0; transform: translateX(20px); } .animate-slide-right { animation: slideRight 0.3s ease-out forwards; opacity: 0; transform: translateX(0); } @keyframes fadeIn { to { opacity: 1; } } @keyframes slideUp { to { transform: translateY(0); } } @keyframes slideLeft { to { opacity: 1; transform: translateX(0); } } @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } } .hide-scrollbar::-webkit-scrollbar { display: none; } .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }`;
    document.head.appendChild(style);
    return () => { window.removeEventListener('resize', handleResize); };
  }, [access]);

  const toggleAmbient = () => { if(isAmbientPlaying) { ambientAudioRef.current?.pause(); } else { ambientAudioRef.current?.play().catch(()=>{}); } setIsAmbientPlaying(!isAmbientPlaying); };
  const playAudio = (url: string, title: string) => { if (!audioRef.current) return; if (audioState.currentUrl === url) { if (audioState.isPlaying) { audioRef.current.pause(); setAudioState(p => ({ ...p, isPlaying: false })); } else { audioRef.current.play().catch(console.error); setAudioState(prev => ({ ...prev, isPlaying: true })); } } else { audioRef.current.src = url; audioRef.current.play().catch(() => alert("Áudio indisponível.")); setAudioState({ isPlaying: true, currentUrl: url, title, progress: 0 }); } };
  const setVolume = (val: number) => { if(audioRef.current) { audioRef.current.volume = val; setAudioState(p => ({...p, volume: val})); } };
  const closeAudio = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setAudioState({ isPlaying: false, currentUrl: null, title: null, progress: 0 }); };
  const grantAccess = () => { localStorage.setItem('opd_access_granted', 'true'); setAccess(true); setRoute(ROUTES.HOME); setShowOnboardingModal(true); };
  const completeOnboarding = () => { localStorage.setItem('opd_onboarding_complete', 'true'); setShowOnboardingModal(false); };

  const renderView = () => {
    const props = { playAudio, navigate: setRoute, toggleFavorite, isFavorite, audioState, favorites, isDarkMode, setIsDarkMode, history: [] };
    if (!access) return <AccessGate onAccessGranted={grantAccess} />;
    switch (route) {
      case ROUTES.BOOK: return <BookManager {...props} />;
      case ROUTES.LIBRARY: return <LibraryView {...props} />;
      case ROUTES.SESSIONS: return <SessionsView {...props} />;
      case ROUTES.IGENT: return <IGentView {...props} />;
      case ROUTES.FAVORITES: return <FavoritesView {...props} favorites={favorites} />;
      case ROUTES.HISTORY: return <HistoryView {...props} />;
      case ROUTES.MANIFESTO: return <ManifestoView {...props} />;
      case ROUTES.CONFIG: return <ConfigView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} {...props} />;
      default: return <HomeView {...props} />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
        <div className="flex h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-500">
          <AmbientPlayer />
          {showOnboardingModal && <OnboardingModal onComplete={completeOnboarding} playAudio={playAudio} />}
          {access && !isMobile && <Sidebar current={route} navigate={setRoute} isMobile={false} toggleAmbient={toggleAmbient} isAmbientPlaying={isAmbientPlaying} toggleTheme={()=>setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />}
          <main className={`flex-1 flex flex-col h-full relative overflow-hidden ${showOnboardingModal ? 'blur-sm' : ''}`}>
            <div className="flex-1 overflow-y-auto scroll-smooth">{renderView()}</div>
            {access && isMobile && <Sidebar current={route} navigate={setRoute} isMobile={true} toggleAmbient={toggleAmbient} isAmbientPlaying={isAmbientPlaying} toggleTheme={()=>setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />}
            <AudioPlayerBar state={audioState} togglePlay={() => playAudio(audioState.currentUrl!, audioState.title!)} setVolume={setVolume} setMuted={(m: boolean) => { if(audioRef.current) audioRef.current.muted = m; setAudioState(p => ({...p, isMuted: m})); }} close={closeAudio} />
          </main>
        </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }