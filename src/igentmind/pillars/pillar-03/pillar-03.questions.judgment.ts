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

export const PILLAR_03_JUDGMENT_QUESTIONS =
  Object.freeze([
    createPillar03Question({
      id: "p03_judgment_q01",
      order: 4,
      phaseOrder: 1,
      phase: "judgment",
      canonicalSectionId: "p03_judgment",
      primarySignalId:
        "p03_grief_timeline_pressure",

      prompt:
        "O que eu digo a mim mesmo quando percebo que essa ausência ainda dói?",

      openAnswerDisplacement:
        "A frase usada contra você pode acrescentar uma segunda dor à ausência que já existe.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "Essa frase descreve o que você sente ou tenta obrigar você a sentir outra coisa?",
      }),

      options: Object.freeze([
        option(
          "p03_judgment_q01_o01",
          "recognition",
          "Eu digo que já deveria ter superado.",
          "Você reconhece uma cobrança baseada na ideia de que já deveria estar em outro lugar.",
          "Essa cobrança não mede apenas o tempo; ela transforma a permanência da dor em acusação contra você.",
          "De onde vem o critério usado para decidir que já deveria ter passado?",
          "question",
          {
            judgment: 1,
            awareness: 1,
          },
        ),

        option(
          "p03_judgment_q01_o02",
          "minimization",
          "Não me cobro tanto; só acho que já passou tempo demais.",
          "Você diferencia cobrança de uma avaliação aparentemente objetiva do tempo.",
          "A frase pode parecer neutra e ainda carregar uma expectativa sobre quando a ausência deveria deixar de produzir efeito.",
          "O que muda dentro de você quando pensa que o tempo permitido terminou?",
          "question",
          {
            judgment: 1,
          },
        ),

        option(
          "p03_judgment_q01_o03",
          "defense",
          "Ficar pensando nisso só alimenta a dor.",
          "Você tenta proteger-se evitando oferecer mais atenção ao que dói.",
          "Evitar repetição pode ser cuidado; o risco aparece quando qualquer contato passa a ser tratado como ameaça.",
          "Não precisamos permanecer mais tempo nisso agora.",
          "pause",
          {
            avoidance: 1,
            judgment: 1,
          },
        ),

        option(
          "p03_judgment_q01_o04",
          "ambivalence",
          "Sei que não existe prazo, mas me irrito por ainda sentir.",
          "Você compreende racionalmente que não existe prazo e, ao mesmo tempo, reage como se houvesse.",
          "Essa contradição não prova falta de compreensão; mostra que uma parte sua ainda tenta acelerar o que não controla.",
          "O que essa irritação tenta impedir que você sinta?",
          "question",
          {
            awareness: 1,
            judgment: 1,
          },
        ),

        option(
          "p03_judgment_q01_o05",
          "desire",
          "Gostaria de respeitar meu tempo sem transformar isso em estagnação.",
          "Você deseja acolher o próprio ritmo sem abandonar a continuidade.",
          "Respeitar o tempo interno e permanecer em movimento não são posições opostas.",
          "Que sinal mostraria continuidade sem exigir que a dor desapareça?",
          "question",
          {
            presence: 1,
            agency: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_judgment_q01_o06",
          "uncertainty",
          "Não sei se estou me cobrando ou apenas tentando seguir.",
          "Você ainda não distingue completamente cuidado, continuidade e cobrança.",
          "Não saber pode impedir que toda tentativa de seguir seja chamada de fuga ou que toda pausa seja chamada de atraso.",
          "Observe o tom da sua voz interna antes de tentar classificar o movimento.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_judgment_q02",
      order: 5,
      phaseOrder: 2,
      phase: "judgment",
      canonicalSectionId: "p03_judgment",
      primarySignalId:
        "p03_longing_shame",

      prompt:
        "Que vergonha aparece quando sinto saudade, falta ou ambivalência?",

      openAnswerDisplacement:
        "Sentir falta e questionar o vínculo podem coexistir sem tornar sua experiência falsa ou moralmente errada.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que você teme que essa saudade revele sobre você?",
      }),

      options: Object.freeze([
        option(
          "p03_judgment_q02_o01",
          "recognition",
          "Tenho vergonha de ainda sentir falta.",
          "Você reconhece que a saudade vem acompanhada por uma tentativa de escondê-la ou corrigi-la.",
          "A vergonha não descreve necessariamente o vínculo; ela pode descrever o julgamento aplicado ao que ainda permanece.",
          "O que você acredita que deveria sentir no lugar da saudade?",
          "question",
          {
            judgment: 1,
            load: 1,
          },
        ),

        option(
          "p03_judgment_q02_o02",
          "minimization",
          "É só nostalgia; não significa muita coisa.",
          "Você reduz a experiência a uma lembrança passageira.",
          "Chamar de nostalgia pode ser preciso, mas também pode impedir que você observe o que essa lembrança ainda movimenta.",
          "O que acontece no seu corpo quando essa nostalgia aparece?",
          "question",
          {
            avoidance: 1,
          },
        ),

        option(
          "p03_judgment_q02_o03",
          "defense",
          "Não quero parecer fraco ou preso ao passado.",
          "Você associa demonstrar a falta ao risco de ser visto como fraco ou incapaz de seguir.",
          "É possível reconhecer uma marca do passado sem entregar a ela todas as escolhas do presente.",
          "Não precisamos provar força nem aprofundar essa exposição agora.",
          "pause",
          {
            judgment: 1,
            avoidance: 1,
          },
        ),

        option(
          "p03_judgment_q02_o04",
          "ambivalence",
          "Sinto amor e raiva, e me julgo por nenhum dos dois desaparecer.",
          "Você reconhece sentimentos que permanecem juntos apesar de parecerem incompatíveis.",
          "Amor e raiva podem falar de aspectos diferentes do mesmo vínculo sem exigir que um anule o outro.",
          "Qual dos dois sentimentos você costuma tentar silenciar primeiro?",
          "question",
          {
            awareness: 1,
            judgment: 1,
            load: 1,
          },
        ),

        option(
          "p03_judgment_q02_o05",
          "desire",
          "Gostaria de admitir a saudade sem precisar justificá-la.",
          "Você deseja reconhecer a falta sem construir uma defesa para torná-la aceitável.",
          "A saudade não precisa funcionar como pedido de retorno, reconciliação ou permanência no passado.",
          "Como seria nomear essa falta sem explicar o que fará com ela?",
          "question",
          {
            presence: 1,
            agency: 1,
          },
        ),

        option(
          "p03_judgment_q02_o06",
          "uncertainty",
          "Não sei o que sinto; muda quando tento nomear.",
          "Você percebe que a experiência se desloca quando recebe palavras.",
          "A mudança não torna sua resposta menos verdadeira; pode mostrar que ainda não existe um único sentimento capaz de resumir tudo.",
          "Você pode deixar os sentimentos sem conclusão por enquanto.",
          "pause",
        ),
      ]),
    }),

    createPillar03Question({
      id: "p03_judgment_q03",
      order: 6,
      phaseOrder: 3,
      phase: "judgment",
      canonicalSectionId: "p03_judgment",
      primarySignalId:
        "p03_strength_obligation",

      prompt:
        "O que acredito que aconteceria se eu deixasse de parecer forte diante dessa perda?",

      openAnswerDisplacement:
        "A força que sustentou você pode ter sido necessária sem precisar continuar como obrigação permanente.",

      openAnswerNextMove: Object.freeze({
        interventionType: "question",
        text:
          "O que a sua força ainda acredita que precisa impedir?",
      }),

      options: Object.freeze([
        option(
          "p03_judgment_q03_o01",
          "recognition",
          "Acho que, se eu parar, não volto a funcionar.",
          "Você associa a pausa ao risco de perder definitivamente a capacidade de continuar.",
          "Esse medo pode manter o movimento, mas também transforma qualquer descanso em ameaça.",
          "Qual seria a menor pausa que não parecesse abandono completo?",
          "question",
          {
            judgment: 1,
            load: 1,
          },
        ),

        option(
          "p03_judgment_q03_o02",
          "minimization",
          "Não é força; só tenho responsabilidades.",
          "Você descreve sua continuidade como resposta prática às responsabilidades.",
          "As responsabilidades podem ser reais sem eliminar o custo de sustentá-las quando algo ainda pesa.",
          "Em qual momento responsabilidade e autoexigência começam a se confundir?",
          "question",
          {
            judgment: 1,
          },
        ),

        option(
          "p03_judgment_q03_o03",
          "defense",
          "Alguém precisava segurar tudo, então eu segurei.",
          "Você reconhece uma função que precisou assumir para manter o que estava ao redor.",
          "Ter ocupado essa função não significa que você precise continuar nela em todos os momentos.",
          "Não precisamos retirar essa função agora; basta perceber que ela existe.",
          "pause",
          {
            agency: 1,
            avoidance: 1,
            load: 1,
          },
        ),

        option(
          "p03_judgment_q03_o04",
          "ambivalence",
          "Tenho orgulho de ter sustentado, mas estou cansado de continuar assim.",
          "Você reconhece mérito e exaustão dentro da mesma forma de força.",
          "Respeitar o que você sustentou não obriga a transformar o mesmo esforço em destino permanente.",
          "O que você gostaria de preservar dessa força e o que gostaria de deixar descansar?",
          "question",
          {
            awareness: 1,
            load: 1,
          },
        ),

        option(
          "p03_judgment_q03_o05",
          "desire",
          "Gostaria de não precisar provar que estou bem.",
          "Você deseja existir sem apresentar estabilidade como prova constante.",
          "Não provar que está bem não significa precisar expor tudo; pode significar apenas interromper a obrigação de parecer invulnerável.",
          "Em qual espaço você poderia reduzir essa performance sem se sentir totalmente exposto?",
          "question",
          {
            presence: 1,
            agency: 1,
            readiness: 1,
          },
        ),

        option(
          "p03_judgment_q03_o06",
          "uncertainty",
          "Não sei quem eu seria se não estivesse controlando tudo.",
          "Você percebe que o controle pode ter se aproximado da sua identidade.",
          "Não saber quem aparece sem essa função não exige que você a abandone imediatamente.",
          "Por enquanto, basta reconhecer que existe algo além da função, mesmo sem nome.",
          "pause",
        ),
      ]),
    }),
  ]);
