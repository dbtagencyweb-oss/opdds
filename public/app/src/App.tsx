import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AudioLines,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Cloud,
  Copy,
  DownloadCloud,
  Eye,
  EyeOff,
  FileText,
  Flame,
  GripVertical,
  Heart,
  Headphones,
  Home,
  Library,
  ListMusic,
  Lock,
  Mail,
  Menu,
  Moon,
  Music2,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  Shield,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  User,
  Users,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { usePagination } from './hooks/usePagination';
import { accessTokenPlans, accessTokens, bookChapters, onboardingSteps, pdfUrl, workbookPdfUrl } from './data/book';
import { bookGroups, pillarLetters } from './data/bookStructure';
import { pdfTextPages } from './data/pdfTextPages';
import Button from './components/Button';
import OnboardingModal from './components/OnboardingModal';
import ReaderShell from './components/ReaderShell';
import { PRODUCT_KEYS, PRODUCT_LABELS, ProductKey } from './config/products';
import { useTheme } from './theme/ThemeProvider';
import { hasLocalEntitlement, LocalPlan } from './services/entitlements';
import {
  AudioProgressEntry,
  LetterMeta,
  ReaderNote,
  getLocalWorkbookSavedAt,
  loadLocalAudioProgress,
  loadLocalLetterMeta,
  loadLocalLetters,
  loadLocalReaderNotes,
  loadLocalWorkbookAnswers,
  loadLocalWorkbookEntry,
  saveLocalAudioProgress,
  saveLocalLetterMeta,
  saveLocalLetters,
  saveLocalReaderNotes,
  saveLocalWorkbookAnswers,
  saveLocalWorkbookEntry,
} from './services/workbookStore';
import {
  AdminBookPageSummary,
  AdminBookAudioSummary,
  AdminEvent,
  AdminInviteResponse,
  AdminProduct,
  AuthUser,
  createAdminInvite,
  fetchAdminBookPageHistory,
  fetchAdminBookAudio,
  fetchAdminBookPages,
  fetchAdminEvents,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchCurrentUser,
  fetchPublishedAudioTracks,
  fetchPublishedBookPages,
  getStoredAuthUser,
  grantAdminPlan,
  grantAdminProduct,
  LocalUserRecord,
  loginAccount,
  publishAdminBookPage,
  publishAdminBookAudio,
  registerAccount,
  requestPasswordReset,
  revokeAdminProduct,
  resetPassword,
  saveAdminBookAudioMeta,
  saveAdminBookAudioOrder,
  saveAdminBookPageDraft,
  sendMindMessage,
  updateStoredAuthUser,
} from './services/auth';

const ROUTES = {
  ACCESS: 'access',
  ONBOARDING: 'onboarding',
  HOME: 'home',
  BOOK: 'book',
  LIBRARY: 'library',
  SESSIONS: 'sessions',
  COMMUNITY: 'community',
  IGENT: 'igent',
  FAVORITES: 'favorites',
  WORKBOOK: 'workbook',
  LETTERS: 'letters',
  MANIFESTO: 'manifesto',
  SETTINGS: 'settings',
  ADMIN: 'admin',
  READER: 'reader',
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];
type Plan = LocalPlan;
type AdminSection = 'overview' | 'readers' | 'book' | 'kiwify' | 'plans' | 'copy';

type AudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  coverUrl?: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
};

type AudioQueueItem = {
  url: string;
  title: string;
  label: string;
  chapterIndex: number;
  chapterId: string;
  chapterTitle: string;
  trackIndex: number;
  coverUrl?: string | null;
};

type SaveFeedback = 'idle' | 'saving' | 'saved';
type AdminAudioProductionStatus = 'ok' | 'review' | 'record' | 'placeholder';

const ADMIN_AUDIO_PRODUCTION_KEY = 'opd_admin_audio_production';
const ADMIN_AUDIO_ORDER_KEY = 'opd_admin_audio_order';
const WORKBOOK_INTRO_KEY = 'opd_workbook_intro_dismissed';
const WORKBOOK_WELCOME_AUDIO = '/media/audios/diario/boas-vindas-diego.mp3';

const audioProductionLabels: Record<AdminAudioProductionStatus, string> = {
  ok: 'OK',
  review: 'Revisar',
  record: 'Regravar',
  placeholder: 'Placeholder',
};

const workbookTransitionPhrases = [
  'Reconhecimento abre espaço. Família mostra o que preencheu esse espaço antes de você poder escolher.',
  'Família dá nome às lealdades. Luto mostra o que ainda ficou sem despedida.',
  'Luto reconhece a ausência. Trabalho pergunta quanto valor você colocou na utilidade.',
  'Trabalho separa valor de desempenho. Dor mostra onde você aprendeu a fugir para continuar.',
  'Dor revela a anestesia. Desejo devolve permissão para querer sem pedir desculpas.',
  'Desejo aponta o que ainda chama. Fé pergunta o que sobrou quando acreditar cansou.',
  'Fé atravessa o não saber. Escassez mostra onde a falta virou identidade.',
  'Escassez devolve escala. Vazio ensina a permanecer sem respostas prontas.',
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const AUDIO_BAR_COUNT = 18;
const idleAudioBars = Array.from({ length: AUDIO_BAR_COUNT }, () => 0.08);

const AudioFrequencyBars = ({ values }: { values: number[] }) => (
  <div className="audio-frequency-bars" aria-hidden="true">
    {values.map((value, index) => (
      <span
        key={index}
        style={{ '--bar-level': String(Math.max(0.06, Math.min(1, value || 0.08))) } as React.CSSProperties}
      />
    ))}
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete = 'current-password',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) => (
  <label>
    <span>{label}</span>
    <div className="password-input-wrap">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
      />
      <button type="button" onClick={onToggle} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </label>
);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
};

const navGroups = [
  {
    title: 'Jornada',
    items: [
      { id: ROUTES.HOME, label: 'Início', icon: Home },
      { id: ROUTES.BOOK, label: 'Livro', icon: BookOpen },
      { id: ROUTES.LIBRARY, label: 'Jornada', icon: Library },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { id: ROUTES.SESSIONS, label: 'Sessões', icon: AudioLines },
      { id: ROUTES.IGENT, label: 'iGentMIND', icon: Zap },
      { id: ROUTES.COMMUNITY, label: 'Comunidade', icon: Users },
    ],
  },
  {
    title: 'Pessoal',
    items: [
      { id: ROUTES.FAVORITES, label: 'Favoritos', icon: Heart },
      { id: ROUTES.WORKBOOK, label: 'Diário', icon: FileText },
      { id: ROUTES.LETTERS, label: 'Minhas cartas', icon: Mail },
      { id: ROUTES.MANIFESTO, label: 'Sobre', icon: Shield },
      { id: ROUTES.SETTINGS, label: 'Minha conta', icon: User },
      { id: ROUTES.ADMIN, label: 'Admin', icon: Users },
    ],
  },
];

const homeSlides = [
  '/media/imagens/capas/capa-topo.jpg',
  '/media/imagens/capas/capa.webp',
];

const journeyStates = [
  {
    title: 'Sobrevivência',
    desc: 'Estou em crise ou tentando não entrar em pânico.',
    audioUrl: '/media/audios/home/sobrevivencia.mp3',
    chapter: 8,
  },
  {
    title: 'Reconstrução',
    desc: 'Estou tentando me reerguer sem me violentar.',
    audioUrl: '/media/audios/home/reconstrucao.mp3',
    chapter: 11,
  },
  {
    title: 'Continuidade',
    desc: 'Quero manter o equilíbrio depois do impacto.',
    audioUrl: '/media/audios/home/continuidade.mp3',
    chapter: 14,
  },
];

const workbookPrompts = [
  'O que eu estou tentando carregar sem admitir?',
  'Qual julgamento antigo voltou a parecer verdade hoje?',
  'Onde eu permaneci mesmo sem ter certeza?',
  'Que pequeno gesto de presença cabe nas próximas horas?',
];

const workbookPillars = [
  {
    roman: 'I',
    title: 'Reconhecimento',
    subtitle: 'Onde a negação cessa.',
    intro: 'Este pilar pede uma fotografia honesta do agora: o que pesa, o que ainda vive e o que você vem fingindo não perceber.',
    questions: [
      'O que em mim precisa ser reconhecido antes de ser consertado?',
      'Qual parte da minha história eu ainda tento esconder para parecer forte?',
      'Que verdade pequena, se aceita hoje, já diminuiria o peso?',
    ],
  },
  {
    roman: 'II',
    title: 'Família',
    subtitle: 'Lealdades invisíveis.',
    intro: 'Aqui você olha para heranças emocionais sem transformar ninguém em vilão. O foco é entender o que foi recebido e o que não precisa continuar.',
    questions: [
      'Que papel eu aprendi a ocupar para ser aceito?',
      'Que culpa não nasceu em mim, mas ainda dirige minhas escolhas?',
      'Qual limite me devolveria dignidade sem apagar minha origem?',
    ],
  },
  {
    roman: 'III',
    title: 'Luto',
    subtitle: 'Quando a ausência permanece.',
    intro: 'O luto também alcança versões, promessas, lugares e futuros que não aconteceram.',
    questions: [
      'Que ausência eu ainda tento tratar como se não tivesse acontecido?',
      'O que mudou de forma definitiva e ainda não recebeu despedida?',
      'Como posso honrar o que existiu sem interromper a minha própria vida?',
    ],
  },
  {
    roman: 'IV',
    title: 'Trabalho',
    subtitle: 'Valor e identidade.',
    intro: 'Este pilar separa desempenho de existência e utilidade de dignidade.',
    questions: [
      'Onde eu confundo meu valor com aquilo que consigo entregar?',
      'O que o descanso desperta em mim: culpa, medo ou sensação de inutilidade?',
      'Como seria trabalhar sem usar desempenho como prova de existência?',
    ],
  },
  {
    roman: 'V',
    title: 'Dor',
    subtitle: 'Fuga e anestesia.',
    intro: 'Toda fuga começou tentando proteger alguma parte sua. Aqui você aprende a reconhecer a dor sem virar a própria dor.',
    questions: [
      'Qual comportamento me anestesia, mas cobra caro depois?',
      'Que sensação costuma aparecer imediatamente antes da fuga?',
      'O que me ajudaria a permanecer trinta segundos a mais comigo?',
    ],
  },
  {
    roman: 'VI',
    title: 'Desejo',
    subtitle: 'Amor e frustração.',
    intro: 'Aqui você observa desejo, projeção, carência e escolha sem transformar o outro em prova do seu valor.',
    questions: [
      'Que falta eu tento resolver dentro de outra pessoa?',
      'Onde intensidade, ansiedade e desejo se confundem para mim?',
      'O que eu escolheria se não precisasse usar o amor como prova?',
    ],
  },
  {
    roman: 'VII',
    title: 'Fé',
    subtitle: 'Sentido e desencanto.',
    intro: 'Fé não é resposta pronta. É sustentar espaço interno mesmo quando a certeza não vem.',
    questions: [
      'Em que ponto acreditar começou a parecer perigoso ou ingênuo?',
      'Que tipo de sentido eu ainda tento forçar para não admitir que não sei?',
      'O que pode permanecer aberto sem precisar de resposta hoje?',
    ],
  },
  {
    roman: 'VIII',
    title: 'Escassez',
    subtitle: 'Medo e sustentação.',
    intro: 'A falta é uma circunstância, não uma identidade. Este pilar devolve escala ao que parece urgência total.',
    questions: [
      'O que está faltando de verdade, de forma concreta?',
      'O que ainda existe e a urgência tem me impedido de enxergar?',
      'Qual é a próxima ação mínima possível com os recursos de agora?',
    ],
  },
  {
    roman: 'IX',
    title: 'Vazio',
    subtitle: 'Presença e continuidade.',
    intro: 'O vazio não precisa ser preenchido imediatamente. Ele pode se tornar um espaço habitável.',
    questions: [
      'O que eu tento preencher imediatamente quando o silêncio aparece?',
      'Como meu corpo reage quando não há resposta nem próxima etapa?',
      'Que pacto pequeno me ajuda a não desaparecer de mim?',
    ],
  },
];

const planLabels: Record<Plan, string> = {
  pdf: 'PDF',
  basic: 'Livro + App',
  workbook: 'Diário',
  igent30: 'iGentMIND 30 dias',
  igent90: 'iGentMIND 90 dias',
  group: 'Grupo',
  vip: 'VIP',
};

type UpgradeKey = 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';

const upgradeOffers: Record<UpgradeKey, {
  title: string;
  eyebrow: string;
  description: string;
  price: string;
  checkoutUrl: string;
  plan: Plan;
  productKeys: ProductKey[];
}> = {
  basic: {
    title: 'Livro interativo + áudios',
    eyebrow: 'Upgrade de leitura',
    description: 'Desbloqueia capítulos no app, biblioteca, sessões de áudio e leitura guiada estilo Kindle.',
    price: 'R$ 27',
    checkoutUrl: 'https://pay.kiwify.com.br/cJ4T7JR',
    plan: 'basic',
    productKeys: [PRODUCT_KEYS.base],
  },
  workbook: {
    title: 'Diário dos Desacreditados',
    eyebrow: 'Workbook',
    description: 'Área para escrever, salvar reflexões e atravessar os pilares com perguntas guiadas.',
    price: 'R$ 17',
    checkoutUrl: 'https://pay.kiwify.com.br/sT7TVjJ',
    plan: 'workbook',
    productKeys: [PRODUCT_KEYS.workbook],
  },
  igent30: {
    title: 'iGentMIND - 30 dias',
    eyebrow: 'Mentor de leitura',
    description: 'Conselheiro motivador que cruza sentimentos, pilares e trechos do livro para orientar sua próxima leitura.',
    price: 'R$ 27',
    checkoutUrl: 'https://pay.kiwify.com.br/3rj0NbN',
    plan: 'igent30',
    productKeys: [PRODUCT_KEYS.igentMind30],
  },
  igent90: {
    title: 'iGentMIND - Mentor Psicanalítico',
    eyebrow: 'Mentoria estendida',
    description: 'Acesso ampliado ao iGentMIND, com recomendações por tema, pilar e estado emocional.',
    price: 'R$ 67',
    checkoutUrl: 'https://pay.kiwify.com.br/yYaKNrk',
    plan: 'igent90',
    productKeys: [PRODUCT_KEYS.igentMind90],
  },
  group: {
    title: 'Comunidade Viva dos Desacreditados',
    eyebrow: 'Grupo de apoio',
    description: 'Acesso ao grupo/comunidade para continuidade, apoio e acompanhamento da jornada.',
    price: 'R$ 197',
    checkoutUrl: 'https://pay.kiwify.com.br/SHxtsOn',
    plan: 'group',
    productKeys: [PRODUCT_KEYS.group],
  },
  vip: {
    title: 'Pacote completo OPDDS',
    eyebrow: 'Acesso total',
    description: 'Livro interativo, áudios, Diário, iGentMIND e grupo em um único pacote.',
    price: 'Pacote',
    checkoutUrl: 'https://pay.kiwify.com.br/yYaKNrk',
    plan: 'vip',
    productKeys: [PRODUCT_KEYS.base, PRODUCT_KEYS.workbook, PRODUCT_KEYS.igentMind90, PRODUCT_KEYS.group, PRODUCT_KEYS.vip],
  },
};

const upgradeActiveProductKeys: Record<UpgradeKey, ProductKey> = {
  basic: PRODUCT_KEYS.base,
  workbook: PRODUCT_KEYS.workbook,
  igent30: PRODUCT_KEYS.igentMind30,
  igent90: PRODUCT_KEYS.igentMind90,
  group: PRODUCT_KEYS.group,
  vip: PRODUCT_KEYS.vip,
};

const eventLabels: Record<string, string> = {
  INVITE_CREATED: 'Convite criado',
  ACCESS_GRANTED: 'Acesso liberado',
  RENEWAL_GRANTED: 'Renovação',
  ACCESS_REFUNDED: 'Reembolso/chargeback',
  ACCESS_CANCELED: 'Cancelamento',
  IGNORED: 'Ignorado',
  APPROVED_IGNORED: 'Compra ignorada',
  RENEWAL_IGNORED: 'Renovação ignorada',
  PLAN_GRANTED: 'Plano manual',
  PRODUCT_GRANTED: 'Produto manual',
  PRODUCT_REVOKED: 'Produto removido',
};

