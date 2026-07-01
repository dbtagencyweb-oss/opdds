import { useEffect, useMemo, useRef, useState } from 'react';
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
  FileText,
  Flame,
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
  AdminEvent,
  AdminInviteResponse,
  AdminProduct,
  AuthUser,
  createAdminInvite,
  fetchAdminEvents,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchCurrentUser,
  getStoredAuthUser,
  grantAdminPlan,
  grantAdminProduct,
  LocalUserRecord,
  loginAccount,
  registerAccount,
  requestPasswordReset,
  revokeAdminProduct,
  resetPassword,
  updateStoredAuthUser,
} from './services/auth';

const ROUTES = {
  ACCESS: 'access',
  ONBOARDING: 'onboarding',
  HOME: 'home',
  BOOK: 'book',
  LIBRARY: 'library',
  SESSIONS: 'sessions',
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

type AudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
};

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
      { id: ROUTES.LIBRARY, label: 'Biblioteca', icon: Library },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { id: ROUTES.SESSIONS, label: 'Sessões', icon: AudioLines },
      { id: ROUTES.IGENT, label: 'iGentMIND', icon: Zap },
    ],
  },
  {
    title: 'Pessoal',
    items: [
      { id: ROUTES.FAVORITES, label: 'Favoritos', icon: Heart },
      { id: ROUTES.WORKBOOK, label: 'Diário', icon: FileText },
      { id: ROUTES.LETTERS, label: 'Minhas cartas', icon: Mail },
      { id: ROUTES.MANIFESTO, label: 'Manifesto', icon: Shield },
      { id: ROUTES.SETTINGS, label: 'Minha conta', icon: User },
      { id: ROUTES.ADMIN, label: 'Admin', icon: Users },
    ],
  },
];

