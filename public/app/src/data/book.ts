import { bookContent as rawBookContent } from '../../bkp/livro';

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

const audioMap: Record<number, string | null> = {
  0: '/media/audios/livro/prefacio/prefacio.wav',
  1: '/media/audios/livro/introducao/introducao.mp3',
  2: '/media/audios/livro/pilar-01-reconhecimento/p1-manifesto.wav',
  3: '/media/audios/livro/pilar-02-familia/p2-manifesto.wav',
  4: '/media/audios/livro/pilar-03-vinculo/p3-manifesto.wav',
  5: '/media/audios/livro/pilar-04-luto/p4-manifesto.wav',
  6: '/media/audios/livro/pilar-05-trabalho/p5-manifesto.wav',
  7: '/media/audios/livro/pilar-06-relacionamento/p6-manifesto.wav',
  8: '/media/audios/livro/pilar-07-fuga/p7-manifesto.wav',
  9: '/media/audios/livro/pilar-08-fe/p8-manifesto.wav',
  10: '/media/audios/livro/pilar-09-continuidade/p9-manifesto.wav',
  11: '/media/audios/livro/carta-final/carta-final.mp3',
  12: '/media/audios/livro/epilogo/epilogo.mp3',
};

export type BookChapter = {
  id: string;
  chapter: string | number;
  title: string;
  summary: string;
  content: string[];
  audioUrl: string | null;
};

const summaryFromContent = (content: string[]) => {
  const text = content?.[0] ?? '';
  return text.length > 140 ? `${text.slice(0, 140).trim()}...` : text;
};

export const bookChapters: BookChapter[] = rawBookContent.map((chapter: any, index: number) => {
  const content = Array.isArray(chapter.content) ? chapter.content : [String(chapter.content ?? '')];
  return {
    id: `chapter-${index}`,
    chapter: chapter.chapter ?? index + 1,
    title: chapter.title ?? `Capítulo ${index + 1}`,
    summary: summaryFromContent(content),
    content,
    audioUrl: audioMap[index] ?? null,
  };
});
