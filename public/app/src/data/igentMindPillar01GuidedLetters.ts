import type { DepthLevel, PillarPhase, ReaderState } from './igentMindContract';
import type { PillarId } from './igentMindCanonicalContent';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';
import type { CompanionGuidedLetter as BaseCompanionGuidedLetter, GuidedLetterType } from './igentMindCanonicalContent';

type InterpretationConfidence = 'low' | 'medium' | 'high';

export type GuidedLetterCompletionMode =
  | 'guided_sections'
  | 'free_letter'
  | 'sentence_sequence';

export type GuidedLetterPrivacyMode =
  | 'private'
  | 'analyze_once'
  | 'analyze_and_remember';

export type GuidedLetterRecipientType =
  | 'part_of_self'
  | 'internal_voice'
  | 'past_self'
  | 'present_self'
  | 'life_period'
  | 'internal_rule'
  | 'symbolic_recipient';

export type GuidedLetterExtractionType =
  | 'addressed_part'
  | 'acknowledged_state'
  | 'ignored_need'
  | 'internal_sentence'
  | 'internal_rule'
  | 'protection_function'
  | 'perceived_cost'
  | 'boundary_statement'
  | 'return_phrase'
  | 'minimum_presence_gesture'
  | 'reader_correction'
  | 'meaningful_excerpt';

export type GuidedLetterCanonicalRelationType =
  | 'supports_consciousness'
  | 'supports_judgment'
  | 'supports_presence'
  | 'supports_support_letter'
  | 'supports_closure';

export interface GuidedLetterCanonicalRelation {
  canonical_section_ids: string[];
  relation_type: GuidedLetterCanonicalRelationType;
  description: string;
}

export interface GuidedLetterSection {
  id: string;
  order: number;
  title: string;
  instruction: string;
  starter_lines: string[];
  optional: true;
}

export interface GuidedLetterDeliveryPolicy {
  never_prompt_to_send: true;
  never_offer_recipient_delivery: true;
  never_generate_contact_action: true;
  never_suggest_real_confrontation: true;
  may_be_saved_privately: boolean;
  may_be_deleted: true;
  may_be_exported_by_reader: boolean;
  visible_notice: string;
}

export interface GuidedLetterMemoryPolicy {
  storage_default: 'off';
  raw_text_storage_requires_consent: true;
  derived_summary_requires_consent: true;
  exact_excerpt_requires_consent: true;
  allow_raw_text_recall: false;
  allow_derived_summary_recall: boolean;
  allow_exact_excerpt_recall: false;
  maximum_saved_excerpts: number;
  maximum_excerpt_characters: number;
  create_pattern_from_single_letter: false;
  sensitivity: 'sensitive';
}

export interface GuidedLetterAnalysisPolicy {
  analysis_default: 'off';
  explicit_consent_required: true;
  allowed_extractions: GuidedLetterExtractionType[];
  forbidden_inferences: string[];
  maximum_interpretation_confidence: 'low' | 'medium';
  allow_open_thread_candidate: boolean;
  require_reader_confirmation_for_memory: true;
}

export interface GuidedLetterStopRule {
  enabled: true;
  conditions: string[];
  visible_instruction: string;
  fallback_intervention: 'micro_return' | 'anchor' | 'pause' | 'closure';
  fallback_content_id?: string;
}

export type CompanionGuidedLetter = BaseCompanionGuidedLetter & {
  origin: 'igent_companion';
  completion_mode: GuidedLetterCompletionMode;
  allowed_recipient_types: GuidedLetterRecipientType[];
  sections: GuidedLetterSection[];
  canonical_relation: GuidedLetterCanonicalRelation;
  delivery_policy: GuidedLetterDeliveryPolicy;
  memory_policy: GuidedLetterMemoryPolicy;
  analysis_policy: GuidedLetterAnalysisPolicy;
  stop_rule: GuidedLetterStopRule;
  estimated_minutes: number;
  minimum_characters: 0;
  maximum_characters: number;
  allow_empty_submission: true;
  allow_delete_after_writing: true;
  allow_skip: true;
  allow_private_mode: true;
  analyze_by_default: false;
};

const assessSafetyFromGuidedLetter = (content: string) => ({
  level: /suic[i?]dio|me matar|autoagress[a?]o|n?o quero viver/i.test(content) ? 2 : 0,
});

const detectExternalDeliveryIntent = (content: string) => ({
  plans_real_confrontation: /vou confrontar|vou mandar|vou enviar|preciso falar com/i.test(content),
  plans_immediate_sending: /vou enviar agora|mandar agora|enviar para/i.test(content),
});

const extractAllowedGuidedLetterEvidence = (_input: {
  content: string;
  allowed_types: GuidedLetterExtractionType[];
  forbidden_inferences: string[];
  maximum_confidence: 'low' | 'medium';
}): GuidedLetterExtractedEvidence[] => [];

