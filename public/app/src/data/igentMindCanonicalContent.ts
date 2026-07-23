import type {
  BookActId,
  BookUnitType,
  CanonicalSectionType,
  DepthLevel,
  InterpretationConfidence,
  InterventionType,
  PillarPhase,
  ReaderState,
} from './igentMindContract';
import type { ContentOrigin } from './igentMindComposer';
import type { SemanticPosition } from './igentMindProtocol';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';

export type ContentLayer = 'canonical_book' | 'igent_companion';

export const BOOK_ID = 'o_poder_dos_desacreditados';

export type BookMetadata = {
  id: string;
  title: string;
  author: string;
  language: 'pt-BR';
  canonical_version: string;
  schema_version: string;
};

export const BOOK_METADATA: BookMetadata = {
  id: BOOK_ID,
  title: 'O Poder dos Desacreditados',
  author: 'Diego Bock Tavares',
  language: 'pt-BR',
  canonical_version: '2026-06-25',
  schema_version: '2.0.0',
};

export type PillarId =
  | 'pillar_01_reconhecimento'
  | 'pillar_02_familia'
  | 'pillar_03_luto'
  | 'pillar_04_trabalho'
  | 'pillar_05_dor'
  | 'pillar_06_desejo'
  | 'pillar_07_fe'
  | 'pillar_08_escassez'
  | 'pillar_09_vazio';

export const PILLAR_ORDER_CANONICAL: PillarId[] = [
  'pillar_01_reconhecimento',
  'pillar_02_familia',
  'pillar_03_luto',
  'pillar_04_trabalho',
  'pillar_05_dor',
  'pillar_06_desejo',
  'pillar_07_fe',
  'pillar_08_escassez',
  'pillar_09_vazio',
];

export type CanonicalSection = {
  id: string;
  unit_id: string;
  type: CanonicalSectionType;
  order: number;
  title?: string;
  subtitle?: string;
  phase?: PillarPhase;
  page_start?: number;
  page_end?: number;
  canonical_text_reference?: string;
  interaction_allowed: boolean;
  reflection_optional: boolean;
  active: boolean;
};

export type CanonicalBookUnit = {
  id: string;
  book_id: string;
  type: BookUnitType;
  order: number;
  act_id?: BookActId;
  pillar_id?: PillarId;
  title: string;
  subtitle?: string;
  opening_quote?: string;
  page_start?: number;
  page_end?: number;
  sections: CanonicalSection[];
  previous_unit_id?: string;
  next_unit_id?: string;
  required_for_reading_progress: boolean;
  reflection_optional: boolean;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: string;
};

export type BookActCanonicalDefinition = {
  id: BookActId;
  number: 1 | 2 | 3;
  title: string;
  internal_movement: string;
  opening_unit_id: string;
  pillar_ids: PillarId[];
  interlude_ids: string[];
  presence_notebook_id: string;
  order: number;
};

export const BOOK_ACTS_CANONICAL: BookActCanonicalDefinition[] = [
  {
    id: 'act_01_survival',
    number: 1,
    title: 'Tríade da Sobrevivência',
    internal_movement: 'Reconhecer o que sobreviveu, perceber os pactos e dar lugar às ausências.',
    opening_unit_id: 'unit_act_01_opening',
    pillar_ids: ['pillar_01_reconhecimento', 'pillar_02_familia', 'pillar_03_luto'],
    interlude_ids: ['unit_interlude_fenda'],
    presence_notebook_id: 'unit_notebook_survival',
    order: 1,
  },
  {
    id: 'act_02_reconstruction',
    number: 2,
    title: 'Tríade da Reconstrução',
    internal_movement: 'Criar base interna, atravessar quedas e reconstruir sem apagar as marcas.',
    opening_unit_id: 'unit_act_02_opening',
    pillar_ids: ['pillar_04_trabalho', 'pillar_05_dor', 'pillar_06_desejo'],
    interlude_ids: [],
    presence_notebook_id: 'unit_notebook_reconstruction',
    order: 2,
  },
  {
    id: 'act_03_continuity',
    number: 3,
    title: 'Tríade da Continuidade',
    internal_movement: 'Permanecer consciente, sustentar o possível e continuar sem se destruir.',
    opening_unit_id: 'unit_act_03_opening',
    pillar_ids: ['pillar_07_fe', 'pillar_08_escassez', 'pillar_09_vazio'],
    interlude_ids: [],
    presence_notebook_id: 'unit_notebook_continuity',
    order: 3,
  },
];

