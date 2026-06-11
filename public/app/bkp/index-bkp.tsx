/// <reference types="vite/client" />
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BookOpen, Home, Library, Headphones, MessageSquare, 
  Settings, Info, Play, Pause, X, ChevronRight, 
  AlertTriangle, Phone, Shield, Search, Menu, LogOut,
  Sun, Moon, ZoomIn, ZoomOut, Bookmark, FileText, Download, LayoutGrid, Plus,
  Heart, Users, Cloud, Briefcase, Zap, Anchor, Sparkles, Wallet, CircleDashed,
  AlertCircle, RefreshCw, Ghost, Flame, UserX, TrendingDown, Wind, Gauge, Star,
  Lock, Key, CheckCircle, HeartHandshake, CloudRain, Activity, ArrowRightCircle, Coins,
  History, Share2, MoreHorizontal, AlignJustify, ChevronDown, Clock, List, FileDown, WifiOff, Check,
  Instagram, Send, Trash2, Smartphone, Globe, PenTool
} from 'lucide-react';

// --- IMPORTS NOVOS (Certifique-se que criou os arquivos nas pastas indicadas) ---
import { bookContent } from "./src/data/livro";
import { usePagination } from "./src/hooks/usePagination";

// --- CONFIGURAÇÃO & DADOS ---

const BASE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://opoderdosdesacreditados.online/media';

// LISTA DE TOKENS VÁLIDOS (Simulação de Backend)
const VALID_ACCESS_TOKENS = [
  'TRIADE2024',
  'DESACREDITADOS',
  'VIP-ALMA',
  'DEMO123'
];

const ROUTES = {
  ACCESS: 'access',
  ONBOARDING: 'onboarding',
  HOME: 'home',
  BOOK: 'book',
  LIBRARY: 'library',
  SESSIONS: 'sessions',
  IGENT: 'igent',
  FAVORITES: 'favorites',
  HISTORY: 'history',
  MANIFESTO: 'manifesto',
  CONFIG: 'config'
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];

interface AudioState {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  progress: number;
}

// DADOS GLOBAIS DE SESSÕES
const PRESENCE_DATA = [
  { id: 'pres-1', title: 'Voz 1', desc: 'Guiamento suave', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz1.mp3`, type: 'session' },
  { id: 'pres-2', title: 'Voz 2', desc: 'Guiamento suave', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz2.mp3`, type: 'session' },
  { id: 'pres-3', title: 'Voz 3', desc: 'Guiamento suave', audio: `${BASE_MEDIA_URL}/sessoes/presenca/voz3.mp3`, type: 'session' }
];

const PODCAST_DATA = [
  { id: 'pod-1', title: 'Episódio 1: Aprofundamento', desc: '25 min • Reflexão estrutural', audio: `${BASE_MEDIA_URL}/sessoes/podcasts/ep01.mp3`, type: 'podcast' },
  { id: 'pod-2', title: 'Episódio 2: Aprofundamento', desc: '25 min • Reflexão estrutural', audio: `${BASE_MEDIA_URL}/sessoes/podcasts/ep02.mp3`, type: 'podcast' },
  { id: 'pod-3', title: 'Episódio 3: Aprofundamento', desc: '25 min • Reflexão estrutural', audio: `${BASE_MEDIA_URL}/sessoes/podcasts/ep03.mp3`, type: 'podcast' }
];

// Temas Centrais da Biblioteca (Os 9 Pilares)
const LIBRARY_THEMES = [
  { 
    id: 1, 
    title: 'Vínculo', 
    subtitle: 'Vínculo × Rejeição × Desapego',
    icon: HeartHandshake,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    desc: 'A necessidade humana de conexão e o medo primitivo de ser deixado.',
    triad: {
      consciencia: 'Perceber a necessidade humana de conexão.',
      julgamento: 'Interpretar a rejeição como falha pessoal.',
      presenca: 'Desapegar sem se fechar: relacionar-se sem mendigar.'
    }
  },
  { 
    id: 2, 
    title: 'Família', 
    subtitle: 'Família × Lealdade × Autonomia',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    desc: 'Reconhecer a família como matriz emocional e identitária.',
    triad: {
      consciencia: 'Família como matriz emocional.',
      julgamento: 'Confundir lealdade com obrigação.',
      presenca: 'Ser fiel à essência sem romper com a origem.'
    }
  },
  { 
    id: 3, 
    title: 'Luto', 
    subtitle: 'Luto × Ausência × Continuidade',
    icon: CloudRain,
    color: 'text-zinc-400',
    bg: 'bg-zinc-400/10',
    border: 'border-zinc-400/20',
    desc: 'Reconhecer a perda como fato irreversível.',
    triad: {
      consciencia: 'A perda é um fato irreversível.',
      julgamento: 'Fixar-se na ausência como identidade.',
      presenca: 'Seguir vivendo sem apagar a memória.'
    }
  },
  { 
    id: 4, 
    title: 'Trabalho', 
    subtitle: 'Trabalho × Valor × Dignidade',
    icon: Briefcase,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    desc: 'Perceber o trabalho como meio de reconhecimento e sobrevivência.',
    triad: {
      consciencia: 'Trabalho como meio, não fim.',
      julgamento: 'Medir valor apenas pela produtividade.',
      presenca: 'Atuar com dignidade independente do resultado.'
    }
  },
  { 
    id: 5, 
    title: 'Dor', 
    subtitle: 'Dor × Fuga × Regulação',
    icon: Activity,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    desc: 'Reconhecer a dor emocional não elaborada.',
    triad: {
      consciencia: 'Reconhecer a dor não elaborada.',
      julgamento: 'Rotular-se fraco por sentir dor.',
      presenca: 'Regular a dor sem anestesiá-la.'
    }
  },
  { 
    id: 6, 
    title: 'Desejo', 
    subtitle: 'Desejo × Medo × Movimento',
    icon: ArrowRightCircle,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    desc: 'Identificar o desejo legítimo de mudança.',
    triad: {
      consciencia: 'Identificar o desejo de mudança.',
      julgamento: 'Paralisar-se por antecipar o fracasso.',
      presenca: 'Mover-se com medo mesmo.'
    }
  },
  { 
    id: 7, 
    title: 'Fé', 
    subtitle: 'Fé × Dúvida × Sentido',
    icon: Sparkles,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    desc: 'Reconhecer o questionamento existencial como sinal de maturidade.',
    triad: {
      consciencia: 'Questionar é sinal de maturidade.',
      julgamento: 'Ver a dúvida como fraqueza.',
      presenca: 'Construir sentido sem respostas absolutas.'
    }
  },
  { 
    id: 8, 
    title: 'Escassez', 
    subtitle: 'Escassez × Pressão × Estratégia',
    icon: Coins,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    desc: 'Perceber o impacto psicológico da falta de recursos.',
    triad: {
      consciencia: 'Impacto da falta de recursos.',
      julgamento: 'Associar falta de dinheiro à falha moral.',
      presenca: 'Agir com estratégia e integridade.'
    }
  },
  { 
    id: 9, 
    title: 'Vazio', 
    subtitle: 'Vazio × Desorientação × Criação',
    icon: CircleDashed,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    desc: 'Reconhecer o vazio como sinal de transição.',
    triad: {
      consciencia: 'O vazio é sinal de transição.',
      julgamento: 'Vazio como ausência de valor.',
      presenca: 'Criar sentido a partir do silêncio.'
    }
  },
];

