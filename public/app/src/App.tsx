import { type Dispatch, type FocusEvent, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AudioLines,
  Bookmark,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  Bold,
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
  Heading1,
  Heading2,
  Italic,
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
  Share2,
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
import { accessTokenPlans, accessTokens, bookChapters, getChapterIndexForPillar, onboardingSteps, pdfUrl, workbookPdfUrl } from './data/book';
import { bookGroups, pillarLetters } from './data/bookStructure';
import {
  buildArtifactCanonicalBookChapters,
  repairCanonicalText,
  type CanonicalBookBlock,
  type CanonicalBookBlockKind,
} from './data/canonicalBook';
import { READER_STATE_LABELS } from './data/igentMindContract';
import {
  getOfficialMindPillarProtocol,
  MIND_PHASES,
  type MindPhaseId,
  type MindProtocolOption,
} from './data/igentMindProtocol';
import {
  MIND_GUIDED_MAX_TURNS,
  buildMindJourneySynthesis,
  mindJourneyClosingReplies,
  planMindJourneyTurn,
} from './data/igentMindJourneyOrchestrator';
import { getFinalMindPillar } from './data/igentMindFinalProject';
import {
  analyzeStructuredSignal,
  type PrimarySignal,
  type SecondarySignal,
  type SignalAnalysisResult,
} from './data/igentMindSignals';
import {
  createInitialReaderMindState,
  updateReaderMindState,
  type ReaderMindState,
} from './data/igentMindState';
import {
  buildAgentMemoryContext,
  createSessionMemory,
  defaultMemoryEngineResult,
  type SessionMemory,
} from './data/igentMindMemory';
import {
  decideNextAction,
  type DecisionEngineResult,
} from './data/igentMindDecision';
import { buildLocalMindResponse } from './data/igentMindLocalResponder';
import {
  applySafetyProtocol,
  assessSafety,
  buildSafetyResponseText,
  safetyResourcesByLocale,
  type SafetyAssessment,
} from './data/igentMindSafety';
import { pdfTextPages } from './data/pdfTextPages';
import Button from './components/Button';
import OnboardingModal from './components/OnboardingModal';
import ReaderShell from './components/ReaderShell';
import { PRODUCT_KEYS, PRODUCT_LABELS, ProductKey } from './config/products';
import { runtimeConfig } from './config/runtime';
import { useTheme } from './theme/ThemeProvider';
import { hasLocalEntitlement, LocalPlan } from './services/entitlements';
import {
  AudioProgressEntry,
  clearLocalJourney,
  LetterMeta,
  ReaderAnchor,
  ReaderNote,
  getLocalWorkbookSavedAt,
  loadLocalAudioProgress,
  loadLocalCanonicalJournalAnswers,
  loadLocalLetterMeta,
  loadLocalLetters,
  loadLocalReaderAnchors,
  loadLocalReaderNotes,
  loadLocalWorkbookAnswers,
  loadLocalWorkbookEntry,
  loadLocalWorkbookPrompt,
  saveLocalAudioProgress,
  saveLocalCanonicalJournalAnswers,
  saveLocalLetterMeta,
  saveLocalLetters,
  saveLocalReaderAnchors,
  saveLocalReaderNotes,
  saveLocalWorkbookAnswers,
  saveLocalWorkbookEntry,
  saveLocalWorkbookPrompt,
} from './services/workbookStore';
import {
  AdminBookPageSummary,
  AdminBookAudioSummary,
  AdminEvent,
  AdminInviteResponse,
  AdminProduct,
  AuthUser,
  createAdminInvite,
  deleteMindSessions,
  deleteReaderJourney,
  fetchAdminBookPageHistory,
  fetchAdminBookAudio,
  fetchAdminBookPages,
  fetchAdminEvents,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchCurrentUser,
  fetchMindStatus,
  fetchReaderJourney,
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
  syncReaderJourney,
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
type AdminSection = 'overview' | 'readers' | 'book' | 'sensory' | 'kiwify' | 'plans' | 'copy';

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

type AmbientAudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  coverUrl?: string | null;
  volume: number;
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

type SensoryTrack = {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  coverUrl?: string;
};

type SaveFeedback = 'idle' | 'saving' | 'saved';
type AdminAudioProductionStatus = 'ok' | 'review' | 'record' | 'placeholder';
type MarketingGoal = 'awareness' | 'conversion' | 'retargeting' | 'community';
type MarketingChannel = 'ads' | 'whatsapp' | 'email' | 'salesPage' | 'onboarding';
type MarketingProduct = 'book' | 'workbook' | 'igent' | 'community' | 'vip';

const ADMIN_AUDIO_PRODUCTION_KEY = 'opd_admin_audio_production';
const ADMIN_AUDIO_ORDER_KEY = 'opd_admin_audio_order';
const ADMIN_SUPPORT_AUDIO_KEY = 'opd_admin_support_audio';
const ADMIN_READING_TRACKS_KEY = 'opd_admin_reading_tracks';
const ADMIN_CANONICAL_DRAFTS_KEY = 'opd_admin_canonical_block_drafts_v1';
const SELECTED_READING_TRACK_KEY = 'opd_selected_reading_track';
const ADMIN_SENSORY_PLAYLIST_KEY = ADMIN_READING_TRACKS_KEY;
const SELECTED_SENSORY_TRACK_KEY = SELECTED_READING_TRACK_KEY;
const WORKBOOK_INTRO_KEY = 'opd_workbook_intro_dismissed';
const WORKBOOK_WELCOME_AUDIO = '/media/audios/manifesto/boas-vindas.mp3';

const defaultSupportAudios: SensoryTrack[] = [
  { id: 'sobrevivencia', title: 'Sobrevivência', text: 'Para dias em que a leitura precisa ser curta e segura.', audioUrl: '/media/audios/home/sobrevivencia.mp3' },
  { id: 'reconstrucao', title: 'Reconstrução', text: 'Para voltar a organizar a força sem pressa.', audioUrl: '/media/audios/home/reconstrucao.mp3' },
  { id: 'continuidade', title: 'Continuidade', text: 'Para sustentar o eixo depois do impacto.', audioUrl: '/media/audios/home/continuidade.mp3' },
];

const defaultReadingTracks: SensoryTrack[] = [
  { id: 'silencio-dourado', title: 'Silêncio dourado', text: 'Trilha instrumental discreta para ler com presença.', audioUrl: '/media/audios/trilhas/silencio-dourado.mp3' },
];
const defaultSensoryPlaylist = defaultReadingTracks;

const marketingGoalLabels: Record<MarketingGoal, string> = {
  awareness: 'Topo de funil',
  conversion: 'Conversão direta',
  retargeting: 'Retargeting',
  community: 'Comunidade',
};

const marketingChannelLabels: Record<MarketingChannel, string> = {
  ads: 'Anúncios',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  salesPage: 'Página de vendas',
  onboarding: 'Onboarding',
};

const marketingProductLabels: Record<MarketingProduct, string> = {
  book: 'Livro + App + Áudios',
  workbook: 'Diário dos Desacreditados',
  igent: 'iGentMIND',
  community: 'Comunidade Viva',
  vip: 'Pacote VIP',
};

const marketingProductAngles: Record<MarketingProduct, { promise: string; mechanism: string; cta: string }> = {
  book: {
    promise: 'ler sem transformar dor em performance',
    mechanism: 'livro, modo leitura, PDF e Áudios guiados',
    cta: 'Começar a leitura',
  },
  workbook: {
    promise: 'organizar o que está pesado sem virar questionário frio',
    mechanism: 'perguntas por pilar, cartas e memória emocional da jornada',
    cta: 'Abrir o diário',
  },
  igent: {
    promise: 'receber uma próxima pergunta com contexto da própria escrita',
    mechanism: 'mentor iGentMIND conectado à leitura, diário e pilares',
    cta: 'Conversar com iGentMIND',
  },
  community: {
    promise: 'continuar acompanhado depois que a leitura toca algo real',
    mechanism: 'grupo, provocações de leitura e presença de continuidade',
    cta: 'Entrar na comunidade',
  },
  vip: {
    promise: 'acessar a jornada completa em leitura, escrita, áudio e acompanhamento',
    mechanism: 'livro, app, diário, iGentMIND, comunidade e pacote de apoio',
    cta: 'Liberar acesso completo',
  },
};

const marketingGoalAngles: Record<MarketingGoal, string> = {
  awareness: 'para quem ainda não sabe nomear o próprio cansaço',
  conversion: 'para quem já entendeu que precisa parar de se abandonar',
  retargeting: 'para quem viu a proposta, mas ainda está tentando decidir se merece continuar',
  community: 'para quem não quer atravessar a obra sozinho depois do primeiro impacto',
};

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
      { id: ROUTES.SESSIONS, label: 'Áudios de apoio', icon: AudioLines },
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
  '/media/imagens/capas/capa.webp',
  '/media/imagens/capas/capa.webp',
];

const journeyStates = [
  {
    title: 'Sobrevivência',
    desc: 'Estou em crise ou tentando não entrar em pânico.',
    audioUrl: '/media/audios/home/sobrevivencia.mp3',
    chapter: 10,
  },
  {
    title: 'Reconstrução',
    desc: 'Estou tentando me reerguer sem me violentar.',
    audioUrl: '/media/audios/home/reconstrucao.mp3',
    chapter: 13,
  },
  {
    title: 'Continuidade',
    desc: 'Quero manter o equilíbrio depois do impacto.',
    audioUrl: '/media/audios/home/continuidade.mp3',
    chapter: 16,
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
    title: 'Livro interativo + Áudios',
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
    description: 'Livro interativo, Áudios, Diário, iGentMIND e grupo em um único pacote.',
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
  return `sessão segura ...${value.slice(-8)}`;
};

const chapterIndexForPillar = getChapterIndexForPillar;

const audioForPillar = (pillarIndex: number, preferredLabel = 'manifesto') => {
  const chapter = bookChapters[chapterIndexForPillar(pillarIndex)];
  return chapter?.audioTracks.find((track) => track.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(preferredLabel))?.url
    ?? chapter?.audioTracks[0]?.url
    ?? '';
};

const pillarCards = [
  { title: 'Reconhecimento', desc: 'Onde a negação cessa.', icon: Sparkles, chapter: chapterIndexForPillar(0) },
  { title: 'Família', desc: 'Lealdades invisíveis.', icon: Boxes, chapter: chapterIndexForPillar(1) },
  { title: 'Luto', desc: 'Quando a ausência permanece.', icon: Cloud, chapter: chapterIndexForPillar(2) },
  { title: 'Trabalho', desc: 'Quando produzir deixa de significar existir.', icon: Briefcase, chapter: chapterIndexForPillar(3) },
  { title: 'Dor', desc: 'Dor, fuga e anestesia.', icon: Flame, chapter: chapterIndexForPillar(4) },
  { title: 'Desejo', desc: 'Amor, projeção e frustração.', icon: Heart, chapter: chapterIndexForPillar(5) },
  { title: 'Fé', desc: 'Sentido e desencanto.', icon: Sparkles, chapter: chapterIndexForPillar(6) },
  { title: 'Escassez', desc: 'Ver a falta sem se tornar falta.', icon: AlertCircle, chapter: chapterIndexForPillar(7) },
  { title: 'Vazio', desc: 'Presença e continuidade.', icon: RotateCcw, chapter: chapterIndexForPillar(8) },
];

const mentorTopics = [
  { id: 'culpa', title: 'Culpa', icon: AlertCircle, color: '#ff7474', pillarIndex: 0, audioUrl: audioForPillar(0, 'julgamento') },
  { id: 'recaida', title: 'Recaída', icon: RotateCcw, color: '#ff8f2c', pillarIndex: 8, audioUrl: audioForPillar(8) },
  { id: 'luto', title: 'Luto', icon: Cloud, color: '#a7a8b5', pillarIndex: 2, audioUrl: audioForPillar(2) },
  { id: 'desejo', title: 'Desejo', icon: Flame, color: '#ff5f8a', pillarIndex: 5, audioUrl: audioForPillar(5) },
  { id: 'fe', title: 'Fé quebrada', icon: Sparkles, color: '#b987ff', pillarIndex: 6, audioUrl: audioForPillar(6) },
  { id: 'solidao', title: 'Solidão', icon: Brain, color: '#7384ff', pillarIndex: 1, audioUrl: audioForPillar(1) },
  { id: 'fracasso', title: 'Fracasso', icon: Zap, color: '#e6b800', pillarIndex: 3, audioUrl: audioForPillar(3) },
  { id: 'ansiedade', title: 'Ansiedade', icon: AudioLines, color: '#22d3ee', pillarIndex: 0, audioUrl: audioForPillar(0, 'presenca') },
  { id: 'pressao', title: 'Pressão', icon: Volume2, color: '#34d399', pillarIndex: 3, audioUrl: audioForPillar(3, 'narrativa') },
];

const mindTerritoryAudioUrls = Array.from({ length: 9 }, (_, pillarIndex) => audioForPillar(pillarIndex));

const mindTriads = [
  {
    id: 'sobrevivencia',
    title: 'Sobrevivência',
    prompt: 'Estou tentando não afundar.',
    nuance: 'Crise, pânico, peso sem nome.',
    color: '#72c6a4',
    territories: [
      { pillarIndex: 0, label: 'Reconhecimento', limiar: 'onde a negação cessa', icon: Sparkles },
      { pillarIndex: 1, label: 'Família', limiar: 'onde aprendemos a nos calar', icon: Boxes },
      { pillarIndex: 2, label: 'Luto', limiar: 'quando a ausência permanece', icon: Cloud },
    ],
  },
  {
    id: 'reconstrucao',
    title: 'Reconstrução',
    prompt: 'Estou tentando me reerguer.',
    nuance: 'Processando, reorganizando.',
    color: '#e1b84f',
    territories: [
      { pillarIndex: 3, label: 'Trabalho', limiar: 'quando produzir deixa de significar existir', icon: Briefcase },
      { pillarIndex: 4, label: 'Dor', limiar: 'sentir sem anestesiar', icon: Flame },
      { pillarIndex: 5, label: 'Desejo', limiar: 'querer quando querer machuca', icon: Heart },
    ],
  },
  {
    id: 'continuidade',
    title: 'Continuidade',
    prompt: 'Quero manter o equilíbrio depois do impacto.',
    nuance: 'Sustentar, permanecer.',
    color: '#9aa4ff',
    territories: [
      { pillarIndex: 6, label: 'Fé', limiar: 'o que fica depois do desencanto', icon: Shield },
      { pillarIndex: 7, label: 'Escassez', limiar: 'a falta como mapa, não como sentença', icon: AlertCircle },
      { pillarIndex: 8, label: 'Vazio', limiar: 'ficar sem preencher', icon: RotateCcw },
    ],
  },
];

type MindEntryIntent = 'understand' | 'reflect' | 'act' | 'continue';

const mindEntryIntents: Array<{
  id: MindEntryIntent;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: 'understand',
    label: 'Entender',
    title: 'Entender este trecho',
    description: 'Explica o tema do livro sem interpretar você.',
  },
  {
    id: 'reflect',
    label: 'Refletir',
    title: 'Refletir sobre isso',
    description: 'Abre uma pergunta por vez ligada ao território.',
  },
  {
    id: 'act',
    label: 'Agir',
    title: 'Dar um próximo passo',
    description: 'Sugere diário, âncora, pausa ou retorno ao livro.',
  },
  {
    id: 'continue',
    label: 'Continuar',
    title: 'Continuar lendo',
    description: 'Volta ao livro sem iniciar reflexão.',
  },
];

const sensoryClicks = {
  primary: { frequency: 520, duration: 0.055 },
  soft: { frequency: 320, duration: 0.04 },
};

type MindTriageOption = {
  id: string;
  semantic_position?: MindProtocolOption['semantic_position'];
  primary_signal?: PrimarySignal;
  secondary_signals?: SecondarySignal[];
  label: string;
  signal: string;
  response: string;
  load?: 1 | 2 | 3;
};

type MindTriageQuestion = {
  id: string;
  phase?: MindPhaseId;
  prompt: string;
  openPrompt?: string;
  options: MindTriageOption[];
};

type MindTriageAnswer = {
  questionId?: string;
  phase?: MindPhaseId;
  question: string;
  option: string;
  signal: string;
  semantic_position?: MindProtocolOption['semantic_position'];
  primary_signal?: PrimarySignal;
  secondary_signals?: SecondarySignal[];
  load?: number;
  signal_analysis?: SignalAnalysisResult;
  open_answer?: string;
};

type MindMessage = {
  id: string;
  from: 'agent' | 'user';
  text: string;
  kind?: 'intro' | 'plan';
  replies?: string[];
  triageOptions?: MindTriageOption[];
  recommendations?: MindRecommendation[];
  references?: Array<{
    chapterId: string;
    chapterTitle: string;
    sectionId: string;
    sectionTitle: string;
  }>;
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

const mindTriageBank: Record<number, MindTriageQuestion[]> = {
  0: [
    {
      id: 'r1-negacao',
      prompt: 'Quando você lê "onde a negação cessa", isso parece mais com o quê?',
      options: [
        { id: 'sei-evito', label: 'Eu já sei, mas evito', signal: 'clareza evitada', response: 'Então talvez o ponto não seja descobrir. Talvez seja encarar o custo emocional de admitir o que já apareceu.' },
        { id: 'sem-nome', label: 'Ainda não consigo nomear', signal: 'experiência sem linguagem', response: 'Tudo bem ainda não ter nome. Às vezes o nome só vem depois que a defesa para de gritar.' },
        { id: 'raiva', label: 'Isso me dá raiva', signal: 'resistência ativa', response: 'A raiva pode ser uma porta. Nem sempre ela nega a verdade; às vezes protege o lugar onde a verdade encostou.' },
        { id: 'nao-sentiu', label: 'Ainda não fez sentido', signal: 'baixa ressonância', response: 'Então a primeira pergunta não precisa forçar profundidade. Precisa descobrir onde o texto ainda não encontrou sua vida.' },
      ],
    },
    {
      id: 'r2-protecao',
      prompt: 'O que você mais tenta proteger quando evita reconhecer algo?',
      options: [
        { id: 'imagem', label: 'Minha imagem', signal: 'proteção da persona', response: 'Quando a imagem vira abrigo, qualquer verdade parece ameaça. Talvez você esteja cansado de sustentar uma versão.' },
        { id: 'rotina', label: 'Minha rotina', signal: 'medo de ruptura', response: 'Reconhecer algo pode parecer perigoso quando a rotina é o que impede tudo de desabar.' },
        { id: 'alguem', label: 'Alguém importante', signal: 'lealdade afetiva', response: 'Às vezes a negação não protege você. Protege o vínculo, a história ou alguém que você ainda não quer decepcionar.' },
        { id: 'esperanca', label: 'Minha esperança', signal: 'medo de perder futuro', response: 'Tem verdades que parecem acabar com a esperança. Mas talvez acabem só com uma esperança que já estava te cobrando demais.' },
      ],
    },
    {
      id: 'r3-corpo',
      prompt: 'No corpo, esse tema aparece mais como:',
      options: [
        { id: 'peso', label: 'Peso', signal: 'sobrecarga silenciosa', response: 'Peso costuma aparecer quando a pessoa carrega uma verdade por tempo demais sem poder dizer que está carregando.' },
        { id: 'aperto', label: 'Aperto', signal: 'ameaça e urgência', response: 'O aperto pode ser o corpo tentando reduzir o mundo inteiro a uma única saída. Vamos devagar.' },
        { id: 'cansaco', label: 'Cansaço', signal: 'exaustão defensiva', response: 'Cansaço também pode ser o preço de fingir normalidade quando algo já pediu reconhecimento.' },
        { id: 'nada', label: 'Não sinto nada', signal: 'anestesia ou distância', response: 'Não sentir nada também é uma informação. Às vezes a distância foi o jeito possível de continuar.' },
      ],
    },
  ],
  1: [
    {
      id: 'f1-papel',
      prompt: 'Na família, qual papel você mais aprendeu a ocupar?',
      options: [
        { id: 'forte', label: 'O forte', signal: 'autossuficiência compulsória', response: 'Ser o forte pode parecer honra, mas às vezes é só a forma socialmente aceita de não pedir cuidado.' },
        { id: 'calado', label: 'O calado', signal: 'silenciamento aprendido', response: 'O silêncio pode ter sido proteção antes. Hoje talvez ele esteja cobrando a sua presença.' },
        { id: 'mediador', label: 'O que pacifica tudo', signal: 'mediação como sobrevivência', response: 'Quem pacifica tudo muitas vezes aprende a desaparecer para que os outros não explodam.' },
        { id: 'problema', label: 'O problema', signal: 'identidade atribuída', response: 'Quando alguém é colocado no lugar de problema, até a própria dor começa a pedir desculpa por existir.' },
      ],
    },
    {
      id: 'f2-lealdade',
      prompt: 'Que lealdade parece mais difícil quebrar?',
      options: [
        { id: 'culpa', label: 'A culpa', signal: 'culpa herdada', response: 'Culpa herdada não pede só coragem. Pede perceber o que nunca foi seu e mesmo assim entrou no seu nome.' },
        { id: 'expectativa', label: 'A expectativa', signal: 'roteiro familiar', response: 'Expectativa familiar vira destino quando ninguém percebe que está obedecendo.' },
        { id: 'cuidado', label: 'Cuidar de todos', signal: 'parentificação', response: 'Cuidar de todos pode ter sido amor. Mas amor que exige desaparecimento vira dívida.' },
        { id: 'pertencer', label: 'Pertencer a qualquer custo', signal: 'medo de exclusão', response: 'Pertencer a qualquer custo ensina uma pergunta dura: quanto de você ficou do lado de fora para caber dentro?' },
      ],
    },
    {
      id: 'f3-limite',
      prompt: 'O limite que você evita impor mexe mais com:',
      options: [
        { id: 'medo', label: 'Medo de rejeição', signal: 'ameaça de abandono', response: 'Quando o limite parece rejeição, a pessoa passa a negociar dignidade para não perder vínculo.' },
        { id: 'pena', label: 'Pena de alguém', signal: 'culpa cuidadora', response: 'A pena pode ser afeto, mas também pode prender você no lugar de quem nunca pode escolher a própria vida.' },
        { id: 'briga', label: 'Medo de briga', signal: 'evitação de conflito', response: 'Evitar conflito pode preservar paz por fora e produzir guerra por dentro.' },
        { id: 'confusao', label: 'Nem sei qual limite é meu', signal: 'fronteira difusa', response: 'Quando o limite não tem nome, o primeiro trabalho é perceber onde você começa a se abandonar.' },
      ],
    },
  ],
  2: [
    {
      id: 'l1-ausencia',
      prompt: 'O que parece não voltar?',
      options: [
        { id: 'pessoa', label: 'Uma pessoa', signal: 'perda relacional', response: 'Quando uma pessoa falta, o mundo não perde só presença. Perde também os rituais que organizavam você.' },
        { id: 'fase', label: 'Uma fase da vida', signal: 'luto de ciclo', response: 'Luto de fase é estranho porque ninguém faz cerimônia, mas algo terminou do mesmo jeito.' },
        { id: 'confianca', label: 'Minha confiança', signal: 'ruptura interna', response: 'Perder confiança em si pode doer como perder casa: o lugar ainda existe, mas não parece seguro.' },
        { id: 'futuro', label: 'Um futuro que imaginei', signal: 'luto de possibilidade', response: 'Também se sofre pelo que não aconteceu. Algumas ausências nunca tiveram corpo, mas tiveram promessa.' },
      ],
    },
    {
      id: 'l2-reacao',
      prompt: 'Quando essa ausência aparece, você tende a:',
      options: [
        { id: 'controlar', label: 'Controlar tudo', signal: 'controle contra vazio', response: 'Controle às vezes é tentativa de impedir uma segunda perda.' },
        { id: 'sumir', label: 'Sumir', signal: 'retirada protetiva', response: 'Sumir pode ser a forma que o corpo encontrou para não ter que explicar uma dor sem linguagem.' },
        { id: 'ocupar', label: 'Me ocupar demais', signal: 'produtividade defensiva', response: 'Ocupação pode parecer vida, mas às vezes é só barulho para não ouvir a ausência.' },
        { id: 'lembrar', label: 'Voltar sempre à memória', signal: 'fixação afetiva', response: 'Voltar à memória pode ser amor. A pergunta é se essa volta acolhe você ou te impede de retornar.' },
      ],
    },
    {
      id: 'l3-permissao',
      prompt: 'O que você ainda não se permitiu?',
      options: [
        { id: 'chorar', label: 'Chorar de verdade', signal: 'luto contido', response: 'Às vezes a pessoa segue funcionando porque ainda não encontrou um lugar seguro para cair.' },
        { id: 'sentir-raiva', label: 'Sentir raiva', signal: 'raiva proibida', response: 'Raiva no luto não nega amor. Às vezes ela só mostra a violência da falta.' },
        { id: 'continuar', label: 'Continuar', signal: 'culpa por seguir', response: 'Continuar pode parecer traição quando uma parte sua acredita que amar é permanecer parado.' },
        { id: 'despedir', label: 'Me despedir', signal: 'despedida suspensa', response: 'Despedida não apaga. Ela só devolve movimento ao que ficou congelado.' },
      ],
    },
  ],
  3: [
    {
      id: 't1-valor',
      prompt: 'No trabalho, onde seu valor fica mais preso?',
      options: [
        { id: 'resultado', label: 'No resultado', signal: 'valor condicionado', response: 'Quando valor depende só de resultado, qualquer oscilação vira ameaça de desaparecimento.' },
        { id: 'utilidade', label: 'Em ser útil', signal: 'utilidade como identidade', response: 'Ser útil pode virar prisão quando descansar parece prova de inutilidade.' },
        { id: 'comparacao', label: 'Na comparação', signal: 'medida externa', response: 'Comparação rouba escala. Ela mede sua vida com a régua de uma história que não é sua.' },
        { id: 'controle', label: 'Em controlar tudo', signal: 'perfeccionismo defensivo', response: 'Controlar tudo pode ser medo de que qualquer falha revele algo imperdoável.' },
      ],
    },
    {
      id: 't2-descanso',
      prompt: 'Quando você descansa, aparece mais:',
      options: [
        { id: 'culpa', label: 'Culpa', signal: 'descanso proibido', response: 'Culpa no descanso mostra que seu corpo parou antes da sua permissão interna chegar.' },
        { id: 'medo', label: 'Medo de ficar para trás', signal: 'ameaça competitiva', response: 'Ficar para trás é uma frase forte. Talvez ela esconda a pergunta: atrás de quem?' },
        { id: 'vazio', label: 'Vazio', signal: 'identidade colada à produção', response: 'Se parar produz vazio, talvez trabalhar tenha virado mais do que trabalho: virou forma de existir.' },
        { id: 'alivio', label: 'Alívio', signal: 'necessidade legítima', response: 'Alívio é dado. Ele mostra que alguma parte sua não queria performance; queria autorização.' },
      ],
    },
    {
      id: 't3-prova',
      prompt: 'O que você ainda tenta provar?',
      options: [
        { id: 'capaz', label: 'Que sou capaz', signal: 'capacidade em julgamento', response: 'Provar capacidade o tempo todo cansa porque transforma cada entrega em tribunal.' },
        { id: 'merecedor', label: 'Que mereço estar aqui', signal: 'pertencimento condicionado', response: 'Quando merecimento precisa de prova constante, presença vira entrevista sem fim.' },
        { id: 'nao-fracassei', label: 'Que não fracassei', signal: 'fracasso como ameaça identitária', response: 'Talvez o fracasso esteja sendo tratado como identidade, não como acontecimento.' },
        { id: 'nao-dependo', label: 'Que não dependo de ninguém', signal: 'autonomia defensiva', response: 'Não depender pode parecer força, mas às vezes é só medo antigo de precisar e não encontrar.' },
      ],
    },
  ],
  4: [
    {
      id: 'd1-fuga',
      prompt: 'Quando a dor aparece, qual fuga parece mais próxima?',
      options: [
        { id: 'distracao', label: 'Distração', signal: 'desvio rápido', response: 'Distração pode aliviar, mas também pode impedir a dor de virar mensagem.' },
        { id: 'excesso', label: 'Excesso', signal: 'anestesia intensa', response: 'Excesso geralmente não começa como descontrole. Começa como tentativa de não sentir sozinho.' },
        { id: 'isolamento', label: 'Isolamento', signal: 'retirada da dor', response: 'Isolar pode proteger de perguntas, mas também pode deixar a dor sem testemunha.' },
        { id: 'ironia', label: 'Ironia ou frieza', signal: 'blindagem afetiva', response: 'A frieza às vezes é só uma forma elegante de dizer: se eu sentir, desmonto.' },
      ],
    },
    {
      id: 'd2-antes',
      prompt: 'Antes da fuga, o que costuma aparecer?',
      options: [
        { id: 'vergonha', label: 'Vergonha', signal: 'autoexposição ameaçadora', response: 'Vergonha aperta porque faz a pessoa sentir que a dor virou espetáculo.' },
        { id: 'impotencia', label: 'Impotência', signal: 'perda de agência', response: 'Impotência não é fraqueza. É o momento em que a pessoa esquece que ainda existe uma escolha pequena.' },
        { id: 'raiva', label: 'Raiva', signal: 'dor convertida em ataque', response: 'Raiva pode ser dor procurando saída mais aceitável do que pedir ajuda.' },
        { id: 'nada', label: 'Nada, só vou', signal: 'automatismo', response: 'Automatismo é uma pista. O corpo aprendeu um caminho antes da consciência chegar.' },
      ],
    },
    {
      id: 'd3-precisa',
      prompt: 'O que essa dor parece pedir sem conseguir dizer?',
      options: [
        { id: 'cuidado', label: 'Cuidado', signal: 'pedido reprimido', response: 'Cuidado às vezes é difícil de pedir porque parece dívida antes mesmo de chegar.' },
        { id: 'limite', label: 'Limite', signal: 'invasão sustentada', response: 'Dor que pede limite costuma vir de algo que passou tempo demais entrando sem permissão.' },
        { id: 'descanso', label: 'Descanso', signal: 'exaustão ignorada', response: 'Descanso não resolve tudo, mas pode interromper a violência de continuar como se nada estivesse acontecendo.' },
        { id: 'verdade', label: 'Verdade', signal: 'nomeação pendente', response: 'Talvez a dor esteja pedindo menos solução e mais nome.' },
      ],
    },
  ],
  5: [
    {
      id: 'de1-desejo',
      prompt: 'Seu desejo hoje parece mais:',
      options: [
        { id: 'vida', label: 'Sinal de vida', signal: 'desejo restaurador', response: 'Desejo como sinal de vida não precisa virar plano ainda. Primeiro ele precisa poder existir sem vergonha.' },
        { id: 'fuga', label: 'Vontade de fugir', signal: 'escape projetado', response: 'Nem toda fuga é covardia. Mas vale perguntar se você quer ir para algo ou só sair de uma dor.' },
        { id: 'carencia', label: 'Carência', signal: 'falta buscando objeto', response: 'Carência não é defeito. Ela só fica perigosa quando escolhe qualquer lugar para não ficar só.' },
        { id: 'confusao', label: 'Confusão', signal: 'ambivalência afetiva', response: 'Confusão pode ser o encontro entre uma falta antiga e uma possibilidade nova.' },
      ],
    },
    {
      id: 'de2-prova',
      prompt: 'O que você espera que esse desejo prove?',
      options: [
        { id: 'amavel', label: 'Que sou amável', signal: 'valor pelo olhar do outro', response: 'Quando o desejo precisa provar que você é amável, o outro vira espelho e tribunal ao mesmo tempo.' },
        { id: 'livre', label: 'Que sou livre', signal: 'liberdade reativa', response: 'Às vezes a liberdade que nasce só como reação ainda está presa ao que tenta contrariar.' },
        { id: 'vivo', label: 'Que ainda estou vivo', signal: 'desejo contra anestesia', response: 'Desejo pode aparecer como prova de vida quando a rotina virou sobrevivência.' },
        { id: 'nada', label: 'Não quero provar nada', signal: 'desejo mais limpo', response: 'Talvez exista algo mais simples aí: um querer que ainda não precisa defender sua existência.' },
      ],
    },
    {
      id: 'de3-medo',
      prompt: 'O medo por trás do desejo é:',
      options: [
        { id: 'rejeicao', label: 'Ser rejeitado', signal: 'ameaça vincular', response: 'Medo de rejeição faz o desejo pedir desculpa antes mesmo de ser dito.' },
        { id: 'perder-controle', label: 'Perder o controle', signal: 'ameaça de intensidade', response: 'Perder controle assusta quando sentir já foi perigoso em algum momento.' },
        { id: 'machucar', label: 'Machucar alguém', signal: 'culpa antecipada', response: 'Culpa antecipada pode tentar impedir escolhas antes de você saber se elas são violentas ou apenas honestas.' },
        { id: 'dar-certo', label: 'Dar certo', signal: 'medo de expansão', response: 'Às vezes o medo não é o desejo falhar. É ele dar certo e pedir uma versão sua que ainda não nasceu.' },
      ],
    },
  ],
  6: [
    {
      id: 'fe1-quebra',
      prompt: 'O que quebrou primeiro?',
      options: [
        { id: 'crenca', label: 'Minha crença', signal: 'ruptura de sentido', response: 'Quando a crença quebra, a pessoa não perde só uma resposta. Perde um chão simbólico.' },
        { id: 'confianca', label: 'Minha confiança', signal: 'traição da esperança', response: 'Confiança quebrada torna qualquer consolo suspeito. Talvez você não precise de resposta; precise de honestidade.' },
        { id: 'paciencia', label: 'Minha paciência', signal: 'cansaço espiritual', response: 'Paciência também acaba. E quando acaba, muitas vezes revela que você sustentou mais do que dizia.' },
        { id: 'linguagem', label: 'Minha linguagem para isso', signal: 'silêncio simbólico', response: 'Às vezes o sagrado não some. Só perde a linguagem antiga.' },
      ],
    },
    {
      id: 'fe2-resposta',
      prompt: 'Hoje você está mais cansado de:',
      options: [
        { id: 'explicar', label: 'Explicar tudo', signal: 'exaustão racional', response: 'Explicar tudo pode ser a forma que a mente encontrou para não admitir que algo ainda dói sem resposta.' },
        { id: 'esperar', label: 'Esperar', signal: 'esperança fatigada', response: 'Esperar cansa quando vira obrigação de continuar acreditando do mesmo jeito.' },
        { id: 'fingir', label: 'Fingir certeza', signal: 'certeza performada', response: 'Fingir certeza é solitário porque impede até a dúvida de ser acompanhada.' },
        { id: 'pedir', label: 'Pedir e não receber', signal: 'frustração espiritual', response: 'Pedir e não receber pode ferir mais do que a falta. Fere a confiança de que havia escuta.' },
      ],
    },
    {
      id: 'fe3-resta',
      prompt: 'Apesar do desencanto, o que ainda resta?',
      options: [
        { id: 'silencio', label: 'Silêncio', signal: 'presença sem linguagem', response: 'Silêncio pode ser vazio, mas também pode ser o primeiro lugar sem mentira.' },
        { id: 'duvida', label: 'Dúvida', signal: 'fé não dogmática', response: 'Dúvida não é o oposto da profundidade. Às vezes é a recusa de aceitar resposta pequena demais.' },
        { id: 'vontade', label: 'Vontade de continuar', signal: 'continuidade mínima', response: 'Vontade mínima também conta. Ela não precisa parecer fé para manter você aqui.' },
        { id: 'nada', label: 'Nada', signal: 'deserto interno', response: 'Dizer “nada” com honestidade já é diferente de fingir que está tudo vivo.' },
      ],
    },
  ],
  7: [
    {
      id: 'e1-falta',
      prompt: 'A falta hoje aparece mais como:',
      options: [
        { id: 'dinheiro', label: 'Dinheiro', signal: 'pressão material', response: 'Quando a falta é concreta, acolher não pode virar abstração. Primeiro é preciso separar urgência real de sentença sobre você.' },
        { id: 'tempo', label: 'Tempo', signal: 'escassez temporal', response: 'Falta de tempo muitas vezes esconde excesso de obrigação e pouca permissão para existir fora da função.' },
        { id: 'apoio', label: 'Apoio', signal: 'solidão operacional', response: 'Falta de apoio pesa porque transforma qualquer tarefa em prova de resistência.' },
        { id: 'valor', label: 'Valor pessoal', signal: 'falta internalizada', response: 'Quando a falta vira valor pessoal, a escassez deixa de ser circunstância e começa a parecer identidade.' },
      ],
    },
    {
      id: 'e2-urgencia',
      prompt: 'A urgência está te fazendo:',
      options: [
        { id: 'correr', label: 'Correr sem pensar', signal: 'reatividade', response: 'Correr pode resolver algo imediato, mas também pode impedir você de ver qual é a próxima ação real.' },
        { id: 'paralisar', label: 'Paralisar', signal: 'sobrecarga por ameaça', response: 'Paralisar não é preguiça. Pode ser o corpo tentando sobreviver a muitas ameaças ao mesmo tempo.' },
        { id: 'comparar', label: 'Me comparar', signal: 'medida de falta', response: 'Comparação em escassez transforma a vida do outro em prova contra você.' },
        { id: 'esconder', label: 'Esconder a situação', signal: 'vergonha material', response: 'Esconder a falta costuma doer duas vezes: pela falta e pela solidão de performar normalidade.' },
      ],
    },
    {
      id: 'e3-recurso',
      prompt: 'O que ainda existe, mesmo pequeno?',
      options: [
        { id: 'habilidade', label: 'Uma habilidade', signal: 'recurso interno', response: 'Uma habilidade pequena ainda é recurso. Escassez tenta apagar o que continua disponível.' },
        { id: 'pessoa', label: 'Uma pessoa possível', signal: 'rede mínima', response: 'Uma pessoa possível pode não resolver tudo, mas pode quebrar o isolamento da falta.' },
        { id: 'passo', label: 'Um passo concreto', signal: 'ação mínima', response: 'Um passo concreto devolve escala. A falta quer virar mundo inteiro; o passo devolve chão.' },
        { id: 'nao-sei', label: 'Não consigo ver nada', signal: 'campo fechado', response: 'Quando nada aparece, a triagem não força otimismo. Ela só pergunta o que está bloqueando a visão.' },
      ],
    },
  ],
  8: [
    {
      id: 'v1-vazio',
      prompt: 'O vazio parece mais com:',
      options: [
        { id: 'silencio', label: 'Silêncio', signal: 'espaço sem preenchimento', response: 'Silêncio pode assustar quando você aprendeu que estar bem é estar ocupado por dentro.' },
        { id: 'sem-sentido', label: 'Falta de sentido', signal: 'desorientação existencial', response: 'Falta de sentido não precisa ser resolvida depressa. Às vezes ela pede menos resposta e mais presença.' },
        { id: 'desconexao', label: 'Desconexão', signal: 'distância de si', response: 'Desconexão pode ser o jeito que a mente encontrou para reduzir dor, mas ela também reduz vida.' },
        { id: 'calma-estranha', label: 'Uma calma estranha', signal: 'vazio habitável', response: 'Nem todo vazio é ameaça. Alguns espaços começam estranhos porque ainda não foram invadidos.' },
      ],
    },
    {
      id: 'v2-preenche',
      prompt: 'O que você tenta usar para preencher rápido?',
      options: [
        { id: 'tela', label: 'Tela/distração', signal: 'preenchimento digital', response: 'A tela pode ser descanso, mas também pode ser uma parede entre você e algo que ficou pedindo nome.' },
        { id: 'pessoa', label: 'Outra pessoa', signal: 'preenchimento vincular', response: 'Usar alguém para preencher vazio costuma transformar vínculo em remédio, e remédio em cobrança.' },
        { id: 'trabalho', label: 'Trabalho', signal: 'preenchimento por função', response: 'Trabalho preenche rápido porque entrega identidade pronta. Mas talvez você esteja buscando existência, não função.' },
        { id: 'controle', label: 'Controle', signal: 'organização contra abismo', response: 'Controlar pode organizar fora enquanto o dentro continua sem lugar.' },
      ],
    },
    {
      id: 'v3-permanecer',
      prompt: 'O que ajudaria você a permanecer sem se abandonar?',
      options: [
        { id: 'ritual', label: 'Um ritual pequeno', signal: 'continuidade encarnada', response: 'Ritual pequeno cria presença sem exigir transformação grandiosa.' },
        { id: 'testemunha', label: 'Uma testemunha', signal: 'presença acompanhada', response: 'Às vezes permanecer sozinho é demais. Uma testemunha não resolve, mas sustenta presença.' },
        { id: 'palavra', label: 'Uma palavra honesta', signal: 'nome mínimo', response: 'Uma palavra honesta pode ser o primeiro fio entre vazio e linguagem.' },
        { id: 'tempo', label: 'Tempo sem cobrança', signal: 'continuidade sem performance', response: 'Tempo sem cobrança pode parecer improdutivo, mas talvez seja o primeiro lugar onde você não precisa se provar.' },
      ],
    },
  ],
};

const MIND_LAST_PLAN_KEY = 'opd_mind_last_plan';
const MIND_DATA_SCOPES_KEY = 'opd_mind_data_scopes';
type MindDataScopes = {
  diary: boolean;
  caderno: boolean;
  letters: boolean;
  notes: boolean;
  anchors: boolean;
  pastSessions: boolean;
  readingProgress: boolean;
};
const DEFAULT_MIND_DATA_SCOPES: MindDataScopes = {
  diary: false,
  caderno: false,
  letters: false,
  notes: false,
  anchors: false,
  pastSessions: false,
  readingProgress: false,
};
const MIND_SCOPE_OPTIONS: Array<{ key: keyof MindDataScopes; label: string }> = [
  { key: 'readingProgress', label: 'progresso de leitura' },
  { key: 'diary', label: 'Diário' },
  { key: 'caderno', label: 'Cadernos de presença' },
  { key: 'letters', label: 'cartas privadas' },
  { key: 'notes', label: 'notas e marcações' },
  { key: 'anchors', label: 'âncoras salvas' },
  { key: 'pastSessions', label: 'conversas anteriores' },
];
const loadMindDataScopes = (): MindDataScopes => {
  try {
    return { ...DEFAULT_MIND_DATA_SCOPES, ...JSON.parse(localStorage.getItem(MIND_DATA_SCOPES_KEY) || '{}') };
  } catch {
    return DEFAULT_MIND_DATA_SCOPES;
  }
};
const APP_VERSION = 'v1.3.0';

const repairMojibake = (value = '') => {
  let text = repairCanonicalText(String(value ?? ''));
  const replacements: Array<[string, string]> = [
    ['Ã¡', 'á'], ['Ã ', 'à'], ['Ã¢', 'â'], ['Ã£', 'ã'], ['Ã©', 'é'], ['Ãª', 'ê'],
    ['Ã­', 'í'], ['Ã³', 'ó'], ['Ã´', 'ô'], ['Ãµ', 'õ'], ['Ãº', 'ú'], ['Ã§', 'ç'],
    ['Ã', 'Á'], ['É', 'É'], ['ÃŠ', 'Ê'], ['Ã‡', 'Ç'], ['Â·', '·'], ['Â ', ' '],
    ['â€œ', '"'], ['â€', '"'], ['â€˜', "'"], ['â€™', "'"], ['â€”', '—'], ['â€“', '–'],
    ['In?cio', 'Início'], ['audios', 'Áudios'], ['Di?rio', 'Diário'], ['página', 'página'],
    ['Página', 'Página'], ['Título', 'Título'], ['título', 'título'], ['Código', 'Código'],
    ['Histórico', 'Histórico'], ['Espaço', 'Espaço'], ['espa?o', 'espaço'],
  ];
  replacements.forEach(([bad, good]) => {
    text = text.split(bad).join(good);
  });
  return repairCanonicalText(text);
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
    [new RegExp(`CONTEMPOR${broken}NEAS`, 'g'), 'CONTEMPOR\u00c2NEAS'],
    [new RegExp(`Contempor${broken}neas`, 'g'), 'Contempor\u00e2neas'],
    [new RegExp(`contempor${broken}neas`, 'g'), 'contempor\u00e2neas'],
    [new RegExp(`N${broken}O`, 'g'), 'N\u00c3O'],
    [new RegExp(`N${broken}o`, 'g'), 'N\u00e3o'],
    [new RegExp(`n${broken}o`, 'g'), 'n\u00e3o'],
    [new RegExp(`J${broken}`, 'g'), 'J\u00c1'],
    [new RegExp(`j${broken}`, 'g'), 'j\u00e1'],
    [new RegExp(`\u00c2NCORA PR${broken}TICA`, 'g'), '\u00c2NCORA PR\u00c1TICA'],
    [new RegExp(`\u00c2ncora pr${broken}tica`, 'g'), '\u00c2ncora pr\u00e1tica'],
    [new RegExp(`ancora pr${broken}tica`, 'gi'), '\u00e2ncora pr\u00e1tica'],
  ];
  return replacements
    .reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), repairMojibake(value))
    .replace(/[\u0013\u0014\u25A0-\u25A3\u25A8-\u25AB\u25AD-\u25AF\u25CC\u25FB-\u25FE\uFFFC]/g, '?');
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
  if (normalized.includes('pilar')) return title.split('?')[0]?.trim() || 'Pilar';
  if (normalized.includes('prefacio')) return 'Prefácio';
  if (normalized.includes('introducao')) return 'Introdução';
  if (normalized.includes('posfacio')) return 'Posfácio';
  if (normalized.includes('epilogo')) return 'Epílogo';
  if (normalized.includes('carta')) return 'Carta final';
  if (bookChapters[index]?.pillar) return `Pilar ${String(bookChapters[index].pillar).padStart(2, '0')}`;
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
    chapterHint: chapterIndexForPillar(0),
    counterpoint: 'Você pode reconhecer um erro sem entregar sua existência inteira para ele.',
    practice: 'Escreva uma frase começando com: "Eu assumo o que cabe a mim, mas não aceito ser reduzido a isso."',
    keywords: ['culpa', 'julgamento', 'falha', 'perdao', 'acusacao', 'erro', 'sentenca', 'reconhecimento'],
  },
  recaida: {
    opening: 'Recaída não é volta ao zero. É um ponto do caminho pedindo mais honestidade, não mais punição.',
    firstQuestion: 'O que você está chamando de recaída: um comportamento, um pensamento ou um cansaço?',
    quickReplies: ['Comportamento', 'Pensamento', 'Cansação', 'Vergonha de tentar de novo'],
    chapterHint: chapterIndexForPillar(8),
    counterpoint: 'Quem continua depois de cair não perdeu o processo; está aprendendo onde precisa de apoio.',
    practice: 'Escolha um gesto mínimo para as próximas duas horas. Pequeno o bastante para ser cumprido.',
    keywords: ['recaida', 'continuidade', 'cair', 'recomecar', 'processo', 'vergonha', 'permanecer'],
  },
  luto: {
    opening: 'Luto não é só perda de alguém. Às vezes é perda de uma versão sua que não volta.',
    firstQuestion: 'O que exatamente parece não voltar agora?',
    quickReplies: ['Uma pessoa', 'Uma fase da vida', 'Minha confiança', 'A vontade de continuar'],
    chapterHint: chapterIndexForPillar(2),
    counterpoint: 'Aceitar que algo não volta não significa aceitar que nada mais nasce.',
    practice: 'Nomeie a ausência sem brigar com ela. Depois nomeie uma presença pequena que ainda ficou.',
    keywords: ['luto', 'perda', 'ausencia', 'volta', 'despedida', 'vazio', 'saudade'],
  },
  desejo: {
    opening: 'Desejo assusta quando parece maior que a coragem. Mas ele também pode revelar vida onde você só via desistência.',
    firstQuestion: 'O que você deseja e tem medo de admitir?',
    quickReplies: ['Mudar de vida', 'Ser escolhido', 'Ir embora', 'Começar algo meu'],
    chapterHint: chapterIndexForPillar(5),
    counterpoint: 'Nem todo desejo é fuga. Alguns são mapas que você ainda não aprendeu a ler.',
    practice: 'Pergunte: "Esse desejo me tira de mim ou me devolve para mim?"',
    keywords: ['desejo', 'fuga', 'mudanca', 'vontade', 'medo', 'ir embora', 'reconstrucao'],
  },
  fe: {
    opening: 'Fé quebrada não é ausência de profundidade. Às vezes é a alma recusando respostas fáceis.',
    firstQuestion: 'O que quebrou primeiro: sua crença, sua confiança ou sua paciência?',
    quickReplies: ['Minha crença', 'Minha confiança', 'Minha paciência', 'Minha esperança'],
    chapterHint: chapterIndexForPillar(6),
    counterpoint: 'Você não precisa fingir certeza para continuar. Presença já é uma forma de fé.',
    practice: 'Respire e diga: "Hoje eu não preciso explicar tudo. Preciso só não me abandonar."',
    keywords: ['fe', 'esperanca', 'crenca', 'presenca', 'certeza', 'alma', 'sentido'],
  },
  solidao: {
    opening: 'Solidão machuca mais quando vira prova de que você não importa. Essa prova é falsa.',
    firstQuestion: 'Sua solidão hoje parece abandono, invisibilidade ou proteção?',
    quickReplies: ['Abandono', 'Invisibilidade', 'Proteção', 'Cansação de pedir presença'],
    chapterHint: chapterIndexForPillar(1),
    counterpoint: 'Estar sem companhia não confirma que você é impossível de amar.',
    practice: 'Mande uma mensagem simples para alguém seguro ou escreva o que você gostaria de ouvir.',
    keywords: ['solidao', 'vinculo', 'abandono', 'pertencer', 'invisibilidade', 'companhia'],
  },
  fracasso: {
    opening: 'Fracasso é uma palavra pesada demais para um recorte da sua história.',
    firstQuestion: 'Quem te ensinou a chamar esse momento de fracasso?',
    quickReplies: ['Minha família', 'Comparação', 'Eu mesmo', 'O dinheiro/trabalho'],
    chapterHint: chapterIndexForPillar(3),
    counterpoint: 'Resultado ruim não é identidade ruim. Você é mais amplo que a última tentativa.',
    practice: 'Liste três coisas que você aprendeu sem transformar aprendizado em castigo.',
    keywords: ['fracasso', 'trabalho', 'valor', 'resultado', 'produção', 'comparacao', 'tentativa'],
  },
  ansiedade: {
    opening: 'Ansiedade tenta te sequestrar para um futuro que ainda não aconteceu. Vamos voltar um passo.',
    firstQuestion: 'O medo está apontando para qual cenário?',
    quickReplies: ['Vou perder algo', 'Vão me rejeitar', 'Não vou dar conta', 'Algo ruim vai acontecer'],
    chapterHint: chapterIndexForPillar(0),
    counterpoint: 'Prever desastre não é o mesmo que estar preparado. Preparação começa no corpo presente.',
    practice: 'Solte os ombros, descruze a mandíbula e conte cinco objetos ao seu redor.',
    keywords: ['ansiedade', 'medo', 'futuro', 'desastre', 'corpo', 'presenca', 'controle'],
  },
  pressao: {
    opening: 'Pressão vira prisão quando tudo parece urgente e nada parece suficiente.',
    firstQuestion: 'Qual cobrança está falando mais alto agora?',
    quickReplies: ['Ser forte', 'Dar resultado', 'Não decepcionar', 'Resolver tudo hoje'],
    chapterHint: chapterIndexForPillar(3),
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
  const [readerInitialMode, setReaderInitialMode] = useState<'edition' | 'text'>('text');
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
  const [adminSelectedBookLineIndex, setAdminSelectedBookLineIndex] = useState<number | null>(null);
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
  const [supportAudios, setSupportAudios] = useState<SensoryTrack[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ADMIN_SUPPORT_AUDIO_KEY) || 'null');
      return Array.isArray(stored) && stored.length ? stored : defaultSupportAudios;
    } catch {
      return defaultSupportAudios;
    }
  });
  const [readingTracks, setReadingTracks] = useState<SensoryTrack[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ADMIN_READING_TRACKS_KEY) || 'null');
      return Array.isArray(stored) && stored.length ? stored : defaultReadingTracks;
    } catch {
      return defaultReadingTracks;
    }
  });
  const [adminSupportAudioDraft, setAdminSupportAudioDraft] = useState<SensoryTrack>({
    id: '',
    title: '',
    text: '',
    audioUrl: '',
    coverUrl: '',
  });
  const [adminReadingTrackDraft, setAdminReadingTrackDraft] = useState<SensoryTrack>({
    id: '',
    title: '',
    text: '',
    audioUrl: '',
    coverUrl: '',
  });
  const [selectedReadingTrackId, setSelectedReadingTrackId] = useState(() => {
    if (typeof window === 'undefined') return defaultReadingTracks[0]?.id || '';
    return localStorage.getItem(SELECTED_READING_TRACK_KEY) || defaultReadingTracks[0]?.id || '';
  });
  const [adminAudioDraggingKey, setAdminAudioDraggingKey] = useState('');
  const [adminSelectedUserId, setAdminSelectedUserId] = useState('');
  const [adminInvite, setAdminInvite] = useState({ name: '', email: '', plan: 'basic' as Plan, expiresInDays: '' });
  const [adminGrant, setAdminGrant] = useState<{ plan: Plan; productKey: ProductKey; expiresInDays: string }>({ plan: 'vip', productKey: PRODUCT_KEYS.workbook, expiresInDays: '' });
  const [adminResult, setAdminResult] = useState<AdminInviteResponse | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [adminBookTab, setAdminBookTab] = useState<'canonical' | 'pages' | 'audio'>('canonical');
  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminBookCompareOpen, setAdminBookCompareOpen] = useState(false);
  const [adminPlainPasteDraft, setAdminPlainPasteDraft] = useState('');
  const [adminCanonicalChapterId, setAdminCanonicalChapterId] = useState(bookChapters[0]?.id || '');
  const [adminCanonicalDrafts, setAdminCanonicalDrafts] = useState<Record<string, CanonicalBookBlock[]>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ADMIN_CANONICAL_DRAFTS_KEY) || '{}');
      return stored && typeof stored === 'object' ? stored : {};
    } catch {
      return {};
    }
  });
  const [marketingGoal, setMarketingGoal] = useState<MarketingGoal>('conversion');
  const [marketingProduct, setMarketingProduct] = useState<MarketingProduct>('book');
  const [marketingChannel, setMarketingChannel] = useState<MarketingChannel>('ads');
  const [marketingAudience, setMarketingAudience] = useState('pessoas cansadas de tentar vencer performando força');
  const [marketingOffer, setMarketingOffer] = useState('acesso ao app de leitura, Áudios e jornada guiada');
  const [marketingObjection, setMarketingObjection] = useState('não tenho energia para mais um método de autoajuda');
  const [marketingCopied, setMarketingCopied] = useState('');
  const [bookPageOverrides, setBookPageOverrides] = useState<Record<number, string>>({});
  const [bookPageTitleOverrides, setBookPageTitleOverrides] = useState<Record<number, string>>({});
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
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(16);
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
  const [ambientAudioState, setAmbientAudioState] = useState<AmbientAudioState>({
    isPlaying: false,
    currentUrl: null,
    title: null,
    coverUrl: null,
    volume: 0.38,
  });
  const [audioFullOpen, setAudioFullOpen] = useState(false);
  const [ambientPlayerCollapsed, setAmbientPlayerCollapsed] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activeMentorTopic, setActiveMentorTopic] = useState(mentorTopics[7]);
  const [mindStep, setMindStep] = useState<'select' | 'chat'>('select');
  const [selectedMindTriadId, setSelectedMindTriadId] = useState(mindTriads[0].id);
  const [selectedMindEntryIntent, setSelectedMindEntryIntent] = useState<MindEntryIntent>('reflect');
  const [mindDataScopes, setMindDataScopes] = useState<MindDataScopes>(loadMindDataScopes);
  const [activeMindEntryIntent, setActiveMindEntryIntent] = useState<MindEntryIntent>('reflect');
  const [activeMindPillarIndex, setActiveMindPillarIndex] = useState<number | null>(null);
  const [mindInput, setMindInput] = useState('');
  const [mindMessages, setMindMessages] = useState<MindMessage[]>([]);
  const [mindTyping, setMindTyping] = useState(false);
  const [activeMindTriageStep, setActiveMindTriageStep] = useState(0);
  const [activeMindTriageAnswers, setActiveMindTriageAnswers] = useState<MindTriageAnswer[]>([]);
  const [activeReaderMindState, setActiveReaderMindState] = useState<ReaderMindState | null>(null);
  const [activeSessionMemory, setActiveSessionMemory] = useState<SessionMemory | null>(null);
  const [activeDecisionResult, setActiveDecisionResult] = useState<DecisionEngineResult | null>(null);
  const [activeSafetyAssessment, setActiveSafetyAssessment] = useState<SafetyAssessment | null>(null);
  const [mindTriageComplete, setMindTriageComplete] = useState(false);
  const [mindSessionId, setMindSessionId] = useState<string | undefined>();
  const [mindLoading, setMindLoading] = useState(false);
  const [mindServiceStatus, setMindServiceStatus] = useState<'openai' | 'gemini' | 'local' | null>(null);
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
  const [canonicalJournalAnswers, setCanonicalJournalAnswers] = useState<Record<string, string>>({});
  const [workbookIntroDismissed, setWorkbookIntroDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(WORKBOOK_INTRO_KEY) === 'true';
  });
  const [workbookTransition, setWorkbookTransition] = useState('');
  const [letterIndex, setLetterIndex] = useState(0);
  const [readerLetters, setReaderLetters] = useState<Record<string, string>>({});
  const [letterMeta, setLetterMeta] = useState<Record<string, LetterMeta>>({});
  const [readerNotes, setReaderNotes] = useState<ReaderNote[]>([]);
  const [readerAnchors, setReaderAnchors] = useState<ReaderAnchor[]>([]);
  const [workbookSaveStatus, setWorkbookSaveStatus] = useState<SaveFeedback>('idle');
  const [letterSaveStatus, setLetterSaveStatus] = useState<SaveFeedback>('idle');
  const [noteSaveStatus, setNoteSaveStatus] = useState<SaveFeedback>('idle');
  const [audioProgressMap, setAudioProgressMap] = useState<Record<string, AudioProgressEntry>>({});
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(idleAudioBars);
  const readerName = authUser?.name?.trim() || authName || 'Sobrevivente';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
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
  const adminCanonicalImportRef = useRef<HTMLInputElement | null>(null);
  const saveFeedbackTimersRef = useRef<Record<string, { saved?: number; idle?: number }>>({});
  const journeyHydratedRef = useRef(false);
  const journeySyncTimerRef = useRef<number | null>(null);
  const mindTimersRef = useRef<number[]>([]);
  const mindChatWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => {
    mindTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    mindTimersRef.current = [];
  }, []);

  useEffect(() => {
    localStorage.setItem(MIND_DATA_SCOPES_KEY, JSON.stringify(mindDataScopes));
  }, [mindDataScopes]);

  useEffect(() => {
    let cancelled = false;
    fetchMindStatus()
      .then((status) => {
        if (!cancelled) setMindServiceStatus(status?.provider ?? 'local');
      })
      .catch(() => {
        if (!cancelled) setMindServiceStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  useEffect(() => {
    const chat = mindChatWindowRef.current;
    if (!chat) return;
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }, [mindMessages, mindTyping]);

  const selectedChapter = bookChapters[currentChapterIndex] ?? bookChapters[0];
  const pages = usePagination(selectedChapter.content);
  const selectedReadingTrack = readingTracks.find((track) => track.id === selectedReadingTrackId) || readingTracks[0] || defaultReadingTracks[0];
  const sensoryPlaylist = readingTracks;
  const setSensoryPlaylist = setReadingTracks;
  const adminSensoryDraft = adminReadingTrackDraft;
  const setAdminSensoryDraft = setAdminReadingTrackDraft;
  const selectedSensoryTrackId = selectedReadingTrackId;
  const setSelectedSensoryTrackId = setSelectedReadingTrackId;
  const selectedSensoryTrack = selectedReadingTrack;
  const readProgress = Math.round(((currentChapterIndex + 1) / Math.max(1, bookChapters.length)) * 100);
  const pdfReadProgress = Math.round((pdfPage / Math.max(1, totalPdfPages)) * 100);
  const audioProgress = audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0;
  const onlineProducts = Array.isArray(authUser?.products) ? authUser.products : null;
  const hasProductAccess = (productKey: ProductKey) => (
    onlineProducts ? onlineProducts.includes(productKey) : hasLocalEntitlement(plan, productKey)
  );
  const hasPdfAccess = hasProductAccess(PRODUCT_KEYS.pdf);
  const hasReaderAccess = hasProductAccess(PRODUCT_KEYS.base);
  const hasWorkbookAccess = hasProductAccess(PRODUCT_KEYS.workbook);
  const hasMindAccess = hasProductAccess(PRODUCT_KEYS.igentMind30) || hasProductAccess(PRODUCT_KEYS.igentMind90) || hasProductAccess(PRODUCT_KEYS.vip);
  const hasGroupAccess = hasProductAccess(PRODUCT_KEYS.group);
  const hasOrderBump = hasWorkbookAccess || hasMindAccess || hasGroupAccess;
  const isAdmin = authUser?.role === 'ADMIN';
  const currentProducts = onlineProducts || Object.values(PRODUCT_KEYS).filter((productKey) => hasLocalEntitlement(plan, productKey as ProductKey));
  const upgradeEntries = Object.entries(upgradeOffers) as Array<[UpgradeKey, typeof upgradeOffers[UpgradeKey]]>;
  const lockedUpgradeCount = upgradeEntries.filter(([key]) => !currentProducts.includes(upgradeActiveProductKeys[key])).length;
  const currentGroup = bookGroups.find((group) => group.id === selectedChapter.groupId) ?? bookGroups[0];
  const writtenLettersCount = pillarLetters.filter((letter) => readerLetters[letter.id]?.trim()).length;
  const totalAudioTracks = bookChapters.reduce((total, chapter) => total + chapter.audioTracks.length, 0);
  const heardAudioCount = Object.values(audioProgressMap).filter((entry) => entry.heard).length;
  const currentPageNote = readerNotes.find((note) => note.page === pdfPage);
  const currentPillarLetter = selectedChapter.pillar ? pillarLetters[selectedChapter.pillar - 1] : null;
  const mergedPdfTextPages = useMemo(
    () => pdfTextPages.map((text, index) => repairBrokenPdfCharacters(bookPageOverrides[index + 1] || text)),
    [bookPageOverrides],
  );
  const canonicalBookChapters = useMemo(
    () => buildArtifactCanonicalBookChapters(bookChapters, mergedPdfTextPages, bookPageTitleOverrides, bookGroups),
    [bookPageTitleOverrides, mergedPdfTextPages],
  );
  const effectiveCanonicalBookChapters = useMemo(
    () => canonicalBookChapters.map((chapter) => {
      const draftBlocks = adminCanonicalDrafts[chapter.id];
      return Array.isArray(draftBlocks) ? { ...chapter, blocks: draftBlocks } : chapter;
    }),
    [adminCanonicalDrafts, canonicalBookChapters],
  );
  useEffect(() => {
    const next = { ...canonicalJournalAnswers };
    let changed = false;
    for (const prompt of canonicalBookChapters.flatMap((chapter) => chapter.journalPrompts ?? [])) {
      if (next[prompt.id] != null) continue;
      const legacyValue = prompt.legacyIds?.map((id) => next[id]).find((value) => value != null);
      if (legacyValue == null) continue;
      next[prompt.id] = legacyValue;
      changed = true;
    }
    if (changed) setCanonicalJournalAnswers(next);
  }, [canonicalBookChapters, canonicalJournalAnswers]);
  const selectedCanonicalChapter = effectiveCanonicalBookChapters[currentChapterIndex] ?? null;
  const adminCanonicalChapter = effectiveCanonicalBookChapters.find((chapter) => chapter.id === adminCanonicalChapterId)
    ?? effectiveCanonicalBookChapters[0]
    ?? null;
  const adminCanonicalOriginalChapter = canonicalBookChapters.find((chapter) => chapter.id === adminCanonicalChapter?.id) ?? null;
  const adminCanonicalHasDraft = Boolean(adminCanonicalChapter && adminCanonicalDrafts[adminCanonicalChapter.id]);

  const updateAdminCanonicalBlocks = (chapterId: string, updater: (blocks: CanonicalBookBlock[]) => CanonicalBookBlock[]) => {
    const original = canonicalBookChapters.find((chapter) => chapter.id === chapterId);
    if (!original) return;
    const currentBlocks = adminCanonicalDrafts[chapterId] ?? original.blocks;
    setAdminCanonicalDrafts((current) => ({
      ...current,
      [chapterId]: updater(currentBlocks.map((block) => ({ ...block }))),
    }));
  };

  const updateAdminCanonicalBlock = (chapterId: string, blockId: string, patch: Partial<CanonicalBookBlock>) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) =>
      blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    );
  };

  const createAdminCanonicalBlock = (chapterId: string, index: number, kind: CanonicalBookBlockKind = 'paragraph'): CanonicalBookBlock => ({
    id: `${chapterId}-manual-${Date.now()}-${index}`,
    kind,
    text: '',
    sourcePage: adminCanonicalChapter?.sourcePageStart,
  });

  const insertAdminCanonicalBlock = (chapterId: string, index: number) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) => {
      const next = [...blocks];
      next.splice(index, 0, createAdminCanonicalBlock(chapterId, index));
      return next;
    });
  };

  const removeAdminCanonicalBlock = (chapterId: string, blockId: string) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) => blocks.filter((block) => block.id !== blockId));
  };

  const moveAdminCanonicalBlock = (chapterId: string, blockId: string, direction: -1 | 1) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= blocks.length) return blocks;
      const next = [...blocks];
      const [block] = next.splice(index, 1);
      next.splice(target, 0, block);
      return next;
    });
  };

  const splitAdminCanonicalBlock = (chapterId: string, blockId: string) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index < 0) return blocks;
      const block = blocks[index];
      const parts = block.text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
      if (parts.length < 2) return blocks;
      const splitBlocks = parts.map((text, partIndex) => ({
        ...block,
        id: partIndex === 0 ? block.id : `${block.id}-split-${Date.now()}-${partIndex}`,
        text,
      }));
      return [...blocks.slice(0, index), ...splitBlocks, ...blocks.slice(index + 1)];
    });
  };

  const mergeAdminCanonicalBlockWithNext = (chapterId: string, blockId: string) => {
    updateAdminCanonicalBlocks(chapterId, (blocks) => {
      const index = blocks.findIndex((block) => block.id === blockId);
      if (index < 0 || index >= blocks.length - 1) return blocks;
      const current = blocks[index];
      const nextBlock = blocks[index + 1];
      return [
        ...blocks.slice(0, index),
        { ...current, text: [current.text, nextBlock.text].filter(Boolean).join('\n\n') },
        ...blocks.slice(index + 2),
      ];
    });
  };

  const resetAdminCanonicalChapter = (chapterId: string) => {
    setAdminCanonicalDrafts((current) => {
      const next = { ...current };
      delete next[chapterId];
      return next;
    });
  };

  const exportAdminCanonicalDrafts = () => {
    const payload = {
      schema: 'opdds.canonical-block-drafts',
      version: 1,
      exportedAt: new Date().toISOString(),
      bookVersion: 'FINAL_17-07-26',
      chapters: adminCanonicalDrafts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `opdds-correcoes-canonicas-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setAdminMessage('Correções canônicas exportadas em JSON.');
  };

  const importAdminCanonicalDrafts = async (file: File | null) => {
    if (!file) return;
    setAdminMessage('');
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw);
      const chapters = payload?.chapters && typeof payload.chapters === 'object' ? payload.chapters : payload;
      const allowedKinds: CanonicalBookBlockKind[] = ['heading', 'subheading', 'paragraph', 'pause', 'divider', 'image', 'image-full', 'spacer'];
      const normalized: Record<string, CanonicalBookBlock[]> = {};

      Object.entries(chapters as Record<string, unknown>).forEach(([chapterId, blocks]) => {
        if (!Array.isArray(blocks)) return;
        const safeBlocks = blocks
          .map((block, index) => {
            if (!block || typeof block !== 'object') return null;
            const entry = block as Partial<CanonicalBookBlock>;
            const kind = allowedKinds.includes(entry.kind as CanonicalBookBlockKind)
              ? entry.kind as CanonicalBookBlockKind
              : 'paragraph';
            return {
              id: String(entry.id || `${chapterId}-imported-${index}`),
              kind,
              text: String(entry.text ?? ''),
              alt: entry.alt ? String(entry.alt) : undefined,
              size: typeof entry.size === 'number' ? entry.size : undefined,
              className: entry.className ? String(entry.className) : undefined,
              sourcePage: typeof entry.sourcePage === 'number' ? entry.sourcePage : undefined,
            };
          })
          .filter(Boolean) as CanonicalBookBlock[];
        if (safeBlocks.length) normalized[chapterId] = safeBlocks;
      });

      if (!Object.keys(normalized).length) {
        setAdminMessage('Arquivo de correções sem blocos válidos.');
        return;
      }

      setAdminCanonicalDrafts((current) => ({ ...current, ...normalized }));
      setAdminMessage(`Correções importadas: ${Object.keys(normalized).length} capítulo(s).`);
    } catch {
      setAdminMessage('Não consegui importar esse JSON de correções.');
    } finally {
      if (adminCanonicalImportRef.current) adminCanonicalImportRef.current.value = '';
    }
  };

  const selectedChapterAudioTracks = useMemo(
    () => selectedChapter.audioTracks.map((track) => {
      const key = `${selectedChapter.id}:${audioTrackKey(track.label)}`;
      return bookAudioOverrides[key] ? { label: bookAudioOverrides[key].label, url: bookAudioOverrides[key].url, coverUrl: bookAudioOverrides[key].coverUrl } : track;
    }),
    [bookAudioOverrides, selectedChapter],
  );

  const marketingDrafts = useMemo(() => {
    const product = marketingProductAngles[marketingProduct];
    const productName = marketingProductLabels[marketingProduct];
    const goalAngle = marketingGoalAngles[marketingGoal];
    const audience = marketingAudience.trim() || 'pessoas desacreditadas que continuam tentando';
    const offer = marketingOffer.trim() || product.mechanism;
    const objection = marketingObjection.trim() || 'não quero mais uma promessa vazia';
    const baseHook = `Não é sobre vencer mais rápido. É sobre ${product.promise}.`;
    const bridge = `Para ${audience}, ${productName} organiza uma travessia ${goalAngle}: ${product.mechanism}.`;
    const objectionTurn = `Se a objeção é "${objection}", a resposta não é pressão. É presença, ritmo e um próximo passo pequeno.`;

    return {
      headlines: [
        baseHook,
        `Um app para quem continuou mesmo quando ninguém mais acreditava.`,
        `${productName}: ${product.promise}.`,
      ],
      ads: [
        `${baseHook}\n\n${bridge}\n\n${objectionTurn}\n\n${product.cta}.`,
        `Você não precisa transformar cansaço em espetáculo para continuar.\n\n${productName} foi criado para ${product.promise}, usando ${offer}.\n\n${product.cta}.`,
      ],
      whatsapp: [
        `Oi. Pensei em você por causa disso: ${baseHook}\n\nO ${productName} junta ${offer} para quem precisa de presença, não de cobrança.\n\nQuer que eu te mande o acesso?`,
        `Passando aqui com uma proposta simples: se você está em fase de reconstrução, talvez o primeiro passo não seja acelerar.\n\nÉ ${product.promise}.\n\n${product.cta}.`,
      ],
      email: [
        `Assunto: não é mais um método para vencer\n\n${baseHook}\n\n${bridge}\n\n${objectionTurn}\n\nO convite é simples: entrar, ler no seu ritmo e continuar sem se abandonar.\n\n${product.cta}.`,
      ],
      salesPage: [
        `Promessa: ${baseHook}\n\nPara quem é: ${audience}.\n\nO que recebe: ${offer}.\n\nPor que funciona: ${product.mechanism} criam uma jornada de leitura, escuta e escrita sem exigir performance.\n\nObjeção principal: ${objection}.\n\nResposta: aqui não existe pressa nem nota. Existe continuidade.\n\nCTA: ${product.cta}.`,
      ],
      onboarding: [
        `Bem-vindo ao ${productName}.\n\nAqui você não precisa provar nada. Use ${offer} para encontrar um ponto de presença hoje.\n\nComece pequeno: leia uma página, ouça uma parte ou escreva uma resposta honesta.`,
      ],
    };
  }, [marketingAudience, marketingChannel, marketingGoal, marketingObjection, marketingOffer, marketingProduct]);

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

  const adminVisualAudioChapter = useMemo(() => {
    return [...bookChapters]
      .reverse()
      .find((chapter) => chapter.pdfPage <= adminBookPageNumber) ?? adminAudioChapter;
  }, [adminAudioChapter, adminBookPageNumber]);

  const adminVisualAudioItems = useMemo(() => {
    if (!adminVisualAudioChapter) return [];
    return adminVisualAudioChapter.audioTracks.map((track) => {
      const sectionKey = audioTrackKey(track.label);
      const published = adminBookAudio.find((item) => item.chapterId === adminVisualAudioChapter.id && item.sectionKey === sectionKey)?.latestPublished;
      return {
        chapterId: adminVisualAudioChapter.id,
        sectionKey,
        label: published?.label || track.label,
        url: published?.url || track.url,
      };
    });
  }, [adminBookAudio, adminVisualAudioChapter]);

  const adminAudioPathWarning = useMemo(() => {
    const path = adminAudioUrl.trim();
    if (!path) return '';
    const validSource = path.startsWith('/media/') || /^https?:\/\//i.test(path);
    if (!validSource) return 'Use um caminho iniciado por /media/ ou uma URL publica.';
  if (!/\.(mp3|wav|m4a|ogg)(\?.*)?$/i.test(path)) return 'Confira a extensão: recomendamos .mp3, .wav, .m4a ou .ogg.';
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
    const savedWorkbookPrompt = loadLocalWorkbookPrompt();
    const savedCanonicalJournalAnswers = loadLocalCanonicalJournalAnswers();
    const savedLetters = loadLocalLetters();
    const savedLetterMeta = loadLocalLetterMeta();
    const savedReaderNotes = loadLocalReaderNotes();
    const savedReaderAnchors = loadLocalReaderAnchors();
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
    if (workbookPrompts.includes(savedWorkbookPrompt)) setWorkbookPrompt(savedWorkbookPrompt);
    setCanonicalJournalAnswers(savedCanonicalJournalAnswers);
    setReaderLetters(savedLetters);
    setLetterMeta(savedLetterMeta);
    setReaderNotes(savedReaderNotes);
    setReaderAnchors(savedReaderAnchors);
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
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    audio.preload = 'metadata';
    audio.volume = ambientAudioState.volume;
    ambientAudioRef.current = audio;

    const syncPlaying = () => setAmbientAudioState((state) => ({ ...state, isPlaying: !audio.paused }));
    const markStopped = () => setAmbientAudioState((state) => ({ ...state, isPlaying: false }));

    audio.addEventListener('play', syncPlaying);
    audio.addEventListener('pause', markStopped);
    audio.addEventListener('ended', markStopped);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('play', syncPlaying);
      audio.removeEventListener('pause', markStopped);
      audio.removeEventListener('ended', markStopped);
    };
  }, []);

  useEffect(() => {
    const audio = ambientAudioRef.current;
    if (!audio) return;
    const duckFactor = audioState.isPlaying ? 0.28 : 1;
    audio.volume = Math.max(0, Math.min(1, ambientAudioState.volume * duckFactor));
  }, [ambientAudioState.volume, audioState.isPlaying]);

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
        setBookPageTitleOverrides(
          pages.reduce<Record<number, string>>((acc, page) => {
            if (page.title) acc[page.pageNumber] = repairBrokenPdfCharacters(page.title);
            return acc;
          }, {}),
        );
      })
      .catch(() => {
        setBookPageOverrides({});
        setBookPageTitleOverrides({});
      });
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
    localStorage.setItem(ADMIN_CANONICAL_DRAFTS_KEY, JSON.stringify(adminCanonicalDrafts));
  }, [adminCanonicalDrafts]);

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

  const persistJourneyLocally = (snapshot: {
    workbookEntry: string;
    workbookPrompt: string;
    workbookAnswers: Record<string, string>;
    canonicalJournalAnswers: Record<string, string>;
    letters: Record<string, string>;
    letterMeta: Record<string, LetterMeta>;
    readerNotes: ReaderNote[];
    readerAnchors: ReaderAnchor[];
    audioProgress: Record<string, AudioProgressEntry>;
  }) => {
    saveLocalWorkbookEntry(snapshot.workbookEntry);
    saveLocalWorkbookPrompt(snapshot.workbookPrompt);
    saveLocalWorkbookAnswers(snapshot.workbookAnswers);
    saveLocalCanonicalJournalAnswers(snapshot.canonicalJournalAnswers);
    saveLocalLetters(snapshot.letters);
    saveLocalLetterMeta(snapshot.letterMeta);
    saveLocalReaderNotes(snapshot.readerNotes);
    saveLocalReaderAnchors(snapshot.readerAnchors);
    saveLocalAudioProgress(snapshot.audioProgress);
  };

  const mergeById = <T extends { id?: string }>(localItems: T[], remoteItems: unknown[]): T[] => {
    const map = new Map<string, T>();
    localItems.forEach((item, index) => map.set(item.id || `local-${index}`, item));
    remoteItems
      .filter((item): item is T => Boolean(item && typeof item === 'object'))
      .forEach((item, index) => map.set(item.id || `remote-${index}`, item));
    return Array.from(map.values());
  };

  useEffect(() => {
    let cancelled = false;
    journeyHydratedRef.current = false;

    fetchReaderJourney()
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot) {
          journeyHydratedRef.current = true;
          return;
        }

        const mergedWorkbookEntry = snapshot.workbookEntry?.trim() ? snapshot.workbookEntry : workbookEntry;
        const mergedWorkbookPrompt = workbookPrompts.includes(snapshot.workbookPrompt) ? snapshot.workbookPrompt : workbookPrompt;
        const mergedWorkbookAnswers = { ...workbookAnswers, ...(snapshot.workbookAnswers || {}) };
        const mergedCanonicalJournalAnswers = { ...canonicalJournalAnswers, ...(snapshot.canonicalJournalAnswers || {}) };
        const mergedLetters = { ...readerLetters, ...(snapshot.letters || {}) };
        const mergedLetterMeta = { ...letterMeta, ...((snapshot.letterMeta || {}) as Record<string, LetterMeta>) };
        const mergedReaderNotes = mergeById(readerNotes, snapshot.readerNotes || []);
        const mergedReaderAnchors = mergeById(readerAnchors, snapshot.anchors || []);
        const mergedAudioProgress = { ...audioProgressMap, ...((snapshot.audioProgress || {}) as Record<string, AudioProgressEntry>) };

        setWorkbookEntry(mergedWorkbookEntry);
        setWorkbookPrompt(mergedWorkbookPrompt);
        setWorkbookAnswers(mergedWorkbookAnswers);
        setCanonicalJournalAnswers(mergedCanonicalJournalAnswers);
        setReaderLetters(mergedLetters);
        setLetterMeta(mergedLetterMeta);
        setReaderNotes(mergedReaderNotes);
        setReaderAnchors(mergedReaderAnchors);
        setAudioProgressMap(mergedAudioProgress);
        persistJourneyLocally({
          workbookEntry: mergedWorkbookEntry,
          workbookPrompt: mergedWorkbookPrompt,
          workbookAnswers: mergedWorkbookAnswers,
          canonicalJournalAnswers: mergedCanonicalJournalAnswers,
          letters: mergedLetters,
          letterMeta: mergedLetterMeta,
          readerNotes: mergedReaderNotes,
          readerAnchors: mergedReaderAnchors,
          audioProgress: mergedAudioProgress,
        });
        journeyHydratedRef.current = true;
      })
      .catch(() => {
        if (!cancelled) journeyHydratedRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  useEffect(() => {
    if (!journeyHydratedRef.current) return;
    persistJourneyLocally({
      workbookEntry,
      workbookPrompt,
      workbookAnswers,
      canonicalJournalAnswers,
      letters: readerLetters,
      letterMeta,
      readerNotes,
      readerAnchors,
      audioProgress: audioProgressMap,
    });
    if (journeySyncTimerRef.current) window.clearTimeout(journeySyncTimerRef.current);
    journeySyncTimerRef.current = window.setTimeout(() => {
      void syncReaderJourney({
        workbookEntry,
        workbookAnswers,
        canonicalJournalAnswers,
        workbookPrompt,
        letters: readerLetters,
        letterMeta,
        readerNotes,
        anchors: readerAnchors,
        audioProgress: audioProgressMap,
      }).catch(() => {});
    }, 900);

    return () => {
      if (journeySyncTimerRef.current) window.clearTimeout(journeySyncTimerRef.current);
    };
  }, [workbookEntry, workbookAnswers, canonicalJournalAnswers, workbookPrompt, readerLetters, letterMeta, readerNotes, readerAnchors, audioProgressMap, authUser?.id]);

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
    setReaderInitialMode('text');
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

  const playAmbientTrack = (track: SensoryTrack) => {
    const audio = ambientAudioRef.current;
    if (!audio || !track.audioUrl) return;
    playClick('soft');
    setAmbientPlayerCollapsed(false);
    const title = repairMojibake(track.title);
    const isSameTrack = ambientAudioState.currentUrl === track.audioUrl;

    if (!isSameTrack) {
      audio.pause();
      audio.src = track.audioUrl;
      audio.loop = true;
      audio.currentTime = 0;
      audio.load();
      setAmbientAudioState((state) => ({
        ...state,
        currentUrl: track.audioUrl,
        title,
        coverUrl: track.coverUrl || null,
        isPlaying: true,
      }));
    }

    audio.play()
      .then(() => setAmbientAudioState((state) => ({
        ...state,
        currentUrl: track.audioUrl,
        title,
        coverUrl: track.coverUrl || null,
        isPlaying: true,
      })))
      .catch(() => setAmbientAudioState((state) => ({ ...state, isPlaying: false })));
  };

  const pauseAmbientTrack = () => {
    ambientAudioRef.current?.pause();
    setAmbientAudioState((state) => ({ ...state, isPlaying: false }));
  };

  const stopAmbientTrack = () => {
    const audio = ambientAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setAmbientAudioState((state) => ({ ...state, isPlaying: false, currentUrl: null, title: null, coverUrl: null }));
  };

  const changeAmbientVolume = (value: number) => {
    const nextVolume = value / 100;
    setAmbientAudioState((state) => ({ ...state, volume: nextVolume }));
  };

  const playAdjacentAmbientTrack = (direction: 1 | -1) => {
    const playlist = sensoryPlaylist.length ? sensoryPlaylist : defaultSensoryPlaylist;
    if (!playlist.length) return;
    const currentIndex = Math.max(0, playlist.findIndex((track) => track.audioUrl === ambientAudioState.currentUrl || track.id === selectedSensoryTrackId));
    const nextIndex = (currentIndex + direction + playlist.length) % playlist.length;
    const nextTrack = playlist[nextIndex];
    setSelectedSensoryTrackId(nextTrack.id);
    localStorage.setItem(SELECTED_SENSORY_TRACK_KEY, nextTrack.id);
    playAmbientTrack(nextTrack);
  };

  const handleTokenSubmit = () => {
    playClick('primary');
    const normalized = token.trim().toUpperCase();
    if (runtimeConfig.localMode && accessTokens.includes(normalized)) {
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
    if (authSubmitting) return;
    playClick('primary');
    setAuthSubmitting(true);
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
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLoginSubmit = async () => {
    if (authSubmitting) return;
    playClick('primary');
    setAuthSubmitting(true);
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
    } finally {
      setAuthSubmitting(false);
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
      setAccountMessage('Perfil atualizado nesta sessão.');
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

  const copyMarketingText = async (key: string, text: string) => {
    await navigator.clipboard?.writeText(text);
    setMarketingCopied(key);
    window.setTimeout(() => setMarketingCopied((current) => current === key ? '' : current), 1600);
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
    setBookPageTitleOverrides(
      publishedPages.reduce<Record<number, string>>((acc, page) => {
        if (page.title) acc[page.pageNumber] = repairBrokenPdfCharacters(page.title);
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
      const visualTitle = getAdminVisualPage().title;
      const readerContent = composeAdminBookPageForReader(adminBookPageContent);
      await saveAdminBookPageDraft(adminBookPageNumber, {
        title: visualTitle || adminBookPageTitle || undefined,
        content: readerContent,
      });
      setAdminBookPageContent(readerContent);
      setAdminBookPageTitle(visualTitle || adminBookPageTitle);
      await refreshBookPageContent();
      setAdminMessage(`Rascunho salvo para a pagina ${adminBookPageNumber}.`);
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível salvar o rascunho.');
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
    if (snippet === '[br]') {
      setAdminBookPageContent((current) => `${current.slice(0, start)}[br]${current.slice(end)}`);
      window.requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      });
      return;
    }

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

  const adminHeaderPattern = {
    hide: /^\[\[\s*(?:cabecalho|header)\s*:\s*ocultar\s*\]\]$/i,
    eyebrow: /^\[\[\s*(?:cabecalho\s*[-—–]\s*sec(?:a|ã)o|header\s*[-—–]\s*eyebrow)\s*:/i,
    title: /^\[\[\s*(?:cabecalho\s*[-—–]\s*titulo|header\s*[-—–]\s*title)\s*:/i,
  };
  const matchAdminHeaderValue = (line: string, kind: 'eyebrow' | 'title') => {
    const name = kind === 'eyebrow'
      ? String.raw`(?:cabecalho\s*[-—–]\s*sec(?:a|ã)o|header\s*[-—–]\s*eyebrow)`
      : String.raw`(?:cabecalho\s*[-—–]\s*titulo|header\s*[-—–]\s*title)`;
    return line.match(new RegExp(String.raw`^\[\[\s*${name}\s*:\s*(.*?)\s*\]\]$`, 'i'));
  };

  const renderAdminBookPreviewLine = (rawLine: string, key: string | number) => {
    const line = repairBrokenPdfCharacters(rawLine.trim());
    if (!line) return null;

    if (adminHeaderPattern.hide.test(line) || adminHeaderPattern.eyebrow.test(line) || adminHeaderPattern.title.test(line)) {
      return <p className="admin-preview-command" key={key}>{line}</p>;
    }

    const titleCommandMatch = line.match(/^\[\[(titulo|subtitulo):(.+?)(?:\|(.*?))?\]\]$/i);
    if (titleCommandMatch) {
      const Tag = titleCommandMatch[1].toLowerCase() === 'subtitulo' ? 'h3' : 'h2';
      return <Tag className="admin-preview-command" key={key}>{titleCommandMatch[2].trim()}</Tag>;
    }

    if (/^\[br\]$/i.test(line)) {
      return <div className="admin-preview-spacer" key={key} aria-label="Quebra de linha" />;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      return <hr className="admin-preview-divider" key={key} />;
    }

    const spacerMatch = line.match(/^\[\[espaco:(\d{1,3})\]\]$/i);
    if (spacerMatch) {
      return <div className="admin-preview-spacer" style={{ height: `${Math.min(120, Math.max(8, Number(spacerMatch[1]) || 24))}px` }} key={key} />;
    }

    const imageMatch = line.match(/^\[\[(?:imagem|capa):(.+?)(?:\|(.*?))?\]\]$/i);
    if (imageMatch) {
      return <p className="admin-preview-command" key={key}>Imagem: {imageMatch[1].trim()}</p>;
    }

    return (
      <p key={key}>
        {line.split(/\[br\]/i).map((part, index) => (
          <span key={`${key}-${index}`}>{index > 0 && <br />}{part}</span>
        ))}
      </p>
    );
  };

  const getAdminBookLines = () => adminBookPageContent.replace(/\r/g, '').split('\n');

  const updateAdminBookLine = (lineIndex: number, nextValue: string) => {
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      lines[lineIndex] = nextValue;
      return lines.join('\n');
    });
  };

  const insertAdminBookLineAfter = (lineIndex: number, value = '') => {
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      lines.splice(lineIndex + 1, 0, value);
      return lines.join('\n');
    });
  };

  const removeAdminBookLine = (lineIndex: number) => {
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      lines.splice(lineIndex, 1);
      return lines.join('\n');
    });
  };

  const eraseJourneyData = async () => {
    if (!window.confirm('Apagar definitivamente Diário, Cadernos, cartas, notas, âncoras e progresso sincronizado desta jornada?')) return;
    try {
      await deleteReaderJourney();
      clearLocalJourney();
      setWorkbookEntry('');
      setWorkbookPrompt(workbookPrompts[0]);
      setWorkbookAnswers({});
      setCanonicalJournalAnswers({});
      setReaderLetters({});
      setLetterMeta({});
      setReaderNotes([]);
      setReaderAnchors([]);
      setAudioProgressMap({});
      setAccountMessage('Dados da jornada apagados no dispositivo e na conta.');
    } catch {
      setAccountMessage('Não foi possível apagar a jornada agora. Tente novamente.');
    }
  };

  const eraseMindHistory = async () => {
    if (!window.confirm('Apagar definitivamente todas as conversas salvas do iGentMIND?')) return;
    try {
      await deleteMindSessions();
      localStorage.removeItem(MIND_LAST_PLAN_KEY);
      setMindSavedPlan(null);
      setMindMessages([]);
      setMindSessionId(undefined);
      setAccountMessage('Histórico do iGentMIND apagado.');
    } catch {
      setAccountMessage('Não foi possível apagar as conversas agora. Tente novamente.');
    }
  };

  const parseAdminBlockCommand = (rawLine = '') => {
    const line = rawLine.trim();
    const match = line.match(/^\[\[(titulo|subtitulo|paragrafo|paragraph):(.+?)(?:\|(.*?))?\]\]$/i);
    if (!match) {
      return {
        kind: 'paragrafo',
        text: rawLine,
        styles: [] as string[],
      };
    }
    return {
      kind: match[1].toLowerCase() === 'paragraph' ? 'paragrafo' : match[1].toLowerCase(),
      text: match[2],
      styles: (match[3] || '').split(/[,\s]+/).map((item) => item.trim()).filter(Boolean),
    };
  };

  const buildAdminBlockCommand = (kind: string, text: string, styles: string[] = []) => {
    const cleanText = repairCanonicalText(text).trim();
    const uniqueStyles = Array.from(new Set(styles.map((style) => style.trim()).filter(Boolean)));
    if (!cleanText) return '';
    const command = kind === 'subtitulo' ? 'subtitulo' : kind === 'titulo' ? 'titulo' : 'paragrafo';
    return `[[${command}:${cleanText}${uniqueStyles.length ? `|${uniqueStyles.join(',')}` : ''}]]`;
  };

  const isAdminCanonicalBodyLine = (line = '') => {
    const clean = line.trim();
    return /^\[\[(titulo|subtitulo|h1|h2|paragrafo|paragraph|imagem|capa|espaco):/i.test(clean)
      || /^\[br\]$/i.test(clean)
      || /^(-{3,}|\*{3,}|_{3,})$/.test(clean);
  };

  const adminBlockStyleClass = (styles: string[] = []) => styles
    .map((style) => {
      if (style === 'negrito') return 'is-bold';
      if (style === 'italico') return 'is-italic';
      if (style === 'maiusculo') return 'is-uppercase';
      if (style === 'minusculo') return 'is-lowercase';
      if (style === 'centralizado') return 'is-center';
      if (style === 'direita') return 'is-right';
      return '';
    })
    .filter(Boolean)
    .join(' ');

  const escapeAdminInlineHtml = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const adminInlineTextToHtml = (value = '') => {
    const parts = value.split(/(\*\*.*?\*\*|__.*?__|\*[^*]+\*)/g).filter(Boolean);
    return parts.map((part) => {
      const renderPlain = (text: string) => escapeAdminInlineHtml(text).replace(/\[br\]/gi, '<br />');
      if (/^\*\*.*\*\*$/.test(part) || /^__.*__$/.test(part)) {
        return `<strong>${renderPlain(part.replace(/^(\*\*|__)|(\*\*|__)$/g, ''))}</strong>`;
      }
      if (/^\*[^*]+\*$/.test(part)) {
        return `<em>${renderPlain(part.slice(1, -1))}</em>`;
      }
      return renderPlain(part);
    }).join('');
  };

  const serializeAdminInlineHtml = (root: HTMLElement) => {
    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const element = node as HTMLElement;
      const content = Array.from(element.childNodes).map(walk).join('');
      const tag = element.tagName.toLowerCase();
      if (['strong', 'b'].includes(tag)) return `**${content}**`;
      if (['em', 'i'].includes(tag)) return `*${content}*`;
      if (tag === 'br') return '[br]';
      if (['div', 'p'].includes(tag)) return `\n${content}`;
      return content;
    };
    return Array.from(root.childNodes)
      .map(walk)
      .join('')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\s*\[br\]\s*/gi, '[br]')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  };

  const buildAdminReplacementLinesFromText = (kind: string, text: string, styles: string[] = []) => {
    if (kind === 'titulo' || kind === 'subtitulo') {
      return [buildAdminBlockCommand(kind, text.replace(/\n+/g, ' '), styles)].filter(Boolean);
    }
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => buildAdminBlockCommand('paragrafo', line, styles));
  };

  const updateAdminBookLineFromSerializedBlock = (lineIndex: number, sourceLine: string, serializedText: string) => {
    const block = parseAdminBlockCommand(sourceLine);
    const replacementLines = buildAdminReplacementLinesFromText(block.kind, serializedText, block.styles);
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      if (lines[lineIndex] === undefined) return current;
      lines.splice(lineIndex, 1, ...(replacementLines.length ? replacementLines : ['']));
      return lines.join('\n');
    });
  };

  const getAdminSelectedInlineElement = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    const node = selection.getRangeAt(0).commonAncestorContainer;
    const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
    return element?.closest<HTMLElement>('[data-admin-line-index]') || null;
  };

  const saveAdminInlineElement = (element: HTMLElement) => {
    const lineIndex = Number(element.dataset.adminLineIndex);
    if (!Number.isFinite(lineIndex)) return;
    setAdminSelectedBookLineIndex(lineIndex);
    const currentLine = getAdminBookLines()[lineIndex] || '';
    const nextText = serializeAdminInlineHtml(element);
    updateAdminBookLineFromSerializedBlock(lineIndex, currentLine, nextText);
  };

  const applyAdminInlineFormat = (command: 'bold' | 'italic') => {
    const element = getAdminSelectedInlineElement();
    if (!element) {
      setAdminMessage('Selecione uma palavra ou frase dentro do texto para aplicar este estilo.');
      return;
    }
    document.execCommand(command);
    saveAdminInlineElement(element);
  };

  const updateAdminSelectedBlock = (updater: (block: { kind: string; text: string; styles: string[] }) => { kind: string; text: string; styles: string[] }) => {
    if (adminSelectedBookLineIndex === null) {
      setAdminMessage('Selecione um parágrafo ou título na página para formatar.');
      return;
    }
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      const currentLine = lines[adminSelectedBookLineIndex];
      if (currentLine === undefined) return current;
      const block = parseAdminBlockCommand(currentLine);
      const next = updater(block);
      lines[adminSelectedBookLineIndex] = buildAdminBlockCommand(next.kind, next.text, next.styles);
      return lines.join('\n');
    });
  };

  const setAdminSelectedBlockKind = (kind: 'paragrafo' | 'titulo' | 'subtitulo') => {
    updateAdminSelectedBlock((block) => ({ ...block, kind }));
  };

  const toggleAdminSelectedBlockStyle = (style: string) => {
    updateAdminSelectedBlock((block) => {
      const hasStyle = block.styles.includes(style);
      return {
        ...block,
        styles: hasStyle ? block.styles.filter((item) => item !== style) : [...block.styles, style],
      };
    });
  };

  const setAdminSelectedBlockAlignment = (style: 'esquerda' | 'centralizado' | 'direita') => {
    updateAdminSelectedBlock((block) => ({
      ...block,
      styles: style === 'esquerda'
        ? block.styles.filter((item) => !['centralizado', 'direita'].includes(item))
        : [...block.styles.filter((item) => !['centralizado', 'direita'].includes(item)), style],
    }));
  };

  const transformAdminSelectedBlockText = (mode: 'upper' | 'lower' | 'capitalize') => {
    updateAdminSelectedBlock((block) => {
      const text = mode === 'upper'
        ? block.text.toUpperCase()
        : mode === 'lower'
          ? block.text.toLocaleLowerCase('pt-BR')
          : block.text.toLocaleLowerCase('pt-BR').replace(/(^|[.!?]\s+)(\p{L})/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('pt-BR')}`);
      return { ...block, text };
    });
  };

  const composeAdminBookPageForReader = (content = adminBookPageContent) =>
    content
      .replace(/\r/g, '')
      .split('\n')
      .map((rawLine) => {
        const line = repairCanonicalText(rawLine).trim();
        if (!line) return '';
        if (isAdminHeaderDirectiveLine(line) || isAdminCanonicalBodyLine(line)) return line;
        return buildAdminBlockCommand('paragrafo', line);
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

  const upsertAdminBookDirective = (kind: 'cabecalho' | 'cabecalho-secao' | 'cabecalho-titulo', value = '') => {
    const patterns = {
      cabecalho: /^\[\[\s*(?:cabecalho|header)\s*:/i,
      'cabecalho-secao': adminHeaderPattern.eyebrow,
      'cabecalho-titulo': adminHeaderPattern.title,
    };
    const directive = kind === 'cabecalho' ? '[[cabecalho:ocultar]]' : `[[${kind}:${value}]]`;
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      const index = lines.findIndex((line) => patterns[kind].test(line.trim()));
      if (index >= 0) lines[index] = directive;
      else lines.unshift(directive);
      return lines.join('\n');
    });
  };

  const removeAdminBookDirective = (kind: 'cabecalho' | 'cabecalho-secao' | 'cabecalho-titulo') => {
    const patterns = {
      cabecalho: /^\[\[\s*(?:cabecalho|header)\s*:/i,
      'cabecalho-secao': adminHeaderPattern.eyebrow,
      'cabecalho-titulo': adminHeaderPattern.title,
    };
    setAdminBookPageContent((current) => current
      .replace(/\r/g, '')
      .split('\n')
      .filter((line) => !patterns[kind].test(line.trim()))
      .join('\n'));
  };

  const getAdminVisualPage = () => {
    const sourceLines = getAdminBookLines();
    const data = {
      hideHeader: false,
      eyebrow: 'Livro',
      title: adminBookPageTitle || '',
      titleLineIndex: -1,
      bodyLines: [] as Array<{ line: string; index: number }>,
    };

    sourceLines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (adminHeaderPattern.hide.test(line)) {
        data.hideHeader = true;
        return;
      }
      const eyebrow = matchAdminHeaderValue(line, 'eyebrow');
      if (eyebrow) {
        data.eyebrow = eyebrow[1].trim() || 'Livro';
        return;
      }
      const title = matchAdminHeaderValue(line, 'title');
      if (title) {
        data.title = title[1].trim();
        return;
      }
      data.bodyLines.push({ line: rawLine, index });
    });

    return data;
  };

  const promoteFirstBodyLineToAdminHeader = () => {
    let promoted = '';
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      const firstBodyIndex = lines.findIndex((rawLine) => {
        const line = rawLine.trim();
        return line
          && !adminHeaderPattern.hide.test(line)
          && !adminHeaderPattern.eyebrow.test(line)
          && !adminHeaderPattern.title.test(line)
          && !/^\[\[/.test(line)
          && !/^(-{3,}|\*{3,}|_{3,})$/.test(line);
      });
      if (firstBodyIndex < 0) return current;
      promoted = repairBrokenPdfCharacters(lines[firstBodyIndex].trim());
      lines.splice(firstBodyIndex, 1);
      const titleDirective = `[[cabecalho-titulo:${promoted}]]`;
      const existingTitleIndex = lines.findIndex((line) => adminHeaderPattern.title.test(line.trim()));
      if (existingTitleIndex >= 0) lines[existingTitleIndex] = titleDirective;
      else lines.unshift(titleDirective);
      return lines.join('\n');
    });
    setAdminMessage(promoted ? 'Primeira linha do miolo movida para o título do header.' : 'Não encontrei uma linha de miolo para usar como título.');
  };

  const getAdminVisualBodyText = (bodyLines: Array<{ line: string; index: number }>) =>
    bodyLines.map(({ line }) => line).join('\n');

  const updateAdminVisualBodyText = (bodyLines: Array<{ line: string; index: number }>, nextValue: string) => {
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      const nextLines = nextValue.replace(/\r/g, '').split('\n');
      if (!bodyLines.length) return [...lines, '', ...nextLines].join('\n');
      const first = bodyLines[0].index;
      const last = bodyLines[bodyLines.length - 1].index;
      lines.splice(first, last - first + 1, ...nextLines);
      return lines.join('\n');
    });
  };

  const isAdminHeaderDirectiveLine = (line: string) => {
    const clean = line.trim();
    return adminHeaderPattern.hide.test(clean)
      || adminHeaderPattern.eyebrow.test(clean)
      || adminHeaderPattern.title.test(clean);
  };

  const normalizeAdminPlainPaste = (value = '', keepParagraphs = false) => {
    const clean = repairBrokenPdfCharacters(value)
      .replace(/\r/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/-\n(?=\p{Ll})/gu, '')
      .replace(/[ \t]+/g, ' ')
      .trim();
    if (!clean) return '';

    const paragraphs = clean
      .split(/\n\s*\n+/)
      .map((paragraph) => paragraph
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim())
      .filter(Boolean)
    return keepParagraphs ? paragraphs.join('\n\n') : paragraphs.join(' ');
  };

  const replaceAdminVisualBodyWithPlainText = (nextText: string, keepParagraphs = false) => {
    const normalized = normalizeAdminPlainPaste(nextText, keepParagraphs);
    if (!normalized) return;
    const nextLines = normalized
      .split(/\n{2,}|\n/)
      .map((line) => buildAdminBlockCommand('paragrafo', line))
      .filter(Boolean);
    setAdminBookPageContent((current) => {
      const lines = current.replace(/\r/g, '').split('\n');
      const headerLines = lines.filter(isAdminHeaderDirectiveLine);
      return [...headerLines, ...nextLines].join('\n');
    });
    setAdminPlainPasteDraft('');
    setAdminSelectedBookLineIndex(null);
    setAdminMessage('Miolo substituído por texto limpo. Agora selecione trechos para formatar.');
  };

  const renderAdminVisualEditableLine = (rawLine: string, lineIndex: number) => {
    const line = repairBrokenPdfCharacters(rawLine.trim());
    const blockCommand = parseAdminBlockCommand(line);
    const selected = adminSelectedBookLineIndex === lineIndex;
    const audioCue = (() => {
      const clean = line.replace(/\[br\]/gi, ' ').replace(/\s+/g, ' ').trim();
      if (!clean || clean.length > 56 || clean.split(/\s+/).length > 5) return null;
      const key = audioTrackKey(clean);
      return adminVisualAudioItems.find((item) => item.sectionKey === key) ?? null;
    })();
    const audioCueNode = audioCue ? (
      <button
        type="button"
        className="admin-visual-audio-cue"
        onClick={() => {
          setAdminBookTab('audio');
          setAdminAudioChapterId(audioCue.chapterId);
          setAdminAudioSectionKey(audioCue.sectionKey);
          setAdminAudioLabel(audioCue.label);
          setAdminAudioUrl(audioCue.url);
        }}
        title={`Editar áudio: ${audioCue.label}`}
      >
        <Headphones size={12} />
        <span>{audioCue.label}</span>
      </button>
    ) : null;
    const editableProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      'data-admin-line-index': lineIndex,
      onFocus: () => setAdminSelectedBookLineIndex(lineIndex),
      onClick: () => setAdminSelectedBookLineIndex(lineIndex),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        const nextText = serializeAdminInlineHtml(event.currentTarget);
        updateAdminBookLineFromSerializedBlock(lineIndex, line, nextText);
      },
    };

    if (!line) {
      return (
        <div className="admin-visual-empty-line" key={`visual-${lineIndex}`}>
          <button type="button" onClick={() => insertAdminBookLineAfter(lineIndex, '')}>+ parágrafo</button>
          <button type="button" onClick={() => insertAdminBookLineAfter(lineIndex, '---')}>+ divisor</button>
        </div>
      );
    }

    if (adminHeaderPattern.hide.test(line) || adminHeaderPattern.eyebrow.test(line) || adminHeaderPattern.title.test(line)) return null;
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      return <hr className="admin-visual-divider" key={`visual-${lineIndex}`} onDoubleClick={() => removeAdminBookLine(lineIndex)} />;
    }
    if (/^\[br\]$/i.test(line)) {
      return <div className="admin-visual-line-break" key={`visual-${lineIndex}`} onDoubleClick={() => removeAdminBookLine(lineIndex)}>quebra</div>;
    }
    const spacerMatch = line.match(/^\[\[espaco:(\d{1,3})\]\]$/i);
    if (spacerMatch) {
      return (
        <div className="admin-visual-spacer" style={{ height: `${Math.min(120, Math.max(8, Number(spacerMatch[1]) || 24))}px` }} key={`visual-${lineIndex}`}>
          <span>espaço {spacerMatch[1]}px</span>
          <button type="button" onClick={() => removeAdminBookLine(lineIndex)}>remover</button>
        </div>
      );
    }

    const titleCommandMatch = line.match(/^\[\[(titulo|subtitulo):(.+?)(?:\|(.*?))?\]\]$/i);
    if (titleCommandMatch) {
      const Tag = titleCommandMatch[1].toLowerCase() === 'subtitulo' ? 'h3' : 'h2';
      const styles = blockCommand.styles;
      const titleAudioCue = (() => {
        const clean = repairBrokenPdfCharacters(titleCommandMatch[2].trim()).replace(/\s+/g, ' ');
        const key = audioTrackKey(clean);
        return adminVisualAudioItems.find((item) => item.sectionKey === key) ?? null;
      })();
      const titleAudioCueNode = titleAudioCue ? (
        <button
          type="button"
          className="admin-visual-audio-cue"
          onClick={() => {
            setAdminBookTab('audio');
            setAdminAudioChapterId(titleAudioCue.chapterId);
            setAdminAudioSectionKey(titleAudioCue.sectionKey);
            setAdminAudioLabel(titleAudioCue.label);
            setAdminAudioUrl(titleAudioCue.url);
          }}
          title={`Editar áudio: ${titleAudioCue.label}`}
        >
          <Headphones size={12} />
          <span>{titleAudioCue.label}</span>
        </button>
      ) : null;
      return (
        <div className={`admin-visual-audio-line admin-visual-block ${selected ? 'selected' : ''}`} key={`visual-${lineIndex}`} onClick={() => setAdminSelectedBookLineIndex(lineIndex)}>
          <Tag
            className={`admin-visual-title ${adminBlockStyleClass(styles)}`}
            contentEditable
            suppressContentEditableWarning
            data-admin-line-index={lineIndex}
            onFocus={() => setAdminSelectedBookLineIndex(lineIndex)}
            onBlur={(event) => updateAdminBookLineFromSerializedBlock(lineIndex, line, serializeAdminInlineHtml(event.currentTarget))}
            dangerouslySetInnerHTML={{ __html: adminInlineTextToHtml(repairBrokenPdfCharacters(titleCommandMatch[2].trim())) }}
          />
          {titleAudioCueNode}
        </div>
      );
    }

    const paragraphCommandMatch = line.match(/^\[\[(?:paragrafo|paragraph):(.+?)(?:\|(.*?))?\]\]$/i);
    if (paragraphCommandMatch) {
      const cleanText = repairBrokenPdfCharacters(paragraphCommandMatch[1].trim());
      return (
        <div className={`admin-visual-audio-line admin-visual-block ${selected ? 'selected' : ''}`} key={`visual-${lineIndex}`} onClick={() => setAdminSelectedBookLineIndex(lineIndex)}>
          <p
            className={`admin-visual-paragraph ${adminBlockStyleClass(blockCommand.styles)}`}
            {...editableProps}
            dangerouslySetInnerHTML={{ __html: adminInlineTextToHtml(cleanText) }}
          />
          {audioCueNode}
        </div>
      );
    }

    const imageMatch = line.match(/^\[\[(?:imagem|capa):(.+?)(?:\|(.*?))?\]\]$/i);
    if (imageMatch) {
      return (
        <figure className="admin-visual-image" key={`visual-${lineIndex}`}>
          <img src={imageMatch[1].trim()} alt={imageMatch[2]?.trim() || ''} />
          <figcaption {...editableProps}>{imageMatch[2]?.trim() || 'Legenda da imagem'}</figcaption>
        </figure>
      );
    }

    return (
      <div className={`admin-visual-audio-line admin-visual-block ${audioCue ? 'has-audio' : ''} ${selected ? 'selected' : ''}`} key={`visual-${lineIndex}`} onClick={() => setAdminSelectedBookLineIndex(lineIndex)}>
        <p
          className="admin-visual-paragraph"
          {...editableProps}
          dangerouslySetInnerHTML={{ __html: adminInlineTextToHtml(line) }}
        />
        {audioCueNode}
      </div>
    );
  };

  const handlePublishBookPage = async () => {
    setAdminMessage('');
    try {
      const visualTitle = getAdminVisualPage().title;
      const readerContent = composeAdminBookPageForReader(adminBookPageContent);
      await publishAdminBookPage(adminBookPageNumber, {
        title: visualTitle || adminBookPageTitle || undefined,
        content: readerContent,
      });
      setAdminBookPageContent(readerContent);
      setAdminBookPageTitle(visualTitle || adminBookPageTitle);
      await refreshBookPageContent();
      setAdminMessage(`Pagina ${adminBookPageNumber} publicada no modo leitura.`);
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível publicar a pagina.');
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
      setAdminMessage(error?.message || 'Não foi possível salvar a mesa de audio.');
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
      setAdminMessage('Áudio publicado para esta seção.');
    } catch (error: any) {
      setAdminMessage(error?.message || 'Não foi possível publicar o audio.');
    }
  };

  const persistSensoryPlaylist = (tracks: SensoryTrack[]) => {
    setSensoryPlaylist(tracks);
    localStorage.setItem(ADMIN_SENSORY_PLAYLIST_KEY, JSON.stringify(tracks));
  };

  const handleSaveSensoryTrack = () => {
    const title = adminSensoryDraft.title.trim();
    const audioUrl = adminSensoryDraft.audioUrl.trim();
    if (!title || !audioUrl) {
      setAdminMessage('Informe pelo menos titulo e URL do audio sensorial.');
      return;
    }
    const id = adminSensoryDraft.id || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `track-${Date.now()}`;
    const nextTrack: SensoryTrack = {
      id,
      title,
      text: adminSensoryDraft.text.trim() || 'Trilha para leitura com presença.',
      audioUrl,
      coverUrl: adminSensoryDraft.coverUrl?.trim() || '',
    };
    persistSensoryPlaylist([
      ...sensoryPlaylist.filter((track) => track.id !== id),
      nextTrack,
    ]);
    setAdminSensoryDraft({ id: '', title: '', text: '', audioUrl: '', coverUrl: '' });
    setAdminMessage('Áudio sensorial salvo na playlist.');
  };

  const handleEditSensoryTrack = (track: SensoryTrack) => {
    setAdminSensoryDraft({
      ...track,
      title: repairMojibake(track.title),
      text: repairMojibake(track.text),
    });
  };

  const handleRemoveSensoryTrack = (trackId: string) => {
    const removedTrack = sensoryPlaylist.find((track) => track.id === trackId);
    persistSensoryPlaylist(sensoryPlaylist.filter((track) => track.id !== trackId));
    if (removedTrack?.audioUrl && ambientAudioState.currentUrl === removedTrack.audioUrl) stopAmbientTrack();
    if (selectedSensoryTrackId === trackId) {
      const nextTrack = sensoryPlaylist.find((track) => track.id !== trackId) || defaultSensoryPlaylist[0];
      setSelectedSensoryTrackId(nextTrack.id);
      localStorage.setItem(SELECTED_SENSORY_TRACK_KEY, nextTrack.id);
    }
    setAdminMessage('Áudio sensorial removido da playlist.');
  };

  const selectSensoryTrack = (track: SensoryTrack, playNow = false) => {
    setSelectedSensoryTrackId(track.id);
    localStorage.setItem(SELECTED_SENSORY_TRACK_KEY, track.id);
    if (playNow) playAmbientTrack(track);
  };

  const toggleSelectedSensoryTrack = () => {
    if (!selectedSensoryTrack) return;
    if (ambientAudioState.currentUrl && ambientPlayerCollapsed) {
      setAmbientPlayerCollapsed(false);
      return;
    }
    if (ambientAudioState.currentUrl === selectedSensoryTrack.audioUrl && ambientAudioState.isPlaying) {
      pauseAmbientTrack();
      return;
    }
    playAmbientTrack(selectedSensoryTrack);
  };

  const persistSupportAudios = (tracks: SensoryTrack[]) => {
    setSupportAudios(tracks);
    localStorage.setItem(ADMIN_SUPPORT_AUDIO_KEY, JSON.stringify(tracks));
  };

  const handleSaveSupportAudio = () => {
    const title = adminSupportAudioDraft.title.trim();
    const audioUrl = adminSupportAudioDraft.audioUrl.trim();
    if (!title || !audioUrl) {
      setAdminMessage('Informe pelo menos título e URL do áudio de apoio.');
      return;
    }
    const id = adminSupportAudioDraft.id || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `support-${Date.now()}`;
    persistSupportAudios([
      ...supportAudios.filter((track) => track.id !== id),
      {
        id,
        title,
        text: adminSupportAudioDraft.text.trim() || 'Áudio de apoio para a jornada.',
        audioUrl,
        coverUrl: adminSupportAudioDraft.coverUrl?.trim() || '',
      },
    ]);
    setAdminSupportAudioDraft({ id: '', title: '', text: '', audioUrl: '', coverUrl: '' });
    setAdminMessage('Áudio de apoio salvo.');
  };

  const handleEditSupportAudio = (track: SensoryTrack) => {
    setAdminSupportAudioDraft({
      ...track,
      title: repairMojibake(track.title),
      text: repairMojibake(track.text),
    });
  };

  const handleRemoveSupportAudio = (trackId: string) => {
    persistSupportAudios(supportAudios.filter((track) => track.id !== trackId));
    setAdminMessage('Áudio de apoio removido.');
  };

  const handleOpenAdminBookPageInReader = () => {
    const visualTitle = getAdminVisualPage().title;
    const readerContent = composeAdminBookPageForReader(adminBookPageContent);
    setAdminBookPageContent(readerContent);
    setAdminBookPageTitle(visualTitle || adminBookPageTitle);
    setBookPageOverrides((current) => ({
      ...current,
      [adminBookPageNumber]: readerContent,
    }));
    setBookPageTitleOverrides((current) => ({
      ...current,
      [adminBookPageNumber]: repairBrokenPdfCharacters(visualTitle || adminBookPageTitle || ''),
    }));
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

  const handleShareProject = () => {
    playClick('soft');
    const shareTitle = 'O Poder dos Desacreditados';
    const shareText = 'Conheça o app de leitura, Áudios e jornada guiada de O Poder dos Desacreditados.';
    const shareUrl = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`).then(() => {
      setAccountMessage('Link do projeto copiado. Agora é só enviar para quem precisa conhecer.');
      window.setTimeout(() => setAccountMessage(''), 2200);
    }).catch(() => {
      setAccountMessage(shareUrl);
    });
  };

  const getMindGuide = (topic = activeMentorTopic) => mindGuides[topic.id] ?? mindGuides.ansiedade;

  const clearMindTimers = () => {
    mindTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    mindTimersRef.current = [];
    setMindTyping(false);
  };

  const revealAgentMessages = (messages: MindMessage[], initialDelay = 360, stepDelay = 920) => {
    clearMindTimers();
    if (!messages.length) return;
    setMindTyping(true);
    messages.forEach((message, index) => {
      const timer = window.setTimeout(() => {
        setMindMessages((current) => [...current, message]);
        if (index === messages.length - 1) setMindTyping(false);
      }, initialDelay + index * stepDelay);
      mindTimersRef.current.push(timer);
    });
  };

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

  const buildPillarDiarySnapshot = (pillarIndex: number) => {
    const pillar = workbookPillars[pillarIndex] ?? workbookPillars[0];
    const answers = pillar.questions
      .map((question, index) => ({
        question,
        answer: workbookAnswers[`${pillarIndex}-${index}`] || '',
      }))
      .filter((item) => item.answer.trim());

    const text = answers.map((item) => `${item.question} ${item.answer}`).join(' ');
    const words = normalizeForSearch(text)
      .split(' ')
      .filter((word) => word.length > 4);
    const repeatedWord = words.find((word, index) => words.indexOf(word) !== index);

    return {
      pillar,
      answers,
      hasAnswers: answers.length > 0,
      repeatedWord,
      excerpt: trimExcerpt(answers.map((item) => item.answer).join(' '), 360),
    };
  };

  const getMindTriageQuestions = (pillarIndex: number | null) =>
    pillarIndex == null
      ? []
      : (getOfficialMindPillarProtocol(pillarIndex)?.questions ?? mindTriageBank[pillarIndex] ?? []);

  const buildMindTriageMessage = (pillarIndex: number, step: number): MindMessage | null => {
    const question = getMindTriageQuestions(pillarIndex)[step];
    if (!question) return null;
    const visiblePositions = question.phase === 'judgment'
      ? ['recognition', 'defense', 'ambivalence', 'desire']
      : question.phase === 'presence'
        ? ['recognition', 'ambivalence', 'desire', 'uncertainty']
        : ['recognition', 'minimization', 'ambivalence', 'uncertainty'];
    return {
      id: `triage-${pillarIndex}-${question.id}`,
      from: 'agent',
      text: question.prompt,
      triageOptions: question.options.filter((option) =>
        !option.semantic_position || visiblePositions.includes(option.semantic_position),
      ),
    };
  };

  const commitMindTriageAnswer = (answer: MindTriageAnswer, signalAnalysis: SignalAnalysisResult) => {
    if (activeMindPillarIndex == null || mindTyping) return;
    const questions = getMindTriageQuestions(activeMindPillarIndex);
    const currentQuestion = questions[activeMindTriageStep];
    if (!currentQuestion) return;
    const protocol = getOfficialMindPillarProtocol(activeMindPillarIndex);
    const previousMindState = activeReaderMindState || createInitialReaderMindState({
      readerId: authUser?.id || readerName,
      pillarId: protocol?.identity.id || String(activeMindPillarIndex),
      phase: currentQuestion.phase || 'consciousness',
      questionId: currentQuestion.id,
    });
    const stateAtCurrentQuestion = currentQuestion.phase && previousMindState.current_phase !== currentQuestion.phase
      ? {
          ...previousMindState,
          current_phase: currentQuestion.phase,
          current_question_id: currentQuestion.id,
          book_position: {
            ...previousMindState.book_position,
            current_phase: currentQuestion.phase,
          },
        }
      : previousMindState;
    const stateUpdate = updateReaderMindState(stateAtCurrentQuestion, {
      signal: signalAnalysis,
      questionId: currentQuestion.id,
    });
    const decisionResult = decideNextAction({
      reader_state: stateUpdate.state,
      current_pillar: {
        id: protocol?.identity.id || String(activeMindPillarIndex),
        title: protocol?.identity.title || activeMentorTopic.title,
      },
      current_phase: stateUpdate.state.current_phase,
      current_interaction: {
        interaction_type: answer.open_answer ? 'open_response' : 'structured_option',
        selected_option_id: answer.open_answer ? undefined : answer.signal,
        open_response: answer.open_answer,
      },
      signal_analysis: signalAnalysis,
      memory_result: defaultMemoryEngineResult(['no persistent memory retrieval in this step']),
      recent_interventions: activeSessionMemory?.recent_intervention_types || [],
      recent_question_ids: activeMindTriageAnswers.map((answer) => answer.questionId),
      available_content: {
        questions: protocol?.questions || [],
        micro_returns: protocol?.micro_returns || [],
        journal_prompts: protocol?.journal_prompts || [],
        letters: protocol?.guided_letters || [],
        anchors: protocol?.practical_anchors || [],
      },
      content_progress: Math.round(readProgress * 100),
      reflective_progress: stateUpdate.state.current_phase === 'presence'
        ? 'integrating'
        : stateUpdate.state.current_phase === 'judgment'
          ? 'questioning'
          : 'recognizing',
      active_open_threads: [],
    });

    const nextAnswers = [...activeMindTriageAnswers, { ...answer, signal_analysis: signalAnalysis }];
    const chapter = bookChapters[chapterIndexForPillar(activeMindPillarIndex)];
    const turnPlan = planMindJourneyTurn({
      questions,
      answers: nextAnswers,
      pillarTitle: protocol?.identity.title || activeMentorTopic.title,
      chapterTitle: chapter?.title,
      readerState: stateUpdate.state,
      decision: decisionResult,
    });
    const nextStep = turnPlan.nextQuestionIndex ?? activeMindTriageStep;
    const nextQuestionMessage = turnPlan.nextQuestionIndex == null
      ? null
      : buildMindTriageMessage(activeMindPillarIndex, turnPlan.nextQuestionIndex);

    playClick('soft');
    clearMindTimers();
    setActiveMindTriageAnswers(nextAnswers);
    setActiveReaderMindState(stateUpdate.state);
    setActiveDecisionResult(decisionResult);
    setActiveSessionMemory((current) => {
      if (!current) return current;
      const recentSignals = [
        answer.primary_signal,
        ...(answer.secondary_signals || []),
        ...current.recent_signal_ids,
      ].filter(Boolean) as string[];
      return {
        ...current,
        current_phase: stateUpdate.state.current_phase,
        current_question_id: currentQuestion.id,
        selected_option_id: answer.open_answer ? undefined : answer.signal,
        recent_signal_ids: Array.from(new Set(recentSignals)).slice(0, 6),
        recent_intervention_types: Array.from(new Set([
          decisionResult.selected_intervention,
          ...(signalAnalysis.recommended_interventions || []),
          ...current.recent_intervention_types,
        ])).slice(0, 6),
        current_reader_state: stateUpdate.state.global_state,
        current_depth: stateUpdate.state.depth_level,
        current_load: stateUpdate.state.load_level,
        current_readiness: stateUpdate.state.readiness_level,
        recent_interactions: [
          ...current.recent_interactions,
          `${currentQuestion.prompt} -> ${answer.open_answer || answer.option}`,
        ].slice(-6),
        updated_at: new Date().toISOString(),
      };
    });
    setActiveMindTriageStep(nextStep);
    setMindTriageComplete(turnPlan.complete);
    setMindMessages((current) => [
      ...current.map((message) => ({ ...message, triageOptions: undefined, replies: undefined })),
      { id: `user-triage-${Date.now()}`, from: 'user', text: answer.open_answer || answer.option },
    ]);

    const nextAgentMessages: MindMessage[] = [
      ...(turnPlan.acknowledgement ? [{
        id: `agent-triage-response-${Date.now()}`,
        from: 'agent' as const,
        kind: 'intro' as const,
        text: turnPlan.acknowledgement,
      }] : []),
      ...(nextQuestionMessage ? [nextQuestionMessage] : [{
        id: `agent-triage-synthesis-${Date.now()}`,
        from: 'agent',
        kind: 'plan',
        text: turnPlan.synthesis || buildMindJourneySynthesis({
          pillarTitle: protocol?.identity.title || activeMentorTopic.title,
          chapterTitle: chapter?.title,
          answers: nextAnswers,
        }),
        replies: turnPlan.replies || mindJourneyClosingReplies,
      } as MindMessage]),
    ];
    revealAgentMessages(nextAgentMessages, 420, 760);
  };

  const selectMindTriageOption = (option: MindTriageOption) => {
    if (activeMindPillarIndex == null || mindTyping) return;
    const questions = getMindTriageQuestions(activeMindPillarIndex);
    const currentQuestion = questions[activeMindTriageStep];
    if (!currentQuestion) return;
    const signalAnalysis = analyzeStructuredSignal({
      primary: option.primary_signal,
      secondary: option.secondary_signals,
      sourceId: option.id,
      intensity: option.load ? Math.min(4, option.load) as 1 | 2 | 3 : 1,
    });
    commitMindTriageAnswer({
      questionId: currentQuestion.id,
      phase: currentQuestion.phase,
      question: currentQuestion.prompt,
      option: option.label,
      signal: option.signal,
      semantic_position: option.semantic_position,
      primary_signal: option.primary_signal,
      secondary_signals: option.secondary_signals?.slice(0, 3),
      load: option.load,
    }, signalAnalysis);
  };

  const submitOpenMindTriageAnswer = (text: string) => {
    const value = text.trim();
    if (!value || activeMindPillarIndex == null || mindTyping || mindTriageComplete) return;
    const questions = getMindTriageQuestions(activeMindPillarIndex);
    const currentQuestion = questions[activeMindTriageStep];
    if (!currentQuestion) return;
    const locale = typeof navigator !== 'undefined' ? navigator.language || 'pt-BR' : 'pt-BR';
    const safetyAssessment = assessSafety({
      current_text: value,
      recent_interactions: activeSessionMemory?.recent_interactions || [],
      current_load: activeReaderMindState?.load_level || 1,
      current_reader_state: activeReaderMindState?.global_state || 'unmapped',
      detected_categories: [],
      locale,
    });
    setActiveSafetyAssessment(safetyAssessment);
    setMindInput('');
    if (safetyAssessment.level >= 2) {
      setMindTriageComplete(true);
      setMindMessages((current) => [
        ...current.map((message) => ({ ...message, triageOptions: undefined, replies: undefined })),
        { id: `user-triage-open-${Date.now()}`, from: 'user', text: value },
        {
          id: `agent-triage-safety-${Date.now()}`,
          from: 'agent',
          kind: 'plan',
          text: buildSafetyResponseText(safetyAssessment, safetyResourcesByLocale[locale]),
        },
      ]);
      return;
    }
    const signalAnalysis: SignalAnalysisResult = {
      primary_signal: 'recognition',
      secondary_signals: [],
      intensity: 1,
      confidence: 'low',
      evidence: [{ source_type: 'open_response', source_id: currentQuestion.id, excerpt: trimExcerpt(value, 180) }],
      reader_confirmed: false,
      contradicts_previous_signal: false,
      recommended_interventions: ['mirror', 'question'],
      should_create_pattern: false,
      should_update_existing_pattern: false,
      requires_more_context: true,
    };
    commitMindTriageAnswer({
      questionId: currentQuestion.id,
      phase: currentQuestion.phase,
      question: currentQuestion.prompt,
      option: value,
      signal: 'open_response',
      primary_signal: 'recognition',
      load: 1,
      open_answer: value,
    }, signalAnalysis);
  };

  const finishMindTriage = () => {
    if (activeMindPillarIndex == null || mindTyping || mindTriageComplete) return;
    const protocol = getOfficialMindPillarProtocol(activeMindPillarIndex);
    const chapter = bookChapters[chapterIndexForPillar(activeMindPillarIndex)];
    const plan = planMindJourneyTurn({
      questions: getMindTriageQuestions(activeMindPillarIndex),
      answers: activeMindTriageAnswers,
      pillarTitle: protocol?.identity.title || activeMentorTopic.title,
      chapterTitle: chapter?.title,
      readerState: activeReaderMindState,
      decision: activeDecisionResult,
      forceComplete: true,
    });
    playClick('soft');
    clearMindTimers();
    setMindTriageComplete(true);
    setMindMessages((current) => [
      ...current.map((message) => ({ ...message, triageOptions: undefined, replies: undefined })),
      {
        id: `agent-triage-stop-${Date.now()}`,
        from: 'agent',
        kind: 'plan',
        text: plan.synthesis || 'Vamos parar aqui. Você pode voltar ao livro sem precisar concluir esta conversa.',
        replies: plan.replies || mindJourneyClosingReplies,
      },
    ]);
  };

  const buildMindIntentMessages = (
    triad: typeof mindTriads[number],
    territory: typeof mindTriads[number]['territories'][number],
    intent: MindEntryIntent,
    diaryLead: string,
    firstTriageQuestion: MindMessage | null,
  ): MindMessage[] => {
    const protocol = getOfficialMindPillarProtocol(territory.pillarIndex);
    const finalPillar = getFinalMindPillar(territory.pillarIndex);
    const chapter = bookChapters[chapterIndexForPillar(territory.pillarIndex)];
    const pillarTitle = finalPillar?.title || territory.label;
    const thesis = finalPillar?.thesis || protocol?.identity.explains || 'um dilema do livro que pede leitura sem pressa';
    const movement = finalPillar?.centralMovement || protocol?.identity.dilemma || territory.limiar;
    const canonicalExcerpt = chapter?.content?.find((paragraph) => paragraph.trim().length >= 60);

    if (intent === 'understand') {
      return [
        {
          id: `intent-understand-${territory.pillarIndex}-intro`,
          from: 'agent',
          kind: 'intro',
          text: `Vamos entender o trecho antes de falar sobre você. ${pillarTitle} pertence à tríade ${triad.title} e trabalha este limiar: ${territory.limiar}.`,
        },
        {
          id: `intent-understand-${territory.pillarIndex}-explain`,
          from: 'agent',
          kind: 'plan',
          text: `${canonicalExcerpt
            ? `No capítulo “${chapter?.title}”, o texto diz: “${trimExcerpt(repairMojibake(canonicalExcerpt), 360)}”`
            : `O capítulo “${chapter?.title || pillarTitle}” é a referência para este território.`}\n\nA lente de acompanhamento do iGent organiza esse trecho assim: ${thesis} O movimento proposto é ${movement}.\n\nA primeira parte vem do livro; a lente do iGent não é uma citação nem uma interpretação sobre você.`,
          replies: ['Ver exemplo cotidiano', 'Isso aparece na minha vida', 'Voltar ao trecho'],
        },
      ];
    }

    if (intent === 'act') {
      return [
        {
          id: `intent-act-${territory.pillarIndex}-intro`,
          from: 'agent',
          kind: 'intro',
          text: `Você não precisa conversar longamente agora. Podemos transformar ${territory.label} em um próximo movimento pequeno e reversível.`,
        },
        {
          id: `intent-act-${territory.pillarIndex}-choice`,
          from: 'agent',
          kind: 'plan',
          text: `Escolha só um caminho. Nada aqui bloqueia sua leitura e nenhuma prática interrompida vira fracasso.`,
          replies: ['Escrever por dois minutos', 'Fazer uma âncora breve', 'Guardar para retomar depois', 'Voltar ao trecho'],
        },
      ];
    }

    return [
      {
        id: `intent-reflect-${territory.pillarIndex}-intro`,
        from: 'agent',
        kind: 'intro',
        text: diaryLead,
      },
      firstTriageQuestion ?? {
        id: `intent-reflect-${territory.pillarIndex}-question`,
        from: 'agent',
        text: chapter?.content?.[0] || 'O que esse trecho toca em você agora?',
      },
    ];
  };

  const startMindTerritorySession = (
    triad: typeof mindTriads[number],
    territory: typeof mindTriads[number]['territories'][number],
    intent: MindEntryIntent = selectedMindEntryIntent,
  ) => {
    const snapshot = buildPillarDiarySnapshot(territory.pillarIndex);
    const firstTriageQuestion = buildMindTriageMessage(territory.pillarIndex, 0);
    const protocol = getOfficialMindPillarProtocol(territory.pillarIndex);
    const chapterIndex = chapterIndexForPillar(territory.pillarIndex);
    if (intent === 'continue') {
      playClick('soft');
      goToChapter(chapterIndex);
      return;
    }
    const topic = {
      id: `pilar-${territory.pillarIndex + 1}-${audioTrackKey(territory.label)}`,
      title: territory.label,
      icon: territory.icon,
      color: triad.color,
      pillarIndex: territory.pillarIndex,
      audioUrl: mindTerritoryAudioUrls[territory.pillarIndex] || selectedChapter.audioUrl,
    };
    const diaryLead = snapshot.hasAnswers
      ? `Li o que você escreveu sobre ${territory.label}. ${snapshot.repeatedWord ? `Tem uma palavra que voltou mais de uma vez: "${snapshot.repeatedWord}".` : 'Tem uma tensão ali que merece ser olhada com calma.'} Vou fazer até três movimentos e depois organizar o que apareceu.`
      : `${territory.label} é um território difícil de começar — porque ele pede que você pare de explicar e repare onde isso toca. Vou fazer até três movimentos e depois organizar o que apareceu.`;

    playClick('primary');
    setSelectedMindTriadId(triad.id);
    setSelectedMindEntryIntent(intent);
    setActiveMindEntryIntent(intent);
    setActiveMindPillarIndex(territory.pillarIndex);
    setActiveMindTriageStep(0);
    setActiveMindTriageAnswers([]);
    const initialMindState = createInitialReaderMindState({
      readerId: authUser?.id || readerName,
      pillarId: protocol?.identity.id || territory.label,
      phase: getMindTriageQuestions(territory.pillarIndex)[0]?.phase || 'consciousness',
      questionId: firstTriageQuestion?.id,
    });
    const localSessionId = `mind_${Date.now()}`;
    setActiveReaderMindState(initialMindState);
    setActiveSessionMemory(createSessionMemory({
      readerId: authUser?.id || readerName,
      sessionId: localSessionId,
      pillarId: initialMindState.current_pillar_id,
      phase: initialMindState.current_phase,
      questionId: initialMindState.current_question_id,
      readerState: initialMindState.global_state,
      depth: initialMindState.depth_level,
      load: initialMindState.load_level,
      readiness: initialMindState.readiness_level,
    }));
    setActiveDecisionResult(null);
    setActiveSafetyAssessment(null);
    setMindTriageComplete(intent !== 'reflect');
    setActiveMentorTopic(topic);
    setMindStep('chat');
    setMindInput('');
    setMindSessionId(undefined);
    setMindLoading(false);
    setPendingMindPrompt('');
    setPendingMindSource('workbook');
    setMindMessages([]);
    revealAgentMessages(buildMindIntentMessages(triad, territory, intent, diaryLead, firstTriageQuestion));
    navigate(ROUTES.IGENT);
  };

  const startMindSession = (topic: typeof mentorTopics[number], prompt = '', source: MindSavedPlan['source'] = 'chat') => {
    const guide = getMindGuide(topic);
    setActiveMindPillarIndex(topic.pillarIndex);
    setActiveMindTriageStep(0);
    setActiveMindTriageAnswers([]);
    setActiveReaderMindState(null);
    setActiveSessionMemory(null);
    setActiveDecisionResult(null);
    setActiveSafetyAssessment(null);
    setMindTriageComplete(true);
    setActiveMentorTopic(topic);
    setMindStep('chat');
    setMindInput('');
    setMindSessionId(undefined);
    setMindLoading(false);
    setPendingMindPrompt(prompt);
    setPendingMindSource(source);
    setMindMessages([]);
    revealAgentMessages([
      {
        id: `${topic.id}-intro`,
        from: 'agent',
        kind: 'intro',
        text: guide.opening,
      },
      {
        id: `${topic.id}-question`,
        from: 'agent',
        text: guide.firstQuestion,
      },
    ]);
    navigate(ROUTES.IGENT);
    handlePlayAudio(topic.audioUrl, topic.title);
  };

  const buildMindContext = (readerText: string, source: MindSavedPlan['source']) => {
    const contextPillarIndex = activeMindPillarIndex ?? workbookPillarIndex;
    const contextPillar = workbookPillars[contextPillarIndex] ?? workbookPillars[0];
    const contextTriad = mindTriads.find((triad) => triad.id === selectedMindTriadId) ?? mindTriads[0];
    const contextTerritory = contextTriad.territories.find((territory) => territory.pillarIndex === contextPillarIndex);
    const contextProtocol = getOfficialMindPillarProtocol(contextPillarIndex);
    const currentFinalPillar = getFinalMindPillar(contextPillarIndex);
    const locale = typeof navigator !== 'undefined' ? navigator.language || 'pt-BR' : 'pt-BR';
    const currentLoad = activeMindTriageAnswers.reduce((total, answer) => total + (answer.load || 1), 0);
    const currentAnswers = contextPillar.questions
      .map((question, index) => ({
        question,
        answer: workbookAnswers[`${contextPillarIndex}-${index}`] || '',
      }))
      .filter((item) => item.answer.trim())
      .slice(0, 6);
    const canonicalJournal = effectiveCanonicalBookChapters
      .flatMap((chapter) => (chapter.journalPrompts ?? []).map((prompt) => ({
        chapterId: chapter.id,
        chapter: chapter.title,
        prompt: prompt.text,
        answer: canonicalJournalAnswers[prompt.id] || '',
      })))
      .filter((item) => item.answer.trim())
      .slice(-12)
      .map((item) => ({ ...item, answer: trimExcerpt(item.answer, 420) }));

    const favoriteChapters = bookChapters
      .filter((chapter) => favorites.includes(chapter.id))
      .slice(-8)
      .map((chapter) => ({
        id: chapter.id,
        title: repairMojibake(chapter.title),
        summary: trimExcerpt(repairMojibake(chapter.summary), 160),
      }));
    const agentMemoryContext = buildAgentMemoryContext({
      session: activeSessionMemory,
      pillar: null,
      journey: null,
    });
    const currentSafetyAssessment = assessSafety({
      current_text: readerText,
      recent_interactions: activeSessionMemory?.recent_interactions || [],
      current_load: activeReaderMindState?.load_level || 1,
      current_reader_state: activeReaderMindState?.global_state || 'unmapped',
      detected_categories: activeSafetyAssessment ? [activeSafetyAssessment.category, ...activeSafetyAssessment.secondary_categories] : [],
      locale,
    });
    return {
      readerName,
      source,
      topic: activeMentorTopic.title,
      input: readerText,
      privacy: mindDataScopes,
      mindFlow: {
        entryIntent: activeMindEntryIntent,
        entryIntentRule: 'understand explica o livro sem criar sinais do leitor; reflect usa triagem reflexiva; act oferece um proximo movimento breve; continue retorna ao livro.',
        journeyContract: {
          maximumGuidedTurns: MIND_GUIDED_MAX_TURNS,
          openAnswerHasPriority: true,
          semanticLabelsAreInternal: true,
          synthesisIsRequired: true,
          readerCanStopAtAnyTime: true,
        },
        canonicalSchema: {
          source: 'canonical_book',
          title: 'O Poder dos Desacreditados',
          layerRule: 'O livro é a fonte autoral. O iGent apenas acompanha a leitura e não apresenta conteúdo complementar como citação do livro.',
          currentChapter: {
            id: bookChapters[chapterIndexForPillar(contextPillarIndex)]?.id,
            title: bookChapters[chapterIndexForPillar(contextPillarIndex)]?.title,
          },
          currentPillar: currentFinalPillar ? {
            id: currentFinalPillar.id,
            ordinal: currentFinalPillar.ordinal,
            title: currentFinalPillar.title,
            triad: currentFinalPillar.triad,
            threshold: currentFinalPillar.threshold,
            thesis: currentFinalPillar.thesis,
            centralMovement: currentFinalPillar.centralMovement,
          } : null,
        },
        readerMindState: activeReaderMindState ? {
          current_phase: activeReaderMindState.current_phase,
          global_state: activeReaderMindState.global_state,
          readiness_level: activeReaderMindState.readiness_level,
          load_level: activeReaderMindState.load_level,
          depth_level: activeReaderMindState.depth_level,
        } : null,
        decisionEngine: activeDecisionResult ? {
          action: activeDecisionResult.action,
          selected_intervention: activeDecisionResult.selected_intervention,
          selected_depth: activeDecisionResult.selected_depth,
          should_ask_question: activeDecisionResult.should_ask_question,
          blocked_actions: activeDecisionResult.blocked_actions,
        } : null,
        safetyAssessment: currentSafetyAssessment,
        safetyFlow: activeDecisionResult ? applySafetyProtocol(currentSafetyAssessment, activeDecisionResult) : null,
        memoryContext: agentMemoryContext,
        triad: contextTriad.title,
        territory: contextTerritory?.label || contextPillar.title,
        limiar: contextTerritory?.limiar || contextPillar.subtitle,
        explains: contextProtocol?.identity.explains,
        dilemma: contextProtocol?.identity.dilemma,
        triageComplete: mindTriageComplete,
        triageAnswers: activeMindTriageAnswers.slice(-MIND_GUIDED_MAX_TURNS).map((answer) => ({
          question: answer.question,
          option: answer.option,
          open_answer: answer.open_answer,
          phase: answer.phase,
        })),
        sessionMemory: {
          current_question: getMindTriageQuestions(contextPillarIndex)[activeMindTriageStep]?.id,
          selected_option: activeMindTriageAnswers.at(-1)?.semantic_position,
          current_load: currentLoad,
        },
        rule: 'No máximo uma pergunta por resposta. Não aconselhar, motivar ou concluir pelo leitor. Não reabrir a triagem depois da síntese.',
      },
      readingState: mindDataScopes.readingProgress ? {
        route,
        page: pdfPage,
        progress: Math.round(readProgress * 100),
        currentGroup: currentGroup?.title,
      } : undefined,
      currentChapter: mindDataScopes.readingProgress ? {
        id: selectedChapter.id,
        title: repairMojibake(selectedChapter.title),
        summary: trimExcerpt(repairMojibake(selectedChapter.summary), 260),
        pdfPage,
      } : undefined,
      workbook: mindDataScopes.diary ? {
        currentPillar: contextPillar.title,
        currentPillarSubtitle: contextPillar.subtitle,
        freeWriting: trimExcerpt(workbookEntry, 320),
        answers: currentAnswers,
      } : undefined,
      canonicalJournal: mindDataScopes.caderno ? canonicalJournal : undefined,
      letters: mindDataScopes.letters ? Object.entries(readerLetters)
        .filter(([, value]) => value.trim())
        .slice(-3)
        .map(([key, value]) => ({ key, excerpt: trimExcerpt(value, 220) })) : undefined,
      notes: mindDataScopes.notes ? readerNotes
        .filter((note) => note.note.trim())
        .slice(-5)
        .map((note) => ({ page: note.page, title: note.title, excerpt: trimExcerpt(note.note, 220) })) : undefined,
      anchors: mindDataScopes.anchors ? readerAnchors
        .filter((anchor) => anchor.title.trim() || anchor.content.trim())
        .slice(-6)
        .map((anchor) => ({
          title: anchor.title,
          content: trimExcerpt(anchor.content, 180),
          pillar: anchor.pillar,
          status: anchor.status,
        })) : undefined,
      bookmarks: mindDataScopes.notes ? readerNotes
        .filter((note) => note.note.trim() || note.id.startsWith('page-'))
        .slice(-8)
        .map((note) => ({ page: note.page, title: note.title || `Pagina ${note.page}` })) : undefined,
      favorites: mindDataScopes.readingProgress ? favoriteChapters : undefined,
      pageNote: mindDataScopes.notes && currentPageNote?.note ? trimExcerpt(currentPageNote.note, 260) : '',
      audioProgress: mindDataScopes.readingProgress ? Object.fromEntries(
        Object.entries(audioProgressMap)
          .sort(([, a], [, b]) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
          .slice(0, 24),
      ) : undefined,
      audioState: mindDataScopes.readingProgress ? {
        currentUrl: audioState.currentUrl,
        title: audioState.title,
        isPlaying: audioState.isPlaying,
        currentTime: Math.round(audioState.currentTime || 0),
        duration: Math.round(audioState.duration || 0),
        heardCount: heardAudioCount,
        totalTracks: totalAudioTracks,
      } : undefined,
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
    if (!value || mindLoading || mindTyping || !mindTriageComplete) return;
    const locale = typeof navigator !== 'undefined' ? navigator.language || 'pt-BR' : 'pt-BR';
    const safetyAssessment = assessSafety({
      current_text: value,
      recent_interactions: activeSessionMemory?.recent_interactions || [],
      current_load: activeReaderMindState?.load_level || 1,
      current_reader_state: activeReaderMindState?.global_state || 'unmapped',
      detected_categories: [],
      locale,
    });
    setActiveSafetyAssessment(safetyAssessment);
    if (safetyAssessment.level >= 2) {
      const safeText = buildSafetyResponseText(safetyAssessment, safetyResourcesByLocale[locale]);
      playClick('soft');
      clearMindTimers();
      setMindInput('');
      setMindTyping(false);
      setMindLoading(false);
      setMindMessages((current) => [
        ...current.map((message) => ({ ...message, replies: undefined })),
        { id: `user-${Date.now()}`, from: 'user', text: value },
        { id: `agent-safety-${Date.now()}`, from: 'agent', kind: 'plan', text: safeText },
      ]);
      setActiveSessionMemory((current) => current
        ? {
            ...current,
            current_reader_state: 'overloaded',
            current_depth: 0,
            current_load: Math.max(current.current_load, 3) as 3 | 4,
            recent_interactions: [...current.recent_interactions, 'Evento de seguranca: fluxo reflexivo bloqueado'].slice(-6),
            updated_at: new Date().toISOString(),
          }
        : current);
      return;
    }
    const localPillarIndex = activeMindPillarIndex ?? activeMentorTopic.pillarIndex;
    const localProtocol = getOfficialMindPillarProtocol(localPillarIndex);
    const localFinalPillar = getFinalMindPillar(localPillarIndex);
    const localResponse = buildLocalMindResponse({
      intent: activeMindEntryIntent,
      pillarIndex: localPillarIndex,
      territory: localFinalPillar?.title || activeMentorTopic.title,
      message: value,
      thesis: localFinalPillar?.thesis || localProtocol?.identity.explains,
      movement: localFinalPillar?.centralMovement || localProtocol?.identity.dilemma,
      counterpoint: getMindGuide().counterpoint,
      practice: getMindGuide().practice,
      turnCount: mindMessages.filter((message) => message.from === 'user').length,
    });
    const history = mindMessages
      .filter((message) => message.text.trim())
      .slice(-10)
      .map((message) => ({
        role: message.from === 'user' ? 'user' as const : 'assistant' as const,
        content: message.text,
      }));
    playClick('primary');
    clearMindTimers();
    setMindInput('');
    setMindLoading(true);
    setMindTyping(true);
    setActiveSessionMemory((current) => {
      if (!current) return current;
      return {
        ...current,
        current_open_response: value,
        recent_interactions: [
          ...current.recent_interactions,
          `Resposta livre -> ${value}`,
        ].slice(-6),
        updated_at: new Date().toISOString(),
      };
    });
    setMindMessages((current) => [
      ...current.map((message) => ({ ...message, replies: undefined })),
      { id: `user-${Date.now()}`, from: 'user', text: value },
    ]);

    try {
      const response = await sendMindMessage({
        sessionId: mindSessionId,
        topic: activeMentorTopic.title,
        source: pendingMindSource,
        message: value,
        messages: history,
        context: buildMindContext(value, pendingMindSource),
      });
      setMindSessionId(response.sessionId);
      saveMindPlan(activeMentorTopic, value, response.message, pendingMindSource);
      setMindMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          from: 'agent',
          kind: 'plan',
          text: response.fallback
            ? `${localResponse.text}\n\nNo momento, estou usando o modo guiado local enquanto a IA conectada não responde.`
            : response.message,
          replies: response.fallback ? localResponse.replies : undefined,
          references: response.references,
        },
      ]);
    } catch (error) {
      const localModeReason = error instanceof Error && error.message.includes('conta online')
        ? 'Você está usando um acesso local. Para conversar com o Gemini, entre com uma conta online que tenha o iGent liberado.'
        : 'A conexão com a IA não respondeu; a conversa continua no modo guiado local.';
      saveMindPlan(activeMentorTopic, value, localResponse.text, pendingMindSource);
      setMindMessages((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          from: 'agent',
          kind: 'plan',
          text: `${localResponse.text}\n\n${localModeReason}`,
          replies: localResponse.replies,
        },
      ]);
    } finally {
      setMindTyping(false);
      setMindLoading(false);
    }
  };

  useEffect(() => {
    if (mindStep !== 'chat' || mindTyping || !pendingMindPrompt.trim()) return;
    const prompt = pendingMindPrompt;
    window.setTimeout(() => answerMind(prompt), 180);
    setPendingMindPrompt('');
  }, [mindStep, mindTyping, pendingMindPrompt]);

  const handleMindQuickReply = (reply: string) => {
    const normalizedReply = normalizeForSearch(reply);
    const appendLocalMindTurn = (agentText: string, replies?: string[]) => {
      playClick('soft');
      setMindMessages((current) => [
        ...current.map((message) => ({ ...message, replies: undefined })),
        { id: `user-quick-${Date.now()}`, from: 'user', text: reply },
        { id: `agent-quick-${Date.now()}`, from: 'agent', kind: 'plan', text: agentText, replies },
      ]);
    };

    if (normalizedReply.includes('voltar ao trecho') || normalizedReply.includes('continuar lendo')) {
      const chapterIndex = activeMindPillarIndex != null ? chapterIndexForPillar(activeMindPillarIndex) : getMindGuide().chapterHint;
      goToChapter(chapterIndex);
      return;
    }
    if (normalizedReply.includes('levar para o diario') || normalizedReply.includes('escrever no diario')) {
      const pillarIndex = activeMindPillarIndex ?? workbookPillarIndex;
      const pillarTitle = getOfficialMindPillarProtocol(pillarIndex)?.identity.title || activeMentorTopic.title;
      const selectedLines = activeMindTriageAnswers
        .slice(-MIND_GUIDED_MAX_TURNS)
        .map((answer) => `• ${answer.open_answer || answer.option}`)
        .join('\n');
      const draft = [
        `Fio trazido do iGent — ${pillarTitle}`,
        selectedLines || 'Parei antes de responder. Quero começar daqui com minhas palavras.',
        'O que eu quero escrever a partir disso:',
      ].join('\n\n');
      setWorkbookPillarIndex(pillarIndex);
      setWorkbookEntry((current) => current.trim() ? `${current.trim()}\n\n---\n\n${draft}` : draft);
      navigate(ROUTES.WORKBOOK);
      return;
    }
    if (normalizedReply.includes('conversar com minhas palavras')) {
      appendLocalMindTurn(
        'Pode escrever do seu jeito. Eu vou responder ao que você disser agora, sem reabrir o questionário e sem transformar sua frase em diagnóstico.',
      );
      return;
    }
    if (normalizedReply.includes('encerrar por agora')) {
      appendLocalMindTurn(
        'Encerramos por aqui. Nada ficou em dívida. Quando quiser voltar, o livro, o Diário e esta conversa continuam sendo caminhos separados — você escolhe qual deles ajuda.',
        ['Voltar ao trecho'],
      );
      return;
    }
    if (normalizedReply.includes('fazer uma ancora breve') || normalizedReply.includes('fazer uma âncora breve')) {
      const territory = activeMindPillarIndex != null
        ? getOfficialMindPillarProtocol(activeMindPillarIndex)?.identity.title || activeMentorTopic.title
        : activeMentorTopic.title;
      const now = new Date().toISOString();
      const anchor: ReaderAnchor = {
        id: `anchor-${Date.now()}`,
        type: 'brief_anchor',
        title: `Âncora breve - ${territory}`,
        content: 'Eu posso reconhecer isso sem resolver agora.',
        pillar: territory,
        status: 'started',
        createdAt: now,
        updatedAt: now,
      };
      setReaderAnchors((current) => {
        const next = [...current, anchor].slice(-80);
        saveLocalReaderAnchors(next);
        return next;
      });
      appendLocalMindTurn(
        `Vamos fazer uma âncora breve em ${territory}.\n\nPor alguns segundos, não tente entender tudo. Escolha uma frase pequena e observe onde ela toca no corpo:\n\n"Eu posso reconhecer isso sem resolver agora."\n\nSe pesar, pare aqui e volte ao trecho. Interromper também é um jeito de se cuidar.`,
        ['Voltar ao trecho', 'Guardar para retomar depois'],
      );
      return;
    }
    if (normalizedReply.includes('escrever por dois minutos')) {
      appendLocalMindTurn(
        'Escreva por dois minutos sem tentar organizar bonito.\n\nComece por: "Neste trecho, o que ficou em mim foi..."\n\nEsse escrito é privado. Ele só vira memória se você decidir guardar depois.',
        ['Guardar para retomar depois', 'Voltar ao trecho'],
      );
      return;
    }
    if (normalizedReply.includes('guardar para retomar depois')) {
      appendLocalMindTurn(
        'Tudo bem. Vou tratar isso como um fio aberto, não como conclusão.\n\nQuando você voltar, retomamos pelo mesmo território e sem cobrança de continuidade perfeita.',
        ['Voltar ao trecho'],
      );
      return;
    }
    if ((normalizedReply.includes('isso aparece na minha vida') || normalizedReply.includes('comecar reflexao')) && activeMindPillarIndex != null) {
      const firstQuestion = buildMindTriageMessage(activeMindPillarIndex, activeMindTriageStep);
      setActiveMindEntryIntent('reflect');
      setMindTriageComplete(false);
      if (firstQuestion) {
        revealAgentMessages([
          {
            id: `agent-shift-reflect-${Date.now()}`,
            from: 'agent',
            kind: 'intro',
            text: 'Então saímos da explicação do livro e entramos na reflexão. Uma pergunta por vez, e você pode parar quando quiser.',
          },
          firstQuestion,
        ], 360, 820);
      }
      return;
    }
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
                <p className="kicker">Seguran?a da conta</p>
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
          <Button
            onClick={authMode === 'register' ? handleRegisterSubmit : handleLoginSubmit}
            className={`cover-primary ${authSubmitting ? 'is-loading' : ''}`}
            disabled={authSubmitting}
            aria-busy={authSubmitting}
          >
            {authSubmitting && <span className="button-spinner" aria-hidden="true" />}
            {authSubmitting ? (authMode === 'register' ? 'Criando acesso...' : 'Entrando...') : (authMode === 'register' ? 'Criar acesso' : 'Entrar')}
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
              <span>Baixe o livro e volte para destravar app, Áudios, Diário e iGentMIND quando seu pedido incluir esses módulos.</span>
            </div>
            <div className="home-card-actions">
              <Button onClick={() => window.open(pdfUrl, '_blank')}><DownloadCloud size={17} /> Baixar PDF</Button>
            </div>
          </section>

          <section className="unlock-strip">
            <div>
              <p className="kicker">Próximo nível</p>
              <h2>Livro interativo, Áudios e Biblioteca</h2>
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
          <Button onClick={() => { setReaderInitialMode('text'); navigate(ROUTES.READER); }} className="cover-primary">Ler agora</Button>
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
            <button
              onClick={() => {
                playAudioQueueItem(latestAudioResume.item, { resume: true });
                const chapter = bookChapters[latestAudioResume.item.chapterIndex];
                if (chapter) {
                  setCurrentChapterIndex(latestAudioResume.item.chapterIndex);
                  goToPdfPage(chapter.pdfPage);
                  setPageIndex(0);
                }
                setReaderInitialMode('text');
                navigate(ROUTES.READER);
              }}
            >
              <Play size={13} fill="currentColor" />
            </button>
          </div>
        )}
        {selectedReadingTrack && (
          <div className={`home-reading-track-strip ${ambientAudioState.currentUrl === selectedReadingTrack.audioUrl && ambientAudioState.isPlaying ? 'playing' : ''}`}>
            <button className="home-track-visual" onClick={toggleSelectedSensoryTrack} title="Tocar trilha de leitura">
              <span />
              <span />
              <span />
              <span />
            </button>
            <div>
              <strong>Trilha de leitura</strong>
              <small>{repairMojibake(selectedReadingTrack.title)}</small>
            </div>
            <button className="home-track-play" onClick={toggleSelectedSensoryTrack} title={ambientAudioState.isPlaying ? 'Pausar trilha' : 'Tocar trilha'}>
              {ambientAudioState.currentUrl === selectedReadingTrack.audioUrl && ambientAudioState.isPlaying ? <Pause size={15} /> : <Play size={14} fill="currentColor" />}
            </button>
          </div>
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
          <span>Áudios ouvidos</span>
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
          Ouvir reflex?o
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

  const downloadBookPdf = () => {
    const anchor = document.createElement('a');
    anchor.href = pdfUrl;
    anchor.download = 'o-poder-dos-desacreditados.pdf';
    anchor.rel = 'noopener';
    anchor.click();
  };

  const BookView = () => (
    <div className="book-stage book-hub-page page-enter">
      <section className="book-hero-3d" aria-label="Escolha de leitura do livro">
        <div className="book-3d-stage">
          <div className="book-3d-object" tabIndex={0} aria-label="Capa interativa do livro">
            <div className="book-3d-cover book-3d-front">
              <img src="/media/imagens/capas/capa.webp" alt="Capa do livro O Poder dos Desacreditados" />
            </div>
            <div className="book-3d-spine" aria-hidden="true" />
            <div className="book-3d-cover book-3d-back">
              <div className="book-back-text">
                <p>O mundo costuma valorizar quem chega. Pouco se fala sobre quem continua. Este livro ? para quem seguiu mesmo sem aplauso, mesmo sem clareza, mesmo sem reconhecimento.</p>
                <p>Para quem atravessou quedas silenciosas, carregou dúvidas por dentro e, ainda assim, permaneceu. O Poder dos Desacreditados não oferece promessas rápidas nem soluções prontas. Ele oferece algo mais raro: presença.</p>
                <p>Aqui, a dor não vira espetáculo. O cansaço não vira fracasso. E continuar não é tratado como fraqueza. Este não é um livro sobre vencer. É um livro sobre não se abandonar.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="book-hub-copy">
          <p className="kicker">Livro</p>
          <h1>O Poder dos Desacreditados</h1>
          <p>Escolha como quer atravessar a obra agora: leitura interativa, e-book em PDF ou arquivo para baixar.</p>
        </div>
      </section>
      <div className="book-action-grid">
        <Button onClick={() => { setReaderInitialMode('text'); navigate(ROUTES.READER); }} className="cover-primary"><BookOpen size={19} /> Leitura interativa</Button>
        <Button onClick={() => { setReaderInitialMode('edition'); navigate(ROUTES.READER); }} variant="secondary"><BookOpen size={18} /> E-book PDF</Button>
        <Button onClick={downloadBookPdf} variant="ghost"><DownloadCloud size={18} /> Baixar livro PDF</Button>
      </div>
      <button className="cover-link book-summary-link" onClick={() => navigate(ROUTES.LIBRARY)}><Boxes size={17} /> Abrir sumário completo</button>
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
                      <span className="contents-number">{chapter.roman ? chapter.roman : String(index + 1).padStart(2, '0')}</span>
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
          <h1>Áudios de apoio</h1>
          <span>Falas e conteúdos curtos para Sobrevivência, Reconstrução, Continuidade e novos apoios.</span>
        </div>
      </div>
      <section className="session-grid">
        {supportAudios.map((item) => (
          <article key={item.id} className="session-card">
            <span>áudio de apoio</span>
            <h2>{repairMojibake(item.title)}</h2>
            <p>{repairMojibake(item.text)}</p>
            <div className="session-actions">
              <button onClick={() => handlePlayAudio(item.audioUrl, repairMojibake(item.title), item.coverUrl)}><ListMusic size={16} /> Ouvir agora</button>
            </div>
          </article>
        ))}
      </section>
      <div className="page-heading compact-heading">
        <div>
          <p className="kicker">Leitura</p>
          <h1>Trilhas de leitura</h1>
          <span>Músicas ambiente que o leitor escolhe e aciona pelo ícone no rodap? da página.</span>
        </div>
      </div>
      <section className="session-grid">
        {sensoryPlaylist.map((item) => (
          <article key={item.id} className={`session-card ${selectedSensoryTrackId === item.id ? 'active' : ''}`}>
            <span>{selectedSensoryTrackId === item.id ? 'Selecionada' : 'Trilha de leitura'}</span>
            <h2>{repairMojibake(item.title)}</h2>
            <p>{repairMojibake(item.text)}</p>
            <div className="session-actions">
              <button onClick={() => selectSensoryTrack(item, false)}><CheckCircle2 size={16} /> Usar na leitura</button>
              <button onClick={() => selectSensoryTrack(item, true)}><ListMusic size={16} /> Testar trilha</button>
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
    const selectedMindTriad = mindTriads.find((triad) => triad.id === selectedMindTriadId) ?? mindTriads[0];
    const chatChapterIndex = activeMindPillarIndex != null ? chapterIndexForPillar(activeMindPillarIndex) : guide.chapterHint;
    const chatTriadTitle = mindTriads.find((triad) => triad.id === selectedMindTriadId)?.title;
    const chatTerritory = activeMindPillarIndex != null
      ? selectedMindTriad.territories.find((territory) => territory.pillarIndex === activeMindPillarIndex)
      : null;
    const chatSnapshot = activeMindPillarIndex != null ? buildPillarDiarySnapshot(activeMindPillarIndex) : null;
    const chatChapter = bookChapters[chatChapterIndex] ?? bookChapters[guide.chapterHint];
    const chatContextLabel = chatSnapshot?.hasAnswers
      ? `${chatSnapshot.answers.length} resposta${chatSnapshot.answers.length > 1 ? 's' : ''} do Diário`
      : activeMindPillarIndex != null
        ? 'sem resposta salva'
        : 'triagem livre';
    const activeTriageQuestions = getMindTriageQuestions(activeMindPillarIndex);
    const activeTriageQuestion = activeTriageQuestions[activeMindTriageStep];
    const activeTriagePhase = MIND_PHASES.find((phase) => phase.id === activeTriageQuestion?.phase);
    const triageTotal = Math.min(activeTriageQuestions.length, MIND_GUIDED_MAX_TURNS);
    const triageProgress = triageTotal ? Math.min(100, Math.round((activeMindTriageAnswers.length / triageTotal) * 100)) : 100;
    const triageStepLabel = triageTotal
      ? mindTriageComplete
        ? 'síntese pronta'
        : `${Math.min(activeMindTriageAnswers.length + 1, triageTotal)} de até ${triageTotal}`
      : 'livre';
    const activeIntentMeta = mindEntryIntents.find((intent) => intent.id === activeMindEntryIntent) ?? mindEntryIntents[1];
    const chatModeLabel = activeMindEntryIntent === 'understand'
      ? 'Ajuda contextual'
      : activeMindEntryIntent === 'act'
        ? 'Próximo movimento'
        : 'Reflexão guiada';
    return (
      <div className="app-page page-enter">
        {mindStep === 'select' ? (
          <>
            <section className="igent-head">
              <p className="kicker">iGentMIND</p>
              <h1>Onde você está agora?</h1>
              <span>Não escolha um pilar. Escolha o estado que mais parece com o que está acontecendo por dentro.</span>
              <small>{mindServiceStatus && mindServiceStatus !== 'local'
                ? `IA conectada: ${mindServiceStatus === 'openai' ? 'OpenAI' : 'Gemini'} · segurança no servidor`
                : 'Modo guiado local · conecte um provedor de IA no backend para respostas gerativas'}</small>
            </section>
            <section className="mind-intent-panel" aria-label="Privacidade do contexto">
              <div className="mind-flow-topline">
                <span>O que o agente pode consultar nesta conversa?</span>
                <small>Você controla</small>
              </div>
              <p>O livro canônico é sempre usado. Seus escritos privados só entram no contexto quando marcados abaixo.</p>
              <div className="mind-replies">
                {MIND_SCOPE_OPTIONS.map((scope) => (
                  <label key={scope.key} className="mind-privacy-option">
                    <input
                      type="checkbox"
                      checked={mindDataScopes[scope.key]}
                      onChange={(event) => setMindDataScopes((current) => ({
                        ...current,
                        [scope.key]: event.target.checked,
                      }))}
                    />
                    <span>{scope.label}</span>
                  </label>
                ))}
              </div>
            </section>
            {mindSavedPlan && (
              <section className="igent-answer mind-last-plan">
                <Brain size={22} />
                <div>
                  <h2>Continuar de onde parou</h2>
                  <p>{repairMojibake(mindSavedPlan.response)}</p>
                  <div className="mind-replies">
                    <button onClick={() => startMindSession(
                      mentorTopics.find((topic) => topic.id === mindSavedPlan.topicId) || activeMentorTopic,
                      `Retome esta conversa e me devolva apenas uma pergunta que aprofunde o que apareceu: ${repairMojibake(mindSavedPlan.response)}`,
                      'chat',
                    )}>Retomar conversa</button>
                    <button onClick={() => goToChapter(mindSavedPlan.chapterIndex)}>Abrir trecho</button>
                  </div>
                </div>
              </section>
            )}
            <section className="mind-triad-panel">
              <div className="mind-flow-topline">
                <span>Escolha um estado</span>
                <small>Passo 1 de 4</small>
              </div>
              <div className="mind-triad-grid">
                {mindTriads.map((triad) => {
                  const active = selectedMindTriad.id === triad.id;
                  return (
                    <button
                      key={triad.id}
                      className={active ? 'mind-triad-card active' : 'mind-triad-card'}
                      style={{ '--triad-color': triad.color } as any}
                      onClick={() => {
                        playClick('soft');
                        setSelectedMindTriadId(triad.id);
                      }}
                    >
                      <span>{triad.title}</span>
                      <strong>{triad.prompt}</strong>
                      <small>{triad.nuance}</small>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="mind-intent-panel">
              <div className="mind-flow-topline">
                <span>O que você precisa agora?</span>
                <small>Passo 2 de 4</small>
              </div>
              <div className="mind-intent-grid">
                {mindEntryIntents.map((intent) => (
                  <button
                    key={intent.id}
                    type="button"
                    className={selectedMindEntryIntent === intent.id ? 'mind-intent-card active' : 'mind-intent-card'}
                    onClick={() => {
                      playClick('soft');
                      setSelectedMindEntryIntent(intent.id);
                    }}
                  >
                    <small>{intent.label}</small>
                    <strong>{intent.title}</strong>
                    <span>{intent.description}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="mind-territory-panel">
              <div className="mind-flow-topline">
                <span>{selectedMindTriad.title}</span>
                <small>Passo 3 de 4 · qual dilema ressoa?</small>
              </div>
              <div className="mind-territory-list">
                {selectedMindTriad.territories.map((territory) => {
                  const Icon = territory.icon;
                  const snapshot = buildPillarDiarySnapshot(territory.pillarIndex);
                  const chapter = bookChapters[chapterIndexForPillar(territory.pillarIndex)];
                return (
                  <button
                    key={`${selectedMindTriad.id}-${territory.label}`}
                    className="mind-territory-card"
                    onClick={() => startMindTerritorySession(selectedMindTriad, territory, selectedMindEntryIntent)}
                  >
                    <Icon size={22} />
                    <span>
                      <strong>{territory.label}</strong>
                      <em>{territory.limiar}</em>
                    </span>
                    <small>{selectedMindEntryIntent === 'continue' ? 'abrir livro' : snapshot.hasAnswers ? 'com Diário' : 'primeira vez'}</small>
                    <i>{chapter?.title || `Pilar ${territory.pillarIndex + 1}`}</i>
                  </button>
                );
              })}
              </div>
            </section>
            <section className="igent-answer">
              <Brain size={22} />
              <div>
                <h2>Como ele funciona</h2>
                <p>O iGentMIND usa o livro como referência e só consulta escritos que você autorizar. Na reflexão, faz no máximo três movimentos, aceita resposta livre e termina com uma síntese. Você decide se volta ao livro, leva algo ao Diário ou encerra.</p>
              </div>
            </section>
          </>
        ) : (
          <section className="mind-chat-shell">
            <div className="mind-chat-status">
              <button className="mind-chat-icon-button" onClick={() => setMindStep('select')} aria-label="Voltar para a triagem">
                <ChevronLeft size={18} />
              </button>
              <div className="mind-chat-status-main">
                <p className="kicker">{chatModeLabel}</p>
                <h1>{activeMentorTopic.title}</h1>
                <div className="mind-context-chips">
                  <span>{chatTriadTitle || 'Triagem'}</span>
                  <span>{chatTerritory?.limiar || 'uma pergunta por vez'}</span>
                  <span>{activeIntentMeta.title}</span>
                  <span>{chatContextLabel}</span>
                  {activeMindEntryIntent === 'reflect' && <span>triagem {triageStepLabel}</span>}
                  {activeTriagePhase && <span>{activeTriagePhase.label}</span>}
                  {activeReaderMindState && <span>{READER_STATE_LABELS[activeReaderMindState.global_state]}</span>}
                </div>
                <div className="mind-triage-progress" aria-label={`Progresso da triagem ${triageProgress}%`}>
                  <span style={{ width: `${triageProgress}%` }}></span>
                </div>
              </div>
              <button className="mind-chat-pillar-button" onClick={() => goToChapter(chatChapterIndex)}>
                <FileText size={17} />
                <span>Pilar</span>
              </button>
            </div>

            <div className="mind-chat-context-card">
              <div>
                <NotebookPen size={18} />
                <span>Contexto carregado</span>
              </div>
              <p>
                {activeMindEntryIntent === 'understand'
                  ? `Modo explicação: o agente ajuda a compreender ${chatTerritory?.label || activeMentorTopic.title} sem criar sinais sobre você.`
                  : activeMindEntryIntent === 'act'
                    ? `Modo próximo movimento: escolha uma ação breve, pausa ou retorno ao livro.`
                    : chatSnapshot?.hasAnswers
                  ? `Li o Diário em ${chatSnapshot.pillar.title}${chatSnapshot.repeatedWord ? ` e encontrei uma palavra recorrente: "${chatSnapshot.repeatedWord}".` : '. Vou usar isso com cuidado, sem concluir por você.'}`
                  : activeMindPillarIndex != null
                    ? `Ainda não há resposta salva em ${chatSnapshot?.pillar.title || activeMentorTopic.title}. A conversa usa até três movimentos e termina com uma síntese que não substitui o livro.`
                    : `Esta conversa veio de uma entrada livre. O agente vai usar o que você escrever agora como contexto principal.`}
              </p>
              {chatChapter && <small>{repairMojibake(chatChapter.title)}</small>}
            </div>

            <div className="mind-chat-window" ref={mindChatWindowRef}>
              {mindMessages.map((message) => (
                <div key={message.id} className={`mind-message ${message.from} ${message.kind ?? ''}`}>
                  <div className="mind-avatar">{message.from === 'agent' ? <Brain size={18} /> : <Sparkles size={18} />}</div>
                  <div className="mind-bubble">
                    {repairMojibake(message.text).split('\n').map((line) => <p key={line}>{line}</p>)}
                    {message.references?.length ? (
                      <small className="mind-canonical-references">
                        Fonte no livro: {message.references.map((reference) => `${reference.chapterTitle} — ${reference.sectionTitle}`).join(' · ')}
                      </small>
                    ) : null}
                    {message.replies && (
                      <div className="mind-replies">
                        {message.replies.map((reply) => (
                          <button key={reply} onClick={() => handleMindQuickReply(repairMojibake(reply))}>{repairMojibake(reply)}</button>
                        ))}
                      </div>
                    )}
                    {message.triageOptions && (
                      <div className="mind-triage-choice">
                        <div className="mind-triage-options">
                          {message.triageOptions.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => selectMindTriageOption(option)}
                              disabled={mindTyping}
                            >
                              <strong>{option.label}</strong>
                            </button>
                          ))}
                        </div>
                        <button className="mind-triage-stop" type="button" onClick={finishMindTriage} disabled={mindTyping}>
                          Parar e organizar o que apareceu
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {mindTyping && (
                <div className="mind-message typing">
                  <div className="mind-avatar"><Brain size={18} /></div>
                  <div className="mind-bubble mind-typing-bubble" aria-label="iGentMIND digitando">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <form
              className="mind-compose"
              onSubmit={(event) => {
                event.preventDefault();
                if (mindTriageComplete) answerMind(mindInput);
                else submitOpenMindTriageAnswer(mindInput);
              }}
            >
              <input
                value={mindInput}
                onChange={(event) => setMindInput(event.target.value)}
                placeholder={mindTriageComplete ? 'Converse com suas palavras...' : 'Ou responda com suas próprias palavras...'}
                disabled={mindLoading || mindTyping}
              />
              <button type="submit" disabled={mindLoading || mindTyping || !mindInput.trim()}>{mindLoading || mindTyping ? 'Lendo...' : 'Enviar'}</button>
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
        chapterKind={selectedChapter.pillar ? `${repairMojibake(currentGroup.eyebrow)} - Pilar ${selectedChapter.roman}` : repairMojibake(currentGroup.eyebrow)}
        chapterSections={selectedChapter.sections}
        canonicalChapter={selectedCanonicalChapter}
        journalAnswers={canonicalJournalAnswers}
        onJournalAnswerChange={(promptId, value) => {
          setCanonicalJournalAnswers((current) => ({ ...current, [promptId]: value }));
        }}
        coverImageUrl="/media/imagens/capas/capa.webp"
        audioTracks={selectedChapterAudioTracks}
        pdfUrl={pdfUrl}
        pdfTextPages={mergedPdfTextPages}
        pdfPageTitles={bookPageTitleOverrides}
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
        audioCurrentTime={audioState.currentTime}
        audioDuration={audioState.duration}
        audioVolume={audioState.volume}
        audioPlaybackRate={audioState.playbackRate}
        audioFrequencies={audioFrequencies}
        onAudioSeek={seekAudio}
        onAudioVolumeChange={changeVolume}
        onAudioPlaybackRateChange={changePlaybackRate}
        onOpenAudioFullscreen={() => setAudioFullOpen(true)}
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
        onExitReader={() => {
          setAmbientPlayerCollapsed(true);
          navigate(ROUTES.HOME);
        }}
        showNarrationButton={showReaderNarrationButton}
        sensoryTrackTitle={selectedReadingTrack ? repairMojibake(selectedReadingTrack.title) : undefined}
        isSensoryTrackPlaying={Boolean(selectedReadingTrack && ambientAudioState.currentUrl === selectedReadingTrack.audioUrl && ambientAudioState.isPlaying)}
        onToggleSensoryTrack={toggleSelectedSensoryTrack}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        initialMode={readerInitialMode}
      />
    </div>
  );

  const LockedView = ({ title, offerKey = 'vip' }: { title: string; offerKey?: UpgradeKey }) => (
    <div className="app-page page-enter">
      <section className="locked-panel">
        <div className="mentor-mark"><Lock size={20} /></div>
        <p className="kicker">Funão extra</p>
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
    const linkedTopic = mentorTopics.find((topic) => topic.pillarIndex === workbookPillarIndex) ?? mentorTopics[0];
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
      handlePlayAudio(WORKBOOK_WELCOME_AUDIO, 'Boas-vindas ao Diário');
    };

    const enterWorkbook = () => {
      localStorage.setItem(WORKBOOK_INTRO_KEY, 'true');
      setWorkbookIntroDismissed(true);
    };

    const goToWorkbookPillar = (nextIndex: number) => {
      const safeIndex = clamp(nextIndex, 0, workbookPillars.length - 1);
      if (safeIndex === workbookPillarIndex) return;
      const phrase = safeIndex > workbookPillarIndex
      ? workbookTransitionPhrases[workbookPillarIndex] || 'Uma parte terminou. A próxima pergunta não cobra resposta pronta.'
      : 'Voltar também faz parte da jornada. Algumas respostas precisam ser reencontradas.';
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
        `Use toda a memória abaixo do meu Diário dos Desacreditados como contexto da próxima conversa. Responda como autor parceiro: primeiro diga o padrão que mais se repete na minha jornada, depois faça uma única pergunta que me ajude a continuar.\n\n${buildWorkbookJourneyText()}`,
        'workbook',
      );
    };

    if (!workbookIntroDismissed) {
      return (
        <div className="app-page workbook-page page-enter">
          <section className="workbook-welcome">
            <div className="mentor-mark"><NotebookPen size={22} /></div>
            <p className="kicker">Diário dos Desacreditados</p>
            <h1>Antes de responder, escute isto.</h1>
            <p>Esse diário não é um questionário. Não tem resposta certa. Não tem nota. Ele existe porque algumas perguntas precisam ser feitas em voz alta, mesmo que só para você mesmo.</p>
            <p>Comece pelo pilar que mais incomoda. Ou pelo que menos assusta. O iGentMIND vai ler o que você escrever e devolver uma pergunta que eu faria se estivesse do outro lado. Não para resolver. Para continuar.</p>
            <div className="workbook-welcome-actions">
              <Button onClick={openWorkbookIntro} variant="secondary"><Volume2 size={17} /> Ouvir Diego</Button>
              <Button onClick={enterWorkbook}><BookOpen size={17} /> Comecar diario</Button>
            </div>
            <small>Áudio esperado: {WORKBOOK_WELCOME_AUDIO}</small>
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
                  <span>Questáo {questionIndex + 1}</span>
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
                <p>Este painel cruza suas respostas com temas do livro e sugere capítulos, Áudios e contrapontos.</p>
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
        `${letter.roman} — ${letter.title}\n${readerLetters[letter.id]?.trim() || '[carta ainda não escrita]'}`
      )).join('\n\n------------------------\n\n');
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
                  {letterSaveStatus === 'saving' ? 'Salvando...' : letterSaveStatus === 'saved' ? 'Carta sincronizada' : readerLetters[currentLetter.id]?.trim() ? 'Salva na sua jornada' : 'Salvamento automático na sua jornada'}
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
            <strong>Livro, diário, Áudios e mentor</strong>
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
          <p>Um lugar para permanecer perto da obra, compartilhar avanãos e voltar aos pilares sem transformar isso em cobrança.</p>
        </article>
        <article>
          <BookOpen size={22} />
          <h2>Leitura acompanhada</h2>
          <p>Rodas, provocações e convites de leitura para manter a jornada viva depois do primeiro contato com o livro.</p>
        </article>
        <article>
          <Headphones size={22} />
          <h2>Continuidade emocional</h2>
          <p>Áudios, temas e encontros de apoio para quando a pessoa precisa de presença, não de mais conte?do solto.</p>
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
            <span>{'Mostrar botão de trilha na leitura'}</span>
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
          <p className="kicker">Trilhas de leitura</p>
          <h2>{'Leitura com presen\u00e7a'}</h2>
          <p>Escolha uma trilha instrumental de fundo para acompanhar o modo leitura.</p>
          <div className="workbook-actions">
            <Button onClick={toggleSelectedSensoryTrack} variant="secondary"><Music2 size={16} /> Ouvir trilha atual</Button>
            <Button onClick={() => navigate(ROUTES.SESSIONS)} variant="ghost">{'Ver sess\u00f5es'}</Button>
          </div>
        </article>

        <article className="account-card">
          <p className="kicker">Privacidade</p>
          <h2>Seus dados, seu controle</h2>
          <p>As exclusões removem os dados deste dispositivo e da conta conectada. Esta ação não pode ser desfeita.</p>
          <div className="workbook-actions">
            <Button onClick={eraseMindHistory} variant="ghost">Apagar conversas do iGent</Button>
            <Button onClick={eraseJourneyData} variant="ghost">Apagar jornada</Button>
          </div>
        </article>

        <article className="account-card account-share-card">
          <p className="kicker">Convite</p>
          <h2>Compartilhar esse projeto</h2>
          <p>Envie o app para alguém que precisa encontrar o livro, os Áudios e a jornada no próprio ritmo.</p>
          <div className="workbook-actions">
            <Button onClick={handleShareProject} variant="secondary"><Share2 size={16} /> Convidar amigo</Button>
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
          { id: 'sensory', label: 'Áudios', icon: AudioLines },
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
              <select value={adminGrant.productKey} onChange={(event) => setAdminGrant((current) => ({ ...current, productKey: event.target.value as ProductKey }))}>
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
          <span>{adminPublishedPageCount} publicadas · {adminDraftPageCount} rascunho(s) · {adminBookAudio.length} áudio(s)</span>
        </div>
        <div className="admin-book-subnav" role="tablist" aria-label="Editor do livro">
          <button className={adminBookTab === 'canonical' ? 'active' : ''} onClick={() => setAdminBookTab('canonical')}>
            <BookOpen size={16} />
            Canônico
          </button>
          <button className={adminBookTab === 'pages' ? 'active' : ''} onClick={() => setAdminBookTab('pages')}>
            <FileText size={16} />
            PDF antigo
          </button>
          <button className={adminBookTab === 'audio' ? 'active' : ''} onClick={() => setAdminBookTab('audio')}>
            <Headphones size={16} />
            Áudios
          </button>
        </div>
        {adminBookTab === 'canonical' && (
          <article className="account-card admin-panel admin-canonical-editor">
            <div className="admin-section-head compact">
              <div>
                <p className="kicker">Texto canônico</p>
                <h2>Editor por blocos do leitor</h2>
              </div>
              <span>{adminCanonicalHasDraft ? 'Rascunho local aplicado no leitor' : 'Usando arquivo canônico original'}</span>
            </div>

            <div className="admin-control-grid">
              <label>
                <span>Capítulo / seção</span>
                <select
                  value={adminCanonicalChapter?.id || adminCanonicalChapterId}
                  onChange={(event) => {
                    setAdminCanonicalChapterId(event.target.value);
                    const chapterIndex = effectiveCanonicalBookChapters.findIndex((chapter) => chapter.id === event.target.value);
                    if (chapterIndex >= 0) setCurrentChapterIndex(chapterIndex);
                  }}
                >
                  {effectiveCanonicalBookChapters.map((chapter, index) => (
                    <option key={chapter.id} value={chapter.id}>
                      {String(index + 1).padStart(2, '0')} - {repairCanonicalText(chapter.title)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status</span>
                <input
                  readOnly
                  value={`${adminCanonicalChapter?.blocks.length ?? 0} bloco(s) · ${adminCanonicalOriginalChapter?.blocks.length ?? 0} original`}
                />
              </label>
            </div>

            {adminCanonicalChapter && (
              <>
                <div className="admin-canonical-summary">
                  <div>
                    <span>{repairCanonicalText(adminCanonicalChapter.eyebrow)}</span>
                    <strong>{repairCanonicalText(adminCanonicalChapter.title)}</strong>
                    <small>{repairCanonicalText(adminCanonicalChapter.summary)}</small>
                  </div>
                  <div className="admin-canonical-actions">
                    <button type="button" onClick={() => insertAdminCanonicalBlock(adminCanonicalChapter.id, 0)}>
                      + bloco no início
                    </button>
                    <button type="button" onClick={exportAdminCanonicalDrafts} disabled={!Object.keys(adminCanonicalDrafts).length}>
                      <DownloadCloud size={14} /> Exportar correções
                    </button>
                    <button type="button" onClick={() => adminCanonicalImportRef.current?.click()}>
                      Importar correções
                    </button>
                    <input
                      ref={adminCanonicalImportRef}
                      type="file"
                      accept="application/json,.json"
                      hidden
                      onChange={(event) => importAdminCanonicalDrafts(event.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(JSON.stringify(adminCanonicalChapter.blocks, null, 2));
                        setAdminMessage('Blocos canônicos copiados como JSON.');
                      }}
                    >
                      <Copy size={14} /> Copiar JSON
                    </button>
                    <button type="button" onClick={() => resetAdminCanonicalChapter(adminCanonicalChapter.id)} disabled={!adminCanonicalHasDraft}>
                      <RotateCcw size={14} /> Restaurar original
                    </button>
                    <button type="button" onClick={() => setRoute(ROUTES.READER)}>
                      <Eye size={14} /> Ver no leitor
                    </button>
                  </div>
                </div>

                <div className="admin-canonical-help">
                  Edite o texto exatamente como deve aparecer. Quebras de linha dentro do mesmo bloco são preservadas. Para separar em blocos, use o botão “dividir por linhas vazias”; para juntar blocos picados, use “mesclar próximo”.
                </div>

                <div className="admin-canonical-block-list">
                  {adminCanonicalChapter.blocks.map((block, index) => (
                    <section key={block.id} className={`admin-canonical-block-card kind-${block.kind}`}>
                      <div className="admin-canonical-block-head">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <select
                          value={block.kind}
                          onChange={(event) => updateAdminCanonicalBlock(adminCanonicalChapter.id, block.id, { kind: event.target.value as CanonicalBookBlockKind })}
                          aria-label="Tipo do bloco"
                        >
                          <option value="paragraph">Parágrafo</option>
                          <option value="heading">Título</option>
                          <option value="subheading">Subtítulo</option>
                          <option value="pause">Destaque central</option>
                          <option value="divider">Divisor</option>
                          <option value="spacer">Espaço</option>
                          <option value="image">Imagem</option>
                          <option value="image-full">Imagem página inteira</option>
                        </select>
                        <input
                          value={block.className || ''}
                          onChange={(event) => updateAdminCanonicalBlock(adminCanonicalChapter.id, block.id, { className: event.target.value || undefined })}
                          placeholder="classe visual opcional"
                        />
                      </div>
                      <textarea
                        value={block.text}
                        onChange={(event) => updateAdminCanonicalBlock(adminCanonicalChapter.id, block.id, { text: event.target.value })}
                        spellCheck
                        placeholder={block.kind === 'spacer' ? 'Espaço sem texto' : 'Digite o texto exato deste bloco'}
                      />
                      <div className="admin-canonical-block-actions">
                        <button type="button" onClick={() => insertAdminCanonicalBlock(adminCanonicalChapter.id, index)}>+ antes</button>
                        <button type="button" onClick={() => insertAdminCanonicalBlock(adminCanonicalChapter.id, index + 1)}>+ depois</button>
                        <button type="button" onClick={() => moveAdminCanonicalBlock(adminCanonicalChapter.id, block.id, -1)} disabled={index === 0}>subir</button>
                        <button type="button" onClick={() => moveAdminCanonicalBlock(adminCanonicalChapter.id, block.id, 1)} disabled={index === adminCanonicalChapter.blocks.length - 1}>descer</button>
                        <button type="button" onClick={() => splitAdminCanonicalBlock(adminCanonicalChapter.id, block.id)}>dividir por linhas vazias</button>
                        <button type="button" onClick={() => mergeAdminCanonicalBlockWithNext(adminCanonicalChapter.id, block.id)} disabled={index === adminCanonicalChapter.blocks.length - 1}>mesclar próximo</button>
                        <button type="button" className="danger" onClick={() => removeAdminCanonicalBlock(adminCanonicalChapter.id, block.id)}>remover</button>
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}
          </article>
        )}
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
                  .split('\n')
                  .map((paragraph, index) => renderAdminBookPreviewLine(paragraph, `source-${index}`))}
              </div>
            </article>
            <article>
              <div>
                <p className="kicker">Texto em edição</p>
                <strong>{adminCurrentBookPage?.latestPublished ? `Publicado v${adminCurrentBookPage.latestPublished.version}` : 'Ainda não publicado'}</strong>
              </div>
              <div className="admin-book-compare-box edited">
                {(adminBookPageContent || 'Sem texto no editor.')
                  .split('\n')
                  .map((paragraph, index) => renderAdminBookPreviewLine(paragraph, `edited-${index}`))}
              </div>
            </article>
          </div>
        )}
        {(() => {
          const visualPage = getAdminVisualPage();
          const selectedLine = adminSelectedBookLineIndex === null ? '' : getAdminBookLines()[adminSelectedBookLineIndex] || '';
          const selectedBlock = parseAdminBlockCommand(selectedLine);
          const blockSelected = adminSelectedBookLineIndex !== null;
          return (
            <div className="admin-book-visual-layout">
              <article className="admin-visual-page-card">
                <div className="admin-visual-page-toolbar">
                  <span>Página {adminBookPageNumber}</span>
                  <small>Clique no texto da página para editar. Dê dois cliques em linhas divisórias para remover.</small>
                </div>
                <div className="admin-visual-page">
                  <div className="admin-visual-bookmark"><Bookmark fill="currentColor" size={30} /></div>
                  <div className="admin-visual-meta">
                    <span>Página {adminBookPageNumber} de {Math.max(totalPdfPages, pdfTextPages.length || 1)}</span>
                    <span>{Math.round((adminBookPageNumber / Math.max(1, totalPdfPages || pdfTextPages.length || 1)) * 100)}% do livro</span>
                  </div>
                  {!visualPage.hideHeader && (
                    <header className="admin-visual-header">
                      <input
                        className="admin-visual-eyebrow-input"
                        value={visualPage.eyebrow}
                        onChange={(event) => upsertAdminBookDirective('cabecalho-secao', event.target.value || 'Livro')}
                        placeholder="Livro"
                      />
                      <input
                        className="admin-visual-title-input"
                        value={visualPage.title}
                        onChange={(event) => {
                          const nextTitle = event.target.value;
                          if (nextTitle) upsertAdminBookDirective('cabecalho-titulo', nextTitle);
                          else removeAdminBookDirective('cabecalho-titulo');
                        }}
                        placeholder="Título da página"
                      />
                    </header>
                  )}
                  <div className="admin-visual-copy">
                    <div className="admin-rich-toolbar" aria-label="Editor de bloco">
                      <select
                        value={selectedBlock.kind}
                        onChange={(event) => setAdminSelectedBlockKind(event.target.value as 'paragrafo' | 'titulo' | 'subtitulo')}
                        disabled={!blockSelected}
                        title="Tipo de bloco"
                      >
                        <option value="paragrafo">Parágrafo</option>
                        <option value="titulo">Título</option>
                        <option value="subtitulo">Subtítulo</option>
                      </select>
                      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyAdminInlineFormat('bold')} disabled={!blockSelected} title="Negrito no trecho selecionado"><Bold size={15} /></button>
                      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyAdminInlineFormat('italic')} disabled={!blockSelected} title="Itálico no trecho selecionado"><Italic size={15} /></button>
                      <button type="button" onClick={() => transformAdminSelectedBlockText('capitalize')} disabled={!blockSelected} title="Capitalizar">Aa</button>
                      <button type="button" onClick={() => transformAdminSelectedBlockText('upper')} disabled={!blockSelected} title="Maiúsculas">AA</button>
                      <button type="button" onClick={() => transformAdminSelectedBlockText('lower')} disabled={!blockSelected} title="Minúsculas">aa</button>
                      <span />
                      <button type="button" className={!selectedBlock.styles.includes('centralizado') && !selectedBlock.styles.includes('direita') ? 'active' : ''} onClick={() => setAdminSelectedBlockAlignment('esquerda')} disabled={!blockSelected} title="Alinhar à esquerda"><AlignLeft size={15} /></button>
                      <button type="button" className={selectedBlock.styles.includes('centralizado') ? 'active' : ''} onClick={() => setAdminSelectedBlockAlignment('centralizado')} disabled={!blockSelected} title="Centralizar"><AlignCenter size={15} /></button>
                      <button type="button" className={selectedBlock.styles.includes('direita') ? 'active' : ''} onClick={() => setAdminSelectedBlockAlignment('direita')} disabled={!blockSelected} title="Alinhar à direita"><AlignRight size={15} /></button>
                      <span />
                      <button type="button" onClick={() => setAdminSelectedBlockKind('titulo')} disabled={!blockSelected} title="Título"><Heading1 size={15} /></button>
                      <button type="button" onClick={() => setAdminSelectedBlockKind('subtitulo')} disabled={!blockSelected} title="Subtítulo"><Heading2 size={15} /></button>
                      <small>{blockSelected ? 'Editando bloco selecionado' : 'Clique em um bloco do miolo'}</small>
                    </div>
                    <div className="admin-visual-body">
                      {visualPage.bodyLines.length
                        ? visualPage.bodyLines.map(({ line, index }) => renderAdminVisualEditableLine(line, index))
                        : (
                          <textarea
                            className="admin-clean-paste-area"
                            placeholder="Cole aqui o texto corrido. Linhas quebradas do PDF serão unidas automaticamente em parágrafos limpos."
                            onPaste={(event) => {
                              event.preventDefault();
                              replaceAdminVisualBodyWithPlainText(event.clipboardData.getData('text/plain'));
                            }}
                            onChange={(event) => replaceAdminVisualBodyWithPlainText(event.target.value)}
                          />
                        )}
                    </div>
                  </div>
                  <div className="admin-visual-progress">
                    <span>{Math.round((adminBookPageNumber / Math.max(1, totalPdfPages || pdfTextPages.length || 1)) * 100)}% do livro</span>
                    <strong>Página {adminBookPageNumber} de {Math.max(totalPdfPages, pdfTextPages.length || 1)}</strong>
                    <div><span style={{ width: `${Math.round((adminBookPageNumber / Math.max(1, totalPdfPages || pdfTextPages.length || 1)) * 100)}%` }} /></div>
                  </div>
                </div>
              </article>

              <aside className="account-card admin-panel admin-visual-sidepanel">
                <div className="admin-inline">
                  <label>
                    <span>Página do PDF</span>
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
                    <select value={adminBookPageNumber} onChange={(event) => setAdminBookPageNumber(Number(event.target.value))}>
                      {adminBookPageOptions.map((pageNumber) => {
                        const page = adminBookPages.find((item) => item.pageNumber === pageNumber);
                        const label = page?.latestPublished ? 'publicada' : page?.latestDraft ? 'rascunho' : 'original';
                        return <option key={pageNumber} value={pageNumber}>Página {pageNumber} - {label}</option>;
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

                <div className="admin-visual-section">
                  <strong>Header da página</strong>
                  <label>
                    <span>Texto pequeno</span>
                    <input value={visualPage.eyebrow} onChange={(event) => upsertAdminBookDirective('cabecalho-secao', event.target.value)} />
                  </label>
                  <label>
                    <span>Título dourado</span>
                    <input
                      value={visualPage.title}
                      onChange={(event) => {
                        const nextTitle = event.target.value;
                        if (nextTitle.trim()) upsertAdminBookDirective('cabecalho-titulo', nextTitle);
                        else removeAdminBookDirective('cabecalho-titulo');
                      }}
                      placeholder="Edite aqui apenas quando quiser título no header"
                    />
                  </label>
                  <div className="admin-book-format-tools compact" aria-label="Controle do cabecalho">
                    <button type="button" onClick={() => upsertAdminBookDirective('cabecalho', 'ocultar')}>Ocultar header</button>
                    <button type="button" onClick={() => removeAdminBookDirective('cabecalho')}>Mostrar header</button>
                    <button type="button" onClick={() => removeAdminBookDirective('cabecalho-titulo')}>Limpar título</button>
                    <button type="button" onClick={promoteFirstBodyLineToAdminHeader}>Puxar 1ª linha</button>
                  </div>
                </div>

                <div className="admin-visual-section">
                  <strong>Inserir no miolo</strong>
                  <div className="admin-book-format-tools" aria-label="Formatação do texto">
                    <button type="button" onClick={() => insertAdminBookPageSnippet('[br]')}>Quebra</button>
                    <button type="button" onClick={() => insertAdminBookPageSnippet('---')}>Divisor</button>
                    <button type="button" onClick={() => insertAdminBookPageSnippet('[[espaco:32]]')}>Espaço</button>
                    <button type="button" onClick={() => insertAdminBookPageSnippet('[[imagem:/media/imagens/livro/exemplo.jpg|Legenda da imagem]]')}>Imagem</button>
                    <button type="button" onClick={() => insertAdminBookPageSnippet('[[capa:/media/imagens/capas/capa.webp|Capa]]')}>Página inteira</button>
                    <button type="button" onClick={() => insertAdminBookPageSnippet('[[titulo:Título no miolo]]')}>Título</button>
                  </div>
                  <div className="admin-clean-paste-panel">
                    <span>Colar texto limpo</span>
                    <textarea
                      value={adminPlainPasteDraft}
                      onChange={(event) => setAdminPlainPasteDraft(event.target.value)}
                      onPaste={(event) => {
                        event.preventDefault();
                        const pasted = event.clipboardData.getData('text/plain');
                        setAdminPlainPasteDraft(pasted);
                        replaceAdminVisualBodyWithPlainText(pasted);
                      }}
                      placeholder="Cole aqui para substituir todo o miolo por um texto único, sem formatação e sem quebras soltas do PDF."
                    />
                    <div>
                      <button type="button" onClick={() => replaceAdminVisualBodyWithPlainText(adminPlainPasteDraft)}>
                        Substituir miolo
                      </button>
                      <button type="button" onClick={() => replaceAdminVisualBodyWithPlainText(adminPlainPasteDraft, true)}>
                        Manter parágrafos
                      </button>
                    </div>
                    <small>Substitui apenas o miolo. O header da página é preservado.</small>
                  </div>
                </div>

                <label>
                  <span>Título interno opcional</span>
                  <input value={adminBookPageTitle} onChange={(event) => setAdminBookPageTitle(event.target.value)} placeholder="Ex.: Pilar I - Limiar" />
                </label>

                <div className="workbook-actions">
                  <Button onClick={handleRepairAdminBookPageContent} variant="ghost">Corrigir caracteres</Button>
                  <Button onClick={handleCleanAdminBookPageContent} variant="ghost">Limpar texto</Button>
                  <Button onClick={handleSaveBookPageDraft} variant="secondary">Salvar rascunho</Button>
                  <Button onClick={handlePublishBookPage}>Publicar no leitor</Button>
                </div>

                <details className="admin-source-editor">
                  <summary>Código da página</summary>
                  <textarea
                    ref={adminBookPageTextareaRef}
                    className="admin-book-textarea"
                    value={adminBookPageContent}
                    onChange={(event) => setAdminBookPageContent(event.target.value)}
                    placeholder="Cole ou corrija aqui o texto que deve aparecer no modo leitura."
                  />
                  <small>Use linha vazia para novo parágrafo, [br] para quebra no mesmo parágrafo, --- para divisor, [[espaco:32]], [[imagem:/media/imagens/livro/exemplo.jpg|Legenda]], [[capa:/media/imagens/capas/capa.webp|Capa]], [[cabecalho:ocultar]], [[cabecalho-secao:Texto]], [[cabecalho-titulo:Texto]] e [[titulo:Texto|negrito,italico,maiusculo,espacado]]. Sem estilos, o texto aparece exatamente como digitado.</small>
                </details>

                <div className="admin-book-history">
                  <strong>Histórico</strong>
                  {adminBookPageHistory.length === 0 ? (
                    <small>Nenhuma versão salva ainda.</small>
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
              </aside>
            </div>
          );
        })()}
        </>
        )}
        {adminBookTab === 'audio' && (
        <article className="account-card admin-panel admin-audio-editor">
          <div className="admin-section-head compact">
            <div>
              <p className="kicker">Áudios do capítulo</p>
              <h2>Títulos e arquivos</h2>
            </div>
            <span>{adminBookAudio.length} áudio(s) editados</span>
          </div>
          <div className="admin-control-grid">
            <label>
              <span>Capítulo</span>
              <select value={adminAudioChapterId} onChange={(event) => setAdminAudioChapterId(event.target.value)}>
                {bookChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>{repairMojibake(chapter.title)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Seção / faixa</span>
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
                <strong>Mesa de produção</strong>
                <small>Arraste para organizar. Clique em uma faixa para editar o caminho, título e publicar.</small>
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
                      <small>{item.published ? `Publicado v${item.published.version || 1}` : 'Usando caminho padrão'}</small>
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
                    placeholder="Observação: texto inconsistente, voz errada, placeholder, precisa regenerar..."
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
            <span>Título exibido</span>
            <input value={adminAudioLabel} onChange={(event) => setAdminAudioLabel(event.target.value)} placeholder="Ex.: Manifesto de abertura" />
          </label>
          <label>
            <span>Arquivo ou URL do audio</span>
            <input value={adminAudioUrl} onChange={(event) => setAdminAudioUrl(event.target.value)} placeholder="/media/audios/livro/6-ato1-sobrevivencia/pilar-01-reconhecimento/p1-manifesto.wav" />
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
            <strong>Histórico desta faixa</strong>
            {!adminCurrentAudioSummary?.history?.length ? (
              <small>Nenhuma substituição publicada ainda.</small>
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

      {adminSection === 'sensory' && (
      <section className="admin-control-grid admin-audio-support-grid">
        <article className="account-card admin-panel">
          <div className="admin-section-head compact">
            <div>
              <p className="kicker">Áudios de apoio</p>
              <h2>Falas e conteúdos</h2>
            </div>
            <span>{supportAudios.length} áudio(s)</span>
          </div>
          <label>
            <span>Título</span>
            <input value={adminSupportAudioDraft.title} onChange={(event) => setAdminSupportAudioDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Ex.: Sobrevivência" />
          </label>
          <label>
            <span>Descrição</span>
            <textarea value={adminSupportAudioDraft.text} onChange={(event) => setAdminSupportAudioDraft((current) => ({ ...current, text: event.target.value }))} placeholder="Quando esse áudio deve aparecer..." />
          </label>
          <label>
            <span>URL do áudio</span>
            <input value={adminSupportAudioDraft.audioUrl} onChange={(event) => setAdminSupportAudioDraft((current) => ({ ...current, audioUrl: event.target.value }))} placeholder="/media/audios/home/sobrevivencia.mp3" />
          </label>
          <label>
            <span>Capa opcional</span>
            <input value={adminSupportAudioDraft.coverUrl || ''} onChange={(event) => setAdminSupportAudioDraft((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="/media/imagens/capas/audio-apoio.webp" />
          </label>
          <div className="workbook-actions">
            <Button onClick={handleSaveSupportAudio}><Headphones size={16} /> Salvar apoio</Button>
            <Button variant="ghost" onClick={() => setAdminSupportAudioDraft({ id: '', title: '', text: '', audioUrl: '', coverUrl: '' })}>Limpar</Button>
          </div>
          <div className="admin-sensory-list">
            {supportAudios.map((track) => (
              <div key={track.id} className="admin-sensory-row">
                <button type="button" onClick={() => handleEditSupportAudio(track)}>
                  <strong>{repairMojibake(track.title)}</strong>
                  <small>{track.audioUrl}</small>
                </button>
                <button type="button" onClick={() => handlePlayAudio(track.audioUrl, repairMojibake(track.title), track.coverUrl)}>Testar</button>
                <button type="button" onClick={() => handleRemoveSupportAudio(track.id)}><X size={15} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="account-card admin-panel">
          <div className="admin-section-head compact">
            <div>
              <p className="kicker">Trilhas de leitura</p>
              <h2>Background do leitor</h2>
            </div>
            <span>{sensoryPlaylist.length} trilha(s)</span>
          </div>
          <label>
            <span>Título</span>
            <input value={adminSensoryDraft.title} onChange={(event) => setAdminSensoryDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Ex.: Silêncio dourado" />
          </label>
          <label>
            <span>Descrição</span>
            <textarea value={adminSensoryDraft.text} onChange={(event) => setAdminSensoryDraft((current) => ({ ...current, text: event.target.value }))} placeholder="Quando usar essa trilha..." />
          </label>
          <label>
            <span>URL do áudio</span>
            <input value={adminSensoryDraft.audioUrl} onChange={(event) => setAdminSensoryDraft((current) => ({ ...current, audioUrl: event.target.value }))} placeholder="/media/audios/trilhas/silencio-dourado.mp3" />
          </label>
          <label>
            <span>Capa opcional</span>
            <input value={adminSensoryDraft.coverUrl || ''} onChange={(event) => setAdminSensoryDraft((current) => ({ ...current, coverUrl: event.target.value }))} placeholder="/media/imagens/capas/trilha.webp" />
          </label>
          <div className="workbook-actions">
            <Button onClick={handleSaveSensoryTrack}><Music2 size={16} /> Salvar trilha</Button>
            <Button variant="ghost" onClick={() => setAdminSensoryDraft({ id: '', title: '', text: '', audioUrl: '', coverUrl: '' })}>Limpar</Button>
          </div>
          <div className="admin-sensory-list">
            {sensoryPlaylist.map((track) => (
              <div key={track.id} className="admin-sensory-row">
                <button type="button" onClick={() => handleEditSensoryTrack(track)}>
                  <strong>{repairMojibake(track.title)}</strong>
                  <small>{track.audioUrl}</small>
                </button>
                <button type="button" onClick={() => selectSensoryTrack(track, true)}>Testar</button>
                <button type="button" onClick={() => handleRemoveSensoryTrack(track.id)}><X size={15} /></button>
              </div>
            ))}
          </div>
        </article>
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
            <div className="admin-section-head compact">
              <div>
                <p className="kicker">Copys</p>
                <h2>Central de marketing</h2>
              </div>
              <span>{marketingProductLabels[marketingProduct]}</span>
            </div>
            <p>Monte rapidamente textos para anúncios, WhatsApp, e-mail, página de vendas e onboarding com o tom do projeto.</p>
            <div className="admin-copy-builder">
              <label>
                <span>Produto</span>
                <select value={marketingProduct} onChange={(event) => setMarketingProduct(event.target.value as MarketingProduct)}>
                  {Object.entries(marketingProductLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Objetivo</span>
                <select value={marketingGoal} onChange={(event) => setMarketingGoal(event.target.value as MarketingGoal)}>
                  {Object.entries(marketingGoalLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Canal</span>
                <select value={marketingChannel} onChange={(event) => setMarketingChannel(event.target.value as MarketingChannel)}>
                  {Object.entries(marketingChannelLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label>
                <span>Público</span>
                <textarea value={marketingAudience} onChange={(event) => setMarketingAudience(event.target.value)} />
              </label>
              <label>
                <span>Oferta / entrega</span>
                <textarea value={marketingOffer} onChange={(event) => setMarketingOffer(event.target.value)} />
              </label>
              <label>
                <span>Objeção principal</span>
                <textarea value={marketingObjection} onChange={(event) => setMarketingObjection(event.target.value)} />
              </label>
            </div>
          </article>

          <article className="account-card admin-panel">
            <div className="admin-section-head compact">
              <div>
                <p className="kicker">{marketingChannelLabels[marketingChannel]}</p>
                <h2>Peças prontas</h2>
              </div>
              <Button variant="ghost" onClick={() => copyMarketingText('all', marketingDrafts[marketingChannel].join('\n\n---\n\n'))}>
                <Copy size={15} /> {marketingCopied === 'all' ? 'Copiado' : 'Copiar tudo'}
              </Button>
            </div>
            <div className="admin-copy-output">
              {marketingDrafts[marketingChannel].map((text, index) => {
                const key = `${marketingChannel}-${index}`;
                return (
                  <article key={key}>
                    <div>
                      <strong>Variação {index + 1}</strong>
                      <button type="button" onClick={() => copyMarketingText(key, text)}>
                        <Copy size={14} /> {marketingCopied === key ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <pre>{text}</pre>
                  </article>
                );
              })}
            </div>
          </article>

          <article className="account-card admin-panel admin-copy-library">
            <p className="kicker">Headlines e ângulos</p>
            <h2>Banco rápido</h2>
            <div className="admin-copy-list">
              {marketingDrafts.headlines.map((item, index) => (
                <button key={item} type="button" onClick={() => copyMarketingText(`headline-${index}`, item)}>
                  <NotebookPen size={16} />
                  <span>{item}</span>
                  <small>{marketingCopied === `headline-${index}` ? 'copiado' : 'copiar'}</small>
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
      case ROUTES.SESSIONS: return hasReaderAccess ? SessionsView() : <LockedView title="Áudios bloqueados" offerKey="basic" />;
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
      {ambientAudioState.currentUrl && route === ROUTES.READER && (
        <div className={`ambient-player ${ambientAudioState.isPlaying ? 'playing' : ''} ${ambientPlayerCollapsed ? 'collapsed' : ''}`} role="status" aria-live="polite">
          <button
            className="ambient-player-visual"
            onClick={() => ambientPlayerCollapsed && setAmbientPlayerCollapsed(false)}
            title={ambientPlayerCollapsed ? 'Abrir trilha de leitura' : 'Trilha de leitura ativa'}
            aria-label={ambientPlayerCollapsed ? 'Abrir trilha de leitura' : 'Trilha de leitura ativa'}
          >
            <Music2 size={15} />
            <span />
            <span />
            <span />
            <span />
          </button>
          <div className="ambient-player-copy">
            <p>Trilha de leitura</p>
            <strong>{ambientAudioState.title}</strong>
            {ambientAudioState.isPlaying && audioState.isPlaying && <small>Volume reduzido durante a narração</small>}
          </div>
          <label className="ambient-player-volume" style={{ '--ambient-volume': `${Math.round(ambientAudioState.volume * 100)}%` } as React.CSSProperties}>
            <Volume2 size={15} />
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(ambientAudioState.volume * 100)}
              onChange={(event) => changeAmbientVolume(Number(event.target.value))}
              aria-label="Volume da trilha de leitura"
            />
          </label>
          <button className="ambient-player-skip" onClick={() => playAdjacentAmbientTrack(-1)} title="Trilha anterior">
            <SkipBack size={14} />
          </button>
          <button className="ambient-player-toggle" onClick={toggleSelectedSensoryTrack} title={ambientAudioState.isPlaying ? 'Pausar trilha' : 'Tocar trilha'}>
            {ambientAudioState.isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
          </button>
          <button className="ambient-player-skip" onClick={() => playAdjacentAmbientTrack(1)} title="Próxima trilha">
            <SkipForward size={14} />
          </button>
          <button className="ambient-player-close" onClick={stopAmbientTrack} title="Fechar trilha">
            <X size={14} />
          </button>
          <button className="ambient-player-minimize" onClick={() => setAmbientPlayerCollapsed(true)} title="Minimizar trilha">
            <span aria-hidden="true">-</span>
          </button>
        </div>
      )}
      {audioState.currentUrl && (
        <>
        {route !== ROUTES.READER && (
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
        )}
        {audioFullOpen && (
          <section className="audio-fullscreen-player" role="dialog" aria-modal="true" aria-label="Player de audiobook">
            <div className="audio-fullscreen-bg" />
            <button className="audio-full-close" onClick={() => setAudioFullOpen(false)} title="Voltar para barra"><X size={20} /></button>
            <div className="audio-full-card">
              <div className="audio-full-cover">
                <img src={audioState.coverUrl || '/media/imagens/capas/capa.webp'} alt="" />
                <div className="audio-orbit one" />
                <div className="audio-orbit two" />
              </div>
              <div className="audio-full-copy">
                <p className="kicker">Audiobook OPDDS</p>
                <h2>{audioState.title}</h2>
                {currentAudioQueueItem && (
                  <small>
                    Faixa {currentAudioQueueIndex + 1} de {audiobookQueue.length}
                    {nextAudioQueueItem ? ` - próxima: ${nextAudioQueueItem.label}` : ' - fim da fila'}
                  </small>
                )}
                <span>{audioState.isPlaying ? 'Em reprodução' : 'Pausado'}  · {formatTime(audioState.currentTime)} de {formatTime(audioState.duration)}</span>
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