export type CanonicalPillarIdentity = {
  id: PillarId;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  act_id: BookActId;
  title: string;
  extended_title?: string;
  subtitle: string;
  opening_quote?: string;
  threshold_label?: string;
  threshold_text?: string;
  canonical_unit_id: string;
};

export const CANONICAL_PILLARS: CanonicalPillarIdentity[] = [
  {
    id: 'pillar_01_reconhecimento',
    number: 1,
    act_id: 'act_01_survival',
    title: 'Reconhecimento',
    subtitle: 'Eu não estou quebrado.',
    opening_quote: 'Todo vínculo começa quando você deixa de se tratar como inimigo.',
    threshold_label: 'Limiar',
    threshold_text: 'Onde a negação cessa.',
    canonical_unit_id: 'unit_pillar_01_reconhecimento',
  },
  {
    id: 'pillar_02_familia',
    number: 2,
    act_id: 'act_01_survival',
    title: 'Família',
    extended_title: 'Família & Lealdades Invisíveis',
    subtitle: 'O primeiro lugar onde aprendemos a nos calar.',
    threshold_label: 'Raiz',
    canonical_unit_id: 'unit_pillar_02_familia',
  },
  {
    id: 'pillar_03_luto',
    number: 3,
    act_id: 'act_01_survival',
    title: 'Luto',
    extended_title: 'Luto, Ausência & Quebra de Laços',
    subtitle: 'Quando a ausência permanece.',
    threshold_label: 'Vazio',
    canonical_unit_id: 'unit_pillar_03_luto',
  },
  {
    id: 'pillar_04_trabalho',
    number: 4,
    act_id: 'act_02_reconstruction',
    title: 'Trabalho',
    extended_title: 'Trabalho, Valor & Identidade',
    subtitle: 'Quando produzir deixa de significar existir.',
    threshold_label: 'Peso',
    canonical_unit_id: 'unit_pillar_04_trabalho',
  },
  {
    id: 'pillar_05_dor',
    number: 5,
    act_id: 'act_02_reconstruction',
    title: 'Dor',
    extended_title: 'Dor, Fuga & Anestesia',
    subtitle: 'Aquilo que ainda permanece vivo.',
    threshold_label: 'Escape',
    canonical_unit_id: 'unit_pillar_05_dor',
  },
  {
    id: 'pillar_06_desejo',
    number: 6,
    act_id: 'act_02_reconstruction',
    title: 'Desejo',
    extended_title: 'Desejo, Amor & Frustração',
    subtitle: 'Aquilo que ainda permanece vivo.',
    threshold_label: 'Projeção',
    canonical_unit_id: 'unit_pillar_06_desejo',
  },
  {
    id: 'pillar_07_fe',
    number: 7,
    act_id: 'act_03_continuity',
    title: 'Fé',
    extended_title: 'Fé, Sentido & Desencanto',
    subtitle: 'Aquilo que permanece invisível.',
    threshold_label: 'Erosão',
    canonical_unit_id: 'unit_pillar_07_fe',
  },
  {
    id: 'pillar_08_escassez',
    number: 8,
    act_id: 'act_03_continuity',
    title: 'Escassez',
    extended_title: 'Escassez, Medo & Sustentação',
    subtitle: 'O medo de nunca ser suficiente.',
    threshold_label: 'Limiar',
    threshold_text: 'Onde a falta deixa de ser prova de fracasso.',
    canonical_unit_id: 'unit_pillar_08_escassez',
  },
  {
    id: 'pillar_09_vazio',
    number: 9,
    act_id: 'act_03_continuity',
    title: 'Vazio',
    extended_title: 'Vazio, Presença & Continuidade',
    subtitle: 'Quando o silêncio deixa de ser ameaça.',
    threshold_label: 'Permanência',
    canonical_unit_id: 'unit_pillar_09_vazio',
  },
];

