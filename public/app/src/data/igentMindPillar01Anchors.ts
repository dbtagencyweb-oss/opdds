import type { DepthLevel, PillarPhase, ReaderState } from './igentMindContract';
import type { AnchorType, CompanionAnchor as CanonicalCompanionAnchor, PillarId } from './igentMindCanonicalContent';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';

function extractAllowedAnchorEvidence(args: {
  anchor: CompanionAnchor;
  execution: CompanionAnchorExecution;
  allowed_types: CompanionAnchorExtractionType[];
  maximum_confidence: 'low';
}): CompanionAnchorExtractedEvidence[] {
  const summaryParts = [
    args.execution.private_note,
    args.execution.selected_return_phrase,
    args.execution.selected_minimum_gesture,
  ]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  if (summaryParts.length === 0) {
    return [];
  }

  const typeByAnchor: Record<AnchorType, CompanionAnchorExtractionType> = {
    observe: 'escape_signal',
    name: 'current_state',
    position: 'minimum_presence_gesture',
  };
  const type = typeByAnchor[args.anchor.type];

  if (!args.allowed_types.includes(type)) {
    return [];
  }

  return [
    {
      type,
      summary: summaryParts.join(' | '),
      confidence: args.maximum_confidence,
      primary_signal: args.anchor.compatible_primary_signals[0],
      secondary_signals: args.anchor.compatible_secondary_signals.slice(0, 2),
      pillar_specific_signals: args.anchor.compatible_pillar_signals.slice(0, 2),
      source_execution_id: args.execution.id,
    },
  ];
}

