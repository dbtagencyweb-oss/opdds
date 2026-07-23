import {
  DEFAULT_OPTION_MEMORY_POLICY,
  REQUIRED_SEMANTIC_POSITIONS,
  type CanonicalContentReference,
  type CompanionQuestion,
} from './igentMindPillar01Consciousness';

const BOOK_ID = 'opdds';

/**
 * BLOCO 11
 * PILAR I — RECONHECIMENTO
 * FASE: JULGAMENTO
 *
 * Conteúdo:
 * - perguntas 4, 5 e 6;
 * - 18 opções semânticas;
 * - respostas minimal, standard e deep;
 * - sinais e efeitos de escala;
 * - rotas recomendadas.
 *
 * As perguntas são adaptações editoriais aprovadas
 * a partir das três vozes canônicas do livro:
 *
 * 1. voz do desprezo;
 * 2. voz da cobrança moral;
 * 3. voz do medo social.
 *
 * As opções e respostas pertencem ao iGentMIND.
 */

//////////////////////////////////////////////////
// 1. REFERÊNCIAS CANÔNICAS
//////////////////////////////////////////////////

export const PILLAR_01_JUDGMENT_REFERENCES:
  CanonicalContentReference[] = [
    {
      id: "ref_p01_judg_contempt_voice",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_judgment",

      page_start: 88,
      page_end: 89,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "O que você costuma dizer a si mesmo quando percebe que não está bem?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_judg_moral_demand",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_judgment",

      page_start: 89,
      page_end: 91,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "O que você acredita que já deveria ter superado, controlado ou resolvido?",

      quote_allowed: true,
      approved: true
    },

    {
      id: "ref_p01_judg_social_fear",

      book_id: BOOK_ID,
      unit_id:
        "unit_pillar_01_reconhecimento",

      section_id:
        "p01_section_judgment",

      page_start: 89,
      page_end: 91,

      origin:
        "book_approved_adaptation",

      approved_adaptation:
        "O que você teme que aconteça se alguém perceber como você realmente está?",

      quote_allowed: true,
      approved: true
    }
  ];


//////////////////////////////////////////////////
// 2. PERGUNTA 4
// A VOZ DO DESPREZO
//////////////////////////////////////////////////