export type CanonicalPillarStructure = {
  pillar_id: PillarId;
  sections: CanonicalSection[];
  has_manifesto: boolean;
  has_deep_narrative: boolean;
  has_consciousness: boolean;
  has_judgment: boolean;
  has_presence: boolean;
  has_support_letter: boolean;
  has_practical_anchor: boolean;
  has_closure: boolean;
};

export const validateCanonicalPillarStructure = (structure: CanonicalPillarStructure): string[] => {
  const errors: string[] = [];
  if (!structure.has_consciousness) errors.push('Canonical pillar requires a consciousness section.');
  if (!structure.has_judgment) errors.push('Canonical pillar requires a judgment section.');
  if (!structure.has_presence) errors.push('Canonical pillar requires a presence section.');
  if (!structure.has_closure) errors.push('Canonical pillar requires a closure section.');
  return errors;
};

export const PILLAR_01_CANONICAL_SECTIONS: CanonicalSection[] = [
  {
    id: 'p01_section_identity',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'opening_identity',
    order: 1,
    title: 'Reconhecimento',
    subtitle: 'Eu não estou quebrado.',
    page_start: 72,
    page_end: 72,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_threshold',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'threshold',
    order: 2,
    title: 'Onde a negação cessa',
    page_start: 73,
    page_end: 73,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_manifesto',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'opening_manifesto',
    order: 3,
    title: 'Onde o vínculo começa',
    page_start: 74,
    page_end: 78,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_narrative',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'deep_narrative',
    order: 4,
    title: 'A vida antes do reconhecimento: sobrevivência disfarçada',
    page_start: 79,
    page_end: 84,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_consciousness',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'consciousness',
    phase: 'consciousness',
    order: 5,
    title: 'Reconhecer o estado de sobrevivência relacional',
    page_start: 85,
    page_end: 87,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_judgment',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'judgment',
    phase: 'judgment',
    order: 6,
    title: 'Quando a ruptura vira culpa',
    page_start: 88,
    page_end: 91,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_presence',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'presence',
    phase: 'presence',
    order: 7,
    title: 'Reatar o vínculo consigo mesmo',
    page_start: 92,
    page_end: 94,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_support_letter',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'support_letter',
    order: 8,
    title: 'Carta de Sustentação',
    page_start: 94,
    page_end: 97,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_anchor',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'practical_anchor',
    order: 9,
    title: 'O Ritual do Reconhecimento - 7 dias, sem pressa',
    page_start: 97,
    page_end: 103,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
  {
    id: 'p01_section_closure',
    unit_id: 'unit_pillar_01_reconhecimento',
    type: 'pillar_closure',
    order: 10,
    title: 'O primeiro passo não é andar. É parar de fugir',
    page_start: 104,
    page_end: 106,
    interaction_allowed: true,
    reflection_optional: true,
    active: true,
  },
];

export type InterludeDefinition = {
  id: string;
  title: string;
  subtitle?: string;
  act_id: BookActId;
  position_after_unit_id: string;
  position_before_unit_id: string;
  sections: CanonicalSection[];
  required: boolean;
  reflection_optional: boolean;
};

export const INTERLUDE_FENDA: InterludeDefinition = {
  id: 'unit_interlude_fenda',
  title: 'Interlúdio',
  subtitle: 'Fenda',
  act_id: 'act_01_survival',
  position_after_unit_id: 'unit_pillar_02_familia',
  position_before_unit_id: 'unit_pillar_03_luto',
  sections: [],
  required: false,
  reflection_optional: true,
};

export type PresenceNotebookType = 'survival' | 'reconstruction' | 'continuity' | 'final_reflection';

export type CanonicalNotebookPrompt = {
  id: string;
  notebook_id: string;
  order: number;
  text: string;
  response_type: 'short_text' | 'long_text';
  analysis_optional: true;
  memory_optional: true;
};

export type PresenceNotebookDefinition = {
  id: string;
  type: PresenceNotebookType;
  act_id?: BookActId;
  related_pillar_ids: PillarId[];
  title: string;
  canonical_prompts: CanonicalNotebookPrompt[];
  optional: true;
  can_skip: true;
};

export const PRESENCE_NOTEBOOKS: PresenceNotebookDefinition[] = [
  {
    id: 'unit_notebook_survival',
    type: 'survival',
    act_id: 'act_01_survival',
    related_pillar_ids: ['pillar_01_reconhecimento', 'pillar_02_familia', 'pillar_03_luto'],
    title: 'Caderno de Presença - Tríade da Sobrevivência',
    canonical_prompts: [],
    optional: true,
    can_skip: true,
  },
  {
    id: 'unit_notebook_reconstruction',
    type: 'reconstruction',
    act_id: 'act_02_reconstruction',
    related_pillar_ids: ['pillar_04_trabalho', 'pillar_05_dor', 'pillar_06_desejo'],
    title: 'Caderno de Presença - Tríade da Reconstrução',
    canonical_prompts: [],
    optional: true,
    can_skip: true,
  },
  {
    id: 'unit_notebook_continuity',
    type: 'continuity',
    act_id: 'act_03_continuity',
    related_pillar_ids: ['pillar_07_fe', 'pillar_08_escassez', 'pillar_09_vazio'],
    title: 'Caderno de Presença - Tríade da Continuidade',
    canonical_prompts: [],
    optional: true,
    can_skip: true,
  },
  {
    id: 'unit_notebook_final_reflection',
    type: 'final_reflection',
    related_pillar_ids: PILLAR_ORDER_CANONICAL,
    title: 'Caderno de Presença - Reflexão Final',
    canonical_prompts: [],
    optional: true,
    can_skip: true,
  },
];

export type CanonicalBookContent = {
  layer: 'canonical_book';
  book_id: string;
  acts: BookActCanonicalDefinition[];
  units: CanonicalBookUnit[];
  version: string;
};

export const CANONICAL_BOOK_CONTENT: CanonicalBookContent = {
  layer: 'canonical_book',
  book_id: BOOK_ID,
  acts: BOOK_ACTS_CANONICAL,
  units: [
    {
      id: 'unit_pillar_01_reconhecimento',
      book_id: BOOK_ID,
      type: 'pillar',
      order: 1,
      act_id: 'act_01_survival',
      pillar_id: 'pillar_01_reconhecimento',
      title: 'Reconhecimento',
      subtitle: 'Eu não estou quebrado.',
      opening_quote: 'Todo vínculo começa quando você deixa de se tratar como inimigo.',
      page_start: 72,
      page_end: 106,
      sections: PILLAR_01_CANONICAL_SECTIONS,
      previous_unit_id: 'unit_act_01_opening',
      next_unit_id: 'unit_pillar_02_familia',
      required_for_reading_progress: true,
      reflection_optional: true,
      status: 'published',
      version: BOOK_METADATA.canonical_version,
    },
    {
      id: INTERLUDE_FENDA.id,
      book_id: BOOK_ID,
      type: 'interlude',
      order: 3,
      act_id: 'act_01_survival',
      title: INTERLUDE_FENDA.title,
      subtitle: INTERLUDE_FENDA.subtitle,
      sections: INTERLUDE_FENDA.sections,
      previous_unit_id: INTERLUDE_FENDA.position_after_unit_id,
      next_unit_id: INTERLUDE_FENDA.position_before_unit_id,
      required_for_reading_progress: false,
      reflection_optional: true,
      status: 'published',
      version: BOOK_METADATA.canonical_version,
    },
  ],
  version: BOOK_METADATA.schema_version,
};

export const PILLAR_COMPANION_RULES = {
  questions: 9,
  questions_per_phase: 3,
  options_per_question: 6,
  micro_returns: 18,
  micro_returns_per_phase: 6,
  journal_prompts: 6,
  journal_prompts_per_phase: 2,
  guided_letters: 3,
  practical_anchors: 3,
  predictive_rules: 9,
  transition_rules: 6,
} as const;

export const REQUIRED_SEMANTIC_POSITIONS: SemanticPosition[] = [
  'recognition',
  'minimization',
  'defense',
  'ambivalence',
  'desire',
  'uncertainty',
];

export type OpenResponseDefinition = {
  enabled: true;
  label: string;
  placeholder: string;
  minimum_characters_for_analysis: number;
  maximum_characters: number;
  allow_skip: true;
  allow_private_mode: true;
  allow_memory_storage_choice: true;
  analysis_priority: 3;
};

export const DEFAULT_OPEN_RESPONSE: OpenResponseDefinition = {
  enabled: true,
  label: 'Escreva com suas próprias palavras',
  placeholder: 'O que esta pergunta faz você perceber?',
  minimum_characters_for_analysis: 20,
  maximum_characters: 4000,
  allow_skip: true,
  allow_private_mode: true,
  allow_memory_storage_choice: true,
  analysis_priority: 3,
};

export type ScaleDelta = -1 | 0 | 1;

export type ScaleEffects = {
  awareness: ScaleDelta;
  judgment: ScaleDelta;
  presence: ScaleDelta;
  readiness: ScaleDelta;
  load: ScaleDelta;
  avoidance: ScaleDelta;
  agency: ScaleDelta;
};

export type AgentResponseTemplate = {
  mirror?: string;
  displacement?: string;
  next_move?: {
    type: InterventionType;
    text?: string;
    content_id?: string;
  };
  content_origin: ContentOrigin;
  canonical_reference_id?: string;
  maximum_words: number;
};

export type OptionResponseVariants = {
  minimal: AgentResponseTemplate;
  standard: AgentResponseTemplate;
  deep?: AgentResponseTemplate;
};

export type OptionMemoryPolicy = {
  can_create_pattern: false;
  can_raise_confidence_above_low: false;
  can_store_raw_choice: boolean;
  can_use_for_session_memory: boolean;
};

export type CompanionQuestionOption = {
  id: string;
  question_id: string;
  semantic_position: SemanticPosition;
  visible_text: string;
  probable_meaning: string;
  primary_signal: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];
  scale_effects: ScaleEffects;
  response_variants: OptionResponseVariants;
  preferred_intervention: InterventionType;
  alternative_interventions: InterventionType[];
  next_question_ids: string[];
  micro_return_ids: string[];
  journal_prompt_id?: string;
  anchor_id?: string;
  memory_policy: OptionMemoryPolicy;
  interpretation_confidence: 'low';
  active: boolean;
};

