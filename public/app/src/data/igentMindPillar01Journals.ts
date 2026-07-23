import type { DepthLevel, PillarPhase, ReaderState } from './igentMindContract';
import type { PillarId } from './igentMindCanonicalContent';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';
import type { CompanionJournalPrompt as BaseCompanionJournalPrompt } from './igentMindCanonicalContent';

type InterpretationConfidence = 'low' | 'medium' | 'high';

export type JournalCompletionMode =
  | 'free_write'
  | 'guided_three_steps'
  | 'sentence_completion'
  | 'brief_observation';

export type JournalPrivacyMode =
  | 'private'
  | 'analyze_once'
  | 'analyze_and_remember';

export type JournalCanonicalRelationType =
  | 'supports_section'
  | 'supports_canonical_ritual'
  | 'supports_transition'
  | 'supports_closure';

export type JournalExtractionType =
  | 'current_state'
  | 'body_signal'
  | 'internal_sentence'
  | 'judgment_function'
  | 'social_fear'
  | 'escape_movement'
  | 'return_phrase'
  | 'minimum_presence_gesture'
  | 'reader_correction'
  | 'meaningful_excerpt';

export interface JournalCanonicalRelation {
  canonical_section_ids: string[];
  relation_type: JournalCanonicalRelationType;
  description: string;
}

export interface JournalMemoryPolicy {
  storage_default: 'off';
  raw_text_storage_requires_consent: true;
  derived_summary_requires_consent: true;
  excerpt_storage_requires_consent: true;
  allow_raw_text_recall: boolean;
  allow_derived_summary_recall: boolean;
  allow_exact_excerpt_recall: boolean;
  create_pattern_from_single_entry: false;
  maximum_saved_excerpts: number;
  maximum_excerpt_characters: number;
  sensitivity: 'normal' | 'personal' | 'sensitive';
}

export interface JournalAnalysisPolicy {
  analysis_default: 'off';
  explicit_consent_required: true;
  allowed_extractions: JournalExtractionType[];
  forbidden_inferences: string[];
  maximum_interpretation_confidence: 'low' | 'medium';
  create_open_thread_when_supported: boolean;
}

export interface JournalStopRule {
  enabled: true;
  conditions: string[];
  visible_instruction: string;
  fallback_intervention: 'anchor' | 'micro_return' | 'pause' | 'closure';
  fallback_content_id?: string;
}

export type CompanionJournalPrompt = BaseCompanionJournalPrompt & {
  origin: 'igent_companion';
  completion_mode: JournalCompletionMode;
  estimated_minutes: number;
  opening_instruction: string;
  steps: string[];
  canonical_relation: JournalCanonicalRelation;
  memory_policy: JournalMemoryPolicy;
  analysis_policy: JournalAnalysisPolicy;
  stop_rule: JournalStopRule;
  minimum_characters: number;
  maximum_characters: number;
  allow_empty_submission: true;
  allow_delete_after_writing: true;
};

const assessSafetyFromJournal = (content: string) => ({
  level: /suic[i?]dio|me matar|autoagress[a?]o|n?o quero viver/i.test(content) ? 2 : 0,
});

const extractAllowedJournalEvidence = (_input: {
  content: string;
  allowed_types: JournalExtractionType[];
  maximum_confidence: 'low' | 'medium';
  forbidden_inferences: string[];
}): JournalExtractedEvidence[] => [];

const buildNonClinicalJournalSummary = (_evidence: JournalExtractedEvidence[]) => 'Registro reflexivo sem infer?ncia cl?nica.';
const selectMeaningfulExcerpt = (_evidence: JournalExtractedEvidence[], _maximumCharacters: number) => undefined as string | undefined;
const uniquePrimarySignals = (evidence: JournalExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.primary_signal ? [item.primary_signal] : [])));
const uniqueSecondarySignals = (evidence: JournalExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.secondary_signals)));
const uniquePillarSignals = (evidence: JournalExtractedEvidence[]) => Array.from(new Set(evidence.flatMap((item) => item.pillar_specific_signals)));
const calculateJournalEvidenceConfidence = (evidence: JournalExtractedEvidence[]): InterpretationConfidence => evidence.some((item) => item.confidence === 'medium') ? 'medium' : 'low';

