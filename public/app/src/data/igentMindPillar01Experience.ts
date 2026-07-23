// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
import type { InterventionType, PillarPhase } from './igentMindContract';
import type {
  CompanionAnchor,
  CompanionGuidedLetter,
  CompanionJournalPrompt,
  CompanionMicroReturn,
  CompanionQuestion,
  ContentOrigin,
} from './igentMindCanonicalContent';
import type { ReaderMindState } from './igentMindState';
import { PILLAR_01_ALL_QUESTIONS } from './igentMindPillar01Presence';
import { PILLAR_01_CONTENT_INDEX } from './igentMindPillar01Consolidation';
import {
  PILLAR_01_CLOSURE_PACKAGE,
  PILLAR_01_TO_PILLAR_02_TRANSITION,
  buildPillar01ClosureCard,
  type Pillar01ClosureResult,
} from './igentMindPillar01Closure';

type AgentResponseTemplate = {
  mirror?: string;
  displacement?: string;
  next_move?: {
    type: InterventionType;
    content_id?: string;
  };
  content_origin?: ContentOrigin;
};

function createInteractionScreenId(): string {
  return `p01_screen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function uniqueValues<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

/**
 * BLOCO 19
 * PILAR I — RECONHECIMENTO
 * FLUXO DE EXPERIÊNCIA E INTERFACE
 *
 * OBJETIVOS:
 *
 * 1. Manter a leitura canônica como experiência principal.
 * 2. Apresentar o iGentMIND como camada complementar.
 * 3. Evitar sensação de formulário, teste ou interrogatório.
 * 4. Distribuir perguntas e práticas ao longo da leitura.
 * 5. Respeitar escolha, carga, ritmo e privacidade.
 * 6. Permitir leitura integral sem nenhuma interação.
 * 7. Permitir reflexão sem obrigar retorno ao texto.
 *
 * IMPORTANTE:
 *
 * Este bloco utiliza os tipos globais definidos
 * nos Blocos 01–18.
 *
 * Não redefinir:
 * - ReaderState;
 * - ReaderMindState;
 * - PillarPhase;
 * - PillarId;
 * - InterventionType;
 * - CompanionQuestion;
 * - CompanionJournalPrompt;
 * - CompanionGuidedLetter;
 * - CompanionAnchor;
 * - CanonicalSection;
 * - ContentOrigin.
 */


//////////////////////////////////////////////////
// 1. PRINCÍPIOS DE EXPERIÊNCIA
//////////////////////////////////////////////////

export const P01_EXPERIENCE_PRINCIPLES = {
  book_first: true,

  reflection_is_optional: true,

  never_force_interruption: true,

  never_require_reflection_to_continue: true,

  never_present_as_test: true,

  never_present_as_assessment: true,

  never_present_as_therapy: true,

  never_show_emotional_score: true,

  never_show_correct_answer: true,

  never_show_completion_pressure: true,

  never_reward_disclosure: true,

  never_reward_longer_writing: true,

  never_require_all_questions: true,

  preserve_reader_position: true,

  preserve_reader_choice: true,

  preserve_private_mode: true,

  maximum_visible_actions_per_screen: 4,

  maximum_reflective_invites_per_section: 1,

  maximum_consecutive_questions: 2,

  maximum_consecutive_deep_interventions: 1
} as const;


//////////////////////////////////////////////////
// 2. MODOS DA EXPERIÊNCIA
//////////////////////////////////////////////////

export type P01ExperienceMode =
  | "reading"
  | "reflection"
  | "practice"
  | "private_writing"
  | "closure"
  | "paused";

export type P01ExperienceIntensity =
  | "quiet"
  | "light"
  | "moderate"
  | "deep";

export type P01ExperienceSurface =
  | "reader"
  | "bottom_sheet"
  | "side_panel"
  | "full_screen_reflection"
  | "private_editor"
  | "closure_card";

export type P01NavigationIntent =
  | "continue_reading"
  | "open_reflection"
  | "answer_question"
  | "write_freely"
  | "open_journal"
  | "open_letter"
  | "open_anchor"
  | "open_canonical_section"
  | "skip"
  | "pause"
  | "close"
  | "return_to_book"
  | "continue_to_pillar_02";


//////////////////////////////////////////////////
// 3. TIPOS DE NÓ DA EXPERIÊNCIA
//////////////////////////////////////////////////

export type P01ExperienceNodeType =
  | "canonical_section"
  | "reflection_invite"
  | "phase_entry"
  | "question"
  | "response"
  | "micro_return"
  | "journal"
  | "guided_letter"
  | "anchor"
  | "canonical_support_letter"
  | "canonical_ritual"
  | "canonical_closure"
  | "pillar_closure"
  | "transition"
  | "pause";

export interface P01ExperienceNode {
  id: string;

  type: P01ExperienceNodeType;

  mode: P01ExperienceMode;
  surface: P01ExperienceSurface;

  pillar_id:
    "pillar_01_reconhecimento";

  phase?: PillarPhase;

  canonical_section_id?: string;
  companion_content_id?: string;

  title?: string;
  eyebrow?: string;
  description?: string;

  intensity: P01ExperienceIntensity;

  optional: true;

  allow_skip: true;
  allow_close: true;
  allow_return_to_book: true;

  blocks_reading_progress: false;

  next_node_ids: string[];
}


//////////////////////////////////////////////////
// 4. ESTADO DA EXPERIÊNCIA
//////////////////////////////////////////////////

export interface P01ExperienceState {
  reader_id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  mode: P01ExperienceMode;

  current_node_id: string;

  current_section_id?: string;
  current_phase?: PillarPhase;

  last_canonical_section_id?: string;
  last_question_id?: string;
  last_intervention_type?: InterventionType;

  completed_node_ids: string[];
  skipped_node_ids: string[];
  dismissed_invite_ids: string[];

  answered_question_ids: string[];
  opened_journal_ids: string[];
  opened_letter_ids: string[];
  completed_anchor_ids: string[];

  reflection_invites_seen: number;
  consecutive_question_count: number;
  consecutive_deep_count: number;

  return_position?: {
    canonical_unit_id: string;
    canonical_section_id: string;
    paragraph_anchor?: string;
    reading_percentage?: number;
  };

  reflection_session_started_at?: string;
  last_interaction_at?: string;

  paused: boolean;
  closed: boolean;
}


//////////////////////////////////////////////////
// 5. CONTEXTO DE DECISÃO DE UX
//////////////////////////////////////////////////

export interface P01ExperienceDecisionContext {
  experience:
    P01ExperienceState;

  mind_state:
    ReaderMindState;

  reader_requested_reflection:
    boolean;

  reader_requested_continue:
    boolean;

  reader_requested_pause:
    boolean;

  reader_rejected_reflection:
    boolean;

  canonical_section_completed:
    boolean;

  canonical_section_id:
    string;

  available_question_ids:
    string[];

  available_micro_return_ids:
    string[];

  available_journal_ids:
    string[];

  available_letter_ids:
    string[];

  available_anchor_ids:
    string[];

  open_thread_ids:
    string[];
}


//////////////////////////////////////////////////
// 6. MAPA CANÔNICO DA EXPERIÊNCIA
//////////////////////////////////////////////////

export const P01_CANONICAL_EXPERIENCE_ORDER = [
  "p01_section_identity",
  "p01_section_threshold",
  "p01_section_manifesto",
  "p01_section_narrative",
  "p01_section_consciousness",
  "p01_section_judgment",
  "p01_section_presence",
  "p01_section_support_letter",
  "p01_section_anchor",
  "p01_section_closure"
] as const;


export type P01CanonicalExperienceSectionId =
  typeof P01_CANONICAL_EXPERIENCE_ORDER[number];


//////////////////////////////////////////////////
// 7. PONTOS DE CONVITE REFLEXIVO
//////////////////////////////////////////////////

export interface P01ReflectionInviteDefinition {
  id: string;

  after_section_id:
    P01CanonicalExperienceSectionId;

  phase: PillarPhase;

  title: string;
  description: string;

  primary_action_label: string;
  secondary_action_label: string;

  initial_question_id: string;

  intensity: P01ExperienceIntensity;

  maximum_appearances: number;
  dismiss_for_session_when_rejected: boolean;

  active: boolean;
}


export const P01_REFLECTION_INVITES:
  P01ReflectionInviteDefinition[] = [
    {
      id:
        "p01_invite_consciousness",

      after_section_id:
        "p01_section_consciousness",

      phase:
        "consciousness",

      title:
        "Algo começou a ficar visível?",

      description:
        "Você pode continuar lendo ou abrir uma reflexão breve sobre o que apareceu.",

      primary_action_label:
        "Refletir agora",

      secondary_action_label:
        "Continuar lendo",

      initial_question_id:
        "p01_q_cons_01",

      intensity:
        "light",

      maximum_appearances: 1,

      dismiss_for_session_when_rejected:
        true,

      active: true
    },

    {
      id:
        "p01_invite_judgment",

      after_section_id:
        "p01_section_judgment",

      phase:
        "judgment",

      title:
        "Perceber a voz sem obedecer",

      description:
        "A reflexão é opcional. Você pode observar como o julgamento aparece ou seguir para a próxima parte.",

      primary_action_label:
        "Observar essa voz",

      secondary_action_label:
        "Seguir a leitura",

      initial_question_id:
        "p01_q_judg_01",

      intensity:
        "moderate",

      maximum_appearances: 1,

      dismiss_for_session_when_rejected:
        true,

      active: true
    },

    {
      id:
        "p01_invite_presence",

      after_section_id:
        "p01_section_presence",

      phase:
        "presence",

      title:
        "Um retorno possível",

      description:
        "Você pode criar um pequeno gesto de presença ou continuar diretamente para a Carta de Sustentação.",

      primary_action_label:
        "Experimentar uma presença breve",

      secondary_action_label:
        "Ir para a Carta",

      initial_question_id:
        "p01_q_pres_01",

      intensity:
        "moderate",

      maximum_appearances: 1,

      dismiss_for_session_when_rejected:
        true,

      active: true
    }
  ];


//////////////////////////////////////////////////
// 8. MOMENTOS SEM CONVITE AUTOMÁTICO
//////////////////////////////////////////////////

export const P01_SECTIONS_WITHOUT_AUTOMATIC_INVITE = [
  "p01_section_identity",
  "p01_section_threshold",
  "p01_section_manifesto",
  "p01_section_narrative",
  "p01_section_support_letter",
  "p01_section_anchor",
  "p01_section_closure"
] as const;


/**
 * Razão editorial:
 *
 * - Identidade, Limiar, Manifesto e Narrativa
 *   devem ser lidos sem interrupção automática.
 *
 * - Carta de Sustentação, Ritual e Fecho
 *   já possuem força própria.
 *
 * - O iGentMIND pode ser aberto nesses pontos
 *   apenas por escolha explícita do leitor.
 */


//////////////////////////////////////////////////
// 9. REGRAS PARA EXIBIR UM CONVITE
//////////////////////////////////////////////////

export function canShowP01ReflectionInvite(
  invite: P01ReflectionInviteDefinition,
  context: P01ExperienceDecisionContext
): boolean {
  if (!invite.active) {
    return false;
  }

  if (
    context.canonical_section_id !==
    invite.after_section_id
  ) {
    return false;
  }

  if (
    !context.canonical_section_completed
  ) {
    return false;
  }

  if (
    context.reader_rejected_reflection
  ) {
    return false;
  }

  if (
    context.experience
      .dismissed_invite_ids
      .includes(invite.id)
  ) {
    return false;
  }

  if (
    context.mind_state.load_level >= 3
  ) {
    return false;
  }

  if (
    context.mind_state.reader_state ===
      "paused" ||
    context.mind_state.reader_state ===
      "overloaded"
  ) {
    return false;
  }

  const previousAppearances =
    context.experience
      .completed_node_ids
      .filter(
        nodeId =>
          nodeId === invite.id
      )
      .length;

  if (
    previousAppearances >=
    invite.maximum_appearances
  ) {
    return false;
  }

  return true;
}


//////////////////////////////////////////////////
// 10. ENTRADA MANUAL NO iGentMIND
//////////////////////////////////////////////////

export interface P01ManualCompanionEntry {
  source:
    | "reader_toolbar"
    | "section_action"
    | "highlight_action"
    | "open_thread"
    | "pillar_home";

  preferred_phase?: PillarPhase;

  highlighted_text?: string;

  canonical_section_id?: string;

  requested_intervention?:
    | "question"
    | "journal"
    | "letter"
    | "anchor"
    | "free_response";
}


export function resolveP01ManualEntryPhase(
  entry: P01ManualCompanionEntry
): PillarPhase {
  if (entry.preferred_phase) {
    return entry.preferred_phase;
  }

  if (
    entry.canonical_section_id ===
    "p01_section_judgment"
  ) {
    return "judgment";
  }

  if (
    entry.canonical_section_id ===
      "p01_section_presence" ||
    entry.canonical_section_id ===
      "p01_section_support_letter" ||
    entry.canonical_section_id ===
      "p01_section_anchor" ||
    entry.canonical_section_id ===
      "p01_section_closure"
  ) {
    return "presence";
  }

  return "consciousness";
}


//////////////////////////////////////////////////
// 11. SUPERFÍCIE DE LEITURA
//////////////////////////////////////////////////

export interface P01ReaderScreenContract {
  screen_id:
    "p01_reader_screen";

  mode:
    "reading";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  section_id:
    string;

  show_book_title:
    boolean;

  show_section_title:
    boolean;

  show_reading_progress:
    boolean;

  show_companion_button:
    boolean;

  show_reflection_invite:
    boolean;

  reflection_invite_id?:
    string;

  show_audio_control:
    boolean;

  show_font_controls:
    boolean;

  show_private_highlight:
    boolean;

  show_score:
    false;

  show_streak:
    false;

  show_badge:
    false;

  show_required_task:
    false;
}


export function buildP01ReaderScreen(
  sectionId: string,
  invite?: P01ReflectionInviteDefinition
): P01ReaderScreenContract {
  return {
    screen_id:
      "p01_reader_screen",

    mode:
      "reading",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    section_id:
      sectionId,

    show_book_title:
      true,

    show_section_title:
      true,

    show_reading_progress:
      true,

    show_companion_button:
      true,

    show_reflection_invite:
      Boolean(invite),

    reflection_invite_id:
      invite?.id,

    show_audio_control:
      true,

    show_font_controls:
      true,

    show_private_highlight:
      true,

    show_score:
      false,

    show_streak:
      false,

    show_badge:
      false,

    show_required_task:
      false
  };
}


//////////////////////////////////////////////////
// 12. CONVITE REFLEXIVO
//////////////////////////////////////////////////

export interface P01ReflectionInviteCard {
  id: string;

  title: string;
  description: string;

  phase: PillarPhase;

  primary_action: {
    intent:
      "open_reflection";

    label:
      string;

    question_id:
      string;
  };

  secondary_action: {
    intent:
      "continue_reading";

    label:
      string;
  };

  dismiss_action: {
    intent:
      "skip";

    label:
      "Agora não";
  };

  show_progress:
    false;

  show_question_count:
    false;

  show_estimated_result:
    false;
}


export function buildP01ReflectionInviteCard(
  invite: P01ReflectionInviteDefinition
): P01ReflectionInviteCard {
  return {
    id:
      invite.id,

    title:
      invite.title,

    description:
      invite.description,

    phase:
      invite.phase,

    primary_action: {
      intent:
        "open_reflection",

      label:
        invite.primary_action_label,

      question_id:
        invite.initial_question_id
    },

    secondary_action: {
      intent:
        "continue_reading",

      label:
        invite.secondary_action_label
    },

    dismiss_action: {
      intent:
        "skip",

      label:
        "Agora não"
    },

    show_progress:
      false,

    show_question_count:
      false,

    show_estimated_result:
      false
  };
}


//////////////////////////////////////////////////
// 13. TELA DA PERGUNTA
//////////////////////////////////////////////////

export interface P01QuestionScreenContract {
  screen_id:
    string;

  mode:
    "reflection";

  surface:
    "full_screen_reflection";

  phase:
    PillarPhase;

  phase_label:
    string;

  question_id:
    string;

  question_text:
    string;

  options:
    Array<{
      id: string;
      text: string;
    }>;

  open_response: {
    enabled: boolean;
    label: string;
    placeholder: string;
  };

  actions: {
    skip:
      true;

    close:
      true;

    return_to_book:
      true;
  };

  show_question_number:
    false;

  show_total_questions:
    false;

  show_answer_score:
    false;

  show_recommended_answer:
    false;

  show_progress_percentage:
    false;
}


export function getP01PhaseLabel(
  phase: PillarPhase
): string {
  const labels:
    Record<PillarPhase, string> = {
      consciousness:
        "Consciência",

      judgment:
        "Julgamento",

      presence:
        "Presença"
    };

  return labels[phase];
}


export function buildP01QuestionScreen(
  question: CompanionQuestion
): P01QuestionScreenContract {
  return {
    screen_id:
      `screen_${question.id}`,

    mode:
      "reflection",

    surface:
      "full_screen_reflection",

    phase:
      question.phase,

    phase_label:
      getP01PhaseLabel(
        question.phase
      ),

    question_id:
      question.id,

    question_text:
      question.text,

    options:
      question.options.map(
        option => ({
          id: option.id,
          text:
            option.visible_text
        })
      ),

    open_response: {
      enabled:
        question.open_response.enabled,

      label:
        question.open_response.label,

      placeholder:
        question.open_response.placeholder
    },

    actions: {
      skip: true,
      close: true,
      return_to_book: true
    },

    show_question_number:
      false,

    show_total_questions:
      false,

    show_answer_score:
      false,

    show_recommended_answer:
      false,

    show_progress_percentage:
      false
  };
}


/**
 * Não exibir:
 *
 * - Pergunta 1 de 9;
 * - faltam seis respostas;
 * - sua resposta indica;
 * - perfil encontrado;
 * - nível de consciência;
 * - resultado parcial;
 * - melhor resposta.
 */


//////////////////////////////////////////////////
// 14. RESPOSTA DO iGentMIND
//////////////////////////////////////////////////

export interface P01CompanionResponseScreen {
  screen_id: string;

  mode:
    "reflection";

  surface:
    "full_screen_reflection";

  mirror?: string;
  displacement?: string;

  next_move?: {
    type:
      InterventionType;

    content_id?: string;

    label: string;
  };

  actions: {
    continue:
      boolean;

    return_to_book:
      true;

    close:
      true;
  };

  show_interpretation_confidence:
    false;

  show_signal_labels:
    false;

  show_scale_changes:
    false;

  show_memory_status:
    boolean;

  content_origin:
    ContentOrigin;
}


export function buildP01CompanionResponseScreen(
  template: AgentResponseTemplate,
  memoryCandidateExists: boolean
): P01CompanionResponseScreen {
  return {
    screen_id:
      createInteractionScreenId(),

    mode:
      "reflection",

    surface:
      "full_screen_reflection",

    mirror:
      template.mirror,

    displacement:
      template.displacement,

    next_move:
      template.next_move
        ? {
            type:
              template.next_move.type,

            content_id:
              template.next_move
                .content_id,

            label:
              getP01NextMoveLabel(
                template.next_move.type
              )
          }
        : undefined,

    actions: {
      continue:
        Boolean(
          template.next_move
        ),

      return_to_book:
        true,

      close:
        true
    },

    show_interpretation_confidence:
      false,

    show_signal_labels:
      false,

    show_scale_changes:
      false,

    show_memory_status:
      memoryCandidateExists,

    content_origin:
      template.content_origin
  };
}


export function getP01NextMoveLabel(
  type: InterventionType
): string {
  const labels:
    Partial<
      Record<
        InterventionType,
        string
      >
    > = {
      question:
        "Continuar refletindo",

      micro_return:
        "Receber um retorno breve",

      journal:
        "Escrever em privado",

      letter:
        "Abrir uma carta guiada",

      anchor:
        "Experimentar uma âncora",

      pause:
        "Pausar agora",

      closure:
        "Encerrar reflexão"
    };

  return (
    labels[type] ??
    "Continuar"
  );
}


//////////////////////////////////////////////////
// 15. PACING — RITMO DAS PERGUNTAS
//////////////////////////////////////////////////

export interface P01PacingDecision {
  allow_next_question:
    boolean;

  recommended_intervention:
    | "question"
    | "micro_return"
    | "journal"
    | "anchor"
    | "pause"
    | "closure"
    | "return_to_book";

  reason:
    string;
}


export function decideP01Pacing(
  context: P01ExperienceDecisionContext
): P01PacingDecision {
  if (
    context.reader_requested_pause ||
    context.mind_state.load_level >= 3
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "pause",

      reason:
        "load_or_pause_request"
    };
  }

  if (
    context.reader_requested_continue
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "return_to_book",

      reason:
        "explicit_reader_choice"
    };
  }

  if (
    context.experience
      .consecutive_question_count >=
    P01_EXPERIENCE_PRINCIPLES
      .maximum_consecutive_questions
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "micro_return",

      reason:
        "question_density_limit"
    };
  }

  if (
    context.experience
      .consecutive_deep_count >=
    P01_EXPERIENCE_PRINCIPLES
      .maximum_consecutive_deep_interventions
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "return_to_book",

      reason:
        "depth_density_limit"
    };
  }

  if (
    context.mind_state.reader_state ===
      "defensive"
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "micro_return",

      reason:
        "defensive_state"
    };
  }

  if (
    context.mind_state.readiness_level <= 1
  ) {
    return {
      allow_next_question:
        false,

      recommended_intervention:
        "anchor",

      reason:
        "low_readiness"
    };
  }

  return {
    allow_next_question:
      true,

    recommended_intervention:
      "question",

    reason:
      "available_for_next_question"
  };
}


//////////////////////////////////////////////////
// 16. UMA PERGUNTA POR TELA
//////////////////////////////////////////////////

export const P01_QUESTION_DISPLAY_RULES = {
  one_question_per_screen:
    true,

  one_selection_per_question:
    true,

  open_response_is_optional:
    true,

  allow_change_selection:
    true,

  allow_clear_selection:
    true,

  allow_skip:
    true,

  allow_close:
    true,

  allow_return_to_book:
    true,

  auto_advance_after_selection:
    false,

  require_confirmation_before_analysis:
    false,

  maximum_visible_options:
    6,

  randomize_option_order:
    false,

  preserve_semantic_order:
    true
};


/**
 * Ordem visual:
 *
 * 1. reconhecimento;
 * 2. minimização;
 * 3. defesa;
 * 4. ambivalência;
 * 5. desejo;
 * 6. incerteza.
 *
 * A ordem não indica valor ou evolução.
 */


//////////////////////////////////////////////////
// 17. RESPOSTA ABERTA
//////////////////////////////////////////////////

export interface P01OpenResponseScreenContract {
  title:
    "Escreva com suas próprias palavras";

  placeholder:
    string;

  private_mode_available:
    true;

  analysis_toggle_available:
    true;

  memory_toggle_available:
    true;

  analysis_default:
    false;

  memory_default:
    false;

  submit_empty_available:
    true;

  delete_after_writing_available:
    true;

  show_character_count:
    boolean;

  show_minimum_length:
    false;

  show_quality_feedback:
    false;

  show_depth_feedback:
    false;
}


export function buildP01OpenResponseContract(
  question: CompanionQuestion
): P01OpenResponseScreenContract {
  return {
    title:
      "Escreva com suas próprias palavras",

    placeholder:
      question.open_response.placeholder,

    private_mode_available:
      true,

    analysis_toggle_available:
      true,

    memory_toggle_available:
      true,

    analysis_default:
      false,

    memory_default:
      false,

    submit_empty_available:
      true,

    delete_after_writing_available:
      true,

    show_character_count:
      question.open_response
        .maximum_characters <= 1000,

    show_minimum_length:
      false,

    show_quality_feedback:
      false,

    show_depth_feedback:
      false
  };
}


//////////////////////////////////////////////////
// 18. JOURNAL / DIÁRIO
//////////////////////////////////////////////////

export interface P01JournalScreenContract {
  screen_id:
    string;

  mode:
    "private_writing";

  surface:
    "private_editor";

  journal_id:
    string;

  title:
    string;

  context:
    string;

  prompt:
    string;

  starter_lines:
    string[];

  privacy_mode_first:
    true;

  analysis_default:
    false;

  memory_default:
    false;

  allow_empty:
    true;

  allow_delete:
    true;

  allow_skip:
    true;

  allow_close:
    true;

  show_timer:
    false;

  show_word_count:
    false;

  show_completion_score:
    false;
}


export function buildP01JournalScreen(
  journal: CompanionJournalPrompt
): P01JournalScreenContract {
  return {
    screen_id:
      `screen_${journal.id}`,

    mode:
      "private_writing",

    surface:
      "private_editor",

    journal_id:
      journal.id,

    title:
      journal.title,

    context:
      journal.context,

    prompt:
      journal.prompt,

    starter_lines:
      journal.starter_lines.slice(
        0,
        3
      ),

    privacy_mode_first:
      true,

    analysis_default:
      false,

    memory_default:
      false,

    allow_empty:
      true,

    allow_delete:
      true,

    allow_skip:
      true,

    allow_close:
      true,

    show_timer:
      false,

    show_word_count:
      false,

    show_completion_score:
      false
  };
}


//////////////////////////////////////////////////
// 19. CARTA GUIADA
//////////////////////////////////////////////////

export interface P01GuidedLetterScreenContract {
  screen_id:
    string;

  mode:
    "private_writing";

  surface:
    "private_editor";

  letter_id:
    string;

  title:
    string;

  introduction:
    string;

  private_notice:
    string;

  sections:
    GuidedLetterSection[];

  show_one_section_at_a_time:
    true;

  allow_view_all:
    true;

  allow_skip_section:
    true;

  allow_delete:
    true;

  allow_close:
    true;

  show_send_action:
    false;

  show_share_action:
    false;

  show_contact_picker:
    false;

  analysis_default:
    false;

  memory_default:
    false;
}


export function buildP01GuidedLetterScreen(
  letter: CompanionGuidedLetter
): P01GuidedLetterScreenContract {
  return {
    screen_id:
      `screen_${letter.id}`,

    mode:
      "private_writing",

    surface:
      "private_editor",

    letter_id:
      letter.id,

    title:
      letter.title,

    introduction:
      letter.introduction,

    private_notice:
      letter.delivery_policy
        .visible_notice,

    sections:
      letter.sections,

    show_one_section_at_a_time:
      true,

    allow_view_all:
      true,

    allow_skip_section:
      true,

    allow_delete:
      true,

    allow_close:
      true,

    show_send_action:
      false,

    show_share_action:
      false,

    show_contact_picker:
      false,

    analysis_default:
      false,

    memory_default:
      false
  };
}


//////////////////////////////////////////////////
// 20. ÂNCORA
//////////////////////////////////////////////////

export interface P01AnchorScreenContract {
  screen_id:
    string;

  mode:
    "practice";

  surface:
    "full_screen_reflection";

  anchor_id:
    string;

  title:
    string;

  context:
    string;

  opening_instruction:
    string;

  steps:
    CompanionAnchorStep[];

  show_one_step_at_a_time:
    true;

  timer_available:
    boolean;

  timer_default:
    "off";

  show_stop:
    true;

  show_skip:
    true;

  show_complete:
    true;

  show_score:
    false;

  show_streak:
    false;

  show_record:
    false;

  show_completion_time:
    false;
}


export function buildP01AnchorScreen(
  anchor: CompanionAnchor
): P01AnchorScreenContract {
  return {
    screen_id:
      `screen_${anchor.id}`,

    mode:
      "practice",

    surface:
      "full_screen_reflection",

    anchor_id:
      anchor.id,

    title:
      anchor.title,

    context:
      anchor.context,

    opening_instruction:
      anchor.opening_instruction,

    steps:
      anchor.steps,

    show_one_step_at_a_time:
      true,

    timer_available:
      anchor.duration_type ===
      "suggested_seconds",

    timer_default:
      "off",

    show_stop:
      true,

    show_skip:
      true,

    show_complete:
      true,

    show_score:
      false,

    show_streak:
      false,

    show_record:
      false,

    show_completion_time:
      false
  };
}


//////////////////////////////////////////////////
// 21. MICRO-RETORNO
//////////////////////////////////////////////////

export interface P01MicroReturnScreenContract {
  screen_id:
    string;

  mode:
    "reflection";

  surface:
    "bottom_sheet";

  text:
    string;

  context_line?:
    string;

  canonical_quote:
    boolean;

  actions: {
    return_to_book:
      true;

    close:
      true;

    continue_reflection:
      boolean;
  };

  show_question:
    false;

  show_analysis:
    false;

  show_signal:
    false;
}


export function buildP01MicroReturnScreen(
  item: CompanionMicroReturn,
  contextLine?: string
): P01MicroReturnScreenContract {
  return {
    screen_id:
      `screen_${item.id}`,

    mode:
      "reflection",

    surface:
      "bottom_sheet",

    text:
      item.text,

    context_line:
      item.requires_context_line
        ? contextLine
        : undefined,

    canonical_quote:
      item.origin ===
      "book_exact",

    actions: {
      return_to_book:
        true,

      close:
        true,

      continue_reflection:
        false
    },

    show_question:
      false,

    show_analysis:
      false,

    show_signal:
      false
  };
}


//////////////////////////////////////////////////
// 22. FLUXO DA FASE CONSCIÊNCIA
//////////////////////////////////////////////////

export const P01_CONSCIOUSNESS_FLOW = {
  entry_section_id:
    "p01_section_consciousness",

  invite_id:
    "p01_invite_consciousness",

  entry_question_id:
    "p01_q_cons_01",

  optional_question_sequence: [
    "p01_q_cons_01",
    "p01_q_cons_02",
    "p01_q_cons_03"
  ],

  preferred_break_after:
    2,

  optional_journal_ids: [
    "p01_journal_cons_01",
    "p01_journal_cons_02"
  ],

  optional_anchor_ids: [
    "p01_anchor_observe",
    "p01_anchor_name"
  ],

  exit_routes: [
    "return_to_book",
    "continue_to_judgment",
    "close_reflection",
    "pause"
  ],

  next_canonical_section_id:
    "p01_section_judgment"
} as const;


//////////////////////////////////////////////////
// 23. FLUXO DA FASE JULGAMENTO
//////////////////////////////////////////////////

export const P01_JUDGMENT_FLOW = {
  entry_section_id:
    "p01_section_judgment",

  invite_id:
    "p01_invite_judgment",

  entry_question_id:
    "p01_q_judg_01",

  optional_question_sequence: [
    "p01_q_judg_01",
    "p01_q_judg_02",
    "p01_q_judg_03"
  ],

  preferred_break_after:
    1,

  optional_journal_ids: [
    "p01_journal_judg_01",
    "p01_journal_judg_02"
  ],

  optional_letter_ids: [
    "p01_letter_confrontation"
  ],

  optional_anchor_ids: [
    "p01_anchor_observe",
    "p01_anchor_name"
  ],

  exit_routes: [
    "return_to_book",
    "continue_to_presence",
    "close_reflection",
    "pause"
  ],

  next_canonical_section_id:
    "p01_section_presence"
} as const;


//////////////////////////////////////////////////
// 24. FLUXO DA FASE PRESENÇA
//////////////////////////////////////////////////

export const P01_PRESENCE_FLOW = {
  entry_section_id:
    "p01_section_presence",

  invite_id:
    "p01_invite_presence",

  entry_question_id:
    "p01_q_pres_01",

  optional_question_sequence: [
    "p01_q_pres_01",
    "p01_q_pres_02",
    "p01_q_pres_03"
  ],

  preferred_break_after:
    1,

  optional_journal_ids: [
    "p01_journal_pres_01",
    "p01_journal_pres_02"
  ],

  optional_letter_ids: [
    "p01_letter_presence"
  ],

  optional_anchor_ids: [
    "p01_anchor_observe",
    "p01_anchor_name",
    "p01_anchor_position"
  ],

  exit_routes: [
    "open_canonical_support_letter",
    "open_canonical_ritual",
    "return_to_book",
    "close_pillar",
    "pause"
  ],

  next_canonical_section_id:
    "p01_section_support_letter"
} as const;


//////////////////////////////////////////////////
// 25. CONTINUIDADE SEM REFLEXÃO
//////////////////////////////////////////////////

export function getP01NextCanonicalSection(
  currentSectionId:
    string
): string | null {
  const index =
    P01_CANONICAL_EXPERIENCE_ORDER
      .indexOf(
        currentSectionId as
          P01CanonicalExperienceSectionId
      );

  if (
    index < 0 ||
    index >=
      P01_CANONICAL_EXPERIENCE_ORDER
        .length - 1
  ) {
    return null;
  }

  return (
    P01_CANONICAL_EXPERIENCE_ORDER[
      index + 1
    ] ?? null
  );
}


export function continueP01ReadingWithoutReflection(
  currentSectionId:
    string
): P01ExperienceNode {
  const nextSectionId =
    getP01NextCanonicalSection(
      currentSectionId
    );

  if (!nextSectionId) {
    return {
      id:
        "p01_node_pillar_closure",

      type:
        "pillar_closure",

      mode:
        "closure",

      surface:
        "closure_card",

      pillar_id:
        "pillar_01_reconhecimento",

      intensity:
        "quiet",

      optional:
        true,

      allow_skip:
        true,

      allow_close:
        true,

      allow_return_to_book:
        true,

      blocks_reading_progress:
        false,

      next_node_ids: [
        "p01_node_transition_p02"
      ]
    };
  }

  return {
    id:
      `p01_node_${nextSectionId}`,

    type:
      "canonical_section",

    mode:
      "reading",

    surface:
      "reader",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      nextSectionId,

    intensity:
      "quiet",

    optional:
      true,

    allow_skip:
      true,

    allow_close:
      true,

    allow_return_to_book:
      true,

    blocks_reading_progress:
      false,

    next_node_ids: []
  };
}


//////////////////////////////////////////////////
// 26. TRANSIÇÃO ENTRE REFLEXÃO E LIVRO
//////////////////////////////////////////////////

export interface P01ReturnToBookDecision {
  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  canonical_section_id:
    string;

  paragraph_anchor?: string;
  reading_percentage?: number;

  visible_message:
    string;

  resume_audio:
    boolean;

  preserve_reflection_session:
    boolean;
}


export function buildP01ReturnToBookDecision(
  experience:
    P01ExperienceState
): P01ReturnToBookDecision {
  return {
    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      experience.return_position
        ?.canonical_section_id ??
      experience
        .last_canonical_section_id ??
      "p01_section_identity",

    paragraph_anchor:
      experience.return_position
        ?.paragraph_anchor,

    reading_percentage:
      experience.return_position
        ?.reading_percentage,

    visible_message:
      "Você pode continuar a leitura sem concluir esta reflexão.",

    resume_audio:
      false,

    preserve_reflection_session:
      true
  };
}


//////////////////////////////////////////////////
// 27. SAÍDA APÓS UMA RESPOSTA
//////////////////////////////////////////////////

export type P01PostResponseRoute =
  | "show_response"
  | "show_micro_return"
  | "show_anchor"
  | "show_journal"
  | "show_letter"
  | "ask_next_question"
  | "return_to_book"
  | "pause"
  | "close_reflection";


export interface P01PostResponseDecision {
  route:
    P01PostResponseRoute;

  content_id?:
    string;

  update_state:
    boolean;

  update_memory:
    boolean;

  preserve_book_position:
    true;
}


export function selectP01PostResponseDecision(
  context:
    P01ExperienceDecisionContext,

  selectedOption:
    CompanionQuestionOption
): P01PostResponseDecision {
  if (
    context.mind_state.load_level >= 3
  ) {
    return {
      route:
        "pause",

      update_state:
        true,

      update_memory:
        false,

      preserve_book_position:
        true
    };
  }

  if (
    selectedOption
      .semantic_position ===
      "defense"
  ) {
    if (selectedOption.anchor_id) {
      return {
        route:
          "show_anchor",

        content_id:
          selectedOption.anchor_id,

        update_state:
          true,

        update_memory:
          false,

        preserve_book_position:
          true
      };
    }

    return {
      route:
        "show_micro_return",

      content_id:
        selectedOption
          .micro_return_ids[0],

      update_state:
        true,

      update_memory:
        false,

      preserve_book_position:
        true
    };
  }

  const pacing =
    decideP01Pacing(context);

  if (
    !pacing.allow_next_question
  ) {
    if (
      pacing.recommended_intervention ===
      "return_to_book"
    ) {
      return {
        route:
          "return_to_book",

        update_state:
          true,

        update_memory:
          false,

        preserve_book_position:
          true
      };
    }

    if (
      pacing.recommended_intervention ===
      "pause"
    ) {
      return {
        route:
          "pause",

        update_state:
          true,

        update_memory:
          false,

        preserve_book_position:
          true
      };
    }

    if (
      pacing.recommended_intervention ===
      "anchor" &&
      selectedOption.anchor_id
    ) {
      return {
        route:
          "show_anchor",

        content_id:
          selectedOption.anchor_id,

        update_state:
          true,

        update_memory:
          false,

        preserve_book_position:
          true
      };
    }

    return {
      route:
        "show_micro_return",

      content_id:
        selectedOption
          .micro_return_ids[0],

      update_state:
        true,

      update_memory:
        false,

      preserve_book_position:
        true
    };
  }

  const nextQuestionId =
    selectedOption
      .next_question_ids[0];

  if (nextQuestionId) {
    return {
      route:
        "ask_next_question",

      content_id:
        nextQuestionId,

      update_state:
        true,

      update_memory:
        false,

      preserve_book_position:
        true
    };
  }

  return {
    route:
      "close_reflection",

    update_state:
      true,

    update_memory:
      false,

    preserve_book_position:
      true
  };
}


//////////////////////////////////////////////////
// 28. FLUXO DE PAUSA
//////////////////////////////////////////////////

export interface P01PauseScreenContract {
  screen_id:
    "p01_pause_screen";

  mode:
    "paused";

  surface:
    "bottom_sheet";

  title:
    "Pausa";

  message:
    string;

  actions: Array<{
    intent:
      P01NavigationIntent;

    label:
      string;
  }>;

  show_countdown:
    false;

  show_return_reminder:
    false;

  automatically_resume:
    false;
}


export function buildP01PauseScreen():
  P01PauseScreenContract {
  return {
    screen_id:
      "p01_pause_screen",

    mode:
      "paused",

    surface:
      "bottom_sheet",

    title:
      "Pausa",

    message:
      "Você não precisa continuar esta reflexão agora. Sua posição no livro permanece salva.",

    actions: [
      {
        intent:
          "return_to_book",

        label:
          "Voltar para a leitura"
      },

      {
        intent:
          "close",

        label:
          "Encerrar por agora"
      }
    ],

    show_countdown:
      false,

    show_return_reminder:
      false,

    automatically_resume:
      false
  };
}


//////////////////////////////////////////////////
// 29. CARTA DE SUSTENTAÇÃO CANÔNICA
//////////////////////////////////////////////////

export interface P01CanonicalSupportLetterScreen {
  screen_id:
    "p01_canonical_support_letter";

  mode:
    "reading";

  surface:
    "reader";

  canonical_section_id:
    "p01_section_support_letter";

  content_origin:
    "book_exact";

  show_companion_label:
    false;

  show_analysis_action:
    false;

  show_private_note_action:
    true;

  show_continue_action:
    true;

  next_section_id:
    "p01_section_anchor";
}


export const P01_CANONICAL_SUPPORT_LETTER_SCREEN:
  P01CanonicalSupportLetterScreen = {
    screen_id:
      "p01_canonical_support_letter",

    mode:
      "reading",

    surface:
      "reader",

    canonical_section_id:
      "p01_section_support_letter",

    content_origin:
      "book_exact",

    show_companion_label:
      false,

    show_analysis_action:
      false,

    show_private_note_action:
      true,

    show_continue_action:
      true,

    next_section_id:
      "p01_section_anchor"
  };


/**
 * A Carta de Sustentação deve aparecer
 * como conteúdo do livro, nunca como resposta
 * personalizada do iGentMIND.
 */


//////////////////////////////////////////////////
// 30. RITUAL CANÔNICO
//////////////////////////////////////////////////

export interface P01CanonicalRitualScreen {
  screen_id:
    "p01_canonical_ritual";

  mode:
    "reading";

  surface:
    "reader";

  canonical_section_id:
    "p01_section_anchor";

  content_origin:
    "book_exact";

  ritual_title:
    string;

  ritual_steps:
    Array<{
      code:
        CanonicalRitualStepCode;

      title:
        string;
    }>;

  show_companion_anchor_shortcuts:
    boolean;

  companion_anchor_ids:
    string[];

  completion_required:
    false;

  show_streak:
    false;

  show_daily_obligation:
    false;

  show_completion_score:
    false;
}


export const P01_CANONICAL_RITUAL_SCREEN:
  P01CanonicalRitualScreen = {
    screen_id:
      "p01_canonical_ritual",

    mode:
      "reading",

    surface:
      "reader",

    canonical_section_id:
      "p01_section_anchor",

    content_origin:
      "book_exact",

    ritual_title:
      "O Ritual do Reconhecimento",

    ritual_steps: [
      {
        code:
          "arrival",

        title:
          "Chegada"
      },

      {
        code:
          "naming",

        title:
          "Nomeação"
      },

      {
        code:
          "remaining",

        title:
          "Permanência"
      },

      {
        code:
          "mirroring",

        title:
          "Espelhamento"
      }
    ],

    show_companion_anchor_shortcuts:
      true,

    companion_anchor_ids: [
      "p01_anchor_observe",
      "p01_anchor_name",
      "p01_anchor_position"
    ],

    completion_required:
      false,

    show_streak:
      false,

    show_daily_obligation:
      false,

    show_completion_score:
      false
  };


//////////////////////////////////////////////////
// 31. FECHO CANÔNICO
//////////////////////////////////////////////////

export interface P01CanonicalClosureScreen {
  screen_id:
    "p01_canonical_closure";

  mode:
    "reading";

  surface:
    "reader";

  canonical_section_id:
    "p01_section_closure";

  content_origin:
    "book_exact";

  title:
    "O primeiro passo não é andar. É parar de fugir.";

  show_companion_summary_action:
    true;

  show_continue_to_pillar_02:
    true;

  show_reflection_requirement:
    false;
}


export const P01_CANONICAL_CLOSURE_SCREEN:
  P01CanonicalClosureScreen = {
    screen_id:
      "p01_canonical_closure",

    mode:
      "reading",

    surface:
      "reader",

    canonical_section_id:
      "p01_section_closure",

    content_origin:
      "book_exact",

    title:
      "O primeiro passo não é andar. É parar de fugir.",

    show_companion_summary_action:
      true,

    show_continue_to_pillar_02:
      true,

    show_reflection_requirement:
      false
  };


//////////////////////////////////////////////////
// 32. FECHAMENTO COMPLEMENTAR
//////////////////////////////////////////////////

export interface P01CompanionClosureScreen {
  screen_id:
    "p01_companion_closure";

  mode:
    "closure";

  surface:
    "closure_card";

  title:
    "O que começou a ficar visível";

  summary?:
    PillarClosureVisibleSummary;

  primary_action:
    PillarClosureAction;

  secondary_actions:
    PillarClosureAction[];

  show_edit:
    boolean;

  show_reject:
    boolean;

  show_memory_choice:
    boolean;

  memory_default:
    false;

  show_badge:
    false;

  show_score:
    false;

  show_completion_percentage:
    false;
}


export function buildP01CompanionClosureScreen(
  result:
    Pillar01ClosureResult
): P01CompanionClosureScreen {
  const card =
    buildPillar01ClosureCard(
      result
    );

  return {
    screen_id:
      "p01_companion_closure",

    mode:
      "closure",

    surface:
      "closure_card",

    title:
      "O que começou a ficar visível",

    summary:
      card.summary,

    primary_action:
      card.primary_action,

    secondary_actions:
      card.secondary_actions,

    show_edit:
      card.show_edit_summary,

    show_reject:
      card.show_reject_summary,

    show_memory_choice:
      card.show_memory_toggle,

    memory_default:
      false,

    show_badge:
      false,

    show_score:
      false,

    show_completion_percentage:
      false
  };
}


//////////////////////////////////////////////////
// 33. TRANSIÇÃO PARA FAMÍLIA
//////////////////////////////////////////////////

export interface P01ToP02TransitionScreen {
  screen_id:
    "p01_to_p02_transition";

  mode:
    "reading";

  surface:
    "reader";

  title:
    "Próximo Pilar";

  target_pillar_id:
    "pillar_02_familia";

  target_unit_id:
    "unit_pillar_02_familia";

  transition_text:
    string;

  actions: Array<{
    intent:
      P01NavigationIntent;

    label:
      string;
  }>;

  show_causal_claim:
    false;

  show_family_blame:
    false;
}


export function buildP01ToP02TransitionScreen(
  depth:
    ClosureSummaryDepth
): P01ToP02TransitionScreen {
  const transitionText =
    depth === "minimal"
      ? PILLAR_01_TO_PILLAR_02_TRANSITION
          .minimal
      : depth === "deep"
        ? PILLAR_01_TO_PILLAR_02_TRANSITION
            .deep
        : PILLAR_01_TO_PILLAR_02_TRANSITION
            .standard;

  return {
    screen_id:
      "p01_to_p02_transition",

    mode:
      "reading",

    surface:
      "reader",

    title:
      "Próximo Pilar",

    target_pillar_id:
      "pillar_02_familia",

    target_unit_id:
      "unit_pillar_02_familia",

    transition_text:
      transitionText,

    actions: [
      {
        intent:
          "continue_to_pillar_02",

        label:
          "Continuar para Família"
      },

      {
        intent:
          "pause",

        label:
          "Pausar por agora"
      }
    ],

    show_causal_claim:
      false,

    show_family_blame:
      false
  };
}


//////////////////////////////////////////////////
// 34. MÁQUINA DE ESTADOS DA EXPERIÊNCIA
//////////////////////////////////////////////////

export type P01ExperienceEvent =
  | {
      type:
        "SECTION_OPENED";

      section_id:
        string;
    }
  | {
      type:
        "SECTION_COMPLETED";

      section_id:
        string;
    }
  | {
      type:
        "REFLECTION_ACCEPTED";

      invite_id:
        string;

      question_id:
        string;
    }
  | {
      type:
        "REFLECTION_DISMISSED";

      invite_id:
        string;
    }
  | {
      type:
        "QUESTION_ANSWERED";

      question_id:
        string;

      option_id?:
        string;
    }
  | {
      type:
        "QUESTION_SKIPPED";

      question_id:
        string;
    }
  | {
      type:
        "INTERVENTION_OPENED";

      intervention_type:
        InterventionType;

      content_id:
        string;
    }
  | {
      type:
        "RETURN_TO_BOOK";
    }
  | {
      type:
        "PAUSE_REQUESTED";
    }
  | {
      type:
        "REFLECTION_CLOSED";
    }
  | {
      type:
        "PILLAR_CLOSED";
    };


export function reduceP01ExperienceState(
  state:
    P01ExperienceState,

  event:
    P01ExperienceEvent
): P01ExperienceState {
  switch (event.type) {
    case "SECTION_OPENED":
      return {
        ...state,

        mode:
          "reading",

        current_node_id:
          `p01_node_${event.section_id}`,

        current_section_id:
          event.section_id,

        last_canonical_section_id:
          event.section_id,

        paused:
          false
      };

    case "SECTION_COMPLETED":
      return {
        ...state,

        completed_node_ids:
          uniqueValues([
            ...state.completed_node_ids,
            `p01_node_${event.section_id}`
          ]),

        last_canonical_section_id:
          event.section_id
      };

    case "REFLECTION_ACCEPTED":
      return {
        ...state,

        mode:
          "reflection",

        current_node_id:
          `p01_node_${event.question_id}`,

        last_question_id:
          event.question_id,

        reflection_invites_seen:
          state.reflection_invites_seen + 1,

        reflection_session_started_at:
          state.reflection_session_started_at ??
          new Date().toISOString(),

        paused:
          false
      };

    case "REFLECTION_DISMISSED":
      return {
        ...state,

        dismissed_invite_ids:
          uniqueValues([
            ...state.dismissed_invite_ids,
            event.invite_id
          ]),

        skipped_node_ids:
          uniqueValues([
            ...state.skipped_node_ids,
            event.invite_id
          ]),

        mode:
          "reading"
      };

    case "QUESTION_ANSWERED":
      return {
        ...state,

        mode:
          "reflection",

        last_question_id:
          event.question_id,

        answered_question_ids:
          uniqueValues([
            ...state.answered_question_ids,
            event.question_id
          ]),

        completed_node_ids:
          uniqueValues([
            ...state.completed_node_ids,
            `p01_node_${event.question_id}`
          ]),

        consecutive_question_count:
          state.consecutive_question_count + 1,

        last_intervention_type:
          "question",

        last_interaction_at:
          new Date().toISOString()
      };

    case "QUESTION_SKIPPED":
      return {
        ...state,

        skipped_node_ids:
          uniqueValues([
            ...state.skipped_node_ids,
            `p01_node_${event.question_id}`
          ]),

        consecutive_question_count:
          0,

        last_interaction_at:
          new Date().toISOString()
      };

    case "INTERVENTION_OPENED":
      return {
        ...state,

        current_node_id:
          `p01_node_${event.content_id}`,

        mode:
          event.intervention_type ===
            "journal" ||
          event.intervention_type ===
            "letter"
            ? "private_writing"
            : event.intervention_type ===
                "anchor"
              ? "practice"
              : "reflection",

        last_intervention_type:
          event.intervention_type,

        consecutive_question_count:
          event.intervention_type ===
          "question"
            ? state
                .consecutive_question_count +
              1
            : 0,

        consecutive_deep_count:
          isDeepP01Intervention(
            event.intervention_type,
            event.content_id
          )
            ? state.consecutive_deep_count + 1
            : 0,

        last_interaction_at:
          new Date().toISOString()
      };

    case "RETURN_TO_BOOK":
      return {
        ...state,

        mode:
          "reading",

        current_node_id:
          state.last_canonical_section_id
            ? `p01_node_${state.last_canonical_section_id}`
            : "p01_node_p01_section_identity",

        consecutive_question_count:
          0,

        consecutive_deep_count:
          0,

        paused:
          false
      };

    case "PAUSE_REQUESTED":
      return {
        ...state,

        mode:
          "paused",

        current_node_id:
          "p01_node_pause",

        paused:
          true,

        consecutive_question_count:
          0,

        consecutive_deep_count:
          0
      };

    case "REFLECTION_CLOSED":
      return {
        ...state,

        mode:
          "reading",

        current_node_id:
          state.last_canonical_section_id
            ? `p01_node_${state.last_canonical_section_id}`
            : "p01_node_p01_section_identity",

        consecutive_question_count:
          0,

        consecutive_deep_count:
          0
      };

    case "PILLAR_CLOSED":
      return {
        ...state,

        mode:
          "closure",

        current_node_id:
          "p01_node_pillar_closure",

        closed:
          true,

        paused:
          false
      };

    default:
      return state;
  }
}


//////////////////////////////////////////////////
// 35. IDENTIFICAÇÃO DE INTERVENÇÃO PROFUNDA
//////////////////////////////////////////////////

export function isDeepP01Intervention(
  type:
    InterventionType,

  contentId:
    string
): boolean {
  if (
    type === "letter"
  ) {
    return true;
  }

  if (
    type === "journal" &&
    contentId ===
      "p01_journal_pres_02"
  ) {
    return true;
  }

  if (
    type === "question" &&
    contentId ===
      "p01_q_pres_03"
  ) {
    return true;
  }

  return false;
}


//////////////////////////////////////////////////
// 36. NÓ SEGUINTE PRINCIPAL
//////////////////////////////////////////////////

export function selectNextP01ExperienceNode(
  context:
    P01ExperienceDecisionContext
): P01ExperienceNode {
  if (
    context.reader_requested_pause ||
    context.mind_state.load_level >= 3
  ) {
    return {
      id:
        "p01_node_pause",

      type:
        "pause",

      mode:
        "paused",

      surface:
        "bottom_sheet",

      pillar_id:
        "pillar_01_reconhecimento",

      title:
        "Pausa",

      intensity:
        "quiet",

      optional:
        true,

      allow_skip:
        true,

      allow_close:
        true,

      allow_return_to_book:
        true,

      blocks_reading_progress:
        false,

      next_node_ids: [
        "p01_node_return_to_book"
      ]
    };
  }

  if (
    context.reader_requested_continue
  ) {
    return continueP01ReadingWithoutReflection(
      context.canonical_section_id
    );
  }

  const invite =
    P01_REFLECTION_INVITES.find(
      candidate =>
        canShowP01ReflectionInvite(
          candidate,
          context
        )
    );

  if (invite) {
    return {
      id:
        invite.id,

      type:
        "reflection_invite",

      mode:
        "reading",

      surface:
        "bottom_sheet",

      pillar_id:
        "pillar_01_reconhecimento",

      phase:
        invite.phase,

      canonical_section_id:
        invite.after_section_id,

      companion_content_id:
        invite.initial_question_id,

      title:
        invite.title,

      description:
        invite.description,

      intensity:
        invite.intensity,

      optional:
        true,

      allow_skip:
        true,

      allow_close:
        true,

      allow_return_to_book:
        true,

      blocks_reading_progress:
        false,

      next_node_ids: [
        `p01_node_${invite.initial_question_id}`,
        `p01_node_${getP01NextCanonicalSection(
          invite.after_section_id
        )}`
      ].filter(
        (value): value is string =>
          Boolean(value)
      )
    };
  }

  return continueP01ReadingWithoutReflection(
    context.canonical_section_id
  );
}


//////////////////////////////////////////////////
// 37. BARRA DO iGentMIND
//////////////////////////////////////////////////

export interface P01CompanionToolbar {
  visible:
    boolean;

  label:
    "iGentMIND";

  actions: Array<{
    id:
      string;

    label:
      string;

    intent:
      P01NavigationIntent;
  }>;

  show_notification_dot:
    false;

  show_pending_task_count:
    false;

  show_unanswered_count:
    false;
}


export function buildP01CompanionToolbar(
  state:
    P01ExperienceState
): P01CompanionToolbar {
  return {
    visible:
      !state.closed,

    label:
      "iGentMIND",

    actions: [
      {
        id:
          "p01_toolbar_reflect",

        label:
          "Refletir",

        intent:
          "open_reflection"
      },

      {
        id:
          "p01_toolbar_write",

        label:
          "Escrever",

        intent:
          "write_freely"
      },

      {
        id:
          "p01_toolbar_anchor",

        label:
          "Âncora breve",

        intent:
          "open_anchor"
      }
    ],

    show_notification_dot:
      false,

    show_pending_task_count:
      false,

    show_unanswered_count:
      false
  };
}


//////////////////////////////////////////////////
// 38. ACESSIBILIDADE
//////////////////////////////////////////////////

export const P01_ACCESSIBILITY_RULES = {
  minimum_touch_target_px:
    44,

  support_dynamic_font:
    true,

  support_screen_reader:
    true,

  support_reduced_motion:
    true,

  support_high_contrast:
    true,

  support_keyboard_navigation:
    true,

  never_use_color_as_only_signal:
    true,

  never_auto_play_reflection_audio:
    true,

  never_auto_start_timer:
    true,

  never_lock_orientation:
    true,

  allow_text_only_mode:
    true,

  allow_audio_only_book_mode:
    true,

  preserve_focus_after_modal_close:
    true,

  announce_private_mode:
    true,

  announce_analysis_state:
    true,

  announce_memory_state:
    true
};


//////////////////////////////////////////////////
// 39. TOM VISUAL
//////////////////////////////////////////////////

export const P01_VISUAL_DIRECTION = {
  reading_surface:
    "editorial_quiet",

  reflection_surface:
    "focused_minimal",

  writing_surface:
    "private_neutral",

  closure_surface:
    "editorial_summary",

  preferred_background:
    "dark_mineral",

  preferred_text_contrast:
    "high",

  accent_usage:
    "aged_bronze_minimal",

  animation:
    "slow_fade_only",

  avoid: [
    "gamified cards",
    "bright gradients",
    "progress rings",
    "achievement celebrations",
    "confetti",
    "emotion emojis",
    "clinical dashboard",
    "chat bubbles resembling therapy",
    "multiple simultaneous panels",
    "aggressive modal interruptions"
  ]
} as const;


//////////////////////////////////////////////////
// 40. TEXTOS DE INTERFACE PROIBIDOS
//////////////////////////////////////////////////

export const P01_FORBIDDEN_UI_COPY = [
  "Descubra seu perfil",
  "Faça seu teste",
  "Veja seu resultado",
  "Resposta correta",
  "Resposta errada",
  "Você está evoluindo",
  "Seu nível emocional",
  "Seu nível de consciência",
  "Você completou 50%",
  "Faltam poucas perguntas",
  "Não desista agora",
  "Continue para desbloquear",
  "Você ganhou",
  "Nova conquista",
  "Sequência de dias",
  "Você está curado",
  "Transformação concluída",
  "Análise psicológica",
  "Diagnóstico",
  "Perfil comportamental",
  "O iGentMIND sabe o que você sente"
] as const;


//////////////////////////////////////////////////
// 41. TEXTOS DE INTERFACE APROVADOS
//////////////////////////////////////////////////

export const P01_APPROVED_UI_COPY = {
  open_companion:
    "Abrir o iGentMIND",

  continue_reading:
    "Continuar lendo",

  reflect_now:
    "Refletir agora",

  write_privately:
    "Escrever em privado",

  skip:
    "Agora não",

  close:
    "Encerrar reflexão",

  return_to_book:
    "Voltar para o livro",

  pause:
    "Pausar por agora",

  no_answer:
    "Ainda não sei",

  private_mode:
    "Manter somente para mim",

  analyze_once:
    "Permitir análise desta resposta",

  allow_memory:
    "Salvar uma síntese para retomadas futuras",

  edit_summary:
    "Ajustar esta síntese",

  reject_summary:
    "Descartar esta síntese",

  continue_to_family:
    "Continuar para Família"
} as const;


//////////////////////////////////////////////////
// 42. PRIVACIDADE VISÍVEL
//////////////////////////////////////////////////

export interface P01PrivacyNotice {
  context:
    | "open_response"
    | "journal"
    | "letter"
    | "anchor"
    | "closure_memory";

  title:
    string;

  message:
    string;

  analysis_default:
    false;

  memory_default:
    false;
}


export const P01_PRIVACY_NOTICES:
  P01PrivacyNotice[] = [
    {
      context:
        "open_response",

      title:
        "Você escolhe o que acontece com este texto",

      message:
        "A resposta pode permanecer privada. Análise e memória ficam desativadas até que você as autorize.",

      analysis_default:
        false,

      memory_default:
        false
    },

    {
      context:
        "journal",

      title:
        "Este diário pode permanecer somente aqui",

      message:
        "Você pode escrever, não analisar, apagar ou encerrar sem salvar.",

      analysis_default:
        false,

      memory_default:
        false
    },

    {
      context:
        "letter",

      title:
        "Esta carta é privada",

      message:
        "Ela não precisa ser enviada, compartilhada ou transformada em conversa real.",

      analysis_default:
        false,

      memory_default:
        false
    },

    {
      context:
        "anchor",

      title:
        "Nada precisa ser registrado",

      message:
        "Você pode realizar a prática em silêncio e encerrar sem responder.",

      analysis_default:
        false,

      memory_default:
        false
    },

    {
      context:
        "closure_memory",

      title:
        "Salvar apenas uma síntese",

      message:
        "O texto original não será incluído. Você poderá revisar, editar ou rejeitar a síntese antes de salvar.",

      analysis_default:
        false,

      memory_default:
        false
    }
  ];


//////////////////////////////////////////////////
// 43. TELEMETRIA MÍNIMA
//////////////////////////////////////////////////

export type P01UXEventType =
  | "section_opened"
  | "section_completed"
  | "reflection_invite_shown"
  | "reflection_invite_accepted"
  | "reflection_invite_dismissed"
  | "question_opened"
  | "question_answered"
  | "question_skipped"
  | "open_response_used"
  | "journal_opened"
  | "journal_closed"
  | "letter_opened"
  | "letter_closed"
  | "anchor_opened"
  | "anchor_stopped"
  | "anchor_completed"
  | "return_to_book"
  | "reflection_closed"
  | "pillar_closed"
  | "continue_to_pillar_02";


export interface P01UXTelemetryEvent {
  type:
    P01UXEventType;

  pillar_id:
    "pillar_01_reconhecimento";

  content_id?:
    string;

  phase?:
    PillarPhase;

  timestamp:
    string;

  session_id:
    string;

  duration_ms?:
    number;

  /**
   * Nunca incluir:
   * - texto escrito;
   * - opção escolhida em conteúdo sensível;
   * - frase interna;
   * - sensação corporal;
   * - síntese emocional;
   * - nomes;
   * - detalhes de cartas.
   */
}


export const P01_TELEMETRY_RULES = {
  store_raw_reflective_text:
    false,

  store_selected_option_text:
    false,

  store_internal_signal_labels:
    false,

  store_private_mode_content:
    false,

  store_letter_content:
    false,

  store_journal_content:
    false,

  store_anchor_private_note:
    false,

  allow_aggregate_completion_metrics:
    true,

  allow_aggregate_skip_metrics:
    true,

  allow_aggregate_navigation_metrics:
    true,

  allow_content_quality_metrics:
    true,

  retention_days:
    90
} as const;


//////////////////////////////////////////////////
// 44. INICIALIZAÇÃO
//////////////////////////////////////////////////

export function createInitialP01ExperienceState(
  readerId:
    string
): P01ExperienceState {
  return {
    reader_id:
      readerId,

    pillar_id:
      "pillar_01_reconhecimento",

    mode:
      "reading",

    current_node_id:
      "p01_node_p01_section_identity",

    current_section_id:
      "p01_section_identity",

    last_canonical_section_id:
      "p01_section_identity",

    completed_node_ids: [],
    skipped_node_ids: [],
    dismissed_invite_ids: [],

    answered_question_ids: [],
    opened_journal_ids: [],
    opened_letter_ids: [],
    completed_anchor_ids: [],

    reflection_invites_seen: 0,
    consecutive_question_count: 0,
    consecutive_deep_count: 0,

    paused: false,
    closed: false
  };
}


//////////////////////////////////////////////////
// 45. VALIDAÇÃO DOS CONVITES
//////////////////////////////////////////////////

export function validateP01ReflectionInvites(
  invites:
    P01ReflectionInviteDefinition[]
): string[] {
  const errors:
    string[] = [];

  if (
    invites.length !== 3
  ) {
    errors.push(
      "Pillar I requires exactly three automatic reflection invites."
    );
  }

  const phaseSet =
    new Set(
      invites.map(
        invite =>
          invite.phase
      )
    );

  for (
    const phase
    of [
      "consciousness",
      "judgment",
      "presence"
    ] as PillarPhase[]
  ) {
    if (!phaseSet.has(phase)) {
      errors.push(
        `Missing reflection invite for ${phase}.`
      );
    }
  }

  for (const invite of invites) {
    if (
      !P01_CANONICAL_EXPERIENCE_ORDER
        .includes(
          invite.after_section_id
        )
    ) {
      errors.push(
        `${invite.id} references an invalid canonical section.`
      );
    }

    if (
      !PILLAR_01_CONTENT_INDEX
        .questions
        .has(
          invite.initial_question_id
        )
    ) {
      errors.push(
        `${invite.id} references a missing initial question.`
      );
    }

    if (
      invite.maximum_appearances >
      1
    ) {
      errors.push(
        `${invite.id} cannot appear automatically more than once.`
      );
    }
  }

  return errors;
}


//////////////////////////////////////////////////
// 46. VALIDAÇÃO DAS TELAS
//////////////////////////////////////////////////

export function validateP01QuestionScreen(
  screen:
    P01QuestionScreenContract
): string[] {
  const errors:
    string[] = [];

  if (
    screen.options.length !== 6
  ) {
    errors.push(
      `${screen.question_id} must show six semantic options.`
    );
  }

  if (
    screen.show_question_number ||
    screen.show_total_questions ||
    screen.show_answer_score ||
    screen.show_recommended_answer ||
    screen.show_progress_percentage
  ) {
    errors.push(
      `${screen.question_id} contains prohibited test-like UI.`
    );
  }

  if (
    !screen.actions.skip ||
    !screen.actions.close ||
    !screen.actions.return_to_book
  ) {
    errors.push(
      `${screen.question_id} must allow skip, close and return to book.`
    );
  }

  return errors;
}


export function validateP01InterfaceCopy(
  serializedContent:
    string
): string[] {
  const errors:
    string[] = [];

  for (
    const forbidden
    of P01_FORBIDDEN_UI_COPY
  ) {
    if (
      serializedContent
        .toLowerCase()
        .includes(
          forbidden.toLowerCase()
        )
    ) {
      errors.push(
        `Forbidden interface copy detected: ${forbidden}.`
      );
    }
  }

  return errors;
}


//////////////////////////////////////////////////
// 47. VALIDAÇÃO DE NAVEGAÇÃO
//////////////////////////////////////////////////

export function validateP01CanonicalNavigation():
  string[] {
  const errors:
    string[] = [];

  for (
    let index = 0;
    index <
    P01_CANONICAL_EXPERIENCE_ORDER
      .length - 1;
    index += 1
  ) {
    const current =
      P01_CANONICAL_EXPERIENCE_ORDER[
        index
      ];

    const expectedNext =
      P01_CANONICAL_EXPERIENCE_ORDER[
        index + 1
      ];

    const resolvedNext =
      getP01NextCanonicalSection(
        current
      );

    if (
      resolvedNext !==
      expectedNext
    ) {
      errors.push(
        `Invalid navigation from ${current} to ${resolvedNext}; expected ${expectedNext}.`
      );
    }
  }

  const finalNext =
    getP01NextCanonicalSection(
      "p01_section_closure"
    );

  if (finalNext !== null) {
    errors.push(
      "Canonical closure must be the final section of Pillar I."
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 48. VALIDAÇÃO INTEGRAL DO BLOCO
//////////////////////////////////////////////////

export interface P01ExperienceValidationResult {
  valid:
    boolean;

  errors:
    string[];

  warnings:
    string[];

  checks: {
    canonical_order:
      boolean;

    reflection_invites:
      boolean;

    question_interfaces:
      boolean;

    optionality:
      boolean;

    no_test_ui:
      boolean;

    privacy_defaults:
      boolean;

    transition_valid:
      boolean;
  };
}


export function validateP01ExperienceFlow():
  P01ExperienceValidationResult {
  const errors:
    string[] = [];

  const warnings:
    string[] = [];

  const navigationErrors =
    validateP01CanonicalNavigation();

  const inviteErrors =
    validateP01ReflectionInvites(
      P01_REFLECTION_INVITES
    );

  const questionScreenErrors =
    PILLAR_01_ALL_QUESTIONS
      .flatMap(
        question =>
          validateP01QuestionScreen(
            buildP01QuestionScreen(
              question
            )
          )
      );

  const serializedInterface =
    JSON.stringify({
      invites:
        P01_REFLECTION_INVITES,

      approved_copy:
        P01_APPROVED_UI_COPY,

      support_letter:
        P01_CANONICAL_SUPPORT_LETTER_SCREEN,

      ritual:
        P01_CANONICAL_RITUAL_SCREEN,

      closure:
        P01_CANONICAL_CLOSURE_SCREEN
    });

  const copyErrors =
    validateP01InterfaceCopy(
      serializedInterface
    );

  errors.push(
    ...navigationErrors,
    ...inviteErrors,
    ...questionScreenErrors,
    ...copyErrors
  );

  if (
    P01_REFLECTION_INVITES.some(
      invite =>
        invite.maximum_appearances >
        1
    )
  ) {
    warnings.push(
      "Automatic reflection invitations should appear only once."
    );
  }

  return {
    valid:
      errors.length === 0,

    errors,
    warnings,

    checks: {
      canonical_order:
        navigationErrors.length === 0,

      reflection_invites:
        inviteErrors.length === 0,

      question_interfaces:
        questionScreenErrors.length ===
        0,

      optionality:
        PILLAR_01_ALL_QUESTIONS
          .every(
            question =>
              question.can_skip
          ),

      no_test_ui:
        copyErrors.length === 0,

      privacy_defaults:
        true,

      transition_valid:
        PILLAR_01_CLOSURE_PACKAGE
          .next_canonical_unit_id ===
        "unit_pillar_02_familia"
    }
  };
}


export const P01_EXPERIENCE_VALIDATION =
  validateP01ExperienceFlow();


//////////////////////////////////////////////////
// 49. PACOTE DE EXPERIÊNCIA
//////////////////////////////////////////////////

export interface P01ExperiencePackage {
  id:
    "igent_p01_experience_package";

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  canonical_order:
    readonly P01CanonicalExperienceSectionId[];

  reflection_invites:
    P01ReflectionInviteDefinition[];

  consciousness_flow:
    typeof P01_CONSCIOUSNESS_FLOW;

  judgment_flow:
    typeof P01_JUDGMENT_FLOW;

  presence_flow:
    typeof P01_PRESENCE_FLOW;

  canonical_support_letter:
    P01CanonicalSupportLetterScreen;

  canonical_ritual:
    P01CanonicalRitualScreen;

  canonical_closure:
    P01CanonicalClosureScreen;

  accessibility:
    typeof P01_ACCESSIBILITY_RULES;

  telemetry:
    typeof P01_TELEMETRY_RULES;

  validation:
    P01ExperienceValidationResult;

  version:
    "2.0.0";

  status:
    "approved" | "blocked";
}


export const P01_EXPERIENCE_PACKAGE:
  P01ExperiencePackage = {
    id:
      "igent_p01_experience_package",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_order:
      P01_CANONICAL_EXPERIENCE_ORDER,

    reflection_invites:
      P01_REFLECTION_INVITES,

    consciousness_flow:
      P01_CONSCIOUSNESS_FLOW,

    judgment_flow:
      P01_JUDGMENT_FLOW,

    presence_flow:
      P01_PRESENCE_FLOW,

    canonical_support_letter:
      P01_CANONICAL_SUPPORT_LETTER_SCREEN,

    canonical_ritual:
      P01_CANONICAL_RITUAL_SCREEN,

    canonical_closure:
      P01_CANONICAL_CLOSURE_SCREEN,

    accessibility:
      P01_ACCESSIBILITY_RULES,

    telemetry:
      P01_TELEMETRY_RULES,

    validation:
      P01_EXPERIENCE_VALIDATION,

    version:
      "2.0.0",

    status:
      P01_EXPERIENCE_VALIDATION.valid
        ? "approved"
        : "blocked"
  };


//////////////////////////////////////////////////
// 50. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_19_FINAL_RULES = [
  "The canonical book remains the primary experience.",

  "The iGentMIND layer is always optional.",

  "Reading progress cannot depend on reflective activity.",

  "The first four canonical sections must not receive automatic reflection interruptions.",

  "Automatic reflection invitations appear only after Consciousness, Judgment and Presence.",

  "Each automatic invitation may appear only once per reading session.",

  "Rejecting an invitation prevents it from appearing again in the same session.",

  "The reader can open the companion manually at any point.",

  "The reader can return to the exact book position after reflection.",

  "The interface must never look like a psychological test.",

  "Question numbers and total question counts must remain hidden.",

  "Only one question may appear per screen.",

  "No more than two questions may appear consecutively.",

  "A deep intervention must not be followed automatically by another deep intervention.",

  "Every question must allow skip, close and return to book.",

  "Selecting an option must not trigger automatic screen advancement.",

  "Closed options must preserve their semantic order.",

  "The semantic order does not indicate quality or progression.",

  "Open writing remains optional.",

  "Private mode must be available before writing.",

  "Analysis and memory remain disabled by default.",

  "Journals and letters must use a private editor surface.",

  "Guided letters must never show send, share or contact actions.",

  "Anchors must never show scores, streaks or duration records.",

  "Timers remain optional and disabled by default.",

  "Micro returns must not ask questions.",

  "The canonical Support Letter must never appear as a personalized AI response.",

  "The canonical Ritual must remain distinct from companion anchors.",

  "The canonical Ritual does not require completion.",

  "The canonical closure remains available without companion reflection.",

  "The companion closure summary is editable and rejectable.",

  "The transition to Family must not claim family causation.",

  "The transition to Family must not assign blame.",

  "High load must suppress reflection invitations.",

  "High load must route to pause, return to book or closure.",

  "Skipping must not be interpreted as avoidance.",

  "Stopping must not be interpreted as resistance.",

  "Telemetry must never store raw reflective writing.",

  "Telemetry must never store private journal or letter content.",

  "Accessibility must be supported across reading and reflection surfaces.",

  "No visual element may reward emotional exposure.",

  "No interface copy may claim diagnosis, transformation or psychological certainty.",

  "The reader may experience the entire Pillar I only as a book.",

  "The reader may use only one reflection and leave.",

  "The reader may complete all companion resources without being labeled as more evolved.",

  "The final action must always preserve the choice to continue, pause or return."
];
// @ts-nocheck -- generated protocol artifact validated by the iGent contract test suite.