export type CompanionQuestion = {
  id: string;
  pillar_id: PillarId;
  canonical_unit_id: string;
  canonical_section_id: string;
  phase: PillarPhase;
  phase_order: 1 | 2 | 3;
  global_order: number;
  text: string;
  semantic_goal: string;
  internal_hypothesis: string;
  depth: DepthLevel;
  compatible_states: ReaderState[];
  compatible_primary_signals: PrimarySignal[];
  compatible_secondary_signals: SecondarySignal[];
  compatible_pillar_signals: string[];
  options: CompanionQuestionOption[];
  open_response: OpenResponseDefinition;
  prerequisite_question_ids: string[];
  blocked_by_question_ids: string[];
  can_skip: true;
  active: boolean;
};

export type CompanionPhaseDefinition = {
  phase: PillarPhase;
  title: string;
  purpose: string;
  canonical_section_id: string;
  question_ids: string[];
  micro_return_ids: string[];
  journal_prompt_ids: string[];
  minimum_depth: DepthLevel;
  maximum_depth: DepthLevel;
};

export type PillarCompanionEditorialIdentity = {
  what_it_explains: string;
  central_dilemma: string;
  common_protection: string;
  presence_movement: string;
  interpretation_risks: string[];
  canonical_section_ids: string[];
};

