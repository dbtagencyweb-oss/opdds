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

export const PILLAR_03_CONSCIOUSNESS_QUESTIONS =
  Object.freeze([
    createPillar03Question({
      id: "p03_consciousness_q01",
      order: 1,
      phaseOrder: 1,
      phase: "consciousness",
      canonicalSectionId:
        "p03_consciousness",
      primarySignalId:
        "p03_absence_still_active",

      prompt:
        "Que ausência continua aparecendo em momentos comuns da minha vida?",

      openAnswerDisplacement:
        "A forma como você descreve essa ausência possui mais peso do que qualquer opção previamente selecionada.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "Em qual momento cotidiano isso costuma ficar mais perceptível?",
      }),

      options: Object.freeze([
        option(
          "p03_consciousness_q01_o01",
          "recognition",
          "Ela aparece em momentos comuns, como se a rotina ainda guardasse um lugar para o que não está mais aqui.",
          "Você percebe a ausência dentro do cotidiano, não apenas quando pensa diretamente na perda.",
          "Isso pode significar que a falta se tornou parte do cenário interno, sem definir toda a sua vida.",
          "Em qual momento comum essa ausência costuma ficar mais nítida?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q01_o02",
          "minimization",
          "Quase nunca penso nisso; provavelmente já passou.",
          "Você percebe pouca presença consciente dessa ausência.",
          "Pensar pouco não prova que nada permanece; também pode significar que a rotina ocupou o espaço disponível.",
          "Há algum momento em que o corpo ou o silêncio contradizem essa ideia?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_consciousness_q01_o03",
          "defense",
          "Prefiro não mexer nisso porque não muda o que aconteceu.",
          "Você protege o que conseguiu manter funcionando evitando reabrir o tema.",
          "Não mexer pode ser um limite legítimo; reconhecer o limite é diferente de concluir que a ausência deixou de existir.",
          "Não precisamos aprofundar agora. Você pode apenas notar que esse limite apareceu.",
          "pause",
          {
            avoidance: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q01_o04",
          "ambivalence",
          "Às vezes sinto muito; em outras, parece que não sinto nada.",
          "Você reconhece uma oscilação entre contato e distância.",
          "Essa alternância não precisa ser incoerência; pode ser a forma encontrada para não permanecer sempre sob o mesmo peso.",
          "O que costuma mudar antes de você passar de um estado ao outro?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q01_o05",
          "desire",
          "Gostaria de lembrar sem ser tomado pela falta.",
          "Você não deseja apagar o vínculo; deseja outra relação com a lembrança.",
          "Talvez o movimento não seja sentir menos, mas permitir que a lembrança ocupe um lugar que não tome todo o espaço.",
          "Como seria perceber essa lembrança e ainda permanecer no presente?",
          "question",
          {
            presence: 1,
            agency: 1,
          },
        ),

        option(
          "p03_consciousness_q01_o06",
          "uncertainty",
          "Não sei dizer se isso ainda está ativo em mim.",
          "Você ainda não possui um nome claro para o que permanece.",
          "Não saber evita uma conclusão apressada e pode ser um ponto honesto de observação.",
          "Por agora, basta notar quando a pergunta voltar, sem forçar uma resposta.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_consciousness_q02",
      order: 2,
      phaseOrder: 2,
      phase: "consciousness",
      canonicalSectionId:
        "p03_consciousness",
      primarySignalId:
        "p03_unritualized_loss",

      prompt:
        "Que perda eu precisei atravessar sem ter espaço para parar?",

      openAnswerDisplacement:
        "A falta de pausa pode ter alterado a forma como essa experiência conseguiu — ou não conseguiu — encontrar linguagem.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que teria precisado existir naquele momento para que você pudesse parar um pouco?",
      }),

      options: Object.freeze([
        option(
          "p03_consciousness_q02_o01",
          "recognition",
          "Eu precisei continuar como se nada pudesse parar.",
          "Você reconhece que a continuidade foi uma exigência do momento, não necessariamente uma escolha.",
          "Quando não existe espaço para cair, a experiência pode permanecer suspensa mesmo depois que a rotina retorna.",
          "O que ficou sem lugar enquanto você precisava continuar?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q02_o02",
          "minimization",
          "Foi difícil, mas todo mundo passa por perdas.",
          "Você coloca sua experiência dentro de algo humano e comum.",
          "Reconhecer que perdas são universais não obriga a reduzir o impacto particular que essa teve em você.",
          "O que foi específico nessa experiência, mesmo que outras pessoas também passem por perdas?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_consciousness_q02_o03",
          "defense",
          "Parar não era uma opção e ainda não vejo utilidade nisso.",
          "Você reconhece que funcionar foi necessário e ainda protege essa forma de continuidade.",
          "O que foi necessário antes pode continuar sendo respeitado sem precisar virar a única forma possível de existir agora.",
          "Não é necessário produzir uma utilidade para essa reflexão hoje.",
          "pause",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_consciousness_q02_o04",
          "ambivalence",
          "Uma parte precisava cair; outra sabia que não podia.",
          "Você reconhece duas necessidades legítimas que entraram em conflito.",
          "Ter continuado não apaga a parte que precisava de pausa, assim como precisar de pausa não invalida o que você sustentou.",
          "Qual dessas duas partes costuma receber menos espaço hoje?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q02_o05",
          "desire",
          "Gostaria de ter tido permissão para não funcionar por algum tempo.",
          "Você reconhece uma necessidade de pausa que não encontrou autorização naquele momento.",
          "Talvez essa permissão não possa mudar o passado, mas possa modificar a forma como você se trata quando algo ainda pesa.",
          "Que pequena permissão seria possível oferecer a si agora?",
          "question",
          {
            presence: 1,
            agency: 1,
          },
        ),

        option(
          "p03_consciousness_q02_o06",
          "uncertainty",
          "Não sei se o que vivi conta como perda.",
          "Você ainda não sabe qual nome dar ao que aconteceu.",
          "Uma experiência não precisa receber imediatamente o nome de luto para que seu impacto possa ser observado.",
          "Você pode ficar apenas com a pergunta, sem decidir hoje o que essa experiência foi.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_consciousness_q03",
      order: 3,
      phaseOrder: 3,
      phase: "consciousness",
      canonicalSectionId:
        "p03_consciousness",
      primarySignalId:
        "p03_functional_suspension",

      prompt:
        "Onde eu continuo funcionando enquanto uma parte de mim permanece suspensa?",

      openAnswerDisplacement:
        "Funcionar e estar inteiro não são necessariamente a mesma experiência, ainda que possam coexistir.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que em você continua cumprindo tarefas enquanto outra parte ainda espera espaço?",
      }),

      options: Object.freeze([
        option(
          "p03_consciousness_q03_o01",
          "recognition",
          "Continuo resolvendo tudo, mas algo em mim parece ter ficado naquele período.",
          "Você percebe uma diferença entre o que continuou operando e o que permaneceu ligado àquele momento.",
          "Essa diferença não invalida sua capacidade; apenas mostra que funcionar não encerrou automaticamente a experiência.",
          "Em que situação essa parte suspensa costuma reaparecer?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_consciousness_q03_o02",
          "minimization",
          "Minha rotina voltou; isso deveria ser suficiente.",
          "Você usa o retorno da rotina como referência de continuidade.",
          "A rotina pode mostrar que a vida prosseguiu sem provar que tudo dentro de você acompanhou o mesmo ritmo.",
          "Que sinal aparece quando a rotina parece normal, mas você não se sente completamente presente?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_consciousness_q03_o03",
          "defense",
          "Funcionando é como eu mantenho controle.",
          "Você reconhece que agir e resolver ajudam a manter alguma estabilidade.",
          "O controle pode sustentar o cotidiano e, ao mesmo tempo, impedir que outras necessidades encontrem espaço.",
          "Não precisamos retirar esse controle agora; basta reconhecer a função que ele cumpre.",
          "pause",
          {
            avoidance: 1,
            agency: 1,
          },
        ),

        option(
          "p03_consciousness_q03_o04",
          "ambivalence",
          "Trabalhar e resolver me sustentam, mas também me afastam do que sinto.",
          "Você reconhece proteção e custo dentro do mesmo movimento.",
          "Aquilo que mantém você em pé também pode diminuir o contato com partes que não conseguem acompanhar o ritmo.",
          "Em que momento a sustentação começa a virar afastamento?",
          "question",
          {
            awareness: 1,
            avoidance: 1,
          },
        ),

        option(
          "p03_consciousness_q03_o05",
          "desire",
          "Gostaria de parar sem sentir que tudo vai desabar.",
          "Você deseja uma pausa que não seja vivida como perda de controle.",
          "Talvez o primeiro movimento não seja uma grande interrupção, mas uma experiência pequena em que parar não produza abandono.",
          "Qual pausa curta pareceria suportável hoje?",
          "question",
          {
            presence: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_consciousness_q03_o06",
          "uncertainty",
          "Só percebo cansaço; não sei se tem relação.",
          "Você reconhece o cansaço, mas ainda não sabe o que ele comunica.",
          "Não é necessário atribuir uma causa agora; o cansaço pode ser observado sem virar prova sobre a sua história.",
          "Por enquanto, fique apenas com o que é certo: existe cansaço.",
          "pause",
          {
            load: 1,
          },
        ),
      ]),
    }),
  ]);
