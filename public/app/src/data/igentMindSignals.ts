import type { InterpretationConfidence, InterventionType } from './igentMindContract';

export type PrimarySignal =
  | 'recognition'
  | 'uncertainty'
  | 'minimization'
  | 'self_judgment'
  | 'external_judgment'
  | 'rigid_control'
  | 'avoidance'
  | 'ambivalence'
  | 'integration';

export type SecondarySignal =
  | 'defensive_autonomy'
  | 'fear_of_dependency'
  | 'difficulty_receiving_support'
  | 'anticipation_of_failure'
  | 'silence_to_preserve_bond'
  | 'need_for_approval'
  | 'guilt_for_setting_limits'
  | 'overresponsibility'
  | 'control_through_performance'
  | 'worth_tied_to_productivity'
  | 'pain_normalization'
  | 'grief_suspension'
  | 'desire_suppression'
  | 'faith_conflict'
  | 'scarcity_vigilance'
  | 'emptiness_avoidance'
  | 'repetition_awareness'
  | 'coherent_positioning';

export type EvidenceSource =
  | 'structured_option'
  | 'open_response'
  | 'journal'
  | 'letter'
  | 'highlight'
  | 'reading_event'
  | 'previous_interaction'
  | 'pillar_summary'
  | 'journey_summary';

export type SignalIntensity = 0 | 1 | 2 | 3 | 4;

export type DetectedSignal = {
  primary: PrimarySignal;
  secondary: SecondarySignal[];
  pillar_specific: PillarSpecificSignalCode[];
  intensity: SignalIntensity;
  confidence: InterpretationConfidence;
  evidence_ids: string[];
  source_types: EvidenceSource[];
};

export type PillarSpecificSignalCode = string;

export type PillarSpecificSignal = {
  code: PillarSpecificSignalCode;
  pillar_id: string;
  title: string;
  description: string;
  related_primary_signals: PrimarySignal[];
  related_secondary_signals: SecondarySignal[];
  active: boolean;
};

export type SignalRecord = {
  signal: PrimarySignal | SecondarySignal;
  score: number;
  last_detected_at: string;
  evidence_count: number;
  confirmed_by_reader: boolean;
};

export type SignalAnalysisResult = {
  primary_signal: PrimarySignal;
  secondary_signals: SecondarySignal[];
  intensity: SignalIntensity;
  confidence: InterpretationConfidence;
  evidence: Array<{
    source_type: EvidenceSource;
    source_id: string;
    excerpt?: string;
  }>;
  reader_confirmed: boolean;
  contradicts_previous_signal: boolean;
  previous_signal_id?: string;
  recommended_interventions: InterventionType[];
  should_create_pattern: boolean;
  should_update_existing_pattern: boolean;
  requires_more_context: boolean;
};

export const PRIMARY_SIGNAL_LABELS: Record<PrimarySignal, string> = {
  recognition: 'Reconhecimento',
  uncertainty: 'Incerteza',
  minimization: 'Minimização',
  self_judgment: 'Autocondenação',
  external_judgment: 'Julgamento externo',
  rigid_control: 'Controle rígido',
  avoidance: 'Evitação',
  ambivalence: 'Ambivalência',
  integration: 'Integração',
};

export const PRIMARY_SIGNAL_PHASE: Record<PrimarySignal, 'consciousness' | 'judgment' | 'presence'> = {
  recognition: 'consciousness',
  uncertainty: 'consciousness',
  minimization: 'consciousness',
  self_judgment: 'judgment',
  external_judgment: 'judgment',
  rigid_control: 'judgment',
  avoidance: 'presence',
  ambivalence: 'presence',
  integration: 'presence',
};

export const SECONDARY_SIGNAL_LABELS: Record<SecondarySignal, string> = {
  defensive_autonomy: 'Autonomia defensiva',
  fear_of_dependency: 'Medo de depender',
  difficulty_receiving_support: 'Dificuldade de receber apoio',
  anticipation_of_failure: 'Antecipação da falha',
  silence_to_preserve_bond: 'Silêncio para preservar vínculo',
  need_for_approval: 'Necessidade de aprovação',
  guilt_for_setting_limits: 'Culpa por estabelecer limites',
  overresponsibility: 'Responsabilidade excessiva',
  control_through_performance: 'Controle pelo desempenho',
  worth_tied_to_productivity: 'Valor ligado à produtividade',
  pain_normalization: 'Normalização da dor',
  grief_suspension: 'Suspensão do luto',
  desire_suppression: 'Supressão do desejo',
  faith_conflict: 'Conflito de fé',
  scarcity_vigilance: 'Vigilância de escassez',
  emptiness_avoidance: 'Evitação do vazio',
  repetition_awareness: 'Consciência da repetição',
  coherent_positioning: 'Posicionamento coerente',
};