export const DEFAULT_JOURNAL_MEMORY_POLICY:
  JournalMemoryPolicy = {
    storage_default: "off",

    raw_text_storage_requires_consent: true,
    derived_summary_requires_consent: true,
    excerpt_storage_requires_consent: true,

    allow_raw_text_recall: false,
    allow_derived_summary_recall: true,
    allow_exact_excerpt_recall: false,

    create_pattern_from_single_entry: false,

    maximum_saved_excerpts: 1,
    maximum_excerpt_characters: 240,

    sensitivity: "personal"
  };


export const SENSITIVE_JOURNAL_MEMORY_POLICY:
  JournalMemoryPolicy = {
    storage_default: "off",

    raw_text_storage_requires_consent: true,
    derived_summary_requires_consent: true,
    excerpt_storage_requires_consent: true,

    allow_raw_text_recall: false,
    allow_derived_summary_recall: false,
    allow_exact_excerpt_recall: false,

    create_pattern_from_single_entry: false,

    maximum_saved_excerpts: 0,
    maximum_excerpt_characters: 0,

    sensitivity: "sensitive"
  };


export const DEFAULT_JOURNAL_ANALYSIS_POLICY:
  JournalAnalysisPolicy = {
    analysis_default: "off",

    explicit_consent_required: true,

    allowed_extractions: [
      "current_state",
      "body_signal",
      "internal_sentence",
      "escape_movement",
      "return_phrase",
      "minimum_presence_gesture",
      "reader_correction",
      "meaningful_excerpt"
    ],

    forbidden_inferences: [
      "clinical diagnosis",
      "medical condition",
      "trauma confirmation",
      "personality disorder",
      "attachment style diagnosis",
      "family origin assumption",
      "permanent emotional profile",
      "risk conclusion from metaphor alone"
    ],

    maximum_interpretation_confidence:
      "medium",

    create_open_thread_when_supported:
      true
  };


//////////////////////////////////////////////////
// 3. DIÁRIO 1 — CONSCIÊNCIA
// O QUE ESTÁ AQUI AGORA
//////////////////////////////////////////////////

export const P01_JOURNAL_CONS_01:
  CompanionJournalPrompt = {
    id: "p01_journal_cons_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    phase_order: 1,

    title:
      "O que está aqui agora",

    context:
      "Este registro não procura a origem nem uma solução. Ele apenas cria espaço para reconhecer o estado atual.",

    prompt:
      "Escreva apenas o que consegue admitir neste momento, sem tentar organizar toda a história.",

    starter_lines: [
      "Agora existe em mim...",
      "O que mais tento não perceber é...",
      "Sem resolver, eu consigo admitir que..."
    ],

    semantic_goal:
      "Nomear o estado presente antes de explicá-lo, reduzi-lo ou transformá-lo em tarefa.",

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
      "return_to_self"
    ],

    minimum_readiness: 1,
    maximum_load: 2,
    minimum_depth: 1,

    intensity: "light",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "sentence_completion",

    estimated_minutes: 4,

    opening_instruction:
      "Escolha uma frase inicial ou escreva livremente. Não é necessário responder às três.",

    steps: [
      "Nomeie o que está presente.",
      "Evite procurar a causa.",
      "Pare quando o registro já parecer suficiente."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_consciousness"
      ],

      relation_type:
        "supports_section",

      description:
        "Apoia o movimento canônico de reconhecer antes de explicar."
    },

    memory_policy:
      DEFAULT_JOURNAL_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "current_state",
        "escape_movement",
        "reader_correction",
        "meaningful_excerpt"
      ],

      maximum_interpretation_confidence:
        "low"
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_reaches_3",
        "reader_requests_stop",
        "writing_becomes_forced",
        "reader_begins_searching_for_required_answer"
      ],

      visible_instruction:
        "Você pode parar sem concluir. O que conseguiu reconhecer já é suficiente para este momento.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_cons_05"
    },

    minimum_characters: 0,
    maximum_characters: 4000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 4. DIÁRIO 2 — CONSCIÊNCIA
// O CORPO ANTES DA EXPLICAÇÃO
//////////////////////////////////////////////////