const buildNonClinicalLetterSummary = (_letter: CompanionGuidedLetter, _evidence: GuidedLetterExtractedEvidence[]) => 'Carta guiada privada sem infer?ncia cl?nica.';
const uniquePrimarySignals = (evidence: GuidedLetterExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.primary_signal ? [item.primary_signal] : [])));
const uniqueSecondarySignals = (evidence: GuidedLetterExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.secondary_signals)));
const uniquePillarSignals = (evidence: GuidedLetterExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.pillar_specific_signals)));
const calculateGuidedLetterEvidenceConfidence = (evidence: GuidedLetterExtractedEvidence[]): InterpretationConfidence => evidence.some((item) => item.confidence === 'medium') ? 'medium' : 'low';
const buildGuidedLetterThreadTitle = (type: GuidedLetterType, _evidence: GuidedLetterExtractedEvidence[]) => 'Carta de ' + type;
const buildGuidedLetterThreadSummary = (_evidence: GuidedLetterExtractedEvidence[]) => 'Fio aberto criado a partir de carta guiada, pendente de confirma??o do leitor.';
const selectGuidedLetterRevisitCondition = (type: GuidedLetterType) => type === 'presence' ? 'quando o leitor quiser revisar o gesto de retorno' : 'quando o tema reaparecer na leitura';

export const DEFAULT_GUIDED_LETTER_DELIVERY_POLICY:
  GuidedLetterDeliveryPolicy = {
    never_prompt_to_send: true,
    never_offer_recipient_delivery: true,
    never_generate_contact_action: true,
    never_suggest_real_confrontation: true,

    may_be_saved_privately: true,
    may_be_deleted: true,
    may_be_exported_by_reader: true,

    visible_notice:
      "Esta carta é um registro privado. Ela não precisa ser enviada, mostrada ou transformada em conversa real."
  };


export const DEFAULT_GUIDED_LETTER_MEMORY_POLICY:
  GuidedLetterMemoryPolicy = {
    storage_default: "off",

    raw_text_storage_requires_consent: true,
    derived_summary_requires_consent: true,
    exact_excerpt_requires_consent: true,

    allow_raw_text_recall: false,
    allow_derived_summary_recall: true,
    allow_exact_excerpt_recall: false,

    maximum_saved_excerpts: 0,
    maximum_excerpt_characters: 0,

    create_pattern_from_single_letter: false,

    sensitivity: "sensitive"
  };


export const DEFAULT_GUIDED_LETTER_ANALYSIS_POLICY:
  GuidedLetterAnalysisPolicy = {
    analysis_default: "off",
    explicit_consent_required: true,

    allowed_extractions: [
      "addressed_part",
      "acknowledged_state",
      "ignored_need",
      "internal_sentence",
      "internal_rule",
      "protection_function",
      "perceived_cost",
      "boundary_statement",
      "return_phrase",
      "minimum_presence_gesture",
      "reader_correction"
    ],

    forbidden_inferences: [
      "clinical diagnosis",
      "trauma confirmation",
      "abandonment diagnosis",
      "attachment style diagnosis",
      "personality disorder",
      "mental health condition",
      "family guilt assignment",
      "permanent emotional identity",
      "hidden memory reconstruction",
      "intent attributed to another person",
      "relationship safety conclusion without evidence",
      "recommendation to confront a real person",
      "recommendation to send the letter"
    ],

    maximum_interpretation_confidence:
      "medium",

    allow_open_thread_candidate:
      true,

    require_reader_confirmation_for_memory:
      true
  };


//////////////////////////////////////////////////
// 3. CARTA 1 — RECONHECIMENTO
// À PARTE DE MIM QUE FICOU ESPERANDO
//////////////////////////////////////////////////