function buildNonClinicalAnchorSummary(
  anchor: CompanionAnchor,
  execution: CompanionAnchorExecution,
  evidence: CompanionAnchorExtractedEvidence[]
): string {
  return [
    `Anchor ${anchor.title}.`,
    execution.selected_return_phrase ? `Return phrase: ${execution.selected_return_phrase}.` : '',
    execution.selected_minimum_gesture ? `Minimum gesture: ${execution.selected_minimum_gesture}.` : '',
    evidence[0]?.summary ? `Reader-confirmed note: ${evidence[0].summary}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * BLOCO 16
 * PILAR I — RECONHECIMENTO
 * TRÊS ÂNCORAS COMPLEMENTARES DO iGentMIND
 *
 * Âncoras:
 * 1. Perceber a fuga;
 * 2. Nomear sem explicar;
 * 3. Ficar um pouco mais.
 *
 * Estas âncoras pertencem à camada complementar
 * do iGentMIND.
 *
 * Elas não substituem o Ritual do Reconhecimento
 * presente no livro.
 *
 * RELAÇÃO COM O RITUAL CANÔNICO:
 *
 * - Perceber a fuga:
 *   apoia Chegada e Espelhamento.
 *
 * - Nomear sem explicar:
 *   apoia Nomeação.
 *
 * - Ficar um pouco mais:
 *   apoia Permanência.
 *
 * PRINCÍPIO:
 *
 * A âncora não serve para melhorar rapidamente,
 * controlar emoções ou provar evolução.
 *
 * Ela apenas cria uma interrupção pequena entre:
 *
 * - sentir e fugir;
 * - perceber e julgar;
 * - existir e se corrigir.
 */


//////////////////////////////////////////////////
// 1. TIPOS COMPLEMENTARES
//////////////////////////////////////////////////

export type CompanionAnchorExecutionMode =
  | "silent_observation"
  | "guided_observation"
  | "sentence_completion"
  | "brief_positioning";

export type CompanionAnchorDurationType =
  | "untimed"
  | "suggested_seconds"
  | "reader_defined";

export type CompanionAnchorCompletionStatus =
  | "not_started"
  | "started"
  | "completed"
  | "stopped"
  | "skipped";

export type CompanionAnchorOutcome =
  | "signal_noticed"
  | "state_named"
  | "limit_recognized"
  | "return_phrase_selected"
  | "minimum_gesture_selected"
  | "nothing_clear"
  | "reader_stopped"
  | "reader_skipped";

export type CanonicalRitualStepCode =
  | "arrival"
  | "naming"
  | "remaining"
  | "mirroring";

export type CompanionAnchorExtractionType =
  | "escape_signal"
  | "current_state"
  | "body_signal"
  | "internal_sentence"
  | "recognized_limit"
  | "return_phrase"
  | "minimum_presence_gesture"
  | "reader_correction";

export interface CompanionAnchorCanonicalRelation {
  canonical_section_id:
    "p01_section_anchor";

  canonical_ritual_step_codes:
    CanonicalRitualStepCode[];

  relation_description: string;

  replaces_canonical_ritual: false;
}

export interface CompanionAnchorStep {
  id: string;
  order: number;

  instruction: string;

  optional: true;

  maximum_seconds?: number;
}

export interface CompanionAnchorStopRule {
  enabled: true;

  stop_when: string[];

  visible_stop_text: string;

  fallback_intervention:
    | "micro_return"
    | "pause"
    | "closure";

  fallback_content_id?: string;
}

export interface CompanionAnchorMemoryPolicy {
  storage_default: "off";

  raw_execution_storage: false;

  result_storage_requires_consent:
    true;

  phrase_storage_requires_consent:
    true;

  gesture_storage_requires_consent:
    true;

  create_pattern_from_single_execution:
    false;

  maximum_interpretation_confidence:
    "low";
}

export interface CompanionAnchorAnalysisPolicy {
  analysis_default: "off";

  explicit_consent_required:
    true;

  allowed_extractions:
    CompanionAnchorExtractionType[];

  forbidden_inferences: string[];

  maximum_interpretation_confidence:
    "low";
}

/**
 * Interface merge com CompanionAnchor,
 * definida no Bloco 08.
 */

export interface CompanionAnchor extends CanonicalCompanionAnchor {
  origin: "igent_companion";

  context: string;

  execution_mode:
    CompanionAnchorExecutionMode;

  duration_type:
    CompanionAnchorDurationType;

  suggested_seconds?: number;
  maximum_seconds?: number;

  opening_instruction: string;

  steps: CompanionAnchorStep[];

  completion_text: string;
  skip_text: string;

  canonical_relation:
    CompanionAnchorCanonicalRelation;

  stop_rule:
    CompanionAnchorStopRule;

  memory_policy:
    CompanionAnchorMemoryPolicy;

  analysis_policy:
    CompanionAnchorAnalysisPolicy;

  allow_private_execution: true;
  allow_skip: true;
  allow_stop_at_any_step: true;

  require_written_response: false;
  require_follow_up: false;

  can_be_used_standalone: true;

  maximum_uses_per_session: number;
  cooldown_interactions: number;
}


//////////////////////////////////////////////////
// 2. POLÍTICAS PADRÃO
//////////////////////////////////////////////////

export const DEFAULT_ANCHOR_MEMORY_POLICY:
  CompanionAnchorMemoryPolicy = {
    storage_default: "off",

    raw_execution_storage: false,

    result_storage_requires_consent:
      true,

    phrase_storage_requires_consent:
      true,

    gesture_storage_requires_consent:
      true,

    create_pattern_from_single_execution:
      false,

    maximum_interpretation_confidence:
      "low"
  };


export const DEFAULT_ANCHOR_ANALYSIS_POLICY:
  CompanionAnchorAnalysisPolicy = {
    analysis_default: "off",

    explicit_consent_required:
      true,

    allowed_extractions: [
      "escape_signal",
      "current_state",
      "body_signal",
      "internal_sentence",
      "recognized_limit",
      "return_phrase",
      "minimum_presence_gesture",
      "reader_correction"
    ],

    forbidden_inferences: [
      "clinical diagnosis",
      "medical interpretation",
      "trauma confirmation",
      "attachment style diagnosis",
      "permanent emotional profile",
      "origin assumption",
      "family cause assumption",
      "risk conclusion from body signal alone",
      "resistance conclusion from stopping",
      "avoidance conclusion from skipping",
      "progress conclusion from completion time"
    ],

    maximum_interpretation_confidence:
      "low"
  };


//////////////////////////////////////////////////
// 3. ÂNCORA 1
// PERCEBER A FUGA
//////////////////////////////////////////////////

export const P01_ANCHOR_OBSERVE:
  CompanionAnchor = {
    id: "p01_anchor_observe",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_anchor",

    type: "observe",

    title:
      "Perceber a fuga",

    instruction:
      "Quando surgir vontade de mudar de assunto, abrir outra tela, começar uma tarefa ou procurar uma explicação, apenas reconheça: existe uma vontade de sair deste contato.",

    semantic_goal:
      "Perceber o início da fuga antes de obedecê-la, sem impedir, condenar ou interpretar o movimento.",

    compatible_primary_signals: [
      "avoidance",
      "ambivalence",
      "uncertainty",
      "rigid_control",
      "recognition"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "emptiness_avoidance",
      "repetition_awareness",
      "pain_normalization"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "self_avoidance",
      "functioning_without_feeling",
      "return_to_self"
    ],

    maximum_load: 2,
    minimum_depth: 1,

    requires_follow_up: false,

    active: true,

    origin: "igent_companion",

    context:
      "Esta âncora não pede que você impeça a fuga. Ela apenas torna visível o momento em que o movimento começa.",

    execution_mode:
      "silent_observation",

    duration_type:
      "suggested_seconds",

    suggested_seconds: 20,
    maximum_seconds: 60,

    opening_instruction:
      "Não tente ficar mais tempo do que consegue. Apenas observe a primeira vontade de sair.",

    steps: [
      {
        id:
          "p01_anchor_observe_step_01",

        order: 1,

        instruction:
          "Pare por alguns segundos sem mudar imediatamente de atividade.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_observe_step_02",

        order: 2,

        instruction:
          "Perceba se surge vontade de abrir outra tela, explicar, resolver, levantar, trabalhar ou mudar de assunto.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_observe_step_03",

        order: 3,

        instruction:
          "Nomeie silenciosamente: vontade de fugir, vontade de resolver, vontade de me distrair ou ainda não sei.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_observe_step_04",

        order: 4,

        instruction:
          "Depois de perceber, escolha livremente permanecer mais alguns segundos ou encerrar.",

        optional: true
      }
    ],

    completion_text:
      "Você não precisava impedir o movimento. Percebê-lo antes de obedecer já criou uma pequena interrupção.",

    skip_text:
      "Você pode seguir sem fazer esta prática. Pulá-la não será interpretado como fuga.",

    canonical_relation: {
      canonical_section_id:
        "p01_section_anchor",

      canonical_ritual_step_codes: [
        "arrival",
        "mirroring"
      ],

      relation_description:
        "Apoia a Chegada e o Espelhamento ao tornar visível o início do movimento automático de saída.",

      replaces_canonical_ritual: false
    },

    stop_rule: {
      enabled: true,

      stop_when: [
        "load_level_reaches_3",
        "reader_reports_increasing_inquietude",
        "reader_feels_forced_to_remain",
        "body_attention_becomes_uncomfortable",
        "reader_requests_stop"
      ],

      visible_stop_text:
        "Pare aqui. Reconhecer que este é o seu limite também faz parte da prática.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_pres_03"
    },

    memory_policy:
      DEFAULT_ANCHOR_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_ANCHOR_ANALYSIS_POLICY,

      allowed_extractions: [
        "escape_signal",
        "recognized_limit",
        "reader_correction"
      ]
    },

    allow_private_execution: true,
    allow_skip: true,
    allow_stop_at_any_step: true,

    require_written_response: false,
    require_follow_up: false,

    can_be_used_standalone: true,

    maximum_uses_per_session: 2,
    cooldown_interactions: 4
  };


//////////////////////////////////////////////////
// 4. ÂNCORA 2
// NOMEAR SEM EXPLICAR
//////////////////////////////////////////////////

export const P01_ANCHOR_NAME:
  CompanionAnchor = {
    id: "p01_anchor_name",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_anchor",

    type: "name",

    title:
      "Nomear sem explicar",

    instruction:
      "Complete apenas: agora existe em mim... Use uma palavra, sensação ou frase curta. Não procure a origem nem tente decidir o que isso significa.",

    semantic_goal:
      "Nomear o estado presente de forma mínima, concreta e não interpretativa.",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "ambivalence",
      "minimization",
      "self_judgment"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "emptiness_avoidance",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "body_held_tension",
      "denial_of_current_state",
      "self_invisibility",
      "internalized_self_attack",
      "return_to_self"
    ],

    maximum_load: 2,
    minimum_depth: 1,

    requires_follow_up: false,

    active: true,

    origin: "igent_companion",

    context:
      "Uma palavra incompleta pode ser mais verdadeira do que uma explicação construída apenas para encerrar o desconforto.",

    execution_mode:
      "sentence_completion",

    duration_type:
      "reader_defined",

    suggested_seconds: 30,
    maximum_seconds: 90,

    opening_instruction:
      "Escolha apenas uma forma simples de nomear. Também é válido dizer que nada está claro.",

    steps: [
      {
        id:
          "p01_anchor_name_step_01",

        order: 1,

        instruction:
          "Complete silenciosamente ou por escrito: agora existe em mim...",

        optional: true,

        maximum_seconds: 30
      },

      {
        id:
          "p01_anchor_name_step_02",

        order: 2,

        instruction:
          "Use apenas uma palavra, sensação ou frase curta.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_name_step_03",

        order: 3,

        instruction:
          "Retire explicações como porque, deveria, sempre, nunca ou isso significa que.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_name_step_04",

        order: 4,

        instruction:
          "Se nada estiver claro, use: ainda não sei o nome, mas alguma coisa está presente.",

        optional: true,

        maximum_seconds: 20
      }
    ],

    completion_text:
      "Você não precisava compreender tudo. Nomear o que estava disponível já era o movimento.",

    skip_text:
      "Nenhuma palavra precisa ser encontrada agora. O silêncio também pode permanecer sem interpretação.",

    canonical_relation: {
      canonical_section_id:
        "p01_section_anchor",

      canonical_ritual_step_codes: [
        "naming"
      ],

      relation_description:
        "Apoia a etapa Nomeação do Ritual do Reconhecimento, sem reproduzir ou substituir o exercício canônico.",

      replaces_canonical_ritual: false
    },

    stop_rule: {
      enabled: true,

      stop_when: [
        "reader_begins_forcing_an_answer",
        "reader_searches_for_correct_emotion",
        "naming_turns_into_diagnosis",
        "body_attention_increases_load",
        "reader_requests_stop"
      ],

      visible_stop_text:
        "Pare de procurar a palavra certa. O que ainda não tem nome não precisa ser forçado.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_cons_05"
    },

    memory_policy:
      DEFAULT_ANCHOR_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_ANCHOR_ANALYSIS_POLICY,

      allowed_extractions: [
        "current_state",
        "body_signal",
        "internal_sentence",
        "reader_correction"
      ]
    },

    allow_private_execution: true,
    allow_skip: true,
    allow_stop_at_any_step: true,

    require_written_response: false,
    require_follow_up: false,

    can_be_used_standalone: true,

    maximum_uses_per_session: 2,
    cooldown_interactions: 4
  };


//////////////////////////////////////////////////
// 5. ÂNCORA 3
// FICAR UM POUCO MAIS
//////////////////////////////////////////////////

export const P01_ANCHOR_POSITION:
  CompanionAnchor = {
    id: "p01_anchor_position",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_anchor",

    type: "position",

    title:
      "Ficar um pouco mais",

    instruction:
      "Antes de buscar uma solução, permaneça alguns segundos e escolha uma frase ou gesto pequeno que ajude você a não se abandonar imediatamente.",

    semantic_goal:
      "Criar um posicionamento mínimo de presença sem exigir permanência prolongada, melhora emocional ou compromisso definitivo.",

    compatible_primary_signals: [
      "recognition",
      "ambivalence",
      "integration",
      "uncertainty",
      "rigid_control"
    ],

    compatible_secondary_signals: [
      "coherent_positioning",
      "repetition_awareness",
      "control_through_performance",
      "silence_to_preserve_bond"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "automatic_escape",
      "internalized_self_attack",
      "performance_to_belong",
      "self_invisibility"
    ],

    maximum_load: 2,
    minimum_depth: 2,

    requires_follow_up: false,

    active: true,

    origin: "igent_companion",

    context:
      "Ficar um pouco mais não significa suportar até o limite. Significa apenas não sair no mesmo instante em que o estado aparece.",

    execution_mode:
      "brief_positioning",

    duration_type:
      "suggested_seconds",

    suggested_seconds: 30,
    maximum_seconds: 90,

    opening_instruction:
      "Escolha um intervalo pequeno. Termine enquanto a prática ainda parecer possível.",

    steps: [
      {
        id:
          "p01_anchor_position_step_01",

        order: 1,

        instruction:
          "Perceba o estado e a primeira vontade de sair dele.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_position_step_02",

        order: 2,

        instruction:
          "Permaneça apenas alguns segundos além do impulso inicial, sem se obrigar a continuar.",

        optional: true,

        maximum_seconds: 30
      },

      {
        id:
          "p01_anchor_position_step_03",

        order: 3,

        instruction:
          "Escolha uma frase verdadeira, como: eu estou aqui; eu não preciso me explicar agora; eu posso sentir isso sem resolver hoje.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_position_step_04",

        order: 4,

        instruction:
          "Escolha um gesto mínimo: respirar sem corrigir, apoiar os pés, permanecer sentado, fechar outra tela ou simplesmente não decidir agora.",

        optional: true,

        maximum_seconds: 20
      },

      {
        id:
          "p01_anchor_position_step_05",

        order: 5,

        instruction:
          "Encerre sem avaliar se realizou bem ou mal.",

        optional: true
      }
    ],

    completion_text:
      "A prática não precisava produzir melhora. Seu único movimento foi permanecer sem se abandonar imediatamente.",

    skip_text:
      "Você pode encerrar sem escolher uma frase ou gesto. Não encontrar uma forma possível também é informação.",

    canonical_relation: {
      canonical_section_id:
        "p01_section_anchor",

      canonical_ritual_step_codes: [
        "remaining",
        "mirroring"
      ],

      relation_description:
        "Apoia Permanência e Espelhamento ao criar um breve intervalo de contato sem exigir controle do estado.",

      replaces_canonical_ritual: false
    },

    stop_rule: {
      enabled: true,

      stop_when: [
        "load_level_reaches_3",
        "state_intensifies",
        "reader_feels_required_to_endure",
        "practice_becomes_performance",
        "reader_creates_perfection_rule",
        "reader_requests_stop"
      ],

      visible_stop_text:
        "Encerre agora. Permanecer não significa aguentar além do que é possível.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_pres_03"
    },

    memory_policy:
      DEFAULT_ANCHOR_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_ANCHOR_ANALYSIS_POLICY,

      allowed_extractions: [
        "recognized_limit",
        "return_phrase",
        "minimum_presence_gesture",
        "reader_correction"
      ]
    },

    allow_private_execution: true,
    allow_skip: true,
    allow_stop_at_any_step: true,

    require_written_response: false,
    require_follow_up: false,

    can_be_used_standalone: true,

    maximum_uses_per_session: 2,
    cooldown_interactions: 5
  };


//////////////////////////////////////////////////
// 6. PACOTE DAS TRÊS ÂNCORAS
//////////////////////////////////////////////////

export const PILLAR_01_COMPANION_ANCHORS:
  CompanionAnchor[] = [
    P01_ANCHOR_OBSERVE,
    P01_ANCHOR_NAME,
    P01_ANCHOR_POSITION
  ];


//////////////////////////////////////////////////
// 7. EXECUÇÃO
//////////////////////////////////////////////////

export interface CompanionAnchorExecution {
  id: string;

  reader_id: string;

  anchor_id: string;
  pillar_id: PillarId;

  status:
    CompanionAnchorCompletionStatus;

  started_at?: string;
  completed_at?: string;
  stopped_at?: string;
  skipped_at?: string;

  duration_seconds?: number;

  completed_step_ids: string[];

  outcome?:
    CompanionAnchorOutcome;

  private_note?: string;

  analysis_consent: boolean;
  memory_consent: boolean;

  selected_return_phrase?: string;
  selected_minimum_gesture?: string;

  load_before?: ScaleLevel;
  load_after?: ScaleLevel;
}


//////////////////////////////////////////////////
// 8. RESULTADO DA ÂNCORA
//////////////////////////////////////////////////

export interface CompanionAnchorExtractedEvidence {
  type:
    CompanionAnchorExtractionType;

  summary: string;

  confidence: "low";

  primary_signal?: PrimarySignal;

  secondary_signals:
    SecondarySignal[];

  pillar_specific_signals:
    string[];

  source_execution_id: string;
}

export interface CompanionAnchorMemoryCandidate {
  layer:
    | "session"
    | "pillar";

  summary: string;

  selected_return_phrase?: string;
  selected_minimum_gesture?: string;

  confidence: "low";

  requires_reader_confirmation:
    true;
}

export interface CompanionAnchorExecutionResult {
  execution_id: string;
  anchor_id: string;

  completed: boolean;
  stopped: boolean;
  skipped: boolean;

  outcome:
    CompanionAnchorOutcome;

  extracted_evidence:
    CompanionAnchorExtractedEvidence[];

  possible_memory_candidate?:
    CompanionAnchorMemoryCandidate;

  load_increased: boolean;

  next_intervention:
    | "continue"
    | "micro_return"
    | "pause"
    | "closure";

  next_content_id?: string;

  validation_errors: string[];
}


//////////////////////////////////////////////////
// 9. PROCESSAMENTO DA EXECUÇÃO
//////////////////////////////////////////////////

export function processAnchorExecution(
  anchor: CompanionAnchor,
  execution: CompanionAnchorExecution
): CompanionAnchorExecutionResult {
  const errors: string[] = [];

  if (
    execution.status === "skipped"
  ) {
    return {
      execution_id: execution.id,
      anchor_id: anchor.id,

      completed: false,
      stopped: false,
      skipped: true,

      outcome: "reader_skipped",

      extracted_evidence: [],

      load_increased: false,

      next_intervention: "continue",

      validation_errors: []
    };
  }

  const loadIncreased =
    typeof execution.load_before ===
      "number" &&
    typeof execution.load_after ===
      "number" &&
    execution.load_after >
      execution.load_before;

  if (
    execution.status === "stopped" ||
    loadIncreased
  ) {
    return {
      execution_id: execution.id,
      anchor_id: anchor.id,

      completed: false,
      stopped: true,
      skipped: false,

      outcome: "reader_stopped",

      extracted_evidence: [],

      load_increased:
        loadIncreased,

      next_intervention:
        loadIncreased
          ? "pause"
          : anchor.stop_rule
              .fallback_intervention,

      next_content_id:
        anchor.stop_rule
          .fallback_content_id,

      validation_errors: []
    };
  }

  const evidence =
    execution.analysis_consent
      ? extractAllowedAnchorEvidence({
          anchor,
          execution,

          allowed_types:
            anchor.analysis_policy
              .allowed_extractions,

          maximum_confidence:
            "low"
        })
      : [];

  const memoryCandidate =
    execution.memory_consent
      ? buildAnchorMemoryCandidate(
          anchor,
          execution,
          evidence
        )
      : undefined;

  return {
    execution_id: execution.id,
    anchor_id: anchor.id,

    completed:
      execution.status ===
      "completed",

    stopped: false,
    skipped: false,

    outcome:
      determineAnchorOutcome(
        anchor,
        execution,
        evidence
      ),

    extracted_evidence:
      evidence,

    possible_memory_candidate:
      memoryCandidate,

    load_increased: false,

    next_intervention:
      "continue",

    validation_errors:
      errors
  };
}


//////////////////////////////////////////////////
// 10. MEMÓRIA
//////////////////////////////////////////////////

export function buildAnchorMemoryCandidate(
  anchor: CompanionAnchor,
  execution: CompanionAnchorExecution,
  evidence: CompanionAnchorExtractedEvidence[]
): CompanionAnchorMemoryCandidate | undefined {
  if (
    !execution.memory_consent
  ) {
    return undefined;
  }

  if (
    !execution.selected_return_phrase &&
    !execution.selected_minimum_gesture &&
    evidence.length === 0
  ) {
    return undefined;
  }

  return {
    layer: "pillar",

    summary:
      buildNonClinicalAnchorSummary(
        anchor,
        execution,
        evidence
      ),

    selected_return_phrase:
      execution.selected_return_phrase,

    selected_minimum_gesture:
      execution.selected_minimum_gesture,

    confidence: "low",

    requires_reader_confirmation:
      true
  };
}

/**
 * Uma única execução não pode criar:
 *
 * - padrão de fuga;
 * - capacidade permanente;
 * - progresso comprovado;
 * - hábito consolidado;
 * - integração definitiva;
 * - perfil comportamental.
 */


//////////////////////////////////////////////////
// 11. SELEÇÃO DA ÂNCORA
//////////////////////////////////////////////////

export interface CompanionAnchorSelectionContext {
  pillar_id: PillarId;
  phase: PillarPhase;

  reader_state: ReaderState;

  primary_signal?: PrimarySignal;

  secondary_signals:
    SecondarySignal[];

  pillar_specific_signals:
    string[];

  load_level: ScaleLevel;
  depth_level: DepthLevel;

  recent_anchor_ids:
    string[];

  interaction_index: number;

  recent_anchor_usage:
    CompanionAnchorUsage[];

  reader_requested_anchor:
    boolean;

  reader_rejected_anchor:
    boolean;
}


export interface CompanionAnchorUsage {
  anchor_id: string;
  interaction_index: number;
  completed: boolean;
}


export function isCompanionAnchorAvailable(
  anchor: CompanionAnchor,
  context: CompanionAnchorSelectionContext
): boolean {
  if (!anchor.active) {
    return false;
  }

  if (
    anchor.pillar_id !==
    context.pillar_id
  ) {
    return false;
  }

  if (
    context.load_level >
    anchor.maximum_load
  ) {
    return false;
  }

  if (
    context.depth_level <
    anchor.minimum_depth
  ) {
    return false;
  }

  if (
    context.reader_rejected_anchor
  ) {
    return false;
  }

  const anchorUsages =
    context.recent_anchor_usage
      .filter(
        usage =>
          usage.anchor_id ===
          anchor.id
      );

  if (
    anchorUsages.length >=
    anchor.maximum_uses_per_session
  ) {
    return false;
  }

  const lastUsage =
    anchorUsages.at(-1);

  if (lastUsage) {
    const distance =
      context.interaction_index -
      lastUsage.interaction_index;

    if (
      distance <
      anchor.cooldown_interactions
    ) {
      return false;
    }
  }

  return true;
}


export function scoreCompanionAnchor(
  anchor: CompanionAnchor,
  context: CompanionAnchorSelectionContext
): number {
  let score = 0;

  if (
    context.reader_requested_anchor
  ) {
    score += 100;
  }

  if (
    context.primary_signal &&
    anchor.compatible_primary_signals
      .includes(context.primary_signal)
  ) {
    score += 30;
  }

  const secondaryMatches =
    context.secondary_signals
      .filter(
        signal =>
          anchor
            .compatible_secondary_signals
            .includes(signal)
      ).length;

  score += secondaryMatches * 12;

  const pillarMatches =
    context.pillar_specific_signals
      .filter(
        signal =>
          anchor
            .compatible_pillar_signals
            .includes(signal)
      ).length;

  score += pillarMatches * 15;

  if (
    context.primary_signal ===
      "avoidance" &&
    anchor.type === "observe"
  ) {
    score += 35;
  }

  if (
    context.primary_signal ===
      "uncertainty" &&
    anchor.type === "name"
  ) {
    score += 30;
  }

  if (
    context.primary_signal ===
      "integration" &&
    anchor.type === "position"
  ) {
    score += 35;
  }

  if (
    context.pillar_specific_signals
      .includes("body_held_tension") &&
    anchor.type === "name"
  ) {
    score += 20;
  }

  if (
    context.pillar_specific_signals
      .includes("automatic_escape") &&
    anchor.type === "observe"
  ) {
    score += 25;
  }

  if (
    context.pillar_specific_signals
      .includes("return_to_self") &&
    anchor.type === "position"
  ) {
    score += 25;
  }

  if (
    context.reader_state ===
      "defensive" &&
    anchor.type === "position"
  ) {
    score -= 30;
  }

  if (
    context.load_level === 2 &&
    anchor.type === "position"
  ) {
    score -= 15;
  }

  return score;
}


export function selectPillar01Anchor(
  context: CompanionAnchorSelectionContext
): CompanionAnchor | null {
  const candidates =
    PILLAR_01_COMPANION_ANCHORS
      .filter(
        anchor =>
          isCompanionAnchorAvailable(
            anchor,
            context
          )
      )
      .map(anchor => ({
        anchor,

        score:
          scoreCompanionAnchor(
            anchor,
            context
          )
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  return candidates[0]?.anchor ?? null;
}


//////////////////////////////////////////////////
// 12. ROTEAMENTO DIRETO
//////////////////////////////////////////////////

export const PILLAR_01_ANCHOR_ROUTING = {
  automatic_escape:
    "p01_anchor_observe",

  self_avoidance:
    "p01_anchor_observe",

  functioning_without_feeling:
    "p01_anchor_observe",

  body_held_tension:
    "p01_anchor_name",

  denial_of_current_state:
    "p01_anchor_name",

  internalized_self_attack:
    "p01_anchor_name",

  return_to_self:
    "p01_anchor_position",

  performance_to_belong:
    "p01_anchor_position",

  coherent_positioning:
    "p01_anchor_position"
} as const;


//////////////////////////////////////////////////
// 13. FALLBACK SEM ÂNCORA
//////////////////////////////////////////////////

export interface CompanionAnchorFallbackDecision {
  intervention:
    | "micro_return"
    | "pause"
    | "closure"
    | "continue";

  content_id?: string;
}


export function selectAnchorFallback(
  context: CompanionAnchorSelectionContext
): CompanionAnchorFallbackDecision {
  if (
    context.load_level >= 3
  ) {
    return {
      intervention: "pause"
    };
  }

  if (
    context.phase ===
    "consciousness"
  ) {
    return {
      intervention:
        "micro_return",

      content_id:
        "p01_mr_cons_05"
    };
  }

  if (
    context.phase ===
    "judgment"
  ) {
    return {
      intervention:
        "micro_return",

      content_id:
        "p01_mr_judg_06"
    };
  }

  if (
    context.phase ===
    "presence"
  ) {
    return {
      intervention:
        "micro_return",

      content_id:
        "p01_mr_pres_06"
    };
  }

  return {
    intervention: "continue"
  };
}


//////////////////////////////////////////////////
// 14. APRESENTAÇÃO VISÍVEL
//////////////////////////////////////////////////

export interface CompanionAnchorVisibleCard {
  id: string;

  title: string;
  context: string;

  opening_instruction:
    string;

  steps:
    CompanionAnchorStep[];

  suggested_seconds?: number;
  maximum_seconds?: number;

  completion_text: string;
  skip_text: string;

  show_start_button: true;
  show_skip_button: true;
  show_stop_button: true;

  show_timer: boolean;
  timer_is_optional: true;

  show_progress_bar: false;
  show_score: false;
  show_streak: false;
  show_reward: false;
}


export function buildAnchorVisibleCard(
  anchor: CompanionAnchor
): CompanionAnchorVisibleCard {
  return {
    id: anchor.id,

    title: anchor.title,
    context: anchor.context,

    opening_instruction:
      anchor.opening_instruction,

    steps:
      anchor.steps,

    suggested_seconds:
      anchor.suggested_seconds,

    maximum_seconds:
      anchor.maximum_seconds,

    completion_text:
      anchor.completion_text,

    skip_text:
      anchor.skip_text,

    show_start_button: true,
    show_skip_button: true,
    show_stop_button: true,

    show_timer:
      anchor.duration_type ===
      "suggested_seconds",

    timer_is_optional: true,

    show_progress_bar: false,
    show_score: false,
    show_streak: false,
    show_reward: false
  };
}


//////////////////////////////////////////////////
// 15. REGRAS DE INTERFACE
//////////////////////////////////////////////////

export const COMPANION_ANCHOR_DISPLAY_RULES = {
  show_one_step_at_a_time:
    true,

  allow_view_all_steps:
    true,

  timer_default:
    "off",

  timer_must_never_count_up:
    true,

  timer_must_never_show_record:
    true,

  allow_manual_completion:
    true,

  allow_stop_without_reason:
    true,

  allow_skip_without_reason:
    true,

  show_analysis_toggle:
    false,

  show_memory_toggle_after_completion:
    true,

  memory_toggle_default:
    false,

  never_show_completion_percentage:
    true,

  never_show_emotional_score:
    true,

  never_show_consistency_score:
    true,

  never_show_streak:
    true,

  never_show_badge:
    true,

  never_show_comparison:
    true,

  never_show_best_time:
    true,

  never_reward_longer_duration:
    true,

  never_penalize_early_stop:
    true
};


//////////////////////////////////////////////////
// 16. CONTROLE DE REPETIÇÃO
//////////////////////////////////////////////////

export const COMPANION_ANCHOR_REUSE_RULES = {
  maximum_anchors_per_session: 3,

  maximum_same_anchor_per_session: 2,

  never_repeat_consecutively: true,

  minimum_interactions_between_same_anchor: 4,

  never_auto_repeat_after_stop: true,

  never_auto_repeat_after_skip: true,

  do_not_schedule_as_notification: true,

  do_not_create_daily_streak: true,

  do_not_require_daily_completion: true,

  do_not_mark_as_incomplete_task: true
};


//////////////////////////////////////////////////
// 17. CONCLUSÃO DA ÂNCORA
//////////////////////////////////////////////////

export function determineAnchorOutcome(
  anchor: CompanionAnchor,
  execution: CompanionAnchorExecution,
  evidence: CompanionAnchorExtractedEvidence[]
): CompanionAnchorOutcome {
  if (
    execution.status === "skipped"
  ) {
    return "reader_skipped";
  }

  if (
    execution.status === "stopped"
  ) {
    return "reader_stopped";
  }

  if (
    execution.selected_return_phrase
  ) {
    return "return_phrase_selected";
  }

  if (
    execution.selected_minimum_gesture
  ) {
    return "minimum_gesture_selected";
  }

  if (
    evidence.some(
      item =>
        item.type ===
        "escape_signal"
    )
  ) {
    return "signal_noticed";
  }

  if (
    evidence.some(
      item =>
        item.type ===
        "current_state"
    )
  ) {
    return "state_named";
  }

  if (
    evidence.some(
      item =>
        item.type ===
        "recognized_limit"
    )
  ) {
    return "limit_recognized";
  }

  return "nothing_clear";
}


//////////////////////////////////////////////////
// 18. VALIDAÇÃO INDIVIDUAL
//////////////////////////////////////////////////

export function validateCompanionAnchor(
  anchor: CompanionAnchor
): string[] {
  const errors: string[] = [];

  if (!anchor.title.trim()) {
    errors.push(
      `${anchor.id} requires title.`
    );
  }

  if (!anchor.instruction.trim()) {
    errors.push(
      `${anchor.id} requires instruction.`
    );
  }

  if (
    anchor.origin !==
    "igent_companion"
  ) {
    errors.push(
      `${anchor.id} must belong to the companion layer.`
    );
  }

  if (
    anchor.maximum_load > 2
  ) {
    errors.push(
      `${anchor.id} cannot be available above load level 2.`
    );
  }

  if (
    !anchor.allow_skip
  ) {
    errors.push(
      `${anchor.id} must allow skip.`
    );
  }

  if (
    !anchor.allow_stop_at_any_step
  ) {
    errors.push(
      `${anchor.id} must allow stopping at any step.`
    );
  }

  if (
    anchor.require_written_response
  ) {
    errors.push(
      `${anchor.id} cannot require written response.`
    );
  }

  if (
    anchor.require_follow_up
  ) {
    errors.push(
      `${anchor.id} cannot require follow-up.`
    );
  }

  if (
    anchor.canonical_relation
      .replaces_canonical_ritual
  ) {
    errors.push(
      `${anchor.id} cannot replace the canonical ritual.`
    );
  }

  if (
    anchor.memory_policy
      .storage_default !== "off"
  ) {
    errors.push(
      `${anchor.id} memory must be disabled by default.`
    );
  }

  if (
    anchor.memory_policy
      .create_pattern_from_single_execution
  ) {
    errors.push(
      `${anchor.id} cannot create a pattern from one execution.`
    );
  }

  if (
    anchor.duration_type ===
      "suggested_seconds" &&
    !anchor.suggested_seconds
  ) {
    errors.push(
      `${anchor.id} requires suggested seconds.`
    );
  }

  if (
    anchor.maximum_seconds &&
    anchor.maximum_seconds > 90
  ) {
    errors.push(
      `${anchor.id} cannot exceed 90 seconds.`
    );
  }

  if (
    anchor.maximum_uses_per_session >
    2
  ) {
    errors.push(
      `${anchor.id} can be used at most twice per session.`
    );
  }

  if (
    anchor.cooldown_interactions < 4
  ) {
    errors.push(
      `${anchor.id} requires at least four cooldown interactions.`
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 19. VALIDAÇÃO DO PACOTE
//////////////////////////////////////////////////

export function validatePillar01Anchors(
  anchors: CompanionAnchor[]
): string[] {
  const errors: string[] = [];

  if (
    anchors.length !== 3
  ) {
    errors.push(
      "Pillar I must contain exactly 3 companion anchors."
    );
  }

  const requiredTypes:
    AnchorType[] = [
      "observe",
      "name",
      "position"
    ];

  for (
    const requiredType
    of requiredTypes
  ) {
    const matches =
      anchors.filter(
        anchor =>
          anchor.type ===
          requiredType
      );

    if (
      matches.length !== 1
    ) {
      errors.push(
        `Pillar I requires exactly one ${requiredType} anchor.`
      );
    }
  }

  const ids =
    anchors.map(
      anchor =>
        anchor.id
    );

  if (
    new Set(ids).size !==
    ids.length
  ) {
    errors.push(
      "Companion anchor IDs must be unique."
    );
  }

  for (const anchor of anchors) {
    errors.push(
      ...validateCompanionAnchor(
        anchor
      )
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 20. PACOTE PUBLICÁVEL
//////////////////////////////////////////////////

export interface Pillar01CompanionAnchorPackage {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  canonical_anchor_section_id:
    "p01_section_anchor";

  anchors:
    CompanionAnchor[];

  validation_errors:
    string[];

  version: string;

  status:
    | "draft"
    | "review"
    | "approved"
    | "published";
}


export const PILLAR_01_COMPANION_ANCHOR_PACKAGE:
  Pillar01CompanionAnchorPackage = {
    id:
      "igent_p01_companion_anchor_package",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_anchor_section_id:
      "p01_section_anchor",

    anchors:
      PILLAR_01_COMPANION_ANCHORS,

    validation_errors:
      validatePillar01Anchors(
        PILLAR_01_COMPANION_ANCHORS
      ),

    version: "2.0.0",

    status: "approved"
  };


//////////////////////////////////////////////////
// 21. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_16_FINAL_RULES = [
  "All companion anchors belong to the iGent companion layer.",

  "Companion anchors must never be presented as the canonical Ritual of Recognition.",

  "Pillar I contains exactly three companion anchors: observe, name and position.",

  "Every anchor is optional.",

  "Every anchor may be stopped at any step.",

  "Every anchor may be skipped without explanation.",

  "Skipping must not be interpreted as avoidance.",

  "Stopping must not be interpreted as resistance.",

  "No anchor may require a written response.",

  "No anchor may require follow-up.",

  "No anchor may exceed ninety seconds.",

  "Duration must never be scored.",

  "Longer duration must never be rewarded.",

  "Early stopping must never be penalized.",

  "Anchors must not create streaks, badges or performance scores.",

  "An anchor must not become a daily obligation.",

  "Perceiving escape does not require preventing escape.",

  "Naming does not require explaining.",

  "Remaining does not mean enduring until the limit.",

  "A return phrase must be simple, true and non-motivational.",

  "Silence is a valid alternative to a return phrase.",

  "A minimum gesture is a possibility, not a promise.",

  "One execution cannot create a recurring pattern.",

  "Memory is disabled by default.",

  "Memory requires explicit consent.",

  "The raw execution is never stored.",

  "Body signals must never be interpreted clinically.",

  "When the practice increases load, the engine must stop the anchor.",

  "When the practice becomes performance, the engine must interrupt it.",

  "When the reader reaches a sufficient point, the agent must not ask for more.",

  "The canonical Ritual of Recognition remains available independently after the companion anchor."
];

export const PILLAR_01_ANCHORS = PILLAR_01_COMPANION_ANCHORS;
export const PILLAR_01_ANCHOR_PACKAGE = PILLAR_01_COMPANION_ANCHOR_PACKAGE;
export const ANCHOR_DISPLAY_RULES = COMPANION_ANCHOR_DISPLAY_RULES;
export const ANCHOR_REUSE_RULES = COMPANION_ANCHOR_REUSE_RULES;
export const PILLAR_01_ANCHOR_IDS = PILLAR_01_COMPANION_ANCHORS.map((anchor) => anchor.id);
