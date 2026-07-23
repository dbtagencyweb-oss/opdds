import {
  DEFAULT_OPTION_MEMORY_POLICY,
  REQUIRED_SEMANTIC_POSITIONS,
  PILLAR_01_CONSCIOUSNESS_QUESTIONS,
  validatePillar01ConsciousnessQuestions,
  type CanonicalContentReference,
  type CompanionQuestion,
  type CompanionQuestionOption,
  type ContentOrigin,
} from './igentMindPillar01Consciousness';
import {
  PILLAR_01_JUDGMENT_QUESTIONS,
  validatePillar01JudgmentQuestions,
} from './igentMindPillar01Judgment';

const BOOK_ID = 'opdds';

type InterpretationConfidence = 'low' | 'medium' | 'high';
type ReaderMindState = { load_level: number };
type ReaderInteractionEvidence = {
  id: string;
  text?: string;
  option?: CompanionQuestionOption;
  [key: string]: unknown;
};

const extractPossiblePresenceInterval = (_responses: ReaderInteractionEvidence[]) => undefined as string | undefined;
const extractRecognizedEscapeSignal = (_responses: ReaderInteractionEvidence[]) => undefined as string | undefined;
const extractSelectedReturnPhrase = (_responses: ReaderInteractionEvidence[]) => undefined as string | undefined;
const extractReturnPhraseOrigin = (_responses: ReaderInteractionEvidence[]) => undefined as ContentOrigin | undefined;
const extractMinimumPresenceGesture = (_responses: ReaderInteractionEvidence[]) => undefined as string | undefined;
const detectsRejectedForcedCommitment = (_responses: ReaderInteractionEvidence[]) => false;
const detectsSilenceAsReturn = (_responses: ReaderInteractionEvidence[]) => false;
const calculateInterpretationConfidence = (_responses: ReaderInteractionEvidence[]): InterpretationConfidence => 'low';

/**
 * BLOCO 12
 * PILAR I — RECONHECIMENTO
 * FASE: PRESENÇA
 *
 * Conteúdo:
 * - perguntas 7, 8 e 9;
 * - 18 opções semânticas;
 * - respostas minimal, standard e deep;
 * - sinais e efeitos de escala;
 * - rotas de conclusão do pilar.
 *
 * As perguntas são adaptações editoriais aprovadas
 * das práticas canônicas:
 *
 * 1. O minuto sem fuga;
 * 2. A frase de retorno;
 * 3. O contato consigo como interrupção do abandono.
 *
 * As opções e respostas pertencem ao iGentMIND.
 */

//////////////////////////////////////////////////
// 1. EXTENSÃO PARA FRASES CANÔNICAS NAS OPÇÕES
//////////////////////////////////////////////////


//////////////////////////////////////////////////
// 2. REFERÊNCIAS CANÔNICAS
//////////////////////////////////////////////////

export const PILLAR_01_PRESENCE_REFERENCES:
  CanonicalContentReference[] = [
    {
      id: "ref_p01_pres_possible_duration",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 92,
      page_end: 93,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "Por quanto tempo você consegue permanecer com o que sente antes de precisar fugir, explicar ou resolver?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_pres_return_phrase",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 93,
      page_end: 93,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "Qual frase poderia trazer você de volta ao que é real sem tentar motivar, corrigir ou convencer?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_pres_minimum_position",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 92,
      page_end: 97,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "Quando esse estado voltar, qual é o menor gesto possível para não se abandonar imediatamente?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_phrase_i_am_here",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 93,
      page_end: 93,

      origin: "book_exact",

      exact_text:
        "Eu estou aqui.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_phrase_no_explanation",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_presence",

      page_start: 93,
      page_end: 93,

      origin: "book_exact",

      exact_text:
        "Eu não preciso me explicar agora.",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_phrase_no_resolution",

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
      id: "ref_p01_phrase_no_abandonment_to_fit",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_support_letter",

      page_start: 97,
      page_end: 97,

      origin: "book_exact",

      exact_text:
        "Eu não quero mais me abandonar para caber.",

      quote_allowed: true,
      approved: true
    }
  ];


//////////////////////////////////////////////////
// 3. PERGUNTA 7
// PERMANÊNCIA BREVE
//////////////////////////////////////////////////