const ONBOARDING_STEPS = [
  { title: "Limites", desc: "Este app não é terapia. É um espaço de acolhimento e autoconsciência.", audio: `${BASE_MEDIA_URL}/audio/onboarding/01-limites.mp3` },
  { title: "A Tríade", desc: "Tudo aqui segue a lógica: Consciência, Julgamento e Presença.", audio: `${BASE_MEDIA_URL}/audio/onboarding/02-triade.mp3` },
  { title: "Expectativas", desc: "Não prometemos cura, mas prometemos não te abandonar no caos.", audio: `${BASE_MEDIA_URL}/audio/onboarding/03-expectativas.mp3` },
  { title: "Crise", desc: "Em caso de risco à vida, ligue 188 (CVV) ou busque o CAPS.", audio: `${BASE_MEDIA_URL}/audio/onboarding/04-quando-nao-usar.mp3`, isWarning: true },
  { title: "Portas", desc: "Livro, Biblioteca, Sessões e iGent. Escolha seu caminho.", audio: `${BASE_MEDIA_URL}/audio/onboarding/05-portas.mp3` },
  { title: "Entrada", desc: "Use com consciência. Sem dependência.", audio: `${BASE_MEDIA_URL}/audio/onboarding/06-entrada.mp3` },
];

// iGent Tópicos
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

// --- HELPERS ---

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  alert("Link copiado para a área de transferência!");
};

// --- COMPONENTES UI OTIMIZADOS ---

const GlassCard = ({ children, className = '', onClick }: any) => (
  <div 
    onClick={onClick} 
    className={`glass-panel rounded-xl p-4 shadow-sm transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const base = "px-4 py-3 rounded-lg font-medium transition-all active:scale-95 flex items-center justify-center gap-2";
  const styles = {
    primary: "bg-gradient-to-r from-purple-400 to-emerald-400 text-white shadow-lg hover:opacity-90 shadow-purple-500/20",
    secondary: "bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/20 backdrop-blur",
    danger: "bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/20",
    ghost: "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant as keyof typeof styles]} ${className}`}>
      {children}
    </button>
  );
};

const SkeletonCard = () => (
  <div className="glass-panel rounded-xl p-4 animate-pulse">
    <div className="flex gap-4 items-center">
      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
);

// --- COMPONENTES AUXILIARES ---

