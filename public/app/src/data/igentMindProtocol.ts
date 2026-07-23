import type { InterventionType, PillarPhase } from './igentMindContract';
import {
  defaultPrimaryBySemanticPosition,
  type PrimarySignal,
  type SecondarySignal,
} from './igentMindSignals';
import {
  FINAL_MIND_PILLARS,
  type FinalMindPillar,
} from './igentMindFinalProject';

export type MindPhaseId = PillarPhase;

export type SemanticPosition =
  | 'recognition'
  | 'minimization'
  | 'defense'
  | 'ambivalence'
  | 'desire'
  | 'uncertainty';

export type MindProtocolOption = {
  id: string;
  semantic_position: SemanticPosition;
  primary_signal: PrimarySignal;
  secondary_signals: SecondarySignal[];
  label: string;
  signal: string;
  response: string;
  load: 1 | 2 | 3;
};

export type MindProtocolQuestion = {
  id: string;
  phase: MindPhaseId;
  prompt: string;
  openPrompt: string;
  options: MindProtocolOption[];
};

export type MindMove =
  | { type: Extract<InterventionType, 'question' | 'journal' | 'letter' | 'anchor'>; content_id: string };

export type MindMicroReturn = {
  id: string;
  phase: MindPhaseId;
  semantic_position: SemanticPosition;
  mirror: string;
  displacement?: string;
  next_move: MindMove;
};

export type MindJournalPrompt = {
  id: string;
  phase: MindPhaseId;
  prompt: string;
};

export type MindGuidedLetter = {
  id: string;
  type: 'recognition' | 'confrontation' | 'presence';
  title: string;
  prompt: string;
};

export type MindPracticalAnchor = {
  id: string;
  type: 'observe' | 'name' | 'position';
  title: string;
  prompt: string;
};

export type MindPredictiveRule = {
  id: string;
  type: 'deepening' | 'protection' | 'integration';
  when: string[];
  next_move: MindMove;
};

export type MindTransitionRule = {
  id: string;
  priority: 'primary' | 'secondary';
  targetPillarId: string;
  reason: string;
};

export type MindPillarProtocol = {
  identity: {
    id: string;
    index: number;
    title: string;
    triad: 'Sobrevivência' | 'Reconstrução' | 'Continuidade';
    limiar: string;
    explains: string;
    dilemma: string;
  };
  questions: MindProtocolQuestion[];
  micro_returns: MindMicroReturn[];
  journal_prompts: MindJournalPrompt[];
  guided_letters: MindGuidedLetter[];
  practical_anchors: MindPracticalAnchor[];
  predictive_rules: MindPredictiveRule[];
  transition_rules: MindTransitionRule[];
};

const semanticPositions: SemanticPosition[] = [
  'recognition',
  'minimization',
  'defense',
  'ambivalence',
  'desire',
  'uncertainty',
];

const phaseIds: MindPhaseId[] = ['consciousness', 'judgment', 'presence'];

export const MIND_PHASES: Array<{ id: MindPhaseId; label: string; summary: string }> = [
  { id: 'consciousness', label: 'Consciência', summary: 'Reconhecer o que está vivo agora.' },
  { id: 'judgment', label: 'Julgamento', summary: 'Perceber defesa, culpa, controle e repetição.' },
  { id: 'presence', label: 'Presença', summary: 'Transformar percepção em posição, pausa ou escrita.' },
];

export const SEMANTIC_POSITION_LABELS: Record<SemanticPosition, string> = {
  recognition: 'Reconhecimento',
  minimization: 'Minimização',
  defense: 'Defesa',
  ambivalence: 'Ambivalência',
  desire: 'Desejo',
  uncertainty: 'Incerteza',
};

