import type {
  BookUnitType,
  DepthLevel,
  InterventionType,
  PillarPhase,
  ReaderBookPosition,
  ReaderState,
} from './igentMindContract';
import type {
  EvidenceSource,
  PrimarySignal,
  SecondarySignal,
  SignalAnalysisResult,
} from './igentMindSignals';

export type ScaleLevel = 0 | 1 | 2 | 3 | 4;

export type ReflectiveProgress =
  | 'not_started'
  | 'recognizing'
  | 'questioning'
  | 'remaining'
  | 'integrating';

export type ReaderMindState = {
  reader_id: string;
  book_position: ReaderBookPosition;
  current_unit_id: string;
  current_unit_type: BookUnitType;
  current_pillar_id?: string;
  current_section_id?: string;
  current_phase?: PillarPhase;
  current_question_id?: string;
  global_state: ReaderState;
  awareness_level: ScaleLevel;
  judgment_level: ScaleLevel;
  presence_level: ScaleLevel;
  readiness_level: ScaleLevel;
  load_level: ScaleLevel;
  avoidance_level: ScaleLevel;
  agency_level: ScaleLevel;
  depth_level: DepthLevel;
  interaction_streak: number;
  unanswered_count: number;
  pause_count: number;
  last_interaction_at?: string;
  last_meaningful_interaction_at?: string;
  active_signal_ids: string[];
  active_thread_ids: string[];
  recommended_next_action?: InterventionType;
  updated_at: string;
};

export type ReaderProgressState = {
  book_progress: number;
  unit_progress: number;
  act_progress?: number;
  pillar_progress?: number;
  content_progress: number;
  reflective_progress: ReflectiveProgress;
};

export type ReaderInteraction = {
  type: EvidenceSource | InterventionType;
  open_response_length?: number;
  pattern_confirmed?: boolean;
  pattern_corrected?: boolean;
  positioning_detected?: boolean;
  cross_pillar_connection?: boolean;
};

export type OpenThread = {
  id: string;
  reader_id: string;
  pillar_id: string;
  title: string;
  summary: string;
  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  status: 'open' | 'observing' | 'ready_to_revisit' | 'integrated' | 'closed_by_reader';
  confidence: 'low' | 'medium' | 'high';
  created_at: string;
  last_revisited_at?: string;
};

export type ReaderStateUpdateResult = {
  previous_state: ReaderState;
  current_state: ReaderState;
  previous_phase?: PillarPhase;
  current_phase?: PillarPhase;
  previous_depth: DepthLevel;
  allowed_depth: DepthLevel;
  scales_before: {
    awareness: ScaleLevel;
    judgment: ScaleLevel;
    presence: ScaleLevel;
    readiness: ScaleLevel;
    load: ScaleLevel;
    avoidance: ScaleLevel;
    agency: ScaleLevel;
  };
  scales_after: {
    awareness: ScaleLevel;
    judgment: ScaleLevel;
    presence: ScaleLevel;
    readiness: ScaleLevel;
    load: ScaleLevel;
    avoidance: ScaleLevel;
    agency: ScaleLevel;
  };
  state_change_reason: string[];
  phase_change_reason: string[];
  should_advance_phase: boolean;
  should_return_phase: boolean;
  should_pause: boolean;
  recommended_intervention: InterventionType;
  open_thread_ids: string[];
};

export const sourceWeight: Record<EvidenceSource, number> = {
  structured_option: 1,
  reading_event: 1,
  highlight: 1,
  previous_interaction: 1,
  open_response: 2,
  journal: 3,
  letter: 3,
  pillar_summary: 2,
  journey_summary: 2,
};

export const createInitialReaderMindState = (input: {
  readerId: string;
  pillarId: string;
  unitId?: string;
  unitType?: BookUnitType;
  bookProgress?: number;
  unitProgress?: number;
  phase?: PillarPhase;
  questionId?: string;
}): ReaderMindState => ({
  reader_id: input.readerId,
  book_position: {
    current_unit_id: input.unitId || input.pillarId,
    current_unit_type: input.unitType || 'pillar',
    current_pillar_id: input.unitType === 'pillar' || !input.unitType ? input.pillarId : undefined,
    current_phase: input.phase,
    unit_progress: input.unitProgress ?? 0,
    pillar_progress: input.unitType === 'pillar' || !input.unitType ? input.unitProgress ?? 0 : undefined,
    book_progress: input.bookProgress ?? 0,
  },
  current_unit_id: input.unitId || input.pillarId,
  current_unit_type: input.unitType || 'pillar',
  current_pillar_id: input.pillarId,
  current_phase: input.phase || 'consciousness',
  current_question_id: input.questionId,
  global_state: 'unmapped',
  awareness_level: 0,
  judgment_level: 0,
  presence_level: 0,
  readiness_level: 1,
  load_level: 0,
  avoidance_level: 0,
  agency_level: 0,
  depth_level: 1,
  interaction_streak: 0,
  unanswered_count: 0,
  pause_count: 0,
  active_signal_ids: [],
  active_thread_ids: [],
  recommended_next_action: 'question',
  updated_at: new Date().toISOString(),
});

