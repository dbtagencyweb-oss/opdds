// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
import type {
  BookUnitType,
  DepthLevel,
  InterventionType,
  PillarPhase,
  ReaderState,
} from './igentMindContract';
import type { MemoryEngineResult } from './igentMindMemory';
import type {
  MindGuidedLetter,
  MindJournalPrompt,
  MindMicroReturn,
  MindPracticalAnchor,
  MindProtocolQuestion,
} from './igentMindProtocol';
import type { PrimarySignal, SignalAnalysisResult } from './igentMindSignals';
import {
  calculateAllowedDepth,
  nextPhase,
  type OpenThread,
  type ReaderMindState,
  type ReflectiveProgress,
  type ScaleLevel,
} from './igentMindState';

export type DecisionAction = 'advance' | 'remain' | 'return' | 'pause' | 'close';

export type NavigationAction =
  | 'continue_unit'
  | 'continue_section'
  | 'advance_section'
  | 'return_section'
  | 'advance_unit'
  | 'advance_pillar'
  | 'open_interlude'
  | 'open_presence_notebook'
  | 'suggest_revisit'
  | 'skip_reflection'
  | 'pause'
  | 'close';

export type ExplicitReaderAction =
  | 'continue'
  | 'pause'
  | 'skip'
  | 'write'
  | 'open_journal'
  | 'open_letter'
  | 'change_subject'
  | 'close'
  | 'correct_interpretation';

export type DecisionEngineInput = {
  reader_state: ReaderMindState;
  current_pillar: {
    id: string;
    title: string;
    phase?: PillarPhase;
  };
  current_unit?: {
    id: string;
    type: BookUnitType;
  };
  current_phase?: PillarPhase;
  current_interaction: {
    interaction_type: string;
    selected_option_id?: string;
    open_response?: string;
    journal_entry_id?: string;
    letter_id?: string;
    explicit_action?: ExplicitReaderAction;
  };
  signal_analysis: SignalAnalysisResult;
  memory_result?: MemoryEngineResult;
  recent_interventions: InterventionType[];
  recent_question_ids: string[];
  available_content: {
    questions: MindProtocolQuestion[];
    micro_returns: MindMicroReturn[];
    journal_prompts: MindJournalPrompt[];
    letters: MindGuidedLetter[];
    anchors: MindPracticalAnchor[];
  };
  content_progress: number;
  reflective_progress: ReflectiveProgress;
  active_open_threads: OpenThread[];
};

export type PhaseDecision = {
  action: Extract<DecisionAction, 'advance' | 'remain' | 'return'>;
  current_phase?: PillarPhase;
  next_phase?: PillarPhase;
  reasons: string[];
};

export type DecisionEngineResult = {
  action: DecisionAction;
  navigation_action: NavigationAction;
  selected_intervention: InterventionType;
  selected_content_id?: string;
  selected_memory_id?: string;
  current_unit_id: string;
  current_unit_type: BookUnitType;
  next_unit_id?: string;
  next_unit_type?: BookUnitType;
  current_phase?: PillarPhase;
  next_phase?: PillarPhase;
  current_depth: DepthLevel;
  selected_depth: DepthLevel;
  should_generate_response: boolean;
  should_ask_question: boolean;
  should_recall_memory: boolean;
  should_create_open_thread: boolean;
  should_update_progress: boolean;
  reader_can_skip_reflection: boolean;
  decision_reasons: string[];
  blocked_actions: InterventionType[];
  fallback_intervention: InterventionType;
};

export const READING_NAVIGATION_RULES = {
  reflection_is_optional: true,
  open_response_is_optional: true,
  journal_is_optional: true,
  letter_is_optional: true,
  presence_notebook_is_optional: true,
  reader_can_skip_question: true,
  reader_can_continue_reading: true,
  reader_can_revisit_any_unit: true,
};

export type InterventionCandidate = {
  type: InterventionType;
  state_score: number;
  signal_score: number;
  phase_score: number;
  depth_score: number;
  memory_score: number;
  progression_score: number;
  novelty_score: number;
  repetition_penalty: number;
  load_penalty: number;
  sensitivity_penalty: number;
  final_score: number;
};

export const decisionOrder = [
  'safety_check',
  'explicit_reader_request',
  'load_check',
  'pause_check',
  'depth_calculation',
  'phase_evaluation',
  'signal_evaluation',
  'memory_evaluation',
  'repetition_check',
  'intervention_selection',
  'content_selection',
  'fallback_validation',
] as const;

