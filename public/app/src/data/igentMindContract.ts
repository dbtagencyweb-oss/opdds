export type ReaderState =
  | 'unmapped'
  | 'observing'
  | 'defensive'
  | 'oscillating'
  | 'available'
  | 'integrating'
  | 'overloaded'
  | 'paused';

export type PillarPhase =
  | 'consciousness'
  | 'judgment'
  | 'presence';

export type InterventionType =
  | 'mirror'
  | 'displacement'
  | 'question'
  | 'micro_return'
  | 'journal'
  | 'letter'
  | 'anchor'
  | 'memory_recall'
  | 'connection'
  | 'pause'
  | 'closure';

export type InterpretationConfidence =
  | 'low'
  | 'medium'
  | 'high';

export type DepthLevel = 0 | 1 | 2 | 3;

export type BookActId =
  | 'act_01_survival'
  | 'act_02_reconstruction'
  | 'act_03_continuity';

export type BookUnitType =
  | 'opening_chapter'
  | 'preface'
  | 'introduction'
  | 'act_opening'
  | 'pillar'
  | 'interlude'
  | 'presence_notebook'
  | 'final_letter'
  | 'epilogue'
  | 'postface'
  | 'final_reflection';

export type CanonicalSectionType =
  | 'opening_identity'
  | 'threshold'
  | 'root'
  | 'fissure'
  | 'void'
  | 'weight'
  | 'escape'
  | 'projection'
  | 'erosion'
  | 'permanence'
  | 'opening_manifesto'
  | 'deep_narrative'
  | 'consciousness'
  | 'judgment'
  | 'presence'
  | 'support_letter'
  | 'practical_anchor'
  | 'pillar_closure'
  | 'notebook_prompt'
  | 'body_text';

export type ReaderBookPosition = {
  current_act_id?: BookActId;
  current_unit_id: string;
  current_unit_type: BookUnitType;
  current_pillar_id?: string;
  current_section_id?: string;
  current_section_type?: CanonicalSectionType;
  current_phase?: PillarPhase;
  unit_progress: number;
  pillar_progress?: number;
  act_progress?: number;
  book_progress: number;
};

export type BookActDefinition = {
  id: BookActId;
  title: string;
  pillar_ids: string[];
  presence_notebook_id: string;
};

export const LEGACY_PILLAR_ID_ALIASES: Record<string, string> = {
  pillar_01_vinculo: 'pillar_01_reconhecimento',
};

export const PILLAR_ORDER = [
  'pillar_01_reconhecimento',
  'pillar_02_familia',
  'pillar_03_luto',
  'pillar_04_trabalho',
  'pillar_05_dor',
  'pillar_06_desejo',
  'pillar_07_fe',
  'pillar_08_escassez',
  'pillar_09_vazio',
] as const;

export const BOOK_ACTS: BookActDefinition[] = [
  {
    id: 'act_01_survival',
    title: 'Tríade da Sobrevivência',
    pillar_ids: ['pillar_01_reconhecimento', 'pillar_02_familia', 'pillar_03_luto'],
    presence_notebook_id: 'presence_notebook_survival',
  },
  {
    id: 'act_02_reconstruction',
    title: 'Tríade da Reconstrução',
    pillar_ids: ['pillar_04_trabalho', 'pillar_05_dor', 'pillar_06_desejo'],
    presence_notebook_id: 'presence_notebook_reconstruction',
  },
  {
    id: 'act_03_continuity',
    title: 'Tríade da Continuidade',
    pillar_ids: ['pillar_07_fe', 'pillar_08_escassez', 'pillar_09_vazio'],
    presence_notebook_id: 'presence_notebook_continuity',
  },
];