const FavoriteButton = ({ isFavorite, onToggle, className = "" }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 ${isFavorite ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'} ${className}`}
  >
    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
  </button>
);

const ShareButton = ({ onClick, className = "" }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 text-zinc-400 hover:text-zinc-900 dark:hover:text-white ${className}`}
  >
    <Share2 size={20} />
  </button>
);

// --- TELA DE ACESSO ---

const AccessGate = ({ onAccessGranted }: { onAccessGranted: () => void }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleValidate = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      if (VALID_ACCESS_TOKENS.includes(token.trim().toUpperCase())) onAccessGranted();
      else setError(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-[#0f0f10] relative overflow-hidden animate-fade-in">
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 dark:bg-white rounded-2xl mx-auto flex items-center justify-center shadow-2xl mb-4 rotate-3"><Lock className="text-white dark:text-black" size={32} /></div>
          <h1 className="text-3xl font-serif font-bold text-zinc-900 dark:text-white mb-2">Área Restrita</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Insira sua chave de acesso para liberar o conteúdo completo.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/20 dark:border-white/5 backdrop-blur-xl bg-white/40 dark:bg-black/40">
           <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Chave de Acesso</label>
           <div className="relative mb-6">
             <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
             <input type="text" value={token} onChange={(e) => { setToken(e.target.value); setError(false); }} placeholder="Ex: TRIADE2024" className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase tracking-widest font-mono transition-all"/>
           </div>
           {error && <div className="mb-4 flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={14} /><span>Chave inválida.</span></div>}
           <Button onClick={handleValidate} className="w-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">{loading ? <RefreshCw className="animate-spin" size={20} /> : 'Desbloquear Acesso'}</Button>
        </div>
      </div>
    </div>
  );
};

const AudioPlayerBar = ({ state, togglePlay, close }: { state: AudioState, togglePlay: () => void, close: () => void }) => {
  if (!state.currentUrl) return null;
  return (
    <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 p-3 z-50 flex items-center justify-between transition-transform duration-300 shadow-lg animate-slide-up">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-[10px] text-purple-500 uppercase tracking-wider mb-1 font-bold">Tocando agora</p>
        <p className="text-sm text-zinc-900 dark:text-white font-medium truncate">{state.title}</p>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-purple-400 to-emerald-400 h-full transition-all duration-500" style={{ width: `${state.progress}%` }}></div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md">{state.isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}</button>
        <button onClick={close} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-90 transition-transform"><X size={20} /></button>
      </div>
    </div>
  );
};

// --- COMPONENTES DE PÁGINA ---

const Onboarding = ({ onComplete, playAudio }: any) => {
  const [step, setStep] = useState(0);
  const data = ONBOARDING_STEPS[step];
  return (
    <div className="h-full flex flex-col justify-between p-6 max-w-md mx-auto pt-12 animate-fade-in">
      <div className="space-y-6">
        <div className="flex justify-between items-center"><span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">PASSO {step + 1}/{ONBOARDING_STEPS.length}</span>{data.isWarning && <AlertTriangle className="text-red-500" size={20} />}</div>
        <h1 className="text-3xl font-serif text-zinc-900 dark:text-white leading-tight">{data.title}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">{data.desc}</p>
        <Button variant="secondary" onClick={() => playAudio(data.audio, data.title)} className="w-full justify-between group"><span>Ouvir Explicação</span><Play size={16} className="group-hover:translate-x-1 transition-transform" /></Button>
        {data.isWarning && <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mt-4"><p className="text-red-600 dark:text-red-300 text-sm mb-2">Este recurso não substitui atendimento profissional.</p><p className="text-red-700 dark:text-red-200 font-bold text-lg">Ligue 188 (CVV)</p></div>}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex gap-1 h-1 mb-4">{ONBOARDING_STEPS.map((_, i) => (<div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-gradient-to-r from-purple-400 to-emerald-400' : 'bg-zinc-200 dark:bg-zinc-800'}`} />))}</div>
        <Button onClick={() => step < ONBOARDING_STEPS.length - 1 ? setStep(step + 1) : onComplete()} className="w-full">{step === ONBOARDING_STEPS.length - 1 ? 'Entrar no App' : 'Continuar'}</Button>
      </div>
    </div>
  );
};