export const P01_Q_PRES_01:
  CompanionQuestion = {
    id: "p01_q_pres_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_pres_possible_duration",

    phase: "presence",

    phase_order: 1,
    global_order: 7,

    text:
      "Por quanto tempo você consegue permanecer com o que sente antes de precisar fugir, explicar ou resolver?",

    semantic_goal:
      "Reconhecer a capacidade atual de permanecer em contato com o estado sem transformar presença em resistência forçada.",

    internal_hypothesis:
      "O leitor pode possuir algum intervalo entre perceber o estado e obedecer à fuga, mesmo que esse intervalo seja curto.",

    depth: 2,

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available",
      "integrating"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "rigid_control",
      "avoidance",
      "ambivalence",
      "integration"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "control_through_performance",
      "emptiness_avoidance",
      "repetition_awareness",
      "coherent_positioning"
    ],

    compatible_pillar_signals: [
      "body_held_tension",
      "automatic_escape",
      "functioning_without_feeling",
      "self_avoidance",
      "return_to_self"
    ],

    options: [
      {
        id:
          "p01_q_pres_01_opt_recognition",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "recognition",

        visible_text:
          "Consigo permanecer alguns segundos ou até um minuto antes de querer escapar.",

        probable_meaning:
          "O leitor reconhece um intervalo real entre o contato com o estado e o início da fuga.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "Já existe um pequeno intervalo entre perceber e escapar.",

            content_origin:
              "igent_companion",

            maximum_words: 18
          },

          standard: {
            mirror:
              "Você consegue permanecer por algum tempo antes que a fuga assuma o movimento.",

            displacement:
              "Esse intervalo não precisa ser ampliado à força. Primeiro, ele pode apenas ser reconhecido como algo que já existe.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "A fuga não acontece de forma completamente instantânea. Existe um espaço, ainda que curto, em que você percebe o estado e continua presente.",

            displacement:
              "Esse espaço não prova domínio sobre o que sente. Ele apenas mostra que presença e impulso não são exatamente a mesma coisa.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 90
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_01",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_01_opt_minimization",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que permanecer alguns segundos faça diferença.",

        probable_meaning:
          "O leitor reduz o valor de uma permanência curta ou espera que presença produza transformação evidente.",

        primary_signal:
          "minimization",

        secondary_signals: [],

        pillar_specific_signals: [
          "denial_of_current_state"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Alguns segundos podem realmente parecer pequenos demais para mudar alguma coisa.",

            content_origin:
              "igent_companion",

            maximum_words: 22
          },

          standard: {
            mirror:
              "Uma permanência curta parece insuficiente diante do peso do que você sente.",

            displacement:
              "Ela não precisa resolver nem reduzir o estado. Sua função é apenas interromper, por um instante, a saída automática de si.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Você parece medir a presença pelo resultado que ela consegue produzir.",

            displacement:
              "Se o critério for melhorar rapidamente, alguns segundos parecerão irrelevantes. Se o critério for não desaparecer imediatamente, o mesmo intervalo assume outra função.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_pres_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "micro_return",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_04",
          "p01_mr_pres_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_01_opt_defense",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "defense",

        visible_text:
          "Se eu permanecer, temo que o estado aumente ou saia do meu controle.",

        probable_meaning:
          "O contato prolongado é percebido como possibilidade de intensificação, desorganização ou perda de controle.",

        primary_signal:
          "avoidance",

        secondary_signals: [
          "control_through_performance"
        ],

        pillar_specific_signals: [
          "automatic_escape",
          "body_held_tension"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: -1,

          readiness: -1,
          load: 1,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Permanecer parece aumentar o risco de o estado ocupar espaço demais.",

            content_origin:
              "igent_companion",

            maximum_words: 22
          },

          standard: {
            mirror:
              "O receio não está apenas no que você sente, mas no que pode acontecer se continuar em contato.",

            displacement:
              "Presença não exige permanecer até o limite. O limite atual também pode ser reconhecido sem ser vencido.",

            next_move: {
              type: "pause"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "A fuga parece atuar como proteção contra a possibilidade de intensificação ou desorganização.",

            displacement:
              "Não é necessário testar quanto você aguenta. O gesto mais coerente pode ser reconhecer o medo, reduzir a profundidade e não se obrigar a continuar.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "pause",

        alternative_interventions: [
          "anchor",
          "closure"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_03",
          "p01_mr_pres_05"
        ],

        anchor_id:
          "p01_anchor_observe",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_01_opt_ambivalence",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "ambivalence",

        visible_text:
          "Quero permanecer, mas logo começo a procurar uma explicação, distração ou saída.",

        probable_meaning:
          "Existe disposição para contato acompanhada de um movimento automático de fuga ou controle.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "automatic_escape",
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A vontade de permanecer e a procura por uma saída aparecem quase juntas.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "Uma parte tenta ficar. Outra rapidamente procura explicação, distração ou movimento.",

            displacement:
              "A presença não exige eliminar a vontade de escapar. Ela começa quando essa vontade também pode ser percebida.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Você não está completamente fora do estado nem completamente disponível para ele.",

            displacement:
              "Existe uma oscilação entre contato e fuga. Em vez de escolher um lado, você pode reconhecer o instante em que o movimento muda de direção.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "question",
          "journal"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_02",
          "p01_mr_pres_06"
        ],

        journal_prompt_id:
          "p01_journal_pres_01",

        anchor_id:
          "p01_anchor_observe",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_01_opt_desire",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "desire",

        visible_text:
          "Quero aprender a permanecer um pouco sem transformar isso em desafio ou obrigação.",

        probable_meaning:
          "O leitor deseja ampliar presença sem repetir lógica de desempenho, controle ou cobrança.",

        primary_signal:
          "integration",

        secondary_signals: [
          "coherent_positioning"
        ],

        pillar_specific_signals: [
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: -1,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "Permanecer não precisa virar outra prova de desempenho.",

            content_origin:
              "igent_companion",

            maximum_words: 17
          },

          standard: {
            mirror:
              "Você deseja ficar sem transformar a presença em meta, resistência ou obrigação.",

            displacement:
              "O tempo não precisa ser ampliado para provar nada. Pode terminar enquanto o gesto ainda permanece possível.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "Surge uma forma de presença que não depende de superar o estado nem de permanecer por muito tempo.",

            displacement:
              "Isso preserva o sentido do pilar: estar consigo por escolha, não usar a permanência como outra forma de se controlar.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_pres_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "journal",
          "anchor"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_05",
          "p01_mr_pres_06"
        ],

        journal_prompt_id:
          "p01_journal_pres_01",

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_01_opt_uncertainty",

        question_id:
          "p01_q_pres_01",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não sei quanto tempo consigo. Nunca observei esse intervalo.",

        probable_meaning:
          "A duração possível de presença ainda não foi observada ou diferenciada.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "O intervalo ainda não foi observado, e não precisa ser estimado agora.",

            content_origin:
              "igent_companion",

            maximum_words: 22
          },

          standard: {
            mirror:
              "Você ainda não sabe em que momento o contato se transforma em fuga.",

            displacement:
              "Não é necessário medir com precisão. Pode bastar perceber a primeira vontade de mudar de assunto, buscar estímulo ou resolver.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "A passagem entre presença e fuga ainda acontece sem receber muita atenção.",

            displacement:
              "O primeiro movimento não é aumentar o tempo. É reconhecer o ponto de transição quando ele aparecer.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "question",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_pres_02"
        ],

        micro_return_ids: [
          "p01_mr_pres_01",
          "p01_mr_pres_05"
        ],

        anchor_id:
          "p01_anchor_observe",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      }
    ],

    open_response: {
      enabled: true,

      label:
        "Escreva com suas próprias palavras",

      placeholder:
        "Antes de procurar uma saída, eu consigo permanecer por...",

      minimum_characters_for_analysis: 20,
      maximum_characters: 4000,

      allow_skip: true,
      allow_private_mode: true,
      allow_memory_storage_choice: true,

      analysis_priority: 3
    },

    prerequisite_question_ids: [],
    blocked_by_question_ids: [],

    can_skip: true,
    active: true
  };


