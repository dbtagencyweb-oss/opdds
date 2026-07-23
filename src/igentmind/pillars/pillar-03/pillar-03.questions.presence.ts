import type {
  Pillar03OptionBlueprint,
} from "./pillar-03.block29.contracts";

import {
  createPillar03Question,
} from "./pillar-03.questions.factory";

function option(
  id: string,
  semanticPosition:
    Pillar03OptionBlueprint["semanticPosition"],
  visibleText: string,
  mirror: string,
  displacement: string,
  nextMoveText: string,
  nextMoveType:
    | "question"
    | "pause" = "question",
  scaleEffects:
    Pillar03OptionBlueprint["scaleEffects"] = {},
): Pillar03OptionBlueprint {
  return Object.freeze({
    id,
    semanticPosition,
    visibleText,
    mirror,
    displacement,
    nextMove: Object.freeze({
      interventionType: nextMoveType,
      text: nextMoveText,
    }),
    scaleEffects: Object.freeze(
      scaleEffects,
    ),
  });
}

export const PILLAR_03_PRESENCE_QUESTIONS =
  Object.freeze([
    createPillar03Question({
      id: "p03_presence_q01",
      order: 7,
      phaseOrder: 1,
      phase: "presence",
      canonicalSectionId: "p03_presence",
      primarySignalId:
        "p03_allowing_absence",

      prompt:
        "O que eu consigo reconhecer nessa ausência sem tentar preenchê-la agora?",

      openAnswerDisplacement:
        "Reconhecer a ausência não exige permanecer indefinidamente nela nem transformá-la em decisão.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que pode ser reconhecido agora sem precisar ser resolvido?",
      }),

      options: Object.freeze([
        option(
          "p03_presence_q01_o01",
          "recognition",
          "Consigo reconhecer que ainda existe falta.",
          "Você consegue admitir a presença da falta sem precisar negar sua continuidade.",
          "Reconhecer que existe falta não entrega a ela o controle de toda a experiência.",
          "Onde essa falta pode existir sem ocupar tudo?",
          "question",
          {
            presence: 1,
            awareness: 1,
          },
        ),

        option(
          "p03_presence_q01_o02",
          "minimization",
          "Talvez eu consiga, desde que não permaneça nisso.",
          "Você aceita algum contato, mas estabelece rapidamente um limite para sua duração.",
          "Esse limite pode ser cuidado, embora também possa revelar receio de que qualquer contato se torne permanente.",
          "Quanto tempo de contato pareceria suportável sem virar invasão?",
          "question",
          {
            avoidance: 1,
            presence: 1,
          },
        ),

        option(
          "p03_presence_q01_o03",
          "defense",
          "Reconhecer parece abrir uma porta que prefiro manter fechada.",
          "Você percebe o reconhecimento como risco de acesso a algo difícil de conter.",
          "Manter a porta fechada pode ser uma proteção válida neste momento; presença também inclui respeitar limites.",
          "Não é necessário abrir essa porta agora.",
          "pause",
          {
            avoidance: 1,
            load: 1,
          },
        ),

        option(
          "p03_presence_q01_o04",
          "ambivalence",
          "Quero admitir a falta, mas temo ser tomado por ela.",
          "Você deseja contato e, ao mesmo tempo, teme perder o próprio eixo.",
          "A presença pode começar por um contato pequeno, que não exija mergulho completo nem negação.",
          "Qual forma mínima de reconhecimento parece segura?",
          "question",
          {
            awareness: 1,
            presence: 1,
            load: 1,
          },
        ),

        option(
          "p03_presence_q01_o05",
          "desire",
          "Gostaria de dar um lugar à ausência sem entregar o dia inteiro a ela.",
          "Você deseja construir um limite onde a falta possa existir sem dominar o restante do dia.",
          "Dar lugar não significa oferecer todo o espaço; significa interromper a disputa entre apagamento e invasão.",
          "Que lugar pequeno e delimitado essa ausência poderia ocupar hoje?",
          "question",
          {
            presence: 1,
            agency: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_presence_q01_o06",
          "uncertainty",
          "Não sei o que significa ficar com a ausência.",
          "Você ainda não reconhece uma forma concreta de permanecer diante da falta.",
          "Ficar não precisa significar pensar longamente; pode ser apenas perceber uma sensação antes de mudar de assunto.",
          "Por agora, você pode deixar a definição em aberto.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_presence_q02",
      order: 8,
      phaseOrder: 2,
      phase: "presence",
      canonicalSectionId: "p03_presence",
      primarySignalId:
        "p03_non_replacement_capacity",

      prompt:
        "Que espaço posso permitir que exista sem substituir imediatamente o que foi perdido?",

      openAnswerDisplacement:
        "Permitir espaço não significa recusar o novo; significa não exigir que o novo apague ou reproduza o que existiu.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que poderia entrar na sua vida sem receber a tarefa de substituir o que foi perdido?",
      }),

      options: Object.freeze([
        option(
          "p03_presence_q02_o01",
          "recognition",
          "Consigo perceber que algumas coisas não precisam ser substituídas.",
          "Você reconhece que certas ausências podem permanecer sem exigir um equivalente.",
          "Não substituir não impede continuidade; pode impedir apenas que o novo seja usado como réplica obrigatória do que existiu.",
          "Que espaço pode permanecer diferente sem ser tratado como defeito?",
          "question",
          {
            presence: 1,
            awareness: 1,
          },
        ),

        option(
          "p03_presence_q02_o02",
          "minimization",
          "Todo espaço acaba sendo ocupado por outra coisa.",
          "Você percebe a vida como um movimento em que espaços vazios acabam recebendo novos conteúdos.",
          "Algo novo pode ocupar tempo e atenção sem necessariamente substituir o significado do que foi perdido.",
          "O que mudou de lugar sem realmente substituir a ausência?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_presence_q02_o03",
          "defense",
          "Se eu não preencher, o vazio cresce.",
          "Você associa espaço não preenchido ao risco de aumento do vazio.",
          "Preencher pode oferecer alívio legítimo; a questão não é proibir esse movimento, mas perceber quando ele deixa de ser escolha.",
          "Não precisamos deixar nenhum espaço maior agora.",
          "pause",
          {
            avoidance: 1,
            load: 1,
          },
        ),

        option(
          "p03_presence_q02_o04",
          "ambivalence",
          "Quero preservar o que foi, mas também quero algo novo.",
          "Você reconhece o desejo de continuidade sem abandonar o valor do que existiu.",
          "Preservar e abrir espaço para o novo podem coexistir quando o novo não recebe a obrigação de apagar o anterior.",
          "O que você deseja preservar sem impedir que outra experiência nasça?",
          "question",
          {
            awareness: 1,
            presence: 1,
          },
        ),

        option(
          "p03_presence_q02_o05",
          "desire",
          "Gostaria de permitir novas experiências sem usá-las para apagar a anterior.",
          "Você deseja que o novo tenha identidade própria, sem funcionar como correção da perda.",
          "Essa diferença pode proteger tanto a lembrança quanto a experiência que ainda não aconteceu.",
          "Que expectativa poderia ser retirada do que vier depois?",
          "question",
          {
            presence: 1,
            agency: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_presence_q02_o06",
          "uncertainty",
          "Não sei distinguir continuidade de substituição.",
          "Você ainda não possui um critério claro para separar seguir de trocar uma experiência por outra.",
          "A distinção talvez apareça menos na forma externa e mais na função que o novo recebe dentro de você.",
          "Você pode observar essa função antes de tentar concluir.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_presence_q03",
      order: 9,
      phaseOrder: 3,
      phase: "presence",
      canonicalSectionId: "p03_presence",
      primarySignalId:
        "p03_integration_without_erasure",

      prompt:
        "Como posso continuar sem apagar o que essa perda significou?",

      openAnswerDisplacement:
        "Continuar pode incluir lembrança, falta e mudança sem transformar nenhuma delas em prova de que você permaneceu parado.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que você deseja carregar e o que não precisa mais governar seus próximos passos?",
      }),

      options: Object.freeze([
        option(
          "p03_presence_q03_o01",
          "recognition",
          "Posso carregar essa marca sem fazer dela toda a minha história.",
          "Você reconhece que a perda pode permanecer como parte da história sem se tornar a história inteira.",
          "Integrar não exige apagar a marca nem organizar toda a vida ao redor dela.",
          "O que essa marca pode preservar sem decidir por você?",
          "question",
          {
            presence: 1,
            agency: 1,
            awareness: 1,
          },
        ),

        option(
          "p03_presence_q03_o02",
          "minimization",
          "Continuar é não pensar mais nisso.",
          "Você associa continuidade à redução do contato consciente com a perda.",
          "Pensar menos pode fazer parte do movimento, mas não precisa ser usado como única medida de continuidade.",
          "Que outro sinal poderia mostrar que você continua?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_presence_q03_o03",
          "defense",
          "Para seguir, preciso fechar esse capítulo.",
          "Você entende fechamento como condição necessária para avançar.",
          "Algumas experiências recebem conclusão; outras mudam de lugar sem se tornarem completamente fechadas.",
          "Não é necessário decidir agora se esse capítulo está encerrado.",
          "pause",
          {
            judgment: 1,
            avoidance: 1,
          },
        ),

        option(
          "p03_presence_q03_o04",
          "ambivalence",
          "Tenho medo de que continuar pareça esquecer.",
          "Você percebe a continuidade como possível ameaça à importância do vínculo ou da experiência.",
          "Seguir não precisa retirar significado do que existiu; pode apenas impedir que a lembrança seja obrigada a permanecer imóvel.",
          "O que continuaria verdadeiro mesmo que sua vida mudasse?",
          "question",
          {
            awareness: 1,
            presence: 1,
            load: 1,
          },
        ),

        option(
          "p03_presence_q03_o05",
          "desire",
          "Quero lembrar sem permanecer preso ao mesmo momento.",
          "Você deseja manter o significado sem continuar vivendo dentro do instante da perda.",
          "A lembrança pode acompanhar movimento quando deixa de ser tratada como lugar obrigatório de permanência.",
          "Que forma de lembrar permitiria que o presente também existisse?",
          "question",
          {
            presence: 1,
            agency: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_presence_q03_o06",
          "uncertainty",
          "Ainda não sei como continuar sem perder o vínculo.",
          "Você ainda não encontrou uma forma de movimento que preserve o que considera importante.",
          "Não saber como continuar não significa que o vínculo será perdido nem que você precisa permanecer parado.",
          "Por enquanto, não é necessário escolher entre lembrar e seguir.",
          "pause",
        ),
      ]),
    }),
  ]);
