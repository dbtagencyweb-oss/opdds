import { bookContent as rawBookContent } from '../../bkp/livro';
import { artifactBookData } from './artifactBookData';
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

const audioTrack = (label: string, url: string) => ({ label, url });
const audioBase = '/media/audios/livro';

const tracksFromFiles = (folder: string, files: Array<[string, string]>) =>
  files.map(([label, file]) => audioTrack(label, `${audioBase}/${folder}/${file}`));

const pillarTracks = (
  folder: string,
  prefix: string,
  territory: [string, string],
  options: { hasRegra?: boolean; concienciaFile?: string; hasOpening?: boolean } = {},
) => {
  const concienciaFile = options.concienciaFile ?? `${prefix}-conciencia.wav`;
  const tracks: Array<[string, string]> = [
    ...(options.hasOpening === false ? [] : [['Abertura', `${prefix}-abertura.wav`] as [string, string]]),
    territory,
    ['Manifesto de Abertura', `${prefix}-manifesto.wav`],
    ['Narrativa Profunda', `${prefix}-narrativa.wav`],
    ['Consci\u00eancia', concienciaFile],
    ['Julgamento', `${prefix}-julgamento.wav`],
    ['Presen\u00e7a', `${prefix}-presenca.wav`],
    ['Carta de Sustenta\u00e7\u00e3o', `${prefix}-carta.wav`],
    ['\u00c2ncora Pr\u00e1tica', `${prefix}-ancora.wav`],
  ];
  if (options.hasRegra) tracks.push(['A Regra', `${prefix}-regra.wav`]);
  tracks.push(['Fecho do Pilar', `${prefix}-fecho.wav`]);
  return tracksFromFiles(folder, tracks);
};

const interludeTracks = (folder: string) => tracksFromFiles(folder, [
  ['Fenda', 'interludio-fenda.wav'],
  ['Manifesto de Abertura', 'interludio_manifesto.wav'],
]);