//////////////////////////////////////////////////
// 4. PERGUNTA 8
// FRASE DE RETORNO
//////////////////////////////////////////////////

export const P01_Q_PRES_02:
  CompanionQuestion = {
    id: "p01_q_pres_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_pres_return_phrase",

    phase: "presence",

    phase_order: 2,
    global_order: 8,

    text:
      "Qual frase poderia trazer você de volta ao que é real sem tentar motivar, corrigir ou convencer?",

    semantic_goal:
      "Encontrar uma frase simples, verdadeira e não motivacional que ajude o leitor a retornar ao presente.",

    internal_hypothesis:
      "Uma frase curta pode funcionar como orientação de retorno quando não tenta negar, resolver ou substituir o estado.",

    depth: 2,

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available",
      "integrating"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "rigid_control",
      "avoidance",
      "ambivalence",
      "integration"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "coherent_positioning",
      "repetition_awareness",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "automatic_escape",
      "return_to_self",
      "self_invisibility"
    ],

    options: [
      {
        id:
          "p01_q_pres_02_opt_recognition",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "recognition",

        visible_text:
          "Eu estou aqui.",

        visible_text_origin:
          "book_exact",

        visible_text_reference_id:
          "ref_p01_phrase_i_am_here",

        probable_meaning:
          "O leitor escolhe uma frase de localização e presença sem promessa de melhora.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "coherent_positioning"
        ],

        pillar_specific_signals: [
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "A frase não tenta mudar o estado. Apenas localiza você dentro dele.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "“Eu estou aqui” não oferece explicação nem promessa.",

            displacement:
              "Ela apenas interrompe, por um instante, a sensação de que você precisa sair de si para atravessar o que sente.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Você escolhe uma frase que afirma presença, não controle.",

            displacement:
              "Ela não diz que está tudo bem. Não diz que o estado passará. Diz apenas que, enquanto ele existe, você também continua aqui.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_01",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_02_opt_minimization",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "minimization",

        visible_text:
          "Uma frase parece pequena demais para mudar alguma coisa.",

        probable_meaning:
          "O leitor avalia a frase pelo potencial de alterar o estado, não por sua capacidade de orientar retorno.",

        primary_signal:
          "minimization",

        secondary_signals: [],

        pillar_specific_signals: [
          "denial_of_current_state"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A frase realmente não precisa mudar o que está acontecendo.",

            content_origin:
              "igent_companion",

            maximum_words: 19
          },

          standard: {
            mirror:
              "Uma frase curta parece insuficiente diante de um estado complexo.",

            displacement:
              "Ela não foi criada para resolver o estado. Sua função é oferecer um ponto de retorno quando a mente começa a fugir ou se atacar.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Você parece esperar que a frase produza alívio para considerá-la útil.",

            displacement:
              "Neste pilar, utilidade pode significar algo menor: lembrar que o estado existe sem precisar assumir todo o espaço ou expulsar você de si.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_pres_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "micro_return",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_04",
          "p01_mr_pres_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_02_opt_defense",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "defense",

        visible_text:
          "Prefiro não repetir frases. Isso parece artificial ou uma tentativa de me enganar.",

        probable_meaning:
          "O leitor associa frases de retorno a afirmações positivas, artificialidade ou negação do estado.",

        primary_signal:
          "avoidance",

        secondary_signals: [],

        pillar_specific_signals: [
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: 0,

          readiness: -1,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Uma frase que não parece verdadeira não deve ser usada.",

            content_origin:
              "igent_companion",

            maximum_words: 18
          },

          standard: {
            mirror:
              "Você não quer transformar presença em repetição artificial ou pensamento positivo.",

            displacement:
              "Esse limite é coerente com o pilar. A frase só serve quando descreve algo real e não tenta convencer você de uma realidade diferente.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "A resistência parece dirigida menos à presença e mais à sensação de estar usando palavras para apagar o que sente.",

            displacement:
              "Não é necessário repetir nada. O retorno também pode acontecer por silêncio, contato corporal ou simples reconhecimento da vontade de fugir.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "closure"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_03",
          "p01_mr_pres_05"
        ],

        anchor_id:
          "p01_anchor_observe",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_02_opt_ambivalence",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "ambivalence",

        visible_text:
          "Eu não preciso me explicar agora — mas ainda sinto vontade de justificar tudo.",

        visible_text_origin:
          "book_approved_adaptation",

        visible_text_reference_id:
          "ref_p01_phrase_no_explanation",

        probable_meaning:
          "O leitor reconhece uma frase possível, mas ainda percebe forte impulso de explicação ou defesa.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A frase e o impulso de se explicar podem existir ao mesmo tempo.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "Uma parte reconhece que não precisa se explicar agora. Outra continua preparando justificativas.",

            displacement:
              "A frase não precisa eliminar esse impulso. Pode apenas impedir que ele seja obedecido no mesmo instante.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Existe um retorno possível, mas ele ainda convive com a necessidade antiga de tornar o estado compreensível, aceitável ou defensável.",

            displacement:
              "A presença não exige que você pare de se explicar para sempre. Apenas permite um intervalo em que existir venha antes da defesa.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 90
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "journal",
          "anchor"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_02",
          "p01_mr_pres_06"
        ],

        journal_prompt_id:
          "p01_journal_pres_02",

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_02_opt_desire",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "desire",

        visible_text:
          "Eu posso sentir isso sem resolver hoje.",

        visible_text_origin:
          "book_exact",

        visible_text_reference_id:
          "ref_p01_phrase_no_resolution",

        probable_meaning:
          "O leitor escolhe uma frase que separa reconhecimento de solução imediata.",

        primary_signal:
          "integration",

        secondary_signals: [
          "coherent_positioning"
        ],

        pillar_specific_signals: [
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: -1,
          presence: 1,

          readiness: 1,
          load: -1,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "A frase permite sentir sem transformar o estado em tarefa imediata.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "Você escolhe separar o que sente da obrigação de resolver agora.",

            displacement:
              "Isso não significa desistir de agir. Significa retirar da experiência a exigência de produzir uma solução no mesmo momento.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "A frase cria um intervalo entre a existência do estado e a urgência de transformá-lo.",

            displacement:
              "Nesse intervalo, sentir deixa de ser sinônimo de falhar, atrasar ou perder controle. Torna-se apenas algo que está presente hoje.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_05",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_02_opt_uncertainty",

        question_id:
          "p01_q_pres_02",

        semantic_position:
          "uncertainty",

        visible_text:
          "Ainda não encontrei uma frase que pareça verdadeira.",

        probable_meaning:
          "Nenhuma frase disponível representa o estado do leitor de maneira suficientemente honesta.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você não precisa escolher uma frase que não pareça verdadeira.",

            content_origin:
              "igent_companion",

            maximum_words: 19
          },

          standard: {
            mirror:
              "Nenhuma das frases disponíveis parece corresponder ao que existe agora.",

            displacement:
              "O silêncio também pode ser uma forma de retorno. A frase só deve entrar quando não precisar forçar uma experiência que ainda não existe.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "A linguagem ainda não oferece uma frase que você consiga sustentar com honestidade.",

            displacement:
              "Isso não impede presença. Você pode retornar por uma sensação concreta, pelo contato com o corpo ou pela simples percepção de que ainda está procurando palavras.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_name"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "closure"
        ],

        next_question_ids: [
          "p01_q_pres_03"
        ],

        micro_return_ids: [
          "p01_mr_pres_05",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      }
    ],

    open_response: {
      enabled: true,

      label:
        "Escreva uma frase de retorno",

      placeholder:
        "Uma frase verdadeira para este momento seria...",

      minimum_characters_for_analysis: 5,
      maximum_characters: 500,

      allow_skip: true,
      allow_private_mode: true,
      allow_memory_storage_choice: true,

      analysis_priority: 3
    },

    prerequisite_question_ids: [],
    blocked_by_question_ids: [],

    can_skip: true,
    active: true
  };