export const deriveReaderState = (state: ReaderMindState): ReaderState => {
  if (state.global_state === 'paused') return 'paused';
  if (state.load_level >= 4 || (state.load_level >= 3 && state.presence_level <= 1)) return 'overloaded';
  if (
    state.awareness_level >= 3 &&
    state.presence_level >= 3 &&
    state.agency_level >= 2 &&
    state.readiness_level >= 3
  ) return 'integrating';
  if (
    state.awareness_level >= 2 &&
    state.readiness_level >= 3 &&
    state.presence_level >= 2 &&
    state.load_level <= 2
  ) return 'available';
  if (state.awareness_level >= 2 && state.readiness_level === 2) return 'oscillating';
  if (state.avoidance_level >= 2 && state.readiness_level <= 1) return 'defensive';
  if (state.awareness_level >= 1) return 'observing';
  return 'unmapped';
};

export const limitScaleChange = (previous: ScaleLevel, proposed: ScaleLevel): ScaleLevel => {
  if (proposed > previous + 1) return (previous + 1) as ScaleLevel;
  if (proposed < previous - 1) return (previous - 1) as ScaleLevel;
  return proposed;
};

export const calculateAllowedDepth = (state: ReaderMindState): DepthLevel => {
  if (state.global_state === 'paused' || state.global_state === 'overloaded') return 0;
  if (state.global_state === 'defensive' || state.global_state === 'unmapped') return 1;
  if (state.global_state === 'observing' || state.global_state === 'oscillating') return 2;
  if (state.global_state === 'available' || state.global_state === 'integrating') return 3;
  return 1;
};

export const isMeaningfulInteraction = (interaction: ReaderInteraction) =>
  Boolean(
    (interaction.open_response_length || 0) >= 20 ||
      interaction.type === 'journal' ||
      interaction.type === 'letter' ||
      interaction.pattern_confirmed ||
      interaction.pattern_corrected ||
      interaction.positioning_detected ||
      interaction.cross_pillar_connection,
  );

export const shouldAdvancePhase = (state: ReaderMindState) => {
  if (state.current_unit_type !== 'pillar' || !state.current_pillar_id || !state.current_phase) return false;
  if (state.current_phase === 'consciousness') {
    return state.awareness_level >= 2 && state.readiness_level >= 2 && state.load_level <= 2;
  }
  if (state.current_phase === 'judgment') {
    return state.awareness_level >= 2 && state.presence_level >= 2 && state.load_level <= 2;
  }
  return false;
};

export const nextPhase = (phase: PillarPhase): PillarPhase => {
  if (phase === 'consciousness') return 'judgment';
  if (phase === 'judgment') return 'presence';
  return 'presence';
};

export const unitUsesPillarPhases = (unitType: BookUnitType) => unitType === 'pillar';

export const shouldEvaluatePhaseProgression = (state: ReaderMindState) =>
  state.current_unit_type === 'pillar' && Boolean(state.current_pillar_id) && Boolean(state.current_phase);

const clampScale = (value: number): ScaleLevel => Math.max(0, Math.min(4, Math.round(value))) as ScaleLevel;
const clampDepth = (value: number): DepthLevel => Math.max(0, Math.min(3, Math.round(value))) as DepthLevel;

const proposeScalesFromSignal = (state: ReaderMindState, signal?: SignalAnalysisResult) => {
  const proposed = {
    awareness: state.awareness_level,
    judgment: state.judgment_level,
    presence: state.presence_level,
    readiness: state.readiness_level,
    load: state.load_level,
    avoidance: state.avoidance_level,
    agency: state.agency_level,
  };

  if (!signal) return proposed;

  proposed.load = clampScale(Math.max(proposed.load, signal.intensity));

  switch (signal.primary_signal) {
    case 'recognition':
      proposed.awareness = clampScale(Math.max(proposed.awareness, 2));
      proposed.readiness = clampScale(Math.max(proposed.readiness, 2));
      break;
    case 'uncertainty':
      proposed.awareness = clampScale(Math.max(proposed.awareness, 1));
      proposed.readiness = clampScale(Math.min(proposed.readiness, 2));
      break;
    case 'minimization':
      proposed.awareness = clampScale(Math.max(proposed.awareness, 1));
      proposed.avoidance = clampScale(Math.max(proposed.avoidance, 1));
      proposed.readiness = clampScale(Math.min(proposed.readiness, 2));
      break;
    case 'self_judgment':
    case 'external_judgment':
      proposed.judgment = clampScale(Math.max(proposed.judgment, 2));
      proposed.awareness = clampScale(Math.max(proposed.awareness, 1));
      break;
    case 'rigid_control':
      proposed.judgment = clampScale(Math.max(proposed.judgment, 2));
      proposed.avoidance = clampScale(Math.max(proposed.avoidance, 1));
      proposed.readiness = clampScale(Math.min(proposed.readiness, 2));
      break;
    case 'avoidance':
      proposed.avoidance = clampScale(Math.max(proposed.avoidance, 2));
      proposed.presence = clampScale(Math.min(proposed.presence, 1));
      proposed.readiness = clampScale(Math.min(proposed.readiness, 1));
      break;
    case 'ambivalence':
      proposed.awareness = clampScale(Math.max(proposed.awareness, 2));
      proposed.presence = clampScale(Math.max(proposed.presence, 1));
      proposed.readiness = clampScale(Math.max(proposed.readiness, 2));
      break;
    case 'integration':
      proposed.awareness = clampScale(Math.max(proposed.awareness, 3));
      proposed.presence = clampScale(Math.max(proposed.presence, 3));
      proposed.agency = clampScale(Math.max(proposed.agency, 2));
      proposed.readiness = clampScale(Math.max(proposed.readiness, 3));
      break;
  }

  return proposed;
};