export const P01_JOURNAL_CONS_02:
  CompanionJournalPrompt = {
    id: "p01_journal_cons_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    phase_order: 2,

    title:
      "O corpo antes da explicação",

    context:
      "O objetivo não é procurar sintomas nem descobrir o significado de cada sensação. O corpo aparece apenas como um ponto possível de observação.",

    prompt:
      "Registre uma sensação que consegue perceber agora ou escreva que nenhuma sensação está clara.",

    starter_lines: [
      "Agora percebo...",
      "Isso aparece no meu corpo como...",
      "Ainda não sei o que significa, mas noto..."
    ],

    semantic_goal:
      "Registrar uma percepção corporal sem convertê-la em diagnóstico, prova ou explicação definitiva.",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "avoidance",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "body_held_tension",
      "functioning_without_feeling",
      "denial_of_current_state"
    ],

    minimum_readiness: 1,
    maximum_load: 2,
    minimum_depth: 1,

    intensity: "light",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "brief_observation",

    estimated_minutes: 3,

    opening_instruction:
      "Observe apenas o que está facilmente disponível. Não examine o corpo até encontrar alguma coisa.",

    steps: [
      "Perceba uma região ou sensação.",
      "Descreva sem interpretar.",
      "Pare se a atenção aumentar o desconforto."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_consciousness",
        "p01_section_anchor"
      ],

      relation_type:
        "supports_canonical_ritual",

      description:
        "Apoia a Nomeação do Ritual do Reconhecimento sem substituir sua prática canônica."
    },

    memory_policy: {
      ...SENSITIVE_JOURNAL_MEMORY_POLICY,

      allow_derived_summary_recall:
        true
    },

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "body_signal",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "low",

      create_open_thread_when_supported:
        false
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "body_attention_increases_load",
        "reader_reports_increasing_inquietude",
        "reader_requests_stop",
        "reader_cannot_locate_sensation"
      ],

      visible_instruction:
        "Não é necessário continuar procurando. A ausência de uma sensação clara também é uma resposta válida.",

      fallback_intervention:
        "anchor",

      fallback_content_id:
        "p01_anchor_observe"
    },

    minimum_characters: 0,
    maximum_characters: 2500,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 5. DIÁRIO 3 — JULGAMENTO
// A FRASE USADA CONTRA MIM
//////////////////////////////////////////////////

export const P01_JOURNAL_JUDG_01:
  CompanionJournalPrompt = {
    id: "p01_journal_judg_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    phase_order: 1,

    title:
      "A frase usada contra mim",

    context:
      "Este registro ajuda a perceber a linguagem interna sem tratar a frase como verdade ou identidade.",

    prompt:
      "Escreva uma frase que costuma aparecer quando você erra, para, sente demais ou percebe que não está bem.",

    starter_lines: [
      "Quando não estou bem, digo a mim mesmo...",
      "Essa frase tenta me obrigar a...",
      "Depois de ouvi-la, eu costumo..."
    ],

    semantic_goal:
      "Identificar uma sentença interna recorrente, sua função de controle e o efeito que produz.",

    compatible_primary_signals: [
      "self_judgment",
      "rigid_control",
      "recognition",
      "ambivalence",
      "uncertainty"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "pain_normalization",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "functioning_without_feeling",
      "return_to_self"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 1,

    intensity: "moderate",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "guided_three_steps",

    estimated_minutes: 6,

    opening_instruction:
      "Registre as palavras como aparecem. Não é necessário corrigi-las nem responder com uma frase positiva.",

    steps: [
      "Escreva a frase interna.",
      "Perceba o que ela tenta controlar.",
      "Registre o efeito que ela produz."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_judgment"
      ],

      relation_type:
        "supports_section",

      description:
        "Apoia a percepção canônica das vozes de desprezo e cobrança moral."
    },

    memory_policy:
      SENSITIVE_JOURNAL_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "internal_sentence",
        "judgment_function",
        "escape_movement",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "medium"
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_reaches_3",
        "self_attack_intensifies_during_writing",
        "reader_begins_repeating_harmful_sentence",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Você pode interromper o registro. Não é necessário repetir a frase para compreendê-la.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_judg_01"
    },

    minimum_characters: 0,
    maximum_characters: 4000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 6. DIÁRIO 4 — JULGAMENTO
// O QUE TEMO QUE PERCEBAM
//////////////////////////////////////////////////