//////////////////////////////////////////////////
// 5. PERGUNTA 9
// COMPROMISSO MÍNIMO DE NÃO ABANDONO
//////////////////////////////////////////////////

export const P01_Q_PRES_03:
  CompanionQuestion = {
    id: "p01_q_pres_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_presence",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_pres_minimum_position",

    phase: "presence",

    phase_order: 3,
    global_order: 9,

    text:
      "Quando esse estado voltar, qual é o menor gesto possível para não se abandonar imediatamente?",

    semantic_goal:
      "Formular um posicionamento pequeno, concreto e não performático de retorno a si.",

    internal_hypothesis:
      "O leitor pode definir um gesto mínimo de presença sem assumir promessas totais de mudança ou controle.",

    depth: 3,

    compatible_states: [
      "observing",
      "oscillating",
      "available",
      "integrating"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "rigid_control",
      "avoidance",
      "ambivalence",
      "integration"
    ],

    compatible_secondary_signals: [
      "repetition_awareness",
      "coherent_positioning",
      "control_through_performance",
      "silence_to_preserve_bond",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "return_to_self",
      "automatic_escape",
      "internalized_self_attack",
      "self_invisibility",
      "performance_to_belong"
    ],

    options: [
      {
        id:
          "p01_q_pres_03_opt_recognition",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "recognition",

        visible_text:
          "Antes de reagir, posso nomear o que está acontecendo e perceber a vontade de fugir.",

        probable_meaning:
          "O leitor formula um gesto observável que interrompe parcialmente o automatismo.",

        primary_signal:
          "integration",

        secondary_signals: [
          "coherent_positioning",
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 1,
          judgment: -1,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "Seu gesto mínimo é perceber e nomear antes de obedecer ao impulso.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "Você não está prometendo impedir a fuga.",

            displacement:
              "Está criando um pequeno intervalo para reconhecer o estado e a vontade de sair antes que o movimento se torne completamente automático.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "O compromisso não está em controlar a próxima reação, mas em não desaparecer antes de perceber o que acontece.",

            displacement:
              "Esse gesto preserva escolha sem exigir permanência total. Você ainda pode recuar, mas não precisa fazer isso sem reconhecer que estava ali.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "micro_return",
          "closure"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_01",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_observe",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_03_opt_minimization",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que um gesto pequeno consiga mudar um padrão tão antigo.",

        probable_meaning:
          "O leitor avalia o gesto mínimo pela capacidade de eliminar o padrão, não de interromper seu automatismo.",

        primary_signal:
          "minimization",

        secondary_signals: [],

        pillar_specific_signals: [
          "denial_of_current_state"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: -1
        },

        response_variants: {
          minimal: {
            mirror:
              "Um gesto pequeno realmente não apaga um padrão antigo.",

            content_origin:
              "igent_companion",

            maximum_words: 18
          },

          standard: {
            mirror:
              "Você não espera que uma ação mínima tenha força para mudar algo construído durante muito tempo.",

            displacement:
              "Ela não precisa fazer isso. Sua função pode ser apenas introduzir uma interrupção onde antes havia resposta automática.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_pres_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "O gesto parece pequeno quando comparado à idade ou à repetição do padrão.",

            displacement:
              "O pilar não propõe equivalência entre os dois. Um movimento mínimo não desfaz a história; apenas impede que toda repetição continue acontecendo sem presença.",

            next_move: {
              type: "closure"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "micro_return",

        alternative_interventions: [
          "closure",
          "mirror"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_04",
          "p01_mr_pres_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_03_opt_defense",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "defense",

        visible_text:
          "Não quero assumir um compromisso que depois possa virar outra cobrança contra mim.",

        probable_meaning:
          "O leitor protege-se de transformar presença em promessa rígida, obrigação ou novo critério de falha.",

        primary_signal:
          "rigid_control",

        secondary_signals: [
          "control_through_performance"
        ],

        pillar_specific_signals: [
          "internalized_self_attack"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "Você não quer transformar presença em uma nova dívida consigo.",

            content_origin:
              "igent_companion",

            maximum_words: 19
          },

          standard: {
            mirror:
              "Existe receio de que um compromisso de cuidado se transforme rapidamente em cobrança e prova de desempenho.",

            displacement:
              "Por isso, ele não precisa assumir forma de promessa. Pode ser apenas uma possibilidade disponível quando fizer sentido.",

            next_move: {
              type: "closure"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Você reconhece um risco real dentro da própria lógica interna: usar até o cuidado como instrumento de acusação futura.",

            displacement:
              "O gesto mais coerente pode ser não prometer. Presença também significa respeitar o limite sem chamar isso de fracasso.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_pres_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "closure",

        alternative_interventions: [
          "micro_return",
          "anchor"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_03",
          "p01_mr_pres_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_03_opt_ambivalence",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "ambivalence",

        visible_text:
          "Quero voltar para mim, mas ainda não confio que conseguirei permanecer.",

        probable_meaning:
          "Existe desejo de retorno acompanhado de dúvida sobre continuidade, capacidade ou repetição.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "O desejo de voltar existe antes da confiança de que você conseguirá ficar.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "Você deseja retorno, mas ainda não transforma esse desejo em garantia.",

            displacement:
              "Não é necessário confiar na continuidade inteira. O gesto pode valer apenas para o próximo momento em que você perceber que começou a desaparecer de si.",

            next_move: {
              type: "letter",
              content_id:
                "p01_letter_presence"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "A presença começa como intenção, enquanto a experiência passada ainda diz que você provavelmente voltará a fugir.",

            displacement:
              "Essas duas coisas podem coexistir. Retornar não exige a promessa de nunca mais sair; exige apenas que a saída não seja tratada como ponto definitivo.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_pres_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 90
          }
        },

        preferred_intervention:
          "letter",

        alternative_interventions: [
          "journal",
          "micro_return"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_02",
          "p01_mr_pres_06"
        ],

        journal_prompt_id:
          "p01_journal_pres_02",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_03_opt_desire",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "desire",

        visible_text:
          "Eu não quero mais me abandonar para caber.",

        visible_text_origin:
          "book_exact",

        visible_text_reference_id:
          "ref_p01_phrase_no_abandonment_to_fit",

        probable_meaning:
          "O leitor escolhe como posicionamento o reconhecimento de que pertencimento ou adaptação não devem exigir autoabandono.",

        primary_signal:
          "integration",

        secondary_signals: [
          "coherent_positioning",
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "performance_to_belong"
        ],

        scale_effects: {
          awareness: 1,
          judgment: -1,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: -1,
          agency: 1
        },

        response_variants: {
          minimal: {
            mirror:
              "A frase nomeia um limite interno sem exigir que tudo mude agora.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "Seu posicionamento não é deixar de se adaptar em todas as situações.",

            displacement:
              "É começar a reconhecer quando a adaptação exige que você desapareça de si para continuar cabendo.",

            next_move: {
              type: "letter",
              content_id:
                "p01_letter_presence"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "A frase transforma o retorno em um limite: pertencer não deveria depender da sua ausência interna.",

            displacement:
              "Isso não resolve os vínculos nem elimina antigos reflexos. Apenas oferece uma direção para reconhecer quando permanecer fora começa a exigir deserção de si.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_position"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "letter",

        alternative_interventions: [
          "anchor",
          "micro_return"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_05",
          "p01_mr_pres_06"
        ],

        anchor_id:
          "p01_anchor_position",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_pres_03_opt_uncertainty",

        question_id:
          "p01_q_pres_03",

        semantic_position:
          "uncertainty",

        visible_text:
          "Ainda não sei qual gesto seria possível sem parecer forçado.",

        probable_meaning:
          "O leitor ainda não encontrou um posicionamento concreto que seja pequeno, verdadeiro e sustentável.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você não precisa formular um gesto antes que ele pareça verdadeiro.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Nenhum compromisso parece suficientemente natural ou possível agora.",

            displacement:
              "A fase pode terminar sem uma resposta pronta. Reconhecer que você ainda não sabe também impede uma promessa artificial.",

            next_move: {
              type: "closure"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "O retorno ainda não encontrou uma forma concreta que você consiga sustentar sem transformá-la em encenação ou cobrança.",

            displacement:
              "Não é necessário preencher esse espaço. O pilar pode permanecer aberto até que um gesto real apareça na experiência, não apenas na resposta.",

            next_move: {
              type: "closure"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "closure",

        alternative_interventions: [
          "micro_return",
          "anchor"
        ],

        next_question_ids: [],

        micro_return_ids: [
          "p01_mr_pres_05",
          "p01_mr_pres_06"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      }
    ],

    open_response: {
      enabled: true,

      label:
        "Escreva com suas próprias palavras",

      placeholder:
        "Quando esse estado voltar, eu posso...",

      minimum_characters_for_analysis: 10,
      maximum_characters: 1000,

      allow_skip: true,
      allow_private_mode: true,
      allow_memory_storage_choice: true,

      analysis_priority: 3
    },

    prerequisite_question_ids: [],
    blocked_by_question_ids: [],

    can_skip: true,
    active: true
  };


//////////////////////////////////////////////////
// 6. PACOTE DA FASE PRESENÇA
//////////////////////////////////////////////////

export const PILLAR_01_PRESENCE_QUESTIONS:
  CompanionQuestion[] = [
    P01_Q_PRES_01,
    P01_Q_PRES_02,
    P01_Q_PRES_03
  ];


//////////////////////////////////////////////////
// 7. PROGRESSÃO E CONCLUSÃO
//////////////////////////////////////////////////

export const PILLAR_01_PRESENCE_PROGRESSION = {
  minimum_requirements: {
    awareness_level: 2,
    presence_level: 2,
    maximum_load_level: 2
  },

  meaningful_markers: [
    "possible_presence_interval_recognized",
    "escape_transition_recognized",
    "return_phrase_selected",
    "silence_selected_as_return",
    "minimum_non_abandonment_gesture_defined",
    "performance_separated_from_presence",
    "reader_chose_to_close_without_position"
  ],

  completion_when_any: [
    "return_phrase_selected",
    "minimum_non_abandonment_gesture_defined",
    "escape_transition_recognized",
    "reader_chose_to_close_without_position",
    "reader_requested_canonical_anchor",
    "reader_requested_to_continue_reading"
  ],

  integration_when_any: [
    "reader_names_state_without_immediate_attack",
    "reader_recognizes_escape_before_acting",
    "reader_selects_true_return_phrase",
    "reader_defines_small_presence_gesture",
    "reader_separates_belonging_from_self_abandonment"
  ],

  do_not_require: [
    "continuous_presence",
    "absence_of_escape",
    "emotional_improvement",
    "behavior_change",
    "confidence_in_future",
    "completion_of_guided_letter",
    "completion_of_canonical_ritual"
  ]
};


//////////////////////////////////////////////////
// 8. ROTEAMENTO APÓS A PERGUNTA 9
//////////////////////////////////////////////////

export type Pillar01PostPresenceRoute =
  | "open_support_letter"
  | "open_canonical_anchor"
  | "open_companion_letter"
  | "open_companion_journal"
  | "show_micro_return"
  | "close_reflection"
  | "continue_reading";

export interface Pillar01PostPresenceDecision {
  route: Pillar01PostPresenceRoute;

  content_id?: string;

  update_pillar_memory: boolean;
  mark_reflective_phase_complete: boolean;

  reader_can_skip: true;
}

export function selectPillar01PostPresenceRoute(
  state: ReaderMindState,
  lastOption?: CompanionQuestionOption
): Pillar01PostPresenceDecision {
  if (state.load_level >= 3) {
    return {
      route: "close_reflection",

      update_pillar_memory: false,
      mark_reflective_phase_complete: true,

      reader_can_skip: true
    };
  }

  if (
    lastOption?.semantic_position ===
    "desire"
  ) {
    return {
      route: "open_support_letter",

      content_id:
        "p01_section_support_letter",

      update_pillar_memory: true,
      mark_reflective_phase_complete: true,

      reader_can_skip: true
    };
  }

  if (
    lastOption?.semantic_position ===
      "recognition" ||
    lastOption?.semantic_position ===
      "ambivalence"
  ) {
    return {
      route: "open_canonical_anchor",

      content_id:
        "p01_section_anchor",

      update_pillar_memory: true,
      mark_reflective_phase_complete: true,

      reader_can_skip: true
    };
  }

  if (
    lastOption?.semantic_position ===
      "defense" ||
    lastOption?.semantic_position ===
      "uncertainty"
  ) {
    return {
      route: "close_reflection",

      update_pillar_memory: false,
      mark_reflective_phase_complete: true,

      reader_can_skip: true
    };
  }

  return {
    route: "continue_reading",

    content_id:
      "p01_section_support_letter",

    update_pillar_memory: false,
    mark_reflective_phase_complete: true,

    reader_can_skip: true
  };
}


//////////////////////////////////////////////////
// 9. ATUALIZAÇÃO DA MEMÓRIA
//////////////////////////////////////////////////

export interface Pillar01PresenceMemoryCandidate {
  possible_presence_interval?: string;
  recognized_escape_signal?: string;

  selected_return_phrase?: string;
  selected_return_phrase_origin?:
    ContentOrigin;

  minimum_non_abandonment_gesture?: string;

  reader_rejected_forced_commitment: boolean;
  reader_chose_silence_as_return: boolean;

  evidence_source_ids: string[];
  confidence: InterpretationConfidence;
}

export function buildPillar01PresenceMemoryCandidate(
  responses: ReaderInteractionEvidence[]
): Pillar01PresenceMemoryCandidate {
  return {
    possible_presence_interval:
      extractPossiblePresenceInterval(
        responses
      ),

    recognized_escape_signal:
      extractRecognizedEscapeSignal(
        responses
      ),

    selected_return_phrase:
      extractSelectedReturnPhrase(
        responses
      ),

    selected_return_phrase_origin:
      extractReturnPhraseOrigin(
        responses
      ),

    minimum_non_abandonment_gesture:
      extractMinimumPresenceGesture(
        responses
      ),

    reader_rejected_forced_commitment:
      detectsRejectedForcedCommitment(
        responses
      ),

    reader_chose_silence_as_return:
      detectsSilenceAsReturn(
        responses
      ),

    evidence_source_ids:
      responses.map(
        response => response.id
      ),

    confidence:
      calculateInterpretationConfidence(
        responses
      )
  };
}

/**
 * Regras:
 *
 * 1. Não salvar opção fechada como posicionamento
 *    confirmado sem resposta aberta ou repetição.
 *
 * 2. Uma frase canônica selecionada pode ser salva
 *    como preferência de retorno, não como padrão.
 *
 * 3. Não registrar duração de presença como capacidade
 *    permanente do leitor.
 *
 * 4. Recusar compromisso pode representar limite
 *    coerente, não resistência.
 *
 * 5. Escolher silêncio pode ser tratado como forma
 *    válida de retorno.
 */


//////////////////////////////////////////////////
// 10. VALIDAÇÃO
//////////////////////////////////////////////////

export function validatePillar01PresenceQuestions(
  questions: CompanionQuestion[]
): string[] {
  const errors: string[] = [];

  if (questions.length !== 3) {
    errors.push(
      "Pillar I presence phase must contain 3 questions."
    );
  }

  const optionCount = questions.reduce(
    (total, question) =>
      total + question.options.length,
    0
  );

  if (optionCount !== 18) {
    errors.push(
      "Pillar I presence phase must contain 18 options."
    );
  }

  for (const question of questions) {
    if (
      question.phase !== "presence"
    ) {
      errors.push(
        `${question.id} must belong to presence.`
      );
    }

    if (
      question.question_origin !==
      "book_approved_adaptation"
    ) {
      errors.push(
        `${question.id} must use approved adaptation origin.`
      );
    }

    if (
      !question.canonical_reference_id
    ) {
      errors.push(
        `${question.id} requires canonical reference.`
      );
    }

    if (question.options.length !== 6) {
      errors.push(
        `${question.id} must contain 6 options.`
      );
    }

    const positions =
      question.options.map(
        option =>
          option.semantic_position
      );

    for (
      const requiredPosition
      of REQUIRED_SEMANTIC_POSITIONS
    ) {
      if (
        !positions.includes(
          requiredPosition
        )
      ) {
        errors.push(
          `${question.id} is missing ${requiredPosition}.`
        );
      }
    }

    for (const option of question.options) {
      if (
        option.interpretation_confidence !==
        "low"
      ) {
        errors.push(
          `${option.id} must start with low confidence.`
        );
      }

      if (
        option.memory_policy.create_pattern
      ) {
        errors.push(
          `${option.id} cannot create a recurring pattern.`
        );
      }

      if (
        option.visible_text_origin ===
          "book_exact" &&
        !option.visible_text_reference_id
      ) {
        errors.push(
          `${option.id} requires an exact-text reference.`
        );
      }
    }
  }

  return errors;
}


//////////////////////////////////////////////////
// 11. PACOTE COMPLETO DAS NOVE PERGUNTAS
//////////////////////////////////////////////////

export const PILLAR_01_ALL_QUESTIONS:
  CompanionQuestion[] = [
    ...PILLAR_01_CONSCIOUSNESS_QUESTIONS,
    ...PILLAR_01_JUDGMENT_QUESTIONS,
    ...PILLAR_01_PRESENCE_QUESTIONS
  ];

export function validatePillar01QuestionPackage(
  questions: CompanionQuestion[]
): string[] {
  const errors: string[] = [];

  if (questions.length !== 9) {
    errors.push(
      "Pillar I must contain exactly 9 companion questions."
    );
  }

  const optionCount = questions.reduce(
    (total, question) =>
      total + question.options.length,
    0
  );

  if (optionCount !== 54) {
    errors.push(
      "Pillar I must contain exactly 54 semantic options."
    );
  }

  const globalOrders =
    questions.map(
      question => question.global_order
    );

  const expectedOrders = [
    1, 2, 3, 4, 5, 6, 7, 8, 9
  ];

  for (const order of expectedOrders) {
    if (!globalOrders.includes(order)) {
      errors.push(
        `Pillar I is missing global question order ${order}.`
      );
    }
  }

  errors.push(
    ...validatePillar01ConsciousnessQuestions(
      PILLAR_01_CONSCIOUSNESS_QUESTIONS
    )
  );

  errors.push(
    ...validatePillar01JudgmentQuestions(
      PILLAR_01_JUDGMENT_QUESTIONS
    )
  );

  errors.push(
    ...validatePillar01PresenceQuestions(
      PILLAR_01_PRESENCE_QUESTIONS
    )
  );

  return errors;
}


//////////////////////////////////////////////////
// 12. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_12_FINAL_RULES = [
  "Presence is not emotional endurance.",

  "Presence must never become a challenge, test or performance target.",

  "The possible duration may be only a few seconds.",

  "The reader must not be encouraged to remain beyond the current limit.",

  "Fear of intensification requires reduced depth or pause.",

  "A return phrase must be true, simple and non-motivational.",

  "Silence may be selected instead of a phrase.",

  "Canonical phrases must retain their exact wording.",

  "A minimum gesture is not a promise of permanent change.",

  "The reader may reject commitments without being classified as resistant.",

  "Not knowing the next gesture is a valid conclusion.",

  "The agent must not require external disclosure.",

  "The agent must not require completion of the canonical ritual.",

  "The support letter and practical anchor remain optional.",

  "Completion of Presence does not mean the reader stopped escaping.",

  "Integration means recognizing and returning with more choice.",

  "The reader may complete the pillar by choosing to close.",

  "After question 9, the engine may offer the canonical support letter, the canonical anchor or continuation of reading."
];