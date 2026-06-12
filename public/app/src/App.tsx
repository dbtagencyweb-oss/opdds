import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AudioLines,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  Cloud,
  DownloadCloud,
  FileText,
  Flame,
  Heart,
  Home,
  Library,
  ListMusic,
  Lock,
  Menu,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Users,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { usePagination } from './hooks/usePagination';
import { accessTokenPlans, accessTokens, bookChapters, onboardingSteps, pdfUrl, workbookPdfUrl } from './data/book';
import Button from './components/Button';
import OnboardingModal from './components/OnboardingModal';
import ReaderShell from './components/ReaderShell';
import SiriWaveVisualizer from './components/SiriWaveVisualizer';
import { PRODUCT_KEYS, PRODUCT_LABELS, ProductKey } from './config/products';
import { hasLocalEntitlement, LocalPlan } from './services/entitlements';
import { getLocalWorkbookSavedAt, loadLocalWorkbookAnswers, loadLocalWorkbookEntry, saveLocalWorkbookAnswers, saveLocalWorkbookEntry } from './services/workbookStore';
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
  revokeAdminProduct,
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
};

const CHARS_PER_READER_PAGE = 850;

const paginateParagraphs = (content: string[]) => {
  const generatedPages: string[][] = [];
  let currentPage: string[] = [];
  let currentLength = 0;

  content.forEach((paragraph) => {
    if (currentLength + paragraph.length > CHARS_PER_READER_PAGE && currentPage.length > 0) {
      generatedPages.push(currentPage);
      currentPage = [paragraph];
      currentLength = paragraph.length;
    } else {
      currentPage.push(paragraph);
      currentLength += paragraph.length;
    }
  });

  if (currentPage.length > 0) generatedPages.push(currentPage);
  return generatedPages;
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
    chapter: 2,
  },
  {
    title: 'Reconstrução',
    desc: 'Estou tentando me reerguer sem me violentar.',
    audioUrl: '/media/audios/home/reconstrucao.mp3',
    chapter: 6,
  },
  {
    title: 'Continuidade',
    desc: 'Quero manter o equilíbrio depois do impacto.',
    audioUrl: '/media/audios/home/continuidade.mp3',
    chapter: 10,
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
    subtitle: 'Onde a negacao cessa.',
    intro: 'Este pilar pede uma fotografia honesta do agora: o que pesa, o que ainda vive e o que voce vem fingindo nao perceber.',
    questions: [
      'O que em mim precisa ser reconhecido antes de ser consertado?',
      'Qual parte da minha historia eu ainda tento esconder para parecer forte?',
      'Que verdade pequena, se aceita hoje, ja diminuiria o peso?',
    ],
  },
  {
    roman: 'II',
    title: 'Familia',
    subtitle: 'Lealdades invisiveis.',
    intro: 'Aqui voce olha para herancas emocionais sem transformar ninguem em vilao. O foco e entender o que foi recebido e o que nao precisa continuar.',
    questions: [
      'Que papel eu aprendi a ocupar para ser aceito?',
      'Que culpa nao nasceu em mim, mas ainda dirige minhas escolhas?',
      'Qual limite me devolveria dignidade sem apagar minha origem?',
    ],
  },
  {
    roman: 'III',
    title: 'Vinculo',
    subtitle: 'A necessidade de pertencer.',
    intro: 'Pertencer nao deveria custar a sua propria presenca. Este pilar observa onde o medo de perder alguem virou abandono de si.',
    questions: [
      'Onde eu confundo amor com a necessidade de ser escolhido?',
      'Que relacao me pede para diminuir minha verdade?',
      'Como eu posso permanecer aberto sem me entregar ao desespero?',
    ],
  },
  {
    roman: 'IV',
    title: 'Luto',
    subtitle: 'O que nao volta.',
    intro: 'O luto nao e so sobre morte. E tambem sobre versoes, promessas, lugares e futuros que nao aconteceram.',
    questions: [
      'O que eu ainda tento trazer de volta, mesmo sabendo que mudou?',
      'Que parte de mim ficou parada no impacto?',
      'Qual despedida interna eu preciso escrever para voltar a respirar?',
    ],
  },
  {
    roman: 'V',
    title: 'Trabalho',
    subtitle: 'Producao versus valor.',
    intro: 'Este pilar separa desempenho de existencia. Voce vale antes do resultado, embora o mundo tente te convencer do contrario.',
    questions: [
      'Onde eu uso produtividade para fugir de sentir?',
      'Que fracasso virou sentenca quando deveria ser informacao?',
      'Que forma de trabalho respeitaria mais o meu corpo e meu tempo?',
    ],
  },
  {
    roman: 'VI',
    title: 'Amor',
    subtitle: 'Quando a falta vira espelho.',
    intro: 'Amor sem consciencia pode virar negociacao de abandono. Aqui voce observa desejo, carencia e escolha com mais nitidez.',
    questions: [
      'Que falta eu tento resolver dentro de outra pessoa?',
      'Onde eu aceito migalhas por medo de atravessar o vazio?',
      'Como seria escolher sem implorar por validacao?',
    ],
  },
  {
    roman: 'VII',
    title: 'Fuga',
    subtitle: 'Quando escapar parece sobreviver.',
    intro: 'Toda fuga comeca como protecao. O ponto e perceber quando ela deixa de proteger e passa a roubar direcao.',
    questions: [
      'Qual comportamento me anestesia, mas cobra caro depois?',
      'De que conversa eu estou fugindo comigo mesmo?',
      'Qual pausa consciente pode substituir a fuga automatica?',
    ],
  },
  {
    roman: 'VIII',
    title: 'Fe',
    subtitle: 'O chao quando a razao falha.',
    intro: 'Fe aqui nao e resposta pronta. E a escolha de manter um fio de presenca quando a mente perdeu o mapa.',
    questions: [
      'O que ainda me sustenta quando ninguem esta vendo?',
      'Que crenca antiga precisa ser revista, nao descartada?',
      'Qual gesto concreto de fe cabe no meu dia de hoje?',
    ],
  },
  {
    roman: 'IX',
    title: 'Continuidade',
    subtitle: 'Permanecer depois do impacto.',
    intro: 'Continuidade e o pacto com o proximo passo. Nao precisa ser grandioso; precisa ser possivel e repetivel.',
    questions: [
      'O que eu preciso manter mesmo quando a motivacao faltar?',
      'Que sinal mostra que eu estou voltando para mim?',
      'Qual compromisso pequeno eu assumo pelas proximas 24 horas?',
    ],
  },
];