export const updateReaderMindState = (
  previous: ReaderMindState,
  input: {
    signal?: SignalAnalysisResult;
    questionId?: string;
    openResponseLength?: number;
    paused?: boolean;
    now?: string;
  },
) => {
  const now = input.now || new Date().toISOString();
  const proposed = proposeScalesFromSignal(previous, input.signal);
  const meaningful = isMeaningfulInteraction({
    type: input.signal?.evidence[0]?.source_type || 'structured_option',
    open_response_length: input.openResponseLength || 0,
    pattern_confirmed: input.signal?.reader_confirmed,
    positioning_detected: input.signal?.primary_signal === 'integration',
  });

  let nextState: ReaderMindState = {
    ...previous,
    current_question_id: input.questionId || previous.current_question_id,
    awareness_level: limitScaleChange(previous.awareness_level, proposed.awareness),
    judgment_level: limitScaleChange(previous.judgment_level, proposed.judgment),
    presence_level: limitScaleChange(previous.presence_level, proposed.presence),
    readiness_level: limitScaleChange(previous.readiness_level, proposed.readiness),
    load_level: input.signal?.intensity === 4 ? 4 : limitScaleChange(previous.load_level, proposed.load),
    avoidance_level: limitScaleChange(previous.avoidance_level, proposed.avoidance),
    agency_level: limitScaleChange(previous.agency_level, proposed.agency),
    interaction_streak: previous.interaction_streak + 1,
    unanswered_count: input.openResponseLength === 0 ? previous.unanswered_count + 1 : previous.unanswered_count,
    pause_count: input.paused ? previous.pause_count + 1 : previous.pause_count,
    last_interaction_at: now,
    last_meaningful_interaction_at: meaningful ? now : previous.last_meaningful_interaction_at,
    active_signal_ids: input.signal
      ? Array.from(new Set([input.signal.primary_signal, ...input.signal.secondary_signals, ...previous.active_signal_ids])).slice(0, 8)
      : previous.active_signal_ids,
    updated_at: now,
  };

  if (input.paused) nextState.global_state = 'paused';
  nextState.global_state = deriveReaderState(nextState);
  const allowedDepth = calculateAllowedDepth(nextState);
  nextState.depth_level = clampDepth(
    allowedDepth > previous.depth_level + 1 ? previous.depth_level + 1 : allowedDepth,
  );

  const advance = shouldAdvancePhase(nextState);
  const currentPhase = advance && nextState.current_phase ? nextPhase(nextState.current_phase) : nextState.current_phase;
  nextState = {
    ...nextState,
    current_phase: currentPhase,
    recommended_next_action: input.signal?.recommended_interventions[0] || 'question',
  };

  const result: ReaderStateUpdateResult = {
    previous_state: previous.global_state,
    current_state: nextState.global_state,
    previous_phase: previous.current_phase,
    current_phase: nextState.current_phase,
    previous_depth: previous.depth_level,
    allowed_depth: nextState.depth_level,
    scales_before: {
      awareness: previous.awareness_level,
      judgment: previous.judgment_level,
      presence: previous.presence_level,
      readiness: previous.readiness_level,
      load: previous.load_level,
      avoidance: previous.avoidance_level,
      agency: previous.agency_level,
    },
    scales_after: {
      awareness: nextState.awareness_level,
      judgment: nextState.judgment_level,
      presence: nextState.presence_level,
      readiness: nextState.readiness_level,
      load: nextState.load_level,
      avoidance: nextState.avoidance_level,
      agency: nextState.agency_level,
    },
    state_change_reason: input.signal ? [`signal:${input.signal.primary_signal}`, `confidence:${input.signal.confidence}`] : [],
    phase_change_reason: advance ? ['phase progression criteria met'] : [],
    should_advance_phase: advance,
    should_return_phase: false,
    should_pause: nextState.global_state === 'paused' || nextState.global_state === 'overloaded',
    recommended_intervention: nextState.recommended_next_action || 'question',
    open_thread_ids: nextState.active_thread_ids,
  };

  return { state: nextState, result };
};

export const returnAfterPause = (previousReadiness: ScaleLevel, previousDepth: DepthLevel) => ({
  readiness_level: Math.min(previousReadiness, 2) as ScaleLevel,
  depth_level: Math.min(previousDepth, 1) as DepthLevel,
});
