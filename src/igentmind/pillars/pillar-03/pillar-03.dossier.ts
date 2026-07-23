import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  PILLAR_04_ID,
  type Pillar03EditorialDossier,
} from "./pillar-03.block28.contracts";

export const PILLAR_03_DOSSIER = Object.freeze({
  pillarId: PILLAR_03_ID,
  editorialOrigin: "igent_companion",
  generationMode: "fixed",

  thesis:
    "O Pilar III ajuda o leitor a reconhecer perdas visíveis, simbólicas e relacionais que continuam operando no presente, sem exigir encerramento, explicação definitiva ou apagamento do vínculo.",

  centralDilemma:
    "Continuar funcionando como se a ausência já não tivesse efeito ou permitir que ela seja reconhecida sem transformá-la em identidade permanente.",

  centralMovement:
    "Passar da ausência suspensa ou evitada para uma presença capaz de nomear a falta, sustentar seu impacto e continuar sem apagar o que existiu.",

  whatThisPillarExplores: Object.freeze([
    "Ausências que continuam presentes mesmo depois de a rotina ter retornado.",
    "Perdas concretas, simbólicas, relacionais e mudanças de vida que não receberam ritual.",
    "Vínculos interrompidos com pessoas que continuam vivas, mas se tornaram inacessíveis.",
    "A necessidade de funcionar quando não houve espaço para parar.",
    "A influência de perdas anteriores sobre cautela, controle, afastamento e medo de novos vínculos.",
    "O luto por versões anteriores de si, futuros imaginados e formas de relação que não se realizaram.",
  ]),

  experiencesThatMayAppear: Object.freeze([
    "Saudade sem uma conclusão clara.",
    "Sensação de falta em momentos cotidianos.",
    "Dificuldade de reconhecer uma perda como legítima.",
    "Cansaço ligado à obrigação de continuar funcionando.",
    "Ambivalência entre lembrar, esperar, afastar-se e continuar.",
    "Medo de que um novo vínculo repita uma perda anterior.",
  ]),

  protectionsThatMayAppear: Object.freeze([
    "Funcionalidade excessiva para não entrar em contato com a ausência.",
    "Pressa para considerar o tema encerrado.",
    "Endurecimento emocional apresentado como força.",
    "Substituição imediata do que foi perdido.",
    "Racionalização para reduzir a importância do vínculo.",
    "Afastamento antecipado para diminuir a possibilidade de uma nova perda.",
  ]),

  presenceMovements: Object.freeze([
    "Reconhecer uma ausência sem exigir que ela desapareça.",
    "Nomear o que falta sem precisar contar toda a história.",
    "Permitir saudade, raiva, alívio, amor e frustração sem forçar coerência.",
    "Diferenciar carregar uma marca de ser governado por ela.",
    "Permanecer alguns instantes diante do vazio sem preenchê-lo automaticamente.",
    "Considerar continuidade sem transformar continuidade em esquecimento.",
  ]),

  editorialLimits: Object.freeze([
    "Não afirmar que toda tristeza representa luto.",
    "Não definir etapas universais nem uma ordem obrigatória para a experiência.",
    "Não estabelecer prazo correto para a ausência deixar de doer.",
    "Não exigir despedida, perdão, reconciliação ou encerramento.",
    "Não recomendar substituição de pessoas ou vínculos.",
    "Não afirmar que uma perda explica sozinha comportamentos atuais.",
    "Não confundir reflexão editorial com avaliação clínica.",
    "Não transformar pessoas ausentes em vilãs ou idealizações intocáveis.",
    "Não afirmar que o leitor precisa abandonar lembranças para continuar.",
    "Não usar a permanência da dor como prova de fraqueza ou incapacidade.",
  ]),

  readerFacingPrinciples: Object.freeze([
    "Uma ausência pode ser reconhecida sem ser resolvida agora.",
    "Sentimentos contraditórios podem coexistir diante da mesma perda.",
    "Continuar não exige esquecer.",
    "Nomear uma falta não obriga nenhuma decisão externa.",
    "O leitor pode pausar ou retornar ao livro em qualquer momento.",
    "Nenhuma resposta isolada define a relação do leitor com o luto.",
  ]),

  connections: Object.freeze([
    Object.freeze({
      target: INTERLUDE_FENDA_ID,
      kind: "previous",
      reason:
        "A Fenda introduz perdas relacionais, rejeições e vínculos que permanecem abertos.",
    }),
    Object.freeze({
      target: PILLAR_02_ID,
      kind: "priority",
      reason:
        "Família pode conter ausências emocionais, vínculos interrompidos e perdas sem ritual.",
    }),
    Object.freeze({
      target: PILLAR_04_ID,
      kind: "next",
      reason:
        "O trabalho pode se tornar espaço de funcionalidade contínua quando não houve lugar para parar.",
    }),
    Object.freeze({
      target: "pillar_05_dor",
      kind: "priority",
      reason:
        "A fuga e a anestesia podem funcionar como proteção diante de ausências difíceis de sustentar.",
    }),
    Object.freeze({
      target: "pillar_06_desejo",
      kind: "secondary",
      reason:
        "Perdas anteriores podem influenciar entrega, expectativa e medo de novos vínculos.",
    }),
    Object.freeze({
      target: "pillar_07_fe",
      kind: "secondary",
      reason:
        "A ausência pode tocar questões de sentido, continuidade e relação com o que não pode ser controlado.",
    }),
    Object.freeze({
      target: "pillar_09_vazio",
      kind: "secondary",
      reason:
        "É necessário distinguir a falta ligada a uma perda do vazio vivido como ausência geral de sentido.",
    }),
  ]),

  delegatesSafetyToCore: true,
  diagnosesReader: false,
  classifiesThirdParties: false,
  requiresClosure: false,
} satisfies Pillar03EditorialDossier);
