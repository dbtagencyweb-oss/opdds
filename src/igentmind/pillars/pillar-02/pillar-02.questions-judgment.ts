// src/igentmind/pillars/pillar-02/pillar-02.questions-judgment.ts

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
 * Que culpa aparece quando eu imagino
 * decepcionar minha família?
 */

const JUDGMENT_Q01_ID =
  "p02_judgment_q01";

export const PILLAR_02_JUDGMENT_Q01 =
  createPillar02Question({
    id: JUDGMENT_Q01_ID,
    phase: "judgment",
    order: 1,

    prompt: pillar02Companion(
      "p02_judgment_q01_prompt",
      "Que culpa aparece quando eu imagino decepcionar minha família?",
    ),

    options: [
      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 1,

        label:
          "Sinto que estou sendo egoísta.",

        signalIds: [
          "p02_family_guilt",
          "p02_disloyalty_fear",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "A culpa chama de egoísmo qualquer movimento que inclua você.",

          standard:
            "Priorizar uma necessidade parece ser traduzido imediatamente como falta de consideração. Essa tradução pode acontecer antes de você avaliar se existe dano real.",

          deep:
            "Quando cuidar de si ameaça a identidade de pessoa disponível, generosa ou leal, a palavra egoísmo surge como correção moral. Percebê-la como narrativa permite examinar a escolha sem obedecer automaticamente à acusação.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 2,

        label:
          "Sinto que estou sendo ingrato pelo que recebi.",

        signalIds: [
          "p02_family_guilt",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A gratidão parece ter se transformado em obrigação de concordar ou permanecer disponível.",

          standard:
            "Reconhecer o que recebeu não exige negar o que precisa agora. Gratidão e diferenciação podem coexistir.",

          deep:
            "A culpa pode usar tudo o que foi oferecido como argumento para suspender escolhas próprias. Mas receber cuidado não cria uma dívida ilimitada; é possível honrar o que existiu sem entregar permanentemente a direção da própria vida.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 3,

        label:
          "Sinto que estou falhando como filho, irmão, pai, mãe ou familiar.",

        signalIds: [
          "p02_family_guilt",
          "p02_learned_role",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Uma escolha parece definir todo o seu valor dentro do papel familiar.",

          standard:
            "O julgamento transforma um limite, uma ausência ou uma diferença em falha de identidade. Assim, você deixa de avaliar a situação e começa a condenar quem é.",

          deep:
            "Papéis familiares podem se tornar padrões impossíveis: estar sempre presente, disponível, estável ou correto. Quando você não corresponde, a mente não registra apenas um limite humano; ela anuncia que você deixou de merecer o lugar.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 4,

        label:
          "Sinto que estou abandonando alguém.",

        signalIds: [
          "p02_disloyalty_fear",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Criar distância ou limite parece receber internamente o nome de abandono.",

          standard:
            "O medo de abandonar pode surgir mesmo quando você apenas reduz uma responsabilidade ou preserva algum espaço. Vale distinguir ausência, limite e abandono.",

          deep:
            "Quando você se sente responsável pela estabilidade emocional de alguém, qualquer retirada de energia pode parecer perigosa. O julgamento ignora graus e contextos; presença é recuperar essas diferenças antes de decidir.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 5,

        label:
          "Imagino críticas, comentários ou comparações.",

        signalIds: [
          "p02_family_guilt",
          "p02_disloyalty_fear",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "O julgamento começa antes da conversa, usando reações que ainda nem aconteceram.",

          standard:
            "Você pode estar respondendo antecipadamente a comentários imaginados ou já conhecidos. Isso aumenta a carga antes de existir uma situação concreta.",

          deep:
            "Antecipar crítica permite preparar defesa, explicação ou recuo, mas também entrega ao olhar alheio o comando da escolha. Reconhecer a previsão não significa ignorar riscos; significa não tratá-la como resultado inevitável.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q01_ID,
        order: 6,

        label:
          "A culpa aparece no corpo, mas não consigo formar uma frase clara.",

        signalIds: [
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "awareness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A culpa pode existir como peso antes de se tornar pensamento.",

          standard:
            "Não encontrar uma frase não invalida o que você percebe. O corpo pode reagir a um limite ou escolha antes que a regra moral interna fique visível.",

          deep:
            "Talvez a culpa esteja tão integrada ao modo de pertencer que não precise mais de palavras. Observar onde ela aparece, o que interrompe e que ação tenta impedir pode revelar mais do que buscar rapidamente uma explicação.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você reconheceu a forma que a culpa assume. Ela não precisa decidir por você agora.",

      standard:
        "Sua resposta mostra qual acusação interna aparece quando existe possibilidade de decepcionar. Reconhecer a acusação é diferente de aceitá-la como verdade.",

      deep:
        "A culpa pode tentar preservar pertencimento transformando diferença em falha moral. O próximo movimento não é combatê-la nem obedecer; é separar o que pertence à responsabilidade concreta do que pertence ao medo de perder lugar.",
    },
  });

/*
 * Pergunta 2
 *
 * Que dívida eu sinto que preciso pagar
 * para continuar pertencendo?
 */

const JUDGMENT_Q02_ID =
  "p02_judgment_q02";

export const PILLAR_02_JUDGMENT_Q02 =
  createPillar02Question({
    id: JUDGMENT_Q02_ID,
    phase: "judgment",
    order: 2,

    prompt: pillar02Companion(
      "p02_judgment_q02_prompt",
      "Que dívida eu sinto que preciso pagar para continuar pertencendo?",
    ),

    options: [
      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 1,

        label:
          "Preciso estar sempre disponível.",

        signalIds: [
          "p02_emotional_debt",
          "p02_learned_role",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua disponibilidade parece funcionar como prova contínua de vínculo.",

          standard:
            "Estar presente pode ser escolha afetiva, mas a dívida aparece quando indisponibilidade vira culpa automática. Nesse ponto, não existe descanso completo.",

          deep:
            "Se pertencer depende de responder, resolver ou aparecer sempre, sua presença deixa de ser encontro e vira manutenção do lugar. Reconhecer isso ajuda a distinguir compromisso real de disponibilidade sem limite.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 2,

        label:
          "Preciso compensar os sacrifícios que fizeram por mim.",

        signalIds: [
          "p02_emotional_debt",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "O que foi recebido parece exigir uma compensação que nunca termina.",

          standard:
            "Reconhecer sacrifícios pode gerar gratidão, mas não precisa cancelar sua autonomia. A dívida se torna infinita quando nenhum gesto parece suficiente.",

          deep:
            "Talvez sua vida tenha se transformado em resposta a investimentos, expectativas ou renúncias feitas por outros. Honrar essas experiências não exige que todas as suas escolhas funcionem como pagamento.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 3,

        label:
          "Preciso resolver os problemas da família.",

        signalIds: [
          "p02_emotional_debt",
          "p02_learned_role",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Seu lugar parece estar ligado à capacidade de resolver.",

          standard:
            "A competência pode ter se tornado uma condição silenciosa de pertencimento. Quando você não resolve, surge a sensação de estar falhando com todos.",

          deep:
            "Ser chamado, procurado ou reconhecido por resolver pode oferecer importância e também aprisionar. A questão não é deixar de ajudar, mas perceber quando sua identidade depende de impedir que os outros enfrentem a própria parte.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 4,

        label:
          "Preciso alcançar resultados para justificar tudo o que investiram em mim.",

        signalIds: [
          "p02_emotional_debt",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "O resultado parece ter virado prova de que você mereceu o que recebeu.",

          standard:
            "Quando sucesso funciona como pagamento, cada atraso ganha peso moral. O caminho deixa de ser seu e passa a responder a uma conta interna.",

          deep:
            "Talvez exista a sensação de que falhar desperdiçaria esforços, expectativas ou oportunidades oferecidas. Essa pressão pode tornar qualquer escolha própria suspeita, especialmente quando ela não produz o resultado imaginado pelos outros.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 5,

        label:
          "Preciso evitar dizer não, mesmo quando estou no limite.",

        signalIds: [
          "p02_emotional_debt",
          "p02_family_guilt",
          "p02_disloyalty_fear",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "O não parece ameaçar algo maior do que o pedido presente.",

          standard:
            "Recusar pode ativar dívida, medo de decepcionar e receio de perder lugar. Por isso, seu limite só aparece depois que a capacidade já foi ultrapassada.",

          deep:
            "Quando todo pedido carrega o peso do vínculo inteiro, avaliar disponibilidade se torna quase impossível. Presença começa ao perceber que negar uma demanda específica não define todo o amor, a gratidão ou a lealdade existentes.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q02_ID,
        order: 6,

        label:
          "Preciso proteger a imagem de que está tudo bem.",

        signalIds: [
          "p02_emotional_debt",
          "p02_inherited_silence",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Manter a aparência de equilíbrio parece ter se tornado uma obrigação.",

          standard:
            "Você pode sentir que reconhecer tensão, falta ou limite ameaça a unidade familiar. Então, o silêncio preserva a imagem, mas mantém o peso dentro.",

          deep:
            "Proteger a narrativa de que tudo está bem pode evitar exposição e conflito, porém também impede que você reconheça a própria experiência. Admitir internamente uma contradição não exige transformar a história inteira em condenação.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você nomeou uma dívida que parece organizar seu modo de pertencer.",

      standard:
        "Sua resposta mostra o que você sente precisar oferecer para continuar ocupando seu lugar. Tornar essa exigência visível já reduz sua aparência de regra natural.",

      deep:
        "A dívida emocional costuma sobreviver porque não possui valor, prazo ou conclusão definidos. Ela apenas exige mais disponibilidade, resultado ou adaptação; reconhecer sua forma permite incluir escolha e limite onde antes havia somente obrigação.",
    },
  });

/*
 * Pergunta 3
 *
 * Que parte de mim eu condeno quando desejo
 * escolher diferente do roteiro familiar?
 */

const JUDGMENT_Q03_ID =
  "p02_judgment_q03";

export const PILLAR_02_JUDGMENT_Q03 =
  createPillar02Question({
    id: JUDGMENT_Q03_ID,
    phase: "judgment",
    order: 3,

    prompt: pillar02Companion(
      "p02_judgment_q03_prompt",
      "Que parte de mim eu condeno quando desejo escolher diferente do roteiro familiar?",
    ),

    options: [
      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 1,

        label:
          "A parte que deseja priorizar a própria vida.",

        signalIds: [
          "p02_family_guilt",
          "p02_disloyalty_fear",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Seu desejo próprio parece receber uma acusação antes de ser compreendido.",

          standard:
            "Priorizar sua vida pode ser interpretado internamente como afastamento ou egoísmo. Assim, o desejo já nasce em posição de defesa.",

          deep:
            "Quando pertencimento foi associado a disponibilidade e adaptação, escolher por si pode parecer uma ameaça à identidade moral que você construiu. Observar essa condenação permite examinar o desejo sem reduzi-lo a defeito.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 2,

        label:
          "A parte que quer crescer, aparecer ou seguir um caminho maior.",

        signalIds: [
          "p02_disloyalty_fear",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "presence",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Crescer parece trazer o risco de se afastar ou parecer superior.",

          standard:
            "Seu movimento de expansão pode despertar culpa por deixar referências, ritmos ou expectativas conhecidas. Isso reduz o entusiasmo antes mesmo do caminho começar.",

          deep:
            "Às vezes, ir além é vivido como quebra de igualdade ou abandono simbólico. A mente tenta preservar proximidade diminuindo ambição, visibilidade ou alegria; reconhecer esse pacto não exige negar suas raízes.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 3,

        label:
          "A parte que quer descansar, reduzir responsabilidades ou viver de outro modo.",

        signalIds: [
          "p02_family_guilt",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "O descanso parece ser julgado como irresponsabilidade.",

          standard:
            "Reduzir peso pode ativar a ideia de que você está deixando de cumprir seu papel. Por isso, até o cansaço precisa ser defendido.",

          deep:
            "Se seu valor foi associado a esforço, disponibilidade ou sustentação, descansar pode parecer perda de identidade e lealdade. O julgamento ignora que limite também faz parte da responsabilidade.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 4,

        label:
          "A parte que discorda de valores, costumes ou decisões familiares.",

        signalIds: [
          "p02_disloyalty_fear",
          "p02_inherited_silence",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "A diferença parece ser tratada internamente como deslealdade.",

          standard:
            "Discordar pode ameaçar a sensação de continuidade com sua história. Então, você se corrige antes de descobrir se existe espaço para uma posição própria.",

          deep:
            "Valores herdados podem oferecer identidade e vínculo, mas também se tornar critérios absolutos de pertencimento. Reconhecer uma diferença não apaga o que foi recebido; apenas impede que toda divergência seja convertida em traição.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 5,

        label:
          "A parte intensa, sensível, criativa ou diferente que não cabia bem.",

        signalIds: [
          "p02_inherited_silence",
          "p02_learned_role",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Uma parte viva de você parece ter aprendido a pedir desculpas por existir.",

          standard:
            "Características que provocavam desconforto podem ter sido reduzidas para facilitar pertencimento. A condenação continua mesmo quando o ambiente mudou.",

          deep:
            "Sensibilidade, intensidade ou diferença podem ter recebido nomes que as tornaram inconvenientes. Ao internalizar esse olhar, você passa a controlar a própria expressão antes que alguém precise fazê-lo.",
        },
      }),

      createPillar02Option({
        questionId: JUDGMENT_Q03_ID,
        order: 6,

        label:
          "A parte que teme perder amor, respeito ou proximidade.",

        signalIds: [
          "p02_disloyalty_fear",
          "p02_family_guilt",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "judgment",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Seu medo tenta impedir a escolha para proteger o vínculo.",

          standard:
            "A condenação pode estar menos ligada ao desejo e mais ao que você teme perder ao segui-lo. Isso mostra a importância do pertencimento, não a falsidade da sua vontade.",

          deep:
            "Quando amor e concordância foram aproximados demais, qualquer diferença pode parecer risco de exclusão. Reconhecer o medo permite tratá-lo como parte da decisão, sem entregar a ele o poder de definir toda a direção.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você reconheceu a parte que costuma ser julgada quando deseja algo diferente.",

      standard:
        "Sua resposta mostra que o conflito não acontece apenas entre você e uma expectativa externa. Ele continua dentro, na forma como uma parte sua é condenada antes de ter espaço.",

      deep:
        "Escolher diferente pode despertar um tribunal interno formado por culpa, medo e lealdade. A presença começa quando você permite que o desejo seja ouvido sem transformá-lo automaticamente em ameaça à sua história ou ao seu caráter.",
    },
  });

export const PILLAR_02_JUDGMENT_QUESTIONS:
  readonly PillarQuestion[] = [
    PILLAR_02_JUDGMENT_Q01,
    PILLAR_02_JUDGMENT_Q02,
    PILLAR_02_JUDGMENT_Q03,
  ] as const;