export const P01_JOURNAL_JUDG_02:
  CompanionJournalPrompt = {
    id: "p01_journal_judg_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    phase_order: 2,

    title:
      "O que temo que percebam",

    context:
      "O registro não exige exposição a outras pessoas. Ele investiga apenas o que você acredita estar protegendo quando tenta parecer bem.",

    prompt:
      "Escreva o que teme que alguém conclua se perceber seu estado real, sem identificar pessoas ou situações que prefira manter privadas.",

    starter_lines: [
      "Se percebessem como estou, poderiam pensar que...",
      "O que temo perder é...",
      "Mesmo sem mostrar a ninguém, consigo admitir que..."
    ],

    semantic_goal:
      "Reconhecer o medo social ligado à performance, invisibilidade, julgamento ou perda de lugar.",

    compatible_primary_signals: [
      "external_judgment",
      "self_judgment",
      "avoidance",
      "ambivalence",
      "uncertainty"
    ],

    compatible_secondary_signals: [
      "need_for_approval",
      "silence_to_preserve_bond",
      "control_through_performance",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "performance_to_belong",
      "self_invisibility",
      "functioning_without_feeling"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 2,

    intensity: "moderate",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "sentence_completion",

    estimated_minutes: 6,

    opening_instruction:
      "Você não precisa citar nomes, relações ou episódios. Registre apenas a conclusão que teme receber.",

    steps: [
      "Nomeie a conclusão temida.",
      "Perceba o que tenta preservar.",
      "Diferencie reconhecimento interno de exposição externa."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_judgment",
        "p01_section_presence"
      ],

      relation_type:
        "supports_transition",

      description:
        "Apoia a passagem entre medo social e presença interna sem exigir exposição."
    },

    memory_policy:
      SENSITIVE_JOURNAL_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "social_fear",
        "judgment_function",
        "escape_movement",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "low",

      create_open_thread_when_supported:
        true
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_reaches_3",
        "reader_feels_pressure_to_disclose",
        "entry_moves_into_sensitive_detail",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Você não precisa revelar detalhes para reconhecer o medo. Pode encerrar com apenas uma palavra ou deixar o registro vazio.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_judg_05"
    },

    minimum_characters: 0,
    maximum_characters: 4000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 7. DIÁRIO 5 — PRESENÇA
// UM MINUTO SEM FUGA
//////////////////////////////////////////////////

export const P01_JOURNAL_PRES_01:
  CompanionJournalPrompt = {
    id: "p01_journal_pres_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    phase_order: 1,

    title:
      "Um minuto sem fuga",

    context:
      "O título acompanha o movimento do livro, mas o leitor pode permanecer por menos de um minuto. O objetivo não é suportar mais; é perceber o intervalo antes da fuga.",

    prompt:
      "Permaneça por alguns segundos, ou até um minuto se isso for confortável, e registre o que apareceu antes de buscar distração, explicação ou solução.",

    starter_lines: [
      "Nos primeiros segundos, percebi...",
      "Minha vontade de sair apareceu como...",
      "O limite que reconheci foi..."
    ],

    semantic_goal:
      "Observar a passagem entre contato, desconforto e fuga sem transformar permanência em desafio.",

    compatible_primary_signals: [
      "recognition",
      "avoidance",
      "ambivalence",
      "uncertainty",
      "integration"
    ],

    compatible_secondary_signals: [
      "emptiness_avoidance",
      "repetition_awareness",
      "coherent_positioning"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "body_held_tension",
      "return_to_self"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 2,

    intensity: "moderate",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "brief_observation",

    estimated_minutes: 3,

    opening_instruction:
      "Não use o tempo como meta. Pare antes se o contato deixar de parecer possível.",

    steps: [
      "Perceba o estado.",
      "Observe a primeira vontade de sair.",
      "Encerre antes de ultrapassar seu limite."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_presence",
        "p01_section_anchor"
      ],

      relation_type:
        "supports_canonical_ritual",

      description:
        "Apoia as etapas Chegada e Permanência do Ritual do Reconhecimento."
    },

    memory_policy: {
      ...DEFAULT_JOURNAL_MEMORY_POLICY,

      maximum_saved_excerpts: 0,
      maximum_excerpt_characters: 0
    },

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "current_state",
        "body_signal",
        "escape_movement",
        "reader_correction"
      ],

      maximum_interpretation_confidence:
        "low"
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "load_level_increases",
        "body_attention_increases_inquietude",
        "reader_feels_forced_to_continue",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Pare agora. Reconhecer o limite faz parte da prática; permanecer não significa aguentar até o máximo.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_pres_03"
    },

    minimum_characters: 0,
    maximum_characters: 2500,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 8. DIÁRIO 6 — PRESENÇA
// O QUE NÃO QUERO MAIS ABANDONAR
//////////////////////////////////////////////////