export type MicroReturnFunction = 'recognition' | 'contradiction' | 'protection' | 'cost' | 'permission' | 'presence';

export type CompanionMicroReturn = {
  id: string;
  pillar_id: PillarId;
  canonical_section_id: string;
  phase: PillarPhase;
  function: MicroReturnFunction;
  text: string;
  origin: ContentOrigin;
  canonical_reference_id?: string;
  compatible_primary_signals: PrimarySignal[];
  compatible_secondary_signals: SecondarySignal[];
  compatible_pillar_signals: string[];
  compatible_states: ReaderState[];
  minimum_depth: DepthLevel;
  maximum_load: ScaleLevel;
  can_appear_alone: boolean;
  requires_context_line: boolean;
  reuse_limit_per_pillar: number;
  active: boolean;
};

export type CompanionJournalPrompt = {
  id: string;
  pillar_id: PillarId;
  canonical_section_id: string;
  phase: PillarPhase;
  phase_order: 1 | 2;
  title: string;
  context: string;
  prompt: string;
  starter_lines: string[];
  semantic_goal: string;
  compatible_primary_signals: PrimarySignal[];
  compatible_secondary_signals: SecondarySignal[];
  compatible_pillar_signals: string[];
  minimum_readiness: ScaleLevel;
  maximum_load: ScaleLevel;
  minimum_depth: DepthLevel;
  intensity: 'light' | 'moderate' | 'deep';
  allow_private_mode: true;
  allow_skip: true;
  analyze_by_default: boolean;
  active: boolean;
};

