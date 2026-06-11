/// <reference types="vite/client" />
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, Home, Library, Headphones, MessageSquare, 
  Settings, Play, Pause, X, ChevronRight, ChevronDown, ChevronLeft,
  AlertTriangle, Shield, Search, Menu, 
  Sun, Moon, ZoomIn, ZoomOut, Bookmark, LayoutGrid,
  Heart, Users, Cloud, Briefcase, Zap, Anchor, Sparkles, CircleDashed,
  AlertCircle, RefreshCw, Ghost, Flame, UserX, TrendingDown, Wind, Gauge, Star,
  Lock, Key, Check, HeartHandshake, CloudRain, Activity, ArrowRightCircle, Coins,
  History, Share2, MoreHorizontal, AlignJustify, Clock, List, FileDown, Wifi, WifiOff,
  Instagram, Send, Trash2, Smartphone, Globe, PenTool, Music, Volume2, VolumeX, Mic, Info
} from 'lucide-react';

// --- IMPORT DOS DADOS ---
// Certifique-se que o arquivo src/data/livro/index.ts existe e exporta 'bookContent'
import { bookContent as rawBookContent } from "./src/data/livro";

// --- CONFIGURAÇÃO ---
const BASE_MEDIA_URL = 'https://opoderdosdesacreditados.online/media/audio';
const VALID_ACCESS_TOKENS = ['OPDDS-2026', 'DESACREDITADOS', 'VIP-ALMA', 'DEMO123'];

const ROUTES = {
  ACCESS: 'access', ONBOARDING: 'onboarding', HOME: 'home', BOOK: 'book',
  LIBRARY: 'library', SESSIONS: 'sessions', IGENT: 'igent', FAVORITES: 'favorites',
  HISTORY: 'history', MANIFESTO: 'manifesto', CONFIG: 'config'
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];

// Transforma o conteúdo do livro para o formato do App
const BOOK_CONTENT = rawBookContent.map((chapter: any, index: number) => ({
  id: `ch-${index}`,
  index: index,
  chapterNumber: index + 1,
  title: chapter.title,
  content: chapter.content || ["Conteúdo indisponível"], 
  audioUrl: chapter.audioUrl
}));

interface AudioState {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  progress: number;
  volume: number;
  isMuted: boolean;
}

// --- DADOS DA BIBLIOTECA (9 PILARES - 6 BLOCOS CADA) ---
// Estrutura ajustada para 6 áudios por pilar
const LIBRARY_THEMES = [
  { 
    id: 'culpa', title: 'Culpa', subtitle: 'Peso × Perdão', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'O peso do que foi feito.',
    blocks: [
      { id: 1, title: '1. A Consciência do Peso', audio: 'culpa/01' },
      { id: 2, title: '2. O Tribunal Interno', audio: 'culpa/02' },
      { id: 3, title: '3. A Sentença Injusta', audio: 'culpa/03' },
      { id: 4, title: '4. Responsabilidade vs Culpa', audio: 'culpa/04' },
      { id: 5, title: '5. O Perdão na Prática', audio: 'culpa/05' },
      { id: 6, title: '6. Soltando as Correntes', audio: 'culpa/06' },
    ]
  },
  { 
    id: 'recaida', title: 'Recaída', subtitle: 'Queda × Retomada', icon: RefreshCw, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Voltar não é o fim.',
    blocks: [
      { id: 1, title: '1. O Gatilho', audio: 'recaida/01' },
      { id: 2, title: '2. A Queda', audio: 'recaida/02' },
      { id: 3, title: '3. A Vergonha Tóxica', audio: 'recaida/03' },
      { id: 4, title: '4. Acolhimento', audio: 'recaida/04' },
      { id: 5, title: '5. Análise sem Julgamento', audio: 'recaida/05' },
      { id: 6, title: '6. Levantando Mais Forte', audio: 'recaida/06' },
    ]
  },
  { 
    id: 'luto', title: 'Luto', subtitle: 'Dor × Amor', icon: Cloud, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', desc: 'A dor da ausência.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `luto/0${i+1}` }))
  },
  { 
    id: 'desejo', title: 'Desejo', subtitle: 'Falta × Motor', icon: Flame, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', desc: 'A fome de viver.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `desejo/0${i+1}` }))
  },
  { 
    id: 'fe', title: 'Fé Quebrada', subtitle: 'Vazio × Sentido', icon: Ghost, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Quando o céu silencia.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `fe/0${i+1}` }))
  },
  { 
    id: 'solidao', title: 'Solidão', subtitle: 'Isolamento × Solitude', icon: UserX, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Estar só consigo.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `solidao/0${i+1}` }))
  },
  { 
    id: 'fracasso', title: 'Fracasso', subtitle: 'Erro × Lição', icon: TrendingDown, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', desc: 'O medo de errar.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `fracasso/0${i+1}` }))
  },
  { 
    id: 'ansiedade', title: 'Ansiedade', subtitle: 'Futuro × Agora', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'A mente que não para.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `ansiedade/0${i+1}` }))
  },
  { 
    id: 'pressao', title: 'Pressão', subtitle: 'Peso × Limite', icon: Gauge, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'A cobrança externa.',
    blocks: Array(6).fill(null).map((_, i) => ({ id: i+1, title: `${i+1}. Bloco de Aprofundamento`, audio: `pressao/0${i+1}` }))
  },
];