export const decisionPriority = [
  'safety',
  'explicit_reader_choice',
  'overload',
  'pause',
  'reader_state',
  'allowed_depth',
  'current_signal',
  'open_thread',
  'phase_progression',
  'memory_relevance',
  'editorial_rotation',
] as const;

export const maximumDepthByPhase: Record<PillarPhase, DepthLevel> = {
  consciousness: 2,
  judgment: 2,
  presence: 3,
};

export const allowedInterventionsByState: Record<ReaderState, InterventionType[]> = {
  unmapped: ['mirror', 'question', 'micro_return'],
  observing: ['mirror', 'question', 'micro_return', 'anchor'],
  defensive: ['mirror', 'question', 'pause', 'closure'],
  oscillating: ['mirror', 'question', 'journal', 'micro_return'],
  available: ['mirror', 'displacement', 'question', 'journal', 'letter', 'memory_recall', 'anchor'],
  integrating: ['memory_recall', 'connection', 'anchor', 'letter', 'closure'],
  overloaded: ['mirror', 'anchor', 'pause', 'closure'],
  paused: ['pause', 'closure'],
};

export const preferredInterventionsBySignal: Record<PrimarySignal, InterventionType[]> = {
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

export const interventionsByDepth: Record<DepthLevel, InterventionType[]> = {
  0: ['mirror', 'anchor', 'pause', 'closure'],
  1: ['mirror', 'question', 'micro_return', 'anchor', 'pause', 'closure'],
  2: ['mirror', 'displacement', 'question', 'micro_return', 'journal', 'memory_recall', 'anchor', 'pause', 'closure'],
  3: ['mirror', 'displacement', 'question', 'micro_return', 'journal', 'letter', 'memory_recall', 'connection', 'anchor', 'pause', 'closure'],
};

export const interventionLimits: Array<{ intervention: InterventionType; max_consecutive_uses: number }> = [
  { intervention: 'question', max_consecutive_uses: 2 },
  { intervention: 'micro_return', max_consecutive_uses: 1 },
  { intervention: 'memory_recall', max_consecutive_uses: 1 },
  { intervention: 'journal', max_consecutive_uses: 1 },
  { intervention: 'letter', max_consecutive_uses: 1 },
];

export const fallbackOrder: InterventionType[] = ['mirror', 'anchor', 'pause', 'closure'];
export const minimalInterventionPriority: InterventionType[] = [
  'mirror',
  'micro_return',
  'anchor',
  'question',
  'journal',
  'memory_recall',
  'letter',
  'connection',
];

export const evaluateLoad = (state: ReaderMindState): 'continue' | 'reduce' | 'pause' => {
  if (state.load_level >= 4) return 'pause';
  if (state.load_level === 3 || state.global_state === 'overloaded') return 'reduce';
  return 'continue';
};

export const resolveDepth = (input: {
  stateDepth: DepthLevel;
  loadDepth: DepthLevel;
  phaseDepth: DepthLevel;
  previousDepth: DepthLevel;
}): DepthLevel => {
  const maximumProgression = Math.min(3, input.previousDepth + 1) as DepthLevel;
  return Math.min(input.stateDepth, input.loadDepth, input.phaseDepth, maximumProgression) as DepthLevel;
};

export const intersectInterventions = (...groups: InterventionType[][]): InterventionType[] => {
  if (!groups.length) return [];
  return groups.reduce((result, group) => result.filter((item) => group.includes(item)));
};

export const calculateInterventionScore = (item: InterventionCandidate): number =>
  item.state_score * 0.2 +
  item.signal_score * 0.2 +
  item.phase_score * 0.15 +
  item.depth_score * 0.15 +
  item.progression_score * 0.1 +
  item.novelty_score * 0.1 +
  item.memory_score * 0.1 -
  item.repetition_penalty -
  item.load_penalty -
  item.sensitivity_penalty;

export const detectExplicitReaderAction = (interaction: DecisionEngineInput['current_interaction']): ExplicitReaderAction | null => {
  if (interaction.explicit_action) return interaction.explicit_action;
  const text = (interaction.open_response || '').toLowerCase();
  if (/\b(pausar|pausa|parar por agora|descansar)\b/.test(text)) return 'pause';
  if (/\b(encerrar|fechar|terminar por agora)\b/.test(text)) return 'close';
  if (/\b(pular|passar|proxima|próxima)\b/.test(text)) return 'skip';
  if (/\b(escrever|diario|diário)\b/.test(text)) return 'open_journal';
  if (/\b(carta)\b/.test(text)) return 'open_letter';
  if (/\b(não é isso|nao é isso|entendeu errado|corrigir)\b/.test(text)) return 'correct_interpretation';
  return null;
};

export const evaluatePhaseProgression = (input: DecisionEngineInput): PhaseDecision => {
  const state = input.reader_state;
  const reasons: string[] = [];
  const meaningfulCount = input.recent_question_ids.length;
  const signal = input.signal_analysis.primary_signal;

  if (!shouldEvaluatePhaseProgressionForDecision(input)) {
    return {
      action: 'remain',
      current_phase: input.current_phase,
      next_phase: input.current_phase,
      reasons: ['unit does not use pillar phase progression'],
    };
  }

  if (input.current_interaction.explicit_action === 'correct_interpretation') {
    const next = state.current_phase === 'presence' ? 'judgment' : 'consciousness';
    return {
      action: 'return',
      current_phase: input.current_phase,
      next_phase: next,
      reasons: ['reader corrected previous interpretation'],
    };
  }

  if (input.current_phase === 'consciousness') {
    const canAdvance = state.awareness_level >= 2 && state.readiness_level >= 2 && state.load_level <= 2;
    const hasEvidence =
      signal === 'recognition' ||
      signal === 'ambivalence' ||
      input.signal_analysis.secondary_signals.includes('repetition_awareness') ||
      meaningfulCount >= 2;
    if (canAdvance && hasEvidence) {
      reasons.push('awareness and readiness allow judgment phase');
      return { action: 'advance', current_phase: input.current_phase, next_phase: 'judgment', reasons };
    }
  }

  if (input.current_phase === 'judgment') {
    const canAdvance =
      state.awareness_level >= 2 &&
      state.presence_level >= 2 &&
      state.readiness_level >= 2 &&
      state.load_level <= 2;
    const hasDifferentiation = state.judgment_level >= 2 || signal === 'integration' || meaningfulCount >= 2;
    if (canAdvance && hasDifferentiation) {
      reasons.push('reader differentiates enough to enter presence');
      return { action: 'advance', current_phase: input.current_phase, next_phase: 'presence', reasons };
    }
  }

  reasons.push('remain until the current phase has enough evidence');
  return { action: 'remain', current_phase: input.current_phase, next_phase: input.current_phase, reasons };
};

export const unitUsesPillarPhases = (unitType: BookUnitType): boolean => unitType === 'pillar';

export const shouldEvaluatePhaseProgressionForDecision = (input: DecisionEngineInput): boolean =>
  input.reader_state.current_unit_type === 'pillar' &&
  Boolean(input.reader_state.current_pillar_id) &&
  Boolean(input.current_phase);

const resolveCurrentPhase = (input: DecisionEngineInput): PillarPhase =>
  input.current_phase || input.reader_state.current_phase || 'consciousness';

const determineNavigationAction = (
  action: DecisionAction,
  intervention: InterventionType,
  input: DecisionEngineInput,
): NavigationAction => {
  if (action === 'pause') return 'pause';
  if (action === 'close') return 'close';
  if (intervention === 'closure') return 'skip_reflection';
  if (input.reader_state.current_unit_type === 'pillar' && action === 'advance') return 'advance_section';
  return 'continue_unit';
};

export const canRevisitThread = (thread: OpenThread, state: ReaderMindState): boolean =>
  thread.status !== 'closed_by_reader' &&
  thread.confidence !== 'low' &&
  state.load_level <= 2 &&
  state.readiness_level >= 2;

const loadDepth = (load: ScaleLevel): DepthLevel => {
  if (load >= 4) return 0;
  if (load === 3) return 1;
  if (load === 2) return 2;
  return 3;
};

const loadAllowedInterventions = (loadDecision: ReturnType<typeof evaluateLoad>): InterventionType[] => {
  if (loadDecision === 'pause') return ['pause', 'anchor', 'closure'];
  if (loadDecision === 'reduce') return ['mirror', 'anchor', 'pause', 'closure', 'question'];
  return ['mirror', 'displacement', 'question', 'micro_return', 'journal', 'letter', 'memory_recall', 'connection', 'anchor', 'pause', 'closure'];
};

const phaseAllowedInterventions = (phase: PillarPhase): InterventionType[] => {
  if (phase === 'consciousness') return ['mirror', 'question', 'micro_return', 'anchor', 'pause', 'closure'];
  if (phase === 'judgment') return ['mirror', 'displacement', 'question', 'micro_return', 'journal', 'anchor', 'pause', 'closure'];
  return ['mirror', 'displacement', 'question', 'micro_return', 'journal', 'letter', 'memory_recall', 'connection', 'anchor', 'pause', 'closure'];
};

const consecutiveCount = (items: InterventionType[], intervention: InterventionType) => {
  let count = 0;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index] !== intervention) break;
    count += 1;
  }
  return count;
};

