// src/igentmind/pillars/pillar-02/pillar-02.journals.ts

import type {
  PillarJournal,
} from "../template";

import {
  createPillar02Journal,
} from "./pillar-02.resource-builders";

export const PILLAR_02_CONSCIOUSNESS_JOURNALS:
  readonly PillarJournal[] = [
    createPillar02Journal({
      phase: "consciousness",
      order: 1,

      title:
        "O papel que aparece antes de mim",

      prompt:
        "Descreva uma situação recente em que você percebeu que começou a agir como mediador, responsável, pessoa forte, pessoa silenciosa ou quem precisa manter tudo em ordem. Registre o que aconteceu, o que você fez automaticamente e o que talvez tivesse escolhido se não precisasse cumprir esse papel.",
    }),

    createPillar02Journal({
      phase: "consciousness",
      order: 2,

      title:
        "O clima que eu tento sustentar",

      prompt:
        "Observe um ambiente familiar ou relacional em que você costuma monitorar o humor das pessoas. Escreva quais sinais você procura, o que tenta evitar e quanto de sua atenção fica disponível para perceber suas próprias necessidades.",
    }),
  ] as const;

export const PILLAR_02_JUDGMENT_JOURNALS:
  readonly PillarJournal[] = [
    createPillar02Journal({
      phase: "judgment",
      order: 1,

      title:
        "A frase que transforma diferença em culpa",

      prompt:
        "Complete a frase: “Quando escolho algo diferente da minha família, uma voz dentro de mim diz que eu sou...”. Depois, registre o que essa voz tenta impedir e se existe alguma diferença entre responsabilidade real e condenação automática.",
    }),

    createPillar02Journal({
      phase: "judgment",
      order: 2,

      title:
        "A dívida sem valor e sem fim",

      prompt:
        "Escreva o que você sente que precisa oferecer, compensar ou provar para continuar pertencendo. Depois, observe se essa dívida possui um limite claro ou se muda de forma sempre que você tenta considerá-la paga.",
    }),
  ] as const;

export const PILLAR_02_PRESENCE_JOURNALS:
  readonly PillarJournal[] = [
    createPillar02Journal({
      phase: "presence",
      order: 1,

      title:
        "Um limite sem acusação",

      prompt:
        "Escolha um limite que você reconhece em si. Descreva esse limite sem chamar ninguém de culpado e sem transformar sua necessidade em justificativa contra outra pessoa. Registre apenas o que você consegue, o que não consegue e o que ainda precisa compreender.",
    }),

    createPillar02Journal({
      phase: "presence",
      order: 2,

      title:
        "Pertencer sem desaparecer",

      prompt:
        "Imagine uma forma de participação familiar em que você continua presente, mas não assume sozinho o humor, as escolhas e as consequências de todos. Escreva o que permaneceria, o que diminuiria e o que poderia finalmente ser compartilhado.",
    }),
  ] as const;

export const PILLAR_02_JOURNALS:
  readonly PillarJournal[] = [
    ...PILLAR_02_CONSCIOUSNESS_JOURNALS,
    ...PILLAR_02_JUDGMENT_JOURNALS,
    ...PILLAR_02_PRESENCE_JOURNALS,
  ] as const;

export const PILLAR_02_JOURNAL_INDEX =
  new Map(
    PILLAR_02_JOURNALS.map(
      (journal) => [
        journal.id,
        journal,
      ],
    ),
  );
