import type {
  BookActId,
  BookUnitType,
  DepthLevel,
  InterventionType,
  InterpretationConfidence,
  PillarPhase,
  ReaderState,
} from './igentMindContract';
import type {
  EvidenceSource,
  PrimarySignal,
  SecondarySignal,
  SignalIntensity,
} from './igentMindSignals';
import type { OpenThread, ReaderInteraction, ReflectiveProgress, ScaleLevel } from './igentMindState';

export type MemoryLayer = 'session' | 'unit' | 'pillar' | 'act' | 'journey';

export type MemoryType =
  | 'session_summary'
  | 'pillar_summary'
  | 'journey_pattern'
  | 'journal_excerpt'
  | 'letter_excerpt'
  | 'reader_phrase'
  | 'positioning'
  | 'cross_pillar_connection';

export type MemorySensitivity = 'normal' | 'personal' | 'sensitive' | 'restricted';

export type SessionMemory = {
  id: string;
  reader_id: string;
  session_id: string;
  current_unit_id: string;
  current_unit_type: BookUnitType;
  current_pillar_id?: string;
  current_phase?: PillarPhase;
  current_question_id?: string;
  selected_option_id?: string;
  current_open_response?: string;
  recent_signal_ids: string[];
  recent_intervention_types: InterventionType[];
  current_reader_state: ReaderState;
  current_depth: DepthLevel;
  current_load: ScaleLevel;
  current_readiness: ScaleLevel;
  active_memory_id?: string;
  active_open_thread_id?: string;
  session_summary?: string;
  recent_interactions: string[];
  started_at: string;
  updated_at: string;
  expires_at?: string;
};

export type UnitMemory = {
  id: string;
  reader_id: string;
  unit_id: string;
  unit_type: BookUnitType;
  main_topic?: string;
  summary: string;
  dominant_primary_signals: PrimarySignal[];
  dominant_secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];
  meaningful_excerpt_ids: string[];
  open_thread_ids: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ActMemory = {
  id: string;
  reader_id: string;
  act_id: BookActId;
  pillar_ids: string[];
  consciousness_summary?: string;
  judgment_summary?: string;
  presence_summary?: string;
  recurring_pattern_ids: string[];
  meaningful_positioning_ids: string[];
  open_thread_ids: string[];
  presence_notebook_id?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type PresenceNotebookResponse = {
  prompt_id: string;
  content: string;
  meaningful_excerpt?: string;
  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];
};

export type PresenceNotebook = {
  id: string;
  reader_id: string;
  notebook_type: 'survival' | 'reconstruction' | 'continuity' | 'final_reflection';
  related_act_id?: BookActId;
  related_pillar_ids: string[];
  responses: PresenceNotebookResponse[];
  triad_summary?: {
    consciousness?: string;
    judgment?: string;
    presence?: string;
  };
  meaningful_excerpt?: string;
  can_be_analyzed: boolean;
  can_be_recalled: boolean;
  can_be_quoted: boolean;
  created_at: string;
  updated_at: string;
};

export const MEMORY_LAYER_PRIORITY: MemoryLayer[] = ['session', 'unit', 'pillar', 'act', 'journey'];

export const determineMemoryLayerForUnit = (unitType: BookUnitType): MemoryLayer => {
  if (unitType === 'pillar') return 'pillar';
  if (unitType === 'act_opening') return 'act';
  return 'unit';
};

export type SessionSummary = {
  session_id: string;
  reader_id: string;
  pillar_id: string;
  main_topic?: string;
  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  meaningful_excerpt?: string;
  reader_state_at_end: ReaderState;
  open_question?: string;
  next_recommended_action?: InterventionType;
  should_update_pillar_memory: boolean;
  created_at: string;
};

export type ReaderLanguageFragment = {
  id: string;
  reader_id: string;
  text: string;
  source_type: Extract<EvidenceSource, 'open_response' | 'journal' | 'letter'>;
  source_id: string;
  pillar_id: string;
  semantic_tags: string[];
  emotional_load: ScaleLevel;
  permission_to_reuse: boolean;
  reuse_count: number;
  created_at: string;
  last_used_at?: string;
};

export type PillarTriadSummary = {
  consciousness: string;
  judgment: string;
  presence: string;
};

export type PillarMemory = {
  id: string;
  reader_id: string;
  pillar_id: string;
  current_phase: PillarPhase;
  content_progress: number;
  reflective_progress: ReflectiveProgress;
  dominant_primary_signals: PrimarySignal[];
  dominant_secondary_signals: SecondarySignal[];
  confirmed_pattern_ids: string[];
  open_thread_ids: string[];
  relevant_journal_entry_ids: string[];
  relevant_letter_ids: string[];
  relevant_highlight_ids: string[];
  reader_language_fragments: ReaderLanguageFragment[];
  triad_summary: PillarTriadSummary;
  main_summary: string;
  presence_summary?: string;
  unresolved_summary?: string;
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
};