export type GuidedLetterType = 'recognition' | 'confrontation' | 'presence';

export type CompanionGuidedLetter = {
  id: string;
  pillar_id: PillarId;
  type: GuidedLetterType;
  title: string;
  purpose: string;
  recipient_instruction: string;
  introduction: string;
  starter_lines: string[];
  closing_instruction?: string;
  compatible_primary_signals: PrimarySignal[];
  compatible_secondary_signals: SecondarySignal[];
  compatible_pillar_signals: string[];
  minimum_readiness: ScaleLevel;
  maximum_load: ScaleLevel;
  minimum_depth: DepthLevel;
  allow_symbolic_recipient: true;
  remind_not_to_send: true;
  analyze_by_default: boolean;
  allow_private_mode: true;
  active: boolean;
};

export type AnchorType = 'observe' | 'name' | 'position';

export type CompanionAnchor = {
  id: string;
  pillar_id: PillarId;
  canonical_section_id?: string;
  type: AnchorType;
  title: string;
  instruction: string;
  semantic_goal: string;
  compatible_primary_signals: PrimarySignal[];
  compatible_secondary_signals: SecondarySignal[];
  compatible_pillar_signals: string[];
  maximum_load: ScaleLevel;
  minimum_depth: DepthLevel;
  requires_follow_up: boolean;
  follow_up_question_id?: string;
  active: boolean;
};

export type PredictiveRuleCategory = 'deepening' | 'protection' | 'integration';

export type PredictiveCondition = {
  field:
    | 'primary_signal'
    | 'secondary_signal'
    | 'pillar_specific_signal'
    | 'reader_state'
    | 'phase'
    | 'canonical_section_id'
    | 'load_level'
    | 'readiness_level'
    | 'presence_level'
    | 'awareness_level'
    | 'evidence_count'
    | 'source_count'
    | 'recent_intervention'
    | 'open_thread_status';
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'greater_or_equal'
    | 'less_than'
    | 'less_or_equal'
    | 'contains'
    | 'not_contains';
  value: string | number | boolean;
};

export type PredictiveAction = {
  action:
    | 'advance_phase'
    | 'remain_phase'
    | 'return_phase'
    | 'advance_section'
    | 'remain_section'
    | 'reduce_depth'
    | 'increase_depth'
    | 'select_question'
    | 'select_journal'
    | 'select_letter'
    | 'select_anchor'
    | 'select_micro_return'
    | 'recall_memory'
    | 'create_open_thread'
    | 'connect_pillar'
    | 'pause'
    | 'close';
  content_id?: string;
  target_phase?: PillarPhase;
  target_section_id?: string;
  target_pillar_id?: PillarId;
};

export type PillarPredictiveRule = {
  id: string;
  pillar_id: PillarId;
  category: PredictiveRuleCategory;
  title: string;
  description: string;
  conditions: PredictiveCondition[];
  action: PredictiveAction;
  priority: number;
  active: boolean;
};

export type PillarTransitionRule = {
  id: string;
  source_pillar_id: PillarId;
  target_pillar_id: PillarId;
  priority: 'primary' | 'secondary';
  shared_primary_signals: PrimarySignal[];
  shared_secondary_signals: SecondarySignal[];
  shared_pillar_signals: string[];
  transition_reason: string;
  visible_transition_text: string;
  minimum_confidence: InterpretationConfidence;
  minimum_depth: DepthLevel;
  reader_confirmation_required: boolean;
  optional: true;
  active: boolean;
};

