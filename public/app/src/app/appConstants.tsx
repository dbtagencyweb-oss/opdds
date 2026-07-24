import {
  AlertCircle,
  AudioLines,
  BookOpen,
  Boxes,
  Brain,
  Briefcase,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Heart,
  Home,
  Library,
  Mail,
  RotateCcw,
  Settings,
  Shield,
  Sparkles,
  User,
  Users,
  Volume2,
  Zap,
} from 'lucide-react';
import { bookChapters, getChapterIndexForPillar } from '../data/book';
import { repairCanonicalText } from '../data/canonicalBook';
import {
  type MindPhaseId,
  type MindProtocolOption,
} from '../data/igentMindProtocol';
import {
  type PrimarySignal,
  type SecondarySignal,
  type SignalAnalysisResult,
} from '../data/igentMindSignals';
import { PRODUCT_KEYS, type ProductKey } from '../config/products';
import type { LocalPlan } from '../services/entitlements';
export const ROUTES = {
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

export type Route = typeof ROUTES[keyof typeof ROUTES];
export type Plan = LocalPlan;
export type AdminSection = 'overview' | 'readers' | 'book' | 'sensory' | 'kiwify' | 'plans' | 'copy';

export type AudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  coverUrl?: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
};

export type AmbientAudioState = {
  isPlaying: boolean;
  currentUrl: string | null;
  title: string | null;
  coverUrl?: string | null;
  volume: number;
};

export type AudioQueueItem = {
  url: string;
  title: string;
  label: string;
  chapterIndex: number;
  chapterId: string;
  chapterTitle: string;
  trackIndex: number;
  coverUrl?: string | null;
};

export type SensoryTrack = {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  coverUrl?: string;
};

export type SaveFeedback = 'idle' | 'saving' | 'saved';
export type AdminAudioProductionStatus = 'ok' | 'review' | 'record' | 'placeholder';
export type MarketingGoal = 'awareness' | 'conversion' | 'retargeting' | 'community';
export type MarketingChannel = 'ads' | 'whatsapp' | 'email' | 'salesPage' | 'onboarding';
export type MarketingProduct = 'book' | 'workbook' | 'igent' | 'community' | 'vip';

export const ADMIN_AUDIO_PRODUCTION_KEY = 'opd_admin_audio_production';
export const ADMIN_AUDIO_ORDER_KEY = 'opd_admin_audio_order';
export const ADMIN_SUPPORT_AUDIO_KEY = 'opd_admin_support_audio';
export const ADMIN_READING_TRACKS_KEY = 'opd_admin_reading_tracks';
export const ADMIN_CANONICAL_DRAFTS_KEY = 'opd_admin_canonical_block_drafts_v1';
export const SELECTED_READING_TRACK_KEY = 'opd_selected_reading_track';
export const ADMIN_SENSORY_PLAYLIST_KEY = ADMIN_READING_TRACKS_KEY;
export const SELECTED_SENSORY_TRACK_KEY = SELECTED_READING_TRACK_KEY;
export const WORKBOOK_INTRO_KEY = 'opd_workbook_intro_dismissed';
export const WORKBOOK_WELCOME_AUDIO = '/media/audios/manifesto/boas-vindas.mp3';

export const defaultSupportAudios: SensoryTrack[] = [
  { id: 'sobrevivencia', title: 'Sobrevivência', text: 'Para dias em que a leitura precisa ser curta e segura.', audioUrl: '/media/audios/home/sobrevivencia.mp3' },
  { id: 'reconstrucao', title: 'Reconstrução', text: 'Para voltar a organizar a força sem pressa.', audioUrl: '/media/audios/home/reconstrucao.mp3' },
  { id: 'continuidade', title: 'Continuidade', text: 'Para sustentar o eixo depois do impacto.', audioUrl: '/media/audios/home/continuidade.mp3' },
];

export const defaultReadingTracks: SensoryTrack[] = [
  { id: 'silencio-dourado', title: 'Silêncio dourado', text: 'Trilha instrumental discreta para ler com presença.', audioUrl: '/media/audios/trilhas/silencio-dourado.mp3' },
];
export const defaultSensoryPlaylist = defaultReadingTracks;

export const marketingGoalLabels: Record<MarketingGoal, string> = {
  awareness: 'Topo de funil',
  conversion: 'Conversão direta',
  retargeting: 'Retargeting',
  community: 'Comunidade',
};