export const P01_LETTER_RECOGNITION:
  CompanionGuidedLetter = {
    id: "p01_letter_recognition",

    pillar_id:
      "pillar_01_reconhecimento",

    type: "recognition",

    title:
      "À parte de mim que ficou esperando",

    purpose:
      "Reconhecer um estado, necessidade ou parte de si que permaneceu ignorada enquanto o leitor continuava funcionando.",

    recipient_instruction:
      "Escreva para uma parte de você, uma versão anterior, um período da vida ou um estado interno que permaneceu sem espaço.",

    introduction:
      "Esta carta não procura reconstruir toda a história. Ela apenas oferece linguagem ao que permaneceu esperando reconhecimento.",

    starter_lines: [
      "Eu percebo que você está aqui...",
      "Durante muito tempo, eu tentei não olhar para...",
      "O que eu consigo admitir agora é..."
    ],

    closing_instruction:
      "Encerre reconhecendo apenas o que consegue sustentar hoje. Não prometa reparar tudo.",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "avoidance",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "emptiness_avoidance",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "self_avoidance",
      "denial_of_current_state",
      "self_invisibility",
      "body_held_tension",
      "return_to_self"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 2,

    allow_symbolic_recipient: true,
    remind_not_to_send: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "guided_sections",

    allowed_recipient_types: [
      "part_of_self",
      "past_self",
      "present_self",
      "life_period",
      "symbolic_recipient"
    ],

    sections: [
      {
        id:
          "p01_letter_recognition_section_01",

        order: 1,

        title:
          "Eu percebo",

        instruction:
          "Nomeie o que consegue reconhecer agora, sem explicar sua origem.",

        starter_lines: [
          "Eu percebo que...",
          "Agora consigo admitir...",
          "Você esteve presente quando..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_recognition_section_02",

        order: 2,

        title:
          "Eu não consegui olhar",

        instruction:
          "Reconheça como você evitou, reduziu ou adiou esse contato.",

        starter_lines: [
          "Eu tentei não olhar porque...",
          "Continuar funcionando parecia...",
          "Eu tratei isso como..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_recognition_section_03",

        order: 3,

        title:
          "O que precisava de espaço",

        instruction:
          "Nomeie o estado ou necessidade sem transformar isso em fraqueza.",

        starter_lines: [
          "O que precisava de espaço era...",
          "O que eu não consegui admitir foi...",
          "Talvez você estivesse tentando mostrar..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_recognition_section_04",

        order: 4,

        title:
          "O que é possível agora",

        instruction:
          "Defina apenas uma forma mínima de reconhecimento para o presente.",

        starter_lines: [
          "Hoje eu consigo apenas...",
          "Não prometo resolver, mas posso...",
          "Por enquanto, eu reconheço..."
        ],

        optional: true
      }
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_consciousness",
        "p01_section_support_letter"
      ],

      relation_type:
        "supports_consciousness",

      description:
        "Apoia o movimento de reconhecer o estado ignorado e pode preparar a leitura da Carta de Sustentação, sem substituí-la."
    },

    delivery_policy:
      DEFAULT_GUIDED_LETTER_DELIVERY_POLICY,

    memory_policy:
      DEFAULT_GUIDED_LETTER_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_GUIDED_LETTER_ANALYSIS_POLICY,

      allowed_extractions: [
        "addressed_part",
        "acknowledged_state",
        "ignored_need",
        "escape_movement",
        "minimum_presence_gesture",
        "reader_correction"
      ].filter(
        (
          value
        ): value is GuidedLetterExtractionType =>
          value !== "escape_movement"
      ),

      maximum_interpretation_confidence:
        "low"
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_reaches_3",
        "reader_feels_forced_to_find_origin",
        "reader_begins_reconstructing_uncertain_memories",
        "reader_requests_stop",
        "writing_becomes_self_accusation"
      ],

      visible_instruction:
        "Você pode parar aqui. Não precisa reconstruir a história para reconhecer que algo esteve presente.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_cons_05"
    },

    estimated_minutes: 8,

    minimum_characters: 0,
    maximum_characters: 6000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    allow_skip: true,
    allow_private_mode: true,

    active: true
  };


//////////////////////////////////////////////////
// 4. CARTA 2 — CONFRONTO INTERNO
// À VOZ QUE ME MANTÉM EM MOVIMENTO
//////////////////////////////////////////////////

