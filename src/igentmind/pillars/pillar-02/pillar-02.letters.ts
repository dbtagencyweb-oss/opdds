// src/igentmind/pillars/pillar-02/pillar-02.letters.ts

import type {
  PillarLetter,
} from "../template";

import {
  createPillar02Letter,
} from "./pillar-02.resource-builders";

export const PILLAR_02_CONSCIOUSNESS_LETTER =
  createPillar02Letter({
    phase: "consciousness",

    title:
      "À parte de mim que aprendeu a manter tudo em ordem",

    prompt:
      "Escreva para a parte de você que aprendeu a perceber o clima, evitar conflitos, antecipar necessidades e sustentar o que parecia prestes a se desorganizar. Reconheça o que ela tentou proteger. Depois, diga o que ela não precisa continuar carregando sozinha. Esta carta é privada e não deve ser enviada.",
  });

export const PILLAR_02_JUDGMENT_LETTER =
  createPillar02Letter({
    phase: "judgment",

    title:
      "À culpa que chama diferença de deslealdade",

    prompt:
      "Escreva para a culpa que aparece quando você pensa em discordar, descansar, recusar ou escolher outro caminho. Pergunte o que ela teme que você perca. Depois, diferencie amor, gratidão e responsabilidade da obrigação de se abandonar. Esta carta é privada e não deve ser enviada.",
  });

export const PILLAR_02_PRESENCE_LETTER =
  createPillar02Letter({
    phase: "presence",

    title:
      "À família que vive em mim e à pessoa que continuo me tornando",

    prompt:
      "Escreva sem absolver nem condenar. Reconheça o que recebeu, o que faltou, o que ainda pesa e o que deseja preservar. Em seguida, registre como você pretende continuar pertencendo à própria história sem entregar a ela todas as decisões futuras. Esta carta é privada e não deve ser enviada.",
  });

export const PILLAR_02_LETTERS:
  readonly PillarLetter[] = [
    PILLAR_02_CONSCIOUSNESS_LETTER,
    PILLAR_02_JUDGMENT_LETTER,
    PILLAR_02_PRESENCE_LETTER,
  ] as const;

export const PILLAR_02_LETTER_INDEX =
  new Map(
    PILLAR_02_LETTERS.map(
      (letter) => [
        letter.id,
        letter,
      ],
    ),
  );