export const P01_JOURNAL_PRES_02:
  CompanionJournalPrompt = {
    id: "p01_journal_pres_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    phase_order: 2,

    title:
      "O que não quero mais abandonar",

    context:
      "Este registro não exige uma promessa total. Ele procura apenas uma forma mínima e verdadeira de retorno.",

    prompt:
      "Defina um gesto pequeno que poderia ajudar você a reconhecer seu estado antes de desaparecer dentro da fuga, do julgamento ou da performance.",

    starter_lines: [
      "Quando eu começar a sair de mim, posso...",
      "O menor gesto possível seria...",
      "Uma frase verdadeira de retorno é..."
    ],

    semantic_goal:
      "Formular um gesto mínimo de presença sem transformá-lo em promessa, obrigação ou novo critério de fracasso.",

    compatible_primary_signals: [
      "recognition",
      "ambivalence",
      "uncertainty",
      "integration",
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
      "performance_to_belong"
    ],

    minimum_readiness: 2,
    maximum_load: 2,
    minimum_depth: 2,

    intensity: "deep",

    allow_private_mode: true,
    allow_skip: true,

    analyze_by_default: false,

    origin: "igent_companion",

    completion_mode:
      "guided_three_steps",

    estimated_minutes: 7,

    opening_instruction:
      "Escreva uma possibilidade, não uma promessa. Também é válido registrar que ainda não sabe.",

    steps: [
      "Reconheça o momento de saída.",
      "Escolha um gesto pequeno.",
      "Retire qualquer exigência de perfeição."
    ],

    canonical_relation: {
      canonical_section_ids: [
        "p01_section_presence",
        "p01_section_support_letter",
        "p01_section_anchor",
        "p01_section_closure"
      ],

      relation_type:
        "supports_closure",

      description:
        "Apoia o fechamento do pilar e a preparação opcional para a Carta de Sustentação ou para o Ritual."
    },

    memory_policy:
      DEFAULT_JOURNAL_MEMORY_POLICY,

    analysis_policy: {
      ...DEFAULT_JOURNAL_ANALYSIS_POLICY,

      allowed_extractions: [
        "escape_movement",
        "return_phrase",
        "minimum_presence_gesture",
        "reader_correction",
        "meaningful_excerpt"
      ],

      maximum_interpretation_confidence:
        "medium",

      create_open_thread_when_supported:
        true
    },

    stop_rule: {
      enabled: true,

      conditions: [
        "commitment_becomes_self_demand",
        "reader_creates_perfection_rule",
        "load_level_reaches_3",
        "reader_requests_stop"
      ],

      visible_instruction:
        "Retire a promessa. Você pode deixar apenas uma possibilidade ou encerrar sem definir um gesto.",

      fallback_intervention:
        "micro_return",

      fallback_content_id:
        "p01_mr_pres_06"
    },

    minimum_characters: 0,
    maximum_characters: 4000,

    allow_empty_submission: true,
    allow_delete_after_writing: true,

    active: true
  };


//////////////////////////////////////////////////
// 9. PACOTE COMPLETO
//////////////////////////////////////////////////

export const PILLAR_01_JOURNAL_PROMPTS:
  CompanionJournalPrompt[] = [
    P01_JOURNAL_CONS_01,
    P01_JOURNAL_CONS_02,

    P01_JOURNAL_JUDG_01,
    P01_JOURNAL_JUDG_02,

    P01_JOURNAL_PRES_01,
    P01_JOURNAL_PRES_02
  ];


//////////////////////////////////////////////////
// 10. SUBMISSÃO DO DIÁRIO
//////////////////////////////////////////////////

export interface CompanionJournalSubmission {
  id: string;

  reader_id: string;

  journal_prompt_id: string;
  pillar_id: PillarId;
  phase: PillarPhase;

  content?: string;

  privacy_mode:
    JournalPrivacyMode;

  analysis_consent: boolean;
  memory_consent: boolean;
  exact_excerpt_consent: boolean;

  submitted_empty: boolean;
  deleted_after_writing: boolean;

  started_at: string;
  submitted_at?: string;
  deleted_at?: string;
}


//////////////////////////////////////////////////
// 11. RESULTADO DE ANÁLISE
//////////////////////////////////////////////////

export interface JournalExtractedEvidence {
  type: JournalExtractionType;

  summary: string;

  exact_excerpt?: string;

  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];

  confidence:
    InterpretationConfidence;

  source_submission_id: string;
}

export interface JournalAnalysisResult {
  submission_id: string;
  journal_prompt_id: string;

  analyzed: boolean;

  extracted_evidence:
    JournalExtractedEvidence[];