const homeSlides = [
  '/media/imagens/capas/capa-topo.jpg',
  '/media/imagens/capas/capa.jpg',
  '/media/imagens/capas/capa.png',
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

const normalizeForSearch = (value = '') =>
  repairMojibake(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
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
  const [adminSelectedUserId, setAdminSelectedUserId] = useState('');
  const [adminInvite, setAdminInvite] = useState({ name: '', email: '', plan: 'basic' as Plan, expiresInDays: '' });
  const [adminGrant, setAdminGrant] = useState({ plan: 'vip' as Plan, productKey: PRODUCT_KEYS.workbook, expiresInDays: '' });
  const [adminResult, setAdminResult] = useState<AdminInviteResponse | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
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
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'forgot' | 'reset'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
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
  const [homeSlideIndex, setHomeSlideIndex] = useState(0);
  const [workbookEntry, setWorkbookEntry] = useState('');
  const [workbookPrompt, setWorkbookPrompt] = useState(workbookPrompts[0]);
  const [workbookPillarIndex, setWorkbookPillarIndex] = useState(0);
  const [workbookAnswers, setWorkbookAnswers] = useState<Record<string, string>>({});
  const [letterIndex, setLetterIndex] = useState(0);
  const [readerLetters, setReaderLetters] = useState<Record<string, string>>({});
  const [letterMeta, setLetterMeta] = useState<Record<string, LetterMeta>>({});
  const [readerNotes, setReaderNotes] = useState<ReaderNote[]>([]);
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
  const currentAudioUrlRef = useRef<string | null>(null);

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

  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookChapters
      .map((chapter, index) => ({ chapter, index }))
      .filter(({ chapter }) => !query || `${chapter.title} ${chapter.summary}`.toLowerCase().includes(query));
  }, [searchQuery]);

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
      if (now % 3000 < 260 && currentAudioUrlRef.current) {
        const url = currentAudioUrlRef.current;
        const duration = audio.duration || 0;
        const heard = duration > 0 && audio.currentTime / duration > 0.92;
        setAudioProgressMap((current) => {
          const next = {
            ...current,
            [url]: {
              heard: current[url]?.heard || heard,
              currentTime: audio.currentTime,
              duration,
              updatedAt: new Date().toISOString(),
            },
          };
          saveLocalAudioProgress(next);
          return next;
        });
      }
    };
    const handleMeta = () => setAudioState((state) => ({ ...state, duration: audio.duration || 0 }));
    const handleEnd = () => {
      const url = currentAudioUrlRef.current;
      if (url) {
        setAudioProgressMap((current) => {
          const next = {
            ...current,
            [url]: {
              heard: true,
              currentTime: audio.duration || audio.currentTime || 0,
              duration: audio.duration || 0,
              updatedAt: new Date().toISOString(),
            },
          };
          saveLocalAudioProgress(next);
          return next;
        });
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
    if (route !== ROUTES.ADMIN || !isAdmin) return;
    Promise.all([fetchAdminUsers(), fetchAdminProducts(), fetchAdminEvents()])
      .then(([users, products, events]) => {
        setAdminReaders(users);
        setAdminProducts(products);
        setAdminEvents(events);
        if (!adminSelectedUserId && users[0]) setAdminSelectedUserId(users[0].id);
      })
      .catch(() => {
        setAdminReaders([]);
        setAdminProducts([]);
        setAdminEvents([]);
      });
  }, [route, isAdmin]);

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

  const handlePlayAudio = (url: string | null, title: string | null) => {
    if (!url || !audioRef.current) return;
    playClick('primary');
    const audio = audioRef.current;

    if (audioState.currentUrl === url) {
      if (audioState.isPlaying) {
        audio.pause();
        stopAudioSpectrum();
        setAudioState((state) => ({ ...state, isPlaying: false }));
      } else {
        audio.play().then(startAudioSpectrum).catch(() => {});
        setAudioState((state) => ({ ...state, isPlaying: true }));
      }
      return;
    }

    audio.src = url;
    currentAudioUrlRef.current = url;
    audio.currentTime = 0;
    audio.volume = audioState.volume;
    audio.playbackRate = audioState.playbackRate;
    audio.play().then(startAudioSpectrum).catch(() => {});
    setAudioState((state) => ({
      ...state,
      isPlaying: true,
      currentUrl: url,
      title,
      currentTime: 0,
      duration: 0,
    }));
  };

  const seekAudio = (value: number) => {
    if (!audioRef.current || !audioState.duration) return;
    const nextTime = (value / 100) * audioState.duration;
    audioRef.current.currentTime = nextTime;
    setAudioState((state) => ({ ...state, currentTime: nextTime }));
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
    audioRef.current?.pause();
    currentAudioUrlRef.current = null;
    setAudioFullOpen(false);
    stopAudioSpectrum();
    setAudioState((state) => ({ ...state, isPlaying: false, currentUrl: null, title: null, currentTime: 0, duration: 0 }));
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
    const [users, products, events] = await Promise.all([fetchAdminUsers(), fetchAdminProducts(), fetchAdminEvents()]);
    setAdminReaders(users);
    setAdminProducts(products);
    setAdminEvents(events);
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
    try {
      const invite = await createAdminInvite({
        name: adminInvite.name || undefined,
        email: adminInvite.email,
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
    navigator.clipboard?.writeText(`${selectedChapter.title} - ${window.location.href}`).catch(() => {});
    playClick('soft');
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

  const startMindSession = (topic: typeof mentorTopics[number]) => {
    const guide = getMindGuide(topic);
    const recommendations = findMindRecommendations(topic.title, topic);
    setActiveMentorTopic(topic);
    setMindStep('chat');
    setMindInput('');
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
    handlePlayAudio(topic.audioUrl, topic.title);
  };

  const answerMind = (text: string) => {
    const value = text.trim();
    if (!value) return;
    const guide = getMindGuide();
    const recommendations = findMindRecommendations(value, activeMentorTopic);
    playClick('primary');
    setMindInput('');
    setMindMessages((current) => [
      ...current.map((message) => ({ ...message, replies: undefined })),
      { id: `user-${Date.now()}`, from: 'user', text: value },
      {
        id: `agent-${Date.now()}`,
        from: 'agent',
        kind: 'plan',
        text:
          `${guide.counterpoint}\n\nPlano de presença: ${guide.practice}\n\nPelo que você trouxe, eu buscaria estes pontos do livro primeiro:`,
        replies: ['Abrir capítulo sugerido', 'Ouvir apoio', 'Recomeçar triagem'],
        recommendations,
      },
    ]);
  };

  const handleMindQuickReply = (reply: string) => {
    if (reply === 'Abrir capítulo sugerido') {
      goToChapter(getMindGuide().chapterHint);
      return;
    }
    if (reply === 'Ouvir apoio') {
      handlePlayAudio(activeMentorTopic.audioUrl, activeMentorTopic.title);
      return;
    }
    if (reply === 'Recomeçar triagem') {
      setMindStep('select');
      setMindMessages([]);
      return;
    }
    answerMind(reply);
  };

  const isRouteLocked = (routeId: Route) => {
    if ([ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS, ROUTES.READER].includes(routeId as any)) return !hasReaderAccess;
    if (routeId === ROUTES.IGENT) return !hasMindAccess;
    if (routeId === ROUTES.WORKBOOK) return !hasWorkbookAccess;
    if (routeId === ROUTES.LETTERS) return !hasReaderAccess;
    if (routeId === ROUTES.ADMIN) return !isAdmin;
    return false;
  };

  const upgradeForRoute = (routeId: Route): UpgradeKey => {
    if ([ROUTES.BOOK, ROUTES.LIBRARY, ROUTES.SESSIONS, ROUTES.READER].includes(routeId as any)) return 'basic';
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
                  <label>
                    <span>Nova senha</span>
                    <input value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="mínimo 6 caracteres" type="password" />
                  </label>
                  <label>
                    <span>Confirmar nova senha</span>
                    <input value={authPasswordConfirm} onChange={(event) => setAuthPasswordConfirm(event.target.value)} placeholder="repita a nova senha" type="password" />
                  </label>
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
          <label>
            <span>Senha</span>
            <input value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="mínimo 6 caracteres" type="password" />
          </label>
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
        <Button onClick={() => navigate(ROUTES.LIBRARY)} variant="secondary">Sumário</Button>
        </div>
        <div className="home-slide-dots">
          {homeSlides.map((slide, index) => (
            <button key={slide} className={index === homeSlideIndex ? 'active' : ''} onClick={() => setHomeSlideIndex(index)} title={`Imagem ${index + 1}`} />
          ))}
        </div>
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
            <article key={state.title} className={index === 1 ? 'active' : ''}>
              <div>
                <h3>{state.title}</h3>
                <p>{state.desc}</p>
              </div>
              <button onClick={() => {
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
      <img className="book-cover-main" src="/media/imagens/capas/capa.jpg" alt="Capa do livro" />
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
              />
              <button type="submit">Enviar</button>
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
        audioTracks={selectedChapter.audioTracks}
        pdfUrl={pdfUrl}
        pdfTextPages={pdfTextPages}
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
        onTogglePageBookmark={togglePageBookmark}
        onPageNoteChange={updateCurrentPageNote}
        onOpenCurrentLetter={openCurrentPillarLetter}
        currentLetterTitle={currentPillarLetter?.title}
        onFontIncrease={() => setFontSize((size) => clamp(size + 1, 14, 28))}
        onFontDecrease={() => setFontSize((size) => clamp(size - 1, 14, 28))}
        onOpenPdf={() => window.open(pdfUrl, '_blank')}
        onShare={handleShareChapter}
        onExitReader={() => navigate(ROUTES.HOME)}
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
    };

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
                    onClick={() => setWorkbookPillarIndex(index)}
                    title={pillar.title}
                  >
                    {pillar.roman}
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
              }} variant="secondary">Salvar pilar</Button>
              <Button onClick={() => setWorkbookPillarIndex(clamp(workbookPillarIndex + 1, 0, workbookPillars.length - 1))} variant="ghost">Próximo</Button>
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
                <Button onClick={() => startMindSession(linkedTopic)}><Zap size={17} /> Conversar com iGentMIND</Button>
              </>
            ) : (
              <>
                <p>Este painel cruza suas respostas com temas do livro e sugere capítulos, áudios e contrapontos.</p>
                <Button onClick={() => openUpgrade('igent30')}><Zap size={17} /> Desbloquear iGent 30 dias</Button>
              </>
            )}
            <span>{savedAt ? 'Salvo localmente' : 'Salvamento automático ativo'}</span>
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
              <span>{savedAt ? `Salvo localmente` : 'Salvamento automático'}</span>
            </div>
            <textarea
              value={workbookEntry}
              onChange={(event) => {
                setWorkbookEntry(event.target.value);
                saveLocalWorkbookEntry(event.target.value);
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
                <small>{readerLetters[letter.id]?.trim() ? 'Em andamento' : 'Ainda em branco'}</small>
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
                <span>Salvamento automático neste dispositivo</span>
                <strong>— {readerName}</strong>
              </footer>
            </div>
            <div className="letter-actions">
              {letterIndex < 9 && <Button onClick={() => goToChapter(8 + letterIndex)} variant="ghost"><BookOpen size={17} /> Voltar ao pilar</Button>}
              <Button onClick={() => setLetterIndex(clamp(letterIndex + 1, 0, pillarLetters.length - 1))}>Próxima carta</Button>
            </div>
          </article>
        </section>
      </div>
    );
  };

  const ManifestoView = () => (
    <div className="app-page page-enter">
      <section className="manifesto-panel">
        <p className="kicker">Manifesto</p>
        <h1>Você não precisa ser acreditado por todos para continuar existindo com força.</h1>
        <p>Este espaço não é sobre performance de superação. É sobre lembrar, página por página, que ainda existe presença possível quando o mundo já tentou te resumir.</p>
        <Button onClick={() => handlePlayAudio('/media/audios/manifesto/boas-vindas.mp3', 'Manifesto')}><Play size={17} /> Ouvir manifesto</Button>
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
          <div className="setting-row"><span>Recorrência</span><strong>{hasMindAccess || hasGroupAccess ? 'Preparada' : 'Não ativa'}</strong></div>
          <button className="token-copy-button" onClick={() => navigator.clipboard?.writeText(localStorage.getItem('opd_token') || '')}>
            Copiar chave de sessão
          </button>
        </article>

        <article className="account-card">
          <p className="kicker">Produtos liberados</p>
          <div className="product-list">
            {currentProducts.map((product) => (
              <span key={product}>{PRODUCT_LABELS[product as ProductKey] ?? product}</span>
            ))}
          </div>
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
    </div>
  );

  const AdminView = () => (
    <div className="app-page admin-page page-enter">
      <div className="page-heading">
        <div>
          <p className="kicker">Admin</p>
          <h1>Controle de membros</h1>
        </div>
        <span className="plan-badge">{adminReaders.length} leitor(es)</span>
      </div>

      <section className="admin-control-grid">
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

        <article className="account-card admin-panel">
          <p className="kicker">Acesso manual</p>
          <h2>Liberar produto ou plano</h2>
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

      {adminMessage && <div className="admin-message">{adminMessage}</div>}

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
      case ROUTES.LIBRARY: return hasReaderAccess ? LibraryView() : <LockedView title="Biblioteca bloqueada" offerKey="basic" />;
      case ROUTES.SESSIONS: return hasReaderAccess ? SessionsView() : <LockedView title="Audios bloqueados" offerKey="basic" />;
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
                <img src="/media/imagens/capas/capa-topo.jpg" alt="" />
                <div className="audio-orbit one" />
                <div className="audio-orbit two" />
              </div>
              <div className="audio-full-copy">
                <p className="kicker">Audiobook OPDDS</p>
                <h2>{audioState.title}</h2>
                <span>{audioState.isPlaying ? 'Em reprodução' : 'Pausado'} · {formatTime(audioState.currentTime)} de {formatTime(audioState.duration)}</span>
              </div>
              <div className="audio-full-visualizer" style={{ '--audio-progress': `${audioProgress || 0}%` } as React.CSSProperties}>
                <AudioFrequencyBars values={audioFrequencies} />
                <input className="player-progress" type="range" min="0" max="100" value={audioProgress || 0} onChange={(event) => seekAudio(Number(event.target.value))} aria-label="Progresso do áudio" />
              </div>
              <div className="audio-full-time"><span>{formatTime(audioState.currentTime)}</span><span>{formatTime(audioState.duration)}</span></div>
              <div className="audio-full-controls">
                <button className="audio-control-soft" onClick={changePlaybackRate}>{audioState.playbackRate % 1 === 0 ? audioState.playbackRate.toFixed(0) : audioState.playbackRate.toFixed(2).replace(/0$/, '')}x</button>
                <button className="audio-control-main" onClick={() => handlePlayAudio(audioState.currentUrl, audioState.title)}>
                  {audioState.isPlaying ? <Pause size={30} /> : <Play size={30} fill="currentColor" />}
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