const eventTone = (eventType: string) => {
  if (eventType.includes('REFUNDED') || eventType.includes('CANCELED') || eventType.includes('REVOKED')) return 'danger';
  if (eventType.includes('IGNORED')) return 'muted';
  if (eventType.includes('GRANTED') || eventType.includes('CREATED')) return 'success';
  return 'neutral';
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const maskAccessToken = (value?: string | null) => {
  if (!value) return 'nenhum';
  if (value.startsWith('OPDDS_')) return `${value.slice(0, 12)}...${value.slice(-4)}`;
  if (value.startsWith('LOCAL_')) return 'acesso local';
  return `sessao segura ...${value.slice(-8)}`;
};

const pillarCards = [
  { title: 'Reconhecimento', desc: 'Onde a negação cessa.', icon: Sparkles, chapter: 8 },
  { title: 'Família', desc: 'Lealdades invisíveis.', icon: Boxes, chapter: 9 },
  { title: 'Luto', desc: 'Quando a ausência permanece.', icon: Cloud, chapter: 10 },
  { title: 'Trabalho', desc: 'Quando produzir deixa de significar existir.', icon: Briefcase, chapter: 11 },
  { title: 'Dor', desc: 'Dor, fuga e anestesia.', icon: Flame, chapter: 12 },
  { title: 'Desejo', desc: 'Amor, projeção e frustração.', icon: Heart, chapter: 13 },
  { title: 'Fé', desc: 'Sentido e desencanto.', icon: Sparkles, chapter: 14 },
  { title: 'Escassez', desc: 'Ver a falta sem se tornar falta.', icon: AlertCircle, chapter: 15 },
  { title: 'Vazio', desc: 'Presença e continuidade.', icon: RotateCcw, chapter: 16 },
];

const mentorTopics = [
  { id: 'culpa', title: 'Culpa', icon: AlertCircle, color: '#ff7474', audioUrl: '/media/audios/livro/pilar-01-reconhecimento/p1-julgamento.wav' },
  { id: 'recaida', title: 'Recaída', icon: RotateCcw, color: '#ff8f2c', audioUrl: '/media/audios/livro/pilar-09-continuidade/p9-manifesto.wav' },
  { id: 'luto', title: 'Luto', icon: Cloud, color: '#a7a8b5', audioUrl: '/media/audios/livro/pilar-04-luto/p4-manifesto.wav' },
  { id: 'desejo', title: 'Desejo', icon: Flame, color: '#ff5f8a', audioUrl: '/media/audios/livro/pilar-07-fuga/p7-manifesto.wav' },
  { id: 'fe', title: 'Fé quebrada', icon: Sparkles, color: '#b987ff', audioUrl: '/media/audios/livro/pilar-08-fe/p8-manifesto.wav' },
  { id: 'solidao', title: 'Solidão', icon: Brain, color: '#7384ff', audioUrl: '/media/audios/livro/pilar-03-vinculo/p3-manifesto.wav' },
  { id: 'fracasso', title: 'Fracasso', icon: Zap, color: '#e6b800', audioUrl: '/media/audios/livro/pilar-05-trabalho/p5-manifesto.wav' },
  { id: 'ansiedade', title: 'Ansiedade', icon: AudioLines, color: '#22d3ee', audioUrl: '/media/audios/livro/pilar-01-reconhecimento/p1-presenca.wav' },
  { id: 'pressao', title: 'Pressão', icon: Volume2, color: '#34d399', audioUrl: '/media/audios/livro/pilar-09-continuidade/p9-narrativa.wav' },
];

const sensoryClicks = {
  primary: { frequency: 520, duration: 0.055 },
  soft: { frequency: 320, duration: 0.04 },
};

type MindMessage = {
  id: string;
  from: 'agent' | 'user';
  text: string;
  kind?: 'intro' | 'plan';
  replies?: string[];
  recommendations?: MindRecommendation[];
};

type MindRecommendation = {
  chapterIndex: number;
  title: string;
  excerpt: string;
  reason: string;
  audioUrl: string | null;
};

type MindSavedPlan = {
  topicId: string;
  topicTitle: string;
  source: 'chat' | 'home' | 'workbook' | 'reader';
  prompt: string;
  response: string;
  chapterIndex: number;
  createdAt: string;
};

const MIND_LAST_PLAN_KEY = 'opd_mind_last_plan';
const APP_VERSION = 'v1.3.0';

const repairMojibake = (value = '') => {
  const text = String(value ?? '');
  if (!/[ÃÂâð]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from(Array.from(text).map((char) => char.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return text
      .replaceAll('vocÃª', 'você')
      .replaceAll('nÃ£o', 'não')
      .replaceAll('Ã©', 'é')
      .replaceAll('Ã¡', 'á')
      .replaceAll('Ã­', 'í')
      .replaceAll('Ã³', 'ó')
      .replaceAll('Ã§', 'ç')
      .replaceAll('Ã£', 'ã')
      .replaceAll('Ãª', 'ê')
      .replaceAll('â€”', '-')
      .replaceAll('â€œ', '“')
      .replaceAll('â€', '”');
  }
};

const repairBrokenPdfCharacters = (value = '') => {
  const broken = '[\\uFFFD\\u00EF\\u00BF\\u00BD]+';
  const replacements: Array<[RegExp, string]> = [
    [new RegExp(`PRESEN${broken}A`, 'g'), 'PRESEN\u00c7A'],
    [new RegExp(`Presen${broken}a`, 'g'), 'Presen\u00e7a'],
    [new RegExp(`presen${broken}a`, 'g'), 'presen\u00e7a'],
    [new RegExp(`SENSA${broken}O`, 'g'), 'SENSA\u00c7\u00c3O'],
    [new RegExp(`Sensa${broken}o`, 'g'), 'Sensa\u00e7\u00e3o'],
    [new RegExp(`sensa${broken}o`, 'g'), 'sensa\u00e7\u00e3o'],
    [new RegExp(`MOTIVA${broken}O`, 'g'), 'MOTIVA\u00c7\u00c3O'],
    [new RegExp(`Motiva${broken}o`, 'g'), 'Motiva\u00e7\u00e3o'],
    [new RegExp(`motiva${broken}o`, 'g'), 'motiva\u00e7\u00e3o'],
    [new RegExp(`ORIENTA${broken}O`, 'g'), 'ORIENTA\u00c7\u00c3O'],
    [new RegExp(`Orienta${broken}o`, 'g'), 'Orienta\u00e7\u00e3o'],
    [new RegExp(`orienta${broken}o`, 'g'), 'orienta\u00e7\u00e3o'],
    [new RegExp(`CONSCI${broken}NCIA`, 'g'), 'CONSCI\u00caNCIA'],
    [new RegExp(`Consci${broken}ncia`, 'g'), 'Consci\u00eancia'],
    [new RegExp(`consci${broken}ncia`, 'g'), 'consci\u00eancia'],
    [new RegExp(`TR${broken}ADE`, 'g'), 'TR\u00cdADE'],
    [new RegExp(`Tr${broken}ade`, 'g'), 'Tr\u00edade'],
    [new RegExp(`tr${broken}ade`, 'g'), 'tr\u00edade'],
    [new RegExp(`RECONSTRU${broken}O`, 'g'), 'RECONSTRU\u00c7\u00c3O'],
    [new RegExp(`Reconstru${broken}o`, 'g'), 'Reconstru\u00e7\u00e3o'],
    [new RegExp(`reconstru${broken}o`, 'g'), 'reconstru\u00e7\u00e3o'],
    [new RegExp(`FOR${broken}A`, 'g'), 'FOR\u00c7A'],
    [new RegExp(`For${broken}a`, 'g'), 'For\u00e7a'],
    [new RegExp(`for${broken}a`, 'g'), 'for\u00e7a'],
    [new RegExp(`DIF${broken}CIL`, 'g'), 'DIF\u00cdCIL'],
    [new RegExp(`Dif${broken}cil`, 'g'), 'Dif\u00edcil'],
    [new RegExp(`dif${broken}cil`, 'g'), 'dif\u00edcil'],
    [new RegExp(`IMPRESS${broken}O`, 'g'), 'IMPRESS\u00c3O'],
    [new RegExp(`Impress${broken}o`, 'g'), 'Impress\u00e3o'],
    [new RegExp(`impress${broken}o`, 'g'), 'impress\u00e3o'],
    [new RegExp(`N${broken}O`, 'g'), 'N\u00c3O'],
    [new RegExp(`N${broken}o`, 'g'), 'N\u00e3o'],
    [new RegExp(`n${broken}o`, 'g'), 'n\u00e3o'],
    [new RegExp(`J${broken}`, 'g'), 'J\u00c1'],
    [new RegExp(`j${broken}`, 'g'), 'j\u00e1'],
    [new RegExp(`\u00c2NCORA PR${broken}TICA`, 'g'), '\u00c2NCORA PR\u00c1TICA'],
    [new RegExp(`\u00c2ncora pr${broken}tica`, 'g'), '\u00c2ncora pr\u00e1tica'],
    [new RegExp(`ancora pr${broken}tica`, 'gi'), '\u00e2ncora pr\u00e1tica'],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), repairMojibake(value));
};

const normalizeForSearch = (value = '') =>
  repairBrokenPdfCharacters(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const audioTrackKey = (value = '') =>
  normalizeForSearch(value)
    .replace(/^(p\d+\s*)?/, '')
    .replace(/\s+/g, '-')
    .trim();

const compactLetterSpacedLine = (line: string) => {
  const clean = line.trim();
  if (/[\uFFFD\u00EF\u00BF\u00BD]/.test(clean)) return line.replace(/[ \t]{2,}/g, ' ').trimEnd();
  const lettersOnly = clean.replace(/[^\p{L}]/gu, '');
  if (lettersOnly.length < 4) return line.replace(/[ \t]{2,}/g, ' ').trimEnd();
  if (/\s{2,}/.test(clean) && /^\p{L}(?:\s+\p{L}){3,}/u.test(clean)) {
    return clean
      .split(/\s{2,}/)
      .map((chunk) => chunk.replace(/\s+/g, ''))
      .join(' ');
  }
  return line.replace(/[ \t]{2,}/g, ' ').trimEnd();
};

const cleanBookEditorText = (value = '') =>
  repairBrokenPdfCharacters(value)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => compactLetterSpacedLine(line))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const getChapterKind = (index: number, title = '') => {
  const normalized = normalizeForSearch(title);
  if (normalized.includes('pilar')) return title.split('—')[0]?.trim() || 'Pilar';
  if (normalized.includes('prefacio')) return 'Prefácio';
  if (normalized.includes('introducao')) return 'Introdução';
  if (normalized.includes('posfacio')) return 'Posfácio';
  if (normalized.includes('epilogo')) return 'Epílogo';
  if (normalized.includes('carta')) return 'Carta final';
  if (index >= 8 && index <= 16) return `Pilar ${String(index - 7).padStart(2, '0')}`;
  return 'Livro';
};

const trimExcerpt = (value = '', limit = 260) => {
  const clean = repairMojibake(value).replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, '').trim()}...`;
};

const mindGuides: Record<string, {
  opening: string;
  firstQuestion: string;
  quickReplies: string[];
  chapterHint: number;
  counterpoint: string;
  practice: string;
  keywords: string[];
}> = {
  culpa: {
    opening: 'Culpa tenta te convencer de que uma falha virou identidade. Vamos separar responsabilidade de sentença.',
    firstQuestion: 'Quando você pensa nisso, qual frase mais te acusa por dentro?',
    quickReplies: ['Eu devia ter feito mais', 'Eu estraguei tudo', 'Não consigo me perdoar', 'Tenho medo de repetir'],
    chapterHint: 8,
    counterpoint: 'Você pode reconhecer um erro sem entregar sua existência inteira para ele.',
    practice: 'Escreva uma frase começando com: “Eu assumo o que cabe a mim, mas não aceito ser reduzido a isso.”',
    keywords: ['culpa', 'julgamento', 'falha', 'perdao', 'acusacao', 'erro', 'sentenca', 'reconhecimento'],
  },
  recaida: {
    opening: 'Recaída não é volta ao zero. É um ponto do caminho pedindo mais honestidade, não mais punição.',
    firstQuestion: 'O que você está chamando de recaída: um comportamento, um pensamento ou um cansaço?',
    quickReplies: ['Comportamento', 'Pensamento', 'Cansaço', 'Vergonha de tentar de novo'],
    chapterHint: 16,
    counterpoint: 'Quem continua depois de cair não perdeu o processo; está aprendendo onde precisa de apoio.',
    practice: 'Escolha um gesto mínimo para as próximas duas horas. Pequeno o bastante para ser cumprido.',
    keywords: ['recaida', 'continuidade', 'cair', 'recomecar', 'processo', 'vergonha', 'permanecer'],
  },
  luto: {
    opening: 'Luto não é só perda de alguém. Às vezes é perda de uma versão sua que não volta.',
    firstQuestion: 'O que exatamente parece não voltar agora?',
    quickReplies: ['Uma pessoa', 'Uma fase da vida', 'Minha confiança', 'A vontade de continuar'],
    chapterHint: 10,
    counterpoint: 'Aceitar que algo não volta não significa aceitar que nada mais nasce.',
    practice: 'Nomeie a ausência sem brigar com ela. Depois nomeie uma presença pequena que ainda ficou.',
    keywords: ['luto', 'perda', 'ausencia', 'volta', 'despedida', 'vazio', 'saudade'],
  },
  desejo: {
    opening: 'Desejo assusta quando parece maior que a coragem. Mas ele também pode revelar vida onde você só via desistência.',
    firstQuestion: 'O que você deseja e tem medo de admitir?',
    quickReplies: ['Mudar de vida', 'Ser escolhido', 'Ir embora', 'Começar algo meu'],
    chapterHint: 13,
    counterpoint: 'Nem todo desejo é fuga. Alguns são mapas que você ainda não aprendeu a ler.',
    practice: 'Pergunte: “Esse desejo me tira de mim ou me devolve para mim?”',
    keywords: ['desejo', 'fuga', 'mudanca', 'vontade', 'medo', 'ir embora', 'reconstrucao'],
  },
  fe: {
    opening: 'Fé quebrada não é ausência de profundidade. Às vezes é a alma recusando respostas fáceis.',
    firstQuestion: 'O que quebrou primeiro: sua crença, sua confiança ou sua paciência?',
    quickReplies: ['Minha crença', 'Minha confiança', 'Minha paciência', 'Minha esperança'],
    chapterHint: 14,
    counterpoint: 'Você não precisa fingir certeza para continuar. Presença já é uma forma de fé.',
    practice: 'Respire e diga: “Hoje eu não preciso explicar tudo. Preciso só não me abandonar.”',
    keywords: ['fe', 'esperanca', 'crenca', 'presenca', 'certeza', 'alma', 'sentido'],
  },
  solidao: {
    opening: 'Solidão machuca mais quando vira prova de que você não importa. Essa prova é falsa.',
    firstQuestion: 'Sua solidão hoje parece abandono, invisibilidade ou proteção?',
    quickReplies: ['Abandono', 'Invisibilidade', 'Proteção', 'Cansaço de pedir presença'],
    chapterHint: 9,
    counterpoint: 'Estar sem companhia não confirma que você é impossível de amar.',
    practice: 'Mande uma mensagem simples para alguém seguro ou escreva o que você gostaria de ouvir.',
    keywords: ['solidao', 'vinculo', 'abandono', 'pertencer', 'invisibilidade', 'companhia'],
  },
  fracasso: {
    opening: 'Fracasso é uma palavra pesada demais para um recorte da sua história.',
    firstQuestion: 'Quem te ensinou a chamar esse momento de fracasso?',
    quickReplies: ['Minha família', 'Comparação', 'Eu mesmo', 'O dinheiro/trabalho'],
    chapterHint: 11,
    counterpoint: 'Resultado ruim não é identidade ruim. Você é mais amplo que a última tentativa.',
    practice: 'Liste três coisas que você aprendeu sem transformar aprendizado em castigo.',
    keywords: ['fracasso', 'trabalho', 'valor', 'resultado', 'producao', 'comparacao', 'tentativa'],
  },
  ansiedade: {
    opening: 'Ansiedade tenta te sequestrar para um futuro que ainda não aconteceu. Vamos voltar um passo.',
    firstQuestion: 'O medo está apontando para qual cenário?',
    quickReplies: ['Vou perder algo', 'Vão me rejeitar', 'Não vou dar conta', 'Algo ruim vai acontecer'],
    chapterHint: 8,
    counterpoint: 'Prever desastre não é o mesmo que estar preparado. Preparação começa no corpo presente.',
    practice: 'Solte os ombros, descruze a mandíbula e conte cinco objetos ao seu redor.',
    keywords: ['ansiedade', 'medo', 'futuro', 'desastre', 'corpo', 'presenca', 'controle'],
  },
  pressao: {
    opening: 'Pressão vira prisão quando tudo parece urgente e nada parece suficiente.',
    firstQuestion: 'Qual cobrança está falando mais alto agora?',
    quickReplies: ['Ser forte', 'Dar resultado', 'Não decepcionar', 'Resolver tudo hoje'],
    chapterHint: 16,
    counterpoint: 'Você não precisa carregar como prova de valor aquilo que está te quebrando.',
    practice: 'Escolha uma coisa para adiar sem culpa e uma coisa pequena para concluir.',
    keywords: ['pressao', 'cobranca', 'urgencia', 'valor', 'trabalho', 'continuidade', 'cansaco'],
  },
};

export function App() {
  const { darkMode, toggleTheme } = useTheme();
  const brandLogo = darkMode
    ? '/media/imagens/brand/lettering_logo_fp.webp'
    : '/media/imagens/brand/logo_opdds_fd_claro.webp';
  const [route, setRoute] = useState<Route>(ROUTES.ACCESS);
  const [plan, setPlan] = useState<Plan>('vip');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [adminReaders, setAdminReaders] = useState<LocalUserRecord[]>([]);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>([]);
  const [adminBookPages, setAdminBookPages] = useState<AdminBookPageSummary[]>([]);
  const [adminBookAudio, setAdminBookAudio] = useState<AdminBookAudioSummary[]>([]);
  const [adminBookPageHistory, setAdminBookPageHistory] = useState<any[]>([]);
  const [adminBookPageNumber, setAdminBookPageNumber] = useState(1);
  const [adminBookPageTitle, setAdminBookPageTitle] = useState('');
  const [adminBookPageContent, setAdminBookPageContent] = useState('');
  const [adminAudioChapterId, setAdminAudioChapterId] = useState(bookChapters[0]?.id || '');
  const [adminAudioSectionKey, setAdminAudioSectionKey] = useState('');
  const [adminAudioLabel, setAdminAudioLabel] = useState('');
  const [adminAudioUrl, setAdminAudioUrl] = useState('');
  const [adminAudioProduction, setAdminAudioProduction] = useState<Record<string, { status: AdminAudioProductionStatus; note: string; coverUrl?: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_AUDIO_PRODUCTION_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [adminAudioOrder, setAdminAudioOrder] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_AUDIO_ORDER_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [adminAudioDraggingKey, setAdminAudioDraggingKey] = useState('');
  const [adminSelectedUserId, setAdminSelectedUserId] = useState('');
  const [adminInvite, setAdminInvite] = useState({ name: '', email: '', plan: 'basic' as Plan, expiresInDays: '' });
  const [adminGrant, setAdminGrant] = useState({ plan: 'vip' as Plan, productKey: PRODUCT_KEYS.workbook, expiresInDays: '' });
  const [adminResult, setAdminResult] = useState<AdminInviteResponse | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [adminBookTab, setAdminBookTab] = useState<'pages' | 'audio'>('pages');
  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminBookCompareOpen, setAdminBookCompareOpen] = useState(false);
  const [bookPageOverrides, setBookPageOverrides] = useState<Record<number, string>>({});
  const [bookAudioOverrides, setBookAudioOverrides] = useState<Record<string, { chapterId: string; sectionKey: string; label: string; url: string; coverUrl?: string | null }>>({});
  const [upgradeModal, setUpgradeModal] = useState<UpgradeKey | null>(null);
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as any).standalone);
  });
  const [pwaIntroDismissed, setPwaIntroDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('opd_pwa_intro_dismissed') === 'true';
  });
  const [pwaMessage, setPwaMessage] = useState('');
  const [showReaderNarrationButton, setShowReaderNarrationButton] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('opd_show_reader_narration') !== 'false';
  });
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot' | 'reset'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthPasswordConfirm, setShowAuthPasswordConfirm] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [pageIndex, setPageIndex] = useState(0);
  const [pdfPage, setPdfPage] = useState(10);
  const [totalPdfPages, setTotalPdfPages] = useState(286);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentUrl: null,
    title: null,
    coverUrl: null,
    currentTime: 0,
    duration: 0,
    volume: 0.84,
    playbackRate: 1,
  });
  const [audioFullOpen, setAudioFullOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeMentorTopic, setActiveMentorTopic] = useState(mentorTopics[7]);
  const [mindStep, setMindStep] = useState<'select' | 'chat'>('select');
  const [mindInput, setMindInput] = useState('');
  const [mindMessages, setMindMessages] = useState<MindMessage[]>([]);
  const [mindSessionId, setMindSessionId] = useState<string | undefined>();
  const [mindLoading, setMindLoading] = useState(false);
  const [pendingMindPrompt, setPendingMindPrompt] = useState('');
  const [pendingMindSource, setPendingMindSource] = useState<MindSavedPlan['source']>('chat');
  const [mindSavedPlan, setMindSavedPlan] = useState<MindSavedPlan | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(MIND_LAST_PLAN_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [homeSlideIndex, setHomeSlideIndex] = useState(0);
  const [activeJourneyStateIndex, setActiveJourneyStateIndex] = useState(1);
  const [workbookEntry, setWorkbookEntry] = useState('');
  const [workbookPrompt, setWorkbookPrompt] = useState(workbookPrompts[0]);
  const [workbookPillarIndex, setWorkbookPillarIndex] = useState(0);
  const [workbookAnswers, setWorkbookAnswers] = useState<Record<string, string>>({});
  const [workbookIntroDismissed, setWorkbookIntroDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(WORKBOOK_INTRO_KEY) === 'true';
  });
  const [workbookTransition, setWorkbookTransition] = useState('');
  const [letterIndex, setLetterIndex] = useState(0);
  const [readerLetters, setReaderLetters] = useState<Record<string, string>>({});
  const [letterMeta, setLetterMeta] = useState<Record<string, LetterMeta>>({});
  const [readerNotes, setReaderNotes] = useState<ReaderNote[]>([]);
  const [workbookSaveStatus, setWorkbookSaveStatus] = useState<SaveFeedback>('idle');
  const [letterSaveStatus, setLetterSaveStatus] = useState<SaveFeedback>('idle');
  const [noteSaveStatus, setNoteSaveStatus] = useState<SaveFeedback>('idle');
  const [audioProgressMap, setAudioProgressMap] = useState<Record<string, AudioProgressEntry>>({});
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(idleAudioBars);
  const readerName = authUser?.name?.trim() || authName || 'Sobrevivente';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<AudioContext | null>(null);
  const audioAnalysisContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioFrequencyDataRef = useRef<Uint8Array | null>(null);
  const audioSpectrumFrameRef = useRef<number | null>(null);
  const lastSpectrumTickRef = useRef(0);
  const lastAudioTickRef = useRef(0);
  const lastAudioPersistRef = useRef(0);
  const currentAudioUrlRef = useRef<string | null>(null);
  const audioProgressMapRef = useRef<Record<string, AudioProgressEntry>>({});
  const audiobookQueueRef = useRef<AudioQueueItem[]>([]);
  const audioSettingsRef = useRef({ volume: 0.84, playbackRate: 1 });
  const adminBookPageTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveFeedbackTimersRef = useRef<Record<string, { saved?: number; idle?: number }>>({});

  const selectedChapter = bookChapters[currentChapterIndex] ?? bookChapters[0];
  const pages = usePagination(selectedChapter.content);
  const readProgress = Math.round(((currentChapterIndex + 1) / Math.max(1, bookChapters.length)) * 100);
  const pdfReadProgress = Math.round((pdfPage / Math.max(1, totalPdfPages)) * 100);
  const audioProgress = audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0;
  const hasPdfAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.pdf);
  const hasReaderAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.base);
  const hasWorkbookAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.workbook);
  const hasMindAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.igentMind30) || hasLocalEntitlement(plan, PRODUCT_KEYS.igentMind90) || hasLocalEntitlement(plan, PRODUCT_KEYS.vip);
  const hasGroupAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.group);
  const hasOrderBump = hasWorkbookAccess || hasMindAccess || hasGroupAccess;
  const isAdmin = authUser?.role === 'ADMIN';
  const currentProducts = (authUser?.products?.length ? authUser.products : Object.values(PRODUCT_KEYS).filter((productKey) => hasLocalEntitlement(plan, productKey as ProductKey)));
  const upgradeEntries = Object.entries(upgradeOffers) as Array<[UpgradeKey, typeof upgradeOffers[UpgradeKey]]>;
  const lockedUpgradeCount = upgradeEntries.filter(([key]) => !currentProducts.includes(upgradeActiveProductKeys[key])).length;
  const currentGroup = bookGroups.find((group) => group.id === selectedChapter.groupId) ?? bookGroups[0];
  const writtenLettersCount = pillarLetters.filter((letter) => readerLetters[letter.id]?.trim()).length;
  const totalAudioTracks = bookChapters.reduce((total, chapter) => total + chapter.audioTracks.length, 0);
  const heardAudioCount = Object.values(audioProgressMap).filter((entry) => entry.heard).length;
  const currentPageNote = readerNotes.find((note) => note.page === pdfPage);
  const currentPillarLetter = selectedChapter.pillar ? pillarLetters[selectedChapter.pillar - 1] : null;
  const mergedPdfTextPages = useMemo(
    () => pdfTextPages.map((text, index) => bookPageOverrides[index + 1] || text),
    [bookPageOverrides],
  );

  const selectedChapterAudioTracks = useMemo(
    () => selectedChapter.audioTracks.map((track) => {
      const key = `${selectedChapter.id}:${audioTrackKey(track.label)}`;
      return bookAudioOverrides[key] ? { label: bookAudioOverrides[key].label, url: bookAudioOverrides[key].url, coverUrl: bookAudioOverrides[key].coverUrl } : track;
    }),
    [bookAudioOverrides, selectedChapter],
  );

  const audiobookQueue = useMemo<AudioQueueItem[]>(
    () => bookChapters.flatMap((chapter, chapterIndex) =>
      chapter.audioTracks.map((track, trackIndex) => {
        const key = `${chapter.id}:${audioTrackKey(track.label)}`;
        const override = bookAudioOverrides[key];
        const label = override?.label || track.label;
        return {
          url: override?.url || track.url,
          title: `${repairBrokenPdfCharacters(chapter.title)} - ${repairBrokenPdfCharacters(label)}`,
          label: repairBrokenPdfCharacters(label),
          chapterIndex,
          chapterId: chapter.id,
          chapterTitle: repairBrokenPdfCharacters(chapter.title),
          trackIndex,
          coverUrl: override?.coverUrl,
        };
      }),
    ),
    [bookAudioOverrides],
  );

  const currentAudioQueueIndex = audioState.currentUrl ? audiobookQueue.findIndex((item) => item.url === audioState.currentUrl) : -1;
  const currentAudioQueueItem = currentAudioQueueIndex >= 0 ? audiobookQueue[currentAudioQueueIndex] : null;
  const nextAudioQueueItem = currentAudioQueueIndex >= 0 ? audiobookQueue[currentAudioQueueIndex + 1] ?? null : null;
  const previousAudioQueueItem = currentAudioQueueIndex > 0 ? audiobookQueue[currentAudioQueueIndex - 1] ?? null : null;

  const latestAudioResume = useMemo(() => {
    return Object.entries(audioProgressMap)
      .map(([url, progress]) => {
        const item = audiobookQueue.find((track) => track.url === url);
        return item ? { item, progress } : null;
      })
      .filter((entry): entry is { item: AudioQueueItem; progress: AudioProgressEntry } =>
        Boolean(entry && entry.progress.currentTime > 4 && !entry.progress.heard),
      )
      .sort((a, b) => b.progress.updatedAt.localeCompare(a.progress.updatedAt))[0] ?? null;
  }, [audioProgressMap, audiobookQueue]);

  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookChapters
      .map((chapter, index) => ({ chapter, index }))
      .filter(({ chapter }) => !query || `${chapter.title} ${chapter.summary}`.toLowerCase().includes(query));
  }, [searchQuery]);

  const adminCurrentBookPage = useMemo(
    () => adminBookPages.find((page) => page.pageNumber === adminBookPageNumber),
    [adminBookPageNumber, adminBookPages],
  );

  const adminCurrentPageSource = useMemo(
    () => pdfTextPages[adminBookPageNumber - 1] || '',
    [adminBookPageNumber],
  );

  const adminAudioChapter = useMemo(
    () => bookChapters.find((chapter) => chapter.id === adminAudioChapterId) ?? bookChapters[0],
    [adminAudioChapterId],
  );

  const adminAudioTracksForChapter = useMemo(
    () => adminAudioChapter?.audioTracks || [],
    [adminAudioChapter],
  );

  const adminCurrentAudioSummary = useMemo(
    () => adminBookAudio.find((track) => track.chapterId === adminAudioChapterId && track.sectionKey === adminAudioSectionKey),
    [adminAudioChapterId, adminAudioSectionKey, adminBookAudio],
  );

  const adminDefaultAudioTrack = useMemo(
    () => adminAudioTracksForChapter.find((track) => audioTrackKey(track.label) === adminAudioSectionKey),
    [adminAudioSectionKey, adminAudioTracksForChapter],
  );

  const adminAudioBoardItems = useMemo(() => {
    const defaultOrder = adminAudioTracksForChapter.map((track) => audioTrackKey(track.label));
    const savedOrder = adminAudioOrder[adminAudioChapterId] || [];
    const orderedKeys = [...savedOrder.filter((key) => defaultOrder.includes(key)), ...defaultOrder.filter((key) => !savedOrder.includes(key))];
    return orderedKeys
      .map((sectionKey) => {
        const baseTrack = adminAudioTracksForChapter.find((track) => audioTrackKey(track.label) === sectionKey);
        if (!baseTrack) return null;
        const published = adminBookAudio.find((track) => track.chapterId === adminAudioChapterId && track.sectionKey === sectionKey)?.latestPublished;
        const productionKey = `${adminAudioChapterId}:${sectionKey}`;
        const savedProduction = adminAudioProduction[productionKey];
        const production = savedProduction || {
          status: published ? 'review' : 'placeholder',
          note: '',
          coverUrl: published?.coverUrl || '',
        };
        return {
          sectionKey,
          productionKey,
          label: published?.label || baseTrack.label,
          url: published?.url || baseTrack.url,
          defaultUrl: baseTrack.url,
          published,
          production,
        };
      })
      .filter(Boolean) as Array<{
        sectionKey: string;
        productionKey: string;
        label: string;
        url: string;
        defaultUrl: string;
        published?: NonNullable<AdminBookAudioSummary['latestPublished']>;
        production: { status: AdminAudioProductionStatus; note: string; coverUrl?: string };
      }>;
  }, [adminAudioChapterId, adminAudioOrder, adminAudioProduction, adminAudioTracksForChapter, adminBookAudio]);

  const adminAudioPathWarning = useMemo(() => {
    const path = adminAudioUrl.trim();
    if (!path) return '';
    const validSource = path.startsWith('/media/') || /^https?:\/\//i.test(path);
    if (!validSource) return 'Use um caminho iniciado por /media/ ou uma URL publica.';
    if (!/\.(mp3|wav|m4a|ogg)(\?.*)?$/i.test(path)) return 'Confira a extensao: recomendamos .mp3, .wav, .m4a ou .ogg.';
    return '';
  }, [adminAudioUrl]);

  const adminPublishedPageCount = useMemo(
    () => adminBookPages.filter((page) => page.latestPublished).length,
    [adminBookPages],
  );

  const adminDraftPageCount = useMemo(
    () => adminBookPages.filter((page) => page.latestDraft).length,
    [adminBookPages],
  );

  const adminBookPageOptions = useMemo(() => {
    const total = Math.max(totalPdfPages, pdfTextPages.length || 1);
    const query = normalizeForSearch(adminBookSearch);
    return Array.from({ length: total }, (_, index) => index + 1).filter((pageNumber) => {
      if (!query) return true;
      const page = adminBookPages.find((item) => item.pageNumber === pageNumber);
      const source = `${pageNumber} ${page?.latestDraft?.title || ''} ${page?.latestPublished?.title || ''} ${pdfTextPages[pageNumber - 1] || ''}`;
      return normalizeForSearch(source).includes(query);
    });
  }, [adminBookPages, adminBookSearch, totalPdfPages]);

  const playClick = (kind: keyof typeof sensoryClicks = 'soft') => {
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return;
      const context = sfxRef.current ?? new AudioContextCtor();
      sfxRef.current = context;
      const settings = sensoryClicks[kind];
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = settings.frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + settings.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + settings.duration + 0.01);
    } catch {
      // Sensory clicks are decorative; silence failures.
    }
  };

  const ensureAudioAnalyser = () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextCtor) return false;
      const context = audioAnalysisContextRef.current ?? new AudioContextCtor();
      audioAnalysisContextRef.current = context;

      if (!audioAnalyserRef.current) {
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.82;
        audioAnalyserRef.current = analyser;
        audioFrequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }

      if (!audioSourceRef.current && audioAnalyserRef.current) {
        const source = context.createMediaElementSource(audio);
        source.connect(audioAnalyserRef.current);
        audioAnalyserRef.current.connect(context.destination);
        audioSourceRef.current = source;
      }

      if (context.state === 'suspended') context.resume().catch(() => {});
      return true;
    } catch {
      return false;
    }
  };

  const stopAudioSpectrum = () => {
    if (audioSpectrumFrameRef.current !== null) {
      window.cancelAnimationFrame(audioSpectrumFrameRef.current);
      audioSpectrumFrameRef.current = null;
    }
    setAudioFrequencies(idleAudioBars);
  };

  const startAudioSpectrum = () => {
    if (!ensureAudioAnalyser()) {
      setAudioFrequencies(idleAudioBars);
      return;
    }

    const tick = (timestamp: number) => {
      const analyser = audioAnalyserRef.current;
      const data = audioFrequencyDataRef.current;
      const audio = audioRef.current;
      if (!analyser || !data || !audio || audio.paused) {
        stopAudioSpectrum();
        return;
      }

      analyser.getByteFrequencyData(data);
      if (timestamp - lastSpectrumTickRef.current > 32) {
        const usableBins = Math.min(data.length - 1, 150);
        const bars = Array.from({ length: AUDIO_BAR_COUNT }, (_, index) => {
          const start = Math.floor(2 + (index / AUDIO_BAR_COUNT) ** 1.55 * usableBins);
          const end = Math.max(start + 1, Math.floor(2 + ((index + 1) / AUDIO_BAR_COUNT) ** 1.55 * usableBins));
          let total = 0;
          let peak = 0;
          for (let bin = start; bin < end; bin += 1) {
            const value = data[bin] ?? 0;
            total += value;
            if (value > peak) peak = value;
          }
          const average = total / Math.max(1, end - start);
          const normalized = Math.min(1, ((average * 0.62 + peak * 0.38) / 142) ** 0.72);
          return Math.max(0.08, normalized);
        });
        setAudioFrequencies(bars);
        lastSpectrumTickRef.current = timestamp;
      }

      audioSpectrumFrameRef.current = window.requestAnimationFrame(tick);
    };

    if (audioSpectrumFrameRef.current !== null) window.cancelAnimationFrame(audioSpectrumFrameRef.current);
    audioSpectrumFrameRef.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => {
    audioProgressMapRef.current = audioProgressMap;
  }, [audioProgressMap]);

  useEffect(() => {
    audiobookQueueRef.current = audiobookQueue;
  }, [audiobookQueue]);

  useEffect(() => {
    audioSettingsRef.current = { volume: audioState.volume, playbackRate: audioState.playbackRate };
  }, [audioState.volume, audioState.playbackRate]);

  const persistAudioProgress = (url: string | null, currentTime: number, duration: number, forceHeard = false) => {
    if (!url) return;
    const heard = forceHeard || (duration > 0 && currentTime / duration > 0.92);
    setAudioProgressMap((current) => {
      const next = {
        ...current,
        [url]: {
          heard: current[url]?.heard || heard,
          currentTime,
          duration,
          updatedAt: new Date().toISOString(),
        },
      };
      audioProgressMapRef.current = next;
      saveLocalAudioProgress(next);
      return next;
    });
  };

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = audioState.volume;
    audio.playbackRate = audioState.playbackRate;
    audioRef.current = audio;

    const handleTime = () => {
      const now = window.performance.now();
      if (now - lastAudioTickRef.current < 240) return;
      lastAudioTickRef.current = now;
      setAudioState((state) => ({ ...state, currentTime: audio.currentTime }));
      if (now - lastAudioPersistRef.current > 2600 && currentAudioUrlRef.current) {
        lastAudioPersistRef.current = now;
        persistAudioProgress(currentAudioUrlRef.current, audio.currentTime, audio.duration || 0);
      }
    };
    const handleMeta = () => setAudioState((state) => ({ ...state, duration: audio.duration || 0 }));
    const handleEnd = () => {
      const url = currentAudioUrlRef.current;
      if (url) {
        persistAudioProgress(url, audio.duration || audio.currentTime || 0, audio.duration || 0, true);
      }
      const nextItem = getNextAudioItem(url);
      if (nextItem) {
        playAudioQueueItem(nextItem, { resume: false, auto: true });
        return;
      }
      setAudioState((state) => ({ ...state, isPlaying: false, currentTime: 0 }));
      stopAudioSpectrum();
    };

    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('loadedmetadata', handleMeta);
    audio.addEventListener('ended', handleEnd);

    const savedToken = localStorage.getItem('opd_token');
    const savedAuthUser = getStoredAuthUser();
    const savedPlan = localStorage.getItem('opd_plan') as Plan | null;
    const savedChapter = Number(localStorage.getItem('opd_chapter_index') ?? '0');
    const savedPage = Number(localStorage.getItem('opd_page_index') ?? '0');
    const savedPdfPage = Number(localStorage.getItem('opd_pdf_page') ?? '10');
    const savedFavorites = JSON.parse(localStorage.getItem('opd_favorites') ?? '[]');
    const onboardingDone = localStorage.getItem('opd_onboarding_done');
    const savedWorkbook = loadLocalWorkbookEntry();
    const savedWorkbookAnswers = loadLocalWorkbookAnswers();
    const savedLetters = loadLocalLetters();
    const savedLetterMeta = loadLocalLetterMeta();
    const savedReaderNotes = loadLocalReaderNotes();
    const savedAudioProgress = loadLocalAudioProgress();

    if (savedAuthUser) {
      setAuthUser(savedAuthUser);
      setAccountName(savedAuthUser.name || '');
      setAccountEmail(savedAuthUser.email || '');
      setPlan(savedAuthUser.plan);
      setRoute(onboardingDone ? ROUTES.HOME : ROUTES.ONBOARDING);
    } else if (savedToken && accessTokens.includes(savedToken)) {
      setRoute(onboardingDone ? ROUTES.HOME : ROUTES.ONBOARDING);
    }
    if (savedPlan && !savedAuthUser) setPlan(savedPlan);
    if (!Number.isNaN(savedChapter)) setCurrentChapterIndex(clamp(savedChapter, 0, bookChapters.length - 1));
    if (!Number.isNaN(savedPage)) setPageIndex(savedPage);
    if (!Number.isNaN(savedPdfPage)) setPdfPage(clamp(savedPdfPage, 1, 286));
    if (Array.isArray(savedFavorites)) setFavorites(savedFavorites);
    setWorkbookEntry(savedWorkbook);
    setWorkbookAnswers(savedWorkbookAnswers);
    setReaderLetters(savedLetters);
    setLetterMeta(savedLetterMeta);
    setReaderNotes(savedReaderNotes);
    setAudioProgressMap(savedAudioProgress);

    const params = new URLSearchParams(window.location.search);
    const checkoutToken = params.get('token');
    const resetToken = params.get('resetToken');
    if (resetToken) {
      setPasswordResetToken(resetToken);
      setAuthMode('reset');
      setRoute(ROUTES.ACCESS);
      return;
    }
    if (checkoutToken) {
      setToken(checkoutToken.trim().toUpperCase());
      setAuthMode('register');
    }

    return () => {
      audio.pause();
      stopAudioSpectrum();
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('loadedmetadata', handleMeta);
      audio.removeEventListener('ended', handleEnd);
      audioAnalysisContextRef.current?.close().catch(() => {});
    };
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser) return;
    fetchCurrentUser()
      .then((user) => {
        if (!user) return;
        setAuthUser(user);
        setAccountName(user.name || '');
        setAccountEmail(user.email || '');
        setPlan(user.plan);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPublishedBookPages()
      .then((pages) => {
        setBookPageOverrides(
          pages.reduce<Record<number, string>>((acc, page) => {
            acc[page.pageNumber] = page.content;
            return acc;
          }, {}),
        );
      })
      .catch(() => setBookPageOverrides({}));
  }, []);

  useEffect(() => {
    fetchPublishedAudioTracks()
      .then((tracks) => {
      setBookAudioOverrides(
        tracks.reduce<Record<string, { chapterId: string; sectionKey: string; label: string; url: string; coverUrl?: string | null }>>((acc, track) => {
          acc[`${track.chapterId}:${track.sectionKey}`] = {
            chapterId: track.chapterId,
            sectionKey: track.sectionKey,
            label: track.label,
            url: track.url,
            coverUrl: track.coverUrl,
          };
          return acc;
        }, {}),
        );
      })
      .catch(() => setBookAudioOverrides({}));
  }, []);

  useEffect(() => {
    if (route !== ROUTES.ADMIN || !isAdmin) return;
    Promise.all([fetchAdminUsers(), fetchAdminProducts(), fetchAdminEvents(), fetchAdminBookPages(), fetchAdminBookAudio()])
      .then(([users, products, events, bookPages, bookAudio]) => {
        setAdminReaders(users);
        setAdminProducts(products);
        setAdminEvents(events);
        setAdminBookPages(bookPages);
        setAdminBookAudio(bookAudio);
        if (!adminSelectedUserId && users[0]) setAdminSelectedUserId(users[0].id);
      })
      .catch(() => {
        setAdminReaders([]);
        setAdminProducts([]);
        setAdminEvents([]);
        setAdminBookPages([]);
        setAdminBookAudio([]);
      });
  }, [route, isAdmin]);

  useEffect(() => {
    const firstTrack = adminAudioTracksForChapter[0];
    if (!adminAudioSectionKey || !adminAudioTracksForChapter.some((track) => audioTrackKey(track.label) === adminAudioSectionKey)) {
      setAdminAudioSectionKey(firstTrack ? audioTrackKey(firstTrack.label) : '');
    }
  }, [adminAudioSectionKey, adminAudioTracksForChapter]);

  useEffect(() => {
    const baseTrack = adminAudioTracksForChapter.find((track) => audioTrackKey(track.label) === adminAudioSectionKey);
    const published = adminCurrentAudioSummary?.latestPublished;
    setAdminAudioLabel(published?.label || baseTrack?.label || '');
    setAdminAudioUrl(published?.url || baseTrack?.url || '');
  }, [adminAudioSectionKey, adminAudioTracksForChapter, adminCurrentAudioSummary]);

  useEffect(() => {
    if (!adminBookAudio.length) return;
    setAdminAudioProduction((current) => {
      const next = { ...current };
      adminBookAudio.forEach((track) => {
        if (!track.production) return;
        next[`${track.chapterId}:${track.sectionKey}`] = {
          status: track.production.productionStatus || next[`${track.chapterId}:${track.sectionKey}`]?.status || 'review',
          note: track.production.productionNote || next[`${track.chapterId}:${track.sectionKey}`]?.note || '',
          coverUrl: track.production.coverUrl || track.latestPublished?.coverUrl || next[`${track.chapterId}:${track.sectionKey}`]?.coverUrl || '',
        };
      });
      return next;
    });
    setAdminAudioOrder((current) => {
      const next = { ...current };
      const byChapter = adminBookAudio.reduce<Record<string, Array<{ sectionKey: string; sortOrder: number }>>>((acc, track) => {
        if (track.production?.sortOrder === undefined) return acc;
        acc[track.chapterId] = [...(acc[track.chapterId] || []), { sectionKey: track.sectionKey, sortOrder: track.production.sortOrder || 0 }];
        return acc;
      }, {});
      Object.entries(byChapter).forEach(([chapterId, tracks]) => {
        next[chapterId] = tracks.sort((a, b) => a.sortOrder - b.sortOrder).map((track) => track.sectionKey);
      });
      return next;
    });
  }, [adminBookAudio]);

  useEffect(() => {
    localStorage.setItem(ADMIN_AUDIO_PRODUCTION_KEY, JSON.stringify(adminAudioProduction));
  }, [adminAudioProduction]);

  useEffect(() => {
    localStorage.setItem(ADMIN_AUDIO_ORDER_KEY, JSON.stringify(adminAudioOrder));
  }, [adminAudioOrder]);

  useEffect(() => {
    if (route !== ROUTES.ADMIN || !isAdmin) return;
    const revision = adminCurrentBookPage?.latestDraft || adminCurrentBookPage?.latestPublished;
    setAdminBookPageTitle(revision?.title || '');
    setAdminBookPageContent(revision?.content || adminCurrentPageSource);
    fetchAdminBookPageHistory(adminBookPageNumber)
      .then(setAdminBookPageHistory)
      .catch(() => setAdminBookPageHistory([]));
  }, [route, isAdmin, adminBookPageNumber, adminCurrentBookPage, adminCurrentPageSource]);

  useEffect(() => {
    localStorage.setItem('opd_page_index', String(pageIndex));
  }, [pageIndex]);

  useEffect(() => {
    localStorage.setItem('opd_pdf_page', String(pdfPage));
    let activeIndex = 0;
    bookChapters.forEach((chapter, index) => {
      if (chapter.pdfPage <= pdfPage) activeIndex = index;
    });
    if (activeIndex !== currentChapterIndex) setCurrentChapterIndex(activeIndex);
  }, [pdfPage]);

  useEffect(() => {
    localStorage.setItem('opd_chapter_index', String(currentChapterIndex));
    setPageIndex(0);
  }, [currentChapterIndex]);

  useEffect(() => {
    localStorage.setItem('opd_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHomeSlideIndex((index) => (index + 1) % homeSlides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const updateInstalled = () => {
      setIsPwaInstalled(media.matches || Boolean((window.navigator as any).standalone));
    };
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredInstallPrompt(null);
      localStorage.setItem('opd_pwa_intro_dismissed', 'true');
      setPwaIntroDismissed(true);
    };

    updateInstalled();
    setPwaIntroDismissed(localStorage.getItem('opd_pwa_intro_dismissed') === 'true');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    media.addEventListener?.('change', updateInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      media.removeEventListener?.('change', updateInstalled);
    };
  }, []);

  useEffect(() => {
    saveLocalWorkbookEntry(workbookEntry);
  }, [workbookEntry]);

  const navigate = (target: Route) => {
    playClick('soft');
    setRoute(target);
    setMenuOpen(false);
  };

  const flashSaveFeedback = (scope: string, setter: Dispatch<SetStateAction<SaveFeedback>>) => {
    const timers = saveFeedbackTimersRef.current[scope] ?? {};
    if (timers.saved) window.clearTimeout(timers.saved);
    if (timers.idle) window.clearTimeout(timers.idle);
    setter('saving');
    const saved = window.setTimeout(() => {
      setter('saved');
      const idle = window.setTimeout(() => setter('idle'), 1700);
      saveFeedbackTimersRef.current[scope] = { idle };
    }, 260);
    saveFeedbackTimersRef.current[scope] = { saved };
  };

  const getNextAudioItem = (url: string | null) => {
    if (!url) return null;
    const queue = audiobookQueueRef.current;
    const index = queue.findIndex((item) => item.url === url);
    return index >= 0 ? queue[index + 1] ?? null : null;
  };

  const getPreviousAudioItem = (url: string | null) => {
    if (!url) return null;
    const queue = audiobookQueueRef.current;
    const index = queue.findIndex((item) => item.url === url);
    return index > 0 ? queue[index - 1] ?? null : null;
  };

  const playAudioQueueItem = (item: AudioQueueItem, options: { resume?: boolean; auto?: boolean } = {}) => {
    const audio = audioRef.current;
    if (!audio || !item.url) return;
    if (!options.auto) playClick('primary');
    const saved = audioProgressMapRef.current[item.url];
    const resumeAt = options.resume !== false && saved && !saved.heard && saved.currentTime > 4 && (!saved.duration || saved.currentTime < saved.duration - 6)
      ? saved.currentTime
      : 0;

    audio.src = item.url;
    currentAudioUrlRef.current = item.url;
    audio.currentTime = resumeAt;
    audio.volume = audioSettingsRef.current.volume;
    audio.playbackRate = audioSettingsRef.current.playbackRate;
    audio.play().then(startAudioSpectrum).catch(() => {});
    setCurrentChapterIndex(item.chapterIndex);
    setAudioState((state) => ({
      ...state,
      isPlaying: true,
      currentUrl: item.url,
      title: item.title,
      coverUrl: item.coverUrl || null,
      currentTime: resumeAt,
      duration: saved?.duration || 0,
    }));
  };

  const handlePlayAudio = (url: string | null, title: string | null, coverUrl?: string | null) => {
    if (!url || !audioRef.current) return;
    playClick('primary');
    const audio = audioRef.current;

    if (audioState.currentUrl === url) {
      if (audioState.isPlaying) {
        persistAudioProgress(url, audio.currentTime, audio.duration || audioState.duration || 0);
        audio.pause();
        stopAudioSpectrum();
        setAudioState((state) => ({ ...state, isPlaying: false }));
      } else {
        audio.play().then(startAudioSpectrum).catch(() => {});
        setAudioState((state) => ({ ...state, isPlaying: true }));
      }
      return;
    }

    const queueItem = audiobookQueue.find((item) => item.url === url);
    if (queueItem) {
      playAudioQueueItem(queueItem, { resume: true, auto: true });
      return;
    }

    const saved = audioProgressMapRef.current[url];
    const resumeAt = saved && !saved.heard && saved.currentTime > 4 && (!saved.duration || saved.currentTime < saved.duration - 6)
      ? saved.currentTime
      : 0;
    audio.src = url;
    currentAudioUrlRef.current = url;
    audio.currentTime = resumeAt;
    audio.volume = audioState.volume;
    audio.playbackRate = audioState.playbackRate;
    audio.play().then(startAudioSpectrum).catch(() => {});
    setAudioState((state) => ({
      ...state,
      isPlaying: true,
      currentUrl: url,
      title,
      coverUrl: coverUrl || null,
      currentTime: resumeAt,
      duration: saved?.duration || 0,
    }));
  };

  const playNextAudio = () => {
    const next = getNextAudioItem(audioState.currentUrl);
    if (next) playAudioQueueItem(next, { resume: false });
  };

  const playPreviousAudio = () => {
    const previous = getPreviousAudioItem(audioState.currentUrl);
    if (previous) playAudioQueueItem(previous, { resume: true });
  };

  const openCurrentAudioPage = () => {
    if (!currentAudioQueueItem) return;
    const chapter = bookChapters[currentAudioQueueItem.chapterIndex];
    if (!chapter) return;
    setCurrentChapterIndex(currentAudioQueueItem.chapterIndex);
    goToPdfPage(chapter.pdfPage);
    setPageIndex(0);
    setAudioFullOpen(false);
    navigate(ROUTES.READER);
  };

  const seekAudio = (value: number) => {
    if (!audioRef.current || !audioState.duration) return;
    const nextTime = (value / 100) * audioState.duration;
    audioRef.current.currentTime = nextTime;
    setAudioState((state) => ({ ...state, currentTime: nextTime }));
    persistAudioProgress(audioState.currentUrl, nextTime, audioState.duration);
  };

  const changeVolume = (value: number) => {
    const nextVolume = value / 100;
    if (audioRef.current) audioRef.current.volume = nextVolume;
    setAudioState((state) => ({ ...state, volume: nextVolume }));
  };

  const changePlaybackRate = () => {
    const rates = [0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];
    const currentIndex = rates.findIndex((rate) => Math.abs(rate - audioState.playbackRate) < 0.01);
    const nextRate = rates[(currentIndex + 1) % rates.length] ?? 1;
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    playClick('soft');
    setAudioState((state) => ({ ...state, playbackRate: nextRate }));
  };

  const closeAudio = () => {
    if (audioRef.current && audioState.currentUrl) {
      persistAudioProgress(audioState.currentUrl, audioRef.current.currentTime || audioState.currentTime, audioRef.current.duration || audioState.duration || 0);
    }
    audioRef.current?.pause();
    currentAudioUrlRef.current = null;
    setAudioFullOpen(false);
    stopAudioSpectrum();
    setAudioState((state) => ({ ...state, isPlaying: false, currentUrl: null, title: null, coverUrl: null, currentTime: 0, duration: 0 }));
  };

  const handleTokenSubmit = () => {
    playClick('primary');
    const normalized = token.trim().toUpperCase();
    if (accessTokens.includes(normalized)) {
      const unlockedPlan = accessTokenPlans[normalized] ?? plan;
      localStorage.setItem('opd_token', normalized);
      localStorage.setItem('opd_plan', unlockedPlan);
      setPlan(unlockedPlan);
      setTokenError('');
      setRoute(ROUTES.ONBOARDING);
      return;
    }
    setTokenError('Token inválido. Confira o código recebido e tente novamente.');
  };

  const handleRegisterSubmit = async () => {
    playClick('primary');
    setAuthMessage('');
    setTokenError('');
    try {
      const response = await registerAccount({
        name: authName || 'Leitor OPDDS',
        email: authEmail,
        password: authPassword,
        token,
      });
      setPlan(response.user.plan);
      setAuthUser(response.user);
      setAccountName(response.user.name || '');
      setAccountEmail(response.user.email || '');
      navigate(ROUTES.ONBOARDING);
    } catch (error: any) {
      setAuthMessage(error?.message || 'Não foi possível criar sua conta.');
    }
  };

  const handleLoginSubmit = async () => {
    playClick('primary');
    setAuthMessage('');
    try {
      const response = await loginAccount({ email: authEmail, password: authPassword });
      setPlan(response.user.plan);
      setAuthUser(response.user);
      setAccountName(response.user.name || '');
      setAccountEmail(response.user.email || '');
      navigate(localStorage.getItem('opd_onboarding_done') ? ROUTES.HOME : ROUTES.ONBOARDING);
    } catch (error: any) {
      setAuthMessage(error?.message || 'Não foi possível entrar.');
    }
  };

  const handleForgotPasswordSubmit = async () => {
    playClick('primary');
    setAuthMessage('');
    if (!authEmail.trim()) {
      setAuthMessage('Informe seu e-mail para receber o link de redefinição.');
      return;
    }
    try {
      const response = await requestPasswordReset(authEmail);
      setAuthMessage(response.resetUrl ? `${response.message} Link local: ${response.resetUrl}` : response.message || 'Se este e-mail estiver cadastrado, enviaremos um link de redefinição.');
    } catch (error: any) {
      setAuthMessage(error?.message || 'Não foi possível solicitar a redefinição agora.');
    }
  };

  const handleResetPasswordSubmit = async () => {
    playClick('primary');
    setAuthMessage('');
    if (authPassword.length < 6) {
      setAuthMessage('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (authPassword !== authPasswordConfirm) {
      setAuthMessage('As senhas não conferem.');
      return;
    }
    try {
      const response = await resetPassword({ token: passwordResetToken, password: authPassword });
      setPlan(response.user.plan);
      setAuthUser(response.user);
      setAccountName(response.user.name || '');
      setAccountEmail(response.user.email || '');
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate(localStorage.getItem('opd_onboarding_done') ? ROUTES.HOME : ROUTES.ONBOARDING);
    } catch (error: any) {
      setAuthMessage(error?.message || 'Link inválido, expirado ou já utilizado.');
    }
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('opd_onboarding_done', 'true');
    navigate(ROUTES.HOME);
  };

  const dismissPwaIntro = () => {
    localStorage.setItem('opd_pwa_intro_dismissed', 'true');
    setPwaIntroDismissed(true);
  };

  const handleInstallPwa = async () => {
    playClick('primary');
    setPwaMessage('');
    if (deferredInstallPrompt) {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      if (choice.outcome === 'accepted') {
        dismissPwaIntro();
        setIsPwaInstalled(true);
      }
      return;
    }
    setPwaMessage('No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início.');
  };

  const PwaInstallIntro = () => (
    <section className="pwa-install-intro" role="dialog" aria-label="Instalar aplicativo">
      <div>
        <p className="kicker">App de leitura</p>
        <h1>Instale para ler sem depender do navegador.</h1>
        <span>O acesso fica mais limpo, com ícone na tela inicial e experiência em tela cheia.</span>
        {pwaMessage && <small>{pwaMessage}</small>}
      </div>
      <div className="pwa-install-actions">
        <Button onClick={handleInstallPwa}><DownloadCloud size={17} /> Instalar app</Button>
        <Button onClick={dismissPwaIntro} variant="ghost">Continuar no navegador</Button>
      </div>
    </section>
  );

  const PwaInstallBar = () => (
    <div className="pwa-install-bar">
      <span>Instale o app para uma leitura em tela cheia.</span>
      <button onClick={handleInstallPwa}><DownloadCloud size={15} /> Instalar</button>
      <button onClick={dismissPwaIntro} title="Ocultar aviso"><X size={15} /></button>
    </div>
  );

  const unlockOrderBump = (nextPlan: Plan = 'vip') => {
    playClick('primary');
    localStorage.setItem('opd_plan', nextPlan);
    setPlan(nextPlan);
    setAuthUser((current) => current ? { ...current, plan: nextPlan } : current);
    setUpgradeModal(null);
  };

  const hasUpgradeOffer = (key: UpgradeKey) =>
    currentProducts.includes(upgradeActiveProductKeys[key]);

  const openUpgrade = (key: UpgradeKey) => {
    playClick('soft');
    setUpgradeModal(key);
  };

  const openUpgradeCheckout = (key: UpgradeKey) => {
    const offer = upgradeOffers[key];
    playClick('primary');
    window.open(offer.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const saveAccountProfile = () => {
    const updated = updateStoredAuthUser({ name: accountName, email: accountEmail });
    if (updated) {
      setAuthUser(updated);
      setAccountMessage('Perfil atualizado neste dispositivo.');
    } else {
      setAccountMessage('Entre na conta para editar o perfil.');
    }
  };

  const logout = () => {
    localStorage.clear();
    setAuthUser(null);
    navigate(ROUTES.ACCESS);
  };

  const refreshAdminData = async () => {
    const [users, products, events, bookPages, bookAudio] = await Promise.all([fetchAdminUsers(), fetchAdminProducts(), fetchAdminEvents(), fetchAdminBookPages(), fetchAdminBookAudio()]);
    setAdminReaders(users);
    setAdminProducts(products);
    setAdminEvents(events);
    setAdminBookPages(bookPages);
    setAdminBookAudio(bookAudio);
    if (!adminSelectedUserId && users[0]) setAdminSelectedUserId(users[0].id);
    return users;
  };

  const parseOptionalDays = (value: string) => {
    const days = Number(value);
    return Number.isFinite(days) && days > 0 ? Math.floor(days) : undefined;
  };

  const handleCreateAdminInvite = async () => {
    setAdminMessage('');
    setAdminResult(null);
    const email = adminInvite.email.trim().toLowerCase();
    const name = adminInvite.name.trim();
    if (!email) {
      setAdminMessage('Informe o e-mail do leitor.');
      return;
    }
    try {
      const invite = await createAdminInvite({
        name: name || undefined,
        email,
        plan: adminInvite.plan,
        expiresInDays: parseOptionalDays(adminInvite.expiresInDays),
      });
      setAdminResult(invite);
      setAdminMessage('Convite criado com sucesso.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível criar o convite.');
    }
  };

  const handleGrantAdminPlan = async () => {
    if (!adminSelectedUserId) return;
    setAdminMessage('');
    try {
      await grantAdminPlan(adminSelectedUserId, {
        plan: adminGrant.plan,
        expiresInDays: parseOptionalDays(adminGrant.expiresInDays),
      });
      await refreshAdminData();
      setAdminMessage('Plano liberado para o leitor.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível liberar o plano.');
    }
  };

  const handleGrantAdminProduct = async () => {
    if (!adminSelectedUserId || !adminGrant.productKey) return;
    setAdminMessage('');
    try {
      await grantAdminProduct(adminSelectedUserId, {
        productKey: adminGrant.productKey,
        expiresInDays: parseOptionalDays(adminGrant.expiresInDays),
      });
      await refreshAdminData();
      setAdminMessage('Produto liberado para o leitor.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível liberar o produto.');
    }
  };

  const handleRevokeAdminProduct = async (userId: string, productKey: string) => {
    setAdminMessage('');
    try {
      await revokeAdminProduct(userId, productKey);
      await refreshAdminData();
      setAdminMessage('Produto removido do leitor.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível remover o produto.');
    }
  };

  const goToChapter = (index: number) => {
    const safeIndex = clamp(index, 0, bookChapters.length - 1);
    setCurrentChapterIndex(safeIndex);
    setPdfPage(bookChapters[safeIndex]?.pdfPage ?? 1);
    navigate(ROUTES.READER);
  };

  const refreshBookPageContent = async () => {
    const [adminPages, publishedPages, history] = await Promise.all([
      fetchAdminBookPages(),
      fetchPublishedBookPages(),
      fetchAdminBookPageHistory(adminBookPageNumber),
    ]);
    setAdminBookPages(adminPages);
    setAdminBookPageHistory(history);
    setBookPageOverrides(
      publishedPages.reduce<Record<number, string>>((acc, page) => {
        acc[page.pageNumber] = page.content;
        return acc;
      }, {}),
    );
  };

  const refreshBookAudioContent = async () => {
    const [adminAudio, publishedAudio] = await Promise.all([fetchAdminBookAudio(), fetchPublishedAudioTracks()]);
    setAdminBookAudio(adminAudio);
    setBookAudioOverrides(
      publishedAudio.reduce<Record<string, { chapterId: string; sectionKey: string; label: string; url: string; coverUrl?: string | null }>>((acc, track) => {
        acc[`${track.chapterId}:${track.sectionKey}`] = {
          chapterId: track.chapterId,
          sectionKey: track.sectionKey,
          label: track.label,
          url: track.url,
          coverUrl: track.coverUrl,
        };
        return acc;
      }, {}),
    );
  };

  const handleSaveBookPageDraft = async () => {
    setAdminMessage('');
    try {
      await saveAdminBookPageDraft(adminBookPageNumber, {
        title: adminBookPageTitle || undefined,
        content: adminBookPageContent,
      });
      await refreshBookPageContent();
      setAdminMessage(`Rascunho salvo para a pagina ${adminBookPageNumber}.`);
    } catch (error: any) {
      setAdminMessage(error?.message || 'Nao foi possivel salvar o rascunho.');
    }
  };

  const handleRepairAdminBookPageContent = () => {
    setAdminBookPageTitle((current) => repairBrokenPdfCharacters(current));
    setAdminBookPageContent((current) => repairBrokenPdfCharacters(current));
    setAdminMessage('Caracteres corrigidos no editor. Revise antes de publicar.');
  };

  const handleCleanAdminBookPageContent = () => {
    setAdminBookPageTitle((current) => cleanBookEditorText(current));
    setAdminBookPageContent((current) => cleanBookEditorText(current));
    setAdminMessage('Texto limpo no editor. Revise os paragrafos antes de publicar.');
  };

  const insertAdminBookPageSnippet = (snippet: string) => {
    const textarea = adminBookPageTextareaRef.current;
    if (!textarea) {
      setAdminBookPageContent((current) => `${current.trimEnd()}\n\n${snippet}\n\n`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setAdminBookPageContent((current) => {
      const before = current.slice(0, start);
      const after = current.slice(end);
      const prefix = before && !before.endsWith('\n') ? '\n' : '';
      const suffix = after && !after.startsWith('\n') ? '\n' : '';
      return `${before}${prefix}${snippet}${suffix}${after}`;
    });
    window.requestAnimationFrame(() => {
      textarea.focus();
      const nextPosition = start + snippet.length + (textarea.value.slice(0, start).endsWith('\n') ? 0 : 1);
      textarea.setSelectionRange(nextPosition, nextPosition);
    });
  };

  const handlePublishBookPage = async () => {
    setAdminMessage('');
    try {
      await publishAdminBookPage(adminBookPageNumber, {
        title: adminBookPageTitle || undefined,
        content: adminBookPageContent,
      });
      await refreshBookPageContent();
      setAdminMessage(`Pagina ${adminBookPageNumber} publicada no modo leitura.`);
    } catch (error: any) {
      setAdminMessage(error?.message || 'Nao foi possivel publicar a pagina.');
    }
  };

  const updateAdminAudioProduction = (productionKey: string, patch: Partial<{ status: AdminAudioProductionStatus; note: string; coverUrl: string }>) => {
    setAdminAudioProduction((current) => ({
      ...current,
      [productionKey]: {
        status: current[productionKey]?.status || 'review',
        note: current[productionKey]?.note || '',
        coverUrl: current[productionKey]?.coverUrl || '',
        ...patch,
      },
    }));
  };

  const selectAdminAudioBoardItem = (sectionKey: string) => {
    setAdminAudioSectionKey(sectionKey);
  };

  const dropAdminAudioBoardItem = (targetKey: string) => {
    if (!adminAudioDraggingKey || adminAudioDraggingKey === targetKey) {
      setAdminAudioDraggingKey('');
      return;
    }
    const defaultOrder = adminAudioTracksForChapter.map((track) => audioTrackKey(track.label));
    const currentOrder = adminAudioOrder[adminAudioChapterId] || defaultOrder;
    const normalized = [...currentOrder.filter((key) => defaultOrder.includes(key)), ...defaultOrder.filter((key) => !currentOrder.includes(key))];
    const from = normalized.indexOf(adminAudioDraggingKey);
    const to = normalized.indexOf(targetKey);
    if (from < 0 || to < 0) {
      setAdminAudioDraggingKey('');
      return;
    }
    const next = [...normalized];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setAdminAudioOrder((current) => ({ ...current, [adminAudioChapterId]: next }));
    setAdminAudioDraggingKey('');
  };

  const saveAdminAudioBoard = async () => {
    setAdminMessage('');
    try {
      const sectionKeys = adminAudioBoardItems.map((item) => item.sectionKey);
      await saveAdminBookAudioOrder({ chapterId: adminAudioChapterId, sectionKeys });
      await Promise.all(adminAudioBoardItems.map((item, index) =>
        saveAdminBookAudioMeta({
          chapterId: adminAudioChapterId,
          sectionKey: item.sectionKey,
          productionStatus: item.production.status,
          productionNote: item.production.note,
          coverUrl: item.production.coverUrl || '',
          sortOrder: index,
        }),
      ));
      await refreshBookAudioContent();
      setAdminMessage('Mesa de audio salva no servidor.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Nao foi possivel salvar a mesa de audio.');
    }
  };

  const handlePublishBookAudio = async () => {
    setAdminMessage('');
    const productionKey = `${adminAudioChapterId}:${adminAudioSectionKey}`;
    try {
      await publishAdminBookAudio({
        chapterId: adminAudioChapterId,
        sectionKey: adminAudioSectionKey,
        label: adminAudioLabel,
        url: adminAudioUrl,
        coverUrl: adminAudioProduction[productionKey]?.coverUrl || undefined,
      });
      await refreshBookAudioContent();
      setAdminMessage('Audio publicado para esta secao.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Nao foi possivel publicar o audio.');
    }
  };

  const handleOpenAdminBookPageInReader = () => {
    goToPdfPage(adminBookPageNumber);
    setPageIndex(0);
    navigate(ROUTES.READER);
  };

  const goToPdfPage = (nextPage: number) => {
    const safePage = clamp(nextPage, 1, totalPdfPages);
    setPdfPage(safePage);
    let activeIndex = 0;
    bookChapters.forEach((chapter, index) => {
      if (chapter.pdfPage <= safePage) activeIndex = index;
    });
    if (activeIndex !== currentChapterIndex) setCurrentChapterIndex(activeIndex);
  };

  const toggleFavorite = (chapterId: string) => {
    playClick('soft');
    setFavorites((current) =>
      current.includes(chapterId) ? current.filter((id) => id !== chapterId) : [...current, chapterId]
    );
  };

  const togglePageBookmark = () => {
    playClick('soft');
    setReaderNotes((current) => {
      const existing = current.find((note) => note.page === pdfPage);
      const next = existing
        ? current.filter((note) => note.page !== pdfPage)
        : [
            ...current,
            {
              id: `page-${pdfPage}-${Date.now()}`,
              page: pdfPage,
              chapterId: selectedChapter.id,
              title: selectedChapter.title,
              note: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
      saveLocalReaderNotes(next);
      flashSaveFeedback('notes', setNoteSaveStatus);
      return next;
    });
  };

  const updateCurrentPageNote = (noteText: string) => {
    setReaderNotes((current) => {
      const existing = current.find((note) => note.page === pdfPage);
      const now = new Date().toISOString();
      const next = existing
        ? current.map((note) => note.page === pdfPage ? { ...note, note: noteText, title: selectedChapter.title, chapterId: selectedChapter.id, updatedAt: now } : note)
        : [
            ...current,
            {
              id: `page-${pdfPage}-${Date.now()}`,
              page: pdfPage,
              chapterId: selectedChapter.id,
              title: selectedChapter.title,
              note: noteText,
              createdAt: now,
              updatedAt: now,
            },
          ];
      saveLocalReaderNotes(next);
      flashSaveFeedback('notes', setNoteSaveStatus);
      return next;
    });
  };

  const openCurrentPillarLetter = () => {
    if (!selectedChapter.pillar) {
      navigate(ROUTES.LETTERS);
      return;
    }
    setLetterIndex(selectedChapter.pillar - 1);
    navigate(ROUTES.LETTERS);
  };

  const handleShareChapter = () => {
    playClick('soft');
    const shareTitle = repairMojibake(selectedChapter.title);
    const shareText = `${shareTitle} - O Poder dos Desacreditados`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`).then(() => {
      setNoteSaveStatus('saved');
      window.setTimeout(() => setNoteSaveStatus('idle'), 1400);
    }).catch(() => {});
  };

  const getMindGuide = (topic = activeMentorTopic) => mindGuides[topic.id] ?? mindGuides.ansiedade;

  const findMindRecommendations = (readerText = '', topic = activeMentorTopic): MindRecommendation[] => {
    const guide = getMindGuide(topic);
    const queryTerms = normalizeForSearch(`${readerText} ${topic.title} ${guide.keywords.join(' ')}`)
      .split(' ')
      .filter((term) => term.length > 2);
    const uniqueTerms = Array.from(new Set(queryTerms));

    const candidates = bookChapters.map((chapter, chapterIndex) => {
      const title = repairMojibake(chapter.title);
      const chapterText = normalizeForSearch(`${chapter.title} ${chapter.summary} ${chapter.content.join(' ')}`);
      const titleText = normalizeForSearch(title);
      const matchingTerms = uniqueTerms.filter((term) => chapterText.includes(term));
      const pillarBonus = chapterIndex === guide.chapterHint ? 8 : 0;
      const titleBonus = uniqueTerms.filter((term) => titleText.includes(term)).length * 2;
      const score = matchingTerms.length + titleBonus + pillarBonus;

      const paragraph =
        chapter.content.find((item) => {
          const normalized = normalizeForSearch(item);
          return uniqueTerms.some((term) => normalized.includes(term)) && repairMojibake(item).length > 80;
        }) ??
        chapter.content.find((item) => repairMojibake(item).length > 120) ??
        chapter.summary;

      return {
        chapterIndex,
        title,
        excerpt: trimExcerpt(paragraph),
        reason:
          chapterIndex === guide.chapterHint
            ? `Pilar central para ${topic.title.toLowerCase()}`
            : `Conecta ${topic.title.toLowerCase()} com ${matchingTerms.slice(0, 3).join(', ') || 'presença'}`,
        audioUrl: chapter.audioUrl,
        score,
      };
    });

    return candidates
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...recommendation }) => recommendation);
  };

  const startMindSession = (topic: typeof mentorTopics[number], prompt = '', source: MindSavedPlan['source'] = 'chat') => {
    const guide = getMindGuide(topic);
    const recommendations = findMindRecommendations(topic.title, topic);
    setActiveMentorTopic(topic);
    setMindStep('chat');
    setMindInput('');
    setMindSessionId(undefined);
    setMindLoading(false);
    setPendingMindPrompt(prompt);
    setPendingMindSource(source);
    setMindMessages([
      {
        id: `${topic.id}-intro`,
        from: 'agent',
        kind: 'intro',
        text: guide.opening,
      },
      {
        id: `${topic.id}-question`,
        from: 'agent',
        text: `${guide.firstQuestion}\n\nEu já separei alguns trechos do livro que podem conversar com esse estado.`,
        replies: guide.quickReplies,
        recommendations,
      },
    ]);
    navigate(ROUTES.IGENT);
    handlePlayAudio(topic.audioUrl, topic.title);
  };

  const buildMindContext = (readerText: string) => {
    const currentAnswers = workbookPillars[workbookPillarIndex]?.questions
      .map((question, index) => ({
        question,
        answer: workbookAnswers[`${workbookPillarIndex}-${index}`] || '',
      }))
      .filter((item) => item.answer.trim())
      .slice(0, 4);

    return {
      readerName,
      topic: activeMentorTopic.title,
      input: readerText,
      currentChapter: {
        id: selectedChapter.id,
        title: repairMojibake(selectedChapter.title),
        summary: trimExcerpt(repairMojibake(selectedChapter.summary), 260),
        pdfPage,
      },
      workbook: {
        currentPillar: workbookPillars[workbookPillarIndex]?.title,
        freeWriting: trimExcerpt(workbookEntry, 320),
        answers: currentAnswers,
      },
      letters: Object.entries(readerLetters)
        .filter(([, value]) => value.trim())
        .slice(-3)
        .map(([key, value]) => ({ key, excerpt: trimExcerpt(value, 220) })),
      notes: readerNotes
        .filter((note) => note.note.trim())
        .slice(-5)
        .map((note) => ({ page: note.page, title: note.title, excerpt: trimExcerpt(note.note, 220) })),
      pageNote: currentPageNote?.note ? trimExcerpt(currentPageNote.note, 260) : '',
    };
  };

  const saveMindPlan = (
    topic: typeof mentorTopics[number],
    prompt: string,
    response: string,
    source: MindSavedPlan['source'],
  ) => {
    const guide = getMindGuide(topic);
    const saved: MindSavedPlan = {
      topicId: topic.id,
      topicTitle: topic.title,
      source,
      prompt: trimExcerpt(prompt, 240),
      response: trimExcerpt(response, 520),
      chapterIndex: guide.chapterHint,
      createdAt: new Date().toISOString(),
    };
    setMindSavedPlan(saved);
    localStorage.setItem(MIND_LAST_PLAN_KEY, JSON.stringify(saved));
  };

  const answerMind = async (text: string) => {
    const value = text.trim();
    if (!value || mindLoading) return;
    const guide = getMindGuide();
    const recommendations = findMindRecommendations(value, activeMentorTopic);
    const localResponseText =
      `${guide.counterpoint}\n\nPlano de presença: ${guide.practice}\n\nPelo que você trouxe, eu buscaria estes pontos do livro primeiro:`;
    const history = mindMessages
      .filter((message) => message.text.trim())
      .slice(-10)
      .map((message) => ({
        role: message.from === 'user' ? 'user' as const : 'assistant' as const,
        content: message.text,
      }));
    playClick('primary');
    setMindInput('');
    setMindLoading(true);
    setMindMessages((current) => [
      ...current.map((message) => ({ ...message, replies: undefined })),
      { id: `user-${Date.now()}`, from: 'user', text: value },
      {
        id: `agent-${Date.now()}`,
        from: 'agent',
        kind: 'plan',
        text: localResponseText,
        replies: ['Abrir capítulo sugerido', 'Ouvir apoio', 'Recomeçar triagem'],
        recommendations,
      },
    ]);

    try {
      const response = await sendMindMessage({
        sessionId: mindSessionId,
        topic: activeMentorTopic.title,
        message: value,
        messages: history,
        context: buildMindContext(value),
      });
      setMindSessionId(response.sessionId);
      saveMindPlan(activeMentorTopic, value, response.message, pendingMindSource);
      setMindMessages((current) => {
        const next = [...current];
        const lastAgentIndex = next.map((message) => message.from).lastIndexOf('agent');
        if (lastAgentIndex >= 0) {
          next[lastAgentIndex] = {
            ...next[lastAgentIndex],
            text: response.fallback
              ? `${response.message}\n\nNo momento, estou usando o modo guiado de seguranÃ§a enquanto a IA conectada nÃ£o responde.`
              : response.message,
            recommendations,
          };
        }
        return next;
      });
    } catch {
      saveMindPlan(activeMentorTopic, value, localResponseText, pendingMindSource);
      // Mantem a resposta local quando o backend ou a IA estiverem indisponiveis.
    } finally {
      setMindLoading(false);
    }
  };

  useEffect(() => {
    if (mindStep !== 'chat' || !pendingMindPrompt.trim()) return;
    const prompt = pendingMindPrompt;
    window.setTimeout(() => answerMind(prompt), 80);
    setPendingMindPrompt('');
  }, [mindStep, pendingMindPrompt]);

  const handleMindQuickReply = (reply: string) => {
    const normalizedReply = normalizeForSearch(reply);
    if (normalizedReply.includes('abrir capitulo')) {
      goToChapter(getMindGuide().chapterHint);
      return;
    }
    if (normalizedReply.includes('ouvir apoio')) {
      handlePlayAudio(activeMentorTopic.audioUrl, activeMentorTopic.title);
      return;
    }
    if (normalizedReply.includes('recomecar triagem')) {
      setMindStep('select');
      setMindMessages([]);
      return;
    }
    answerMind(reply);
  };

  const isRouteLocked = (routeId: Route) => {
    if ([ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS, ROUTES.READER].includes(routeId as any)) return !hasReaderAccess;
    if (routeId === ROUTES.IGENT) return !hasMindAccess;
    if (routeId === ROUTES.COMMUNITY) return !hasGroupAccess;
    if (routeId === ROUTES.WORKBOOK) return !hasWorkbookAccess;
    if (routeId === ROUTES.LETTERS) return !hasReaderAccess;
    if (routeId === ROUTES.ADMIN) return !isAdmin;
    return false;
  };

  const upgradeForRoute = (routeId: Route): UpgradeKey => {
    if ([ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS, ROUTES.READER].includes(routeId as any)) return 'basic';
    if (routeId === ROUTES.COMMUNITY) return 'group';
    if (routeId === ROUTES.WORKBOOK) return 'workbook';
    if (routeId === ROUTES.LETTERS) return 'basic';
    if (routeId === ROUTES.IGENT) return 'igent30';
    return 'vip';
  };

  const AccessView = () => {
    if (authMode === 'forgot' || authMode === 'reset') {
      const isReset = authMode === 'reset';
      return (
        <main className="cover-gate page-enter">
          <div className="cover-orbit" />
          <section className="cover-card">
            <img className="access-brand-logo" src={brandLogo} alt="O Poder dos Desacreditados" />
            <div className="token-mini">
              <div className="access-copy">
                <p className="kicker">Segurança da conta</p>
                <h1>{isReset ? 'Crie uma nova senha.' : 'Recupere sua senha.'}</h1>
                <span>{isReset ? 'Digite e confirme sua nova senha para voltar ao app.' : 'Informe seu e-mail e enviaremos um link seguro de redefinição.'}</span>
              </div>
              {!isReset && (
                <label>
                  <span>E-mail</span>
                  <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="voce@email.com" type="email" />
                </label>
              )}
              {isReset && (
                <>
                  <PasswordField
                    label="Nova senha"
                    value={authPassword}
                    onChange={setAuthPassword}
                    placeholder="minimo 6 caracteres"
                    visible={showAuthPassword}
                    onToggle={() => setShowAuthPassword((current) => !current)}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Confirmar nova senha"
                    value={authPasswordConfirm}
                    onChange={setAuthPasswordConfirm}
                    placeholder="repita a nova senha"
                    visible={showAuthPasswordConfirm}
                    onToggle={() => setShowAuthPasswordConfirm((current) => !current)}
                    autoComplete="new-password"
                  />
                </>
              )}
              {authMessage && <p>{authMessage}</p>}
              <Button onClick={isReset ? handleResetPasswordSubmit : handleForgotPasswordSubmit} className="cover-primary">
                {isReset ? 'Redefinir senha' : 'Enviar link por e-mail'}
              </Button>
              <button className="cover-link" onClick={() => { setAuthMessage(''); setAuthMode('login'); }}>Voltar para login</button>
            </div>
          </section>
        </main>
      );
    }

    return (
    <main className="cover-gate page-enter">
      <div className="cover-orbit" />
      <section className="cover-card">
        <img className="access-brand-logo" src={brandLogo} alt="O Poder dos Desacreditados" />
        <div className="token-mini">
          <div className="access-copy">
            <p className="kicker">Acesso do leitor</p>
            <h1>Continue sua jornada.</h1>
            <span>Crie sua conta com o e-mail do checkout e o token recebido na compra.</span>
          </div>
          <div className="plan-toggle">
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Criar conta</button>
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Entrar</button>
          </div>
          {authMode === 'register' && (
            <label>
              <span>Nome</span>
              <input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Seu nome" />
            </label>
          )}
          <label>
            <span>E-mail</span>
            <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="voce@email.com" type="email" />
          </label>
          <PasswordField
            label="Senha"
            value={authPassword}
            onChange={setAuthPassword}
            placeholder="minimo 6 caracteres"
            visible={showAuthPassword}
            onToggle={() => setShowAuthPassword((current) => !current)}
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          />
          {authMode === 'register' && (
            <label>
              <span>Token do checkout</span>
              <input value={token} onChange={(event) => setToken(event.target.value)} placeholder={accessTokens[0]} />
            </label>
          )}
          {(tokenError || authMessage) && <p>{authMessage || tokenError}</p>}
          <Button onClick={authMode === 'register' ? handleRegisterSubmit : handleLoginSubmit} className="cover-primary">
            {authMode === 'register' ? 'Criar acesso' : 'Entrar'}
          </Button>
          {authMode === 'register' && <button className="cover-link" onClick={handleTokenSubmit}>Validar token manualmente</button>}
          {authMode === 'login' && <button className="cover-link" onClick={() => { setAuthMessage(''); setAuthMode('forgot'); }}>Esqueci minha senha</button>}
        </div>
      </section>
    </main>
    );
  };

  const Header = () => (
    <header className="app-header">
      <button className="icon-button lg:hidden" onClick={() => setMenuOpen((value) => !value)} title="Abrir menu">
        <Menu size={20} />
      </button>
      <div className="brand-lockup">
        <img src={brandLogo} alt="" />
        <div>
          <p>O Poder dos Desacreditados</p>
          <strong>{route === ROUTES.IGENT ? 'iGentMIND' : 'Leitura guiada'}</strong>
        </div>
      </div>
      <div className="header-actions">
        <button className="theme-toggle-button" onClick={toggleTheme} title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{darkMode ? 'Claro' : 'Escuro'}</span>
        </button>
        <button className="download-button" onClick={() => window.open(pdfUrl, '_blank')}>
          <DownloadCloud size={16} />
          <span>Baixar Livro</span>
        </button>
        <div className="account-menu-wrap">
          <button className="account-pill" onClick={() => setAccountMenuOpen((value) => !value)}>
            <span>{readerName.slice(0, 1).toUpperCase()}</span>
            <strong>{readerName}</strong>
          </button>
          {accountMenuOpen && (
            <div className="account-popover">
              <p>Olá,</p>
              <h3>{readerName}</h3>
              <span className="plan-badge">{planLabels[plan]}</span>
              <span className="product-count">{currentProducts.length} produto(s) ativo(s)</span>
              <button onClick={() => { setAccountMenuOpen(false); navigate(ROUTES.SETTINGS); }}><User size={17} /> Perfil</button>
              <button onClick={() => { setAccountMenuOpen(false); navigate(ROUTES.SETTINGS); }}><Settings size={17} /> Editar</button>
              <button onClick={logout}><X size={17} /> Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const Navigation = () => (
    <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="sidebar-head">
        <img src={brandLogo} alt="" />
      </div>
      <nav>
        {navGroups.map((group) => (
          <div className="nav-group" key={group.title}>
            <p>{group.title}</p>
            {group.items.filter((item) => item.id !== ROUTES.ADMIN || isAdmin).map((item) => {
              const Icon = item.icon;
              const locked = isRouteLocked(item.id);
              return (
                <button key={item.id} className={route === item.id ? 'active' : ''} onClick={() => {
                  if (locked) {
                    openUpgrade(upgradeForRoute(item.id));
                    return;
                  }
                  navigate(item.id);
                }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {locked && <Lock size={13} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );

  const BottomNavigation = () => {
    const items = [
      { id: ROUTES.HOME, label: 'Início', icon: Home },
      { id: ROUTES.READER, label: 'Livro', icon: BookOpen },
      { id: ROUTES.IGENT, label: 'iGent', icon: Zap },
      { id: ROUTES.WORKBOOK, label: 'Diário', icon: FileText },
      { id: ROUTES.SETTINGS, label: 'Conta', icon: User },
    ];

    return (
      <nav className="bottom-nav" aria-label="Navegação principal">
        {items.map((item) => {
          const Icon = item.icon;
          const locked = isRouteLocked(item.id);
          const active = route === item.id || (item.id === ROUTES.READER && route === ROUTES.BOOK);
          return (
            <button
              key={item.id}
              className={active ? 'active' : ''}
              onClick={() => {
                if (locked) {
                  openUpgrade(upgradeForRoute(item.id));
                  return;
                }
                navigate(item.id);
              }}
              title={locked ? `${item.label} bloqueado` : item.label}
            >
              {locked ? <Lock size={19} /> : <Icon size={19} />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  };

  const HomeView = () => {
    if (!hasReaderAccess) {
      return (
        <div className="app-page home-dashboard page-enter">
          <section className="home-greeting">
            <h1>Olá, {readerName}.</h1>
            <p>Seu acesso atual libera o PDF do livro.</p>
          </section>

          <section className="home-reading-card pdf-only-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 7, 8, 0.92), rgba(7, 7, 8, 0.5)), url(${homeSlides[homeSlideIndex]})` }}>
            <div>
              <p className="kicker">Acesso liberado</p>
              <h2>PDF de O Poder dos Desacreditados</h2>
              <span>Baixe o livro e volte para destravar app, áudios, Diário e iGentMIND quando seu pedido incluir esses módulos.</span>
            </div>
            <div className="home-card-actions">
              <Button onClick={() => window.open(pdfUrl, '_blank')}><DownloadCloud size={17} /> Baixar PDF</Button>
            </div>
          </section>

          <section className="unlock-strip">
            <div>
              <p className="kicker">Próximo nível</p>
              <h2>Livro interativo, áudios e Biblioteca</h2>
              <span>Este ambiente já está preparado para liberar os módulos automaticamente pelo token do checkout.</span>
            </div>
            <Button onClick={() => openUpgrade('basic')} variant="secondary"><Lock size={17} /> Ver upgrade</Button>
          </section>
        </div>
      );
    }

    return (
    <div className="app-page home-dashboard page-enter">
      <section className="home-greeting">
        <h1>Olá, {readerName}.</h1>
        <p>Que bom te ver aqui. Sua jornada continua.</p>
      </section>

      <section className="home-reading-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 7, 8, 0.9), rgba(7, 7, 8, 0.34)), url(${homeSlides[homeSlideIndex]})` }}>
        <div>
          <p className="kicker">Leitura atual</p>
          <h2>{getChapterKind(currentChapterIndex, selectedChapter.title)} - {selectedChapter.title}</h2>
          <span>{trimExcerpt(selectedChapter.summary, 92)}</span>
        </div>
        <div className="home-reading-actions">
          <Button onClick={() => navigate(ROUTES.READER)} className="cover-primary">Ler agora</Button>
          <Button onClick={() => navigate(ROUTES.LIBRARY)} variant="secondary">Sumario</Button>
        </div>
        <div className="home-slide-dots">
          {homeSlides.map((slide, index) => (
            <button key={slide} className={index === homeSlideIndex ? 'active' : ''} onClick={() => setHomeSlideIndex(index)} title={`Imagem ${index + 1}`} />
          ))}
        </div>
      </section>

      <section className="home-continue-stack">
        {latestAudioResume && (
          <div className="home-resume-strip">
            <Headphones size={16} />
            <div>
              <strong>Continuar ouvindo</strong>
              <small>{latestAudioResume.item.title} - {formatTime(latestAudioResume.progress.currentTime)} de {formatTime(latestAudioResume.progress.duration)}</small>
            </div>
            <button onClick={() => playAudioQueueItem(latestAudioResume.item, { resume: true })}>
              <Play size={13} fill="currentColor" />
            </button>
          </div>
        )}
        {hasMindAccess && (
          <div className="home-resume-strip mind-resume-strip">
            <Brain size={16} />
            <div>
              <strong>{mindSavedPlan ? `Continuar iGentMIND - ${mindSavedPlan.topicTitle}` : 'Abrir iGentMIND'}</strong>
              <small>{mindSavedPlan ? mindSavedPlan.response : 'Cruzar seu ponto atual com o livro e o diario'}</small>
            </div>
            <button
              onClick={() => {
                const topic = mentorTopics.find((item) => item.id === mindSavedPlan?.topicId) || activeMentorTopic;
                const prompt = mindSavedPlan
                  ? `Retome esta orientacao: ${mindSavedPlan.response}`
                  : `Estou na pagina ${pdfPage}, lendo ${selectedChapter.title}. Me ajude a encontrar o proximo gesto.`;
                startMindSession(topic, prompt, 'home');
              }}
            >
              <Zap size={13} />
            </button>
          </div>
        )}
        {hasMindAccess && (
          <button className="home-mind-float" onClick={() => startMindSession(activeMentorTopic, `Estou em ${currentGroup.title}. Me ajude a organizar o que ler, ouvir ou escrever agora.`, 'home')}>
            <Brain size={17} />
            iGentMIND
          </button>
        )}
      </section>

      <section className="journey-overview">
        <article className="journey-current">
          <p className="kicker">{currentGroup.eyebrow}</p>
          <h2>{currentGroup.title}</h2>
          <span>{currentGroup.description}</span>
          <div className="progress-track"><span style={{ width: `${pdfReadProgress}%` }} /></div>
          <small>Página {pdfPage} de {totalPdfPages} · {pdfReadProgress}% do livro</small>
        </article>
        <article>
          <CheckCircle2 size={20} />
          <strong>{writtenLettersCount}/{pillarLetters.length}</strong>
          <span>cartas iniciadas</span>
        </article>
        <article>
          <Headphones size={20} />
          <strong>{heardAudioCount}/{totalAudioTracks}</strong>
          <span>áudios ouvidos</span>
        </article>
        <article>
          <NotebookPen size={20} />
          <strong>{readerNotes.length}</strong>
          <span>páginas marcadas</span>
        </article>
      </section>

      <section className="home-state-section">
        <h2>Onde você está agora?</h2>
        <div className="home-state-list">
          {journeyStates.map((state, index) => (
            <article key={state.title} className={activeJourneyStateIndex === index ? 'active' : ''}>
              <div>
                <h3>{state.title}</h3>
                <p>{state.desc}</p>
              </div>
              <button onClick={() => {
                setActiveJourneyStateIndex(index);
                setCurrentChapterIndex(state.chapter);
                handlePlayAudio(state.audioUrl, state.title);
              }} title={`Ouvir ${state.title}`}>
                <Play size={16} fill="currentColor" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="manifesto-card">
        <p className="kicker">Manifesto do dia</p>
        <blockquote>"Não somos o que nos aconteceu. Somos o que escolhemos fazer com o que sobrou."</blockquote>
        <button onClick={() => handlePlayAudio('/media/audios/home/manifesto-da-semana.wav', 'Manifesto do dia')}>
          <Play size={14} />
          Ouvir reflexão
        </button>
      </section>

      <section className="unlock-strip">
        <div>
          <p className="kicker">Seu nível: {planLabels[plan]}</p>
          <h2>{hasMindAccess ? 'iGentMIND liberado' : hasWorkbookAccess ? 'Diário liberado' : 'Desbloqueie Diário + iGentMIND'}</h2>
          <span>{hasMindAccess ? 'Seu token libera mentor, perguntas guiadas e workbook editável.' : hasWorkbookAccess ? 'Seu Diário está ativo. O próximo nível libera o mentor iGentMIND.' : 'Simulação local do upsell: Diário, mentor treinado nos pilares e acesso ao grupo quando contratado.'}</span>
        </div>
        {hasOrderBump ? (
          <Button onClick={() => navigate(ROUTES.WORKBOOK)} variant="secondary"><FileText size={17} /> Abrir Diário</Button>
        ) : (
          <Button onClick={() => openUpgrade('workbook')}><Zap size={17} /> Desbloquear Diário</Button>
        )}
      </section>
    </div>
  );
  };

  const LegacyHomeView = () => (
    <div className="app-page page-enter">
      <section className="home-cover">
        <div className="home-copy">
          <p className="kicker">Jornada</p>
          <h1>O livro, o áudio e o mentor caminhando juntos.</h1>
          <p>Uma experiência de leitura para atravessar descrédito, reconstruir presença e ouvir contrapontos quando a cabeça pesar.</p>
          <div className="hero-actions">
            <Button onClick={() => navigate(ROUTES.BOOK)}><BookOpen size={18} /> Abrir livro</Button>
            <Button onClick={() => navigate(ROUTES.IGENT)} variant="ghost"><Zap size={18} /> iGentMIND</Button>
          </div>
        </div>
        <div className="continue-panel">
          <p className="kicker">Continuar</p>
          <h2>{selectedChapter.title}</h2>
          <span>{selectedChapter.summary}</span>
          <div className="mini-progress"><span style={{ width: `${readProgress}%` }} /></div>
          <button onClick={() => navigate(ROUTES.READER)}>Abrir no leitor</button>
        </div>
      </section>
    </div>
  );

  const BookView = () => (
    <div className="book-stage page-enter">
      <img className="book-cover-main" src="/media/imagens/capas/capa.webp" alt="Capa do livro" />
      <div className="book-buttons">
        <Button onClick={() => navigate(ROUTES.READER)} className="cover-primary"><BookOpen size={19} /> Ler agora</Button>
        <Button onClick={() => window.open(pdfUrl, '_blank')} variant="secondary"><DownloadCloud size={18} /> Baixar livro</Button>
        <button onClick={() => navigate(ROUTES.LIBRARY)}><Boxes size={17} /> Abrir sumário completo</button>
      </div>
    </div>
  );

  const OnboardingView = () => {
    if (onboardingStep >= onboardingSteps.length) return HomeView();
    const currentStep = onboardingSteps[onboardingStep];
    const showPwaIntro = !isPwaInstalled && !pwaIntroDismissed;

    return (
      <>
        {showPwaIntro ? (
          <PwaInstallIntro />
        ) : (
          <OnboardingModal
            step={onboardingStep + 1}
            totalSteps={onboardingSteps.length}
            title={currentStep.title}
            description={currentStep.description}
            onPlayAudio={() => handlePlayAudio(currentStep.audioUrl, currentStep.title)}
            onNext={() => {
              if (onboardingStep === onboardingSteps.length - 1) handleCompleteOnboarding();
              else setOnboardingStep((step) => step + 1);
            }}
            onSkip={handleCompleteOnboarding}
            isPlaying={audioState.currentUrl === currentStep.audioUrl && audioState.isPlaying}
          />
        )}
        <HomeView />
      </>
    );
  };

  const LibraryView = () => (
    <div className="app-page contents-page page-enter">
      <div className="page-heading">
        <div>
          <p className="kicker">Índice navegável</p>
          <h1>Sumário da jornada</h1>
          <span>Partes, atos, capítulos e pilares organizados como na nova edição.</span>
        </div>
      </div>
      <label className="search-field library-search">
        <Search size={18} />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar capítulo, pilar ou tema..." />
      </label>
      <div className="contents-groups">
        {bookGroups.map((group) => {
          const chapters = filteredChapters.filter(({ chapter }) => chapter.groupId === group.id);
          if (!chapters.length) return null;
          return (
            <section className={`contents-group contents-${group.id}`} key={group.id}>
              <header>
                <p className="kicker">{group.eyebrow}</p>
                <h2>{group.title}</h2>
                <span>{group.description}</span>
              </header>
              <div className="contents-chapters">
                {chapters.map(({ chapter, index }) => (
                  <article className="contents-chapter" key={chapter.id}>
                    <button className="contents-main" onClick={() => goToChapter(index)}>
                      <span className="contents-number">{chapter.roman ?? String(index + 1).padStart(2, '0')}</span>
                      <span>
                        <strong>{chapter.title}</strong>
                        <small>{chapter.summary}</small>
                      </span>
                      <ChevronDown size={19} />
                    </button>
                    {chapter.sections?.length ? (
                      <div className="contents-sections">
                        {chapter.sections.map((section) => <button key={section} onClick={() => goToChapter(index)}>{section}</button>)}
                      </div>
                    ) : null}
                    <div className="contents-quick-actions">
                      <button onClick={() => goToChapter(index)}><BookOpen size={15} /> Ler</button>
                      {chapter.audioTracks?.[0] && (
                        <button onClick={() => handlePlayAudio(chapter.audioTracks[0].url, chapter.title)}>
                          <Headphones size={15} /> Ouvir
                        </button>
                      )}
                    </div>
                    {chapter.pillar ? (
                      <button className="contents-letter-link" onClick={() => { setLetterIndex(chapter.pillar! - 1); navigate(ROUTES.LETTERS); }}>
                        <Mail size={15} /> Escrever carta deste pilar
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  const SessionsView = () => (
    <div className="app-page page-enter">
      <div className="page-heading">
        <div>
          <p className="kicker">Sessões</p>
          <h1>Áudios sensoriais</h1>
        </div>
      </div>
      <section className="session-grid">
        {[
          { title: 'Sobrevivência', text: 'Para dias em que a leitura precisa ser curta e segura.', audioUrl: '/media/audios/home/sobrevivencia.mp3' },
          { title: 'Reconstrução', text: 'Para voltar a organizar a força sem pressa.', audioUrl: '/media/audios/home/reconstrucao.mp3' },
          { title: 'Continuidade', text: 'Para sustentar o eixo depois do impacto.', audioUrl: '/media/audios/home/continuidade.mp3' },
        ].map((item) => (
          <article key={item.title} className="session-card">
            <span>Rota guiada</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            <div className="session-actions">
              <button onClick={() => handlePlayAudio(item.audioUrl, item.title)}><ListMusic size={16} /> Ouvir agora</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const IGentView = () => (
    <div className="app-page page-enter">
      <section className="igent-head">
        <p className="kicker">iGentMIND</p>
        <h1>Conselheiro Virtual</h1>
        <span>Escolha o que você está sentindo agora.</span>
      </section>
      <section className="mentor-topic-grid">
        {mentorTopics.map((topic) => {
          const Icon = topic.icon;
          const active = activeMentorTopic.id === topic.id;
          return (
            <button
              key={topic.id}
              className={active ? 'mentor-topic active' : 'mentor-topic'}
              style={{ '--topic-color': topic.color } as any}
              onClick={() => {
                setActiveMentorTopic(topic);
                handlePlayAudio(topic.audioUrl, topic.title);
              }}
            >
              <Icon size={30} />
              <strong>{topic.title}</strong>
            </button>
          );
        })}
      </section>
      <section className="igent-answer">
        <Brain size={22} />
        <div>
          <h2>{activeMentorTopic.title}</h2>
          <p>Respire antes de responder ao que te acusa por dentro. O iGentMIND não tenta te convencer de que está tudo bem; ele te ajuda a separar o que é dor, o que é julgamento e qual próximo gesto ainda é possível.</p>
        </div>
      </section>
    </div>
  );

  const IGentMindView = () => {
    const guide = getMindGuide();
    return (
      <div className="app-page page-enter">
        {mindStep === 'select' ? (
          <>
            <section className="igent-head">
              <p className="kicker">iGentMIND</p>
              <h1>Conselheiro Virtual</h1>
              <span>Escolha o que você está sentindo agora. O agente responde com contraponto, presença e um capítulo sugerido.</span>
            </section>
            {mindSavedPlan && (
              <section className="igent-answer mind-last-plan">
                <Brain size={22} />
                <div>
                  <h2>Continuar de onde parou</h2>
                  <p>{mindSavedPlan.response}</p>
                  <div className="mind-replies">
                    <button onClick={() => startMindSession(
                      mentorTopics.find((topic) => topic.id === mindSavedPlan.topicId) || activeMentorTopic,
                      `Retome esta orientacao e me diga o proximo gesto: ${mindSavedPlan.response}`,
                      'chat',
                    )}>Retomar conversa</button>
                    <button onClick={() => goToChapter(mindSavedPlan.chapterIndex)}>Abrir trecho</button>
                  </div>
                </div>
              </section>
            )}
            <section className="mind-entry-grid">
              <button onClick={() => startMindSession(activeMentorTopic, `Estou na pagina ${pdfPage}, lendo ${selectedChapter.title}. Me ajude a entender o que este trecho esta tocando em mim.`, 'reader')}>
                <BookOpen size={18} />
                <strong>Conversar sobre a leitura</strong>
                <span>Usa a pagina e o capitulo atual como contexto.</span>
              </button>
              <button onClick={() => startMindSession(activeMentorTopic, workbookEntry.trim() || 'Quero organizar o que escrevi no diario e transformar em um gesto pequeno.', 'workbook')}>
                <NotebookPen size={18} />
                <strong>Analisar diario</strong>
                <span>Cruza escrita, pilar atual e respostas salvas.</span>
              </button>
              <button onClick={() => startMindSession(activeMentorTopic, 'Faca uma triagem rapida do meu estado agora e me oriente por uma pergunta de cada vez.', 'chat')}>
                <Zap size={18} />
                <strong>Triagem rapida</strong>
                <span>Comeca com uma conversa curta e objetiva.</span>
              </button>
            </section>
            <section className="mentor-topic-grid">
              {mentorTopics.map((topic) => {
                const Icon = topic.icon;
                const active = activeMentorTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    className={active ? 'mentor-topic active' : 'mentor-topic'}
                    style={{ '--topic-color': topic.color } as any}
                    onClick={() => startMindSession(topic)}
                  >
                    <Icon size={30} />
                    <strong>{topic.title}</strong>
                  </button>
                );
              })}
            </section>
            <section className="igent-answer">
              <Brain size={22} />
              <div>
                <h2>Como ele funciona</h2>
                <p>O iGentMIND não diagnostica e não substitui cuidado profissional. Ele conversa com a linguagem do livro: separa dor de julgamento, devolve presença e aponta uma leitura para confrontar o medo sem se violentar.</p>
              </div>
            </section>
          </>
        ) : (
          <section className="mind-chat-shell">
            <div className="mind-chat-top">
              <button onClick={() => setMindStep('select')}><ChevronLeft size={18} /> Voltar</button>
              <div>
                <p className="kicker">iGentMIND · {activeMentorTopic.title}</p>
                <h1>Conversa guiada</h1>
              </div>
              <button onClick={() => goToChapter(guide.chapterHint)}><FileText size={17} /> Capítulo</button>
            </div>

            <div className="mind-chat-window">
              {mindMessages.map((message) => (
                <div key={message.id} className={`mind-message ${message.from} ${message.kind ?? ''}`}>
                  <div className="mind-avatar">{message.from === 'agent' ? <Brain size={18} /> : <Sparkles size={18} />}</div>
                  <div className="mind-bubble">
                    {message.text.split('\n').map((line) => <p key={line}>{line}</p>)}
                    {message.recommendations && (
                      <div className="mind-recommendations">
                        {message.recommendations.map((item) => (
                          <article key={`${message.id}-${item.chapterIndex}`}>
                            <span>{item.reason}</span>
                            <strong>{item.title}</strong>
                            <p>{item.excerpt}</p>
                            <div>
                              <button onClick={() => goToChapter(item.chapterIndex)}>Ler trecho</button>
                              {item.audioUrl && <button onClick={() => handlePlayAudio(item.audioUrl, item.title)}>Ouvir pilar</button>}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    {message.replies && (
                      <div className="mind-replies">
                        {message.replies.map((reply) => (
                          <button key={reply} onClick={() => handleMindQuickReply(reply)}>{reply}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              className="mind-compose"
              onSubmit={(event) => {
                event.preventDefault();
                answerMind(mindInput);
              }}
            >
              <input
                value={mindInput}
                onChange={(event) => setMindInput(event.target.value)}
                placeholder="Responda com suas palavras..."
                disabled={mindLoading}
              />
              <button type="submit" disabled={mindLoading}>{mindLoading ? 'Pensando...' : 'Enviar'}</button>
            </form>
          </section>
        )}
      </div>
    );
  };

  const ReaderView = () => (
    <div className="app-page reader-page page-enter">
      <ReaderShell
        title={selectedChapter.title}
        chapterLabel={`Capítulo ${currentChapterIndex + 1}`}
        summary={selectedChapter.summary}
        pages={pages}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        fontSize={fontSize}
        chapterPage={pageIndex + 1}
        chapterPageTotal={pages.length}
        chapterIndex={currentChapterIndex}
        chapterTotal={bookChapters.length}
        chapterKind={getChapterKind(currentChapterIndex, selectedChapter.title)}
        chapterSections={selectedChapter.sections}
        coverImageUrl="/media/imagens/capas/capa-topo.jpg"
        audioTracks={selectedChapterAudioTracks}
        pdfUrl={pdfUrl}
        pdfTextPages={mergedPdfTextPages}
        pdfCurrentPage={pdfPage}
        totalPdfPages={totalPdfPages}
        chapters={bookChapters}
        onPdfPageChange={goToPdfPage}
        onPdfDocumentReady={setTotalPdfPages}
        onSelectChapter={goToChapter}
        playAudio={handlePlayAudio}
        audioProgress={audioProgressMap}
        activeAudioUrl={audioState.currentUrl}
        isAudioPlaying={audioState.isPlaying}
        isFavorite={favorites.includes(selectedChapter.id)}
        onToggleFavorite={() => toggleFavorite(selectedChapter.id)}
        isPageBookmarked={Boolean(currentPageNote)}
        pageNote={currentPageNote?.note || ''}
        readerNotes={readerNotes}
        noteSaveStatus={noteSaveStatus}
        onTogglePageBookmark={togglePageBookmark}
        onPageNoteChange={updateCurrentPageNote}
        onOpenCurrentLetter={openCurrentPillarLetter}
        currentLetterTitle={currentPillarLetter?.title}
        onFontIncrease={() => setFontSize((size) => clamp(size + 1, 14, 28))}
        onFontDecrease={() => setFontSize((size) => clamp(size - 1, 14, 28))}
        onOpenPdf={() => window.open(pdfUrl, '_blank')}
        onShare={handleShareChapter}
        onExitReader={() => navigate(ROUTES.HOME)}
        showNarrationButton={showReaderNarrationButton}
      />
    </div>
  );

  const LockedView = ({ title, offerKey = 'vip' }: { title: string; offerKey?: UpgradeKey }) => (
    <div className="app-page page-enter">
      <section className="locked-panel">
        <div className="mentor-mark"><Lock size={20} /></div>
        <p className="kicker">Função extra</p>
        <h1>{title}</h1>
        <p>Este recurso faz parte de um módulo extra. Você pode adquirir o produto específico agora ou testar a liberação localmente.</p>
        <div className="locked-actions">
          <Button onClick={() => openUpgrade(offerKey)}><Zap size={17} /> Ver oferta</Button>
          <Button onClick={() => unlockOrderBump(upgradeOffers[offerKey].plan)} variant="ghost">Liberar localmente</Button>
        </div>
      </section>
    </div>
  );

  const WorkbookView = () => {
    if (!hasWorkbookAccess) return <LockedView title="Diário bloqueado" offerKey="workbook" />;
    const savedAt = getLocalWorkbookSavedAt();
    const currentPillar = workbookPillars[workbookPillarIndex] ?? workbookPillars[0];
    const answeredCount = Object.values(workbookAnswers).filter((answer) => answer.trim()).length;
    const totalQuestions = workbookPillars.reduce((total, pillar) => total + pillar.questions.length, 0);
    const linkedTopic = mentorTopics[workbookPillarIndex % mentorTopics.length];
    const currentText = currentPillar.questions
      .map((_, index) => workbookAnswers[`${workbookPillarIndex}-${index}`] || '')
      .filter(Boolean)
      .join(' ');

    const exportWorkbook = () => {
      const guidedAnswers = workbookPillars.map((pillar, pillarIndex) => {
        const answers = pillar.questions.map((question, questionIndex) => {
          const answer = workbookAnswers[`${pillarIndex}-${questionIndex}`] || '';
          return `${question}\n${answer || '[sem resposta]'}`;
        }).join('\n\n');
        return `${pillar.roman}. ${pillar.title}\n${answers}`;
      }).join('\n\n---\n\n');
      const blob = new Blob([
        `Diário dos Desacreditados\n\nPergunta-guia: ${workbookPrompt}\n\n${workbookEntry}\n\n---\n\n${guidedAnswers}`,
      ], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'diario-dos-desacreditados-resposta.txt';
      anchor.click();
      URL.revokeObjectURL(url);
    };

    const updateAnswer = (questionIndex: number, value: string) => {
      const next = { ...workbookAnswers, [`${workbookPillarIndex}-${questionIndex}`]: value };
      setWorkbookAnswers(next);
      saveLocalWorkbookAnswers(next);
      flashSaveFeedback('workbook', setWorkbookSaveStatus);
    };

    const currentSavedAnswers = currentPillar.questions
      .map((question, index) => ({ question, answer: workbookAnswers[`${workbookPillarIndex}-${index}`] || '' }))
      .filter((item) => item.answer.trim());

    const buildWorkbookJourneyText = () => workbookPillars.map((pillar, pillarIndex) => {
      const answers = pillar.questions.map((question, questionIndex) => {
        const answer = workbookAnswers[`${pillarIndex}-${questionIndex}`] || '';
        return `${question}\n${answer || '[sem resposta]'}`;
      }).join('\n\n');
      return `${pillar.roman}. ${pillar.title}\n${answers}`;
    }).join('\n\n---\n\n');

    const openWorkbookIntro = () => {
      handlePlayAudio(WORKBOOK_WELCOME_AUDIO, 'Boas-vindas ao Diario');
    };

    const enterWorkbook = () => {
      localStorage.setItem(WORKBOOK_INTRO_KEY, 'true');
      setWorkbookIntroDismissed(true);
    };

    const goToWorkbookPillar = (nextIndex: number) => {
      const safeIndex = clamp(nextIndex, 0, workbookPillars.length - 1);
      if (safeIndex === workbookPillarIndex) return;
      const phrase = safeIndex > workbookPillarIndex
        ? workbookTransitionPhrases[workbookPillarIndex] || 'Uma parte terminou. A proxima pergunta nao cobra resposta pronta.'
        : 'Voltar tambem faz parte da jornada. Algumas respostas precisam ser reencontradas.';
      setWorkbookTransition(phrase);
      window.setTimeout(() => {
        setWorkbookPillarIndex(safeIndex);
        setWorkbookTransition('');
      }, 1800);
    };

    const sendCurrentPillarToMind = () => {
      const answers = currentPillar.questions.map((question, index) => ({
        question,
        answer: workbookAnswers[`${workbookPillarIndex}-${index}`] || '',
      })).filter((item) => item.answer.trim());
      const answerText = answers.map((item) => `Pergunta: ${item.question}\nResposta: ${item.answer}`).join('\n\n');
      startMindSession(
        linkedTopic,
        answerText.trim()
          ? `Leia as respostas abaixo como Diego leria: com tom de autor parceiro, sem parecer agente generico. Antes de perguntar qualquer coisa, abra com uma observacao especifica sobre uma palavra, repeticao, ausencia ou tensao que aparece no texto. Depois devolva uma pergunta curta, humana e dificil na medida certa.\n\nPilar atual: ${currentPillar.title}\n\n${answerText}`
          : `Estou no pilar ${currentPillar.title}. Abra como Diego, explicando por onde comecar sem transformar isso em questionario.`,
        'workbook',
      );
    };

    const sendJourneyToMind = () => {
      startMindSession(
        activeMentorTopic,
        `Use toda a memoria abaixo do meu Diario dos Desacreditados como contexto da proxima conversa. Responda como autor parceiro: primeiro diga o padrao que mais se repete na minha jornada, depois faca uma unica pergunta que me ajude a continuar.\n\n${buildWorkbookJourneyText()}`,
        'workbook',
      );
    };

    if (!workbookIntroDismissed) {
      return (
        <div className="app-page workbook-page page-enter">
          <section className="workbook-welcome">
            <div className="mentor-mark"><NotebookPen size={22} /></div>
            <p className="kicker">Diario dos Desacreditados</p>
            <h1>Antes de responder, escute isto.</h1>
            <p>Esse diario nao e um questionario. Nao tem resposta certa. Nao tem nota. Ele existe porque algumas perguntas precisam ser feitas em voz alta, mesmo que so para voce mesmo.</p>
            <p>Comeca pelo pilar que mais incomoda. Ou pelo que menos assusta. O iGentMIND vai ler o que voce escrever e devolver uma pergunta que eu faria se estivesse do outro lado. Nao para resolver. Para continuar.</p>
            <div className="workbook-welcome-actions">
              <Button onClick={openWorkbookIntro} variant="secondary"><Volume2 size={17} /> Ouvir Diego</Button>
              <Button onClick={enterWorkbook}><BookOpen size={17} /> Comecar diario</Button>
            </div>
            <small>Audio esperado: {WORKBOOK_WELCOME_AUDIO}</small>
          </section>
        </div>
      );
    }

    return (
      <div className="app-page workbook-page page-enter">
        <section className="workbook-hero">
          <div>
            <p className="kicker">Workbook</p>
            <h1>Diário dos Desacreditados</h1>
            <p>{answeredCount} de {totalQuestions} respostas preenchidas. Escreva sem precisar performar clareza.</p>
          </div>
          <div className="workbook-hero-actions">
            <Button onClick={() => window.open(workbookPdfUrl, '_blank')} variant="secondary"><DownloadCloud size={17} /> Abrir PDF</Button>
            <Button onClick={exportWorkbook} variant="ghost">Exportar</Button>
            <Button onClick={sendJourneyToMind} variant="secondary"><Brain size={17} /> Enviar ao iGentMIND</Button>
          </div>
        </section>

        <section className="diary-shell">
          <article className="diary-panel">
            <div className="pilar-nav">
              {workbookPillars.map((pillar, index) => {
                const answered = pillar.questions.some((_, questionIndex) => workbookAnswers[`${index}-${questionIndex}`]?.trim());
                return (
                  <button
                    key={pillar.title}
                    className={`${workbookPillarIndex === index ? 'active' : ''} ${answered ? 'answered' : ''}`}
                    onClick={() => goToWorkbookPillar(index)}
                    title={pillar.title}
                  >
                    <span className="pilar-roman">{pillar.roman}</span>
                    <span className="pilar-name">{pillar.title}</span>
                    <span className="pilar-dot" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <p className="kicker">Pilar {currentPillar.roman}</p>
            <h2>{currentPillar.title}</h2>
            <em>{currentPillar.subtitle}</em>
            <p className="diary-intro">{currentPillar.intro}</p>

            <div className="diary-questions">
              {currentPillar.questions.map((question, questionIndex) => (
                <label key={question} className="diary-question">
                  <span>Questão {questionIndex + 1}</span>
                  <strong>{question}</strong>
                  <textarea
                    value={workbookAnswers[`${workbookPillarIndex}-${questionIndex}`] || ''}
                    onChange={(event) => updateAnswer(questionIndex, event.target.value)}
                    placeholder="Responda sem pressa. O ponto aqui é honestidade, não performance."
                  />
                </label>
              ))}
            </div>

            <div className="workbook-actions">
              <Button onClick={() => {
                const summary = currentPillar.questions.map((question, index) => `${question}\n${workbookAnswers[`${workbookPillarIndex}-${index}`] || ''}`).join('\n\n');
                setWorkbookEntry(summary);
                saveLocalWorkbookEntry(summary);
                flashSaveFeedback('workbook', setWorkbookSaveStatus);
              }} variant="secondary">Salvar pilar</Button>
              <Button onClick={() => goToWorkbookPillar(workbookPillarIndex + 1)} variant="ghost">Próximo</Button>
              <span className={`save-feedback ${workbookSaveStatus}`}>
                {workbookSaveStatus === 'saving' ? 'Salvando...' : workbookSaveStatus === 'saved' ? 'Salvo' : answeredCount ? 'Salvo automaticamente' : 'Aguardando escrita'}
              </span>
            </div>
            <div className="saved-items-list">
              <strong>Respostas salvas neste pilar</strong>
              {currentSavedAnswers.length ? currentSavedAnswers.map((item, index) => (
                <button className="saved-dialogue-item" key={`${item.question}-${index}`} type="button">
                  <span>Pergunta {index + 1}</span>
                  <strong>{item.question}</strong>
                  <p>{trimExcerpt(item.answer, 120)}</p>
                </button>
              )) : <small>Nenhuma resposta salva neste pilar ainda.</small>}
            </div>
          </article>

          <aside className="diary-mind-panel">
            <div className="mentor-mark"><Brain size={20} /></div>
            <p className="kicker">{hasMindAccess ? 'iGentMIND' : 'Mentor bloqueado'}</p>
            <h2>{hasMindAccess ? 'Leitura do seu momento' : 'Desbloqueie iGentMIND'}</h2>
            {hasMindAccess ? (
              <>
                <p>{currentText.trim() ? `Pelo que você escreveu em ${currentPillar.title}, o caminho mais útil agora é transformar percepção em um gesto pequeno.` : 'Escreva uma resposta para eu cruzar seu estado com os pilares do livro.'}</p>
                <div className="mind-tags">
                  <span>{currentPillar.title}</span>
                  <span>{linkedTopic.title}</span>
                  <span>{planLabels[plan]}</span>
                </div>
                <div className="recommendation-mini">
                  <strong>Trecho sugerido</strong>
                  <p>{trimExcerpt(bookChapters[workbookPillarIndex + 8]?.summary || selectedChapter.summary, 120)}</p>
                </div>
                <Button onClick={sendCurrentPillarToMind}><Zap size={17} /> Conversar com iGentMIND</Button>
              </>
            ) : (
              <>
                <p>Este painel cruza suas respostas com temas do livro e sugere capítulos, áudios e contrapontos.</p>
                <Button onClick={() => openUpgrade('igent30')}><Zap size={17} /> Desbloquear iGent 30 dias</Button>
              </>
            )}
            <span>{workbookSaveStatus === 'saving' ? 'Salvando...' : workbookSaveStatus === 'saved' ? 'Salvo agora' : savedAt ? 'Salvo localmente' : 'Salvamento automático ativo'}</span>
          </aside>
        </section>

        <section className="workbook-grid">
          <aside className="workbook-prompts">
            <p className="kicker">Perguntas de presença</p>
            {workbookPrompts.map((prompt) => (
              <button key={prompt} className={workbookPrompt === prompt ? 'active' : ''} onClick={() => setWorkbookPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </aside>

          <article className="workbook-editor">
            <div className="workbook-editor-head">
              <div>
                <p className="kicker">Escrita atual</p>
                <h2>{workbookPrompt}</h2>
              </div>
              <span className={`save-feedback ${workbookSaveStatus}`}>{workbookSaveStatus === 'saving' ? 'Salvando...' : workbookSaveStatus === 'saved' ? 'Salvo' : savedAt ? `Salvo localmente` : 'Salvamento automático'}</span>
            </div>
            <textarea
              value={workbookEntry}
              onChange={(event) => {
                setWorkbookEntry(event.target.value);
                saveLocalWorkbookEntry(event.target.value);
                flashSaveFeedback('workbook', setWorkbookSaveStatus);
              }}
              placeholder="Escreva aqui. Não precisa ficar bonito. Precisa ser honesto o suficiente para você se ouvir."
            />
            <div className="workbook-actions">
              <Button onClick={exportWorkbook} variant="secondary">Exportar texto</Button>
              <Button onClick={() => setWorkbookEntry('')} variant="ghost">Limpar</Button>
            </div>
          </article>
        </section>
      </div>
    );
  };

  const FavoritesView = () => {
    const favoriteChapterList = bookChapters.filter((chapter) => favorites.includes(chapter.id));
    const markedPages = [...readerNotes]
      .filter((note) => note.note.trim() || note.id.startsWith('page-'))
      .sort((a, b) => a.page - b.page);
    return (
      <div className="app-page page-enter">
        <div className="page-heading"><div><p className="kicker">Favoritos</p><h1>Salvos para voltar</h1></div></div>
        <div className="chapter-list">
          {favoriteChapterList.length === 0 ? (
            <div className="empty-state">Nenhum capítulo salvo ainda.</div>
          ) : favoriteChapterList.map((chapter) => (
            <article key={chapter.id} className="chapter-row">
              <div><span>Capítulo {bookChapters.indexOf(chapter) + 1}</span><h2>{chapter.title}</h2><p>{chapter.summary}</p></div>
              <Button onClick={() => goToChapter(bookChapters.indexOf(chapter))} variant="secondary">Ler</Button>
            </article>
          ))}
        </div>
        <div className="page-heading compact-heading"><div><p className="kicker">Marcadores</p><h1>Páginas marcadas</h1></div></div>
        <div className="chapter-list">
          {markedPages.length === 0 ? (
            <div className="empty-state">Nenhuma página marcada ainda.</div>
          ) : markedPages.map((note) => (
            <article key={note.id} className="chapter-row">
              <div>
                <span>Página {note.page}</span>
                <h2>{repairMojibake(note.title)}</h2>
                <p>{note.note.trim() ? trimExcerpt(note.note, 140) : 'Marcada para voltar depois.'}</p>
              </div>
              <Button onClick={() => {
                goToPdfPage(note.page);
                navigate(ROUTES.READER);
              }} variant="secondary">Abrir</Button>
            </article>
          ))}
        </div>
      </div>
    );
  };

  const LettersView = () => {
    const currentLetter = pillarLetters[letterIndex] ?? pillarLetters[0];
    const writtenCount = pillarLetters.filter((letter) => readerLetters[letter.id]?.trim()).length;
    const currentMeta = letterMeta[currentLetter.id] ?? {};
    const updateLetter = (value: string) => {
      const next = { ...readerLetters, [currentLetter.id]: value };
      setReaderLetters(next);
      saveLocalLetters(next);
      flashSaveFeedback('letters', setLetterSaveStatus);
    };
    const updateLetterMeta = (field: keyof LetterMeta, value: string) => {
      const next = {
        ...letterMeta,
        [currentLetter.id]: {
          ...currentMeta,
          [field]: value,
          updatedAt: new Date().toISOString(),
        },
      };
      setLetterMeta(next);
      saveLocalLetterMeta(next);
      flashSaveFeedback('letters', setLetterSaveStatus);
    };
    const copyCurrentLetter = () => {
      navigator.clipboard?.writeText(readerLetters[currentLetter.id] || '').catch(() => {});
      playClick('soft');
    };
    const exportLetters = () => {
      const text = pillarLetters.map((letter) => (
        `${letter.roman} · ${letter.title}\n${readerLetters[letter.id]?.trim() || '[carta ainda não escrita]'}`
      )).join('\n\n────────────────────────\n\n');
      const blob = new Blob([`MINHAS CARTAS DE PRESENÇA\n\n${text}`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'minhas-cartas-de-presenca.txt';
      anchor.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="app-page letters-page page-enter">
        <section className="letters-hero">
          <div>
            <p className="kicker">Caderno de Presença</p>
            <h1>Minhas cartas</h1>
            <p>Um espaço íntimo para responder aos pilares com suas próprias palavras. {writtenCount} de {pillarLetters.length} cartas iniciadas.</p>
          </div>
          <Button onClick={exportLetters} variant="secondary"><DownloadCloud size={17} /> Exportar cartas</Button>
        </section>

        <section className="letters-shell">
          <aside className="letters-index">
            <p className="kicker">Cartas da jornada</p>
            {pillarLetters.map((letter, index) => (
              <button
                key={letter.id}
                className={`${letterIndex === index ? 'active' : ''} ${readerLetters[letter.id]?.trim() ? 'written' : ''}`}
                onClick={() => setLetterIndex(index)}
              >
                <span>{letter.roman}</span>
                <strong>{letter.title}</strong>
                <small>{readerLetters[letter.id]?.trim() ? trimExcerpt(readerLetters[letter.id], 54) : 'Ainda em branco'}</small>
              </button>
            ))}
          </aside>

          <article className="letter-editor">
            <div className="letter-paper">
              <header>
                <p className="kicker">{currentLetter.roman === '∞' ? 'Encerramento' : `Pilar ${currentLetter.roman}`}</p>
                <h2>{currentLetter.title}</h2>
                <p>{currentLetter.prompt}</p>
              </header>
              <div className="letter-mood-grid">
                <label>
                  <span>Como cheguei nesta carta?</span>
                  <input
                    value={currentMeta.before || ''}
                    onChange={(event) => updateLetterMeta('before', event.target.value)}
                    placeholder="Ex.: cansado, confuso, aliviado..."
                  />
                </label>
                <label>
                  <span>Como saio depois de escrever?</span>
                  <input
                    value={currentMeta.after || ''}
                    onChange={(event) => updateLetterMeta('after', event.target.value)}
                    placeholder="Ex.: mais leve, ainda mexido..."
                  />
                </label>
              </div>
              <textarea
                value={readerLetters[currentLetter.id] || ''}
                onChange={(event) => updateLetter(event.target.value)}
                placeholder={currentLetter.starter}
                aria-label={currentLetter.title}
              />
              <footer>
                <span className={`save-feedback ${letterSaveStatus}`}>
                  {letterSaveStatus === 'saving' ? 'Salvando...' : letterSaveStatus === 'saved' ? 'Carta salva' : readerLetters[currentLetter.id]?.trim() ? 'Salva neste dispositivo' : 'Salvamento automático neste dispositivo'}
                </span>
                <strong>— {readerName}</strong>
              </footer>
            </div>
            <div className="letter-actions">
              {letterIndex < 9 && <Button onClick={() => goToChapter(8 + letterIndex)} variant="ghost"><BookOpen size={17} /> Voltar ao pilar</Button>}
              <Button onClick={() => {
                flashSaveFeedback('letters', setLetterSaveStatus);
                setLetterIndex(clamp(letterIndex + 1, 0, pillarLetters.length - 1));
              }}>{letterSaveStatus === 'saving' ? 'Salvando...' : letterSaveStatus === 'saved' ? 'Salvo' : 'Próxima carta'}</Button>
            </div>
          </article>
        </section>
      </div>
    );
  };

  const ManifestoView = () => (
    <div className="app-page page-enter">
      <section className="manifesto-panel about-panel">
        <p className="kicker">Sobre o projeto</p>
        <h1>O Poder dos Desacreditados nasceu para acompanhar quem continuou mesmo sem aplauso.</h1>
        <p>Este espaço não é sobre performance de superação. É sobre leitura, presença e continuidade para quem foi reduzido, questionado ou ignorado por tempo demais.</p>
        <div className="about-grid">
          <article>
            <span>Projeto</span>
            <strong>Livro, diário, áudios e mentor</strong>
            <p>Uma experiência guiada para transformar leitura em permanência: texto, escuta, escrita e uma próxima pergunta possível.</p>
          </article>
          <article>
            <span>Autor</span>
            <strong>Diego como presença editorial</strong>
            <p>A voz do projeto aparece como autor parceiro: não para resolver por você, mas para sustentar a conversa quando a resposta ainda não chegou.</p>
          </article>
          <article>
            <span>Manifesto</span>
            <strong>Continuar sem pedir licença</strong>
            <p>Você não precisa ser acreditado por todos para continuar existindo com força.</p>
          </article>
        </div>
        <Button onClick={() => handlePlayAudio('/media/audios/manifesto/boas-vindas.mp3', 'Manifesto do projeto')}><Play size={17} /> Ouvir manifesto</Button>
      </section>
    </div>
  );

  const CommunityView = () => (
    <div className="app-page page-enter">
      <section className="community-panel">
        <div>
          <p className="kicker">Comunidade</p>
          <h1>Comunidade Viva dos Desacreditados</h1>
          <p>Um espaço de continuidade para quem não quer atravessar o livro sozinho depois que a leitura toca alguma coisa real.</p>
        </div>
        <div className="community-status">
          <span>{hasGroupAccess ? 'Acesso liberado' : 'Produto adicional'}</span>
          <strong>{upgradeOffers.group.price}</strong>
        </div>
      </section>

      <section className="community-grid">
        <article>
          <Users size={22} />
          <h2>Grupo de apoio</h2>
          <p>Um lugar para permanecer perto da obra, compartilhar avanços e voltar aos pilares sem transformar isso em cobrança.</p>
        </article>
        <article>
          <BookOpen size={22} />
          <h2>Leitura acompanhada</h2>
          <p>Rodas, provocações e convites de leitura para manter a jornada viva depois do primeiro contato com o livro.</p>
        </article>
        <article>
          <Headphones size={22} />
          <h2>Continuidade emocional</h2>
          <p>Áudios, temas e encontros de apoio para quando a pessoa precisa de presença, não de mais conteúdo solto.</p>
        </article>
      </section>

      <section className="community-panel community-cta">
        <div>
          <p className="kicker">Order bump</p>
          <h2>Ofereça a comunidade como próximo passo natural.</h2>
          <p>Depois que o leitor desbloqueia o livro, o grupo entra como sustentação: menos vitrine, mais permanência.</p>
        </div>
        <Button onClick={() => openUpgradeCheckout('group')}><Users size={17} /> Entrar na comunidade</Button>
      </section>
    </div>
  );
  const SettingsView = () => (
    <div className="app-page account-page page-enter">
      <section className="account-hero">
        <div className="account-avatar">{readerName.slice(0, 1).toUpperCase()}</div>
        <div>
          <p className="kicker">Minha conta</p>
          <h1>Olá, {readerName}.</h1>
          <span>Que bom te ver aqui. Este é o seu espaço para acompanhar assinatura, produtos e dados de acesso.</span>
        </div>
      </section>

      <section className="account-grid">
        <article className="account-card">
          <p className="kicker">Assinatura</p>
          <h2>{planLabels[plan]}</h2>
          <div className="setting-row"><span>Status</span><strong>Ativo</strong></div>
          <div className="setting-row"><span>Acesso</span><strong>{maskAccessToken(localStorage.getItem('opd_token'))}</strong></div>
          <div className="setting-row"><span>{'Recorr\u00eancia'}</span><strong>{hasMindAccess || hasGroupAccess ? 'Preparada' : 'N\u00e3o ativa'}</strong></div>
          <button className="token-copy-button" onClick={() => navigator.clipboard?.writeText(localStorage.getItem('opd_token') || '')}>
            {'Copiar chave de sess\u00e3o'}
          </button>
        </article>

        <article className="account-card account-edit">
          <p className="kicker">Perfil</p>
          <label>
            <span>Nome</span>
            <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Seu nome" />
          </label>
          <label>
            <span>E-mail</span>
            <input value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} placeholder="voce@email.com" />
          </label>
          {accountMessage && <p>{accountMessage}</p>}
          <div className="workbook-actions">
            <Button onClick={saveAccountProfile}>Salvar dados</Button>
            <Button onClick={logout} variant="ghost">Sair</Button>
          </div>
        </article>

        <article className="account-card">
          <p className="kicker">Leitura</p>
          <h2>{'Prefer\u00eancias'}</h2>
          <label className="setting-toggle-row">
            <span>{'Mostrar narra\u00e7\u00e3o da p\u00e1gina'}</span>
            <input
              type="checkbox"
              checked={showReaderNarrationButton}
              onChange={(event) => {
                setShowReaderNarrationButton(event.target.checked);
                localStorage.setItem('opd_show_reader_narration', String(event.target.checked));
              }}
            />
          </label>
        </article>

        <article className="account-card account-sensory-card">
          <p className="kicker">{'\u00c1udios sensoriais'}</p>
          <h2>{'Leitura com presen\u00e7a'}</h2>
          <p>Use uma trilha curta para preparar o corpo antes de ler, escrever ou ouvir um pilar.</p>
          <div className="workbook-actions">
            <Button onClick={() => handlePlayAudio('/media/audios/home/sobrevivencia.mp3', '\u00c1udio sensorial de leitura')} variant="secondary"><Music2 size={16} /> Ouvir agora</Button>
            <Button onClick={() => navigate(ROUTES.SESSIONS)} variant="ghost">{'Ver sess\u00f5es'}</Button>
          </div>
        </article>

        <article className="account-card account-products-card">
          <p className="kicker">Produtos liberados</p>
          <div className="product-list">
            {currentProducts.map((product) => (
              <span key={product}>{PRODUCT_LABELS[product as ProductKey] ?? product}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="upgrade-section">
        <div className="upgrade-section-head">
          <div>
            <p className="kicker">Upgrades</p>
            <h2>Continue expandindo sua jornada</h2>
          </div>
          <span>{lockedUpgradeCount} bloqueado(s)</span>
        </div>
        <div className="upgrade-grid">
          {upgradeEntries.map(([key, offer]) => {
            const isActiveOffer = hasUpgradeOffer(key);
            return (
            <article className={`upgrade-card ${isActiveOffer ? 'active' : 'locked'}`} key={key}>
              <div className="upgrade-card-top">
                <p className="kicker">{offer.eyebrow}</p>
                <span className={`upgrade-lock ${isActiveOffer ? 'active' : 'locked'}`}>
                  <Lock size={15} />
                </span>
              </div>
              <h3>{offer.title}</h3>
              <span>{offer.description}</span>
              <div className="upgrade-card-foot">
                <strong>{offer.price}</strong>
                <button onClick={() => openUpgrade(key)}>{isActiveOffer ? 'Liberado' : 'Ver detalhes'}</button>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <footer className="account-footer">
        <span>O Poder dos Desacreditados {APP_VERSION}</span>
        <strong>{'Feito com presen\u00e7a pela Tr\u00edade'}</strong>
      </footer>
    </div>
  );

  const AdminView = () => (
    <div className="app-page admin-page page-enter">
      <div className="page-heading">
        <div>
          <p className="kicker">Admin</p>
          <h1>Painel de controle</h1>
        </div>
        <span className="plan-badge">{adminReaders.length} leitor(es)</span>
      </div>

      <nav className="admin-module-nav" aria-label="Modulos do admin">
        {[
          { id: 'overview', label: 'Visao geral', icon: Home },
          { id: 'readers', label: 'Leitores', icon: Users },
          { id: 'book', label: 'Livro', icon: BookOpen },
          { id: 'kiwify', label: 'Kiwify', icon: Zap },
          { id: 'plans', label: 'Planos', icon: Lock },
          { id: 'copy', label: 'Copys', icon: NotebookPen },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={adminSection === item.id ? 'active' : ''}
              onClick={() => setAdminSection(item.id as AdminSection)}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {adminMessage && <div className="admin-message">{adminMessage}</div>}

      {adminSection === 'overview' && (
        <section className="admin-overview-grid">
          <article className="account-card admin-stat-card">
            <p className="kicker">Leitores</p>
            <strong>{adminReaders.length}</strong>
            <span>Contas cadastradas no app</span>
          </article>
          <article className="account-card admin-stat-card">
            <p className="kicker">Livro</p>
            <strong>{adminBookPages.length}</strong>
            <span>Paginas com revisao editorial</span>
          </article>
          <article className="account-card admin-stat-card">
            <p className="kicker">Kiwify</p>
            <strong>{adminEvents.length}</strong>
            <span>Eventos recentes sincronizados</span>
          </article>
          <article className="account-card admin-stat-card">
            <p className="kicker">Produtos</p>
            <strong>{adminProducts.length}</strong>
            <span>Produtos ativos para liberar</span>
          </article>
        </section>
      )}

      {adminSection === 'readers' && (
      <>
      <section className="admin-control-grid single">
        <article className="account-card admin-panel">
          <p className="kicker">Novo convite</p>
          <h2>Criar acesso manual</h2>
          <label>
            <span>Nome</span>
            <input value={adminInvite.name} onChange={(event) => setAdminInvite((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do leitor" />
          </label>
          <label>
            <span>E-mail</span>
            <input value={adminInvite.email} onChange={(event) => setAdminInvite((current) => ({ ...current, email: event.target.value }))} placeholder="leitor@email.com" />
          </label>
          <div className="admin-inline">
            <label>
              <span>Plano</span>
              <select value={adminInvite.plan} onChange={(event) => setAdminInvite((current) => ({ ...current, plan: event.target.value as Plan }))}>
                {Object.entries(planLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Expira em dias</span>
              <input value={adminInvite.expiresInDays} onChange={(event) => setAdminInvite((current) => ({ ...current, expiresInDays: event.target.value }))} placeholder="opcional" inputMode="numeric" />
            </label>
          </div>
          <Button onClick={handleCreateAdminInvite}>Criar convite</Button>
          {adminResult && (
            <div className="admin-result">
              <strong>Token criado</strong>
              <code>{adminResult.token}</code>
              <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?token=${adminResult.token}`)}>Copiar link de cadastro</button>
            </div>
          )}
        </article>
      </section>

      <section className="admin-table">
        <div className="admin-row head">
          <span>Leitor</span>
          <span>Plano</span>
          <span>Produtos</span>
          <span>Cadastro</span>
        </div>
        {adminReaders.length === 0 ? (
          <div className="empty-state">Nenhum leitor cadastrado localmente ainda.</div>
        ) : adminReaders.map((reader) => (
          <div className="admin-row" key={reader.id}>
            <div>
              <strong>{reader.name}</strong>
              <small>{reader.email}</small>
            </div>
            <span>{planLabels[reader.plan]}</span>
            <div className="admin-product-chips">
              {(reader.products || []).map((product) => (
                <button key={product} onClick={() => handleRevokeAdminProduct(reader.id, product)} title="Remover produto">
                  {PRODUCT_LABELS[product as ProductKey] ?? product}
                  <X size={12} />
                </button>
              ))}
            </div>
            <span>{reader.createdAt ? new Date(reader.createdAt).toLocaleDateString('pt-BR') : 'local'}</span>
          </div>
        ))}
      </section>
      </>
      )}

      {adminSection === 'plans' && (
        <section className="admin-control-grid single">
          <article className="account-card admin-panel">
            <p className="kicker">Planos e produtos</p>
            <h2>Liberar acesso manual</h2>
            <label>
              <span>Leitor</span>
              <select value={adminSelectedUserId} onChange={(event) => setAdminSelectedUserId(event.target.value)}>
                {adminReaders.map((reader) => <option key={reader.id} value={reader.id}>{reader.name || reader.email}</option>)}
              </select>
            </label>
            <div className="admin-inline">
              <label>
                <span>Plano</span>
                <select value={adminGrant.plan} onChange={(event) => setAdminGrant((current) => ({ ...current, plan: event.target.value as Plan }))}>
                  {Object.entries(planLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Validade em dias</span>
                <input value={adminGrant.expiresInDays} onChange={(event) => setAdminGrant((current) => ({ ...current, expiresInDays: event.target.value }))} placeholder="30, 90..." inputMode="numeric" />
              </label>
            </div>
            <Button onClick={handleGrantAdminPlan}>Aplicar plano</Button>
            <label>
              <span>Produto avulso</span>
              <select value={adminGrant.productKey} onChange={(event) => setAdminGrant((current) => ({ ...current, productKey: event.target.value }))}>
                {adminProducts.map((product) => <option key={product.key} value={product.key}>{product.name}</option>)}
              </select>
            </label>
            <Button onClick={handleGrantAdminProduct} variant="secondary">Liberar produto</Button>
          </article>
        </section>
      )}

      {adminSection === 'book' && (
      <section className="admin-book-editor">
        <div className="admin-section-head">
          <div>
            <p className="kicker">Livro</p>
            <h2>Editor do modo leitura</h2>
          </div>
          <span>{adminPublishedPageCount} publicadas · {adminDraftPageCount} rascunho(s) · {adminBookAudio.length} audio(s)</span>
        </div>
        <div className="admin-book-subnav" role="tablist" aria-label="Editor do livro">
          <button className={adminBookTab === 'pages' ? 'active' : ''} onClick={() => setAdminBookTab('pages')}>
            <FileText size={16} />
            Textos
          </button>
          <button className={adminBookTab === 'audio' ? 'active' : ''} onClick={() => setAdminBookTab('audio')}>
            <Headphones size={16} />
            Áudios
          </button>
        </div>
        {adminBookTab === 'pages' && (
        <>
        <div className="admin-book-toolbar">
          <label>
            <span>Buscar página ou trecho</span>
            <input value={adminBookSearch} onChange={(event) => setAdminBookSearch(event.target.value)} placeholder="Ex.: Pilar I, culpa, página 74..." />
          </label>
          <Button onClick={() => setAdminBookCompareOpen((value) => !value)} variant="secondary">
            {adminBookCompareOpen ? 'Ocultar comparação' : 'Comparar com original'}
          </Button>
          <Button onClick={handleOpenAdminBookPageInReader} variant="ghost">Ver no leitor</Button>
        </div>
        {adminBookCompareOpen && (
          <div className="admin-book-compare">
            <article>
              <div>
                <p className="kicker">Original do PDF</p>
                <strong>Página {adminBookPageNumber}</strong>
              </div>
              <div className="admin-book-compare-box">
                {(adminCurrentPageSource || 'Sem texto extraído para esta página.')
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => <p key={`source-${index}`}>{repairBrokenPdfCharacters(paragraph)}</p>)}
              </div>
            </article>
            <article>
              <div>
                <p className="kicker">Texto em edição</p>
                <strong>{adminCurrentBookPage?.latestPublished ? `Publicado v${adminCurrentBookPage.latestPublished.version}` : 'Ainda não publicado'}</strong>
              </div>
              <div className="admin-book-compare-box edited">
                {(adminBookPageContent || 'Sem texto no editor.')
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => <p key={`edited-${index}`}>{repairBrokenPdfCharacters(paragraph)}</p>)}
              </div>
            </article>
          </div>
        )}
        <div className="admin-book-editor-grid">
          <article className="account-card admin-panel">
            <div className="admin-inline">
              <label>
                <span>Pagina do PDF</span>
                <input
                  value={adminBookPageNumber}
                  min={1}
                  max={Math.max(totalPdfPages, pdfTextPages.length || 1)}
                  type="number"
                  onChange={(event) => setAdminBookPageNumber(clamp(Number(event.target.value) || 1, 1, Math.max(totalPdfPages, pdfTextPages.length || 1)))}
                />
              </label>
              <label>
                <span>Status</span>
                <select
                  value={adminBookPageNumber}
                  onChange={(event) => setAdminBookPageNumber(Number(event.target.value))}
                >
                  {adminBookPageOptions.map((pageNumber) => {
                    const page = adminBookPages.find((item) => item.pageNumber === pageNumber);
                    const label = page?.latestPublished ? 'publicada' : page?.latestDraft ? 'rascunho' : 'original';
                    return <option key={pageNumber} value={pageNumber}>Pagina {pageNumber} - {label}</option>;
                  })}
                </select>
              </label>
            </div>
            <div className="admin-book-status-strip">
              <span className={adminCurrentBookPage?.latestPublished ? 'published' : 'original'}>
                {adminCurrentBookPage?.latestPublished ? `Publicada v${adminCurrentBookPage.latestPublished.version}` : 'Original do PDF'}
              </span>
              {adminCurrentBookPage?.latestDraft && <span className="draft">Rascunho v{adminCurrentBookPage.latestDraft.version}</span>}
              <small>{adminCurrentBookPage?.latestPublished?.updatedAt ? `Atualizada em ${formatDateTime(adminCurrentBookPage.latestPublished.updatedAt)}` : 'Sem publicação manual'}</small>
            </div>
            <label>
              <span>Titulo interno opcional</span>
              <input value={adminBookPageTitle} onChange={(event) => setAdminBookPageTitle(event.target.value)} placeholder="Ex.: Pilar I - Limiar" />
            </label>
            <label>
              <span>Texto da pagina</span>
              <textarea
                ref={adminBookPageTextareaRef}
                className="admin-book-textarea"
                value={adminBookPageContent}
                onChange={(event) => setAdminBookPageContent(event.target.value)}
                placeholder="Cole ou corrija aqui o texto que deve aparecer no modo leitura."
              />
            </label>
            <div className="admin-book-format-tools" aria-label="Formatacao do texto">
              <button type="button" onClick={() => insertAdminBookPageSnippet('[br]')}>Quebra de linha</button>
              <button type="button" onClick={() => insertAdminBookPageSnippet('---')}>Linha divisoria</button>
              <button type="button" onClick={() => insertAdminBookPageSnippet('[[espaco:32]]')}>Espaco</button>
              <button type="button" onClick={() => insertAdminBookPageSnippet('[[imagem:/media/imagens/livro/exemplo.jpg|Legenda da imagem]]')}>Imagem</button>
              <button type="button" onClick={() => insertAdminBookPageSnippet('[[capa:/media/imagens/capas/capa.webp|Capa]]')}>Imagem pagina inteira</button>
            </div>
            <div className="workbook-actions">
              <Button onClick={handleRepairAdminBookPageContent} variant="ghost">Corrigir caracteres</Button>
              <Button onClick={handleCleanAdminBookPageContent} variant="ghost">Limpar texto</Button>
              <Button onClick={handleSaveBookPageDraft} variant="secondary">Salvar rascunho</Button>
              <Button onClick={handlePublishBookPage}>Publicar no leitor</Button>
            </div>
            <small>Use linha vazia para novo paragrafo, [br] para quebra dentro do mesmo paragrafo, --- para divisor, [[espaco:32]] para respiro, [[imagem:/media/imagens/livro/exemplo.jpg|Legenda]] para imagem e [[capa:/media/imagens/capas/capa.webp|Capa]] para pagina inteira.</small>
            <small>Publicar cria uma nova versao e substitui o texto desta pagina para todos os leitores.</small>
          </article>

          <article className="account-card admin-panel admin-book-preview">
            <p className="kicker">Preview</p>
            <h3>Pagina {adminBookPageNumber}</h3>
            <div className="admin-book-preview-box">
              {(adminBookPageContent || adminCurrentPageSource || 'Sem texto nesta pagina.')
                .split(/\n+/)
                .filter(Boolean)
                .slice(0, 8)
                .map((paragraph, index) => <p key={index}>{repairBrokenPdfCharacters(paragraph)}</p>)}
            </div>
            <div className="admin-book-history">
              <strong>Historico</strong>
              {adminBookPageHistory.length === 0 ? (
                <small>Nenhuma versao salva ainda.</small>
              ) : adminBookPageHistory.slice(0, 6).map((revision) => (
                <button
                  key={revision.id}
                  type="button"
                  onClick={() => {
                    setAdminBookPageTitle(revision.title || '');
                    setAdminBookPageContent(revision.content);
                  }}
                >
                  <span>v{revision.version} - {revision.status === 'PUBLISHED' ? 'publicada' : 'rascunho'}</span>
                  <small>{formatDateTime(revision.createdAt)}</small>
                </button>
              ))}
            </div>
          </article>
        </div>
        </>
        )}
        {adminBookTab === 'audio' && (
        <article className="account-card admin-panel admin-audio-editor">
          <div className="admin-section-head compact">
            <div>
              <p className="kicker">Audios do capitulo</p>
              <h2>Titulos e arquivos</h2>
            </div>
            <span>{adminBookAudio.length} audio(s) editados</span>
          </div>
          <div className="admin-control-grid">
            <label>
              <span>Capitulo</span>
              <select value={adminAudioChapterId} onChange={(event) => setAdminAudioChapterId(event.target.value)}>
                {bookChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{repairMojibake(chapter.title)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Secao / faixa</span>
              <select value={adminAudioSectionKey} onChange={(event) => setAdminAudioSectionKey(event.target.value)}>
                {adminAudioTracksForChapter.map((track) => (
                  <option key={audioTrackKey(track.label)} value={audioTrackKey(track.label)}>{repairMojibake(track.label)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-audio-board">
            <div className="admin-audio-board-head">
              <div>
                <strong>Mesa de producao</strong>
                <small>Arraste para organizar. Clique em uma faixa para editar o caminho, titulo e publicar.</small>
              </div>
              <button
                type="button"
                onClick={() => setAdminAudioOrder((current) => ({ ...current, [adminAudioChapterId]: adminAudioTracksForChapter.map((track) => audioTrackKey(track.label)) }))}
              >
                Restaurar ordem
              </button>
              <button type="button" onClick={saveAdminAudioBoard}>
                Salvar mesa
              </button>
            </div>
            <div className="admin-audio-board-grid">
              {adminAudioBoardItems.map((item, index) => (
                <article
                  key={item.productionKey}
                  className={`admin-audio-card ${adminAudioSectionKey === item.sectionKey ? 'active' : ''} ${adminAudioDraggingKey === item.sectionKey ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => setAdminAudioDraggingKey(item.sectionKey)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => dropAdminAudioBoardItem(item.sectionKey)}
                  onDragEnd={() => setAdminAudioDraggingKey('')}
                >
                  <button type="button" className="admin-audio-card-main" onClick={() => selectAdminAudioBoardItem(item.sectionKey)}>
                    <span className="admin-audio-drag"><GripVertical size={15} /></span>
                    <span className="admin-audio-number">{index + 1}</span>
                    <span>
                      <strong>{repairMojibake(item.label)}</strong>
                      <small>{item.published ? `Publicado v${item.published.version || 1}` : 'Usando caminho padrao'}</small>
                    </span>
                  </button>
                  <div className="admin-audio-card-tools">
                    <select
                      value={item.production.status}
                      onChange={(event) => updateAdminAudioProduction(item.productionKey, { status: event.target.value as AdminAudioProductionStatus })}
                    >
                      {(Object.keys(audioProductionLabels) as AdminAudioProductionStatus[]).map((status) => (
                        <option key={status} value={status}>{audioProductionLabels[status]}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handlePlayAudio(item.url, repairMojibake(item.label), item.production.coverUrl || item.published?.coverUrl)}>
                      <Play size={14} /> Testar
                    </button>
                  </div>
                  <textarea
                    value={item.production.note}
                    onChange={(event) => updateAdminAudioProduction(item.productionKey, { note: event.target.value })}
                    placeholder="Observacao: texto inconsistente, voz errada, placeholder, precisa regenerar..."
                  />
                  <label className="admin-audio-cover-field">
                    <span>{item.production.coverUrl ? <img src={item.production.coverUrl} alt="" /> : <Music2 size={18} />}</span>
                    <input
                      value={item.production.coverUrl || ''}
                      onChange={(event) => updateAdminAudioProduction(item.productionKey, { coverUrl: event.target.value })}
                      placeholder="/media/imagens/capas/pilar-01.webp"
                      aria-label="Capa ou miniatura da faixa"
                    />
                  </label>
                  <code>{item.url}</code>
                </article>
              ))}
            </div>
          </div>
          <label>
            <span>Titulo exibido</span>
            <input value={adminAudioLabel} onChange={(event) => setAdminAudioLabel(event.target.value)} placeholder="Ex.: Manifesto de abertura" />
          </label>
          <label>
            <span>Arquivo ou URL do audio</span>
            <input value={adminAudioUrl} onChange={(event) => setAdminAudioUrl(event.target.value)} placeholder="/media/audios/livro/pilar-01-reconhecimento/p1-manifesto.wav" />
          </label>
          <div className="admin-media-path-helper">
            <div>
              <span>Caminho padrão no cPanel</span>
              <code>public_html{adminDefaultAudioTrack?.url || '/media/audios/livro/...'}</code>
            </div>
            <button type="button" onClick={() => adminDefaultAudioTrack && setAdminAudioUrl(adminDefaultAudioTrack.url)}>
              Usar caminho padrão
            </button>
          </div>
          {adminAudioPathWarning && <small className="admin-media-warning">{adminAudioPathWarning}</small>}
          <div className="workbook-actions">
            <Button onClick={() => adminAudioUrl && handlePlayAudio(adminAudioUrl, adminAudioLabel || 'Preview do audio', adminAudioProduction[`${adminAudioChapterId}:${adminAudioSectionKey}`]?.coverUrl)} variant="secondary">Testar audio</Button>
            <Button onClick={handlePublishBookAudio}>Publicar audio</Button>
          </div>
          <div className="admin-book-history">
            <strong>Historico desta faixa</strong>
            {!adminCurrentAudioSummary?.history?.length ? (
              <small>Nenhuma substituicao publicada ainda.</small>
            ) : adminCurrentAudioSummary.history.slice(0, 5).map((revision) => (
              <button
                key={revision.id || `${revision.url}-${revision.version}`}
                type="button"
                onClick={() => {
                  setAdminAudioLabel(revision.label);
                  setAdminAudioUrl(revision.url);
                }}
              >
                <span>v{revision.version || 1} - {revision.label}</span>
                <small>{formatDateTime(revision.createdAt)}</small>
              </button>
            ))}
          </div>
          <small>Suba o arquivo no cPanel dentro de public_html/media e cole aqui o caminho iniciado por /media/.</small>
        </article>
        )}
      </section>
      )}

      {adminSection === 'kiwify' && (
      <section className="admin-events-panel">
        <div className="admin-section-head">
          <div>
            <p className="kicker">Kiwify</p>
            <h2>Eventos recentes</h2>
          </div>
          <Button onClick={refreshAdminData} variant="ghost">Atualizar</Button>
        </div>
        <div className="admin-events-list">
          {adminEvents.length === 0 ? (
            <div className="empty-state">Nenhum evento recebido ainda.</div>
          ) : adminEvents.slice(0, 12).map((event) => (
            <article className="admin-event-row" key={event.id}>
              <div className="admin-event-main">
                <span className={`event-badge ${eventTone(event.eventType)}`}>{eventLabels[event.eventType] ?? event.eventType}</span>
                <strong>{event.email || event.name || 'Sem comprador identificado'}</strong>
                <small>{event.event || event.provider}{event.externalId ? ` - ${event.externalId.slice(0, 8)}` : ''}</small>
              </div>
              <div className="admin-event-meta">
                <span>{event.plan && planLabels[event.plan as Plan] ? planLabels[event.plan as Plan] : event.plan || '-'}</span>
                <small>{(event.productKeys || []).slice(0, 3).map((product) => PRODUCT_LABELS[product as ProductKey] ?? product).join(', ') || event.reason || 'sem produtos'}</small>
              </div>
              <div className="admin-event-status">
                <strong>{event.affectedEntitlements ?? '-'}</strong>
                <small>afetados</small>
              </div>
              <time>{formatDateTime(event.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>
      )}

      {adminSection === 'copy' && (
        <section className="admin-copy-grid">
          <article className="account-card admin-panel">
            <p className="kicker">Copys</p>
            <h2>Central de textos comerciais</h2>
            <p>Modulo preparado para organizar anuncios, headlines, e-mails, WhatsApp, pagina de vendas e variacoes A/B.</p>
            <div className="admin-copy-list">
              {['Anuncios', 'Headlines', 'E-mails', 'WhatsApp', 'Pagina de vendas', 'Onboarding'].map((item) => (
                <button key={item} type="button">
                  <NotebookPen size={16} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );

  const UpgradeModal = () => {
    if (!upgradeModal) return null;
    const offer = upgradeOffers[upgradeModal];
    const alreadyActive = hasUpgradeOffer(upgradeModal);

    return (
      <div className="upgrade-modal-backdrop" role="dialog" aria-modal="true" aria-label={offer.title}>
        <section className="upgrade-modal">
          <button className="upgrade-modal-close" onClick={() => setUpgradeModal(null)} title="Fechar"><X size={20} /></button>
          <p className="kicker">{alreadyActive ? 'Modulo ativo' : offer.eyebrow}</p>
          <h2>{offer.title}</h2>
          <p>{alreadyActive ? 'Este produto ja aparece como liberado para sua conta.' : offer.description}</p>
          <div className="upgrade-price">{offer.price}</div>
          <div className="upgrade-includes">
            {offer.productKeys.map((productKey) => (
              <span key={productKey}>{PRODUCT_LABELS[productKey] ?? productKey}</span>
            ))}
          </div>
          <div className="upgrade-actions">
            <Button onClick={() => openUpgradeCheckout(upgradeModal)} disabled={alreadyActive}>
              <DownloadCloud size={17} /> Ir para checkout
            </Button>
            <Button onClick={() => unlockOrderBump(offer.plan)} variant="ghost">
              Liberar localmente
            </Button>
          </div>
          <small>Depois da compra aprovada, a Kiwify envia o webhook e o acesso e liberado automaticamente.</small>
        </section>
      </div>
    );
  };

  const renderMain = () => {
    switch (route) {
      case ROUTES.ACCESS: return AccessView();
      case ROUTES.ONBOARDING: return OnboardingView();
      case ROUTES.HOME: return HomeView();
      case ROUTES.BOOK: return hasReaderAccess ? BookView() : <LockedView title="Livro interativo bloqueado" offerKey="basic" />;
      case ROUTES.LIBRARY: return hasReaderAccess ? LibraryView() : <LockedView title="Jornada bloqueada" offerKey="basic" />;
      case ROUTES.SESSIONS: return hasReaderAccess ? SessionsView() : <LockedView title="Audios bloqueados" offerKey="basic" />;
      case ROUTES.COMMUNITY: return hasGroupAccess ? CommunityView() : <LockedView title="Comunidade bloqueada" offerKey="group" />;
      case ROUTES.IGENT: return hasMindAccess ? IGentMindView() : <LockedView title="iGentMIND bloqueado" offerKey="igent30" />;
      case ROUTES.FAVORITES: return FavoritesView();
      case ROUTES.WORKBOOK: return WorkbookView();
      case ROUTES.LETTERS: return hasReaderAccess ? LettersView() : <LockedView title="Cartas bloqueadas" offerKey="basic" />;
      case ROUTES.MANIFESTO: return ManifestoView();
      case ROUTES.SETTINGS: return SettingsView();
      case ROUTES.ADMIN: return isAdmin ? AdminView() : <LockedView title="Painel administrativo bloqueado" />;
      case ROUTES.READER: return hasReaderAccess ? ReaderView() : <LockedView title="Leitor bloqueado" offerKey="basic" />;
      default: return HomeView();
    }
  };

  if (route === ROUTES.ACCESS) return AccessView();

  return (
    <div className={`app-shell ${route === ROUTES.READER ? 'reader-route-shell' : ''} ${audioState.currentUrl ? 'audio-active-shell' : ''}`}>
      {Header()}
      {!isPwaInstalled && !pwaIntroDismissed && route !== ROUTES.READER && PwaInstallBar()}
      <div className="app-body">
        {Navigation()}
        <main id="main" className="app-main">{renderMain()}</main>
      </div>
      {BottomNavigation()}
      {UpgradeModal()}
      {workbookTransition && route === ROUTES.WORKBOOK && (
        <div className="workbook-transition" role="status">
          <p>{workbookTransition}</p>
        </div>
      )}
      {audioState.currentUrl && (
        <>
        <div className="audio-dock pro-player compact-audio-player">
          <div className="player-glow" />
          <button className="player-cover" onClick={() => setAudioFullOpen(true)} title="Abrir player completo">
            <Music2 size={16} />
          </button>
          <div className="player-info">
            <p>Tocando agora</p>
            <strong>{audioState.title}</strong>
            <div className="player-wave-progress" style={{ '--audio-progress': `${audioProgress || 0}%` } as React.CSSProperties}>
              <AudioFrequencyBars values={audioFrequencies} />
            <input
              className="player-progress"
              type="range"
              min="0"
              max="100"
              value={audioProgress || 0}
              onChange={(event) => seekAudio(Number(event.target.value))}
              aria-label="Progresso do áudio"
            />
            </div>
            <div className="player-time"><span>{formatTime(audioState.currentTime)}</span><span>{formatTime(audioState.duration)}</span></div>
          </div>
          <label className="volume-control" style={{ '--volume-progress': `${Math.round(audioState.volume * 100)}%` } as React.CSSProperties}>
            <Volume2 size={18} />
            <input type="range" min="0" max="100" value={Math.round(audioState.volume * 100)} onChange={(event) => changeVolume(Number(event.target.value))} />
          </label>
          <button className="speed-control" onClick={changePlaybackRate} title="Velocidade do áudio">
            {audioState.playbackRate % 1 === 0 ? audioState.playbackRate.toFixed(0) : audioState.playbackRate.toFixed(2).replace(/0$/, '')}x
          </button>
          <button className="player-expand" onClick={() => setAudioFullOpen(true)} title="Tela cheia"><Sparkles size={18} /></button>
          <button className="player-play" onClick={() => handlePlayAudio(audioState.currentUrl, audioState.title)}>
            {audioState.isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          </button>
          <button className="player-close" onClick={closeAudio}><X size={22} /></button>
        </div>
        {audioFullOpen && (
          <section className="audio-fullscreen-player" role="dialog" aria-modal="true" aria-label="Player de audiobook">
            <div className="audio-fullscreen-bg" />
            <button className="audio-full-close" onClick={() => setAudioFullOpen(false)} title="Voltar para barra"><X size={20} /></button>
            <div className="audio-full-card">
              <div className="audio-full-cover">
                <img src={audioState.coverUrl || '/media/imagens/capas/capa-topo.jpg'} alt="" />
                <div className="audio-orbit one" />
                <div className="audio-orbit two" />
              </div>
              <div className="audio-full-copy">
                <p className="kicker">Audiobook OPDDS</p>
                <h2>{audioState.title}</h2>
                {currentAudioQueueItem && (
                  <small>
                    Faixa {currentAudioQueueIndex + 1} de {audiobookQueue.length}
                    {nextAudioQueueItem ? ` - proxima: ${nextAudioQueueItem.label}` : ' - fim da fila'}
                  </small>
                )}
                <span>{audioState.isPlaying ? 'Em reprodução' : 'Pausado'} · {formatTime(audioState.currentTime)} de {formatTime(audioState.duration)}</span>
                {currentAudioQueueItem && (
                  <button className="audio-open-page" onClick={openCurrentAudioPage}>
                    <BookOpen size={16} />
                    Abrir página
                  </button>
                )}
              </div>
              <div className="audio-full-visualizer" style={{ '--audio-progress': `${audioProgress || 0}%` } as React.CSSProperties}>
                <AudioFrequencyBars values={audioFrequencies} />
                <input className="player-progress" type="range" min="0" max="100" value={audioProgress || 0} onChange={(event) => seekAudio(Number(event.target.value))} aria-label="Progresso do áudio" />
              </div>
              <div className="audio-full-time"><span>{formatTime(audioState.currentTime)}</span><span>{formatTime(audioState.duration)}</span></div>
              <div className="audio-full-controls">
                <button className="audio-control-soft" onClick={playPreviousAudio} disabled={!previousAudioQueueItem} title="Faixa anterior">
                  <SkipBack size={18} />
                </button>
                <button className="audio-control-soft" onClick={changePlaybackRate}>{audioState.playbackRate % 1 === 0 ? audioState.playbackRate.toFixed(0) : audioState.playbackRate.toFixed(2).replace(/0$/, '')}x</button>
                <button className="audio-control-main" onClick={() => handlePlayAudio(audioState.currentUrl, audioState.title)}>
                  {audioState.isPlaying ? <Pause size={30} /> : <Play size={30} fill="currentColor" />}
                </button>
                <button className="audio-control-soft" onClick={playNextAudio} disabled={!nextAudioQueueItem} title="Proxima faixa">
                  <SkipForward size={18} />
                </button>
                <label className="audio-control-volume" style={{ '--volume-progress': `${Math.round(audioState.volume * 100)}%` } as React.CSSProperties}>
                  <Volume2 size={18} />
                  <input type="range" min="0" max="100" value={Math.round(audioState.volume * 100)} onChange={(event) => changeVolume(Number(event.target.value))} />
                </label>
              </div>
            </div>
          </section>
        )}
        </>
      )}
    </div>
  );
}

