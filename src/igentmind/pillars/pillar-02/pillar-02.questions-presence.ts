// src/igentmind/pillars/pillar-02/pillar-02.questions-presence.ts

import type {
  PillarQuestion,
} from "../template";

import {
  createPillar02Option,
  createPillar02Question,
  pillar02Companion,
} from "./pillar-02.question-builders";

/*
 * Pergunta 1
 *
 * O que eu consigo sustentar em mim
 * sem me explicar imediatamente?
 */

const PRESENCE_Q01_ID =
  "p02_presence_q01";

export const PILLAR_02_PRESENCE_Q01 =
  createPillar02Question({
    id: PRESENCE_Q01_ID,
    phase: "presence",
    order: 1,

    prompt: pillar02Companion(
      "p02_presence_q01_prompt",
      "O que eu consigo sustentar em mim sem me explicar imediatamente?",
    ),

    options: [
      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 1,

        label:
          "Uma opinião diferente.",

        signalIds: [
          "p02_boundary_presence",
          "p02_non_erasing_belonging",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua opinião pode existir por um instante antes de precisar ser defendida.",

          standard:
            "Sustentar uma opinião não exige transformá-la em confronto. O primeiro passo pode ser apenas reconhecer que ela é sua.",

          deep:
            "Quando toda diferença precisa de justificativa imediata, a voz própria nasce ocupando o lugar de acusada. Permanecer alguns instantes com o que pensa permite que a explicação, caso venha, seja escolha e não reflexo de medo.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 2,

        label:
          "Um não ou um limite.",

        signalIds: [
          "p02_boundary_presence",
          "p02_disloyalty_fear",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "O limite pode existir antes da justificativa completa.",

          standard:
            "Você pode reconhecer internamente que não consegue ou não deseja algo sem preparar uma defesa longa. Isso não define ainda como será comunicado.",

          deep:
            "A necessidade de explicar demais costuma tentar neutralizar culpa e desaprovação antes que apareçam. Sustentar o limite dentro de si devolve clareza para decidir quando, como e quanto comunicar.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 3,

        label:
          "Minha necessidade de descansar ou me retirar por um tempo.",

        signalIds: [
          "p02_boundary_presence",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Seu cansaço pode ser reconhecido antes de ser provado.",

          standard:
            "Descansar não precisa começar com uma argumentação sobre merecimento. Primeiro, existe um limite real que pode ser percebido.",

          deep:
            "Quando repouso precisa ser autorizado por produtividade, doença ou colapso, o corpo só ganha direito de parar depois de ultrapassar a capacidade. Presença é reconhecer o limite antes desse ponto.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 4,

        label:
          "Uma escolha que não coincide com o que esperavam de mim.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A escolha pode permanecer sua mesmo antes de ser compreendida pelos outros.",

          standard:
            "Você não precisa eliminar toda dúvida ou desaprovação para reconhecer o que deseja. A diferença pode existir sem apagar o vínculo.",

          deep:
            "Talvez a explicação tente conseguir permissão antes que você se autorize internamente. Sustentar a escolha não significa ignorar consequências; significa não depender de aprovação total para admitir o que é verdadeiro para você.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 5,

        label:
          "Uma emoção desconfortável ou contraditória.",

        signalIds: [
          "p02_ambivalence_capacity",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "awareness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A emoção pode existir sem precisar ser resolvida ou transformada em acusação.",

          standard:
            "Você pode sentir afeto e irritação, gratidão e falta, proximidade e necessidade de espaço. A contradição não obriga uma conclusão imediata.",

          deep:
            "Explicar rapidamente uma emoção costuma reduzi-la a uma causa, um culpado ou uma decisão. Sustentar ambivalência permite reconhecer a experiência inteira sem condenar você nem simplificar sua família.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q01_ID,
        order: 6,

        label:
          "Um momento de silêncio antes de responder.",

        signalIds: [
          "p02_boundary_presence",
          "p02_inherited_silence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Uma pausa pode ser presença, não ausência.",

          standard:
            "Você pode usar alguns instantes para perceber o que sente antes de responder. Esse silêncio não precisa punir ninguém nem encerrar a conversa.",

          deep:
            "Existe diferença entre o silêncio usado para desaparecer e a pausa usada para não se abandonar. A primeira apaga sua posição; a segunda cria tempo para que ela possa surgir com menos medo e reação.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você encontrou algo que pode permanecer em você sem defesa imediata.",

      standard:
        "Sua resposta indica um conteúdo interno que não precisa ser negado nem anunciado às pressas. Sustentá-lo por alguns instantes já é um gesto de presença.",

      deep:
        "Quando você deixa de explicar imediatamente, surge um pequeno espaço entre existir e pedir autorização. Esse espaço não elimina diálogo nem responsabilidade; apenas impede que sua experiência seja abandonada antes de ser reconhecida.",
    },
  });

/*
 * Pergunta 2
 *
 * Onde posso reconhecer um limite
 * sem transformar minha família em inimiga?
 */

const PRESENCE_Q02_ID =
  "p02_presence_q02";

export const PILLAR_02_PRESENCE_Q02 =
  createPillar02Question({
    id: PRESENCE_Q02_ID,
    phase: "presence",
    order: 2,

    prompt: pillar02Companion(
      "p02_presence_q02_prompt",
      "Onde posso reconhecer um limite sem transformar minha família em inimiga?",
    ),

    options: [
      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 1,

        label:
          "No tempo e na frequência com que consigo estar disponível.",

        signalIds: [
          "p02_boundary_presence",
          "p02_non_erasing_belonging",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Disponibilidade pode ter medida sem deixar de ser afeto.",

          standard:
            "Reconhecer quanto tempo e energia você possui não transforma ninguém em adversário. Apenas inclui sua capacidade real no vínculo.",

          deep:
            "Quando presença é medida somente pela frequência ou prontidão, qualquer redução parece afastamento. Um limite de tempo pode preservar cuidado e impedir que a relação dependa de exaustão silenciosa.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 2,

        label:
          "Na ajuda prática ou financeira que consigo oferecer.",

        signalIds: [
          "p02_boundary_presence",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Ajuda pode existir dentro de uma capacidade concreta.",

          standard:
            "Reconhecer o que você consegue oferecer não nega a importância de quem pede. O limite evita que cuidado e sacrifício automático sejam confundidos.",

          deep:
            "Quando ajudar funciona como prova de amor ou gratidão, a própria capacidade desaparece da avaliação. Presença é recolocá-la sem precisar desqualificar a necessidade do outro.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 3,

        label:
          "Nos assuntos, comentários ou conversas em que não quero permanecer.",

        signalIds: [
          "p02_boundary_presence",
          "p02_ambivalence_capacity",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Você pode reconhecer que determinada conversa ultrapassa seu limite.",

          standard:
            "Nem toda conversa precisa ser sustentada até o fim para preservar respeito. Perceber o limite permite escolher como permanecer ou sair.",

          deep:
            "Um limite de assunto não precisa funcionar como punição nem julgamento total da relação. Ele pode proteger sua presença em um ponto específico sem transformar toda a pessoa ou história em ameaça.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 4,

        label:
          "Nas decisões sobre meu trabalho, relações, rotina ou futuro.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua vida pode receber opiniões sem entregar a elas toda a decisão.",

          standard:
            "Ouvir familiares não exige suspender sua própria direção. O limite está em diferenciar consideração de autorização.",

          deep:
            "Quando decisões pessoais permanecem submetidas ao tribunal familiar, autonomia parece deslealdade. Reconhecer que a decisão final é sua não transforma conselhos em ataque nem sua história em obstáculo.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 5,

        label:
          "No espaço físico ou emocional de que preciso.",

        signalIds: [
          "p02_boundary_presence",
          "p02_ambivalence_capacity",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Precisar de espaço não elimina o vínculo.",

          standard:
            "Proximidade constante não é a única forma de cuidado. Um pouco de espaço pode permitir que você volte a se perceber dentro da relação.",

          deep:
            "Quando distância é imediatamente lida como rejeição, você pode permanecer próximo além da própria capacidade. Reconhecer espaço como necessidade humana permite sair da oposição entre fusão e rompimento.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q02_ID,
        order: 6,

        label:
          "No papel que esperam que eu continue cumprindo.",

        signalIds: [
          "p02_boundary_presence",
          "p02_learned_role",
          "p02_non_erasing_belonging",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Você pode reconhecer que um papel já não cabe da mesma forma.",

          standard:
            "Mudar sua participação não exige negar tudo o que esse papel representou. Significa apenas admitir que você também mudou.",

          deep:
            "Papéis familiares costumam sobreviver porque organizam expectativas e oferecem previsibilidade. Questionar um papel não precisa destruir o sistema; pode apenas impedir que sua identidade continue limitada à função que aprendeu a cumprir.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você reconheceu um limite sem precisar condenar toda a relação.",

      standard:
        "Sua resposta mostra um ponto específico onde sua capacidade, escolha ou espaço precisa ser incluído. Limite concreto é diferente de julgamento total.",

      deep:
        "A presença permite duas verdades ao mesmo tempo: sua família pode ter importância real e determinado aspecto da relação pode ultrapassar o que você consegue sustentar. Reconhecer essa tensão evita tanto a anulação quanto a condenação simplificada.",
    },
  });

/*
 * Pergunta 3
 *
 * Como seria pertencer sem assumir sozinho
 * o equilíbrio de todos?
 */

const PRESENCE_Q03_ID =
  "p02_presence_q03";

export const PILLAR_02_PRESENCE_Q03 =
  createPillar02Question({
    id: PRESENCE_Q03_ID,
    phase: "presence",
    order: 3,

    prompt: pillar02Companion(
      "p02_presence_q03_prompt",
      "Como seria pertencer sem assumir sozinho o equilíbrio de todos?",
    ),

    options: [
      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 1,

        label:
          "Escutar sem precisar resolver imediatamente.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Escutar pode ser presença mesmo quando você não encontra uma solução.",

          standard:
            "Você pode acompanhar alguém sem assumir que precisa retirar toda dor, dúvida ou consequência. Isso preserva proximidade sem entregar a você o problema inteiro.",

          deep:
            "Resolver rapidamente pode reduzir seu desconforto diante do sofrimento alheio e confirmar seu papel de sustentação. Permanecer sem controlar permite que cuidado e responsabilidade compartilhada coexistam.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 2,

        label:
          "Dizer não sem construir uma defesa longa.",

        signalIds: [
          "p02_boundary_presence",
          "p02_non_erasing_belonging",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Um não pode ser claro sem carregar toda a história da relação.",

          standard:
            "Explicar menos não significa desprezar quem pediu. Pode significar apenas que seu limite não precisa ser transformado em julgamento público.",

          deep:
            "Defesas longas tentam controlar a interpretação do outro e impedir culpa, crítica ou decepção. Um limite mais simples reconhece que você não controla todas as reações e ainda assim pode permanecer respeitoso.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 3,

        label:
          "Permitir que outras pessoas tenham emoções que eu não consigo corrigir.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_ambivalence_capacity",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "load",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "A emoção do outro pode existir sem se tornar imediatamente sua tarefa.",

          standard:
            "Alguém pode ficar frustrado, triste ou irritado sem que isso prove que você errou. Nem toda emoção exige reparação por sua parte.",

          deep:
            "Quando você se sente responsável pelo clima, a reação alheia vira ordem para recuar, explicar ou compensar. Permitir que o outro atravesse a própria emoção devolve responsabilidade sem retirar cuidado.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 4,

        label:
          "Pedir divisão de responsabilidades em vez de assumir tudo.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "agency",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Pertencer também pode significar não sustentar tudo sozinho.",

          standard:
            "Dividir responsabilidade não reduz sua importância. Apenas reconhece que vínculo não precisa ser organizado por uma única pessoa.",

          deep:
            "Talvez assumir tudo tenha garantido previsibilidade, reconhecimento ou controle. Pedir participação introduz incerteza, mas também permite que a relação deixe de depender da sua exaustão.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 5,

        label:
          "Manter uma escolha própria mesmo diante de desaprovação.",

        signalIds: [
          "p02_non_erasing_belonging",
          "p02_ambivalence_capacity",
          "p02_boundary_presence",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Desaprovação e pertencimento não precisam ser exatamente a mesma coisa.",

          standard:
            "Você pode considerar a reação da família sem abandonar automaticamente sua escolha. Permanecer não significa endurecer nem recuar.",

          deep:
            "Sustentar uma escolha diante de desaprovação exige tolerar a diferença sem transformar ninguém em inimigo e sem transformar você em culpado. Esse terceiro lugar preserva vínculo e autoria ao mesmo tempo.",
        },
      }),

      createPillar02Option({
        questionId: PRESENCE_Q03_ID,
        order: 6,

        label:
          "Estar presente de forma imperfeita, sem tentar impedir todo desconforto.",

        signalIds: [
          "p02_ambivalence_capacity",
          "p02_non_erasing_belonging",
        ],

        scaleEffects: [
          {
            scale: "presence",
            delta: 1,
          },
          {
            scale: "judgment",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Sua presença não precisa garantir que tudo fique bem.",

          standard:
            "Você pode participar de uma relação sem conseguir regular todos os momentos, respostas ou necessidades. Imperfeição não cancela cuidado.",

          deep:
            "Quando pertencer significa evitar qualquer tensão, você precisa monitorar continuamente o ambiente e a si mesmo. Aceitar uma presença imperfeita retira do vínculo a exigência de equilíbrio permanente.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você imaginou uma forma de pertencer com menos responsabilidade unilateral.",

      standard:
        "Sua resposta abre uma possibilidade em que cuidado continua existindo, mas não depende de você organizar todas as emoções, decisões ou consequências.",

      deep:
        "Pertencer sem sustentar tudo sozinho exige aceitar que o vínculo pode atravessar diferenças, frustrações e limites. A presença deixa de ser controle do ambiente e passa a ser participação sem desaparecimento.",
    },
  });

export const PILLAR_02_PRESENCE_QUESTIONS:
  readonly PillarQuestion[] = [
    PILLAR_02_PRESENCE_Q01,
    PILLAR_02_PRESENCE_Q02,
    PILLAR_02_PRESENCE_Q03,
  ] as const;