const secondaryByPillar: Record<number, SecondarySignal[]> = {
  1: ['repetition_awareness', 'pain_normalization', 'coherent_positioning'],
  2: ['silence_to_preserve_bond', 'need_for_approval', 'guilt_for_setting_limits'],
  3: ['grief_suspension', 'emptiness_avoidance', 'repetition_awareness'],
  4: ['control_through_performance', 'worth_tied_to_productivity', 'overresponsibility'],
  5: ['pain_normalization', 'emptiness_avoidance', 'repetition_awareness'],
  6: ['fear_of_dependency', 'desire_suppression', 'anticipation_of_failure'],
  7: ['faith_conflict', 'repetition_awareness', 'coherent_positioning'],
  8: ['scarcity_vigilance', 'overresponsibility', 'coherent_positioning'],
  9: ['emptiness_avoidance', 'repetition_awareness', 'coherent_positioning'],
};

const fallbackQuestions: Record<MindPhaseId, string[]> = {
  consciousness: [
    'O que você consegue reconhecer aqui sem tentar resolver agora?',
    'Onde esse tema aparece com mais força na sua vida hoje?',
    'Que parte disso ainda não recebeu um nome honesto?',
  ],
  judgment: [
    'Que julgamento aparece quando você toca nesse ponto?',
    'O que você tenta proteger quando evita esse assunto?',
    'Qual repetição fica mais visível quando você observa sem pressa?',
  ],
  presence: [
    'Que gesto mínimo respeita o que você percebeu?',
    'Como permanecer com isso sem transformar a percepção em cobrança?',
    'Que frase poderia sustentar sua presença pelos próximos minutos?',
  ],
};

const normalizeTriad = (triad: string): MindPillarProtocol['identity']['triad'] => {
  if (triad.includes('Continuidade')) return 'Continuidade';
  if (triad.includes('Reconstru')) return 'Reconstrução';
  return 'Sobrevivência';
};

const cleanText = (value: string | undefined, fallback: string) =>
  String(value || fallback).trim() || fallback;

const questionId = (pillar: FinalMindPillar, phase: MindPhaseId, index: number) =>
  `${pillar.id}_${phase}_${String(index + 1).padStart(2, '0')}`;

const questionTexts = (pillar: FinalMindPillar, phase: MindPhaseId) => {
  const texts = pillar.questions?.[phase] ?? [];
  return Array.from({ length: 3 }, (_, index) => cleanText(texts[index], fallbackQuestions[phase][index]));
};

const optionTemplates: Record<SemanticPosition, { load: 1 | 2 | 3; suffix: string }> = {
  recognition: {
    load: 1,
    suffix: 'Você reconhece algo sem transformar isso em sentença.',
  },
  minimization: {
    load: 2,
    suffix: 'Uma parte sua tenta reduzir o peso da experiência.',
  },
  defense: {
    load: 3,
    suffix: 'A defesa apareceu como tentativa de manter estabilidade.',
  },
  ambivalence: {
    load: 2,
    suffix: 'A divisão interna não precisa ser resolvida depressa.',
  },
  desire: {
    load: 1,
    suffix: 'Existe desejo de mudança sem obrigação de conclusão.',
  },
  uncertainty: {
    load: 1,
    suffix: 'A incerteza pode ser tratada como ponto de partida.',
  },
};