  possible_memory_candidate?:
    JournalMemoryCandidate;

  safety_interrupted: boolean;

  validation_errors: string[];
}

export interface JournalMemoryCandidate {
  layer:
    | "session"
    | "pillar"
    | "journey";

  summary: string;

  meaningful_excerpt?: string;

  related_primary_signals:
    PrimarySignal[];

  related_secondary_signals:
    SecondarySignal[];

  related_pillar_signals: string[];

  confidence:
    InterpretationConfidence;

  requires_confirmation: true;
}


//////////////////////////////////////////////////
// 12. ANÁLISE COM CONSENTIMENTO
//////////////////////////////////////////////////

export function analyzeJournalSubmission(
  prompt: CompanionJournalPrompt,
  submission: CompanionJournalSubmission
): JournalAnalysisResult {
  const errors: string[] = [];

  if (
    !submission.analysis_consent ||
    submission.privacy_mode === "private"
  ) {
    return {
      submission_id: submission.id,
      journal_prompt_id: prompt.id,

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
      journal_prompt_id: prompt.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: false,
      validation_errors: []
    };
  }

  const safetyAssessment =
    assessSafetyFromJournal(
      submission.content
    );

  if (
    safetyAssessment.level >= 2
  ) {
    return {
      submission_id: submission.id,
      journal_prompt_id: prompt.id,

      analyzed: false,
      extracted_evidence: [],

      safety_interrupted: true,
      validation_errors: []
    };
  }

  const extractedEvidence =
    extractAllowedJournalEvidence({
      content: submission.content,

      allowed_types:
        prompt.analysis_policy
          .allowed_extractions,

      maximum_confidence:
        prompt.analysis_policy
          .maximum_interpretation_confidence,

      forbidden_inferences:
        prompt.analysis_policy
          .forbidden_inferences
    });

  const memoryCandidate =
    submission.memory_consent
      ? buildJournalMemoryCandidate(
          prompt,
          submission,
          extractedEvidence
        )
      : undefined;

  return {
    submission_id: submission.id,
    journal_prompt_id: prompt.id,

    analyzed: true,

    extracted_evidence:
      extractedEvidence,

    possible_memory_candidate:
      memoryCandidate,

    safety_interrupted: false,

    validation_errors: errors
  };
}


//////////////////////////////////////////////////
// 13. POLÍTICA DE MEMÓRIA
//////////////////////////////////////////////////

export function buildJournalMemoryCandidate(
  prompt: CompanionJournalPrompt,
  submission: CompanionJournalSubmission,
  evidence: JournalExtractedEvidence[]
): JournalMemoryCandidate | undefined {
  if (
    !submission.memory_consent ||
    evidence.length === 0
  ) {
    return undefined;
  }

  const summary =
    buildNonClinicalJournalSummary(
      evidence
    );

  const meaningfulExcerpt =
    submission.exact_excerpt_consent &&
    prompt.memory_policy
      .allow_exact_excerpt_recall
      ? selectMeaningfulExcerpt(
          evidence,
          prompt.memory_policy
            .maximum_excerpt_characters
        )
      : undefined;

  return {
    layer: "pillar",

    summary,

    meaningful_excerpt:
      meaningfulExcerpt,

    related_primary_signals:
      uniquePrimarySignals(evidence),

    related_secondary_signals:
      uniqueSecondarySignals(evidence),

    related_pillar_signals:
      uniquePillarSignals(evidence),

    confidence:
      calculateJournalEvidenceConfidence(
        evidence
      ),

    requires_confirmation: true
  };
}

/**
 * Uma entrada isolada nunca cria:
 *
 * - padrão recorrente;
 * - perfil emocional;
 * - estado permanente;
 * - conclusão sobre origem;
 * - conexão obrigatória entre pilares.
 */


//////////////////////////////////////////////////
// 14. SELEÇÃO DO DIÁRIO
//////////////////////////////////////////////////

export interface JournalSelectionContext {
  pillar_id: PillarId;
  phase: PillarPhase;

  reader_state: ReaderState;

  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];

  readiness_level: ScaleLevel;
  load_level: ScaleLevel;
  depth_level: DepthLevel;

  recently_used_journal_ids: string[];

  reader_requested_writing: boolean;
  reader_rejected_writing: boolean;
}