const planLabels: Record<Plan, string> = {
  pdf: 'PDF',
  basic: 'Livro + App',
  workbook: 'Diario',
  igent30: 'iGentMIND 30 dias',
  igent90: 'iGentMIND 90 dias',
  group: 'Grupo',
  vip: 'VIP',
};

const eventLabels: Record<string, string> = {
  INVITE_CREATED: 'Convite criado',
  ACCESS_GRANTED: 'Acesso liberado',
  RENEWAL_GRANTED: 'Renovacao',
  ACCESS_REFUNDED: 'Reembolso/chargeback',
  ACCESS_CANCELED: 'Cancelamento',
  IGNORED: 'Ignorado',
  APPROVED_IGNORED: 'Compra ignorada',
  RENEWAL_IGNORED: 'Renovacao ignorada',
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

const pillarCards = [
  { title: 'Reconhecimento', desc: 'O primeiro passo para deixar de pedir licença.', icon: Sparkles, chapter: 2 },
  { title: 'Família', desc: 'Lealdades invisíveis.', icon: Boxes, chapter: 3 },
  { title: 'Vínculo', desc: 'A necessidade de pertencer.', icon: Heart, chapter: 4 },
  { title: 'Luto', desc: 'O que não volta.', icon: Cloud, chapter: 5 },
  { title: 'Trabalho', desc: 'Produção versus valor.', icon: Briefcase, chapter: 6 },
  { title: 'Relacionamento', desc: 'Onde a falta vira espelho.', icon: Heart, chapter: 7 },
  { title: 'Fuga', desc: 'Quando escapar parece sobreviver.', icon: Flame, chapter: 8 },
  { title: 'Fé', desc: 'O chão quando a razão falha.', icon: Sparkles, chapter: 9 },
  { title: 'Continuidade', desc: 'Permanecer depois do impacto.', icon: RotateCcw, chapter: 10 },
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
  if (normalized.includes('prefacio')) return 'Prefácio';
  if (normalized.includes('introducao')) return 'Introdução';
  if (normalized.includes('posfacio')) return 'Posfácio';
  if (normalized.includes('epilogo')) return 'Epílogo';
  if (normalized.includes('carta')) return 'Carta final';
  if (index >= 2 && index <= 10) return `Pilar ${String(index - 1).padStart(2, '0')}`;
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
    chapterHint: 2,
    counterpoint: 'Você pode reconhecer um erro sem entregar sua existência inteira para ele.',
    practice: 'Escreva uma frase começando com: “Eu assumo o que cabe a mim, mas não aceito ser reduzido a isso.”',
    keywords: ['culpa', 'julgamento', 'falha', 'perdao', 'acusacao', 'erro', 'sentenca', 'reconhecimento'],
  },
  recaida: {
    opening: 'Recaída não é volta ao zero. É um ponto do caminho pedindo mais honestidade, não mais punição.',
    firstQuestion: 'O que você está chamando de recaída: um comportamento, um pensamento ou um cansaço?',
    quickReplies: ['Comportamento', 'Pensamento', 'Cansaço', 'Vergonha de tentar de novo'],
    chapterHint: 10,
    counterpoint: 'Quem continua depois de cair não perdeu o processo; está aprendendo onde precisa de apoio.',
    practice: 'Escolha um gesto mínimo para as próximas duas horas. Pequeno o bastante para ser cumprido.',
    keywords: ['recaida', 'continuidade', 'cair', 'recomecar', 'processo', 'vergonha', 'permanecer'],
  },
  luto: {
    opening: 'Luto não é só perda de alguém. Às vezes é perda de uma versão sua que não volta.',
    firstQuestion: 'O que exatamente parece não voltar agora?',
    quickReplies: ['Uma pessoa', 'Uma fase da vida', 'Minha confiança', 'A vontade de continuar'],
    chapterHint: 5,
    counterpoint: 'Aceitar que algo não volta não significa aceitar que nada mais nasce.',
    practice: 'Nomeie a ausência sem brigar com ela. Depois nomeie uma presença pequena que ainda ficou.',
    keywords: ['luto', 'perda', 'ausencia', 'volta', 'despedida', 'vazio', 'saudade'],
  },
  desejo: {
    opening: 'Desejo assusta quando parece maior que a coragem. Mas ele também pode revelar vida onde você só via desistência.',
    firstQuestion: 'O que você deseja e tem medo de admitir?',
    quickReplies: ['Mudar de vida', 'Ser escolhido', 'Ir embora', 'Começar algo meu'],
    chapterHint: 8,
    counterpoint: 'Nem todo desejo é fuga. Alguns são mapas que você ainda não aprendeu a ler.',
    practice: 'Pergunte: “Esse desejo me tira de mim ou me devolve para mim?”',
    keywords: ['desejo', 'fuga', 'mudanca', 'vontade', 'medo', 'ir embora', 'reconstrucao'],
  },
  fe: {
    opening: 'Fé quebrada não é ausência de profundidade. Às vezes é a alma recusando respostas fáceis.',
    firstQuestion: 'O que quebrou primeiro: sua crença, sua confiança ou sua paciência?',
    quickReplies: ['Minha crença', 'Minha confiança', 'Minha paciência', 'Minha esperança'],
    chapterHint: 9,
    counterpoint: 'Você não precisa fingir certeza para continuar. Presença já é uma forma de fé.',
    practice: 'Respire e diga: “Hoje eu não preciso explicar tudo. Preciso só não me abandonar.”',
    keywords: ['fe', 'esperanca', 'crenca', 'presenca', 'certeza', 'alma', 'sentido'],
  },
  solidao: {
    opening: 'Solidão machuca mais quando vira prova de que você não importa. Essa prova é falsa.',
    firstQuestion: 'Sua solidão hoje parece abandono, invisibilidade ou proteção?',
    quickReplies: ['Abandono', 'Invisibilidade', 'Proteção', 'Cansaço de pedir presença'],
    chapterHint: 4,
    counterpoint: 'Estar sem companhia não confirma que você é impossível de amar.',
    practice: 'Mande uma mensagem simples para alguém seguro ou escreva o que você gostaria de ouvir.',
    keywords: ['solidao', 'vinculo', 'abandono', 'pertencer', 'invisibilidade', 'companhia'],
  },
  fracasso: {
    opening: 'Fracasso é uma palavra pesada demais para um recorte da sua história.',
    firstQuestion: 'Quem te ensinou a chamar esse momento de fracasso?',
    quickReplies: ['Minha família', 'Comparação', 'Eu mesmo', 'O dinheiro/trabalho'],
    chapterHint: 6,
    counterpoint: 'Resultado ruim não é identidade ruim. Você é mais amplo que a última tentativa.',
    practice: 'Liste três coisas que você aprendeu sem transformar aprendizado em castigo.',
    keywords: ['fracasso', 'trabalho', 'valor', 'resultado', 'producao', 'comparacao', 'tentativa'],
  },
  ansiedade: {
    opening: 'Ansiedade tenta te sequestrar para um futuro que ainda não aconteceu. Vamos voltar um passo.',
    firstQuestion: 'O medo está apontando para qual cenário?',
    quickReplies: ['Vou perder algo', 'Vão me rejeitar', 'Não vou dar conta', 'Algo ruim vai acontecer'],
    chapterHint: 2,
    counterpoint: 'Prever desastre não é o mesmo que estar preparado. Preparação começa no corpo presente.',
    practice: 'Solte os ombros, descruze a mandíbula e conte cinco objetos ao seu redor.',
    keywords: ['ansiedade', 'medo', 'futuro', 'desastre', 'corpo', 'presenca', 'controle'],
  },
  pressao: {
    opening: 'Pressão vira prisão quando tudo parece urgente e nada parece suficiente.',
    firstQuestion: 'Qual cobrança está falando mais alto agora?',
    quickReplies: ['Ser forte', 'Dar resultado', 'Não decepcionar', 'Resolver tudo hoje'],
    chapterHint: 10,
    counterpoint: 'Você não precisa carregar como prova de valor aquilo que está te quebrando.',
    practice: 'Escolha uma coisa para adiar sem culpa e uma coisa pequena para concluir.',
    keywords: ['pressao', 'cobranca', 'urgencia', 'valor', 'trabalho', 'continuidade', 'cansaco'],
  },
};