const optionLabelBank: Record<MindPhaseId, Array<Record<SemanticPosition, string>>> = {
  consciousness: [
    {
      recognition: 'Eu reconheço que isso está acontecendo comigo.',
      minimization: 'Talvez eu esteja tentando diminuir o tamanho disso.',
      defense: 'Eu prefiro explicar antes de admitir o que toca.',
      ambivalence: 'Uma parte percebe, outra ainda tenta escapar.',
      desire: 'Eu queria conseguir olhar para isso sem me atacar.',
      uncertainty: 'Ainda não sei dizer exatamente o que é.',
    },
    {
      recognition: 'Eu já percebia isso antes, mesmo sem nomear.',
      minimization: 'Eu trato isso como detalhe para não parar nele.',
      defense: 'Eu justifico rápido para não sentir o impacto.',
      ambivalence: 'Eu sei e não quero saber ao mesmo tempo.',
      desire: 'Eu queria parar de fugir desse ponto.',
      uncertainty: 'Eu só sinto que tem algo aí, mas não sei o quê.',
    },
    {
      recognition: 'Esse nome parece chegar perto do que vivo.',
      minimization: 'Eu acho que talvez isso nem mereça tanta atenção.',
      defense: 'Eu tento controlar o assunto antes que ele me alcance.',
      ambivalence: 'O nome faz sentido, mas ainda me incomoda.',
      desire: 'Eu queria encontrar uma forma mais honesta de dizer isso.',
      uncertainty: 'Nenhum nome parece caber ainda.',
    },
  ],
  judgment: [
    {
      recognition: 'Eu reconheço o julgamento que aparece aqui.',
      minimization: 'Eu digo que não é julgamento, só realismo.',
      defense: 'Eu me defendo acusando antes de escutar.',
      ambivalence: 'Uma parte julga, outra sabe que está doendo.',
      desire: 'Eu queria parar de transformar isso em culpa.',
      uncertainty: 'Não sei se isso é culpa, medo ou cobrança.',
    },
    {
      recognition: 'Eu vejo o que essa defesa tenta proteger.',
      minimization: 'Eu chamo isso de costume para não mexer.',
      defense: 'Eu tento manter controle para não parecer frágil.',
      ambivalence: 'Eu quero me proteger e também cansar menos.',
      desire: 'Eu queria uma proteção que não me afastasse de mim.',
      uncertainty: 'Não sei ainda do que estou tentando me defender.',
    },
    {
      recognition: 'Eu consigo ouvir a frase interna que pesa.',
      minimization: 'Eu penso que todo mundo fala assim consigo mesmo.',
      defense: 'Eu uso dureza para tentar produzir reação.',
      ambivalence: 'A frase me fere, mas parece me manter em movimento.',
      desire: 'Eu queria uma voz interna menos punitiva.',
      uncertainty: 'Não sei qual frase me prende, só sinto o efeito.',
    },
  ],
  presence: [
    {
      recognition: 'Eu consigo ficar com isso por alguns segundos.',
      minimization: 'Eu quero passar logo para uma conclusão.',
      defense: 'Eu tento resolver rápido para não permanecer aqui.',
      ambivalence: 'Eu quero ficar presente, mas também quero sair.',
      desire: 'Eu queria uma presença que não virasse cobrança.',
      uncertainty: 'Não sei como permanecer sem me confundir.',
    },
    {
      recognition: 'Eu vejo um gesto pequeno possível agora.',
      minimization: 'Parece pequeno demais para importar.',
      defense: 'Eu quero um plano inteiro antes de dar um passo.',
      ambivalence: 'Um gesto ajuda, mas parece insuficiente.',
      desire: 'Eu queria começar sem prometer mudança total.',
      uncertainty: 'Não sei qual gesto seria honesto hoje.',
    },
    {
      recognition: 'Eu percebo que algo muda quando paro de brigar.',
      minimization: 'Talvez nada mude de verdade.',
      defense: 'Eu ainda tento transformar presença em controle.',
      ambivalence: 'Eu sinto algum alívio e ainda desconfio dele.',
      desire: 'Eu queria continuar sem abandonar o que reconheci.',
      uncertainty: 'Ainda não sei o que fazer com essa percepção.',
    },
  ],
};

const optionResponseBank: Partial<Record<SemanticPosition, string>> = {
  recognition: 'Vamos usar esse reconhecimento como chão, sem transformar isso em cobrança.',
  minimization: 'A minimização também comunica algo: talvez esse ponto tenha sido pesado demais para olhar inteiro.',
  defense: 'A defesa não precisa ser combatida; primeiro ela pode ser observada.',
  ambivalence: 'Essa divisão interna pode ser o lugar mais honesto da conversa agora.',
  desire: 'O desejo aponta direção, mas ainda não precisa virar solução.',
  uncertainty: 'A incerteza não bloqueia a triagem; ela só pede uma pergunta mais simples.',
};

const getOptionLabel = (phase: MindPhaseId, questionIndex: number, position: SemanticPosition) =>
  optionLabelBank[phase]?.[questionIndex]?.[position] || optionLabelBank.consciousness[0][position];