export const marketingChannelLabels: Record<MarketingChannel, string> = {
  ads: 'Anúncios',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  salesPage: 'Página de vendas',
  onboarding: 'Onboarding',
};

export const marketingProductLabels: Record<MarketingProduct, string> = {
  book: 'Livro + App + Áudios',
  workbook: 'Diário dos Desacreditados',
  igent: 'iGentMIND',
  community: 'Comunidade Viva',
  vip: 'Pacote VIP',
};

export const marketingProductAngles: Record<MarketingProduct, { promise: string; mechanism: string; cta: string }> = {
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

export const marketingGoalAngles: Record<MarketingGoal, string> = {
  awareness: 'para quem ainda não sabe nomear o próprio cansaço',
  conversion: 'para quem já entendeu que precisa parar de se abandonar',
  retargeting: 'para quem viu a proposta, mas ainda está tentando decidir se merece continuar',
  community: 'para quem não quer atravessar a obra sozinho depois do primeiro impacto',
};

export const audioProductionLabels: Record<AdminAudioProductionStatus, string> = {
  ok: 'OK',
  review: 'Revisar',
  record: 'Regravar',
  placeholder: 'Placeholder',
};

export const workbookTransitionPhrases = [
  'Reconhecimento abre espaço. Família mostra o que preencheu esse espaço antes de você poder escolher.',
  'Família dá nome às lealdades. Luto mostra o que ainda ficou sem despedida.',
  'Luto reconhece a ausência. Trabalho pergunta quanto valor você colocou na utilidade.',
  'Trabalho separa valor de desempenho. Dor mostra onde você aprendeu a fugir para continuar.',
  'Dor revela a anestesia. Desejo devolve permissão para querer sem pedir desculpas.',
  'Desejo aponta o que ainda chama. Fé pergunta o que sobrou quando acreditar cansou.',
  'Fé atravessa o não saber. Escassez mostra onde a falta virou identidade.',
  'Escassez devolve escala. Vazio ensina a permanecer sem respostas prontas.',
];

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const AUDIO_BAR_COUNT = 18;
export const idleAudioBars = Array.from({ length: AUDIO_BAR_COUNT }, () => 0.08);

export const AudioFrequencyBars = ({ values }: { values: number[] }) => (
  <div className="audio-frequency-bars" aria-hidden="true">
    {values.map((value, index) => (
      <span
        key={index}
        style={{ '--bar-level': String(Math.max(0.06, Math.min(1, value || 0.08))) } as React.CSSProperties}
      />
    ))}
  </div>
);

export const PasswordField = ({
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

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
};

export const navGroups = [
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

export const homeSlides = [
  '/media/imagens/capas/capa.webp',
  '/media/imagens/capas/capa.webp',
];

export const journeyStates = [
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

export const workbookPrompts = [
  'O que eu estou tentando carregar sem admitir?',
  'Qual julgamento antigo voltou a parecer verdade hoje?',
  'Onde eu permaneci mesmo sem ter certeza?',
  'Que pequeno gesto de presença cabe nas próximas horas?',
];

export const workbookPillars = [
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

export const planLabels: Record<Plan, string> = {
  pdf: 'PDF',
  basic: 'Livro + App',
  workbook: 'Diário',
  igent30: 'iGentMIND 30 dias',
  igent90: 'iGentMIND 90 dias',
  group: 'Grupo',
  vip: 'VIP',
};

export type UpgradeKey = 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip';

export const upgradeOffers: Record<UpgradeKey, {
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

export const upgradeActiveProductKeys: Record<UpgradeKey, ProductKey> = {
  basic: PRODUCT_KEYS.base,
  workbook: PRODUCT_KEYS.workbook,
  igent30: PRODUCT_KEYS.igentMind30,
  igent90: PRODUCT_KEYS.igentMind90,
  group: PRODUCT_KEYS.group,
  vip: PRODUCT_KEYS.vip,
};

export const eventLabels: Record<string, string> = {
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

export const eventTone = (eventType: string) => {
  if (eventType.includes('REFUNDED') || eventType.includes('CANCELED') || eventType.includes('REVOKED')) return 'danger';
  if (eventType.includes('IGNORED')) return 'muted';
  if (eventType.includes('GRANTED') || eventType.includes('CREATED')) return 'success';
  return 'neutral';
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskAccessToken = (value?: string | null) => {
  if (!value) return 'nenhum';
  if (value.startsWith('OPDDS_')) return `${value.slice(0, 12)}...${value.slice(-4)}`;
  if (value.startsWith('LOCAL_')) return 'acesso local';
  return `sessão segura ...${value.slice(-8)}`;
};

export const chapterIndexForPillar = getChapterIndexForPillar;

export const audioForPillar = (pillarIndex: number, preferredLabel = 'manifesto') => {
  const chapter = bookChapters[chapterIndexForPillar(pillarIndex)];
  return chapter?.audioTracks.find((track) => track.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(preferredLabel))?.url
    ?? chapter?.audioTracks[0]?.url
    ?? '';
};

export const pillarCards = [
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

export const mentorTopics = [
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

export const mindTerritoryAudioUrls = Array.from({ length: 9 }, (_, pillarIndex) => audioForPillar(pillarIndex));

export const mindTriads = [
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

export type MindEntryIntent = 'understand' | 'reflect' | 'act' | 'continue';

export const mindEntryIntents: Array<{
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

export const sensoryClicks = {
  primary: { frequency: 520, duration: 0.055 },
  soft: { frequency: 320, duration: 0.04 },
};

export type MindTriageOption = {
  id: string;
  semantic_position?: MindProtocolOption['semantic_position'];
  primary_signal?: PrimarySignal;
  secondary_signals?: SecondarySignal[];
  label: string;
  signal: string;
  response: string;
  load?: 1 | 2 | 3;
};

export type MindTriageQuestion = {
  id: string;
  phase?: MindPhaseId;
  prompt: string;
  openPrompt?: string;
  options: MindTriageOption[];
};

export type MindTriageAnswer = {
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

export type MindMessage = {
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

export type MindRecommendation = {
  chapterIndex: number;
  title: string;
  excerpt: string;
  reason: string;
  audioUrl: string | null;
};

export type MindSavedPlan = {
  topicId: string;
  topicTitle: string;
  source: 'chat' | 'home' | 'workbook' | 'reader';
  prompt: string;
  response: string;
  chapterIndex: number;
  createdAt: string;
};

export const mindTriageBank: Record<number, MindTriageQuestion[]> = {
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

export const MIND_LAST_PLAN_KEY = 'opd_mind_last_plan';
export const MIND_DATA_SCOPES_KEY = 'opd_mind_data_scopes';
export type MindDataScopes = {
  diary: boolean;
  caderno: boolean;
  letters: boolean;
  notes: boolean;
  anchors: boolean;
  pastSessions: boolean;
  readingProgress: boolean;
};
export const DEFAULT_MIND_DATA_SCOPES: MindDataScopes = {
  diary: false,
  caderno: false,
  letters: false,
  notes: false,
  anchors: false,
  pastSessions: false,
  readingProgress: false,
};
export const MIND_SCOPE_OPTIONS: Array<{ key: keyof MindDataScopes; label: string }> = [
  { key: 'readingProgress', label: 'progresso de leitura' },
  { key: 'diary', label: 'Diário' },
  { key: 'caderno', label: 'Cadernos de presença' },
  { key: 'letters', label: 'cartas privadas' },
  { key: 'notes', label: 'notas e marcações' },
  { key: 'anchors', label: 'âncoras salvas' },
  { key: 'pastSessions', label: 'conversas anteriores' },
];
export const loadMindDataScopes = (): MindDataScopes => {
  try {
    return { ...DEFAULT_MIND_DATA_SCOPES, ...JSON.parse(localStorage.getItem(MIND_DATA_SCOPES_KEY) || '{}') };
  } catch {
    return DEFAULT_MIND_DATA_SCOPES;
  }
};
export const APP_VERSION = 'v1.3.0';

export const repairMojibake = (value = '') => {
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

export const repairBrokenPdfCharacters = (value = '') => {
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

export const normalizeForSearch = (value = '') =>
  repairBrokenPdfCharacters(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const audioTrackKey = (value = '') =>
  normalizeForSearch(value)
    .replace(/^(p\d+\s*)?/, '')
    .replace(/\s+/g, '-')
    .trim();

export const compactLetterSpacedLine = (line: string) => {
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

export const cleanBookEditorText = (value = '') =>
  repairBrokenPdfCharacters(value)
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => compactLetterSpacedLine(line))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

export const getChapterKind = (index: number, title = '') => {
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

export const trimExcerpt = (value = '', limit = 260) => {
  const clean = repairMojibake(value).replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).replace(/\s+\S*$/, '').trim()}...`;
};

export const mindGuides: Record<string, {
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
