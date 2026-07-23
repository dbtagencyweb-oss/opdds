// src/igentmind/pillars/pillar-02/pillar-02.micro-returns.ts

import type {
  PillarMicroReturn,
} from "../template";

import {
  createPillar02MicroReturn,
} from "./pillar-02.resource-builders";

export const PILLAR_02_CONSCIOUSNESS_MICRO_RETURNS:
  readonly PillarMicroReturn[] = [
    createPillar02MicroReturn({
      phase: "consciousness",
      order: 1,
      function: "recognition",

      triggerSignalIds: [
        "p02_learned_role",
      ],

      text:
        "Talvez você não esteja escolhendo esse papel agora. Talvez apenas tenha percebido que ele começa antes da escolha.",
    }),

    createPillar02MicroReturn({
      phase: "consciousness",
      order: 2,
      function: "contradiction",

      triggerSignalIds: [
        "p02_learned_role",
        "p02_non_erasing_belonging",
      ],

      text:
        "Você pode reconhecer o que aprendeu dentro da família sem negar o amor, o cuidado ou a importância do vínculo.",
    }),

    createPillar02MicroReturn({
      phase: "consciousness",
      order: 3,
      function: "protection",

      triggerSignalIds: [
        "p02_environment_vigilance",
      ],

      text:
        "Observar o ambiente antes de agir pode ter sido uma forma de proteção. Perceber isso não exige continuar em alerta.",
    }),

    createPillar02MicroReturn({
      phase: "consciousness",
      order: 4,
      function: "cost",

      triggerSignalIds: [
        "p02_environment_vigilance",
        "p02_learned_role",
      ],

      text:
        "Quando sua atenção fica ocupada em manter todos bem, sobra pouco espaço para perceber como você está.",
    }),

    createPillar02MicroReturn({
      phase: "consciousness",
      order: 5,
      function: "permission",

      triggerSignalIds: [
        "p02_inherited_silence",
      ],

      text:
        "Você não precisa falar agora. Basta perceber onde o silêncio deixou de ser escolha e começou a acontecer sozinho.",
    }),

    createPillar02MicroReturn({
      phase: "consciousness",
      order: 6,
      function: "presence",

      triggerSignalIds: [
        "p02_learned_role",
        "p02_environment_vigilance",
        "p02_inherited_silence",
      ],

      text:
        "Antes de ajustar sua presença ao ambiente, note por um instante o que estava acontecendo dentro de você.",
    }),
  ] as const;

export const PILLAR_02_JUDGMENT_MICRO_RETURNS:
  readonly PillarMicroReturn[] = [
    createPillar02MicroReturn({
      phase: "judgment",
      order: 1,
      function: "recognition",

      triggerSignalIds: [
        "p02_family_guilt",
      ],

      text:
        "A culpa apareceu. Isso ainda não prova que sua escolha seja errada.",
    }),

    createPillar02MicroReturn({
      phase: "judgment",
      order: 2,
      function: "contradiction",

      triggerSignalIds: [
        "p02_emotional_debt",
      ],

      text:
        "Você pode ser grato pelo que recebeu e ainda reconhecer que sua vida não precisa funcionar como pagamento.",
    }),

    createPillar02MicroReturn({
      phase: "judgment",
      order: 3,
      function: "protection",

      triggerSignalIds: [
        "p02_disloyalty_fear",
      ],

      text:
        "O medo de deslealdade tenta proteger seu lugar no vínculo. Ele não precisa definir sozinho o que é lealdade.",
    }),

    createPillar02MicroReturn({
      phase: "judgment",
      order: 4,
      function: "cost",

      triggerSignalIds: [
        "p02_family_guilt",
        "p02_emotional_debt",
      ],

      text:
        "Quando toda diferença vira dívida ou culpa, sua escolha começa já ocupando o lugar de acusada.",
    }),

    createPillar02MicroReturn({
      phase: "judgment",
      order: 5,
      function: "permission",

      triggerSignalIds: [
        "p02_disloyalty_fear",
        "p02_family_guilt",
      ],

      text:
        "Você pode examinar uma escolha sem decidir imediatamente se ela faz de você uma pessoa boa ou ruim.",
    }),

    createPillar02MicroReturn({
      phase: "judgment",
      order: 6,
      function: "presence",

      triggerSignalIds: [
        "p02_family_guilt",
        "p02_emotional_debt",
        "p02_disloyalty_fear",
      ],

      text:
        "Por um instante, separe três coisas: o que aconteceu, o que você sente e a condenação que surgiu depois.",
    }),
  ] as const;

export const PILLAR_02_PRESENCE_MICRO_RETURNS:
  readonly PillarMicroReturn[] = [
    createPillar02MicroReturn({
      phase: "presence",
      order: 1,
      function: "recognition",

      triggerSignalIds: [
        "p02_boundary_presence",
      ],

      text:
        "Reconhecer um limite dentro de você não obriga uma ação imediata contra ninguém.",
    }),

    createPillar02MicroReturn({
      phase: "presence",
      order: 2,
      function: "contradiction",

      triggerSignalIds: [
        "p02_ambivalence_capacity",
      ],

      text:
        "Você pode amar alguém e ainda sentir falta, raiva, cansaço ou necessidade de espaço.",
    }),

    createPillar02MicroReturn({
      phase: "presence",
      order: 3,
      function: "protection",

      triggerSignalIds: [
        "p02_non_erasing_belonging",
      ],

      text:
        "Talvez se adaptar tenha protegido seu pertencimento. Agora você pode observar se ainda precisa desaparecer para permanecer.",
    }),

    createPillar02MicroReturn({
      phase: "presence",
      order: 4,
      function: "cost",

      triggerSignalIds: [
        "p02_boundary_presence",
        "p02_environment_vigilance",
      ],

      text:
        "Voltar automaticamente ao papel de quem sustenta tudo evita tensão, mas também interrompe seu contato consigo.",
    }),

    createPillar02MicroReturn({
      phase: "presence",
      order: 5,
      function: "permission",

      triggerSignalIds: [
        "p02_non_erasing_belonging",
        "p02_boundary_presence",
      ],

      text:
        "Você pode pertencer sem estar disponível o tempo inteiro e sem explicar toda ausência como se fosse uma falha.",
    }),

    createPillar02MicroReturn({
      phase: "presence",
      order: 6,
      function: "presence",

      triggerSignalIds: [
        "p02_boundary_presence",
        "p02_non_erasing_belonging",
        "p02_ambivalence_capacity",
      ],

      text:
        "Permaneça alguns instantes onde duas verdades coexistem: o vínculo importa e você também.",
    }),
  ] as const;

export const PILLAR_02_MICRO_RETURNS:
  readonly PillarMicroReturn[] = [
    ...PILLAR_02_CONSCIOUSNESS_MICRO_RETURNS,
    ...PILLAR_02_JUDGMENT_MICRO_RETURNS,
    ...PILLAR_02_PRESENCE_MICRO_RETURNS,
  ] as const;

export const PILLAR_02_MICRO_RETURN_INDEX =
  new Map(
    PILLAR_02_MICRO_RETURNS.map(
      (item) => [
        item.id,
        item,
      ],
    ),
  );