const buildOptions = (pillar: FinalMindPillar, phase: MindPhaseId, questionIndex: number): MindProtocolOption[] => {
  const secondary = secondaryByPillar[pillar.ordinal] ?? ['repetition_awareness'];

  return semanticPositions.map((position, optionIndex) => {
    const template = optionTemplates[position];
    const secondarySignal = secondary[optionIndex % secondary.length];

    return {
      id: `${questionId(pillar, phase, questionIndex)}_${position}`,
      semantic_position: position,
      primary_signal: defaultPrimaryBySemanticPosition[position],
      secondary_signals: secondarySignal ? [secondarySignal] : [],
      label: getOptionLabel(phase, questionIndex, position),
      signal: `${pillar.id}_${position}`,
      response: `${template.suffix} ${optionResponseBank[position]} Vamos olhar para ${pillar.title} com uma pergunta por vez.`,
      load: template.load,
    };
  });
};

const buildQuestions = (pillar: FinalMindPillar): MindProtocolQuestion[] =>
  phaseIds.flatMap((phase) =>
    questionTexts(pillar, phase).map((prompt, index) => ({
      id: questionId(pillar, phase, index),
      phase,
      prompt,
      openPrompt: 'Se nenhuma opção couber, escreva com suas palavras. A resposta aberta tem prioridade.',
      options: buildOptions(pillar, phase, index),
    })),
  );

const buildMicroReturns = (pillar: FinalMindPillar): MindMicroReturn[] =>
  MIND_PHASES.flatMap((phase) =>
    semanticPositions.map((position) => ({
      id: `${pillar.id}_${phase.id}_${position}_return`,
      phase: phase.id,
      semantic_position: position,
      mirror: `Em ${pillar.title}, apareceu ${SEMANTIC_POSITION_LABELS[position].toLowerCase()}.`,
      displacement: `Isso não fecha uma interpretação sobre você; apenas mostra um ponto que merece escuta.`,
      next_move: { type: 'question', content_id: questionId(pillar, phase.id, 0) },
    })),
  );

const buildJournalPrompts = (pillar: FinalMindPillar): MindJournalPrompt[] =>
  MIND_PHASES.flatMap((phase, phaseIndex) => [0, 1].map((itemIndex) => ({
    id: `${pillar.id}_${phase.id}_journal_${itemIndex + 1}`,
    phase: phase.id,
    prompt: pillar.journals?.[phaseIndex * 2 + itemIndex]
      || `Escreva uma frase privada sobre ${pillar.title} sem tentar concluir.`,
  })));

const buildGuidedLetters = (pillar: FinalMindPillar): MindGuidedLetter[] => [
  {
    id: `${pillar.id}_letter_recognition`,
    type: 'recognition',
    title: 'Carta de reconhecimento',
    prompt: pillar.letters?.[0] || `Escreva para a parte de você que começou a reconhecer ${pillar.title}.`,
  },
  {
    id: `${pillar.id}_letter_confrontation`,
    type: 'confrontation',
    title: 'Carta de confronto',
    prompt: pillar.letters?.[1] || `Escreva para a defesa que aparece quando ${pillar.title} toca em algo real.`,
  },
  {
    id: `${pillar.id}_letter_presence`,
    type: 'presence',
    title: 'Carta de presença',
    prompt: pillar.letters?.[2] || `Escreva uma posição possível sem prometer resolver tudo.`,
  },
];

const buildAnchors = (pillar: FinalMindPillar): MindPracticalAnchor[] => [
  {
    id: `${pillar.id}_anchor_observe`,
    type: 'observe',
    title: 'Observar',
    prompt: pillar.anchors?.[0] || `Observe onde ${pillar.title} aparece no corpo ou no pensamento.`,
  },
  {
    id: `${pillar.id}_anchor_name`,
    type: 'name',
    title: 'Nomear',
    prompt: pillar.anchors?.[1] || `Dê um nome provisório ao que apareceu em ${pillar.title}.`,
  },
  {
    id: `${pillar.id}_anchor_position`,
    type: 'position',
    title: 'Posicionar-se',
    prompt: pillar.anchors?.[2] || 'Escolha uma frase pequena que não traia o que você percebeu.',
  },
];