export type ReaderPattern = {
  id: string;
  reader_id: string;
  title: string;
  internal_code: string;
  primary_signal: PrimarySignal;
  secondary_signals: SecondarySignal[];
  related_pillar_ids: string[];
  evidence_ids: string[];
  confidence: InterpretationConfidence;
  intensity: SignalIntensity;
  status: 'hypothesis' | 'recurring' | 'confirmed_by_reader' | 'integrating' | 'integrated' | 'closed_by_reader';
  summary: string;
  first_detected_at: string;
  last_detected_at: string;
  updated_at: string;
};

export type MeaningfulPositioning = {
  id: string;
  reader_id: string;
  pillar_id: string;
  text: string;
  type: 'limit' | 'request' | 'decision' | 'recognition' | 'permission' | 'release';
  source_type: Extract<EvidenceSource, 'open_response' | 'journal' | 'letter'>;
  source_id: string;
  confidence: InterpretationConfidence;
  created_at: string;
};

export type CrossPillarConnection = {
  id: string;
  reader_id: string;
  source_pillar_id: string;
  target_pillar_id: string;
  pattern_id?: string;
  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  summary: string;
  evidence_ids: string[];
  confidence: InterpretationConfidence;
  reader_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type JourneyMemory = {
  id: string;
  reader_id: string;
  completed_pillar_ids: string[];
  current_pillar_id?: string;
  recurring_pattern_ids: string[];
  integrated_pattern_ids: string[];
  closed_pattern_ids: string[];
  cross_pillar_connections: CrossPillarConnection[];
  reader_language_fragments: ReaderLanguageFragment[];
  meaningful_positionings: MeaningfulPositioning[];
  journey_summary: string;
  current_journey_movement?: string;
  created_at: string;
  updated_at: string;
};

export type MemoryRetrievalRequest = {
  reader_id: string;
  current_pillar_id: string;
  current_phase: PillarPhase;
  current_primary_signal?: PrimarySignal;
  current_secondary_signals: SecondarySignal[];
  current_reader_state: ReaderState;
  allowed_depth: DepthLevel;
  max_results: number;
  allowed_memory_types: MemoryType[];
};

export type MemoryCandidate = {
  memory_id: string;
  memory_type: MemoryType;
  semantic_similarity: number;
  signal_similarity: number;
  pillar_relevance: number;
  recency_score: number;
  confidence_score: number;
  reader_confirmation_score: number;
  sensitivity_penalty: number;
  final_score: number;
};

export type MemoryPermission = {
  memory_id: string;
  can_store: boolean;
  can_analyze: boolean;
  can_recall: boolean;
  can_quote: boolean;
};

export type AgentMemoryContext = {
  current_session: {
    recent_interactions: string[];
    current_state: ReaderState;
    current_signal?: PrimarySignal;
  };
  pillar_context: {
    triad_summary?: PillarTriadSummary;
    dominant_signals: string[];
    active_thread?: string;
  };
  journey_context?: {
    relevant_pattern?: string;
    relevant_positioning?: string;
    cross_pillar_connection?: string;
  };
  recalled_memory?: {
    type: MemoryType;
    summary: string;
    exact_excerpt?: string;
  };
};

export type MemoryEngineResult = {
  session_memory_updated: boolean;
  pillar_memory_updated: boolean;
  journey_memory_updated: boolean;
  created_memory_ids: string[];
  updated_memory_ids: string[];
  retrieved_memory_id?: string;
  retrieved_memory_type?: MemoryType;
  retrieval_score?: number;
  memory_visible_to_reader: boolean;
  exact_quote_allowed: boolean;
  pattern_created: boolean;
  pattern_updated: boolean;
  pattern_id?: string;
  open_thread_created: boolean;
  open_thread_updated: boolean;
  open_thread_id?: string;
  compression_required: boolean;
  correction_applied: boolean;
  reason: string[];
};

export const MEMORY_RETRIEVAL_THRESHOLD = 0.65;
export const MAX_VISIBLE_MEMORIES_PER_RESPONSE = 1;
export const MAX_INTERNAL_MEMORY_CANDIDATES = 6;

export const createSessionMemory = (input: {
  readerId: string;
  sessionId: string;
  pillarId: string;
  unitId?: string;
  unitType?: BookUnitType;
  phase?: PillarPhase;
  readerState: ReaderState;
  depth: DepthLevel;
  load: ScaleLevel;
  readiness: ScaleLevel;
  questionId?: string;
}): SessionMemory => {
  const now = new Date().toISOString();
  return {
    id: `session_memory_${input.sessionId}`,
    reader_id: input.readerId,
    session_id: input.sessionId,
    current_unit_id: input.unitId || input.pillarId,
    current_unit_type: input.unitType || 'pillar',
    current_pillar_id: input.pillarId,
    current_phase: input.phase,
    current_question_id: input.questionId,
    recent_signal_ids: [],
    recent_intervention_types: [],
    current_reader_state: input.readerState,
    current_depth: input.depth,
    current_load: input.load,
    current_readiness: input.readiness,
    recent_interactions: [],
    started_at: now,
    updated_at: now,
  };
};

export const calculateMemoryScore = (candidate: MemoryCandidate) =>
  candidate.semantic_similarity * 0.25 +
  candidate.signal_similarity * 0.2 +
  candidate.pillar_relevance * 0.15 +
  candidate.recency_score * 0.1 +
  candidate.confidence_score * 0.15 +
  candidate.reader_confirmation_score * 0.15 -
  candidate.sensitivity_penalty;

export const shouldCreatePattern = (input: {
  evidenceCount: number;
  sourceTypeCount: number;
  relatedPillarCount: number;
  confirmedByReader: boolean;
}) =>
  Boolean(
    input.confirmedByReader ||
      input.evidenceCount >= 3 ||
      input.sourceTypeCount >= 2 ||
      input.relatedPillarCount >= 2,
  );

export const shouldUpdatePillarMemory = (interaction: ReaderInteraction & {
  is_meaningful?: boolean;
  phase_changed?: boolean;
  pillar_completed?: boolean;
}) =>
  Boolean(
    interaction.is_meaningful ||
      interaction.type === 'journal' ||
      interaction.type === 'letter' ||
      interaction.pattern_confirmed ||
      interaction.pattern_corrected ||
      interaction.phase_changed ||
      interaction.pillar_completed,
  );

export const allowedMemoryTypesByState: Record<ReaderState, MemoryType[]> = {
  unmapped: [],
  observing: ['session_summary', 'reader_phrase'],
  defensive: ['session_summary', 'pillar_summary'],
  oscillating: ['session_summary', 'pillar_summary', 'reader_phrase'],
  available: ['session_summary', 'pillar_summary', 'journal_excerpt', 'reader_phrase', 'positioning'],
  integrating: ['pillar_summary', 'journey_pattern', 'positioning', 'cross_pillar_connection', 'reader_phrase'],
  overloaded: ['session_summary'],
  paused: [],
};

export const canRecallMemory = (input: {
  sensitivity: MemorySensitivity;
  permission?: MemoryPermission;
  readerState: ReaderState;
  memoryType: MemoryType;
}) => {
  if (input.sensitivity === 'restricted') return false;
  if (input.permission && (!input.permission.can_recall || !input.permission.can_analyze)) return false;
  return allowedMemoryTypesByState[input.readerState].includes(input.memoryType);
};

export const preserveReaderFragment = (input: {
  text: string;
  readerId: string;
  sourceType: Extract<EvidenceSource, 'open_response' | 'journal' | 'letter'>;
  sourceId: string;
  pillarId: string;
  semanticTags: string[];
  emotionalLoad: ScaleLevel;
}): ReaderLanguageFragment | null => {
  const clean = input.text.replace(/\s+/g, ' ').trim();
  if (clean.length < 24 || clean.length > 240) return null;
  return {
    id: `fragment_${input.sourceId}`,
    reader_id: input.readerId,
    text: clean,
    source_type: input.sourceType,
    source_id: input.sourceId,
    pillar_id: input.pillarId,
    semantic_tags: input.semanticTags,
    emotional_load: input.emotionalLoad,
    permission_to_reuse: true,
    reuse_count: 0,
    created_at: new Date().toISOString(),
  };
};

export const buildAgentMemoryContext = (input: {
  session?: SessionMemory | null;
  pillar?: PillarMemory | null;
  journey?: JourneyMemory | null;
  recalled?: AgentMemoryContext['recalled_memory'];
}): AgentMemoryContext => ({
  current_session: {
    recent_interactions: input.session?.recent_interactions.slice(-6) || [],
    current_state: input.session?.current_reader_state || 'unmapped',
    current_signal: input.session?.recent_signal_ids[0] as PrimarySignal | undefined,
  },
  pillar_context: {
    triad_summary: input.pillar?.triad_summary,
    dominant_signals: [
      ...(input.pillar?.dominant_primary_signals || []),
      ...(input.pillar?.dominant_secondary_signals || []),
    ].slice(0, 9),
    active_thread: input.pillar?.open_thread_ids[0],
  },
  journey_context: input.journey
    ? {
        relevant_pattern: input.journey.recurring_pattern_ids[0],
        relevant_positioning: input.journey.meaningful_positionings[0]?.text,
        cross_pillar_connection: input.journey.cross_pillar_connections[0]?.summary,
      }
    : undefined,
  recalled_memory: input.recalled,
});

export const defaultMemoryEngineResult = (reason: string[] = []): MemoryEngineResult => ({
  session_memory_updated: false,
  pillar_memory_updated: false,
  journey_memory_updated: false,
  created_memory_ids: [],
  updated_memory_ids: [],
  memory_visible_to_reader: false,
  exact_quote_allowed: false,
  pattern_created: false,
  pattern_updated: false,
  open_thread_created: false,
  open_thread_updated: false,
  compression_required: false,
  correction_applied: false,
  reason,
});