const HomeView = ({ playAudio, navigate }: any) => {
  const states = [
    { title: 'Sobrevivência', desc: 'Estou em crise ou pânico.', audio: 'sobrevivencia.mp3', color: 'border-rose-400', bg: 'bg-rose-500/10', iconColor: 'text-rose-400' },
    { title: 'Reconstrução', desc: 'Estou tentando me reerguer.', audio: 'reconstrucao.mp3', color: 'border-purple-400', bg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
    { title: 'Continuidade', desc: 'Quero manter o equilíbrio.', audio: 'continuidade.mp3', color: 'border-emerald-400', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' }
  ];

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in">
      <header className="mt-4">
        <h1 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">Onde você está agora?</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Escolha um estado para ouvir a orientação da Tríade.</p>
      </header>

      <div className="grid gap-4">
        {states.map((s, i) => (
          <GlassCard key={i} onClick={() => playAudio(`${BASE_MEDIA_URL}/audio/home/${s.audio}`, s.title)} className={`group border-l-[6px] ${s.color} ${s.bg} hover:brightness-110`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-white text-lg">{s.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm mt-1">{s.desc}</p>
              </div>
              <div className={`w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${s.iconColor}`}>
                <Play size={20} fill="currentColor" className="ml-1" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="py-6 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-purple-500 uppercase tracking-wider mb-3 font-bold">Manifesto do Dia</p>
        <div className="relative p-6 bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-900/50 dark:to-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
          <p className="font-serif italic text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed mb-4">"Não somos o que nos aconteceu. Somos o que escolhemos fazer com o que sobrou."</p>
          <button onClick={() => playAudio(`${BASE_MEDIA_URL}/audio/home/frase-rotativa.mp3`, 'Frase do Dia')} className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white"><Play size={14} /> Ouvir reflexão</button>
        </div>
      </div>

      <Button onClick={() => navigate(ROUTES.BOOK)} className="w-full">
        Meus Livros <BookOpen size={18} />
      </Button>
    </div>
  );
};

const PillarsView = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-up">
    {LIBRARY_THEMES.map(t => (
      <div key={t.id} className={`p-4 rounded-xl border ${t.border} bg-white/5 flex flex-col items-center text-center gap-2`}>
        <div className={`p-2 rounded-full ${t.bg} ${t.color}`}><t.icon size={20}/></div>
        <span className="text-sm font-medium text-zinc-900 dark:text-white">{t.title}</span>
      </div>
    ))}
  </div>
);

// --- COMPONENTE LIVRO INTELIGENTE (ATUALIZADO) ---

const BookReader = ({ playAudio, audioState }: any) => {
  const [mode, setMode] = useState<'cover' | 'read' | 'pillars'>('cover');
  const [reflectionMode, setReflectionMode] = useState(false);
  
  // Controle de Capítulos
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const currentChapterData = bookContent[currentChapterIndex];

  // Paginação Automática
  // O hook agora deve estar acessível via import
  const chapterPages = usePagination(currentChapterData.content); 
  
  const [pageIndex, setPageIndex] = useState(0); 
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [notes, setNotes] = useState<{[key: string]: string}>({});

  const currentPageText = chapterPages[pageIndex] || [];
  const totalPagesInChapter = chapterPages.length;

  const currentAudioUrl = currentChapterData.audioUrl;
  const isPlayingChapter = audioState.isPlaying && audioState.currentUrl === currentAudioUrl;

  const saveReflection = (text: string) => {
      const noteKey = `ch-${currentChapterIndex}-pg-${pageIndex}`;
      setNotes(prev => ({...prev, [noteKey]: text}));
      alert('Reflexão salva.');
  };

  const nextPage = () => {
    if (pageIndex < totalPagesInChapter - 1) {
      setPageIndex(p => p + 1);
    } else if (currentChapterIndex < bookContent.length - 1) {
      setCurrentChapterIndex(c => c + 1);
      setPageIndex(0);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(p => p - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(c => c - 1);
      setPageIndex(0); 
    }
  };

  if (mode === 'cover') {
    return (
      <div className="h-full flex flex-col p-6 max-w-2xl mx-auto animate-fade-in">
         <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-48 aspect-[2/3] shadow-2xl rounded-r-lg bg-zinc-800 relative group overflow-hidden">
               <img src={`${BASE_MEDIA_URL}/imagens/capas/capa-livro-vertical.jpg`} alt="Capa" className="w-full h-full object-cover opacity-80" onError={(e: any) => e.target.style.display='none'} />
               <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-l-4 border-zinc-600 pointer-events-none">
                  <h1 className="font-serif font-bold text-white text-xl drop-shadow-md">O PODER DOS DESACREDITADOS</h1>
               </div>
            </div>
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-serif text-zinc-900 dark:text-white font-bold">O Poder dos Desacreditados</h2>
               <p className="text-zinc-500">Guia de Sobrevivência</p>
            </div>
            <div className="w-full">
               <Button onClick={() => setMode('read')} className="w-full mb-3">Ler Agora <BookOpen size={18} /></Button>
               <Button variant="secondary" onClick={() => setMode('pillars')} className="w-full">Ver os 9 Pilares</Button>
            </div>
         </div>
      </div>
    );
  }

  if (mode === 'pillars') {
     return <div className="p-6"><button onClick={() => setMode('cover')} className="mb-6 flex items-center gap-2 text-zinc-500"><ChevronRight className="rotate-180" size={16}/> Voltar</button><PillarsView /></div>
  }

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] dark:bg-[#1a1a1a] transition-colors duration-500 animate-fade-in relative">
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
           <button onClick={() => setMode('cover')}><ChevronRight className="rotate-180 text-zinc-500" size={24} /></button>
           <button onClick={() => playAudio(currentAudioUrl, currentChapterData.title)} className="bg-gradient-to-r from-purple-400 to-emerald-400 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
             {isPlayingChapter ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" />}
             <span className="hidden sm:inline">Ouvir Capítulo</span>
           </button>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(f => Math.max(14, f - 2))} className="p-2 text-zinc-600 dark:text-zinc-400"><ZoomOut size={18} /></button>
            <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="p-2 text-zinc-600 dark:text-zinc-400"><ZoomIn size={18} /></button>
            <button onClick={() => setReflectionMode(!reflectionMode)} className={`p-2 rounded-full ${reflectionMode ? 'text-purple-500 bg-purple-100' : 'text-zinc-400'}`}><PenTool size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
         <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
            <span className="text-xs font-sans text-zinc-400 uppercase tracking-widest">Capítulo {currentChapterData.chapter}</span>
            <h2 className="text-2xl text-zinc-900 dark:text-zinc-100 font-serif font-bold mt-1">{currentChapterData.title}</h2>
         </div>
         
         <div className="font-serif text-zinc-800 dark:text-zinc-300 transition-all text-justify" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}>
            {currentPageText.map((paragraph, index) => (
               <p key={index} className="mb-6">{paragraph}</p>
            ))}
         </div>
      </div>

      {reflectionMode && (
        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 z-20 flex flex-col p-6 animate-slide-up">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white">Reflexão Pessoal</h3>
              <button onClick={() => setReflectionMode(false)}><X size={24} /></button>
           </div>
           <textarea 
              className="flex-1 w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="O que este trecho diz sobre o seu momento?"
              onChange={(e) => saveReflection(e.target.value)}
           />
        </div>
      )}

      {!reflectionMode && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
            <button onClick={prevPage} disabled={currentChapterIndex === 0 && pageIndex === 0} className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full disabled:opacity-30"><ChevronRight className="rotate-180" size={24} /></button>
            <span className="text-xs font-mono text-zinc-400">
               {currentChapterIndex + 1}.{pageIndex + 1}
            </span>
            <button onClick={nextPage} disabled={currentChapterIndex === bookContent.length - 1 && pageIndex === totalPagesInChapter - 1} className="w-12 h-12 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full disabled:opacity-30"><ChevronRight size={24} /></button>
        </div>
      )}
    </div>
  );
};

// --- DEMAIS VIEWS (ConfigView, LibraryView, etc...) ---

const ConfigView = ({ navigate, isDarkMode, setIsDarkMode }: any) => {
  const clearData = () => {
    if(confirm('Tem certeza? Isso apagará todo o seu progresso, notas e favoritos.')) {
       localStorage.clear();
       window.location.reload();
    }
  };

  const SocialButton = ({ icon: Icon, label, href, color }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center p-4 rounded-xl glass-panel gap-2 hover:bg-white/10 transition-all active:scale-95 group ${color}`}>
       <Icon size={24} className="group-hover:scale-110 transition-transform" />
       <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </a>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
       <div className="flex items-center gap-3 mb-6">
        <Settings className="text-zinc-900 dark:text-white" size={28} />
        <h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Configurações</h2>
      </div>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Globe size={16}/> Comunidade</h3>
        <div className="grid grid-cols-3 gap-3">
           <SocialButton icon={Send} label="Telegram" href="https://t.me/opoderdosdesacreditados" color="text-blue-400" />
           <SocialButton icon={Smartphone} label="WhatsApp" href="https://whatsapp.com/channel/..." color="text-green-400" />
           <SocialButton icon={Instagram} label="Instagram" href="https://instagram.com/opoderdosdesacreditados" color="text-pink-400" />
        </div>
      </section>

      <section>
         <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Settings size={16}/> Preferências</h3>
         <div className="space-y-3">
            <GlassCard className="flex items-center justify-between">
               <span className="text-zinc-900 dark:text-white font-medium">Tema Escuro</span>
               <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-purple-500' : 'bg-zinc-300'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
               </button>
            </GlassCard>
         </div>
      </section>

      <section>
         <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><AlertTriangle size={16}/> Zona de Perigo</h3>
         <Button variant="danger" onClick={clearData} className="w-full justify-start"><Trash2 size={18} /> Apagar todo o progresso</Button>
      </section>
    </div>
  );
};

const LibraryView = ({ playAudio, toggleFavorite, isFavorite }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'consciencia' | 'julgamento' | 'presenca'>('all');

  const filteredThemes = useMemo(() => {
    return LIBRARY_THEMES.filter(theme => (theme.title.toLowerCase().includes(searchTerm.toLowerCase()) || theme.desc.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm]);

  const toggleExpand = (id: number, e: React.MouseEvent) => { e.stopPropagation(); setExpandedId(expandedId === id ? null : id); };

  const TriadItem = ({ type, text, color, icon: Icon, playUrl, title }: any) => (
    <div className={`p-4 rounded-lg border ${color.replace('text', 'border').replace('400', '200')} bg-zinc-50 dark:bg-black/20 flex flex-col gap-3 transition-all animate-fade-in`}>
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2"><Icon size={16} className={color} /><span className={`text-xs font-bold uppercase tracking-wider ${color}`}>{type}</span></div>
         <button onClick={() => playAudio(playUrl, title)} className="p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:scale-110 transition-transform"><Play size={12} fill="currentColor" className="text-zinc-900 dark:text-white" /></button>
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{text}</p>
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">Biblioteca da Tríade</h2>
      <p className="text-sm text-zinc-500 mb-6">Explore cada tema sob as três perspectivas.</p>
      <div className="relative mb-4">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
         <input type="text" placeholder="Buscar tema..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/50 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 rounded-full py-3 pl-10 pr-4 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-500 backdrop-blur-sm transition-all"/>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
         {[ { id: 'all', label: 'Todos' }, { id: 'consciencia', label: 'Consciência', color: 'text-rose-400' }, { id: 'julgamento', label: 'Julgamento', color: 'text-blue-400' }, { id: 'presenca', label: 'Presença', color: 'text-emerald-400' } ].map(f => (
           <button key={f.id} onClick={() => setFilter(f.id as any)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap border transition-all ${filter === f.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}>{f.label}</button>
         ))}
      </div>
      <div className="grid gap-4 overflow-y-auto pb-24">
        {filteredThemes.map(theme => (
          <GlassCard key={theme.id} onClick={(e: any) => toggleExpand(theme.id, e)} className="relative overflow-hidden group">
             <div className="relative z-10 pr-16">
                <div className="flex items-start gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${theme.bg} ${theme.color}`}><theme.icon size={20} /></div>
                    <div><h3 className="font-medium text-lg text-zinc-900 dark:text-white leading-tight">{theme.title}</h3><p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{theme.desc}</p></div>
                </div>
             </div>
             <div className="absolute top-4 right-4 flex gap-2"><ShareButton onClick={() => copyToClipboard(`https://app.triade.com/library/${theme.id}`)} /><FavoriteButton isFavorite={isFavorite(`lib-${theme.id}`)} onToggle={() => toggleFavorite({ id: `lib-${theme.id}`, type: 'library', title: theme.title, desc: theme.desc })} /></div>
             {expandedId === theme.id && (
               <div className="mt-6 space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 animate-slide-down">
                  {(filter === 'all' || filter === 'consciencia') && <TriadItem type="Consciência" text={theme.triad.consciencia} color="text-triad-lilac" icon={Sparkles} playUrl={`${BASE_MEDIA_URL}/audio/biblioteca/${theme.id}-consciencia.mp3`} title={`${theme.title} - Consciência`}/>}
                  {(filter === 'all' || filter === 'julgamento') && <TriadItem type="Julgamento" text={theme.triad.julgamento} color="text-triad-cherry" icon={AlertCircle} playUrl={`${BASE_MEDIA_URL}/audio/biblioteca/${theme.id}-julgamento.mp3`} title={`${theme.title} - Julgamento`}/>}
                  {(filter === 'all' || filter === 'presenca') && <TriadItem type="Presença" text={theme.triad.presenca} color="text-triad-green" icon={Anchor} playUrl={`${BASE_MEDIA_URL}/audio/biblioteca/${theme.id}-presenca.mp3`} title={`${theme.title} - Presença`}/>}
               </div>
             )}
             <div className="mt-4 flex justify-center w-full"><ChevronDown size={20} className={`text-zinc-400 transition-transform duration-300 ${expandedId === theme.id ? 'rotate-180' : ''}`} /></div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const SessionsView = ({ playAudio, toggleFavorite, isFavorite, audioState }: any) => {
  const [tab, setTab] = useState<'presenca' | 'podcasts' | 'micro'>('presenca');
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const timer = setTimeout(() => setLoading(false), 800); return () => clearTimeout(timer); }, [tab]);
  const currentData = tab === 'presenca' ? PRESENCE_DATA : tab === 'podcasts' ? PODCAST_DATA : IGENT_TOPICS;
  const isPlayingItem = (url: string) => audioState.isPlaying && audioState.currentUrl === url;
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-serif text-zinc-900 dark:text-white mb-2">Sessões</h2>
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        {[ { id: 'presenca', label: 'Presença' }, { id: 'podcasts', label: 'Profundos' }, { id: 'micro', label: 'Rápidos' } ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${tab === t.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{t.label}{tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-emerald-400" />}</button>
        ))}
      </div>
      <div className="space-y-4 pb-24">
        {loading ? ( <> <SkeletonCard /> <SkeletonCard /> <SkeletonCard /> </> ) : (
          currentData.map((item: any) => (
            tab === 'micro' ? (
               <button key={item.id} onClick={() => playAudio(item.audio, item.label)} className="w-full glass-panel p-3 rounded-lg text-left hover:bg-white/20 transition-colors flex items-center justify-between group active:scale-[0.98]">
                   <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>{isPlayingItem(item.audio) ? <Pause size={14} fill="currentColor"/> : <item.icon size={16} />}</div><span className="text-zinc-900 dark:text-white text-sm font-medium">{item.label || item.title}</span></div>
               </button>
            ) : (
              <GlassCard key={item.id} onClick={() => playAudio(item.audio, item.title)} className="relative group">
                <div className="absolute top-4 right-4 flex gap-2"><ShareButton onClick={() => copyToClipboard(`https://app.triade.com/session/${item.id}`)} /><FavoriteButton isFavorite={isFavorite(item.id)} onToggle={() => toggleFavorite({ ...item })} /></div>
                <div className="flex items-center gap-4 pr-20">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${isPlayingItem(item.audio) ? 'bg-gradient-to-r from-purple-400 to-emerald-400 text-white' : 'bg-indigo-500/10 text-indigo-500'}`}>{isPlayingItem(item.audio) ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}</div>
                  <div><h3 className="text-zinc-900 dark:text-white font-medium">{item.title}</h3><p className="text-xs text-zinc-500">{item.desc}</p></div>
                </div>
              </GlassCard>
            )
          ))
        )}
      </div>
    </div>
  );
};

const IGentView = ({ playAudio, toggleFavorite, isFavorite, audioState }: any) => {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const isPlaying = selectedTopic && audioState.isPlaying && audioState.currentUrl === selectedTopic.audio;
  if (selectedTopic) {
    return (
      <div className="p-6 h-full flex flex-col max-w-2xl mx-auto animate-slide-left">
        <button onClick={() => setSelectedTopic(null)} className="text-zinc-500 flex items-center gap-2 mb-6 hover:text-zinc-900 dark:hover:text-white"><ChevronRight className="rotate-180" size={16} /> Voltar</button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><div className={`p-3 rounded-full ${selectedTopic.bg} ${selectedTopic.color}`}><selectedTopic.icon size={24} /></div><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">{selectedTopic.label}</h2></div>
          <div className="flex gap-2"><ShareButton onClick={() => copyToClipboard(`https://app.triade.com/igent/${selectedTopic.id}`)} /><FavoriteButton isFavorite={isFavorite(`igent-${selectedTopic.id}`)} onToggle={() => toggleFavorite({ id: `igent-${selectedTopic.id}`, type: 'igent', title: selectedTopic.label, audio: selectedTopic.audio })} /></div>
        </div>
        <GlassCard className="mb-6 !bg-zinc-900 !border-zinc-800 group" onClick={() => playAudio(selectedTopic.audio, `iGent: ${selectedTopic.label}`)}>
          <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-gradient-to-r from-purple-400 to-emerald-400 text-white' : 'bg-white text-black'}`}>{isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} className="ml-0.5" fill="currentColor" />}</div><span className="text-sm font-medium text-white">{isPlaying ? 'Pausar Orientação' : 'Ouvir micro-orientação'}</span></div>
        </GlassCard>
        <div className="space-y-6 animate-fade-in delay-100">
          <div className="space-y-2"><span className="text-xs font-mono text-purple-400 uppercase font-bold">1. Consciência</span><p className="text-zinc-700 dark:text-zinc-300">O que você está sentindo agora é um fato, ou uma interpretação de um fato?</p></div>
          <div className="space-y-2"><span className="text-xs font-mono text-red-400 uppercase font-bold">2. Julgamento</span><p className="text-zinc-700 dark:text-zinc-300">O que a voz crítica na sua cabeça está dizendo que vai acontecer de ruim?</p></div>
          <div className="space-y-2"><span className="text-xs font-mono text-emerald-400 uppercase font-bold">3. Presença</span><p className="text-zinc-700 dark:text-zinc-300">Se você não precisasse resolver isso nos próximos 5 minutos, como você respiraria?</p></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-lg"><MessageSquare size={24} /></div><div><h2 className="text-xl font-serif text-zinc-900 dark:text-white">iGent</h2><p className="text-xs text-zinc-500">Mentor Estrutural (Beta)</p></div></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{IGENT_TOPICS.map(t => (<GlassCard key={t.id} onClick={() => setSelectedTopic(t)} className={`flex flex-col items-start gap-3 group transition-all duration-300 hover:scale-[1.02] active:scale-95 ${t.bg} border-transparent hover:${t.border} relative`}><div className="absolute top-2 right-2"><FavoriteButton isFavorite={isFavorite(`igent-${t.id}`)} onToggle={() => toggleFavorite({ id: `igent-${t.id}`, type: 'igent', title: t.label, audio: t.audio })} className="!p-1 scale-75 opacity-50 hover:opacity-100"/></div><div className={`p-2 rounded-lg bg-black/10 dark:bg-black/30 ${t.color}`}><t.icon size={20} /></div><span className="text-zinc-900 dark:text-white font-medium text-sm">{t.label}</span></GlassCard>))}</div>
    </div>
  );
};

const FavoritesView = ({ playAudio, favorites, navigate }: any) => {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6"><Heart className="text-rose-500 fill-rose-500" size={28} /><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Meus Favoritos</h2></div>
      <section><h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2"><Star size={16} /> Conteúdos Salvos</h3>{favorites.length === 0 && <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl"><p className="text-zinc-400 mb-2">Você ainda não favoritou nenhum conteúdo.</p></div>}<div className="grid gap-3">{favorites.map((fav: any) => (<GlassCard key={fav.id} onClick={() => { if (fav.type === 'library') navigate(ROUTES.LIBRARY); else if (fav.audio) playAudio(fav.audio, fav.title); }} className="relative active:scale-[0.98]"><div className="flex gap-4 items-center"><div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fav.type === 'session' ? 'bg-indigo-500/10 text-indigo-500' : fav.type === 'igent' ? 'bg-orange-500/10 text-orange-500' : 'bg-rose-500/10 text-rose-500'}`}>{fav.type === 'session' ? <Headphones size={20} /> : fav.type === 'igent' ? <MessageSquare size={20} /> : <Library size={20} />}</div><div className="min-w-0"><div className="flex items-center gap-2"><h4 className="text-zinc-900 dark:text-white font-medium truncate">{fav.title}</h4></div>{fav.desc && <p className="text-xs text-zinc-500 truncate">{fav.desc}</p>}</div></div></GlassCard>))}</div></section>
    </div>
  );
};

const HistoryView = ({ history, playAudio }: any) => {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6"><History className="text-zinc-900 dark:text-white" size={28} /><h2 className="text-2xl font-serif text-zinc-900 dark:text-white">Histórico</h2></div>
      {history.length === 0 ? (<p className="text-zinc-500">Nenhum áudio reproduzido ainda.</p>) : (<div className="space-y-3">{history.map((item: any, idx: number) => (<GlassCard key={idx} onClick={() => playAudio(item.url, item.title)} className="flex items-center justify-between group active:scale-[0.98]"><div><h4 className="text-zinc-900 dark:text-white font-medium">{item.title}</h4><div className="flex items-center gap-2 mt-1"><Clock size={12} className="text-zinc-400"/><span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleString()}</span></div></div><div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play size={14} fill="currentColor" className="text-zinc-900 dark:text-white ml-0.5" /></div></GlassCard>))}</div>)}
    </div>
  );
};

const ManifestoView = ({ playAudio }: any) => (
  <div className="p-8 max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
    <Shield size={48} className="mx-auto text-zinc-400" />
    <h1 className="text-3xl font-serif text-zinc-900 dark:text-white">Manifesto Ético</h1>
    <div className="text-left space-y-4 text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
      <p>1. Acreditamos na autonomia humana. Não criamos dependência. Se você precisa deste app para viver, nós falhamos.</p>
      <p>2. Acreditamos na verdade da dor. Não vendemos pílulas mágicas de felicidade. Acolhemos a tristeza como parte do processo.</p>
      <p>3. Acreditamos na tríade. Consciência para ver, Julgamento para entender o sabotador, Presença para acalmar.</p>
    </div>
    <div className="flex justify-center gap-3">
       <Button onClick={() => playAudio(`${BASE_MEDIA_URL}/audio/manifesto/manifesto.mp3`, 'Manifesto dos Desacreditados')}><Play size={18} /> Ouvir</Button>
       <ShareButton onClick={() => copyToClipboard('https://app.triade.com/manifesto')} className="bg-zinc-100 dark:bg-zinc-800" />
    </div>
  </div>
);

const Sidebar = ({ current, navigate, isMobile }: any) => {
  const items = [
    { id: ROUTES.HOME, icon: Home, label: 'Início' },
    { id: ROUTES.BOOK, icon: BookOpen, label: 'Livro' },
    { id: ROUTES.LIBRARY, icon: Library, label: 'Biblioteca' },
    { id: ROUTES.SESSIONS, icon: Headphones, label: 'Sessões' },
    { id: ROUTES.IGENT, icon: MessageSquare, label: 'iGent' },
    { id: ROUTES.FAVORITES, icon: Heart, label: 'Favoritos' },
    { id: ROUTES.HISTORY, icon: History, label: 'Histórico' },
    { id: ROUTES.CONFIG, icon: Settings, label: 'Ajustes' }, 
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 flex justify-around p-2 pb-safe z-40 shadow-lg">
        {items.slice(0, 5).map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center p-2 rounded-lg transition-colors active:scale-90 ${current === item.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
            <item.icon size={24} strokeWidth={current === item.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 h-screen flex flex-col p-4 transition-colors duration-300">
      <div className="mb-8 px-2"><h1 className="font-serif font-bold text-zinc-900 dark:text-white tracking-tight">O PODER DOS<br/>DESACREDITADOS</h1></div>
      <nav className="flex-1 space-y-1">
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all active:scale-95 ${current === item.id ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'}`}>
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-900">
        <div className="px-3 py-2 bg-red-500/10 rounded border border-red-500/20"><p className="text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 mb-1"><Phone size={12} /> Ajuda 24h</p><p className="text-zinc-600 dark:text-zinc-400 text-xs">CVV: 188</p></div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [route, setRoute] = useState<Route>(ROUTES.ACCESS);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Favorites & History
  const [favorites, setFavorites] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('opd_favorites') || '[]'); } catch { return []; }
  });
  const [history, setHistory] = useState<any[]>(() => {
     try { return JSON.parse(localStorage.getItem('opd_history') || '[]'); } catch { return []; }
  });

  const toggleFavorite = (item: any) => {
    setFavorites(prev => {
      const newFavs = prev.find(f => f.id === item.id) ? prev.filter(f => f.id !== item.id) : [...prev, item];
      localStorage.setItem('opd_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (id: string) => !!favorites.find(f => f.id === id);

  const addToHistory = (url: string, title: string) => {
    setHistory(prev => {
        const newHistory = [{ url, title, timestamp: Date.now() }, ...prev.filter(h => h.url !== url)].slice(0, 50);
        localStorage.setItem('opd_history', JSON.stringify(newHistory));
        return newHistory;
    });
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, currentUrl: null, title: null, progress: 0 });

  useEffect(() => {
    const access = localStorage.getItem('opd_access_granted');
    if (access === 'true') {
        setIsAccessGranted(true);
        const onboarded = localStorage.getItem('opd_onboarding_complete');
        if (onboarded === 'true') { setOnboardingComplete(true); setRoute(ROUTES.HOME); } else { setRoute(ROUTES.ONBOARDING); }
    } else { setRoute(ROUTES.ACCESS); }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', () => setAudioState(prev => ({ ...prev, progress: (audio.currentTime / audio.duration) * 100 || 0 })));
    audio.addEventListener('ended', () => setAudioState(prev => ({ ...prev, isPlaying: false, progress: 100 })));

    // Injeta CSS para animações
    const style = document.createElement('style');
    style.innerHTML = `
      .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
      .animate-slide-down { animation: slideDown 0.3s ease-out; }
      .animate-slide-left { animation: slideLeft 0.3s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);

    return () => { window.removeEventListener('resize', handleResize); audio.pause(); };
  }, []);

  const playAudio = (url: string, title: string) => {
    if (!audioRef.current) return;
    
    if (audioState.currentUrl === url) {
      if (audioState.isPlaying) { audioRef.current.pause(); setAudioState(prev => ({ ...prev, isPlaying: false })); } 
      else { audioRef.current.play().catch(console.error); setAudioState(prev => ({ ...prev, isPlaying: true })); }
    } else {
      audioRef.current.src = url;
      audioRef.current.play().catch(() => alert("Áudio indisponível na demonstração."));
      setAudioState({ isPlaying: true, currentUrl: url, title, progress: 0 });
      addToHistory(url, title);
    }
  };

  const closeAudio = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setAudioState({ isPlaying: false, currentUrl: null, title: null, progress: 0 }); };

  const grantAccess = () => { localStorage.setItem('opd_access_granted', 'true'); setIsAccessGranted(true); setRoute(ROUTES.ONBOARDING); };
  const completeOnboarding = () => { localStorage.setItem('opd_onboarding_complete', 'true'); setOnboardingComplete(true); setRoute(ROUTES.HOME); closeAudio(); };

  const renderView = () => {
    const props = { playAudio, navigate: setRoute, toggleFavorite, isFavorite, audioState, favorites, history };
    switch (route) {
      case ROUTES.ACCESS: return <AccessGate onAccessGranted={grantAccess} />;
      case ROUTES.ONBOARDING: return <Onboarding onComplete={completeOnboarding} playAudio={playAudio} />;
      case ROUTES.HOME: return <HomeView {...props} />;
      case ROUTES.BOOK: return <BookReader {...props} />;
      case ROUTES.LIBRARY: return <LibraryView {...props} />;
      case ROUTES.SESSIONS: return <SessionsView {...props} />;
      case ROUTES.IGENT: return <IGentView {...props} />;
      case ROUTES.FAVORITES: return <FavoritesView {...props} />;
      case ROUTES.HISTORY: return <HistoryView {...props} />;
      case ROUTES.CONFIG: return <ConfigView isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} {...props} />;
      case ROUTES.MANIFESTO: return <ManifestoView {...props} />;
      default: return <HomeView {...props} />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-500">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-md text-zinc-800 dark:text-zinc-200 hover:scale-110 transition-transform active:scale-90" aria-label="Toggle Dark Mode">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>

          {!isAccessGranted || (!onboardingComplete && route === ROUTES.ONBOARDING) ? (
             <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950 absolute z-50">
               {renderView()}
               {route === ROUTES.ONBOARDING && <AudioPlayerBar state={audioState} togglePlay={() => playAudio(audioState.currentUrl!, audioState.title!)} close={closeAudio} />}
             </div>
          ) : (
            <>
              {!isMobile && <Sidebar current={route} navigate={setRoute} isMobile={false} />}
              <main className="flex-1 h-full overflow-hidden relative flex flex-col">
                {isMobile && <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 justify-between bg-white/90 dark:bg-zinc-950/90 backdrop-blur"><span className="font-serif font-bold text-zinc-900 dark:text-white">O PODER</span><div className="w-8"></div></div>}
                <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-32' : 'pb-24'} relative`}>{renderView()}</div>
              </main>
              {isMobile && <Sidebar current={route} navigate={setRoute} isMobile={true} />}
              <AudioPlayerBar state={audioState} togglePlay={() => playAudio(audioState.currentUrl!, audioState.title!)} close={closeAudio} />
            </>
          )}
        </div>
    </div>
  );
}

// Renderização Principal
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}