export function isJournalAvailable(
  prompt: CompanionJournalPrompt,
  context: JournalSelectionContext
): boolean {
  if (!prompt.active) {
    return false;
  }

  if (
    prompt.pillar_id !==
    context.pillar_id
  ) {
    return false;
  }

  if (
    prompt.phase !== context.phase
  ) {
    return false;
  }

  if (
    context.readiness_level <
    prompt.minimum_readiness
  ) {
    return false;
  }

  if (
    context.load_level >
    prompt.maximum_load
  ) {
    return false;
  }

  if (
    context.depth_level <
    prompt.minimum_depth
  ) {
    return false;
  }

  if (
    context.reader_rejected_writing
  ) {
    return false;
  }

  if (
    context.recently_used_journal_ids
      .includes(prompt.id)
  ) {
    return false;
  }

  return true;
}


export function scoreJournalPrompt(
  prompt: CompanionJournalPrompt,
  context: JournalSelectionContext
): number {
  let score = 0;

  if (
    context.reader_requested_writing
  ) {
    score += 100;
  }

  if (
    context.primary_signal &&
    prompt.compatible_primary_signals
      .includes(context.primary_signal)
  ) {
    score += 30;
  }

  const secondaryMatches =
    context.secondary_signals.filter(
      signal =>
        prompt.compatible_secondary_signals
          .includes(signal)
    ).length;

  score += secondaryMatches * 12;

  const pillarMatches =
    context.pillar_specific_signals.filter(
      signal =>
        prompt.compatible_pillar_signals
          .includes(signal)
    ).length;

  score += pillarMatches * 15;

  if (
    prompt.intensity === "light" &&
    context.readiness_level <= 2
  ) {
    score += 15;
  }

  if (
    prompt.intensity === "deep" &&
    context.depth_level < 2
  ) {
    score -= 100;
  }

  return score;
}


export function selectPillar01Journal(
  context: JournalSelectionContext
): CompanionJournalPrompt | null {
  const candidates =
    PILLAR_01_JOURNAL_PROMPTS
      .filter(
        prompt =>
          isJournalAvailable(
            prompt,
            context
          )
      )
      .map(prompt => ({
        prompt,
        score:
          scoreJournalPrompt(
            prompt,
            context
          )
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  return candidates[0]?.prompt ?? null;
}


//////////////////////////////////////////////////
// 15. FALLBACK SEM DIÁRIO
//////////////////////////////////////////////////

export interface JournalFallbackDecision {
  intervention:
    | "anchor"
    | "micro_return"
    | "pause"
    | "closure";

  content_id?: string;
}

export function selectJournalFallback(
  context: JournalSelectionContext
): JournalFallbackDecision {
  if (context.load_level >= 3) {
    return {
      intervention: "pause"
    };
  }

  if (
    context.phase ===
    "consciousness"
  ) {
    return {
      intervention: "micro_return",
      content_id:
        "p01_mr_cons_05"
    };
  }

  if (
    context.phase ===
    "judgment"
  ) {
    return {
      intervention: "micro_return",
      content_id:
        "p01_mr_judg_05"
    };
  }

  if (
    context.phase ===
    "presence"
  ) {
    return {
      intervention: "anchor",
      content_id:
        "p01_anchor_position"
    };
  }

  return {
    intervention: "closure"
  };
}


//////////////////////////////////////////////////
// 16. REGRAS DE EXIBIÇÃO
//////////////////////////////////////////////////

export const JOURNAL_DISPLAY_RULES = {
  show_title: true,
  show_context: true,

  show_all_starter_lines: true,

  maximum_starter_lines: 3,

  show_estimated_time: true,

  show_skip_action: true,
  show_private_mode_first: true,

  show_analysis_toggle: true,
  show_memory_toggle: true,

  analysis_toggle_default: false,
  memory_toggle_default: false,

  never_require_minimum_length: true,

  allow_save_empty: true,
  allow_delete_after_writing: true,

  never_show_progress_score: true,
  never_show_quality_score: true,
  never_show_emotional_score: true,

  never_reward_length: true,
  never_reward_completion: true
};


//////////////////////////////////////////////////
// 17. VALIDAÇÃO INDIVIDUAL
//////////////////////////////////////////////////

export function validateJournalPrompt(
  prompt: CompanionJournalPrompt
): string[] {
  const errors: string[] = [];

  if (!prompt.title.trim()) {
    errors.push(
      `${prompt.id} requires title.`
    );
  }

  if (!prompt.prompt.trim()) {
    errors.push(
      `${prompt.id} requires prompt.`
    );
  }

  if (
    prompt.starter_lines.length > 3
  ) {
    errors.push(
      `${prompt.id} can contain at most 3 starter lines.`
    );
  }

  if (!prompt.allow_private_mode) {
    errors.push(
      `${prompt.id} must allow private mode.`
    );
  }

  if (!prompt.allow_skip) {
    errors.push(
      `${prompt.id} must allow skip.`
    );
  }

  if (prompt.analyze_by_default) {
    errors.push(
      `${prompt.id} cannot enable analysis by default.`
    );
  }

  if (
    prompt.memory_policy
      .storage_default !== "off"
  ) {
    errors.push(
      `${prompt.id} memory must be off by default.`
    );
  }

  if (
    !prompt.analysis_policy
      .explicit_consent_required
  ) {
    errors.push(
      `${prompt.id} requires explicit analysis consent.`
    );
  }

  if (
    prompt.maximum_load > 2
  ) {
    errors.push(
      `${prompt.id} cannot be available above load level 2.`
    );
  }

  if (
    prompt.minimum_characters > 0
  ) {
    errors.push(
      `${prompt.id} cannot require a minimum written length.`
    );
  }

  if (
    !prompt.allow_empty_submission
  ) {
    errors.push(
      `${prompt.id} must allow empty submission.`
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 18. VALIDAÇÃO DO PACOTE
//////////////////////////////////////////////////

export function validatePillar01Journals(
  prompts: CompanionJournalPrompt[]
): string[] {
  const errors: string[] = [];

  if (prompts.length !== 6) {
    errors.push(
      "Pillar I must contain exactly 6 companion journals."
    );
  }

  const phases: PillarPhase[] = [
    "consciousness",
    "judgment",
    "presence"
  ];

  for (const phase of phases) {
    const phasePrompts =
      prompts.filter(
        prompt =>
          prompt.phase === phase
      );

    if (
      phasePrompts.length !== 2
    ) {
      errors.push(
        `${phase} must contain exactly 2 journal prompts.`
      );
    }

    const orders =
      phasePrompts.map(
        prompt =>
          prompt.phase_order
      );

    if (
      !orders.includes(1) ||
      !orders.includes(2)
    ) {
      errors.push(
        `${phase} journal prompts require phase orders 1 and 2.`
      );
    }
  }

  const ids =
    prompts.map(
      prompt => prompt.id
    );

  if (
    new Set(ids).size !==
    ids.length
  ) {
    errors.push(
      "Journal prompt IDs must be unique."
    );
  }

  for (const prompt of prompts) {
    errors.push(
      ...validateJournalPrompt(
        prompt
      )
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 19. PACOTE PUBLICÁVEL
//////////////////////////////////////////////////

export interface Pillar01JournalPackage {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  prompts: CompanionJournalPrompt[];

  validation_errors: string[];

  version: string;

  status:
    | "draft"
    | "review"
    | "approved"
    | "published";
}


export const PILLAR_01_JOURNAL_PACKAGE:
  Pillar01JournalPackage = {
    id:
      "igent_p01_journal_package",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    prompts:
      PILLAR_01_JOURNAL_PROMPTS,

    validation_errors:
      validatePillar01Journals(
        PILLAR_01_JOURNAL_PROMPTS
      ),

    version: "2.0.0",

    status: "approved"
  };


//////////////////////////////////////////////////
// 20. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_14_FINAL_RULES = [
  "All journals belong to the iGent companion layer.",

  "Companion journals must not be presented as canonical book exercises.",

  "Every phase contains exactly two journals.",

  "Every journal is optional.",

  "Private mode must be available before writing begins.",

  "Analysis is disabled by default.",

  "Memory storage is disabled by default.",

  "Explicit consent is required for analysis.",

  "Explicit consent is required for memory storage.",

  "The reader may write and delete the entry immediately.",

  "The reader may submit an empty entry.",

  "Writing length must never be scored or rewarded.",

  "Journal completion must never block reading progression.",

  "One journal entry cannot create a recurring pattern.",

  "Body descriptions cannot be interpreted clinically.",

  "Internal sentences cannot be stored as identity.",

  "Social fear journals must not pressure external disclosure.",

  "The one-minute journal may last less than one minute.",

  "Presence must not become an endurance exercise.",

  "A minimum gesture is a possibility, not a promise.",

  "Refusing a commitment may represent a coherent limit.",

  "When writing increases load, the engine must stop analysis and reduce depth.",

  "When the entry is sufficient, the agent must not ask for more detail."
];