export type PillarCompanionValidation = {
  valid: boolean;
  question_count: number;
  option_count: number;
  micro_return_count: number;
  journal_count: number;
  guided_letter_count: number;
  anchor_count: number;
  predictive_rule_count: number;
  transition_rule_count: number;
  phase_distribution_valid: boolean;
  semantic_positions_valid: boolean;
  canonical_references_valid: boolean;
  content_origins_valid: boolean;
  ids_unique: boolean;
  references_valid: boolean;
  errors: string[];
  warnings: string[];
};

export type PillarCompanionPackage = {
  layer: 'igent_companion';
  id: string;
  pillar_id: PillarId;
  canonical_unit_id: string;
  canonical_version: string;
  editorial_identity: PillarCompanionEditorialIdentity;
  phases: CompanionPhaseDefinition[];
  questions: CompanionQuestion[];
  micro_returns: CompanionMicroReturn[];
  journal_prompts: CompanionJournalPrompt[];
  guided_letters: CompanionGuidedLetter[];
  practical_anchors: CompanionAnchor[];
  predictive_rules: PillarPredictiveRule[];
  transition_rules: PillarTransitionRule[];
  validation: PillarCompanionValidation;
  status: 'draft' | 'review' | 'approved' | 'published';
  version: string;
};

export type UnitCompanionQuestion = {
  id: string;
  canonical_unit_id: string;
  text: string;
  semantic_goal: string;
  depth: 0 | 1 | 2;
  compatible_states: ReaderState[];
  open_response: OpenResponseDefinition;
  can_skip: true;
  active: boolean;
};

export type UnitCompanionPackage = {
  layer: 'igent_companion';
  id: string;
  canonical_unit_id: string;
  unit_type: Exclude<BookUnitType, 'pillar'>;
  optional_questions: UnitCompanionQuestion[];
  micro_returns: CompanionMicroReturn[];
  optional_journal_prompt?: CompanionJournalPrompt;
  optional_anchor?: CompanionAnchor;
  reflection_optional: true;
  can_skip: true;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'published';
};

export type IGentCompanionContent = {
  layer: 'igent_companion';
  pillar_packages: PillarCompanionPackage[];
  unit_packages: UnitCompanionPackage[];
  version: string;
};

export type CanonicalContentReferenceRecord = {
  id: string;
  book_id: string;
  unit_id: string;
  section_id?: string;
  page_start?: number;
  page_end?: number;
  origin: Extract<ContentOrigin, 'book_exact' | 'book_approved_adaptation'>;
  exact_text?: string;
  approved_adaptation?: string;
  quote_allowed: boolean;
  approved: boolean;
};

export const ID_CONVENTIONS = {
  pillar: 'pillar_01_reconhecimento',
  unit: 'unit_pillar_01_reconhecimento',
  canonical_section: 'p01_section_consciousness',
  companion_question: 'p01_q_cons_01',
  companion_option: 'p01_q_cons_01_opt_recognition',
  micro_return: 'p01_mr_cons_01',
  journal: 'p01_journal_cons_01',
  guided_letter: 'p01_letter_recognition',
  companion_anchor: 'p01_anchor_observe',
  predictive_rule: 'p01_rule_deepening_01',
  transition: 'p01_transition_primary_p02',
};

export const CONTENT_FILE_STRUCTURE = `
/content
  /canonical
    book.json
    acts.json
    units.json
    references.json
  /igent
    /pillars
    /units
`;