const ONBOARDING_STEPS = [
  { title: "Limites", desc: "Este app não é terapia. É um espaço de acolhimento.", audio: `${BASE_MEDIA_URL}/onboarding/01-limites.mp3` },
  { title: "A Tríade", desc: "Consciência, Julgamento e Presença.", audio: `${BASE_MEDIA_URL}/onboarding/02-triade.mp3` },
  { title: "Expectativas", desc: "Não prometemos cura, prometemos companhia.", audio: `${BASE_MEDIA_URL}/onboarding/03-expectativas.mp3` },
  { title: "Crise", desc: "Em risco? Ligue 188 (CVV).", audio: `${BASE_MEDIA_URL}/onboarding/04-quando-nao-usar.mp3`, isWarning: true },
];

const PRESENCE_DATA = [
  { id: 'pres-1', title: 'Voz 1', desc: 'Guiamento suave', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz1.mp3`, type: 'session' },
  { id: 'pres-2', title: 'Voz 2', desc: 'Guiamento médio', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz2.mp3`, type: 'session' },
  { id: 'pres-3', title: 'Voz 3', desc: 'Guiamento profundo', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz3.mp3`, type: 'session' }
];

const IGENT_TOPICS = [
  { id: 'culpa', label: 'Culpa', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/01-culpa.mp3` },
  { id: 'recaida', label: 'Recaída', icon: RefreshCw, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/02-recaida.mp3` },
  { id: 'luto', label: 'Luto', icon: Cloud, color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/03-luto.mp3` },
  { id: 'desejo', label: 'Desejo', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/04-desejo.mp3` },
  { id: 'fe', label: 'Fé Quebrada', icon: Ghost, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/05-fe-quebrada.mp3` },
  { id: 'solidao', label: 'Solidão', icon: UserX, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/06-solidao.mp3` },
  { id: 'fracasso', label: 'Fracasso', icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/07-fracasso.mp3` },
  { id: 'ansiedade', label: 'Ansiedade', icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/08-ansiedade.mp3` },
  { id: 'pressao', label: 'Pressão', icon: Gauge, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', audio: `${BASE_MEDIA_URL}/sessoes/micro/09-pressao.mp3` },
];

// --- SISTEMA DE SOM UI ---
const playUISound = (type: 'click' | 'success' | 'toggle' | 'hover') => { /* Mock */ };
const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert("Link copiado!"); };

// --- AMBIENT PLAYER (MÚSICA DE FUNDO) ---
const AmbientPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://opoderdosdesacreditados.online/media/audio/ambient-loop.mp3'); // URL fictícia, substitua pela real
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;
    return () => { if(audioRef.current) audioRef.current.pause(); };
  }, []);

  const toggle = () => {
    if(!audioRef.current) return;
    if(isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  return (
    <button onClick={toggle} className={`fixed bottom-24 right-4 z-40 p-3 rounded-full shadow-xl transition-all duration-500 ${isPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`} title="Música de Fundo">
      <Music size={20} />
    </button>
  );
};

// --- COMPONENTES BÁSICOS ---

const GlassCard = ({ children, className = '', onClick }: any) => (
  <div onClick={(e) => { if(onClick) { playUISound('click'); onClick(e); } }} className={`glass-panel rounded-xl p-5 border border-white/5 shadow-lg backdrop-blur-md bg-white/5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/10 hover:border-white/10 active:scale-[0.98]' : ''} ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }: any) => {
  const variants = { primary: "bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg", secondary: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700", ghost: "bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white" };
  return (<button onClick={(e) => { playUISound('click'); onClick && onClick(e); }} className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${variants[variant as keyof typeof variants] || variants.primary} ${className}`}>{Icon && <Icon size={18} />} {children}</button>);
};

const FavoriteButton = ({ isFavorite, onToggle }: any) => (<button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all ${isFavorite ? 'text-rose-500' : 'text-zinc-400'}`}><Heart size={20} fill={isFavorite ? "currentColor" : "none"} /></button>);
const ShareButton = ({ onClick }: any) => (<button onClick={(e) => { e.stopPropagation(); onClick(); }} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400"><Share2 size={20} /></button>);

// --- TELAS ---

const AccessGate = ({ onAccessGranted }: any) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const handleValidate = () => { if (VALID_ACCESS_TOKENS.includes(token.trim().toUpperCase())) onAccessGranted(); else setError(true); };
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-[#09090b] animate-fade-in">
      <div className="relative z-10 w-full max-w-sm text-center space-y-8">
        <div>
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 rounded-2xl flex items-center justify-center"><Lock className="text-white"/></div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-2">Bem-vindo</h1>
          <p className="text-zinc-500 text-sm">Insira o token recebido pelo autor no WhatsApp.</p>
        </div>
        <div className="space-y-4">
           <input type="text" value={token} onChange={(e) => { setToken(e.target.value); setError(false); }} className="w-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl py-4 px-4 text-center text-zinc-900 dark:text-white uppercase tracking-widest font-mono shadow-sm" placeholder="TOKEN"/>
           {error && <div className="text-red-500 text-xs flex items-center justify-center gap-2"><AlertCircle size={14} /> Token inválido.</div>}
           <Button onClick={handleValidate} className="w-full">Acessar Jornada</Button>
        </div>
      </div>
    </div>
  );
};

const AudioPlayerBar = ({ state, togglePlay, setVolume, setMuted, close }: any) => {
  if (!state.currentUrl) return null;
  return (
    <div className="fixed bottom-[70px] md:bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl z-50 animate-slide-up flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse"><Music size={18} className="text-white" /></div>
          <div className="min-w-0"><p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Tocando</p><p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{state.title}</p></div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setMuted(!state.isMuted)} className="p-2 text-zinc-400 hover:text-white">{state.isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button>
           <input type="range" min="0" max="1" step="0.01" value={state.volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden sm:block"/>
           <button onClick={close} className="p-2 text-zinc-400 hover:text-red-400"><X size={18}/></button>
        </div>
      </div>
      <div className="flex items-center gap-4"><div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${state.progress}%` }}></div></div></div>
      <div className="absolute -top-5 left-1/2 -translate-x-1/2"><button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white dark:bg-white text-black shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-zinc-100 dark:border-zinc-900">{state.isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}</button></div>
    </div>
  );
};

const Onboarding = ({ onComplete, playAudio }: any) => {
  const [step, setStep] = useState(0);
  const data = ONBOARDING_STEPS[step];
  return (
    <div className="h-full flex flex-col justify-between p-6 max-w-md mx-auto pt-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex justify-between items-center"><span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">PASSO {step + 1}/{ONBOARDING_STEPS.length}</span></div>
        <h1 className="text-3xl font-serif text-zinc-900 dark:text-white leading-tight">{data.title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">{data.desc}</p>
        <Button variant="secondary" onClick={() => playAudio(data.audio, data.title)} className="w-full justify-between group"><span>Ouvir Explicação</span><Play size={16} /></Button>
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex gap-1 h-1 mb-4">{ONBOARDING_STEPS.map((_, i) => (<div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />))}</div>
        <Button onClick={() => step < ONBOARDING_STEPS.length - 1 ? setStep(step + 1) : onComplete()} className="w-full">{step === ONBOARDING_STEPS.length - 1 ? 'Entrar no App' : 'Continuar'}</Button>
      </div>
    </div>
  );
};

const HomeView = ({ playAudio, navigate }: any) => {
  const lastChapter = parseInt(localStorage.getItem('opd_ch_idx') || '0');
  const chapter = BOOK_CONTENT[lastChapter];
  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in pb-32">
      <header className="mt-4"><h1 className="text-3xl font-serif text-zinc-900 dark:text-white mb-1">Olá, Sobrevivente.</h1><p className="text-zinc-500 dark:text-zinc-400">O que você precisa sustentar hoje?</p></header>
      
      {/* CARD CONTINUAR LEITURA */}
      <div className="relative group cursor-pointer" onClick={() => navigate(ROUTES.BOOK)}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
           <div><span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Continuar Leitura</span><h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">{chapter?.title || "Início"}</h3><p className="text-sm text-zinc-500">Toque para abrir</p></div>
           <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[ { t: 'Sobrevivência', d: 'Crise', c: 'rose', i: AlertTriangle }, { t: 'Reconstrução', d: 'Erguer', c: 'purple', i: RefreshCw }, { t: 'Continuidade', d: 'Manter', c: 'emerald', i: Anchor } ].map((s, i) => (
          <GlassCard key={i} onClick={() => playAudio(`${BASE_MEDIA_URL}/home/${s.t.toLowerCase()}.mp3`, s.t)} className="flex items-center gap-4 hover:bg-white/10 group">
             <div className={`p-3 rounded-full bg-${s.c}-500/10 text-${s.c}-500 group-hover:scale-110 transition-transform`}><s.i size={20}/></div>
             <div><h3 className="font-bold text-zinc-900 dark:text-white">{s.t}</h3><p className="text-xs text-zinc-500">{s.d}</p></div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const LibraryView = ({ playAudio, toggleFavorite, isFavorite }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in pb-32">
      <h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6">Biblioteca</h2>
      <div className="space-y-3">
        {LIBRARY_THEMES.map(theme => (
          <div key={theme.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === theme.id ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-lg' : 'bg-white dark:bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-600'}`}>
             <div onClick={() => setExpandedId(expandedId === theme.id ? null : theme.id)} className="p-4 flex items-center gap-4 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg} ${theme.color}`}><theme.icon size={24} /></div>
                <div className="flex-1"><h3 className="font-bold text-zinc-900 dark:text-white text-lg">{theme.title}</h3><p className="text-sm text-zinc-500">{theme.desc}</p></div>
                <ChevronDown className={`text-zinc-400 transition-transform ${expandedId === theme.id ? 'rotate-180' : ''}`} />
             </div>
             {expandedId === theme.id && (
               <div className="px-4 pb-4 pt-0 grid grid-cols-1 gap-2 animate-slide-down">
                 {theme.blocks.map((block: any) => (
                   <button key={block.id} onClick={() => playAudio(`${BASE_MEDIA_URL}/${block.audio}.mp3`, block.title)} className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                     <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{block.title}</span>
                     <Play size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
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

const BookReader = ({ playAudio, audioState }: any) => {
  const [chapterIdx, setChapterIdx] = useState(() => parseInt(localStorage.getItem('opd_ch_idx') || '0'));
  const [subPageIdx, setSubPageIdx] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [bookmarks, setBookmarks] = useState<number[]>(() => JSON.parse(localStorage.getItem('opd_book_bookmarks') || '[]'));
  const [notes, setNotes] = useState<{[key: string]: string}>(() => JSON.parse(localStorage.getItem('opd_book_notes') || '{}'));
  const [showTOC, setShowTOC] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const currentChapter = BOOK_CONTENT[chapterIdx] || BOOK_CONTENT[0];
  const isPlaying = audioState.isPlaying && audioState.currentUrl === currentChapter.audioUrl;

  useEffect(() => { localStorage.setItem('opd_ch_idx', chapterIdx.toString()); }, [chapterIdx]);
  useEffect(() => { localStorage.setItem('opd_book_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('opd_book_notes', JSON.stringify(notes)); }, [notes]);

  // Paginação Real
  const paginatedText = useMemo(() => {
    const text = currentChapter.content;
    const pages = [];
    let currentPage = [];
    let charCount = 0;
    const limit = 600;
    for (const p of text) {
      if(charCount + p.length > limit && currentPage.length > 0) { pages.push(currentPage); currentPage = []; charCount = 0; }
      currentPage.push(p); charCount += p.length;
    }
    if(currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [["..."]];
  }, [currentChapter]);

  useEffect(() => { setSubPageIdx(0); }, [chapterIdx]);

  const toggleBookmark = () => {
    setBookmarks(prev => prev.includes(chapterIdx) ? prev.filter(b => b !== chapterIdx) : [...prev, chapterIdx]);
    playUISound('success');
  };

  const nextPage = () => { if(subPageIdx < paginatedText.length-1) setSubPageIdx(s=>s+1); else if(chapterIdx < BOOK_CONTENT.length-1) setChapterIdx(c=>c+1); };
  const prevPage = () => { if(subPageIdx > 0) setSubPageIdx(s=>s-1); else if(chapterIdx > 0) setChapterIdx(c=>c-1); };

  const generatePDF = () => {
    playUISound('click');
    alert("Gerando PDF do capítulo...");
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-[#111] transition-colors relative">
      {/* TOOLBAR SUPERIOR */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <button onClick={() => setShowTOC(!showTOC)} className="p-2 hover:bg-black/5 rounded"><List size={20} className="text-zinc-500"/></button>
            <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold text-zinc-400">Capítulo {chapterIdx + 1}</span>
               <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">{currentChapter.title}</span>
            </div>
         </div>
         <div className="flex items-center gap-1">
            <button onClick={toggleBookmark} className={`p-2 rounded ${bookmarks.includes(chapterIdx) ? 'text-orange-500' : 'text-zinc-400'}`}><Bookmark size={18} fill={bookmarks.includes(chapterIdx) ? "currentColor" : "none"}/></button>
            <button onClick={() => setShowNotes(!showNotes)} className="p-2 text-zinc-400 hover:text-indigo-500"><PenTool size={18}/></button>
            <button onClick={generatePDF} className="p-2 text-zinc-400 hover:text-red-500"><FileDown size={18}/></button>
            <button onClick={() => setFontSize(f => Math.max(14, f - 2))} className="p-2 text-zinc-400"><ZoomOut size={18} /></button>
            <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="p-2 text-zinc-400"><ZoomIn size={18} /></button>
            {currentChapter.audioUrl && <button onClick={() => playAudio(currentChapter.audioUrl, currentChapter.title)} className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center ${isPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-zinc-200 text-zinc-600'}`}>{isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}</button>}
         </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-hidden flex relative">
         <div className={`flex-1 overflow-y-auto p-6 md:p-12 max-w-3xl mx-auto w-full pb-32 transition-all ${showNotes ? 'w-1/2 opacity-50' : 'w-full'}`}>
            <h2 className="font-serif text-2xl font-bold mb-6 text-zinc-900 dark:text-white">{currentChapter.title}</h2>
            <div className="font-serif text-zinc-800 dark:text-zinc-300 text-justify leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
               {paginatedText[subPageIdx]?.map((p: string, i: number) => <p key={i} className="mb-4 animate-fade-in">{p}</p>)}
            </div>
         </div>
         {showNotes && (
            <div className="w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 p-4 absolute right-0 top-0 bottom-0 z-30 shadow-xl animate-slide-left">
               <div className="flex justify-between mb-4"><h3 className="font-bold text-zinc-900 dark:text-white">Notas</h3><button onClick={() => setShowNotes(false)}><X size={18}/></button></div>
               <textarea value={notes[chapterIdx] || ''} onChange={(e) => setNotes({...notes, [chapterIdx]: e.target.value})} className="w-full h-[80%] bg-zinc-50 dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" placeholder="Escreva sua reflexão..."/>
            </div>
         )}
         {showTOC && (
            <div className="absolute inset-0 bg-black/50 z-40 flex justify-end" onClick={() => setShowTOC(false)}>
               <div className="w-64 bg-white dark:bg-zinc-900 h-full p-4 overflow-y-auto animate-slide-left" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Índice</h3>
                  <div className="space-y-2">
                     {BOOK_CONTENT.map((ch, i) => (
                        <button key={i} onClick={() => { setChapterIdx(i); setShowTOC(false); }} className={`w-full text-left p-2 rounded text-sm ${i === chapterIdx ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-zinc-500 hover:bg-zinc-100'}`}>{ch.title}</button>
                     ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                     <button onClick={() => { setIsOffline(!isOffline); playUISound('success'); }} className="flex items-center gap-2 text-sm text-zinc-500 w-full p-2 rounded hover:bg-zinc-100">{isOffline ? <WifiOff size={16}/> : <Wifi size={16}/>} {isOffline ? "Offline Ativo" : "Baixar Livro"}</button>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* RODAPÉ */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-20 md:pl-64">
         <button onClick={prevPage} className="flex items-center gap-1 text-sm text-zinc-500 disabled:opacity-30"><ChevronLeft size={20}/> Ant</button>
         <span className="text-xs font-mono text-zinc-400">Pág {subPageIdx + 1}/{paginatedText.length}</span>
         <button onClick={nextPage} className="flex items-center gap-1 text-sm text-zinc-900 dark:text-white font-medium hover:text-indigo-500">Prox <ChevronRight size={20}/></button>
      </div>
    </div>
  );
};

const ConfigView = ({ navigate, isDarkMode, setIsDarkMode }: any) => {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
       <div className="flex items-center gap-3 mb-6"><Settings className="text-zinc-900 dark:text-white" size={28} /><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Configurações</h2></div>
       <section><h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Globe size={16}/> Comunidade</h3><div className="grid grid-cols-3 gap-3"><Button variant="ghost" className="flex-col h-auto py-4"><Send size={24} className="mb-2 text-blue-400"/><span className="text-xs">Telegram</span></Button><Button variant="ghost" className="flex-col h-auto py-4"><Smartphone size={24} className="mb-2 text-green-400"/><span className="text-xs">WhatsApp</span></Button><Button variant="ghost" className="flex-col h-auto py-4"><Instagram size={24} className="mb-2 text-pink-400"/><span className="text-xs">Instagram</span></Button></div></section>
       <section><h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Settings size={16}/> Preferências</h3><div className="space-y-3"><GlassCard className="flex items-center justify-between"><span className="text-zinc-900 dark:text-white font-medium">Tema Escuro</span><button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-500' : 'bg-zinc-300'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} /></button></GlassCard></div></section>
       <div className="text-center text-xs text-zinc-500 pt-8"><p>O Poder dos Desacreditados v1.4.0</p></div>
    </div>
  );
};

const SessionsView = ({ playAudio }: any) => {
  const [tab, setTab] = useState<'presence' | 'podcast'>('presence');
  const data = tab === 'presence' ? PRESENCE_DATA : PODCAST_DATA;
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Sessões Guiadas</h2>
          <div className="flex bg-zinc-200 dark:bg-zinc-800 rounded-lg p-1"><button onClick={() => setTab('presence')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'presence' ? 'bg-white shadow-sm' : ''}`}>Presença</button><button onClick={() => setTab('podcast')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'podcast' ? 'bg-white shadow-sm' : ''}`}>Profundas</button></div>
       </div>
       <div className="space-y-3">{data.map(item => (<GlassCard key={item.id} onClick={() => playAudio(item.audio, item.title)} className="flex items-center gap-4 cursor-pointer hover:bg-white/10"><div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600"><Wind size={20} /></div><div className="flex-1"><h3 className="font-medium">{item.title}</h3><p className="text-sm text-zinc-500">{item.desc}</p></div><Play size={20} className="text-zinc-400" /></GlassCard>))}</div>
    </div>
  );
};

const IGentView = ({ playAudio }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><div className="text-center mb-8"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">iGent</h2><p className="text-zinc-500">Inteligência de Gestão Emocional.</p></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{IGENT_TOPICS.map(topic => (<button key={topic.id} onClick={() => playAudio(topic.audio, `iGent: ${topic.label}`)} className={`p-4 rounded-xl border ${topic.border} ${topic.bg} flex flex-col items-center justify-center gap-3 hover:scale-105 active:scale-95 group`}><topic.icon size={24} className={topic.color} /><span className={`text-sm font-medium ${topic.color}`}>{topic.label}</span></button>))}</div></div>);
const FavoritesView = ({ favorites, toggleFavorite }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><Heart className="text-rose-500" fill="currentColor"/> Favoritos</h2>{favorites.length === 0 ? <p className="text-zinc-500">Nenhum favorito salvo.</p> : (<div className="space-y-3">{favorites.map((fav: any) => (<GlassCard key={fav.id} className="flex items-center justify-between"><div><h3 className="font-medium">{fav.title}</h3></div><button onClick={() => toggleFavorite(fav)} className="text-rose-500"><Trash2 size={18} /></button></GlassCard>))}</div>)}</div>);
const HistoryView = ({ history }: any) => (<div className="p-6 max-w-2xl mx-auto animate-fade-in"><h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><History size={24}/> Histórico</h2>{!history?.length ? <p className="text-zinc-500">Vazio.</p> : (<div className="space-y-3">{history.map((h: any, i: number) => <div key={i} className="p-3 border-b border-zinc-200 dark:border-zinc-800">{h.title}</div>)}</div>)}</div>);
const ManifestoView = ({ playAudio }: any) => (<div className="p-8 max-w-2xl mx-auto text-center space-y-8 animate-fade-in"><Shield size={48} className="mx-auto text-zinc-400" /><h1 className="text-3xl font-serif text-zinc-900 dark:text-white">Manifesto Ético</h1><div className="text-left space-y-4 text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed"><p>1. Acreditamos na autonomia humana.</p></div><div className="flex justify-center gap-3"><Button onClick={() => playAudio(`${BASE_MEDIA_URL}/manifesto/manifesto-dia-v1.mp3`, 'Manifesto')}><Play size={18} /> Ouvir</Button></div></div>);

const Sidebar = ({ current, navigate, isMobile }: { current: string, navigate: (r: any) => void, isMobile: boolean }) => {
  const menus = [
    { label: "Jornada", items: [{ id: ROUTES.HOME, icon: Home, label: 'Início' }, { id: ROUTES.BOOK, icon: BookOpen, label: 'Livro' }, { id: ROUTES.LIBRARY, icon: Library, label: 'Biblioteca' }] },
    { label: "Ferramentas", items: [{ id: ROUTES.SESSIONS, icon: Headphones, label: 'Sessões' }, { id: ROUTES.IGENT, icon: Zap, label: 'iGent' }] },
    { label: "Pessoal", items: [{ id: ROUTES.FAVORITES, icon: Heart, label: 'Favoritos' }, { id: ROUTES.CONFIG, icon: Settings, label: 'Ajustes' }] }
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 flex justify-around p-3 z-40 pb-safe">
        {[ROUTES.HOME, ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS].map(r => {
          const item = menus.flatMap(m => m.items).find(i => i.id === r);
          const active = current === r;
          return (
            <button key={r} onClick={() => navigate(r)} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-500' : 'text-zinc-400'}`}>
              {item && <item.icon size={24} strokeWidth={active ? 2.5 : 2} />}
              <span className="text-[10px] font-medium">{item?.label}</span>
            </button>
          )
        })}
      </div>
    );
  }

  return (
    <div className="w-64 bg-zinc-50 dark:bg-[#09090b] h-screen border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-8">
           {/* LOGO PLACEHOLDER */}
           <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover bg-indigo-500"/>
           <span className="font-serif font-bold text-lg text-zinc-900 dark:text-white tracking-tight">O PODER</span>
        </div>
        <div className="space-y-6">
          {menus.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${current === item.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                    <item.icon size={18} className={`transition-transform group-hover:scale-110 ${current === item.id ? 'text-indigo-500' : 'text-zinc-400'}`} />
                    {item.label}
                    {current === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800"><div className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">DB</div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-zinc-900 dark:text-white truncate">Diego Bock</p><p className="text-xs text-zinc-500 truncate">Membro Fundador</p></div><Settings size={16} className="text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white" /></div></div>
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, currentUrl: null, title: null, progress: 0, volume: 1, isMuted: false });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    audioRef.current = new Audio();
    audioRef.current.addEventListener('timeupdate', () => setAudioState(p => ({ ...p, progress: (audioRef.current!.currentTime / audioRef.current!.duration) * 100 || 0 })));
    audioRef.current.addEventListener('ended', () => setAudioState(p => ({ ...p, isPlaying: false, progress: 100 })));
    const style = document.createElement('style');
    style.innerHTML = `.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; opacity: 0; } .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform: translateY(100%); } .animate-slide-down { animation: slideDown 0.3s ease-out forwards; opacity: 0; transform-origin: top; } .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; opacity: 0; transform: translateX(20px); } @keyframes fadeIn { to { opacity: 1; } } @keyframes slideUp { to { transform: translateY(0); } } @keyframes slideLeft { to { opacity: 1; transform: translateX(0); } } @keyframes slideDown { from { transform: scaleY(0.95); opacity: 0; } to { transform: scaleY(1); opacity: 1; } } .hide-scrollbar::-webkit-scrollbar { display: none; } .glass-panel { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }`;
    document.head.appendChild(style);
    return () => { window.removeEventListener('resize', handleResize); };
  }, []);

  const playAudio = (url: string, title: string) => {
    if (!audioRef.current) return;
    if (audioState.currentUrl === url) {
      if (audioState.isPlaying) { audioRef.current.pause(); setAudioState(p => ({ ...p, isPlaying: false })); } 
      else { audioRef.current.play().catch(console.error); setAudioState(prev => ({ ...prev, isPlaying: true })); }
    } else {
      audioRef.current.src = url; audioRef.current.play().catch(() => alert("Áudio indisponível."));
      setAudioState({ isPlaying: true, currentUrl: url, title, progress: 0 });
    }
  };

  const setVolume = (val: number) => { if(audioRef.current) { audioRef.current.volume = val; setAudioState(p => ({...p, volume: val})); } };

  const closeAudio = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setAudioState({ isPlaying: false, currentUrl: null, title: null, progress: 0 }); };
  const grantAccess = () => { localStorage.setItem('opd_access_granted', 'true'); setAccess(true); setRoute(ROUTES.ONBOARDING); };
  const completeOnboarding = () => { localStorage.setItem('opd_onboarding_complete', 'true'); setRoute(ROUTES.HOME); closeAudio(); };

  const renderView = () => {
    const props = { playAudio, navigate: setRoute, toggleFavorite: (i:any)=>setFavorites([...favorites,i]), isFavorite:(id:string)=>favorites.some(f=>f.id===id), audioState };
    if (!access) return <AccessGate onAccessGranted={grantAccess} />;
    switch (route) {
      case ROUTES.ONBOARDING: return <Onboarding onComplete={completeOnboarding} playAudio={playAudio} />;
      case ROUTES.BOOK: return <BookReader {...props} />;
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
          
          {access && !isMobile && <Sidebar current={route} navigate={setRoute} isMobile={false} />}
          
          <main className="flex-1 flex flex-col h-full relative overflow-hidden">
            <div className="flex-1 overflow-y-auto scroll-smooth">
              {renderView()}
            </div>
            {access && isMobile && <Sidebar current={route} navigate={setRoute} isMobile={true} />}
            <AudioPlayerBar state={audioState} togglePlay={() => playAudio(audioState.currentUrl!, audioState.title!)} setVolume={setVolume} setMuted={(m: boolean) => { if(audioRef.current) audioRef.current.muted = m; setAudioState(p => ({...p, isMuted: m})); }} close={() => { if(audioRef.current) audioRef.current.pause(); setAudioState(p => ({ ...p, currentUrl: null })); }} />
          </main>
        </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }