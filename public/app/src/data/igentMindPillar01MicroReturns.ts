import type { DepthLevel, PillarPhase, ReaderState } from './igentMindContract';
import type { PillarId } from './igentMindCanonicalContent';
import type { PrimarySignal, SecondarySignal } from './igentMindSignals';
import type { ScaleLevel } from './igentMindState';
import type { CanonicalContentReference, ContentOrigin } from './igentMindPillar01Consciousness';
import type { MicroReturnFunction } from './igentMindCanonicalContent';

const BOOK_ID = 'opdds';

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
  cooldown_interactions: number;
  priority_weight: number;
  allow_visible_quote: boolean;
  allow_memory_creation: false;
  allow_question_after: boolean;
  active: boolean;
};

const getInteractionIndex = (interactionId: string) => {
  const match = interactionId.match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
};

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

/**
 * BLOCO 13
 * PILAR I — RECONHECIMENTO
 * 18 MICRO-RETORNOS OFICIAIS
 *
 * Distribuição:
 * - 6 em Consciência;
 * - 6 em Julgamento;
 * - 6 em Presença.
 *
 * Funções obrigatórias em cada fase:
 * 1. recognition;
 * 2. contradiction;
 * 3. protection;
 * 4. cost;
 * 5. permission;
 * 6. presence.
 *
 * Um micro-retorno:
 * - não faz diagnóstico;
 * - não confirma padrão;
 * - não exige resposta;
 * - não substitui pergunta;
 * - não inicia aprofundamento;
 * - não deve parecer frase motivacional;
 * - pode encerrar o movimento daquele turno.
 */


//////////////////////////////////////////////////
// 1. EXTENSÃO DO SCHEMA
//////////////////////////////////////////////////


//////////////////////////////////////////////////
// 2. REFERÊNCIAS CANÔNICAS
//////////////////////////////////////////////////

export const PILLAR_01_MICRO_RETURN_REFERENCES:
  CanonicalContentReference[] = [
    {
      id: "ref_p01_mr_recognize_without_explain",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_consciousness",

      page_start: 85,
      page_end: 85,

      origin: "book_exact",

      exact_text:
        "Você não precisa se explicar para reconhecer.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_mr_i_am_here",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_consciousness",

      page_start: 86,
      page_end: 87,

      origin: "book_exact",

      exact_text:
        "Eu estou aqui.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_mr_self_attack",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_judgment",

      page_start: 91,
      page_end: 91,

      origin: "book_exact",

      exact_text:
        "Eu percebo que estou me atacando.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_mr_judgment_mechanism",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_judgment",

      page_start: 90,
      page_end: 91,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "O julgamento pode estar tentando controlar aquilo que parece perigoso sentir.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_mr_feel_without_resolve",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 93,
      page_end: 93,

      origin: "book_exact",

      exact_text:
        "Eu posso sentir isso sem resolver hoje.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_mr_return_as_possible",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_support_letter",

      page_start: 96,
      page_end: 97,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "Você não precisa voltar de forma perfeita. Pode voltar do jeito que consegue.",

      quote_allowed: true,
      approved: true
    }
  ];


//////////////////////////////////////////////////
// 3. CONSCIÊNCIA
//////////////////////////////////////////////////

