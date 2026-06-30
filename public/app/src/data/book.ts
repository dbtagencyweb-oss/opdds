import { bookContent as rawBookContent } from '../../bkp/livro';
import { bookStructure } from './bookStructure';

export const accessTokens = ['PDF-OPDDS', 'OPDDS-2026', 'DESACREDITADOS', 'DIARIO-OPDDS', 'MIND-30', 'MIND-90', 'GRUPO-OPDDS', 'VIP-ALMA', 'DEMO123', 'FUNDADOR'];
export const accessTokenPlans: Record<string, 'pdf' | 'basic' | 'workbook' | 'igent30' | 'igent90' | 'group' | 'vip'> = {
  'PDF-OPDDS': 'pdf',
  'OPDDS-2026': 'basic',
  DESACREDITADOS: 'basic',
  'DIARIO-OPDDS': 'workbook',
  'MIND-30': 'igent30',
  'MIND-90': 'igent90',
  'GRUPO-OPDDS': 'group',
  'VIP-ALMA': 'vip',
  DEMO123: 'vip',
  FUNDADOR: 'vip',
};
export const pdfUrl = '/media/downloads/o-poder-dos-desacreditados.pdf';
export const workbookPdfUrl = '/media/downloads/diario-dos-desacreditados.pdf';

export const onboardingSteps = [
  {
    title: 'Limites',
    description: 'Este app não é terapia. É um espaço de acolhimento, leitura e presença.',
    audioUrl: '/media/audios/onboarding/01-limites.mp3',
  },
  {
    title: 'A Tríade',
    description: 'Consciência, Julgamento e Presença como três lentes para ler sem se abandonar.',
    audioUrl: '/media/audios/onboarding/02-triade.mp3',
  },
  {
    title: 'Expectativas',
    description: 'A leitura não promete atalhos. Ela oferece contrapontos para continuar com mais lucidez.',
    audioUrl: '/media/audios/onboarding/03-expectativas.mp3',
  },
  {
    title: 'Quando não usar',
    description: 'Em crise intensa, procure apoio humano e profissional. O app acompanha, mas não substitui cuidado.',
    audioUrl: '/media/audios/onboarding/04-quando-nao-usar.mp3',
  },
  {
    title: 'Portas de entrada',
    description: 'Você pode ler por capítulos, temas, áudio ou rotas de mentor. Escolha o ritmo possível.',
    audioUrl: '/media/audios/onboarding/05-portas.mp3',
  },
  {
    title: 'Entrada',
    description: 'Comece sem pressa. A meta não é performar força; é reconhecer a sua continuidade.',
    audioUrl: '/media/audios/onboarding/06-entrada.mp3',
  },
];

const audioMap: Record<string, string | null> = {
  prefacio: '/media/audios/livro/prefacio/prefacio.wav',
  introducao: '/media/audios/livro/introducao/introducao.mp3',
  reconhecimento: '/media/audios/livro/pilar-01-reconhecimento/p1-manifesto.wav',
  familia: '/media/audios/livro/pilar-02-familia/p2-manifesto.wav',
  luto: '/media/audios/livro/pilar-04-luto/p4-manifesto.wav',
  trabalho: '/media/audios/livro/pilar-05-trabalho/p5-manifesto.wav',
  dor: '/media/audios/livro/pilar-07-fuga/p7-manifesto.wav',
  desejo: '/media/audios/livro/pilar-06-relacionamento/p6-manifesto.wav',
  fe: '/media/audios/livro/pilar-08-fe/p8-manifesto.wav',
  vazio: '/media/audios/livro/pilar-09-continuidade/p9-manifesto.wav',
  'carta-final': '/media/audios/livro/carta-final/carta-final.mp3',
  epilogo: '/media/audios/livro/epilogo/epilogo.mp3',
};

export type BookChapter = {
  id: string;
  chapter: string | number;
  title: string;
  summary: string;
  content: string[];
  audioUrl: string | null;
  audioTracks: Array<{ label: string; url: string }>;
  groupId: string;
  kind: string;
  pdfPage: number;
  pillar?: number;
  roman?: string;
  sections?: readonly string[];
};

const pillarAudioFolders: Record<string, string> = {
  reconhecimento: 'pilar-01-reconhecimento/p1',
  familia: 'pilar-02-familia/p2',
  luto: 'pilar-04-luto/p4',
  trabalho: 'pilar-05-trabalho/p5',
  dor: 'pilar-07-fuga/p7',
  desejo: 'pilar-06-relacionamento/p6',
  fe: 'pilar-08-fe/p8',
  escassez: 'pilar-03-vinculo/p3',
  vazio: 'pilar-09-continuidade/p9',
};