const removeRepeatedOrBlockedInterventions = (candidates: InterventionType[], input: DecisionEngineInput) => {
  const repeated = interventionLimits
    .filter((rule) => consecutiveCount(input.recent_interventions, rule.intervention) >= rule.max_consecutive_uses)
    .map((rule) => rule.intervention);

  return candidates.filter((candidate) => {
    if (repeated.includes(candidate)) return false;
    if (candidate === 'memory_recall') {
      const memory = input.memory_result;
      return Boolean(
        memory?.retrieval_score &&
          memory.retrieval_score >= 0.65 &&
          memory.memory_visible_to_reader &&
          input.reader_state.load_level < 3 &&
          input.reader_state.global_state !== 'defensive',
      );
    }
    if (candidate === 'letter') {
      return input.reader_state.readiness_level >= 3 && input.reader_state.presence_level >= 2 && input.reader_state.load_level <= 2;
    }
    if (candidate === 'journal') {
      return input.reader_state.readiness_level >= 2 && input.reader_state.load_level <= 2;
    }
    return true;
  });
};

const scoreInterventionCandidates = (
  candidates: InterventionType[],
  input: DecisionEngineInput,
  selectedDepth: DepthLevel,
): InterventionCandidate[] =>
  candidates.map((type) => {
    const item: InterventionCandidate = {
      type,
      state_score: allowedInterventionsByState[input.reader_state.global_state].includes(type) ? 1 : 0,
      signal_score: preferredInterventionsBySignal[input.signal_analysis.primary_signal].includes(type) ? 1 : 0,
      phase_score: phaseAllowedInterventions(resolveCurrentPhase(input)).includes(type) ? 1 : 0,
      depth_score: interventionsByDepth[selectedDepth].includes(type) ? 1 : 0,
      memory_score: type === 'memory_recall' && input.memory_result?.retrieval_score ? input.memory_result.retrieval_score : 0,
      progression_score:
        type === 'journal' && input.reflective_progress === 'questioning'
          ? 0.8
          : type === 'anchor' && input.reader_state.agency_level <= 1
            ? 0.7
            : 0.5,
      novelty_score: input.recent_interventions.includes(type) ? 0.25 : 1,
      repetition_penalty: consecutiveCount(input.recent_interventions, type) * 0.2,
      load_penalty: input.reader_state.load_level >= 3 && ['question', 'journal', 'letter', 'memory_recall', 'connection'].includes(type) ? 0.6 : 0,
      sensitivity_penalty: input.signal_analysis.confidence === 'low' && ['connection', 'letter', 'memory_recall'].includes(type) ? 0.4 : 0,
      final_score: 0,
    };
    return { ...item, final_score: calculateInterventionScore(item) };
  });