export const bookAudioCatalog: Record<string, Array<{ label: string; url: string }>> = {
  'capa-digital': [],
  epigrafe: [],
  'nota-do-autor': [],
  creditos: [],
  manifesto: tracksFromFiles('1-manifesto', [['O mundo costuma valorizar quem chega', 'o-mundo-costuma-valorizar-quem-chega.wav']]),
  abertura: tracksFromFiles('2-abertura', [['Este livro nasceu de viv\u00eancias reais', 'este-livro-nasceu-de-vivencias-reais.wav']]),
  quebra1: tracksFromFiles('3-quebra-de-expectativa/1-porque-esse-livro-nao-e-autoajuda', [
    ['Abertura', '1-porque-nao-e-autoajuda.wav'],
    ['Este livro desacelera', '2-este-livro-desacelera.wav'],
    ['Uma Obra Pensada Para Mentes Criativas e Cansadas', '3-para-mentes-criativas.wav'],
    ['Experi\u00eancia Vivida, N\u00e3o Teoria Emprestada', '4-experiencia-vivida.wav'],
    ['Al\u00edvio imediato', '5-alivio-imediato.wav'],
  ]),
  quebra2: tracksFromFiles('3-quebra-de-expectativa/2-sobre-o-desacreditado', [
    ['Abertura', '6-sobre-o-desacreditado.wav'],
    ['A Sensa\u00e7\u00e3o de Inadequa\u00e7\u00e3o Constante', '7-sensacao-de-inadequacao-constante.wav'],
    ['Mentes Criativas, Sensoriais e Sobrecarregadas', '8-mentes-criativas-sensoriais.wav'],
    ['Hist\u00f3rico de Ansiedade, Fuga e Anestesia', '9-hist\u00f3rico-de-ansiedade.wav'],
    ['A Dificuldade com Discursos Longos e Abstratos', '10-dificuldade-com-discursos.wav'],
    ['O Desacreditado e a Culpa Silenciosa', '11-culpa-silenciosa.wav'],
  ]),
  quebra3: tracksFromFiles('3-quebra-de-expectativa/3-alem-da-autoajuda', [
    ['Abertura', '12-alem-da-autoajuda.wav'],
    ['Quando a Promessa Vira Peso', '13-quando-a-promessa-vira-peso.wav'],
    ['Escrita Objetiva Como Respeito Cognitivo', '14-Escrita-objetiva-como-respeito-cognitivo.wav'],
    ['Um Livro Para Ser Usado, N\u00e3o Seguido', '15-Um-livro-para-ser-usado.wav'],
    ['O Perigo da Positividade For\u00e7ada', '16-perigo-da-positividade-forcada.wav'],
    ['Presen\u00e7a em Vez de Motiva\u00e7\u00e3o', '17-presenca-em-vez-de-motivacao.wav'],
  ]),
  fund1: tracksFromFiles('4-fundamento-da-obra/4-triade-humana-fundamental', [
    ['Abertura', '18-a-triade-humana-fundamental.wav'],
    ['O que \u00e9 Consci\u00eancia', '19-o-que-e-consciencia.wav'],
    ['O que \u00e9 Julgamento', '20-o-que-julgamneto.wav'],
    ['O que \u00e9 Presen\u00e7a', '21-o-que-e-presenca.wav'],
    ['A Tr\u00edade em Funcionamento Real', '22-a-triade-em-funcionamento-real.wav'],
    ['A Tr\u00edade Ao Longo Deste Livro', '23-a-triade-ao-longo-deste-livro.wav'],
    ['Um Mapa Para Estados Dif\u00edceis', '24-um-mapa-para-estados-dificeis.wav'],
  ]),
  fund2: tracksFromFiles('4-fundamento-da-obra/5-autor-ferramenta-presenca', [
    ['Abertura', '25-autor-ferramenta-presenca.wav'],
    ['A Consci\u00eancia do Autor', '26-a-consciencia-do-autor.wav'],
    ['O Julgamento que Antecede a Obra', '27-o-julgamento-que-antecede-a-obra.wav'],
    ['Ferramenta N\u00e3o \u00e9 Identidade', '28-ferramenta-nao-e-identidade.wav'],
    ['Presen\u00e7a Como Autoria', '29-presenca-como-autoria.wav'],
    ['Um Movimento que Se Estende', '30-um-movimento-que-se-estende.wav'],
  ]),
  fund3: tracksFromFiles('4-fundamento-da-obra/6-da-dualidade-a-trialidade', [
    ['Abertura', '31-da-dualidade-a-trialidade.wav'],
    ['O M\u00e9dico e o Monstro', '32-o-medico-e-o-monstro.wav'],
    ['O Terceiro Elemento', '33-o-terceiro-elemento.wav'],
    ['Trialidade Como Maturidade Emocional', '34-trialidade-como-maturidade-emocional.wav'],
    ['Quando o Desacreditado Vive Na Dualidade', '35-quando-o-desacreditado-vive-na-dualidade.wav'],
    ['A Trialidade Aplicada aos Pilares', '36-a-trialidade-aplicada-aos-pilares.wav'],
    ['O Fim da Guerra Interna', '37-o-fim-da-guerra-interna.wav'],
    ['Antes de Atravessar os Pilares', '38-antes-de-atravessar-os-pilares.wav'],
  ]),
  acol1: tracksFromFiles('5-acolhimento', [['Antes de Atravessar os Pilares', 'prefacio.wav']]),
  acol2: tracksFromFiles('5-acolhimento', [['Abertura', 'introducao.mp3']]),
  pilar1: pillarTracks('6-ato1-sobrevivencia/pilar-01-reconhecimento', 'p1', ['Limiar', 'p1-limiar.wav'], { hasOpening: false }),
  pilar2: pillarTracks('6-ato1-sobrevivencia/pilar-02-familia', 'p2', ['Raiz', 'p2-raiz.wav'], { hasOpening: false }),
  interludio: interludeTracks('6-ato1-sobrevivencia/interludio'),
  pilar3: pillarTracks('6-ato1-sobrevivencia/pilar-03-luto', 'p3', ['Vazio', 'p3-vazio.wav'], { hasOpening: false }),
  caderno1: tracksFromFiles('6-ato1-sobrevivencia', [['Reflex\u00e3o', 't1-caderno.wav']]),
  pilar4: pillarTracks('7-ato2-reconstrucao/pilar-04-trabalho', 'p4', ['Peso', 'p4-peso.wav'], { hasOpening: false }),
  pilar5: pillarTracks('7-ato2-reconstrucao/pilar-05-dor', 'p5', ['Escape', 'p5-escape.wav'], { concienciaFile: 'p5-consciencia.wav', hasOpening: false }),
  pilar6: pillarTracks('7-ato2-reconstrucao/pilar-06-desejo', 'p6', ['Proje\u00e7\u00e3o', 'p6-escape.wav'], { concienciaFile: 'p6-consciencia.wav', hasOpening: false }),
  caderno2: tracksFromFiles('transicoes', [
    ['Reflex\u00e3o', 't2-caderno.wav'],
    ['Transi\u00e7\u00e3o para reconstru\u00e7\u00e3o', 'transicao-2.wav'],
  ]),
  pilar7: pillarTracks('8-ato3-continuidade/pilar-07-fe', 'p7', ['Eros\u00e3o', 'p7-erosao.wav'], { concienciaFile: 'p7-consciencia.wav', hasOpening: false }),
  pilar8: pillarTracks('8-ato3-continuidade/pilar-08-escacez', 'p8', ['Limiar', 'p8-limiar.wav'], { concienciaFile: 'p8-consciencia.wav', hasOpening: false }),
  pilar9: pillarTracks('8-ato3-continuidade/pilar-09-vazio', 'p9', ['Perman\u00eancia', 'p9-permanencia.wav'], { concienciaFile: 'p9-consciencia.wav', hasOpening: false }),
  caderno3: tracksFromFiles('8-ato3-continuidade', [['Reflex\u00e3o', 't3-caderno.wav']]),
  enc1: tracksFromFiles('9-encerramento', [['Onde a Presen\u00e7a Continua', 'epilogo.mp3']]),
  caderno4: tracksFromFiles('9-encerramento', [['Reflex\u00e3o', 'caderno-final.wav']]),
  enc2: tracksFromFiles('9-encerramento', [['Abertura', 'carta-final.wav']]),
  enc3: tracksFromFiles('9-encerramento', [['Abertura', 'posfacio.wav']]),
  'nao-e-autoajuda': tracksFromFiles('3-quebra-de-expectativa/1-porque-esse-livro-nao-e-autoajuda', [
    ['Por que n\u00e3o \u00e9 autoajuda', '1-porque-nao-e-autoajuda.wav'],
    ['Este livro desacelera', '2-este-livro-desacelera.wav'],
    ['Para mentes criativas', '3-para-mentes-criativas.wav'],
    ['Experi\u00eancia vivida', '4-experiencia-vivida.wav'],
    ['Al\u00edvio imediato', '5-alivio-imediato.wav'],
  ]),
  'o-desacreditado': tracksFromFiles('3-quebra-de-expectativa/2-sobre-o-desacreditado', [
    ['Sobre o desacreditado', '6-sobre-o-desacreditado.wav'],
    ['Sensa\u00e7\u00e3o de inadequa\u00e7\u00e3o constante', '7-sensacao-de-inadequacao-constante.wav'],
    ['Mentes criativas sensoriais', '8-mentes-criativas-sensoriais.wav'],
    ['Hist\u00f3rico de ansiedade', '9-hist\u00f3rico-de-ansiedade.wav'],
    ['Dificuldade com discursos', '10-dificuldade-com-discursos.wav'],
    ['Culpa silenciosa', '11-culpa-silenciosa.wav'],
  ]),
  'alem-da-autoajuda': tracksFromFiles('3-quebra-de-expectativa/3-alem-da-autoajuda', [
    ['Al\u00e9m da autoajuda', '12-alem-da-autoajuda.wav'],
    ['Quando a promessa vira peso', '13-quando-a-promessa-vira-peso.wav'],
    ['Escrita objetiva como respeito cognitivo', '14-Escrita-objetiva-como-respeito-cognitivo.wav'],
    ['Um livro para ser usado', '15-Um-livro-para-ser-usado.wav'],
    ['Perigo da positividade for\u00e7ada', '16-perigo-da-positividade-forcada.wav'],
    ['Presen\u00e7a em vez de motiva\u00e7\u00e3o', '17-presenca-em-vez-de-motivacao.wav'],
  ]),
  'triade-humana': tracksFromFiles('4-fundamento-da-obra/4-triade-humana-fundamental', [
    ['A tr\u00edade humana fundamental', '18-a-triade-humana-fundamental.wav'],
    ['O que \u00e9 consci\u00eancia', '19-o-que-e-consciencia.wav'],
    ['O que \u00e9 julgamento', '20-o-que-julgamneto.wav'],
    ['O que \u00e9 presen\u00e7a', '21-o-que-e-presenca.wav'],
    ['A tr\u00edade em funcionamento real', '22-a-triade-em-funcionamento-real.wav'],
    ['A tr\u00edade ao longo deste livro', '23-a-triade-ao-longo-deste-livro.wav'],
    ['Um mapa para estados dif\u00edceis', '24-um-mapa-para-estados-dificeis.wav'],
  ]),
  'autor-ferramenta-presenca': tracksFromFiles('4-fundamento-da-obra/5-autor-ferramenta-presenca', [
    ['Autor, ferramenta e presen\u00e7a', '25-autor-ferramenta-presenca.wav'],
    ['A consci\u00eancia do autor', '26-a-consciencia-do-autor.wav'],
    ['O julgamento que antecede a obra', '27-o-julgamento-que-antecede-a-obra.wav'],
    ['Ferramenta n\u00e3o \u00e9 identidade', '28-ferramenta-nao-e-identidade.wav'],
    ['Presen\u00e7a como autoria', '29-presenca-como-autoria.wav'],
    ['Um movimento que se estende', '30-um-movimento-que-se-estende.wav'],
  ]),
  'dualidade-trialidade': tracksFromFiles('4-fundamento-da-obra/6-da-dualidade-a-trialidade', [
    ['Da dualidade \u00e0 trialidade', '31-da-dualidade-a-trialidade.wav'],
    ['O m\u00e9dico e o monstro', '32-o-medico-e-o-monstro.wav'],
    ['O terceiro elemento', '33-o-terceiro-elemento.wav'],
    ['Trialidade como maturidade emocional', '34-trialidade-como-maturidade-emocional.wav'],
    ['Quando o desacreditado vive na dualidade', '35-quando-o-desacreditado-vive-na-dualidade.wav'],
    ['A trialidade aplicada aos pilares', '36-a-trialidade-aplicada-aos-pilares.wav'],
    ['O fim da guerra interna', '37-o-fim-da-guerra-interna.wav'],
    ['Antes de atravessar os pilares', '38-antes-de-atravessar-os-pilares.wav'],
  ]),
  prefacio: tracksFromFiles('5-acolhimento', [['Pref\u00e1cio', 'prefacio.wav']]),
  introducao: tracksFromFiles('5-acolhimento', [['Introdu\u00e7\u00e3o', 'introducao.mp3']]),
  reconhecimento: pillarTracks('6-ato1-sobrevivencia/pilar-01-reconhecimento', 'p1', ['Limiar', 'p1-limiar.wav'], { hasOpening: false }),
  familia: pillarTracks('6-ato1-sobrevivencia/pilar-02-familia', 'p2', ['Raiz', 'p2-raiz.wav'], { hasOpening: false }),
  luto: pillarTracks('6-ato1-sobrevivencia/pilar-03-luto', 'p3', ['Vazio', 'p3-vazio.wav'], { hasOpening: false }),
  trabalho: pillarTracks('7-ato2-reconstrucao/pilar-04-trabalho', 'p4', ['Peso', 'p4-peso.wav'], { hasOpening: false }),
  dor: pillarTracks('7-ato2-reconstrucao/pilar-05-dor', 'p5', ['Escape', 'p5-escape.wav'], { concienciaFile: 'p5-consciencia.wav', hasOpening: false }),
  desejo: pillarTracks('7-ato2-reconstrucao/pilar-06-desejo', 'p6', ['Proje\u00e7\u00e3o', 'p6-escape.wav'], { concienciaFile: 'p6-consciencia.wav', hasOpening: false }),
  fe: pillarTracks('8-ato3-continuidade/pilar-07-fe', 'p7', ['Eros\u00e3o', 'p7-erosao.wav'], { concienciaFile: 'p7-consciencia.wav', hasOpening: false }),
  escassez: pillarTracks('8-ato3-continuidade/pilar-08-escacez', 'p8', ['Limiar', 'p8-limiar.wav'], { concienciaFile: 'p8-consciencia.wav', hasOpening: false }),
  vazio: pillarTracks('8-ato3-continuidade/pilar-09-vazio', 'p9', ['Perman\u00eancia', 'p9-permanencia.wav'], { concienciaFile: 'p9-consciencia.wav', hasOpening: false }),
  'carta-final': tracksFromFiles('9-encerramento', [['Carta final', 'carta-final.wav']]),
  epilogo: tracksFromFiles('9-encerramento', [
    ['Ep\u00edlogo', 'epilogo.mp3'],
    ['Posf\u00e1cio', 'posfacio.wav'],
  ]),
};