export function App() {
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
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [pageIndex, setPageIndex] = useState(0);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentUrl: null,
    title: null,
    currentTime: 0,
    duration: 0,
    volume: 0.84,
    playbackRate: 1,
  });
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
  const readerName = authUser?.name?.trim() || authName || 'Sobrevivente';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<AudioContext | null>(null);
  const lastAudioTickRef = useRef(0);

  const selectedChapter = bookChapters[currentChapterIndex] ?? bookChapters[0];
  const pages = usePagination(selectedChapter.content);
  const bookPageData = useMemo(() => {
    let cursor = 0;
    const chapterPages = bookChapters.map((chapter) => {
      const pageCount = paginateParagraphs(chapter.content).length;
      const start = cursor;
      cursor += pageCount;
      return { start, pageCount };
    });
    return { chapterPages, totalPages: cursor };
  }, []);
  const currentGlobalPage = (bookPageData.chapterPages[currentChapterIndex]?.start ?? 0) + pageIndex + 1;
  const readProgress = Math.round(((currentChapterIndex + 1) / Math.max(1, bookChapters.length)) * 100);
  const audioProgress = audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0;
  const hasPdfAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.pdf);
  const hasReaderAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.base);
  const hasWorkbookAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.workbook);
  const hasMindAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.igentMind30) || hasLocalEntitlement(plan, PRODUCT_KEYS.igentMind90) || hasLocalEntitlement(plan, PRODUCT_KEYS.vip);
  const hasGroupAccess = hasLocalEntitlement(plan, PRODUCT_KEYS.group);
  const hasOrderBump = hasWorkbookAccess || hasMindAccess || hasGroupAccess;
  const isAdmin = authUser?.role === 'ADMIN';
  const currentProducts = (authUser?.products?.length ? authUser.products : Object.values(PRODUCT_KEYS).filter((productKey) => hasLocalEntitlement(plan, productKey as ProductKey)));

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

  useEffect(() => {
    const audio = new Audio();
    audio.volume = audioState.volume;
    audio.playbackRate = audioState.playbackRate;
    audioRef.current = audio;

    const handleTime = () => {
      const now = window.performance.now();
      if (now - lastAudioTickRef.current < 240) return;
      lastAudioTickRef.current = now;
      setAudioState((state) => ({ ...state, currentTime: audio.currentTime }));
    };
    const handleMeta = () => setAudioState((state) => ({ ...state, duration: audio.duration || 0 }));
    const handleEnd = () => setAudioState((state) => ({ ...state, isPlaying: false, currentTime: 0 }));

    audio.addEventListener('timeupdate', handleTime);
    audio.addEventListener('loadedmetadata', handleMeta);
    audio.addEventListener('ended', handleEnd);

    const savedToken = localStorage.getItem('opd_token');
    const savedAuthUser = getStoredAuthUser();
    const savedPlan = localStorage.getItem('opd_plan') as Plan | null;
    const savedChapter = Number(localStorage.getItem('opd_chapter_index') ?? '0');
    const savedPage = Number(localStorage.getItem('opd_page_index') ?? '0');
    const savedFavorites = JSON.parse(localStorage.getItem('opd_favorites') ?? '[]');
    const onboardingDone = localStorage.getItem('opd_onboarding_done');
    const savedWorkbook = loadLocalWorkbookEntry();
    const savedWorkbookAnswers = loadLocalWorkbookAnswers();

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
    if (Array.isArray(savedFavorites)) setFavorites(savedFavorites);
    setWorkbookEntry(savedWorkbook);
    setWorkbookAnswers(savedWorkbookAnswers);

    const params = new URLSearchParams(window.location.search);
    const checkoutToken = params.get('token');
    if (checkoutToken) {
      setToken(checkoutToken.trim().toUpperCase());
      setAuthMode('register');
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTime);
      audio.removeEventListener('loadedmetadata', handleMeta);
      audio.removeEventListener('ended', handleEnd);
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
        setAudioState((state) => ({ ...state, isPlaying: false }));
      } else {
        audio.play().catch(() => {});
        setAudioState((state) => ({ ...state, isPlaying: true }));
      }
      return;
    }

    audio.src = url;
    audio.currentTime = 0;
    audio.volume = audioState.volume;
    audio.playbackRate = audioState.playbackRate;
    audio.play().catch(() => {});
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

  const handleCompleteOnboarding = () => {
    localStorage.setItem('opd_onboarding_done', 'true');
    navigate(ROUTES.HOME);
  };

  const unlockOrderBump = (nextPlan: Plan = 'vip') => {
    playClick('primary');
    localStorage.setItem('opd_plan', nextPlan);
    setPlan(nextPlan);
    setAuthUser((current) => current ? { ...current, plan: nextPlan } : current);
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
    setCurrentChapterIndex(clamp(index, 0, bookChapters.length - 1));
    navigate(ROUTES.READER);
  };

  const toggleFavorite = (chapterId: string) => {
    playClick('soft');
    setFavorites((current) =>
      current.includes(chapterId) ? current.filter((id) => id !== chapterId) : [...current, chapterId]
    );
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
    if (routeId === ROUTES.ADMIN) return !isAdmin;
    return false;
  };

  const AccessView = () => (
    <main className="cover-gate page-enter">
      <div className="cover-orbit" />
      <section className="cover-card">
        <img className="access-brand-logo" src="/media/imagens/brand/lettering_logo_fp.webp" alt="O Poder dos Desacreditados" />
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
        </div>
      </section>
    </main>
  );

  const Header = () => (
    <header className="app-header">
      <button className="icon-button lg:hidden" onClick={() => setMenuOpen((value) => !value)} title="Abrir menu">
        <Menu size={20} />
      </button>
      <div className="brand-lockup">
        <img src="/media/imagens/brand/lettering_logo_fp.webp" alt="" />
        <div>
          <p>O Poder dos Desacreditados</p>
          <strong>{route === ROUTES.IGENT ? 'iGentMIND' : 'Leitura guiada'}</strong>
        </div>
      </div>
      <div className="header-actions">
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
        <img src="/media/imagens/brand/lettering_logo_fp.webp" alt="" />
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
                    navigate(ROUTES.HOME);
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
              <span>Baixe o livro e volte para destravar app, audios, Diario e iGentMIND quando seu pedido incluir esses modulos.</span>
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
            <Button onClick={() => unlockOrderBump('basic')} variant="secondary"><Lock size={17} /> Simular app</Button>
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
          <Button onClick={() => navigate(ROUTES.LIBRARY)} variant="secondary">Capítulos</Button>
        </div>
        <div className="home-slide-dots">
          {homeSlides.map((slide, index) => (
            <button key={slide} className={index === homeSlideIndex ? 'active' : ''} onClick={() => setHomeSlideIndex(index)} title={`Imagem ${index + 1}`} />
          ))}
        </div>
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
          <span>{hasMindAccess ? 'Seu token libera mentor, perguntas guiadas e workbook editavel.' : hasWorkbookAccess ? 'Seu Diario esta ativo. O proximo nivel libera o mentor iGentMIND.' : 'Simulacao local do upsell: Diario, mentor treinado nos pilares e acesso ao grupo quando contratado.'}</span>
        </div>
        {hasOrderBump ? (
          <Button onClick={() => navigate(ROUTES.WORKBOOK)} variant="secondary"><FileText size={17} /> Abrir Diário</Button>
        ) : (
          <Button onClick={() => unlockOrderBump('workbook')}><Zap size={17} /> Simular Diário</Button>
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
        <button onClick={() => navigate(ROUTES.LIBRARY)}><Boxes size={17} /> Ver os 9 Pilares</button>
      </div>
    </div>
  );

  const OnboardingView = () => {
    if (onboardingStep >= onboardingSteps.length) return HomeView();
    const currentStep = onboardingSteps[onboardingStep];

    return (
      <>
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
        <HomeView />
      </>
    );
  };

  const LibraryView = () => (
    <div className="app-page page-enter">
      <div className="page-heading">
        <div>
          <p className="kicker">Biblioteca</p>
          <h1>Escolha um pilar</h1>
        </div>
      </div>
      <label className="search-field library-search">
        <Search size={18} />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar pilar..." />
      </label>
      <div className="pillar-list">
        {pillarCards
          .filter((pillar) => !searchQuery || `${pillar.title} ${pillar.desc}`.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article className="pillar-row" key={pillar.title}>
                <div className="pillar-icon"><Icon size={22} /></div>
                <button className="pillar-copy" onClick={() => goToChapter(pillar.chapter)}>
                  <strong>{pillar.title}</strong>
                  <span>{pillar.desc}</span>
                </button>
                <button className="heart-button" onClick={() => toggleFavorite(`pillar-${pillar.title}`)}><Heart size={19} /></button>
                <button className="chevron-button" onClick={() => goToChapter(pillar.chapter)}><ChevronDown size={20} /></button>
              </article>
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
        globalPage={currentGlobalPage}
        totalBookPages={bookPageData.totalPages}
        chapterPage={pageIndex + 1}
        chapterPageTotal={pages.length}
        chapterIndex={currentChapterIndex}
        chapterTotal={bookChapters.length}
        chapterKind={getChapterKind(currentChapterIndex, selectedChapter.title)}
        coverImageUrl="/media/imagens/capas/capa-topo.jpg"
        audioUrl={selectedChapter.audioUrl}
        pdfUrl={pdfUrl}
        playAudio={handlePlayAudio}
        isFavorite={favorites.includes(selectedChapter.id)}
        onToggleFavorite={() => toggleFavorite(selectedChapter.id)}
        onFontIncrease={() => setFontSize((size) => clamp(size + 1, 14, 28))}
        onFontDecrease={() => setFontSize((size) => clamp(size - 1, 14, 28))}
        onOpenPdf={() => window.open(pdfUrl, '_blank')}
        onShare={handleShareChapter}
      />
    </div>
  );

  const LockedView = ({ title }: { title: string }) => (
    <div className="app-page page-enter">
      <section className="locked-panel">
        <div className="mentor-mark"><Lock size={20} /></div>
        <p className="kicker">Função extra</p>
        <h1>{title}</h1>
        <p>Este recurso faz parte do order bump: iGentMIND + Diário dos Desacreditados. Nesta versão local, você pode simular o desbloqueio para validar a experiência.</p>
        <Button onClick={() => unlockOrderBump('vip')}><Zap size={17} /> Liberar localmente</Button>
      </section>
    </div>
  );

  const WorkbookView = () => {
    if (!hasWorkbookAccess) return <LockedView title="Diário bloqueado" />;
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
        `Diario dos Desacreditados\n\nPergunta-guia: ${workbookPrompt}\n\n${workbookEntry}\n\n---\n\n${guidedAnswers}`,
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
                    placeholder="Responda sem pressa. O ponto aqui e honestidade, nao performance."
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
                <p>{currentText.trim() ? `Pelo que voce escreveu em ${currentPillar.title}, o caminho mais util agora e transformar percepcao em um gesto pequeno.` : 'Escreva uma resposta para eu cruzar seu estado com os pilares do livro.'}</p>
                <div className="mind-tags">
                  <span>{currentPillar.title}</span>
                  <span>{linkedTopic.title}</span>
                  <span>{planLabels[plan]}</span>
                </div>
                <div className="recommendation-mini">
                  <strong>Trecho sugerido</strong>
                  <p>{trimExcerpt(bookChapters[workbookPillarIndex]?.summary || selectedChapter.summary, 120)}</p>
                </div>
                <Button onClick={() => startMindSession(linkedTopic)}><Zap size={17} /> Conversar com iGentMIND</Button>
              </>
            ) : (
              <>
                <p>Este painel cruza suas respostas com temas do livro e sugere capitulos, audios e contrapontos.</p>
                <Button onClick={() => unlockOrderBump('igent30')}><Zap size={17} /> Simular iGent 30 dias</Button>
              </>
            )}
            <span>{savedAt ? 'Salvo localmente' : 'Salvamento automatico ativo'}</span>
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
          <div className="setting-row"><span>Token</span><strong>{localStorage.getItem('opd_token') ?? 'nenhum'}</strong></div>
          <div className="setting-row"><span>Recorrência</span><strong>{hasMindAccess || hasGroupAccess ? 'Preparada' : 'Não ativa'}</strong></div>
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

  const renderMain = () => {
    switch (route) {
      case ROUTES.ACCESS: return AccessView();
      case ROUTES.ONBOARDING: return OnboardingView();
      case ROUTES.HOME: return HomeView();
      case ROUTES.BOOK: return hasReaderAccess ? BookView() : <LockedView title="Livro interativo bloqueado" />;
      case ROUTES.LIBRARY: return hasReaderAccess ? LibraryView() : <LockedView title="Biblioteca bloqueada" />;
      case ROUTES.SESSIONS: return hasReaderAccess ? SessionsView() : <LockedView title="Áudios bloqueados" />;
      case ROUTES.IGENT: return hasMindAccess ? IGentMindView() : <LockedView title="iGentMIND bloqueado" />;
      case ROUTES.FAVORITES: return FavoritesView();
      case ROUTES.WORKBOOK: return WorkbookView();
      case ROUTES.MANIFESTO: return ManifestoView();
      case ROUTES.SETTINGS: return SettingsView();
      case ROUTES.ADMIN: return isAdmin ? AdminView() : <LockedView title="Painel administrativo bloqueado" />;
      case ROUTES.READER: return hasReaderAccess ? ReaderView() : <LockedView title="Leitor bloqueado" />;
      default: return HomeView();
    }
  };

  if (route === ROUTES.ACCESS) return AccessView();

  return (
    <div className="app-shell">
      {Header()}
      <div className="app-body">
        {Navigation()}
        <main id="main" className="app-main">{renderMain()}</main>
      </div>
      {audioState.currentUrl && (
        <div className="audio-dock pro-player">
          <div className="player-glow" />
          <div className="player-cover"><Music2 size={20} /></div>
          <div className="player-info">
            <p>Tocando agora</p>
            <strong>{audioState.title}</strong>
            <div className="player-wave-progress" style={{ '--audio-progress': `${audioProgress || 0}%` } as React.CSSProperties}>
              <SiriWaveVisualizer active={audioState.isPlaying} intensity={1.05 + audioState.volume * 1.15} />
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
          <label className="volume-control">
            <Volume2 size={18} />
            <input type="range" min="0" max="100" value={Math.round(audioState.volume * 100)} onChange={(event) => changeVolume(Number(event.target.value))} />
          </label>
          <button className="speed-control" onClick={changePlaybackRate} title="Velocidade do áudio">
            {audioState.playbackRate % 1 === 0 ? audioState.playbackRate.toFixed(0) : audioState.playbackRate.toFixed(2).replace(/0$/, '')}x
          </button>
          <button className="player-play" onClick={() => handlePlayAudio(audioState.currentUrl, audioState.title)}>
            {audioState.isPlaying ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
          </button>
          <button className="player-close" onClick={closeAudio}><X size={22} /></button>
        </div>
      )}
    </div>
  );
}
