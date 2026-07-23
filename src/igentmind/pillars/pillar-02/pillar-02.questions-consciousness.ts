// src/igentmind/pillars/pillar-02/pillar-02.questions-consciousness.ts

import type {
  PillarQuestion,
} from "../template";

import {
  createPillar02Option,
  createPillar02Question,
  pillar02BookExact,
} from "./pillar-02.question-builders";

/*
 * Pergunta 1
 *
 * Em que momentos da minha vida adulta
 * eu me sinto pequeno de novo?
 */

const CONSCIOUSNESS_Q01_ID =
  "p02_consciousness_q01";

export const PILLAR_02_CONSCIOUSNESS_Q01 =
  createPillar02Question({
    id: CONSCIOUSNESS_Q01_ID,
    phase: "consciousness",
    order: 1,

    prompt: pillar02BookExact(
      "p02_consciousness_q01_prompt",
      "Em que momentos da minha vida adulta eu me sinto pequeno de novo?",
    ),

    options: [
      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 1,

        label:
          "Quando alguém importante desaprova o que escolhi.",

        signalIds: [
          "p02_learned_role",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A desaprovação parece reduzir seu espaço interno antes mesmo de qualquer conclusão.",

          standard:
            "Quando alguém importante desaprova, você pode voltar rapidamente ao lugar de quem precisa corrigir a própria escolha. Perceber isso separa a reação automática da decisão atual.",

          deep:
            "Talvez a questão não seja apenas a escolha, mas o lugar que você ocupa quando ela é questionada. Uma parte tenta preservar o vínculo diminuindo a própria certeza; reconhecer esse movimento permite permanecer sem transformar desaprovação em sentença.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 2,

        label:
          "Quando alguém mais velho ou com autoridade questiona minha decisão.",

        signalIds: [
          "p02_learned_role",
          "p02_inherited_silence",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "A autoridade parece diminuir sua confiança antes de você avaliar o que realmente pensa.",

          standard:
            "Quando uma figura de autoridade questiona você, sua posição pode perder força rapidamente. Isso não define a validade da decisão; mostra apenas onde sua voz ainda se retrai.",

          deep:
            "Existe diferença entre considerar a experiência de alguém e entregar a essa pessoa o direito de definir sua escolha. O encolhimento pode ser um reflexo aprendido de respeito, proteção ou pertencimento, sem precisar comandar o próximo passo.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 3,

        label:
          "Quando existe conflito, tensão ou mudança no clima da conversa.",

        signalIds: [
          "p02_environment_vigilance",
          "p02_inherited_silence",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A mudança no clima parece fazer você diminuir para tentar reduzir a tensão.",

          standard:
            "Seu corpo pode perceber o conflito antes de você formular qualquer pensamento. Nesse instante, ficar menor pode funcionar como tentativa de preservar o ambiente.",

          deep:
            "Quando o clima muda, talvez sua atenção saia de você e passe a vigiar a reação de todos. O custo é perder contato com a própria posição; perceber esse deslocamento cria um intervalo antes de assumir novamente a responsabilidade pelo ambiente.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 4,

        label:
          "Quando preciso pedir ajuda, admitir dúvida ou mostrar que não consigo sozinho.",

        signalIds: [
          "p02_learned_role",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "judgment",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Pedir ajuda parece tocar um lugar onde precisar de alguém soa como falha.",

          standard:
            "A sensação de ficar pequeno pode aparecer quando sua imagem de estabilidade é interrompida. Isso mostra o peso de ter aprendido a ocupar o papel de quem sustenta.",

          deep:
            "Talvez admitir necessidade ameace uma identidade construída em torno de competência, utilidade ou controle. Reconhecer essa ameaça não diminui sua força; apenas revela quanto esforço existe em parecer autossuficiente o tempo todo.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 5,

        label:
          "Quando sou comparado ou percebo que esperavam outro resultado de mim.",

        signalIds: [
          "p02_learned_role",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "judgment",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A comparação parece transformar diferença em insuficiência.",

          standard:
            "Quando surge uma expectativa não alcançada, você pode deixar de avaliar o próprio caminho e passar a se medir pelo olhar recebido. É aí que o espaço interno diminui.",

          deep:
            "A comparação pode reativar a ideia de que pertencimento depende de corresponder. Nesse estado, o resultado deixa de ser apenas um resultado e passa a parecer uma medida de valor; perceber essa mudança impede que ela se torne identidade.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q01_ID,
        order: 6,

        label:
          "Não consigo identificar a situação, mas percebo meu corpo se contrair.",

        signalIds: [
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A contração já é informação suficiente por enquanto.",

          standard:
            "Você não precisa localizar imediatamente uma causa. Perceber que o corpo muda diante de certas situações já abre espaço para observar sem inventar explicações.",

          deep:
            "Nem toda reação chega primeiro como pensamento. Às vezes, o corpo registra redução, alerta ou contenção antes que a mente reconheça o contexto; permanecer com essa percepção é mais preciso do que preencher a lacuna rapidamente.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você localizou um momento em que seu espaço interno parece diminuir. Não é necessário explicar tudo agora.",

      standard:
        "Sua resposta aponta para uma situação concreta em que você deixa de se sentir plenamente adulto ou autorizado a ocupar espaço. Reconhecer o momento já altera a forma de atravessá-lo.",

      deep:
        "O mais importante não é concluir de onde isso veio, mas perceber o movimento atual: algo acontece, seu lugar interno diminui e outra pessoa ou ambiente ganha autoridade excessiva. Essa sequência pode ser observada sem acusação e sem autoabandono.",
    },
  });

/*
 * Pergunta 2
 *
 * Onde eu me contenho mesmo estando seguro?
 */

const CONSCIOUSNESS_Q02_ID =
  "p02_consciousness_q02";

export const PILLAR_02_CONSCIOUSNESS_Q02 =
  createPillar02Question({
    id: CONSCIOUSNESS_Q02_ID,
    phase: "consciousness",
    order: 2,

    prompt: pillar02BookExact(
      "p02_consciousness_q02_prompt",
      "Onde eu me contenho mesmo estando seguro?",
    ),

    options: [
      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 1,

        label:
          "Ao expressar uma opinião diferente.",

        signalIds: [
          "p02_inherited_silence",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua opinião parece passar por um filtro antes de ganhar voz.",

          standard:
            "Mesmo sem ameaça clara, discordar pode ativar a expectativa de tensão ou rejeição. A contenção tenta manter o vínculo estável.",

          deep:
            "Talvez sua mente avalie primeiro o impacto da opinião sobre o ambiente e só depois o que você realmente pensa. Isso protegeu relações em algum momento, mas hoje pode fazer sua voz depender demais da reação antecipada dos outros.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 2,

        label:
          "Ao dizer do que preciso ou pedir algo para mim.",

        signalIds: [
          "p02_inherited_silence",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Nomear uma necessidade parece ocupar mais espaço do que você se permite.",

          standard:
            "Pedir algo para si pode soar internamente como peso, cobrança ou egoísmo. A contenção aparece antes que a outra pessoa responda.",

          deep:
            "Quando necessidades foram associadas a incômodo ou excesso, o corpo pode aprender a reduzi-las antes de qualquer negociação. Reconhecer isso permite distinguir pedir, exigir e simplesmente existir com uma necessidade legítima.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 3,

        label:
          "Ao demonstrar tristeza, raiva, medo ou cansaço.",

        signalIds: [
          "p02_inherited_silence",
          "p02_learned_role",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Algumas emoções parecem precisar ser reduzidas antes de serem mostradas.",

          standard:
            "Você pode ter aprendido a avaliar se sua emoção cabe no ambiente antes de senti-la por inteiro. Isso transforma expressão em vigilância.",

          deep:
            "Conter emoções pode ter preservado estabilidade, evitado crítica ou mantido uma função familiar. Hoje, a mesma estratégia pode afastar você do que sente; perceber o filtro é diferente de precisar derrubá-lo imediatamente.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 4,

        label:
          "Ao demonstrar alegria, orgulho ou entusiasmo por algo meu.",

        signalIds: [
          "p02_inherited_silence",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "presence",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Até a alegria parece precisar medir o espaço que ocupa.",

          standard:
            "Seu entusiasmo pode diminuir quando existe receio de parecer excessivo, arrogante ou distante dos outros. A contenção protege o pertencimento, mas reduz sua presença.",

          deep:
            "Às vezes, crescer, celebrar ou aparecer desperta a sensação de estar se separando do grupo. O desafio não é exibir mais, mas perceber quando você apaga a própria vitalidade para evitar desconforto ao redor.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 5,

        label:
          "Ao discordar de uma decisão ou recusar um pedido.",

        signalIds: [
          "p02_inherited_silence",
          "p02_disloyalty_fear",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "readiness",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "A discordância parece ganhar um peso maior do que a situação presente exige.",

          standard:
            "Recusar ou discordar pode ser vivido internamente como ameaça ao vínculo. Por isso, você se contém antes mesmo de avaliar se existe espaço para conversar.",

          deep:
            "Quando diferença foi confundida com afronta ou deslealdade, o simples ato de dizer não pode ativar um conflito moral inteiro. Perceber essa carga ajuda a separar a escolha atual do significado antigo atribuído a ela.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q02_ID,
        order: 6,

        label:
          "Não sei exatamente; apenas percebo que edito o que digo e faço.",

        signalIds: [
          "p02_environment_vigilance",
          "p02_inherited_silence",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Perceber a edição já torna visível algo que antes acontecia automaticamente.",

          standard:
            "Você não precisa identificar agora todas as situações. Notar que existe uma versão previamente ajustada de você já oferece um ponto de observação.",

          deep:
            "A autoedição pode ocorrer tão rápido que parece personalidade. Observar quando você revisa tom, emoção, opinião ou presença antes de se mostrar ajuda a distinguir escolha cuidadosa de contenção automática.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você percebeu um lugar onde a contenção continua ativa. Isso já basta para esta etapa.",

      standard:
        "Sua resposta mostra que segurança externa e segurança interna nem sempre chegam ao mesmo tempo. O ambiente pode permitir, enquanto uma parte sua ainda espera alguma consequência.",

      deep:
        "A contenção não precisa ser atacada. Ela pode ser observada como uma estratégia que ainda verifica se existe permissão para ocupar espaço, sentir ou discordar; reconhecer essa verificação devolve parte da escolha ao presente.",
    },
  });

/*
 * Pergunta 3
 *
 * Onde eu continuo tentando manter um equilíbrio
 * que não é meu dever sustentar?
 */

const CONSCIOUSNESS_Q03_ID =
  "p02_consciousness_q03";

export const PILLAR_02_CONSCIOUSNESS_Q03 =
  createPillar02Question({
    id: CONSCIOUSNESS_Q03_ID,
    phase: "consciousness",
    order: 3,

    prompt: pillar02BookExact(
      "p02_consciousness_q03_prompt",
      "Onde eu continuo tentando manter um equilíbrio que não é meu dever sustentar?",
    ),

    options: [
      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 1,

        label:
          "Tentando mediar conflitos entre outras pessoas.",

        signalIds: [
          "p02_learned_role",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Você parece entrar no conflito para impedir que o ambiente se desorganize.",

          standard:
            "Mediar pode ser cuidado, mas também pode se tornar uma função automática. A diferença aparece quando você sente que não tem permissão para ficar fora.",

          deep:
            "Assumir o centro de conflitos alheios pode preservar uma sensação de segurança e utilidade. O custo surge quando sua tranquilidade depende de conseguir regular relações que não estão sob seu controle.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 2,

        label:
          "Antecipando o humor e as necessidades de todos.",

        signalIds: [
          "p02_environment_vigilance",
          "p02_learned_role",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua atenção parece permanecer ocupada tentando prever o ambiente.",

          standard:
            "Antecipar pode evitar desconfortos, mas mantém você em vigilância constante. Nesse lugar, o descanso depende de todos estarem bem.",

          deep:
            "Quando você tenta chegar antes da necessidade, da irritação ou da decepção dos outros, o vínculo passa a exigir leitura permanente do ambiente. Perceber isso ajuda a diferenciar sensibilidade de responsabilidade ilimitada.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 3,

        label:
          "Resolvendo problemas que outras pessoas poderiam enfrentar.",

        signalIds: [
          "p02_learned_role",
          "p02_emotional_debt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "agency",
            delta: -1,
          },
        ],

        responses: {
          minimal:
            "Ajudar parece ter se aproximado de assumir o problema inteiro.",

          standard:
            "Sua capacidade de resolver pode ter se transformado em expectativa permanente. O peso aparece quando ajudar deixa de ser escolha.",

          deep:
            "Ser competente pode garantir reconhecimento e pertencimento, mas também esconder a crença de que seu valor está em evitar que os outros enfrentem consequências, frustrações ou responsabilidades próprias.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 4,

        label:
          "Cedendo para impedir discussões ou manter a paz.",

        signalIds: [
          "p02_inherited_silence",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "avoidance",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "A paz parece depender de você abrir mão primeiro.",

          standard:
            "Ceder pode ser uma escolha legítima, mas se torna peso quando é a única forma interna de impedir conflito. Nesse momento, harmonia e desaparecimento começam a se misturar.",

          deep:
            "Manter a paz pode ter sido um papel importante, porém a paz sustentada apenas pela sua retração cobra presença, voz e limite. Reconhecer esse custo não obriga confronto; apenas torna o acordo interno visível.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 5,

        label:
          "Oferecendo ajuda prática ou financeira além do que consigo sustentar.",

        signalIds: [
          "p02_emotional_debt",
          "p02_family_guilt",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "Sua disponibilidade parece ultrapassar sua capacidade antes que você consiga avaliar o limite.",

          standard:
            "A ajuda pode estar misturada a culpa, dívida ou medo de falhar com o vínculo. Reconhecer isso não invalida o cuidado; apenas inclui seu próprio limite na equação.",

          deep:
            "Quando pertencimento e ajuda se confundem, reduzir disponibilidade pode parecer abandono. O ponto de presença é perceber que responsabilidade real, generosidade e autoabandono não são a mesma coisa.",
        },
      }),

      createPillar02Option({
        questionId: CONSCIOUSNESS_Q03_ID,
        order: 6,

        label:
          "Tentando ser sempre a pessoa estável, forte ou disponível.",

        signalIds: [
          "p02_learned_role",
          "p02_emotional_debt",
          "p02_environment_vigilance",
        ],

        scaleEffects: [
          {
            scale: "awareness",
            delta: 1,
          },
          {
            scale: "load",
            delta: 1,
          },
        ],

        responses: {
          minimal:
            "O papel de estabilidade parece não permitir que você também oscile.",

          standard:
            "Ser a pessoa confiável pode ter valor, mas se torna prisão quando cansaço, dúvida ou ausência deixam de ser permitidos. O papel começa a ocupar o lugar da pessoa.",

          deep:
            "Talvez sua presença tenha sido organizada em torno de sustentar, não preocupar e permanecer disponível. Reconhecer essa estrutura permite perguntar quanto dela ainda é escolha e quanto permanece por medo do que aconteceria se você também precisasse ser sustentado.",
        },
      }),
    ],

    openResponse: {
      minimal:
        "Você reconheceu um equilíbrio que ocupa mais de você do que deveria.",

      standard:
        "Sua resposta mostra onde cuidado e responsabilidade podem ter se misturado. Não é necessário retirar nada agora; primeiro, basta perceber o peso que foi assumido.",

      deep:
        "Existe uma diferença entre participar de um vínculo e sentir que sua estabilidade precisa garantir a estabilidade de todos. Tornar essa diferença visível cria a possibilidade de cuidar sem desaparecer dentro da função.",
    },
  });

export const PILLAR_02_CONSCIOUSNESS_QUESTIONS:
  readonly PillarQuestion[] = [
    PILLAR_02_CONSCIOUSNESS_Q01,
    PILLAR_02_CONSCIOUSNESS_Q02,
    PILLAR_02_CONSCIOUSNESS_Q03,
  ] as const;