const audioTracksFor = (id: string) => {
  if (id === 'prefacio') return [{ label: 'Prefácio', url: '/media/audios/livro/prefacio/prefacio.wav' }];
  if (id === 'introducao') return [{ label: 'Introdução', url: '/media/audios/livro/introducao/introducao.mp3' }];
  if (id === 'carta-final') return [{ label: 'Carta final', url: '/media/audios/livro/carta-final/carta-final.mp3' }];
  if (id === 'epilogo') return [{ label: 'Epílogo', url: '/media/audios/livro/epilogo/epilogo.mp3' }];
  const base = pillarAudioFolders[id];
  if (!base) return [];
  const tracks = [
    { label: 'Manifesto', url: `/media/audios/livro/${base}-manifesto.wav` },
    { label: 'Narrativa', url: `/media/audios/livro/${base}-narrativa.wav` },
  ];
  if (id === 'reconhecimento') {
    tracks.push(
      { label: 'Consciência', url: `/media/audios/livro/${base}-conciencia.wav` },
      { label: 'Julgamento', url: `/media/audios/livro/${base}-julgamento.wav` },
      { label: 'Presença', url: `/media/audios/livro/${base}-presenca.wav` },
      { label: 'Carta', url: `/media/audios/livro/${base}-carta.wav` },
    );
  }
  return tracks;
};

const repairText = (value = '') => {
  if (!/[Ãðâ]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from(Array.from(value).map((char) => char.charCodeAt(0) & 255));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return value;
  }
};

const frontMatterContent: Record<string, string[]> = {
  'nao-e-autoajuda': [
    'Este livro não nasceu para ensinar você a vencer. Nasceu para acompanhar quem continuou mesmo quando vencer deixou de parecer uma possibilidade real.',
    'Aqui, dor não vira espetáculo, cansaço não vira fracasso e presença vem antes de qualquer pedido de mudança.',
  ],
  'o-desacreditado': [
    'O desacreditado não é necessariamente alguém que desistiu. Muitas vezes é alguém que tentou, permaneceu e seguiu sem testemunha, aplauso ou reconhecimento.',
    'Ele sobreviveu por caminhos pouco celebrados e, por isso, pode confundir cansaço com incapacidade.',
  ],
  'alem-da-autoajuda': [
    'Esta obra se afasta da obrigação de transformar toda dor em superação visível.',
    'Antes de propor ação, sustenta presença. Antes de oferecer resposta, permite que a pergunta exista sem violência.',
  ],
  'triade-humana': [
    'A Tríade Humana Fundamental organiza a experiência em três movimentos: Consciência, Julgamento e Presença.',
    'Consciência percebe. Julgamento cria uma narrativa. Presença permite permanecer sem transformar essa narrativa em identidade.',
  ],
  'autor-ferramenta-presenca': [
    'Escrever também foi um exercício da Tríade: consciência do vivido, julgamento sobre como seria recebido e presença para sustentar a decisão.',
    'Ferramentas organizam linguagem e estrutura. A experiência e a responsabilidade continuam humanas.',
  ],
  'dualidade-trialidade': [
    'A dualidade empurra para extremos: vencer ou perder, força ou fraqueza, agir ou desistir.',
    'A trialidade abre um terceiro espaço entre o que sentimos e a reação automática.',
  ],
};

const sourceById: Record<string, any> = {
  prefacio: rawBookContent[0],
  introducao: rawBookContent[1],
  reconhecimento: rawBookContent[2],
  familia: rawBookContent[3],
  luto: rawBookContent[4],
  trabalho: rawBookContent[5],
  dor: rawBookContent[6],
  desejo: rawBookContent[7],
  fe: rawBookContent[8],
  escassez: rawBookContent[9],
  vazio: rawBookContent[10],
  'carta-final': rawBookContent[11],
  epilogo: rawBookContent[12],
};

export const bookChapters: BookChapter[] = bookStructure.map((item, index) => {
  const source = sourceById[item.id];
  const sourceContent = Array.isArray(source?.content) ? source.content : [];
  const content = (frontMatterContent[item.id] ?? sourceContent).map((paragraph) => repairText(String(paragraph ?? '')));
  return {
    id: item.id,
    chapter: item.pillar ?? index + 1,
    title: item.title,
    summary: item.summary,
    content,
    audioUrl: audioMap[item.id] ?? null,
    audioTracks: audioTracksFor(item.id),
    groupId: item.groupId,
    kind: item.kind,
    pdfPage: item.pdfPage,
    pillar: 'pillar' in item ? item.pillar : undefined,
    roman: 'roman' in item ? item.roman : undefined,
    sections: 'sections' in item ? item.sections : undefined,
  };
});
