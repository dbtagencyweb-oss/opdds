/**
 * BLOCO 10
 * PILAR I — RECONHECIMENTO
 * FASE: CONSCIÊNCIA
 *
 * Conteúdo:
 * - 3 perguntas canônicas;
 * - 18 opções semânticas;
 * - respostas minimal, standard e deep;
 * - sinais e efeitos de escala;
 * - rotas recomendadas.
 *
 * As perguntas são do livro.
 * As opções e respostas são conteúdos complementares
 * do iGentMIND.
 */

//////////////////////////////////////////////////
// 1. EXTENSÕES DO SCHEMA
//////////////////////////////////////////////////

export type ContentOrigin = 'book_exact' | 'book_approved_adaptation' | 'igent_companion';

const BOOK_ID = 'opdds';

export type SemanticPosition = 'recognition' | 'minimization' | 'defense' | 'ambivalence' | 'desire' | 'uncertainty';

export const REQUIRED_SEMANTIC_POSITIONS: SemanticPosition[] = [
  'recognition',
  'minimization',
  'defense',
  'ambivalence',
  'desire',
  'uncertainty',
];

export type CanonicalContentReference = {
  id: string;
  book_id: string;
  unit_id: string;
  section_id: string;
  page_start: number;
  page_end: number;
  origin: 'book_exact' | 'book_approved_adaptation';
  exact_text?: string;
  approved_adaptation?: string;
  quote_allowed: boolean;
  approved: boolean;
};

export type CompanionQuestionOption = {
  id: string;
  question_id: string;
  semantic_position: SemanticPosition;
  visible_text: string;
  probable_meaning: string;
  memory_policy: OptionMemoryPolicy;
  interpretation_confidence: 'low';
  active: boolean;
  [key: string]: unknown;
};

export type CompanionQuestion = {
  id: string;
  question_origin: ContentOrigin;
  canonical_reference_id?: string;
  phase: 'consciousness' | 'judgment' | 'presence';
  options: CompanionQuestionOption[];
  active: boolean;
  [key: string]: unknown;
};

export interface OptionMemoryPolicy {
  store_selection: boolean;
  store_as_hypothesis: boolean;

  create_pattern: false;
  create_open_thread: false;

  require_open_response_for_pattern: true;
}

export const DEFAULT_OPTION_MEMORY_POLICY:
  OptionMemoryPolicy = {
    store_selection: true,
    store_as_hypothesis: true,

    create_pattern: false,
    create_open_thread: false,

    require_open_response_for_pattern: true
  };


//////////////////////////////////////////////////
// 2. REFERÊNCIAS CANÔNICAS
//////////////////////////////////////////////////

export const PILLAR_01_CONSCIOUSNESS_REFERENCES:
  CanonicalContentReference[] = [
    {
      id: "ref_p01_cons_question_state",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_consciousness",

      page_start: 85,
      page_end: 86,

      origin: "book_exact",

      exact_text:
        "O que em mim está pedindo para ser visto e eu estou ignorando?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_cons_question_body",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_consciousness",

      page_start: 86,
      page_end: 86,

      origin: "book_exact",

      exact_text:
        "Onde meu corpo está segurando o que eu não admito?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_cons_question_sentence",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_consciousness",

      page_start: 86,
      page_end: 87,

      origin: "book_exact",

      exact_text:
        "Qual é a frase interna que eu repito sobre mim quando ninguém está vendo?",

      quote_allowed: true,
      approved: true
    }
  ];


//////////////////////////////////////////////////
// 3. PERGUNTA 1
// O ESTADO QUE ESTÁ SENDO IGNORADO
//////////////////////////////////////////////////