export const SPECIAL_BOOK_UNITS = {
  interlude: {
    id: 'interlude_fenda',
    type: 'interlude' as const,
    position_after: 'pillar_02_familia',
    position_before: 'pillar_03_luto',
  },
  final_letter: {
    id: 'final_author_letter',
    type: 'final_letter' as const,
  },
  epilogue: {
    id: 'epilogue_presence_continues',
    type: 'epilogue' as const,
  },
  postface: {
    id: 'postface',
    type: 'postface' as const,
  },
  final_reflection: {
    id: 'presence_notebook_final_reflection',
    type: 'final_reflection' as const,
  },
};

export const normalizePillarId = (pillarId: string) =>
  LEGACY_PILLAR_ID_ALIASES[pillarId] || pillarId;

export type MindInteractionResult = {
  pillar_id: string;
  phase: PillarPhase;
  reader_state_before: ReaderState;
  reader_state_after: ReaderState;
  depth_before: DepthLevel;
  depth_after: DepthLevel;
  selected_option_id?: string;
  open_response_id?: string;
  primary_signal?: string;
  secondary_signals: string[];
  load_level: 0 | 1 | 2 | 3 | 4;
  readiness_level: 0 | 1 | 2 | 3 | 4;
  interpretation_confidence: InterpretationConfidence;
  intervention_type: InterventionType;
  response_content_id?: string;
  memory_used_id?: string;
  memory_created_id?: string;
  open_thread_id?: string;
  next_recommended_action?: InterventionType;
  should_pause: boolean;
  should_update_pillar_summary: boolean;
  should_update_journey_summary: boolean;
};

export const PILLAR_PHASE_LABELS: Record<PillarPhase, string> = {
  consciousness: 'Consciência',
  judgment: 'Julgamento',
  presence: 'Presença',
};

export const READER_STATE_LABELS: Record<ReaderState, string> = {
  unmapped: 'Sem mapa',
  observing: 'Observando',
  defensive: 'Em defesa',
  oscillating: 'Oscilando',
  available: 'Disponível',
  integrating: 'Integrando',
  overloaded: 'Sobrecarregado',
  paused: 'Pausado',
};

export const evidencePriority = [
  'current_open_response',
  'current_journal_entry',
  'current_letter',
  'recent_open_response',
  'recent_structured_answer',
  'pillar_summary',
  'journey_summary',
] as const;

export const IGENT_LANGUAGE_RULES = {
  forbidden: [
    'Parabéns por perceber isso.',
    'Você está evoluindo muito.',
    'Tudo acontece por uma razão.',
    'Você precisa se permitir.',
    'Saia da sua zona de conforto.',
    'Sua melhor versão.',
    'Você é mais forte do que imagina.',
    'Isso é claramente um trauma.',
    'Você tem medo de abandono.',
    'Eu sei exatamente o que você sente.',
  ],
  preferred: [
    'Isso parece ter exigido muito de você.',
    'Há algo nessa resposta que merece permanecer aberto.',
    'Talvez ainda não seja necessário resolver.',
    'Podemos apenas reconhecer o que apareceu.',
    'Essa frase parece carregar mais de uma coisa.',
    'O que apareceu agora não precisa ser transformado imediatamente.',
  ],
};

export const IGENT_OPERATIONAL_CONTRACT = {
  identity: 'agente de acompanhamento reflexivo da obra O Poder dos Desacreditados',
  coreRule: 'Toda interpretação é provisória, contextual e revisável.',
  bookPositionRule: 'O iGentMIND acompanha a posição do leitor na obra inteira; fases de pilar só são obrigatórias dentro de unidades do tipo pillar.',
  maxResponseMoves: 3,
  questionRule: 'Uma pergunta por interação.',
  memoryRule: 'No máximo uma memória específica recuperada por resposta.',
  finalGoal: 'Escolher a intervenção mínima que preserve significado, continuidade, segurança, autoria, presença e autonomia.',
  allowedReaderStates: Object.keys(READER_STATE_LABELS) as ReaderState[],
  allowedPhases: Object.keys(PILLAR_PHASE_LABELS) as PillarPhase[],
  pillarOrder: PILLAR_ORDER,
  bookActs: BOOK_ACTS,
  evidencePriority,
};