const audioMap: Record<string, string | null> = Object.fromEntries(
  Object.entries(bookAudioCatalog).map(([id, tracks]) => [id, tracks[0]?.url ?? null]),
);

const audioAliases: Record<string, string> = {
  'nao-e-autoajuda': 'quebra1',
  'o-desacreditado': 'quebra2',
  'alem-da-autoajuda': 'quebra3',
  'triade-humana': 'fund1',
  'autor-ferramenta-presenca': 'fund2',
  'dualidade-trialidade': 'fund3',
  prefacio: 'acol1',
  introducao: 'acol2',
  reconhecimento: 'pilar1',
  familia: 'pilar2',
  luto: 'pilar3',
  trabalho: 'pilar4',
  dor: 'pilar5',
  desejo: 'pilar6',
  fe: 'pilar7',
  escassez: 'pilar8',
  vazio: 'pilar9',
  'carta-final': 'enc2',
  epilogo: 'enc1',
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

const audioTracksFor = (id: string) => bookAudioCatalog[id] ?? [];
const canonicalAudioTracksFor = (id: string) => bookAudioCatalog[id] ?? bookAudioCatalog[audioAliases[id]] ?? [];

const canonicalChapterById = new Map(artifactBookData.chapters.map((chapter) => [chapter.id, chapter]));

const canonicalContentFor = (id: string) => {
  if (id === 'capa-digital') {
    const cover = artifactBookData.meta.cover;
    return [
      cover?.title,
      cover?.tagline,
      cover?.author,
      cover?.imprint,
    ].filter(Boolean).map((item) => repairText(String(item)));
  }
  const chapter = canonicalChapterById.get(id);
  if (!chapter) return [];
  return chapter.sections.flatMap((section) =>
    section.blocks.flatMap((block) => {
      if (block.type === 'list' && Array.isArray(block.items)) return block.items.map((item) => repairText(String(item ?? '')));
      if ('text' in block && block.text) return [repairText(String(block.text))];
      return [];
    }),
  );
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
  manifesto: [
    'O mundo costuma valorizar quem chega. Esta obra começa acolhendo quem permaneceu mesmo quando deixou de ser visto.',
    'Antes de qualquer método, existe uma presença: a de quem continuou desacreditado e ainda assim não desapareceu de si.',
  ],
  abertura: [
    'Este livro nasceu de vivências reais, de estados difíceis e de uma tentativa honesta de organizar linguagem para quem não cabe em promessas rápidas.',
    'Entre sem pressa. Use a leitura e os áudios como companhia, não como cobrança.',
  ],
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
  const contentSource = frontMatterContent[item.id] ?? (sourceContent.length ? sourceContent : canonicalContentFor(item.id));
  const content = contentSource.map((paragraph) => repairText(String(paragraph ?? '')));
  const audioTracks = canonicalAudioTracksFor(item.id);
  return {
    id: item.id,
    chapter: 'pillar' in item ? item.pillar : index + 1,
    title: item.title,
    summary: item.summary,
    content,
    audioUrl: audioMap[item.id] ?? audioMap[audioAliases[item.id]] ?? null,
    audioTracks: audioTracks.length ? audioTracks : audioTracksFor(item.id),
    groupId: item.groupId,
    kind: item.kind,
    pdfPage: item.pdfPage,
    pillar: 'pillar' in item ? item.pillar : undefined,
    roman: 'roman' in item ? item.roman : undefined,
    sections: 'sections' in item ? item.sections : undefined,
  };
});

export const getChapterIndexForPillar = (pillarIndex: number) => {
  const index = bookChapters.findIndex((chapter) => chapter.pillar === pillarIndex + 1 || chapter.id === `pilar${pillarIndex + 1}`);
  return index >= 0 ? index : 0;
};