export const RECOGNITION_SPECIFIC_SIGNALS: PillarSpecificSignal[] = [
  {
    code: 'self_avoidance',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Evitação de si',
    description: 'O leitor mantém funcionamento externo para evitar contato com o estado interno.',
    related_primary_signals: ['avoidance', 'minimization'],
    related_secondary_signals: ['emptiness_avoidance'],
    active: true,
  },
  {
    code: 'denial_of_current_state',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Negação do estado atual',
    description: 'O leitor reduz, disfarça ou evita admitir o que está presente agora.',
    related_primary_signals: ['minimization', 'uncertainty'],
    related_secondary_signals: [],
    active: true,
  },
  {
    code: 'functioning_without_feeling',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Funcionamento sem contato',
    description: 'O leitor continua executando tarefas enquanto permanece distante do próprio estado.',
    related_primary_signals: ['avoidance', 'rigid_control'],
    related_secondary_signals: ['control_through_performance'],
    active: true,
  },
  {
    code: 'internalized_self_attack',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Ataque interno',
    description: 'O leitor responde ao próprio estado com desprezo, cobrança ou condenação.',
    related_primary_signals: ['self_judgment'],
    related_secondary_signals: [],
    active: true,
  },
  {
    code: 'performance_to_belong',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Performance para caber',
    description: 'O leitor reduz ou edita a própria presença para continuar sendo aceito.',
    related_primary_signals: ['external_judgment', 'rigid_control'],
    related_secondary_signals: ['need_for_approval', 'silence_to_preserve_bond'],
    active: true,
  },
  {
    code: 'self_invisibility',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Invisibilidade de si',
    description: 'Necessidades e estados internos deixam de receber atenção do próprio leitor.',
    related_primary_signals: ['avoidance', 'minimization'],
    related_secondary_signals: [],
    active: true,
  },
  {
    code: 'body_held_tension',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Tensão corporal retida',
    description: 'O corpo sustenta tensão, aperto, peso ou inquietação ainda não nomeados.',
    related_primary_signals: ['recognition', 'uncertainty'],
    related_secondary_signals: [],
    active: true,
  },
  {
    code: 'automatic_escape',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Fuga automática',
    description: 'O leitor busca estímulo, explicação ou movimento quando o estado interno se aproxima.',
    related_primary_signals: ['avoidance'],
    related_secondary_signals: ['emptiness_avoidance'],
    active: true,
  },
  {
    code: 'return_to_self',
    pillar_id: 'pillar_01_reconhecimento',
    title: 'Retorno a si',
    description: 'O leitor consegue reconhecer e permanecer diante do estado sem ataque imediato.',
    related_primary_signals: ['recognition', 'integration'],
    related_secondary_signals: ['coherent_positioning'],
    active: true,
  },
];

export const getPillarSpecificSignals = (pillarId?: string) =>
  pillarId === 'pillar_01_reconhecimento' ? RECOGNITION_SPECIFIC_SIGNALS : [];

export const interventionByPrimarySignal: Record<PrimarySignal, InterventionType[]> = {
  recognition: ['mirror', 'question', 'micro_return'],
  uncertainty: ['mirror', 'question', 'pause'],
  minimization: ['mirror', 'displacement', 'question'],
  self_judgment: ['mirror', 'displacement', 'anchor'],
  external_judgment: ['mirror', 'question', 'journal'],
  rigid_control: ['mirror', 'anchor', 'pause'],
  avoidance: ['mirror', 'pause', 'closure'],
  ambivalence: ['mirror', 'question', 'journal'],
  integration: ['memory_recall', 'connection', 'anchor'],
};

export const prohibitedClassificationTerms = [
  'trauma',
  'transtorno',
  'depressão',
  'ansiedade clínica',
  'dependência emocional',
  'narcisismo',
  'personalidade evitativa',
  'compulsão',
  'síndrome',
  'dissociação',
  'bloqueio emocional definitivo',
  'autossabotagem como sentença',
];

export const defaultPrimaryBySemanticPosition = {
  recognition: 'recognition',
  minimization: 'minimization',
  defense: 'rigid_control',
  ambivalence: 'ambivalence',
  desire: 'integration',
  uncertainty: 'uncertainty',
} as const satisfies Record<string, PrimarySignal>;

export const calculateConfidence = (
  evidenceCount: number,
  distinctSourceCount: number,
  readerConfirmedPattern: boolean,
): InterpretationConfidence => {
  if (readerConfirmedPattern || (evidenceCount >= 3 && distinctSourceCount >= 2)) return 'high';
  if (evidenceCount >= 2 || distinctSourceCount >= 2) return 'medium';
  return 'low';
};

export const decaySignal = (score: number, inactivePillarCount: number) => {
  const decay = inactivePillarCount * 0.5;
  return Math.max(0, score - decay);
};

export const analyzeStructuredSignal = (input: {
  primary?: PrimarySignal;
  secondary?: SecondarySignal[];
  sourceId: string;
  intensity?: SignalIntensity;
  readerConfirmed?: boolean;
}): SignalAnalysisResult => {
  const primary = input.primary || 'uncertainty';
  const secondary = (input.secondary || []).slice(0, 3);
  const evidenceCount = 1;
  const sourceCount = 1;
  const confidence = calculateConfidence(evidenceCount, sourceCount, Boolean(input.readerConfirmed));

  return {
    primary_signal: primary,
    secondary_signals: secondary,
    intensity: input.intensity ?? 1,
    confidence,
    evidence: [{ source_type: 'structured_option', source_id: input.sourceId }],
    reader_confirmed: Boolean(input.readerConfirmed),
    contradicts_previous_signal: false,
    recommended_interventions: interventionByPrimarySignal[primary],
    should_create_pattern: false,
    should_update_existing_pattern: false,
    requires_more_context: confidence === 'low',
  };
};