const buildPredictiveRules = (pillar: FinalMindPillar): MindPredictiveRule[] => [
  {
    id: `${pillar.id}_deepening_01`,
    type: 'deepening',
    when: [`${pillar.id}_recognition`, `${pillar.id}_ambivalence`],
    next_move: { type: 'question', content_id: questionId(pillar, 'judgment', 0) },
  },
  {
    id: `${pillar.id}_deepening_02`,
    type: 'deepening',
    when: [`${pillar.id}_desire`, `${pillar.id}_uncertainty`],
    next_move: { type: 'journal', content_id: `${pillar.id}_consciousness_journal_1` },
  },
  {
    id: `${pillar.id}_deepening_03`,
    type: 'deepening',
    when: [`${pillar.id}_recognition`],
    next_move: { type: 'letter', content_id: `${pillar.id}_letter_recognition` },
  },
  {
    id: `${pillar.id}_protection_01`,
    type: 'protection',
    when: [`${pillar.id}_defense`],
    next_move: { type: 'anchor', content_id: `${pillar.id}_anchor_observe` },
  },
  {
    id: `${pillar.id}_protection_02`,
    type: 'protection',
    when: [`${pillar.id}_minimization`],
    next_move: { type: 'question', content_id: questionId(pillar, 'judgment', 1) },
  },
  {
    id: `${pillar.id}_protection_03`,
    type: 'protection',
    when: [`${pillar.id}_uncertainty`],
    next_move: { type: 'anchor', content_id: `${pillar.id}_anchor_name` },
  },
  {
    id: `${pillar.id}_integration_01`,
    type: 'integration',
    when: [`${pillar.id}_desire`],
    next_move: { type: 'anchor', content_id: `${pillar.id}_anchor_position` },
  },
  {
    id: `${pillar.id}_integration_02`,
    type: 'integration',
    when: [`${pillar.id}_recognition`, `${pillar.id}_desire`],
    next_move: { type: 'journal', content_id: `${pillar.id}_presence_journal_2` },
  },
  {
    id: `${pillar.id}_integration_03`,
    type: 'integration',
    when: [`${pillar.id}_ambivalence`],
    next_move: { type: 'letter', content_id: `${pillar.id}_letter_presence` },
  },
];

const buildTransitionRules = (pillar: FinalMindPillar): MindTransitionRule[] =>
  (pillar.transitions?.length ? pillar.transitions : [pillar.nextExperience])
    .filter(Boolean)
    .slice(0, 6)
    .map((targetPillarId, index) => ({
      id: `${pillar.id}_transition_${targetPillarId}`,
      priority: index < 3 ? 'primary' : 'secondary',
      targetPillarId,
      reason: index < 3
        ? `Conexão prioritária quando ${pillar.title} começa a revelar ${pillar.threshold}.`
        : `Conexão secundária para continuar depois de ${pillar.title}.`,
    }));

export const officialMindProtocol: MindPillarProtocol[] = FINAL_MIND_PILLARS.map((pillar, index) => ({
  identity: {
    id: pillar.id,
    index,
    title: cleanText(pillar.title, `Pilar ${index + 1}`),
    triad: normalizeTriad(pillar.triad),
    limiar: cleanText(pillar.threshold, 'Limiar'),
    explains: cleanText(pillar.thesis, 'Reconhecer o que aparece sem transformar isso em sentença.'),
    dilemma: cleanText(pillar.centralMovement, pillar.subtitle || pillar.title),
  },
  questions: buildQuestions(pillar),
  micro_returns: buildMicroReturns(pillar),
  journal_prompts: buildJournalPrompts(pillar),
  guided_letters: buildGuidedLetters(pillar),
  practical_anchors: buildAnchors(pillar),
  predictive_rules: buildPredictiveRules(pillar),
  transition_rules: buildTransitionRules(pillar),
}));

export const getOfficialMindPillarProtocol = (pillarIndex: number | null | undefined) =>
  typeof pillarIndex === 'number' ? officialMindProtocol[pillarIndex] ?? null : null;