export const P01_MR_CONS_01:
  CompanionMicroReturn = {
    id: "p01_mr_cons_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "recognition",

    text:
      "Você não precisa se explicar para reconhecer.",

    origin: "book_exact",

    canonical_reference_id:
      "ref_p01_mr_recognize_without_explain",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "self_avoidance",
      "body_held_tension",
      "return_to_self"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 80,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_CONS_02:
  CompanionMicroReturn = {
    id: "p01_mr_cons_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "contradiction",

    text:
      "Continuar funcionando não significa, necessariamente, que você continua presente.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "ambivalence",
      "rigid_control",
      "recognition"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "worth_tied_to_productivity",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "functioning_without_feeling",
      "self_invisibility"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 6,

    priority_weight: 75,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_CONS_03:
  CompanionMicroReturn = {
    id: "p01_mr_cons_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "protection",

    text:
      "A fuga pode ter sido a forma disponível de continuar quando permanecer parecia difícil demais.",

    origin:
      "book_approved_adaptation",

    compatible_primary_signals: [
      "avoidance",
      "rigid_control",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "emptiness_avoidance",
      "pain_normalization",
      "control_through_performance"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "self_avoidance",
      "functioning_without_feeling"
    ],

    compatible_states: [
      "defensive",
      "oscillating",
      "observing"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 6,

    priority_weight: 90,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_CONS_04:
  CompanionMicroReturn = {
    id: "p01_mr_cons_04",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "cost",

    text:
      "Quando tudo vira funcionamento, o que você sente pode continuar existindo sem encontrar você.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "minimization",
      "rigid_control",
      "avoidance",
      "recognition"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "pain_normalization",
      "worth_tied_to_productivity"
    ],

    compatible_pillar_signals: [
      "functioning_without_feeling",
      "self_invisibility",
      "denial_of_current_state"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: false,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 7,

    priority_weight: 65,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_CONS_05:
  CompanionMicroReturn = {
    id: "p01_mr_cons_05",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "permission",

    text:
      "Não saber o nome ainda não impede reconhecer que alguma coisa está presente.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "uncertainty",
      "minimization",
      "ambivalence"
    ],

    compatible_secondary_signals: [],

    compatible_pillar_signals: [
      "body_held_tension",
      "denial_of_current_state"
    ],

    compatible_states: [
      "unmapped",
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 4,

    priority_weight: 95,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_CONS_06:
  CompanionMicroReturn = {
    id: "p01_mr_cons_06",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    phase: "consciousness",
    function: "presence",

    text:
      "Eu estou aqui.",

    origin: "book_exact",

    canonical_reference_id:
      "ref_p01_mr_i_am_here",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "ambivalence",
      "integration"
    ],

    compatible_secondary_signals: [
      "coherent_positioning"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "body_held_tension"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 3,
    cooldown_interactions: 4,

    priority_weight: 85,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


//////////////////////////////////////////////////
// 4. JULGAMENTO
//////////////////////////////////////////////////

export const P01_MR_JUDG_01:
  CompanionMicroReturn = {
    id: "p01_mr_judg_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "recognition",

    text:
      "Eu percebo que estou me atacando.",

    origin: "book_exact",

    canonical_reference_id:
      "ref_p01_mr_self_attack",

    compatible_primary_signals: [
      "self_judgment",
      "recognition",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 90,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_JUDG_02:
  CompanionMicroReturn = {
    id: "p01_mr_judg_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "contradiction",

    text:
      "A voz que diz estar fortalecendo você pode estar apenas tentando calar o que sente.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "self_judgment",
      "rigid_control",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "control_through_performance"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "functioning_without_feeling"
    ],

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: false,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 7,

    priority_weight: 75,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_JUDG_03:
  CompanionMicroReturn = {
    id: "p01_mr_judg_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "protection",

    text:
      "O julgamento pode estar tentando controlar aquilo que parece perigoso sentir.",

    origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_mr_judgment_mechanism",

    compatible_primary_signals: [
      "self_judgment",
      "rigid_control",
      "external_judgment"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "silence_to_preserve_bond"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "performance_to_belong"
    ],

    compatible_states: [
      "defensive",
      "observing",
      "oscillating"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 6,

    priority_weight: 95,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_JUDG_04:
  CompanionMicroReturn = {
    id: "p01_mr_judg_04",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "cost",

    text:
      "Quando continuar depende de se diminuir, a proteção começa a cobrar sua própria presença.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "self_judgment",
      "external_judgment",
      "rigid_control"
    ],

    compatible_secondary_signals: [
      "need_for_approval",
      "control_through_performance",
      "silence_to_preserve_bond"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "self_invisibility",
      "performance_to_belong"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: false,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 7,

    priority_weight: 65,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_JUDG_05:
  CompanionMicroReturn = {
    id: "p01_mr_judg_05",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "permission",

    text:
      "Sentir não transforma você em fraco, ingrato ou incapaz.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "self_judgment",
      "external_judgment",
      "uncertainty",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "need_for_approval"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "performance_to_belong"
    ],

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available"
    ],

    minimum_depth: 1,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 90,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_JUDG_06:
  CompanionMicroReturn = {
    id: "p01_mr_judg_06",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    phase: "judgment",
    function: "presence",

    text:
      "Você não precisa vencer essa voz agora. Precisa apenas não desaparecer diante dela.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "self_judgment",
      "ambivalence",
      "recognition",
      "integration"
    ],

    compatible_secondary_signals: [
      "repetition_awareness",
      "coherent_positioning"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "return_to_self"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 85,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


//////////////////////////////////////////////////
// 5. PRESENÇA
//////////////////////////////////////////////////

export const P01_MR_PRES_01:
  CompanionMicroReturn = {
    id: "p01_mr_pres_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "recognition",

    text:
      "A vontade de fugir também pode ser percebida antes de ser obedecida.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "recognition",
      "avoidance",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "repetition_awareness",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "return_to_self"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 4,

    priority_weight: 90,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_PRES_02:
  CompanionMicroReturn = {
    id: "p01_mr_pres_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "contradiction",

    text:
      "Permanecer não é se obrigar a aguentar até o limite.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "rigid_control",
      "ambivalence",
      "self_judgment"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "pain_normalization"
    ],

    compatible_pillar_signals: [
      "body_held_tension",
      "internalized_self_attack",
      "return_to_self"
    ],

    compatible_states: [
      "defensive",
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 95,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_PRES_03:
  CompanionMicroReturn = {
    id: "p01_mr_pres_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "protection",

    text:
      "Seu limite também faz parte do que precisa ser reconhecido.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "avoidance",
      "rigid_control",
      "uncertainty",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "body_held_tension"
    ],

    compatible_states: [
      "defensive",
      "observing",
      "oscillating"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 4,

    priority_weight: 100,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_PRES_04:
  CompanionMicroReturn = {
    id: "p01_mr_pres_04",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "cost",

    text:
      "Resolver rápido demais pode se tornar outra forma de sair antes de reconhecer.",

    origin: "igent_companion",

    compatible_primary_signals: [
      "rigid_control",
      "avoidance",
      "minimization",
      "recognition"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "automatic_escape",
      "functioning_without_feeling"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: false,
    requires_context_line: true,

    reuse_limit_per_pillar: 1,
    cooldown_interactions: 7,

    priority_weight: 70,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_PRES_05:
  CompanionMicroReturn = {
    id: "p01_mr_pres_05",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "permission",

    text:
      "Eu posso sentir isso sem resolver hoje.",

    origin: "book_exact",

    canonical_reference_id:
      "ref_p01_mr_feel_without_resolve",

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "ambivalence",
      "integration"
    ],

    compatible_secondary_signals: [
      "coherent_positioning",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "automatic_escape"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 3,
    cooldown_interactions: 4,

    priority_weight: 95,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


export const P01_MR_PRES_06:
  CompanionMicroReturn = {
    id: "p01_mr_pres_06",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    phase: "presence",
    function: "presence",

    text:
      "Você não precisa voltar de forma perfeita. Pode voltar do jeito que consegue.",

    origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_mr_return_as_possible",

    compatible_primary_signals: [
      "recognition",
      "ambivalence",
      "integration",
      "uncertainty"
    ],

    compatible_secondary_signals: [
      "coherent_positioning",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "self_invisibility"
    ],

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    minimum_depth: 2,
    maximum_load: 2,

    can_appear_alone: true,
    requires_context_line: false,

    reuse_limit_per_pillar: 2,
    cooldown_interactions: 5,

    priority_weight: 90,

    allow_visible_quote: true,
    allow_memory_creation: false,
    allow_question_after: false,

    active: true
  };


//////////////////////////////////////////////////
// 6. PACOTE COMPLETO
//////////////////////////////////////////////////

export const PILLAR_01_MICRO_RETURNS:
  CompanionMicroReturn[] = [
    P01_MR_CONS_01,
    P01_MR_CONS_02,
    P01_MR_CONS_03,
    P01_MR_CONS_04,
    P01_MR_CONS_05,
    P01_MR_CONS_06,

    P01_MR_JUDG_01,
    P01_MR_JUDG_02,
    P01_MR_JUDG_03,
    P01_MR_JUDG_04,
    P01_MR_JUDG_05,
    P01_MR_JUDG_06,

    P01_MR_PRES_01,
    P01_MR_PRES_02,
    P01_MR_PRES_03,
    P01_MR_PRES_04,
    P01_MR_PRES_05,
    P01_MR_PRES_06
  ];


//////////////////////////////////////////////////
// 7. HISTÓRICO DE UTILIZAÇÃO
//////////////////////////////////////////////////

export interface MicroReturnUsage {
  micro_return_id: string;
  pillar_id: PillarId;

  interaction_id: string;
  phase: PillarPhase;

  selected_for_signal?: string;
  selected_for_state?: ReaderState;

  used_at: string;
}

export interface MicroReturnSelectionContext {
  pillar_id: PillarId;
  phase: PillarPhase;

  reader_state: ReaderState;

  primary_signal?: PrimarySignal;
  secondary_signals: SecondarySignal[];
  pillar_specific_signals: string[];

  depth: DepthLevel;
  load_level: ScaleLevel;

  interaction_index: number;

  recent_usages: MicroReturnUsage[];
  recent_functions: MicroReturnFunction[];
}


//////////////////////////////////////////////////
// 8. DISPONIBILIDADE
//////////////////////////////////////////////////

export function isMicroReturnAvailable(
  item: CompanionMicroReturn,
  context: MicroReturnSelectionContext
): boolean {
  if (!item.active) {
    return false;
  }

  if (
    item.pillar_id !==
    context.pillar_id
  ) {
    return false;
  }

  if (item.phase !== context.phase) {
    return false;
  }

  if (
    context.depth <
    item.minimum_depth
  ) {
    return false;
  }

  if (
    context.load_level >
    item.maximum_load
  ) {
    return false;
  }

  if (
    !item.compatible_states.includes(
      context.reader_state
    )
  ) {
    return false;
  }

  const previousUsages =
    context.recent_usages.filter(
      usage =>
        usage.micro_return_id === item.id
    );

  if (
    previousUsages.length >=
    item.reuse_limit_per_pillar
  ) {
    return false;
  }

  const lastUsage =
    previousUsages.at(-1);

  if (lastUsage) {
    const lastIndex =
      getInteractionIndex(
        lastUsage.interaction_id
      );

    const distance =
      context.interaction_index -
      lastIndex;

    if (
      distance <
      item.cooldown_interactions
    ) {
      return false;
    }
  }

  return true;
}


//////////////////////////////////////////////////
// 9. PONTUAÇÃO
//////////////////////////////////////////////////

export function scoreMicroReturn(
  item: CompanionMicroReturn,
  context: MicroReturnSelectionContext
): number {
  let score = item.priority_weight;

  if (
    context.primary_signal &&
    item.compatible_primary_signals.includes(
      context.primary_signal
    )
  ) {
    score += 30;
  }

  const secondaryMatches =
    context.secondary_signals.filter(
      signal =>
        item.compatible_secondary_signals.includes(
          signal
        )
    ).length;

  score += secondaryMatches * 12;

  const pillarMatches =
    context.pillar_specific_signals.filter(
      signal =>
        item.compatible_pillar_signals.includes(
          signal
        )
    ).length;

  score += pillarMatches * 15;

  if (
    context.recent_functions.at(-1) ===
    item.function
  ) {
    score -= 30;
  }

  const usedCount =
    context.recent_usages.filter(
      usage =>
        usage.micro_return_id === item.id
    ).length;

  score -= usedCount * 20;

  if (
    context.reader_state ===
      "defensive" &&
    item.function === "protection"
  ) {
    score += 25;
  }

  if (
    context.primary_signal ===
      "uncertainty" &&
    item.function === "permission"
  ) {
    score += 25;
  }

  if (
    context.primary_signal ===
      "self_judgment" &&
    item.function === "recognition"
  ) {
    score += 20;
  }

  if (
    context.primary_signal ===
      "integration" &&
    item.function === "presence"
  ) {
    score += 20;
  }

  return score;
}


//////////////////////////////////////////////////
// 10. SELEÇÃO
//////////////////////////////////////////////////

export function selectPillar01MicroReturn(
  context: MicroReturnSelectionContext
): CompanionMicroReturn | null {
  const candidates =
    PILLAR_01_MICRO_RETURNS.filter(
      item =>
        isMicroReturnAvailable(
          item,
          context
        )
    );

  if (candidates.length === 0) {
    return null;
  }

  const ordered = candidates
    .map(item => ({
      item,
      score:
        scoreMicroReturn(
          item,
          context
        )
    }))
    .sort(
      (a, b) =>
        b.score - a.score
    );

  return ordered[0]?.item ?? null;
}


//////////////////////////////////////////////////
// 11. FALLBACKS
//////////////////////////////////////////////////

export const PILLAR_01_MICRO_RETURN_FALLBACKS:
  Record<
    PillarPhase,
    string[]
  > = {
    consciousness: [
      "p01_mr_cons_05",
      "p01_mr_cons_06"
    ],

    judgment: [
      "p01_mr_judg_05",
      "p01_mr_judg_06"
    ],

    presence: [
      "p01_mr_pres_03",
      "p01_mr_pres_05",
      "p01_mr_pres_06"
    ]
  };

export function getMicroReturnFallback(
  phase: PillarPhase,
  context: MicroReturnSelectionContext
): CompanionMicroReturn | null {
  const fallbackIds =
    PILLAR_01_MICRO_RETURN_FALLBACKS[
      phase
    ];

  for (const id of fallbackIds) {
    const item =
      PILLAR_01_MICRO_RETURNS.find(
        microReturn =>
          microReturn.id === id
      );

    if (
      item &&
      isMicroReturnAvailable(
        item,
        context
      )
    ) {
      return item;
    }
  }

  return null;
}


//////////////////////////////////////////////////
// 12. COMPOSIÇÃO VISÍVEL
//////////////////////////////////////////////////

export interface MicroReturnVisibleResponse {
  context_line?: string;
  micro_return_text: string;

  closing_line?: string;

  origin: ContentOrigin;
  canonical_reference_id?: string;

  question_count: 0;
  word_count: number;

  valid: boolean;
}

export function composeMicroReturnResponse(
  item: CompanionMicroReturn,
  contextLine?: string
): MicroReturnVisibleResponse {
  const useContextLine =
    item.requires_context_line &&
    Boolean(contextLine);

  const visibleContext =
    useContextLine
      ? contextLine
      : undefined;

  const wordCount =
    countWords(
      [
        visibleContext,
        item.text
      ]
        .filter(Boolean)
        .join(" ")
    );

  return {
    context_line: visibleContext,

    micro_return_text:
      item.text,

    origin: item.origin,

    canonical_reference_id:
      item.canonical_reference_id,

    question_count: 0,
    word_count: wordCount,

    valid:
      wordCount <= 65
  };
}

/**
 * Regra:
 *
 * Micro-retorno não deve terminar
 * com pergunta.
 *
 * Quando uma pergunta for necessária,
 * ela deve aparecer em outro turno ou
 * ser selecionada como intervenção
 * independente pelo motor de decisão.
 */


//////////////////////////////////////////////////
// 13. REGRAS DE REUTILIZAÇÃO
//////////////////////////////////////////////////

export const MICRO_RETURN_REUSE_RULES = {
  never_repeat_consecutively: true,

  never_repeat_same_function_consecutively:
    true,

  minimum_interactions_between_same_text: 4,

  maximum_micro_returns_per_session: 4,

  maximum_micro_returns_per_phase: 3,

  exact_quote_limit_per_session: 2,

  do_not_use_as_notification: true,

  do_not_use_as_badge_text: true,

  do_not_use_as_progress_reward: true
};


//////////////////////////////////////////////////
// 14. VALIDAÇÃO INDIVIDUAL
//////////////////////////////////////////////////

export function validateMicroReturn(
  item: CompanionMicroReturn
): string[] {
  const errors: string[] = [];

  if (!item.text.trim()) {
    errors.push(
      `${item.id} requires text.`
    );
  }

  if (
    item.origin === "book_exact" &&
    !item.canonical_reference_id
  ) {
    errors.push(
      `${item.id} requires canonical reference for exact text.`
    );
  }

  if (
    item.origin ===
      "book_approved_adaptation" &&
    !item.canonical_reference_id
  ) {
    errors.push(
      `${item.id} requires canonical reference for approved adaptation.`
    );
  }

  if (
    item.maximum_load > 2
  ) {
    errors.push(
      `${item.id} cannot be used above load level 2.`
    );
  }

  if (
    item.allow_memory_creation
  ) {
    errors.push(
      `${item.id} cannot create memory.`
    );
  }

  if (
    item.allow_question_after &&
    item.can_appear_alone
  ) {
    errors.push(
      `${item.id} cannot be both standalone and require a question.`
    );
  }

  if (
    item.reuse_limit_per_pillar < 1
  ) {
    errors.push(
      `${item.id} requires reuse limit of at least 1.`
    );
  }

  if (
    item.cooldown_interactions < 3
  ) {
    errors.push(
      `${item.id} requires cooldown of at least 3 interactions.`
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 15. VALIDAÇÃO DO PACOTE
//////////////////////////////////////////////////

export function validatePillar01MicroReturns(
  items: CompanionMicroReturn[]
): string[] {
  const errors: string[] = [];

  if (items.length !== 18) {
    errors.push(
      "Pillar I must contain exactly 18 micro returns."
    );
  }

  const phases: PillarPhase[] = [
    "consciousness",
    "judgment",
    "presence"
  ];

  const requiredFunctions:
    MicroReturnFunction[] = [
      "recognition",
      "contradiction",
      "protection",
      "cost",
      "permission",
      "presence"
    ];

  for (const phase of phases) {
    const phaseItems =
      items.filter(
        item =>
          item.phase === phase
      );

    if (phaseItems.length !== 6) {
      errors.push(
        `${phase} must contain exactly 6 micro returns.`
      );
    }

    for (
      const requiredFunction
      of requiredFunctions
    ) {
      const functionCount =
        phaseItems.filter(
          item =>
            item.function ===
            requiredFunction
        ).length;

      if (functionCount !== 1) {
        errors.push(
          `${phase} requires exactly one ${requiredFunction} micro return.`
        );
      }
    }
  }

  const ids =
    items.map(
      item => item.id
    );

  if (
    new Set(ids).size !== ids.length
  ) {
    errors.push(
      "Micro return IDs must be unique."
    );
  }

  for (const item of items) {
    errors.push(
      ...validateMicroReturn(item)
    );
  }

  return errors;
}


//////////////////////////////////////////////////
// 16. PUBLICAÇÃO
//////////////////////////////////////////////////

export interface Pillar01MicroReturnPackage {
  id: string;

  pillar_id:
    "pillar_01_reconhecimento";

  canonical_unit_id:
    "unit_pillar_01_reconhecimento";

  items: CompanionMicroReturn[];

  validation_errors: string[];

  version: string;

  status:
    | "draft"
    | "review"
    | "approved"
    | "published";
}

export const PILLAR_01_MICRO_RETURN_PACKAGE:
  Pillar01MicroReturnPackage = {
    id:
      "igent_p01_micro_returns",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    items:
      PILLAR_01_MICRO_RETURNS,

    validation_errors:
      validatePillar01MicroReturns(
        PILLAR_01_MICRO_RETURNS
      ),

    version: "2.0.0",

    status: "approved"
  };


//////////////////////////////////////////////////
// 17. REGRAS EDITORIAIS FINAIS
//////////////////////////////////////////////////

export const BLOCK_13_FINAL_RULES = [
  "Every phase contains exactly six micro returns.",

  "Every phase contains recognition, contradiction, protection, cost, permission and presence.",

  "A micro return does not ask a question.",

  "A micro return does not create memory.",

  "A micro return does not confirm a pattern.",

  "A micro return does not diagnose the reader.",

  "Protection must be recognized before cost is exposed.",

  "Contradiction must not sound confrontational.",

  "Permission must not sound like authorization from an authority figure.",

  "Presence must not promise emotional improvement.",

  "Exact book text requires a canonical reference.",

  "Approved adaptation requires a canonical reference.",

  "Generated companion text must never be attributed to the book.",

  "The same micro return must not appear consecutively.",

  "The same function must not appear consecutively.",

  "No more than four micro returns may appear in one session.",

  "No more than three micro returns may appear in one phase.",

  "Micro returns are unavailable above load level two.",

  "When load reaches three, the engine must prefer mirror, anchor, pause or closure.",

  "The reader is never required to respond to a micro return.",

  "When the micro return is sufficient, the response must stop."
];