export const P01_Q_JUDG_01:
  CompanionQuestion = {
    id: "p01_q_judg_01",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_judg_contempt_voice",

    phase: "judgment",

    phase_order: 1,
    global_order: 4,

    text:
      "O que você costuma dizer a si mesmo quando percebe que não está bem?",

    semantic_goal:
      "Identificar a linguagem de desprezo, redução ou invalidação usada contra o próprio estado.",

    internal_hypothesis:
      "O leitor pode responder ao desconforto tentando calar, ridicularizar ou diminuir aquilo que sente.",

    depth: 1,

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
      "minimization",
      "self_judgment",
      "avoidance",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "denial_of_current_state",
      "self_invisibility"
    ],

    options: [
      {
        id:
          "p01_q_judg_01_opt_recognition",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "recognition",

        visible_text:
          "Percebo que costumo me chamar de fraco, exagerado ou incapaz.",

        probable_meaning:
          "O leitor identifica linguagem interna de desprezo ou desqualificação.",

        primary_signal:
          "self_judgment",

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

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você já consegue perceber a linguagem usada para reduzir o próprio estado.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "Quando o desconforto aparece, sua resposta interna costuma ser desqualificá-lo.",

            displacement:
              "Essa voz pode tentar calar o que sente para impedir que você se torne um problema. Ela opera como controle, não como descrição objetiva.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "O estado não chega sozinho. Ele vem acompanhado de uma voz que chama sentir de fraqueza, exagero ou incapacidade.",

            displacement:
              "Essa voz talvez tenha aprendido que diminuir você era uma forma de mantê-lo funcionando. Reconhecer a função não significa aceitar a sentença.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 95
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_05"
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
          "p01_q_judg_01_opt_minimization",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que eu me ataque. Apenas tento não dar importância.",

        probable_meaning:
          "O leitor pode reduzir o próprio estado como forma de manter controle ou continuidade.",

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
              "Talvez você realmente não use uma linguagem de ataque clara.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "Sua forma de lidar parece ser reduzir a importância do estado para continuar.",

            displacement:
              "Isso não precisa ser chamado de ataque. Ainda assim, pode ser útil observar se diminuir o que sente também impede reconhecimento.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "O movimento não aparece como insulto, mas como retirada de importância.",

            displacement:
              "Às vezes o desprezo não diz ‘você é fraco’. Ele diz apenas ‘isso não importa’. As duas formas podem produzir invisibilidade interna.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_02"
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
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_02",
          "p01_mr_judg_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_judg_01_opt_defense",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "defense",

        visible_text:
          "Ser duro comigo é o que me impede de perder o controle.",

        probable_meaning:
          "O ataque interno pode ser percebido como instrumento necessário de controle.",

        primary_signal:
          "rigid_control",

        secondary_signals: [
          "control_through_performance"
        ],

        pillar_specific_signals: [
          "internalized_self_attack",
          "functioning_without_feeling"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: -1,

          readiness: 0,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A dureza parece cumprir uma função de controle e continuidade.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Você associa a dureza interna à capacidade de continuar funcionando.",

            displacement:
              "Ela pode ter ajudado a manter controle. A questão não é removê-la agora, mas perceber o preço de precisar se atacar para seguir.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "O ataque interno parece funcionar como um regulador: ele pressiona para evitar desorganização, exposição ou parada.",

            displacement:
              "Essa função pode ter sido protetiva. O custo aparece quando sua estabilidade depende de tratar a si mesmo como ameaça.",

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
          "micro_return",

        alternative_interventions: [
          "anchor",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_03",
          "p01_mr_judg_04"
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
          "p01_q_judg_01_opt_ambivalence",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "ambivalence",

        visible_text:
          "Uma parte me ataca. Outra sabe que isso só piora o que já está difícil.",

        probable_meaning:
          "O leitor reconhece o ataque e simultaneamente percebe seu custo.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "internalized_self_attack",
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 1,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você já percebe tanto a voz que ataca quanto o custo que ela produz.",

            content_origin:
              "igent_companion",

            maximum_words: 25
          },

          standard: {
            mirror:
              "Duas posições aparecem juntas: uma tenta controlar pelo ataque; outra percebe que isso amplia o sofrimento.",

            displacement:
              "Você não precisa escolher uma delas agora. Reconhecer a divisão já reduz a autoridade automática da voz mais dura.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          },

          deep: {
            mirror:
              "A voz crítica ainda aparece, mas já não ocupa todo o espaço interno.",

            displacement:
              "Existe alguém percebendo o ataque e seu efeito. Esse terceiro ponto não precisa vencer a crítica; precisa apenas não desaparecer diante dela.",

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
          "question",

        alternative_interventions: [
          "journal",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_02",
          "p01_mr_judg_06"
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
          "p01_q_judg_01_opt_desire",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "desire",

        visible_text:
          "Quero perceber essa voz sem continuar acreditando em tudo o que ela diz.",

        probable_meaning:
          "O leitor deseja separar percepção da voz e obediência à sentença.",

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
              "Perceber a voz não exige concordar com ela.",

            content_origin:
              "igent_companion",

            maximum_words: 17
          },

          standard: {
            mirror:
              "Você deseja criar distância entre ouvir a crítica e tratá-la como verdade.",

            displacement:
              "A voz pode continuar aparecendo. O movimento novo é deixar de entregá-la autoridade automática.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_name"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "Existe disposição para reconhecer a voz sem deixar que ela defina sozinha o que está acontecendo.",

            displacement:
              "Isso não exige uma frase positiva para rebater. Exige apenas nomear: julgamento — e permanecer diante do estado real.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_02"
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
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_05",
          "p01_mr_judg_06"
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
          "p01_q_judg_01_opt_uncertainty",

        question_id:
          "p01_q_judg_01",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não sei o que digo a mim mesmo. Só percebo que fico pior.",

        probable_meaning:
          "O efeito do julgamento é percebido, mas sua linguagem ainda não está disponível.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

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
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você ainda não identifica as palavras, mas reconhece o efeito.",

            content_origin:
              "igent_companion",

            maximum_words: 21
          },

          standard: {
            mirror:
              "A frase não está clara, mas existe percepção de que algo interno aumenta o peso.",

            displacement:
              "Podemos observar primeiro o efeito: pressa, vergonha, retração, irritação ou vontade de esconder.",

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
              "A linguagem do julgamento ainda não aparece, mas sua consequência já pode ser sentida.",

            displacement:
              "Nem sempre a voz vem em palavras. Às vezes ela surge como contração, urgência ou sensação de que você precisa se corrigir imediatamente.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_02"
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
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_02"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_05"
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
        "Quando não estou bem, eu digo a mim mesmo...",

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
// 3. PERGUNTA 5
// A COBRANÇA MORAL
//////////////////////////////////////////////////

export const P01_Q_JUDG_02:
  CompanionQuestion = {
    id: "p01_q_judg_02",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_judg_moral_demand",

    phase: "judgment",

    phase_order: 2,
    global_order: 5,

    text:
      "O que você acredita que já deveria ter superado, controlado ou resolvido?",

    semantic_goal:
      "Identificar a cobrança temporal ou moral aplicada ao próprio estado.",

    internal_hypothesis:
      "O leitor pode transformar sofrimento, demora ou oscilação em falha de caráter.",

    depth: 2,

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
      "minimization",
      "self_judgment",
      "rigid_control",
      "ambivalence"
    ],

    compatible_secondary_signals: [
      "pain_normalization",
      "control_through_performance",
      "worth_tied_to_productivity",
      "repetition_awareness"
    ],

    compatible_pillar_signals: [
      "internalized_self_attack",
      "functioning_without_feeling",
      "denial_of_current_state"
    ],

    options: [
      {
        id:
          "p01_q_judg_02_opt_recognition",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "recognition",

        visible_text:
          "Existe algo que ainda sinto, mas acredito que já deveria ter deixado para trás.",

        probable_meaning:
          "O leitor reconhece cobrança temporal aplicada a um estado ainda presente.",

        primary_signal:
          "self_judgment",

        secondary_signals: [
          "pain_normalization",
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "internalized_self_attack"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 0,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você percebe que o estado permanece e também percebe a cobrança para que ele já tivesse terminado.",

            content_origin:
              "igent_companion",

            maximum_words: 28
          },

          standard: {
            mirror:
              "Há uma experiência ainda presente e uma sentença dizendo que ela já deveria ter acabado.",

            displacement:
              "O tempo da cobrança não é necessariamente o tempo do corpo. Permanecer sentindo não prova falta de esforço ou caráter.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "Uma parte ainda carrega o estado. Outra exige que ele já tivesse sido superado.",

            displacement:
              "Essa cobrança tenta organizar a experiência pelo prazo, mas pode transformar demora em culpa e humanidade em falha moral.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "question",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_05"
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
          "p01_q_judg_02_opt_minimization",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "minimization",

        visible_text:
          "Não penso nisso como cobrança. Só acho que já passou tempo suficiente.",

        probable_meaning:
          "O leitor trata o tempo decorrido como evidência de que o estado deveria ter terminado.",

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
          judgment: 1,
          presence: 0,

          readiness: 0,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "O tempo decorrido parece funcionar como medida para o que você deveria sentir.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "Você não percebe isso como ataque, mas como uma conclusão baseada no tempo.",

            displacement:
              "O tempo pode oferecer contexto, mas não determina sozinho quando uma experiência deixa de produzir efeito.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "A cobrança aparece de forma racional: já passou tempo suficiente, portanto isso não deveria continuar.",

            displacement:
              "Essa lógica parece organizada, mas pode ignorar que estados internos não obedecem apenas ao calendário.",

            next_move: {
              type: "micro_return",
              content_id:
                "p01_mr_judg_05"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "micro_return",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_02",
          "p01_mr_judg_05"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_judg_02_opt_defense",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "defense",

        visible_text:
          "Se eu parar de me cobrar, temo ficar preso nisso ou perder a capacidade de reagir.",

        probable_meaning:
          "A cobrança é percebida como proteção contra paralisia ou perda de controle.",

        primary_signal:
          "rigid_control",

        secondary_signals: [
          "control_through_performance"
        ],

        pillar_specific_signals: [
          "internalized_self_attack",
          "functioning_without_feeling"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: -1,

          readiness: 0,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A cobrança parece impedir que você pare, desorganize ou permaneça tempo demais no estado.",

            content_origin:
              "igent_companion",

            maximum_words: 25
          },

          standard: {
            mirror:
              "Você associa autocobrança à capacidade de continuar reagindo.",

            displacement:
              "Ela pode produzir movimento. Isso não significa que toda ação precise nascer de ameaça ou condenação.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_name"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "A cobrança funciona como garantia de que você não ficará parado dentro do desconforto.",

            displacement:
              "O medo é que, sem ataque, não exista movimento. Presença começa testando outra possibilidade: permanecer sem abandonar responsabilidade e sem transformar humanidade em falha.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 95
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "question",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_03",
          "p01_mr_judg_04"
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
          "p01_q_judg_02_opt_ambivalence",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "ambivalence",

        visible_text:
          "Sei que me cobro demais, mas também sinto que deveria estar melhor.",

        probable_meaning:
          "O leitor reconhece excesso de cobrança, mas ainda concorda parcialmente com sua sentença.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "internalized_self_attack",
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 0,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você percebe o excesso da cobrança, mas ainda sente que ela possui alguma razão.",

            content_origin:
              "igent_companion",

            maximum_words: 25
          },

          standard: {
            mirror:
              "Uma parte reconhece que a exigência é dura. Outra continua acreditando que você já deveria estar melhor.",

            displacement:
              "Não é necessário decidir imediatamente qual parte está certa. Primeiro, observe o que cada uma tenta impedir.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "A crítica perdeu parte da invisibilidade, mas ainda mantém autoridade.",

            displacement:
              "Isso é diferente de integração completa. Você já percebe o mecanismo, mesmo que ainda não consiga deixar de concordar com ele.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "journal",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_02",
          "p01_mr_judg_06"
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
          "p01_q_judg_02_opt_desire",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "desire",

        visible_text:
          "Quero assumir responsabilidade sem continuar me tratando como culpado.",

        probable_meaning:
          "O leitor deseja separar responsabilidade prática de condenação interna.",

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
              "Responsabilidade e condenação não precisam ocupar o mesmo lugar.",

            content_origin:
              "igent_companion",

            maximum_words: 18
          },

          standard: {
            mirror:
              "Você não está tentando abandonar responsabilidade. Está tentando retirar a crueldade usada para sustentá-la.",

            displacement:
              "É possível reconhecer escolhas, custos e consequências sem transformar tudo isso em sentença sobre quem você é.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Surge uma diferença importante entre responder pelo que acontece e condenar a própria existência.",

            displacement:
              "Responsabilidade pode orientar uma ação. Culpa permanente apenas mantém o tribunal funcionando.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_position"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "journal"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_05",
          "p01_mr_judg_06"
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
          "p01_q_judg_02_opt_uncertainty",

        question_id:
          "p01_q_judg_02",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não sei se estou me cobrando ou apenas tentando melhorar.",

        probable_meaning:
          "O leitor ainda não diferencia responsabilidade, desejo de mudança e autocondenação.",

        primary_signal:
          "uncertainty",

        secondary_signals: [],

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
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "A diferença entre melhorar e se atacar ainda não está clara.",

            content_origin:
              "igent_companion",

            maximum_words: 20
          },

          standard: {
            mirror:
              "Desejo de mudança e autocobrança podem parecer a mesma coisa por muito tempo.",

            displacement:
              "Um critério possível é observar o efeito: isso organiza um próximo passo ou apenas aumenta vergonha, urgência e sensação de inadequação?",

            next_move: {
              type: "question",
              content_id:
                "p01_q_judg_03"
            },

            content_origin:
              "igent_companion",

            maximum_words: 75
          },

          deep: {
            mirror:
              "Você ainda não consegue separar exigência saudável de ataque interno.",

            displacement:
              "A intenção pode parecer semelhante, mas o resultado costuma diferir: responsabilidade cria direção; condenação reduz presença e aumenta medo.",

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
          "question",

        alternative_interventions: [
          "journal",
          "mirror"
        ],

        next_question_ids: [
          "p01_q_judg_03"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_05"
        ],

        journal_prompt_id:
          "p01_journal_judg_01",

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
        "Eu acredito que já deveria ter...",

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
// 4. PERGUNTA 6
// O MEDO SOCIAL
//////////////////////////////////////////////////

export const P01_Q_JUDG_03:
  CompanionQuestion = {
    id: "p01_q_judg_03",

    pillar_id:
      "pillar_01_reconhecimento",

    canonical_unit_id:
      "unit_pillar_01_reconhecimento",

    canonical_section_id:
      "p01_section_judgment",

    question_origin:
      "book_approved_adaptation",

    canonical_reference_id:
      "ref_p01_judg_social_fear",

    phase: "judgment",

    phase_order: 3,
    global_order: 6,

    text:
      "O que você teme que aconteça se alguém perceber como você realmente está?",

    semantic_goal:
      "Reconhecer o medo de exposição, perda de lugar, rejeição ou redução diante do olhar externo.",

    internal_hypothesis:
      "O leitor pode manter funcionamento, silêncio ou performance por acreditar que ser visto em dificuldade ameaça pertencimento ou estabilidade.",

    depth: 2,

    compatible_states: [
      "observing",
      "defensive",
      "oscillating",
      "available"
    ],

    compatible_primary_signals: [
      "recognition",
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
      "functioning_without_feeling",
      "automatic_escape"
    ],

    options: [
      {
        id:
          "p01_q_judg_03_opt_recognition",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "recognition",

        visible_text:
          "Temo ser visto como fraco, incapaz, exagerado ou difícil.",

        probable_meaning:
          "O leitor reconhece medo de ser reduzido pelo olhar externo.",

        primary_signal:
          "external_judgment",

        secondary_signals: [
          "need_for_approval",
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "performance_to_belong",
          "self_invisibility"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 0,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Ser visto em dificuldade parece ameaçar a forma como você acredita que será percebido.",

            content_origin:
              "igent_companion",

            maximum_words: 25
          },

          standard: {
            mirror:
              "Existe receio de que seu estado seja transformado em definição sobre quem você é.",

            displacement:
              "O medo não está apenas em ser visto. Está em ser reduzido ao que aparece num momento difícil.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          },

          deep: {
            mirror:
              "Mostrar o estado parece carregar o risco de perder complexidade e ser resumido a fraqueza, incapacidade ou excesso.",

            displacement:
              "Esconder pode ter protegido sua imagem e seu lugar. O custo aparece quando a proteção exige que você permaneça invisível até para si.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 95
          }
        },

        preferred_intervention:
          "journal",

        alternative_interventions: [
          "mirror",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_04"
        ],

        journal_prompt_id:
          "p01_journal_judg_02",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_judg_03_opt_minimization",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "minimization",

        visible_text:
          "Não acho que os outros percebam ou se importem tanto assim.",

        probable_meaning:
          "O leitor reduz a relevância do olhar externo ou realmente não identifica ameaça social.",

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
              "Pode ser que o olhar externo realmente não tenha grande peso neste momento.",

            content_origin:
              "igent_companion",

            maximum_words: 23
          },

          standard: {
            mirror:
              "Você não percebe uma ameaça clara na reação das outras pessoas.",

            displacement:
              "Não é necessário criar um medo que não existe. Podemos apenas observar se você muda algo em si quando sente que está sendo visto.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "A opinião externa não parece organizar seu estado de forma evidente.",

            displacement:
              "Essa leitura pode estar correta. A questão seguinte não precisa investigar o outro, mas a possibilidade de você permanecer consigo sem performance.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
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
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_05",
          "p01_mr_judg_06"
        ],

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_judg_03_opt_defense",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "defense",

        visible_text:
          "Prefiro esconder porque não confio no que fariam com essa informação.",

        probable_meaning:
          "O leitor reconhece ocultação como proteção diante de possível exposição, julgamento ou uso indevido.",

        primary_signal:
          "avoidance",

        secondary_signals: [
          "silence_to_preserve_bond"
        ],

        pillar_specific_signals: [
          "self_invisibility",
          "performance_to_belong"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 0,
          presence: -1,

          readiness: 0,
          load: 0,
          avoidance: 1,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Esconder parece uma escolha de proteção diante de um ambiente que não parece confiável.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "Você não está dizendo apenas que teme julgamento. Está dizendo que não confia no uso que fariam do que vissem.",

            displacement:
              "O pilar não exige exposição. Reconhecimento pode acontecer internamente sem entregar sua vulnerabilidade a quem não oferece segurança.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_position"
            },

            content_origin:
              "igent_companion",

            maximum_words: 80
          },

          deep: {
            mirror:
              "A ocultação parece preservar limites diante de relações ou ambientes percebidos como inseguros.",

            displacement:
              "Nem toda proteção precisa ser removida. A presença aqui consiste em não precisar esconder o estado de si mesmo, mesmo quando escolhe não mostrá-lo aos outros.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 90
          }
        },

        preferred_intervention:
          "anchor",

        alternative_interventions: [
          "question",
          "closure"
        ],

        next_question_ids: [
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_03",
          "p01_mr_judg_05"
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
          "p01_q_judg_03_opt_ambivalence",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "ambivalence",

        visible_text:
          "Quero ser reconhecido, mas também temo ser visto de um jeito que me diminua.",

        probable_meaning:
          "Existe desejo de reconhecimento acompanhado de medo de redução ou julgamento.",

        primary_signal:
          "ambivalence",

        secondary_signals: [
          "need_for_approval",
          "repetition_awareness"
        ],

        pillar_specific_signals: [
          "performance_to_belong",
          "return_to_self"
        ],

        scale_effects: {
          awareness: 1,
          judgment: 1,
          presence: 0,

          readiness: 1,
          load: 0,
          avoidance: 0,
          agency: 0
        },

        response_variants: {
          minimal: {
            mirror:
              "Você deseja ser visto, mas não deseja ser reduzido pelo olhar de quem vê.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "O desejo de reconhecimento convive com o receio de que a exposição produza uma nova forma de diminuição.",

            displacement:
              "Isso não é contradição vazia. É a tentativa de encontrar presença sem repetir uma experiência de redução.",

            next_move: {
              type: "journal",
              content_id:
                "p01_journal_judg_02"
            },

            content_origin:
              "igent_companion",

            maximum_words: 70
          },

          deep: {
            mirror:
              "Uma parte quer deixar de ser invisível. Outra teme que aparecer custe dignidade, controle ou pertencimento.",

            displacement:
              "Presença não exige exposição total. Ela começa quando você consegue reconhecer as duas posições sem abandonar nenhuma delas imediatamente.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
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
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_02",
          "p01_mr_judg_06"
        ],

        journal_prompt_id:
          "p01_journal_judg_02",

        memory_policy:
          DEFAULT_OPTION_MEMORY_POLICY,

        interpretation_confidence:
          "low",

        active: true
      },

      {
        id:
          "p01_q_judg_03_opt_desire",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "desire",

        visible_text:
          "Quero conseguir reconhecer meu estado sem sentir que preciso escondê-lo de mim.",

        probable_meaning:
          "O leitor formula desejo de reconhecimento interno sem obrigação de exposição externa.",

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
              "Você não precisa mostrar para reconhecer.",

            content_origin:
              "igent_companion",

            maximum_words: 14
          },

          standard: {
            mirror:
              "Seu movimento não é se expor. É deixar de esconder o próprio estado de si mesmo.",

            displacement:
              "Essa diferença preserva limite externo e, ao mesmo tempo, interrompe o autoabandono interno.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
            },

            content_origin:
              "igent_companion",

            maximum_words: 60
          },

          deep: {
            mirror:
              "Surge uma forma de presença que não depende da aprovação de quem está fora.",

            displacement:
              "Você pode escolher o que compartilha e ainda assim permanecer honesto consigo sobre o que existe.",

            next_move: {
              type: "anchor",
              content_id:
                "p01_anchor_position"
            },

            content_origin:
              "igent_companion",

            maximum_words: 65
          }
        },

        preferred_intervention:
          "question",

        alternative_interventions: [
          "anchor",
          "micro_return"
        ],

        next_question_ids: [
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_05",
          "p01_mr_judg_06"
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
          "p01_q_judg_03_opt_uncertainty",

        question_id:
          "p01_q_judg_03",

        semantic_position:
          "uncertainty",

        visible_text:
          "Não sei o que temo. Só percebo que tento parecer bem.",

        probable_meaning:
          "A performance é reconhecida, mas o medo social ainda não possui linguagem clara.",

        primary_signal:
          "uncertainty",

        secondary_signals: [
          "need_for_approval"
        ],

        pillar_specific_signals: [
          "performance_to_belong"
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
              "Você ainda não nomeia o medo, mas reconhece a necessidade de parecer bem.",

            content_origin:
              "igent_companion",

            maximum_words: 24
          },

          standard: {
            mirror:
              "O receio ainda não está claro. A performance, porém, já pode ser percebida.",

            displacement:
              "Não é necessário descobrir agora o que exatamente você tenta evitar. Primeiro, basta notar quando começa a editar sua presença.",

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
              "A tentativa de parecer bem aparece antes que o medo consiga ser nomeado.",

            displacement:
              "Às vezes o corpo aprende a performar antes de formular o risco. O efeito vem primeiro; a explicação pode ou não aparecer depois.",

            next_move: {
              type: "question",
              content_id:
                "p01_q_pres_01"
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
          "mirror"
        ],

        next_question_ids: [
          "p01_q_pres_01"
        ],

        micro_return_ids: [
          "p01_mr_judg_01",
          "p01_mr_judg_05"
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
        "Se alguém percebesse como estou, temo que...",

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
// 5. PACOTE DA FASE JULGAMENTO
//////////////////////////////////////////////////

export const PILLAR_01_JUDGMENT_QUESTIONS:
  CompanionQuestion[] = [
    P01_Q_JUDG_01,
    P01_Q_JUDG_02,
    P01_Q_JUDG_03
  ];


//////////////////////////////////////////////////
// 6. REGRAS DE PROGRESSÃO
//////////////////////////////////////////////////

export const PILLAR_01_JUDGMENT_PROGRESSION = {
  minimum_requirements: {
    awareness_level: 2,
    presence_level: 2,
    readiness_level: 2,
    maximum_load_level: 2
  },

  meaningful_markers: [
    "contempt_voice_recognized",
    "moral_demand_recognized",
    "social_fear_recognized",
    "judgment_seen_as_mechanism",
    "responsibility_separated_from_condemnation",
    "internal_recognition_separated_from_external_exposure"
  ],

  advance_when_any: [
    "judgment_seen_as_mechanism",
    "responsibility_separated_from_condemnation",
    "reader_can_name_attack_without_total_identification",
    "reader_requests_presence_phase"
  ],

  remain_when_any: [
    "judgment_still_seen_as_absolute_truth",
    "load_level_is_3",
    "reader_is_defensive",
    "interpretation_confidence_is_low",
    "reader_requests_more_context"
  ]
};


//////////////////////////////////////////////////
// 7. VALIDAÇÃO
//////////////////////////////////////////////////

export function validatePillar01JudgmentQuestions(
  questions: CompanionQuestion[]
): string[] {
  const errors: string[] = [];

  if (questions.length !== 3) {
    errors.push(
      "Pillar I judgment phase must contain 3 questions."
    );
  }

  const optionCount = questions.reduce(
    (total, question) =>
      total + question.options.length,
    0
  );

  if (optionCount !== 18) {
    errors.push(
      "Pillar I judgment phase must contain 18 options."
    );
  }

  for (const question of questions) {
    if (
      question.phase !== "judgment"
    ) {
      errors.push(
        `${question.id} must belong to judgment.`
      );
    }

    if (
      !question.canonical_reference_id
    ) {
      errors.push(
        `${question.id} requires canonical reference.`
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
    }
  }

  return errors;
}


//////////////////////////////////////////////////
// 8. REGRAS FINAIS
//////////////////////////////////////////////////

export const BLOCK_11_FINAL_RULES = [
  "The judgment phase contains three movements: contempt, moral demand and social fear.",

  "Judgment must be treated as mechanism, not identity.",

  "Contempt may appear as insult, minimization or emotional dismissal.",

  "Moral demand may appear as time pressure, gratitude pressure or expectation of control.",

  "Social fear may appear as performance, silence, concealment or fear of being reduced.",

  "The agent must not tell the reader to expose vulnerability to other people.",

  "The agent must not remove responsibility when reducing self-condemnation.",

  "Closed options create only low-confidence hypotheses.",

  "Open responses have higher evidential priority.",

  "The reader may skip every question.",

  "Recognition of judgment does not require disagreement with it.",

  "The phase may advance when judgment is seen as a mechanism, even if it continues appearing.",

  "The next phase is Presence."
];