export const P01_Q_CONS_01:
  CompanionQuestion = {
    id: "p01_q_cons_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    question_origin: "book_exact",

    canonical_reference_id:
      "ref_p01_cons_question_state",

    phase: "consciousness",

    phase_order: 1,
    global_order: 1,

    text:
      "O que em mim está pedindo para ser visto e eu estou ignorando?",

    semantic_goal:
      "Reconhecer o estado, necessidade ou conflito que permanece fora da atenção consciente.",

    internal_hypothesis:
      "O leitor pode estar funcionando enquanto evita contato com algo que já produz sinais internos.",

    depth: 1,

    compatible_states: [
      "unmapped",
      "observing",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "avoidance",
      "ambivalence",
      "rigid_control"
    ],

    compatible_secondary_signals: [
      "control_through_performance",
      "pain_normalization",
      "emptiness_avoidance",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "self_avoidance",
      "denial_of_current_state",
      "functioning_without_feeling",
      "self_invisibility",
      "automatic_escape"
    ],

    options: [
      {
        id:
          "p01_q_cons_01_opt_recognition",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "recognition",

        visible_text:
          "Há algo específico que eu já consigo perceber, mas continuo adiando.",

        probable_meaning:
          "O leitor reconhece a existência de um estado ou conflito, mas ainda evita contato direto.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "self_avoidance"
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
              "Você já percebe que existe algo pedindo espaço, mesmo que ainda esteja adiando esse encontro.",

            content_origin:
              "igent_companion",

            maximum_words: 32
          },

          standard: {
            mirror:
              "Você já consegue reconhecer que algo está sendo deixado de lado.",

            displacement:
              "Não é necessário abrir toda a história agora. O primeiro movimento é admitir que isso existe e merece ser visto.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Algo já se tornou visível, mas ainda encontra adiamento quando tenta ocupar espaço.",

            displacement:
              "Adiar pode ter sido a forma disponível de continuar. Reconhecer não exige retirar toda a proteção; exige apenas não tratar o que aparece como ruído descartável.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 95
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_01",
          "p01_mr_cons_06"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_01_opt_minimization",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que exista algo importante sendo ignorado.",

        probable_meaning:
          "O leitor não reconhece conteúdo relevante ou reduz a importância dos sinais atuais.",

        primary_signal:
          "minimization",

        secondary_signals: [
          "pain_normalization"
        ],

        pillar_specific_signals: [
          "denial_of_current_state"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Talvez realmente não exista algo claro agora. Não é necessário produzir uma resposta.",

            content_origin:
              "igent_companion",

            maximum_words: 28
          },

          standard: {
            mirror:
              "Nem todo estado chega com intensidade suficiente para parecer importante.",

            displacement:
              "Por enquanto, não é necessário decidir se existe algo grande. Basta observar se alguma sensação, frase ou incômodo retorna.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Neste momento, nada parece importante o bastante para receber atenção.",

            displacement:
              "Isso pode significar que realmente não há algo claro ou que você se acostumou a medir o que sente apenas quando se torna impossível ignorar. Uma única resposta não permite decidir.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 95
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "micro_return",
          "closure"
        ],

        next_question_ids: [
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_04",
          "p01_mr_cons_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_01_opt_defense",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "defense",

        visible_text:
          "Prefiro não olhar para isso agora. Continuar funcionando parece mais seguro.",

        probable_meaning:
          "O funcionamento pode estar sendo usado como proteção contra contato interno.",

        primary_signal:
          "avoidance",

        secondary_signals: [
          "control_through_performance"
        ],

        pillar_specific_signals: [
          "functioning_without_feeling",
          "automatic_escape"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: -1,

          readiness: -1,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Continuar funcionando pode ser a proteção disponível agora. Não precisamos retirá-la.",

            content_origin:
              "igent_companion",

            maximum_words: 26
          },

          standard: {
            mirror:
              "Continuar em movimento parece oferecer mais segurança do que parar para perceber.",

            displacement:
              "O reconhecimento não precisa interromper sua capacidade de funcionar. Pode apenas mostrar que existe uma proteção trabalhando.",

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
              "O funcionamento parece cumprir uma função importante: impedir que algo interno ocupe espaço demais.",

            displacement:
              "Essa proteção pode ter sido necessária. O custo aparece quando continuar deixa de ser escolha e se torna a única forma permitida de existir.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 90
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "mirror",
          "pause",
          "closure"
        ],

        next_question_ids: [
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_03",
          "p01_mr_cons_05"
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
          "p01_q_cons_01_opt_ambivalence",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "ambivalence",

        visible_text:
          "Uma parte quer olhar. Outra teme o que pode aparecer.",

        probable_meaning:
          "Existe abertura para reconhecimento acompanhada de receio ou necessidade de proteção.",

        primary_signal:
          "ambivalence",

        secondary_signals: [],

        pillar_specific_signals: [
          "self_avoidance",
          "return_to_self"
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
              "As duas partes podem existir ao mesmo tempo: a que quer perceber e a que tenta proteger.",

            content_origin:
              "igent_companion",

            maximum_words: 29
          },

          standard: {
            mirror:
              "Existe vontade de olhar e, ao mesmo tempo, receio do que esse olhar pode revelar.",

            displacement:
              "Nenhuma das duas posições precisa vencer agora. O reconhecimento pode avançar apenas até onde a proteção ainda permite.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "A aproximação e o recuo aparecem juntos.",

            displacement:
              "Isso não precisa ser tratado como indecisão. Uma parte pode estar tentando retornar, enquanto outra ainda associa esse retorno a risco ou sobrecarga.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_cons_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "journal",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_02",
          "p01_mr_cons_05"
        ],

        journal_prompt_id:
          "p01_journal_cons_01",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_01_opt_desire",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "desire",

        visible_text:
          "Quero conseguir reconhecer o que existe sem precisar resolver tudo.",

        probable_meaning:
          "O leitor demonstra abertura para presença sem exigir solução imediata.",

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
              "Reconhecer sem resolver já é uma forma de permanecer.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Você deseja criar espaço entre perceber e tentar corrigir.",

            displacement:
              "Esse intervalo é importante. Ele permite que o estado exista como experiência antes de ser transformado em tarefa.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Existe uma disposição para reconhecer sem transformar imediatamente o que aparece em problema.",

            displacement:
              "Isso não elimina a necessidade futura de agir. Apenas impede que a urgência de resolver interrompa o primeiro contato com o estado real.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
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
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
        ],

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_01_opt_uncertainty",

        question_id:
          "p01_q_cons_01",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não sei. Só percebo que alguma coisa não está bem.",

        probable_meaning:
          "Existe percepção de desconforto sem linguagem ou compreensão suficiente.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [
          "denial_of_current_state",
          "body_held_tension"
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
              "Perceber que algo não está bem já é informação suficiente por enquanto.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "Ainda não existe uma palavra clara, mas existe percepção de que algo está presente.",

            displacement:
              "Não saber a origem ou o nome não invalida o estado. Podemos começar por um sinal mais concreto.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "O estado ainda não encontrou linguagem suficiente.",

            displacement:
              "A mente costuma exigir explicação para considerar algo legítimo. Aqui, a falta de explicação não impede o reconhecimento de que existe um desconforto.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_cons_02"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
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
        "O que está pedindo para ser visto agora?",

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
// 4. PERGUNTA 2
// O REGISTRO CORPORAL
//////////////////////////////////////////////////

export const P01_Q_CONS_02:
  CompanionQuestion = {
    id: "p01_q_cons_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    question_origin: "book_exact",

    canonical_reference_id:
      "ref_p01_cons_question_body",

    phase: "consciousness",

    phase_order: 2,
    global_order: 2,

    text:
      "Onde meu corpo está segurando o que eu não admito?",

    semantic_goal:
      "Localizar uma manifestação corporal presente sem transformá-la em diagnóstico ou explicação.",

    internal_hypothesis:
      "O corpo pode oferecer um ponto concreto de reconhecimento quando a linguagem ainda permanece abstrata.",

    depth: 1,

    compatible_states: [
      "unmapped",
      "observing",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "avoidance",
      "ambivalence",
      "rigid_control"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "control_through_performance",
      "emptiness_avoidance"
    ],

    compatible_pillar_signals: [
      "body_held_tension",
      "functioning_without_feeling",
      "denial_of_current_state",
      "automatic_escape"
    ],

    options: [
      {
        id:
          "p01_q_cons_02_opt_recognition",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "recognition",

        visible_text:
          "Percebo tensão, peso ou aperto em uma região específica.",

        probable_meaning:
          "O leitor consegue localizar uma sensação corporal presente.",

        primary_signal:
          "recognition",

        secondary_signals: [],

        pillar_specific_signals: [
          "body_held_tension"
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
              "Seu corpo já oferece uma localização concreta para o que ainda não encontrou palavras.",

            content_origin:
              "igent_companion",

            maximum_words: 27
          },

          standard: {
            mirror:
              "Você consegue localizar uma sensação específica no corpo.",

            displacement:
              "Não é necessário explicar o que ela significa. Por enquanto, reconhecer sua presença já é suficiente.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "O corpo está oferecendo um ponto de contato concreto.",

            displacement:
              "Essa sensação não confirma uma causa nem define o que você vive. Ela apenas mostra que existe algo presente antes que a mente consiga organizar uma explicação.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "journal",
          "anchor"
        ],

        next_question_ids: [
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_01",
          "p01_mr_cons_06"
        ],

        journal_prompt_id:
          "p01_journal_cons_02",

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_02_opt_minimization",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "minimization",

        visible_text:
          "Meu corpo parece normal. Talvez isso não tenha relação com o que sinto.",

        probable_meaning:
          "O leitor não identifica sinal corporal ou reduz sua possível relevância.",

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
              "Pode ser que não exista um sinal corporal claro agora.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Nem todo estado aparece como tensão ou desconforto corporal perceptível.",

            displacement:
              "Não é necessário encontrar uma sensação para validar a experiência. A ausência de um sinal claro também pode ser reconhecida.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Seu corpo não apresenta um sinal que você consiga localizar agora.",

            displacement:
              "Isso não confirma nem descarta qualquer leitura. O objetivo não é procurar sintomas, mas perceber honestamente o que está ou não está disponível.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_02_opt_defense",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "defense",

        visible_text:
          "Prefiro não prestar atenção ao corpo porque isso me deixa mais inquieto.",

        probable_meaning:
          "A atenção corporal parece aumentar desconforto e aciona proteção ou recuo.",

        primary_signal:
          "avoidance",

        secondary_signals: [],

        pillar_specific_signals: [
          "automatic_escape",
          "body_held_tension"
        ],

        scale_effects: {
          awareness: 0,
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
              "Não é necessário insistir na atenção corporal quando ela aumenta sua inquietação.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "Prestar atenção ao corpo parece aumentar o desconforto em vez de oferecer clareza.",

            displacement:
              "O reconhecimento não exige que você permaneça além do que consegue. Podemos reduzir a profundidade e seguir por outro ponto.",

            next_move: {
              type: "pause"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "A atenção corporal parece acionar uma necessidade imediata de se afastar.",

            displacement:
              "Essa reação pode ser proteção. Não é necessário vencê-la. O limite atual também faz parte do que está sendo reconhecido.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "pause",

        alternative_interventions: [
          "anchor",
          "closure"
        ],

        next_question_ids: [
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_03",
          "p01_mr_cons_05"
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
          "p01_q_cons_02_opt_ambivalence",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "ambivalence",

        visible_text:
          "Percebo alguma coisa, mas não sei se é emoção, cansaço ou apenas tensão.",

        probable_meaning:
          "Existe percepção corporal, mas ainda não há diferenciação ou linguagem suficiente.",

        primary_signal:
          "ambivalence",

        secondary_signals: [],

        pillar_specific_signals: [
          "body_held_tension"
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
              "Você percebe a sensação, mesmo sem conseguir definir sua origem.",

            content_origin:
              "igent_companion",

            maximum_words: 22
          },

          standard: {
            mirror:
              "Existe uma sensação disponível, mas seu significado ainda não está claro.",

            displacement:
              "Não é necessário decidir se ela vem de emoção, cansaço ou tensão. Primeiro, ela pode apenas ser nomeada como sensação presente.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_name"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "O corpo oferece um sinal, enquanto a mente busca classificá-lo.",

            displacement:
              "A tentativa de definir rapidamente pode afastar você do contato inicial. Por enquanto, a sensação pode existir sem uma conclusão.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_cons_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "journal",
          "question"
        ],

        next_question_ids: [
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
        ],

        journal_prompt_id:
          "p01_journal_cons_02",

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_02_opt_desire",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "desire",

        visible_text:
          "Quero aprender a notar meu corpo sem tentar controlá-lo.",

        probable_meaning:
          "O leitor demonstra abertura para observação corporal sem correção imediata.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "coherent_positioning"
        ],

        pillar_specific_signals: [
          "return_to_self",
          "body_held_tension"
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
              "Notar não precisa significar controlar.",

            content_origin:
              "igent_companion",

            maximum_words: 16
          },

          standard: {
            mirror:
              "Você deseja observar o corpo sem transformar cada sensação em algo que precisa ser corrigido.",

            displacement:
              "Essa diferença permite contato sem criar outra tarefa de desempenho.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_name"
            },

            content_origin:
              "igent_companion",

            maximum_words: 55
          },

          deep: {
            mirror:
              "Existe disposição para mudar a relação com o sinal corporal, não necessariamente o sinal em si.",

            displacement:
              "O corpo deixa de ser um problema a ser controlado e passa a ser uma parte da experiência que pode ser percebida.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
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
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
        ],

        journal_prompt_id:
          "p01_journal_cons_02",

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_02_opt_uncertainty",

        question_id:
          "p01_q_cons_02",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não consigo localizar nenhuma sensação agora.",

        probable_meaning:
          "Não há percepção corporal disponível ou o leitor ainda não consegue diferenciá-la.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [],

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
              "Não localizar nada agora também é uma resposta válida.",

            content_origin:
              "igent_companion",

            maximum_words: 19
          },

          standard: {
            mirror:
              "Nenhuma sensação corporal está clara neste momento.",

            displacement:
              "Não é necessário procurar até encontrar. O reconhecimento também inclui perceber quando algo ainda não está disponível.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "O corpo ainda não oferece uma localização que você consiga reconhecer.",

            displacement:
              "Isso não deve ser tratado como falha nem como resistência. A percepção corporal pode não ser o ponto de entrada mais adequado agora.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_cons_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "mirror",
          "closure"
        ],

        next_question_ids: [
          "p01_q_cons_03"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
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
        "No meu corpo isso aparece como...",

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
// 5. PERGUNTA 3
// A FRASE INTERNA RECORRENTE
//////////////////////////////////////////////////

export const P01_Q_CONS_03:
  CompanionQuestion = {
    id: "p01_q_cons_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_consciousness",

    question_origin: "book_exact",

    canonical_reference_id:
      "ref_p01_cons_question_sentence",

    phase: "consciousness",

    phase_order: 3,
    global_order: 3,

    text:
      "Qual é a frase interna que eu repito sobre mim quando ninguém está vendo?",

    semantic_goal:
      "Identificar uma sentença interna recorrente antes de tratá-la como verdade ou identidade.",

    internal_hypothesis:
      "Uma frase repetida pode organizar julgamento, comportamento e percepção de si sem permanecer consciente.",

    depth: 2,

    compatible_states: [
      "observing",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
      "uncertainty",
      "minimization",
      "self_judgment",
      "external_judgment",
      "avoidance",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "need_for_approval",
      "control_through_performance",
      "worth_tied_to_productivity",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "performance_to_belong",
      "self_invisibility",
      "return_to_self"
    ],

    options: [
      {
        id:
          "p01_q_cons_03_opt_recognition",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "recognition",

        visible_text:
          "Já reconheço uma frase que se repete e me reduz.",

        probable_meaning:
          "O leitor identifica uma sentença interna recorrente com efeito de julgamento.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "internalized_self_attack"
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
              "Você já consegue ouvir a frase que antes operava sem ser percebida.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "A frase recorrente começou a se tornar visível.",

            displacement:
              "Reconhecê-la não significa concordar com ela. Significa deixar de tratá-la como uma voz invisível que define o clima interno.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "A sentença interna já pode ser percebida como repetição.",

            displacement:
              "Uma frase ouvida durante muito tempo pode parecer descrição objetiva de quem você é. O reconhecimento começa a separá-la da identidade.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_01",
          "p01_mr_cons_02"
        ],

        journal_prompt_id:
          "p01_journal_judg_01",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_03_opt_minimization",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que exista uma frase. São apenas pensamentos passageiros.",

        probable_meaning:
          "O leitor percebe pensamentos internos, mas reduz sua repetição ou influência.",

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
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Pode ser que sejam apenas pensamentos passageiros.",

            content_origin:
              "igent_companion",

            maximum_words: 18
          },

          standard: {
            mirror:
              "Nem todo pensamento recorrente ocupa um lugar central.",

            displacement:
              "Não é necessário transformar pensamentos passageiros em um padrão. Basta observar se alguma frase volta especialmente nos momentos de erro, cansaço ou exposição.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_cons_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "As frases internas parecem dispersas e sem influência suficiente para merecer destaque.",

            displacement:
              "Essa leitura pode estar correta. O que diferencia uma frase passageira de um clima interno é sua repetição em diferentes contextos, não uma escolha isolada.",

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
          "mirror",
          "closure"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_03_opt_defense",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "defense",

        visible_text:
          "Prefiro não dar importância ao que minha mente diz.",

        probable_meaning:
          "O leitor tenta reduzir a influência do pensamento evitando contato ou atenção.",

        primary_signal:
          "avoidance",

        secondary_signals: [],

        pillar_specific_signals: [
          "automatic_escape",
          "internalized_self_attack"
        ],

        scale_effects: {
          awareness: 0,
          judgment: 0,
          presence: -1,

          readiness: -1,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Não dar atenção pode reduzir o ruído por algum tempo.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Ignorar a frase parece uma forma de impedir que ela ocupe ainda mais espaço.",

            displacement:
              "O custo possível é que ela continue influenciando sem ser reconhecida. Perceber não exige obedecer nem discutir com ela.",

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
              "A distância em relação à frase pode estar protegendo você de um confronto interno cansativo.",

            displacement:
              "Reconhecer não significa alimentar o pensamento. Significa apenas perceber quando ele aparece e interromper sua passagem automática por verdade.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "mirror",
          "closure"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_03",
          "p01_mr_cons_05"
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
          "p01_q_cons_03_opt_ambivalence",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "ambivalence",

        visible_text:
          "Percebo frases diferentes, mas todas parecem cobrar, diminuir ou apressar.",

        probable_meaning:
          "Existem diferentes sentenças internas com função semelhante de controle ou autocondenação.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "internalized_self_attack"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "As palavras mudam, mas a função parece semelhante: cobrar, reduzir ou apressar.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "Não existe apenas uma frase, mas várias que produzem um clima interno parecido.",

            displacement:
              "Talvez seja mais útil reconhecer a função comum do que escolher a sentença perfeita.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "Diferentes frases parecem formar a mesma direção interna: você deve ser menor, mais rápido ou mais controlado.",

            displacement:
              "A repetição pode estar na função, não nas palavras exatas. Reconhecer essa direção já começa a separar julgamento de identidade.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "mirror",
          "question"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_02",
          "p01_mr_cons_04"
        ],

        journal_prompt_id:
          "p01_journal_judg_01",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_03_opt_desire",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "desire",

        visible_text:
          "Quero encontrar essa frase para deixar de obedecê-la automaticamente.",

        probable_meaning:
          "O leitor deseja reconhecer a narrativa interna e recuperar margem de escolha.",

        primary_signal:
          "recognition",

        secondary_signals: [
          "coherent_positioning",
          "repetition_awareness"
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
              "Reconhecer a frase pode criar espaço entre ouvi-la e obedecê-la.",

            content_origin:
              "igent_companion",

            maximum_words: 22
          },

          standard: {
            mirror:
              "Você não está tentando impedir que a frase apareça. Está tentando deixar de segui-la automaticamente.",

            displacement:
              "Esse intervalo devolve escolha sem exigir que o pensamento desapareça.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "Existe uma diferença começando a surgir entre a voz interna e quem percebe essa voz.",

            displacement:
              "A frase pode continuar aparecendo. O movimento de presença está em reconhecê-la sem permitir que ela defina sozinha sua identidade ou seu próximo gesto.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 85
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "question",
          "anchor"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_02",
          "p01_mr_cons_06"
        ],

        journal_prompt_id:
          "p01_journal_judg_01",

        anchor_id:
          "p01_anchor_name",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_cons_03_opt_uncertainty",

        question_id:
          "p01_q_cons_03",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não consigo identificar nenhuma frase agora.",

        probable_meaning:
          "A narrativa interna ainda não está disponível em palavras ou não existe evidência suficiente.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

        pillar_specific_signals: [],

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
              "Não identificar uma frase agora não significa que você deixou de reconhecer.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "Nenhuma sentença interna está clara neste momento.",

            displacement:
              "Às vezes ela não aparece em palavras. Pode surgir como pressa, recuo, cobrança ou sensação de que algo precisa ser corrigido.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_cons_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "A frase ainda não encontrou uma forma verbal reconhecível.",

            displacement:
              "Não é necessário forçá-la. O padrão pode ser observado primeiro pelo efeito que produz, e não pelas palavras exatas.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_observe"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          }
        },

        preferred_intervention:
          "micro_return",

        alternative_interventions: [
          "anchor",
          "closure"
        ],

        next_question_ids: [
          "p01_q_judg_01"
        ],

        micro_return_ids: [
          "p01_mr_cons_05",
          "p01_mr_cons_06"
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
        "A frase que mais se repete é...",

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
// 6. PACOTE DA FASE CONSCIÊNCIA
//////////////////////////////////////////////////

export const PILLAR_01_CONSCIOUSNESS_QUESTIONS:
  CompanionQuestion[] = [
    P01_Q_CONS_01,
    P01_Q_CONS_02,
    P01_Q_CONS_03
  ];


//////////////////////////////////////////////////
// 7. VALIDAÇÃO
//////////////////////////////////////////////////

export function validatePillar01ConsciousnessQuestions(
  questions: CompanionQuestion[]
): string[] {
  const errors: string[] = [];

  if (questions.length !== 3) {
    errors.push(
      "Pillar I consciousness phase must contain 3 questions."
    );
  }

  const optionCount = questions.reduce(
    (total, question) =>
      total + question.options.length,
    0
  );

  if (optionCount !== 18) {
    errors.push(
      "Pillar I consciousness phase must contain 18 options."
    );
  }

  for (const question of questions) {
    if (
      question.phase !== "consciousness"
    ) {
      errors.push(
        `${question.id} must belong to consciousness.`
      );
    }

    if (
      question.question_origin ===
        "book_exact" &&
      !question.canonical_reference_id
    ) {
      errors.push(
        `${question.id} requires a canonical reference.`
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
          `${option.id} cannot create a pattern from a closed option.`
        );
      }
    }
  }

  return errors;
}


//////////////////////////////////////////////////
// 8. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_10_FINAL_RULES = [
  "The three questions are canonical book content.",

  "The options and responses are iGent companion content.",

  "Question 1 recognizes the ignored internal state.",

  "Question 2 locates a possible body signal without diagnosis.",

  "Question 3 identifies an internal sentence without treating it as truth.",

  "No closed option creates a recurring pattern.",

  "Open responses override closed-option hypotheses.",

  "The reader can skip any question.",

  "Failure to name a state is not resistance.",

  "Failure to locate a body signal is not disconnection.",

  "Failure to identify a sentence is not avoidance.",

  "Body observations must never be interpreted clinically.",

  "The engine must reduce depth when body attention increases load.",

  "The next phase is Judgment, but progression remains adaptive."
];