export const validatePillarCompanionPackage = (packageData: PillarCompanionPackage): PillarCompanionValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const questions = packageData.questions;
  const optionCount = questions.reduce((total, question) => total + question.options.length, 0);
  const questionsByPhase = {
    consciousness: questions.filter((item) => item.phase === 'consciousness').length,
    judgment: questions.filter((item) => item.phase === 'judgment').length,
    presence: questions.filter((item) => item.phase === 'presence').length,
  };

  if (questions.length !== PILLAR_COMPANION_RULES.questions) errors.push('Companion pillar must contain 9 questions.');
  if (optionCount !== PILLAR_COMPANION_RULES.questions * PILLAR_COMPANION_RULES.options_per_question) {
    errors.push('Companion pillar must contain 54 options.');
  }

  for (const question of questions) {
    if (question.options.length !== PILLAR_COMPANION_RULES.options_per_question) {
      errors.push(`${question.id} must contain 6 options.`);
    }
    const semanticPositions = question.options.map((option) => option.semantic_position);
    for (const requiredPosition of REQUIRED_SEMANTIC_POSITIONS) {
      if (!semanticPositions.includes(requiredPosition)) {
        errors.push(`${question.id} is missing semantic position ${requiredPosition}.`);
      }
    }
    if (!question.canonical_section_id) errors.push(`${question.id} requires canonical_section_id.`);
  }

  if (questionsByPhase.consciousness !== 3 || questionsByPhase.judgment !== 3 || questionsByPhase.presence !== 3) {
    errors.push('Each phase must contain exactly 3 questions.');
  }
  if (packageData.micro_returns.length !== 18) errors.push('Companion pillar must contain 18 micro returns.');
  if (packageData.journal_prompts.length !== 6) errors.push('Companion pillar must contain 6 journal prompts.');
  if (packageData.guided_letters.length !== 3) errors.push('Companion pillar must contain 3 guided letters.');
  if (packageData.practical_anchors.length !== 3) errors.push('Companion pillar must contain 3 companion anchors.');
  if (packageData.predictive_rules.length !== 9) errors.push('Companion pillar must contain 9 predictive rules.');
  if (packageData.transition_rules.length !== 6) errors.push('Companion pillar must contain 6 transition rules.');

  return {
    valid: errors.length === 0,
    question_count: questions.length,
    option_count: optionCount,
    micro_return_count: packageData.micro_returns.length,
    journal_count: packageData.journal_prompts.length,
    guided_letter_count: packageData.guided_letters.length,
    anchor_count: packageData.practical_anchors.length,
    predictive_rule_count: packageData.predictive_rules.length,
    transition_rule_count: packageData.transition_rules.length,
    phase_distribution_valid: questionsByPhase.consciousness === 3 && questionsByPhase.judgment === 3 && questionsByPhase.presence === 3,
    semantic_positions_valid: errors.every((error) => !error.includes('semantic position')),
    canonical_references_valid: true,
    content_origins_valid: true,
    ids_unique: true,
    references_valid: true,
    errors,
    warnings,
  };
};

export type PublicationValidation = {
  canonical_valid: boolean;
  companion_valid: boolean;
  can_publish: boolean;
  errors: string[];
};

export const canPublishPillarPackage = (
  canonical: CanonicalPillarStructure,
  companion: PillarCompanionPackage,
): PublicationValidation => {
  const canonicalErrors = validateCanonicalPillarStructure(canonical);
  const companionValidation = validatePillarCompanionPackage(companion);
  const errors = [...canonicalErrors, ...companionValidation.errors];
  return {
    canonical_valid: canonicalErrors.length === 0,
    companion_valid: companionValidation.valid,
    can_publish: errors.length === 0,
    errors,
  };
};

export const BLOCK_08_MIGRATION = {
  replace_pillar_id: {
    from: 'pillar_01_vinculo',
    to: 'pillar_01_reconhecimento',
  },
  remove_assumption: 'All canonical pillars have identical sections.',
  add_separation: ['canonical_book', 'igent_companion'],
  add_units: ['interlude', 'presence_notebook', 'final_letter', 'epilogue', 'postface', 'final_reflection'],
  preserve_companion_counts: {
    questions: 9,
    options: 54,
    micro_returns: 18,
    journals: 6,
    guided_letters: 3,
    anchors: 3,
    predictive_rules: 9,
    transitions: 6,
  },
};

export const BLOCK_08_FINAL_RULES = [
  'The book is always the canonical source.',
  'The companion layer never rewrites the book.',
  'Pillar I is Reconhecimento, not Vínculo.',
  'Vínculo remains a concept and manifesto theme.',
  'Canonical pillar sections are flexible.',
  'Consciousness, Judgment and Presence remain the triadic core.',
  'All reflective interactions are optional.',
  'The reader may continue reading without answering.',
  'The reader may revisit any unit.',
  'The interlude is an independent unit.',
  'Presence notebooks are independent canonical units.',
  'Guided letters are not canonical support letters.',
  'Companion anchors are not canonical practical anchors.',
  'Generated text must never be attributed to the book.',
  'Every companion item must reference its canonical context.',
];