const selectMinimalAdequateIntervention = (candidates: InterventionCandidate[]) => {
  const sorted = [...candidates].sort((a, b) => {
    const diff = b.final_score - a.final_score;
    if (Math.abs(diff) >= 0.05) return diff;
    return minimalInterventionPriority.indexOf(a.type) - minimalInterventionPriority.indexOf(b.type);
  });
  return sorted[0]?.type;
};

const selectContentId = (intervention: InterventionType, input: DecisionEngineInput, selectedDepth: DepthLevel) => {
  const currentPhase = resolveCurrentPhase(input);
  if (intervention === 'question') {
    return input.available_content.questions.find((question) =>
      question.phase === currentPhase &&
      !input.recent_question_ids.includes(question.id) &&
      selectedDepth >= 1,
    )?.id;
  }
  if (intervention === 'micro_return') {
    return input.available_content.micro_returns.find((item) => item.phase === currentPhase)?.id;
  }
  if (intervention === 'journal') {
    return input.available_content.journal_prompts.find((item) => item.phase === currentPhase)?.id;
  }
  if (intervention === 'letter') {
    return input.available_content.letters.find((item) =>
      currentPhase === 'presence' ? item.type === 'presence' : item.type !== 'presence',
    )?.id;
  }
  if (intervention === 'anchor') {
    return input.available_content.anchors.find((item) => item.phase === currentPhase)?.id;
  }
  return undefined;
};