export const P01_LETTER_CONFRONTATION:
  CompanionGuidedLetter = {
    id: "p01_letter_confrontation",

    pillar_id:
      "pillar_01_reconhecimento",

    type: "confrontation",

    title:
      "À voz que me mantém em movimento",

    purpose:
      "Diferenciar a função protetiva da cobrança interna do custo produzido por desprezo, pressa e condenação.",

    recipient_instruction:
      "Escreva para uma voz, regra, exigência ou mecanismo interno. Não escolha uma pessoa real como destinatária desta carta.",

    introduction:
      "Confrontar, aqui, não significa atacar. Significa deixar de tratar uma voz interna como autoridade invisível.",

    starter_lines: [
      "Eu percebo o que você tenta impedir...",
      "Durante muito tempo, eu obedeci quando você dizia...",
      "O que essa proteção passou a me custar foi..."
    ],

    closing_instruction:
      "Encerre com um limite interno. Não substitua a voz antiga por outra cobrança mais positiva.",

    compatible_primary_signals: [
      "self_judgment",
      "rigid_control",
      "external_judgment",
      "recognition",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "worth_tied_to_productivity",
      "pain_normalization",
      "need_for_approval",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "functioning_without_feeling",
      "performance_to_belong",
      "self_invisibility"
    ],

    minimum_readiness: 3,
    maximum_load: 2,
    minimum_depth: 2,

    allow_symbolic_recipient: true,
    remind_not_to_send: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "guided_sections",

    allowed_recipient_types: [
      "internal_voice",
      "internal_rule",
      "symbolic_recipient"
    ],

    sections: [
      {
        id:
          "p01_letter_confrontation_section_01",

        order: 1,

        title:
          "O que você tenta proteger",

        instruction:
          "Reconheça a função que a voz parece cumprir antes de nomear seu custo.",

        starter_lines: [
          "Eu percebo que você tenta evitar...",
          "Talvez você tenha surgido para...",
          "Quando você me pressiona, parece tentar..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_confrontation_section_02",

        order: 2,

        title:
          "O que você costuma dizer",

        instruction:
          "Registre uma frase ou regra recorrente sem repeti-la mais do que o necessário.",

        starter_lines: [
          "Você costuma dizer que...",
          "Sua regra parece ser...",
          "Quando eu paro, você afirma..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_confrontation_section_03",

        order: 3,

        title:
          "O preço dessa proteção",

        instruction:
          "Nomeie o que acontece quando essa voz assume todo o controle.",

        starter_lines: [
          "Quando acredito em tudo o que você diz...",
          "O custo de obedecer automaticamente é...",
          "Para continuar funcionando, eu acabo..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_confrontation_section_04",

        order: 4,

        title:
          "O limite que começa aqui",

        instruction:
          "Formule um limite sem exigir que a voz desapareça.",

        starter_lines: [
          "Você pode aparecer, mas não precisa...",
          "Eu posso ouvir sem...",
          "A partir de agora, quero perceber antes de..."
        ],

        optional: true
      }
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_judgment"
      ],

      relation_type:
        "supports_judgment",

      description:
        "Apoia a percepção das vozes de desprezo, cobrança moral e medo social como mecanismos internos."
    },

    delivery_policy: {
      ...DEFAULT_GUIDED_LETTER_DELIVERY_POLICY,

      may_be_exported_by_reader: false,

      visible_notice:
        "Esta carta é dirigida a uma voz ou regra interna. Não a transforme em mensagem para outra pessoa."
    },

    memory_policy: {
      ...DEFAULT_GUIDED_LETTER_MEMORY_POLICY,

      allow_derived_summary_recall:
        false
    },

    analysis_policy: {
      ...DEFAULT_GUIDED_LETTER_ANALYSIS_POLICY,

      allowed_extractions: [
        "internal_sentence",
        "internal_rule",
        "protection_function",
        "perceived_cost",
        "boundary_statement",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "medium",

      allow_open_thread_candidate:
        true
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_reaches_3",
        "writing_turns_into_self_insult",
        "reader_repeats_harmful_sentence_excessively",
        "symbolic_recipient_becomes_real_person",
        "reader_begins_planning_external_confrontation",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Interrompa a carta. O objetivo não é atacar você nem preparar um confronto com outra pessoa.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_judg_06"
    },

    estimated_minutes: 10,

    minimum_characters: 0,
    maximum_characters: 6000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    allow_skip: true,
    allow_private_mode: true,

    active: true
  };


//////////////////////////////////////////////////
// 5. CARTA 3 — PRESENÇA
// EU VOLTO DO JEITO QUE CONSIGO
//////////////////////////////////////////////////

export const P01_LETTER_PRESENCE:
  CompanionGuidedLetter = {
    id: "p01_letter_presence",

    pillar_id:
      "pillar_01_reconhecimento",

    type: "presence",

    title:
      "Eu volto do jeito que consigo",

    purpose:
      "Formular uma possibilidade de retorno a si sem promessa de permanência perfeita ou mudança definitiva.",

    recipient_instruction:
      "Escreva de você, no presente, para a parte que costuma desaparecer durante a fuga, o julgamento ou a performance.",

    introduction:
      "Esta carta não exige que você nunca mais se abandone. Ela registra apenas que o retorno continua possível.",

    starter_lines: [
      "Eu não sei permanecer o tempo todo, mas...",
      "Quando eu perceber que estou saindo de mim...",
      "Uma forma possível de voltar é..."
    ],

    closing_instruction:
      "Encerre com uma frase ou gesto que pareça verdadeiro. Também é válido terminar sem promessa.",

    compatible_primary_signals: [
      "recognition",
      "ambivalence",
      "uncertainty",
      "integration"
    ],

    compatible_secondary_signals: [
      "coherent_positioning",
      "repetition_awareness",
      "silence_to_preserve_bond",
      "control_through_performance"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "automatic_escape",
      "internalized_self_attack",
      "performance_to_belong",
      "self_invisibility"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 2,

    allow_symbolic_recipient: true,
    remind_not_to_send: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "guided_sections",

    allowed_recipient_types: [
      "part_of_self",
      "present_self",
      "past_self",
      "symbolic_recipient"
    ],

    sections: [
      {
        id:
          "p01_letter_presence_section_01",

        order: 1,

        title:
          "Como eu costumo desaparecer",

        instruction:
          "Reconheça um movimento de fuga, julgamento ou performance sem condená-lo.",

        starter_lines: [
          "Eu percebo que começo a desaparecer quando...",
          "Minha saída costuma aparecer como...",
          "Antes de fugir, eu geralmente..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_presence_section_02",

        order: 2,

        title:
          "O que eu não quero prometer",

        instruction:
          "Retire exigências de perfeição, continuidade ou controle total.",

        starter_lines: [
          "Eu não prometo que...",
          "Talvez eu ainda volte a...",
          "Eu não quero transformar esta carta em..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_presence_section_03",

        order: 3,

        title:
          "O menor retorno possível",

        instruction:
          "Escolha um gesto simples que não dependa de motivação ou desempenho.",

        starter_lines: [
          "Quando eu perceber, posso...",
          "O menor gesto possível é...",
          "Uma frase verdadeira para voltar seria..."
        ],

        optional: true
      },

      {
        id:
          "p01_letter_presence_section_04",

        order: 4,

        title:
          "Eu continuo aqui",

        instruction:
          "Encerre reconhecendo presença, limite ou possibilidade de retorno.",

        starter_lines: [
          "Mesmo sem resolver, eu...",
          "Eu posso voltar...",
          "Por enquanto, quero lembrar que..."
        ],

        optional: true
      }
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_presence",
        "p01_section_support_letter",
        "p01_section_anchor",
        "p01_section_closure"
      ],

      relation_type:
        "supports_presence",

      description:
        "Apoia o movimento de retorno a si e pode preparar a leitura da Carta de Sustentação ou do Ritual canônico."
    },

    delivery_policy:
      DEFAULT_GUIDED_LETTER_DELIVERY_POLICY,

    memory_policy:
      DEFAULT_GUIDED_LETTER_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_GUIDED_LETTER_ANALYSIS_POLICY,

      allowed_extractions: [
        "acknowledged_state",
        "protection_function",
        "return_phrase",
        "minimum_presence_gesture",
        "boundary_statement",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "medium",

      allow_open_thread_candidate:
        true
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "letter_becomes_permanent_promise",
        "reader_creates_perfection_rule",
        "reader_uses_letter_as_new_self_demand",
        "load_level_reaches_3",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Retire a promessa. O retorno pode permanecer apenas como possibilidade, sem obrigação de acontecer sempre.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_pres_06"
    },

    estimated_minutes: 9,

    minimum_characters: 0,
    maximum_characters: 6000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    allow_skip: true,
    allow_private_mode: true,

    active: true
  };


//////////////////////////////////////////////////
// 6. PACOTE DAS TRÊS CARTAS
//////////////////////////////////////////////////

export const PILLAR_01_GUIDED_LETTERS:
  CompanionGuidedLetter[] = [
    P01_LETTER_RECOGNITION,
    P01_LETTER_CONFRONTATION,
    P01_LETTER_PRESENCE
  ];


//////////////////////////////////////////////////
// 7. SUBMISSÃO DA CARTA
//////////////////////////////////////////////////

export interface GuidedLetterSubmission {
  id: string;

  reader_id: string;

  guided_letter_id: string;
  pillar_id: PillarId;

  letter_type:
    GuidedLetterType;

  recipient_type:
    GuidedLetterRecipientType;

  recipient_label?: string;

  content?: string;

  privacy_mode:
    GuidedLetterPrivacyMode;

  analysis_consent: boolean;
  memory_consent: boolean;
  excerpt_consent: boolean;

  submitted_empty: boolean;
  deleted_after_writing: boolean;

  started_at: string;
  submitted_at?: string;
  deleted_at?: string;
}


//////////////////////////////////////////////////
// 8. EVIDÊNCIAS EXTRAÍDAS
//////////////////////////////////////////////////

export interface GuidedLetterExtractedEvidence {
  type:
    GuidedLetterExtractionType;

  summary: string;

  exact_excerpt?: string;

  primary_signal?: PrimarySignal;

  secondary_signals:
    SecondarySignal[];

  pillar_specific_signals:
    string[];

  confidence:
    InterpretationConfidence;

  source_submission_id: string;
}

export interface GuidedLetterAnalysisResult {
  submission_id: string;
  guided_letter_id: string;

  analyzed: boolean;

  extracted_evidence:
    GuidedLetterExtractedEvidence[];

  possible_memory_candidate?:
    GuidedLetterMemoryCandidate;

  possible_open_thread?:
    GuidedLetterOpenThreadCandidate;

  safety_interrupted: boolean;

  validation_errors: string[];
}


export interface GuidedLetterMemoryCandidate {
  layer:
    | "session"
    | "pillar"
    | "journey";

  summary: string;

  related_primary_signals:
    PrimarySignal[];

  related_secondary_signals:
    SecondarySignal[];

  related_pillar_signals:
    string[];

  confidence:
    InterpretationConfidence;

  requires_confirmation: true;
}


export interface GuidedLetterOpenThreadCandidate {
  title: string;
  summary: string;

  related_pillar_id:
    PillarId;

  source_submission_id: string;

  suggested_revisit_condition:
    string;

  requires_reader_confirmation:
    true;
}


//////////////////////////////////////////////////
// 9. ANÁLISE DA CARTA
//////////////////////////////////////////////////

export function analyzeGuidedLetterSubmission(
  letter: CompanionGuidedLetter,
  submission: GuidedLetterSubmission
): GuidedLetterAnalysisResult {
  if (
    !submission.analysis_consent ||
    submission.privacy_mode === "private"
  ) {
    return {
      submission_id: submission.id,
      guided_letter_id: letter.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: false,
      validation_errors: []
    };
  }

  if (
    submission.submitted_empty ||
    !submission.content?.trim()
  ) {
    return {
      submission_id: submission.id,
      guided_letter_id: letter.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: false,
      validation_errors: []
    };
  }

  const safetyAssessment =
    assessSafetyFromGuidedLetter(
      submission.content
    );

  if (
    safetyAssessment.level >= 2
  ) {
    return {
      submission_id: submission.id,
      guided_letter_id: letter.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: true,
      validation_errors: []
    };
  }

  const deliveryIntent =
    detectExternalDeliveryIntent(
      submission.content
    );

  if (
    deliveryIntent.plans_real_confrontation ||
    deliveryIntent.plans_immediate_sending
  ) {
    return {
      submission_id: submission.id,
      guided_letter_id: letter.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: false,

      validation_errors: [
        "Guided letters cannot be used to prepare immediate external confrontation or delivery."
      ]
    };
  }

  const evidence =
    extractAllowedGuidedLetterEvidence({
      content: submission.content,

      allowed_types:
        letter.analysis_policy
          .allowed_extractions,

      forbidden_inferences:
        letter.analysis_policy
          .forbidden_inferences,

      maximum_confidence:
        letter.analysis_policy
          .maximum_interpretation_confidence
    });

  const memoryCandidate =
    submission.memory_consent
      ? buildGuidedLetterMemoryCandidate(
          letter,
          submission,
          evidence
        )
      : undefined;

  const openThreadCandidate =
    letter.analysis_policy
      .allow_open_thread_candidate
      ? buildGuidedLetterOpenThreadCandidate(
          letter,
          submission,
          evidence
        )
      : undefined;

  return {
    submission_id: submission.id,
    guided_letter_id: letter.id,

    analyzed: true,

    extracted_evidence:
      evidence,

    possible_memory_candidate:
      memoryCandidate,

    possible_open_thread:
      openThreadCandidate,

    safety_interrupted: false,
    validation_errors: []
  };
}


//////////////////////////////////////////////////
// 10. CONSTRUÇÃO DE MEMÓRIA
//////////////////////////////////////////////////

export function buildGuidedLetterMemoryCandidate(
  letter: CompanionGuidedLetter,
  submission: GuidedLetterSubmission,
  evidence: GuidedLetterExtractedEvidence[]
): GuidedLetterMemoryCandidate | undefined {
  if (
    !submission.memory_consent ||
    evidence.length === 0
  ) {
    return undefined;
  }

  return {
    layer: "pillar",

    summary:
      buildNonClinicalLetterSummary(
        letter,
        evidence
      ),

    related_primary_signals:
      uniquePrimarySignals(evidence),

    related_secondary_signals:
      uniqueSecondarySignals(evidence),

    related_pillar_signals:
      uniquePillarSignals(evidence),

    confidence:
      calculateGuidedLetterEvidenceConfidence(
        evidence
      ),

    requires_confirmation: true
  };
}

/**
 * A carta nunca salva automaticamente:
 *
 * - o texto completo;
 * - nomes de pessoas;
 * - acusações;
 * - memórias detalhadas;
 * - frases ofensivas;
 * - destinatários reais;
 * - conclusões sobre terceiros.
 */


//////////////////////////////////////////////////
// 11. CRIAÇÃO DE FIO ABERTO
//////////////////////////////////////////////////

export function buildGuidedLetterOpenThreadCandidate(
  letter: CompanionGuidedLetter,
  submission: GuidedLetterSubmission,
  evidence: GuidedLetterExtractedEvidence[]
): GuidedLetterOpenThreadCandidate | undefined {
  const relevantEvidence =
    evidence.filter(
      item =>
        [
          "internal_rule",
          "protection_function",
          "perceived_cost",
          "boundary_statement",
          "return_phrase",
          "minimum_presence_gesture"
        ].includes(item.type)
    );

  if (
    relevantEvidence.length < 2
  ) {
    return undefined;
  }

  return {
    title:
      buildGuidedLetterThreadTitle(
        letter.type,
        relevantEvidence
      ),

    summary:
      buildGuidedLetterThreadSummary(
        relevantEvidence
      ),

    related_pillar_id:
      "pillar_01_reconhecimento",

    source_submission_id:
      submission.id,

    suggested_revisit_condition:
      selectGuidedLetterRevisitCondition(
        letter.type
      ),

    requires_reader_confirmation:
      true
  };
}


//////////////////////////////////////////////////
// 12. SELEÇÃO DA CARTA
//////////////////////////////////////////////////

export interface GuidedLetterSelectionContext {
  pillar_id: PillarId;
  phase: PillarPhase;

  reader_state: ReaderState;

  primary_signal?: PrimarySignal;

  secondary_signals:
    SecondarySignal[];

  pillar_specific_signals:
    string[];

  readiness_level:
    ScaleLevel;

  load_level:
    ScaleLevel;

  depth_level:
    DepthLevel;

  recently_used_letter_ids:
    string[];

  reader_requested_letter:
    boolean;

  reader_rejected_letter:
    boolean;

  reader_requested_external_message:
    boolean;
}


export function isGuidedLetterAvailable(
  letter: CompanionGuidedLetter,
  context: GuidedLetterSelectionContext
): boolean {
  if (!letter.active) {
    return false;
  }

  if (
    letter.pillar_id !==
    context.pillar_id
  ) {
    return false;
  }

  if (
    context.readiness_level <
    letter.minimum_readiness
  ) {
    return false;
  }

  if (
    context.load_level >
    letter.maximum_load
  ) {
    return false;
  }

  if (
    context.depth_level <
    letter.minimum_depth
  ) {
    return false;
  }

  if (
    context.reader_rejected_letter
  ) {
    return false;
  }

  if (
    context.reader_requested_external_message
  ) {
    return false;
  }

  if (
    context.recently_used_letter_ids
      .includes(letter.id)
  ) {
    return false;
  }

  if (
    letter.type ===
      "confrontation" &&
    context.reader_state ===
      "defensive"
  ) {
    return false;
  }

  if (
    letter.type ===
      "confrontation" &&
    context.readiness_level < 3
  ) {
    return false;
  }

  return true;
}


export function scoreGuidedLetter(
  letter: CompanionGuidedLetter,
  context: GuidedLetterSelectionContext
): number {
  let score = 0;

  if (
    context.reader_requested_letter
  ) {
    score += 100;
  }

  if (
    context.primary_signal &&
    letter.compatible_primary_signals
      .includes(context.primary_signal)
  ) {
    score += 30;
  }

  const secondaryMatches =
    context.secondary_signals.filter(
      signal =>
        letter
          .compatible_secondary_signals
          .includes(signal)
    ).length;

  score += secondaryMatches * 12;

  const pillarMatches =
    context.pillar_specific_signals.filter(
      signal =>
        letter
          .compatible_pillar_signals
          .includes(signal)
    ).length;

  score += pillarMatches * 15;

  if (
    context.phase === "consciousness" &&
    letter.type === "recognition"
  ) {
    score += 35;
  }

  if (
    context.phase === "judgment" &&
    letter.type === "confrontation"
  ) {
    score += 35;
  }

  if (
    context.phase === "presence" &&
    letter.type === "presence"
  ) {
    score += 35;
  }

  if (
    context.primary_signal ===
      "uncertainty" &&
    letter.type ===
      "recognition"
  ) {
    score += 20;
  }

  if (
    context.primary_signal ===
      "self_judgment" &&
    letter.type ===
      "confrontation"
  ) {
    score += 20;
  }

  if (
    context.primary_signal ===
      "integration" &&
    letter.type ===
      "presence"
  ) {
    score += 25;
  }

  if (
    context.reader_state ===
      "defensive" &&
    letter.type !==
      "recognition"
  ) {
    score -= 80;
  }

  return score;
}


export function selectPillar01GuidedLetter(
  context: GuidedLetterSelectionContext
): CompanionGuidedLetter | null {
  const candidates =
    PILLAR_01_GUIDED_LETTERS
      .filter(
        letter =>
          isGuidedLetterAvailable(
            letter,
            context
          )
      )
      .map(letter => ({
        letter,
        score:
          scoreGuidedLetter(
            letter,
            context
          )
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  return candidates[0]?.letter ?? null;
}


//////////////////////////////////////////////////
// 13. FALLBACK SEM CARTA
//////////////////////////////////////////////////

export interface GuidedLetterFallbackDecision {
  intervention:
    | "journal"
    | "anchor"
    | "micro_return"
    | "pause"
    | "closure";

  content_id?: string;
}


export function selectGuidedLetterFallback(
  context: GuidedLetterSelectionContext
): GuidedLetterFallbackDecision {
  if (
    context.load_level >= 3
  ) {
    return {
      intervention: "pause"
    };
  }

  if (
    context.reader_requested_external_message
  ) {
    return {
      intervention: "closure"
    };
  }

  if (
    context.phase ===
    "consciousness"
  ) {
    return {
      intervention:
        "journal",

      content_id:
        "p01_journal_cons_01"
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
        "anchor",

      content_id:
        "p01_anchor_position"
    };
  }

  return {
    intervention: "closure"
  };
}


//////////////////////////////////////////////////
// 14. EXIBIÇÃO
//////////////////////////////////////////////////

export const GUIDED_LETTER_DISPLAY_RULES = {
  show_title: true,
  show_purpose: true,
  show_recipient_instruction: true,
  show_private_notice: true,

  show_sections_one_at_a_time:
    true,

  allow_view_all_sections:
    true,

  show_starter_lines:
    true,

  maximum_starter_lines_per_section:
    3,

  show_estimated_time:
    true,

  show_skip_action:
    true,

  show_private_mode_first:
    true,

  show_analysis_toggle:
    true,

  show_memory_toggle:
    true,

  analysis_toggle_default:
    false,

  memory_toggle_default:
    false,

  show_send_action:
    false,

  show_share_action:
    false,

  show_recipient_contact_action:
    false,

  never_score_length:
    true,

  never_score_depth:
    true,

  never_score_completion:
    true,

  never_reward_emotional_exposure:
    true,

  never_create_badge:
    true
};


//////////////////////////////////////////////////
// 15. VALIDAÇÃO INDIVIDUAL
//////////////////////////////////////////////////

export function validateGuidedLetter(
  letter: CompanionGuidedLetter
): string[] {
  const errors: string[] = [];

  if (!letter.title.trim()) {
    errors.push(
      `${letter.id} requires title.`
    );
  }

  if (!letter.purpose.trim()) {
    errors.push(
      `${letter.id} requires purpose.`
    );
  }

  if (
    letter.origin !==
      "igent_companion"
  ) {
    errors.push(
      `${letter.id} must belong to the companion layer.`
    );
  }

  if (
    letter.sections.length < 3
  ) {
    errors.push(
      `${letter.id} requires at least 3 guided sections.`
    );
  }

  if (
    letter.maximum_load > 2
  ) {
    errors.push(
      `${letter.id} cannot be available above load level 2.`
    );
  }

  if (
    letter.analyze_by_default
  ) {
    errors.push(
      `${letter.id} cannot enable analysis by default.`
    );
  }

  if (
    !letter.allow_private_mode
  ) {
    errors.push(
      `${letter.id} must allow private mode.`
    );
  }

  if (
    !letter.allow_skip
  ) {
    errors.push(
      `${letter.id} must allow skip.`
    );
  }

  if (
    letter.minimum_characters !== 0
  ) {
    errors.push(
      `${letter.id} cannot require minimum writing length.`
    );
  }

  if (
    !letter.allow_empty_submission
  ) {
    errors.push(
      `${letter.id} must allow empty submission.`
    );
  }

  if (
    !letter.delivery_policy
      .never_prompt_to_send
  ) {
    errors.push(
      `${letter.id} must never prompt external sending.`
    );
  }

  if (
    !letter.delivery_policy
      .never_suggest_real_confrontation
  ) {
    errors.push(
      `${letter.id} must block real confrontation suggestions.`
    );
  }

  if (
    letter.memory_policy
      .storage_default !== "off"
  ) {
    errors.push(
      `${letter.id} memory must be disabled by default.`
    );
  }

  if (
    !letter.analysis_policy
      .explicit_consent_required
  ) {
    errors.push(
      `${letter.id} requires explicit analysis consent.`
    );
  }

  if (
    letter.type ===
      "confrontation" &&
    letter.allowed_recipient_types
      .some(
        type =>
          [
            "past_self",
            "present_self",
            "life_period"
          ].includes(type)
      )
  ) {
    errors.push(
      `${letter.id} confrontation must target only internal voices, rules or symbolic mechanisms.`
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 16. VALIDAÇÃO DO PACOTE
//////////////////////////////////////////////////

export function validatePillar01GuidedLetters(
  letters: CompanionGuidedLetter[]
): string[] {
  const errors: string[] = [];

  if (
    letters.length !== 3
  ) {
    errors.push(
      "Pillar I must contain exactly 3 guided letters."
    );
  }

  const requiredTypes:
    GuidedLetterType[] = [
      "recognition",
      "confrontation",
      "presence"
    ];

  for (
    const requiredType
    of requiredTypes
  ) {
    const matches =
      letters.filter(
        letter =>
          letter.type ===
          requiredType
      );

    if (
      matches.length !== 1
    ) {
      errors.push(
        `Pillar I requires exactly one ${requiredType} guided letter.`
      );
    }
  }

  const ids =
    letters.map(
      letter =>
        letter.id
    );

  if (
    new Set(ids).size !==
    ids.length
  ) {
    errors.push(
      "Guided letter IDs must be unique."
    );
  }

  for (const letter of letters) {
    errors.push(
      ...validateGuidedLetter(
        letter
      )
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 17. PACOTE PUBLICÁVEL
//////////////////////////////////////////////////

export interface Pillar01GuidedLetterPackage {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  canonical_support_letter_id:
    "p01_section_support_letter";

  guided_letters:
    CompanionGuidedLetter[];

  validation_errors:
    string[];

  version: string;

  status:
    | "draft"
    | "review"
    | "approved"
    | "published";
}


export const PILLAR_01_GUIDED_LETTER_PACKAGE:
  Pillar01GuidedLetterPackage = {
    id:
      "igent_p01_guided_letter_package",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_support_letter_id:
      "p01_section_support_letter",

    guided_letters:
      PILLAR_01_GUIDED_LETTERS,

    validation_errors:
      validatePillar01GuidedLetters(
        PILLAR_01_GUIDED_LETTERS
      ),

    version: "2.0.0",

    status: "approved"
  };


//////////////////////////////////////////////////
// 18. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_15_FINAL_RULES = [
  "All guided letters belong to the iGent companion layer.",

  "Guided letters must never be presented as canonical book text.",

  "The canonical Support Letter remains an independent book section.",

  "Pillar I contains exactly three guided letters: recognition, confrontation and presence.",

  "Every guided letter is optional.",

  "Every guided letter must allow private mode.",

  "Analysis is disabled by default.",

  "Memory storage is disabled by default.",

  "Explicit consent is required for analysis.",

  "Explicit consent is required for derived memory.",

  "Raw letter text must not be recalled by the agent.",

  "A single letter cannot create a recurring pattern.",

  "The reader may submit an empty letter.",

  "The reader may delete the letter after writing.",

  "Writing length must never be scored.",

  "Emotional exposure must never be rewarded.",

  "Guided letters must never include a send action.",

  "Guided letters must never offer recipient delivery.",

  "Guided letters must never encourage external confrontation.",

  "The confrontation letter addresses only an internal voice, rule or symbolic mechanism.",

  "The recognition letter must not force the reader to reconstruct the origin of an experience.",

  "The presence letter must not create promises of permanent change.",

  "A return statement is a possibility, not a contract.",

  "The reader may stop at any section.",

  "Stopping a letter does not indicate resistance.",

  "When writing increases load, the engine must stop analysis and reduce depth.",

  "When the letter begins producing stronger self-attack, the engine must interrupt the exercise.",

  "The agent must not ask the reader to provide more detail after the letter is complete.",

  "A guided letter may prepare the canonical Support Letter, but it can never replace it."
];