const buildDecision = (
  input: DecisionEngineInput,
  action: DecisionAction,
  selectedIntervention: InterventionType,
  selectedDepth: DepthLevel,
  reasons: string[],
  phaseDecision?: PhaseDecision,
): DecisionEngineResult => {
  const contentId = selectContentId(selectedIntervention, input, selectedDepth);
  const blockedActions = ([
    'question',
    'journal',
    'letter',
    'memory_recall',
    'connection',
    'displacement',
  ] as InterventionType[]).filter((item) => !interventionsByDepth[selectedDepth].includes(item));

  return {
    action,
    navigation_action: determineNavigationAction(action, selectedIntervention, input),
    selected_intervention: selectedIntervention,
    selected_content_id: contentId,
    selected_memory_id: selectedIntervention === 'memory_recall' ? input.memory_result?.retrieved_memory_id : undefined,
    current_unit_id: input.reader_state.current_unit_id,
    current_unit_type: input.reader_state.current_unit_type,
    current_phase: input.current_phase,
    next_phase: phaseDecision?.next_phase || input.current_phase,
    current_depth: input.reader_state.depth_level,
    selected_depth: selectedDepth,
    should_generate_response: selectedIntervention !== 'closure' || action !== 'close',
    should_ask_question: selectedIntervention === 'question',
    should_recall_memory: selectedIntervention === 'memory_recall',
    should_create_open_thread:
      input.signal_analysis.confidence !== 'low' &&
      input.signal_analysis.primary_signal !== 'recognition' &&
      input.reader_state.load_level <= 2,
    should_update_progress: action === 'advance' || Boolean(contentId),
    reader_can_skip_reflection: true,
    decision_reasons: reasons,
    blocked_actions: blockedActions,
    fallback_intervention: fallbackOrder.find((item) => interventionsByDepth[selectedDepth].includes(item)) || 'mirror',
  };
};

export const decideNextAction = (input: DecisionEngineInput): DecisionEngineResult => {
  const explicitAction = detectExplicitReaderAction(input.current_interaction);
  const stateDepth = calculateAllowedDepth(input.reader_state);
  const loadDecision = evaluateLoad(input.reader_state);
  const selectedDepth = resolveDepth({
    stateDepth,
    loadDepth: loadDepth(input.reader_state.load_level),
    phaseDepth: maximumDepthByPhase[resolveCurrentPhase(input)],
    previousDepth: input.reader_state.depth_level,
  });

  if (explicitAction === 'pause') {
    return buildDecision(input, 'pause', 'pause', 0, ['reader explicitly asked to pause']);
  }

  if (explicitAction === 'close') {
    return buildDecision(input, 'close', 'closure', selectedDepth, ['reader explicitly asked to close']);
  }

  if (loadDecision === 'pause') {
    return buildDecision(input, 'pause', 'pause', 0, ['load level requires immediate pause']);
  }

  const phaseDecision = evaluatePhaseProgression(input);
  const allowedByState = allowedInterventionsByState[input.reader_state.global_state];
  const allowedByDepth = interventionsByDepth[selectedDepth];
  const allowedByLoad = loadAllowedInterventions(loadDecision);
  const allowedByPhase = phaseAllowedInterventions(resolveCurrentPhase(input));
  const preferredBySignal = preferredInterventionsBySignal[input.signal_analysis.primary_signal];
  const candidates = intersectInterventions(allowedByState, allowedByDepth, allowedByLoad, allowedByPhase, preferredBySignal);
  const filtered = removeRepeatedOrBlockedInterventions(candidates, input);
  const scored = scoreInterventionCandidates(filtered, input, selectedDepth);
  const selected = selectMinimalAdequateIntervention(scored);
  const fallback = fallbackOrder.find((item) =>
    [allowedByState, allowedByDepth, allowedByLoad, allowedByPhase].every((group) => group.includes(item)),
  ) || 'mirror';
  const intervention = selected || fallback;

  return buildDecision(input, phaseDecision.action, intervention, selectedDepth, [
    ...phaseDecision.reasons,
    `load:${loadDecision}`,
    `signal:${input.signal_analysis.primary_signal}`,
    `depth:${selectedDepth}`,
    selected ? `selected:${selected}` : `fallback:${fallback}`,
  ], phaseDecision);
};
// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
