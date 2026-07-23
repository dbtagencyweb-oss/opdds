// src/igentmind/pillars/pillar-02/pillar-02.anchors.ts

import type {
  PillarAnchor,
} from "../template";

import {
  createPillar02Anchor,
} from "./pillar-02.resource-builders";

export const PILLAR_02_CONSCIOUSNESS_ANCHOR =
  createPillar02Anchor({
    phase: "consciousness",

    title:
      "Perceber o papel antes de cumpri-lo",

    introduction:
      "Uma pausa breve para reconhecer quando uma função familiar começa a assumir o controle. Você pode interromper a qualquer momento.",

    steps: [
      "Pare por alguns instantes e observe se sua atenção está em você ou no estado emocional de todos ao redor.",

      "Nomeie silenciosamente o papel que parece estar surgindo: resolver, mediar, acalmar, concordar, esconder ou sustentar.",

      "Pergunte: “Isso é uma escolha atual ou um movimento que começou sozinho?”",

      "Antes de agir, permita um pequeno intervalo em que você não precisa cumprir o papel nem rejeitá-lo.",
    ],
  });

export const PILLAR_02_JUDGMENT_ANCHOR =
  createPillar02Anchor({
    phase: "judgment",

    title:
      "Separar culpa de responsabilidade",

    introduction:
      "Uma pausa para diferenciar o que precisa ser reparado do que apenas contraria um roteiro antigo. A conclusão não é obrigatória.",

    steps: [
      "Nomeie a culpa sem transformá-la imediatamente em prova: “Estou sentindo culpa.”",

      "Pergunte se houve dano concreto, compromisso assumido ou responsabilidade real que precise ser considerada.",

      "Depois, observe qual acusação moral apareceu: egoísmo, ingratidão, abandono, fracasso ou deslealdade.",

      "Mantenha separadas as duas coisas: aquilo pelo qual você realmente responde e aquilo que a culpa tenta fazer você carregar.",
    ],
  });

export const PILLAR_02_PRESENCE_ANCHOR =
  createPillar02Anchor({
    phase: "presence",

    title:
      "Ficar comigo sem transformar ninguém em inimigo",

    introduction:
      "Uma pausa para sustentar limite, vínculo e ambivalência sem precisar escolher imediatamente entre submissão e rompimento.",

    steps: [
      "Reconheça o que existe em você agora: necessidade, limite, afeto, raiva, cansaço, medo ou dúvida.",

      "Permita que mais de uma verdade permaneça presente sem resolver a contradição.",

      "Diga silenciosamente: “Meu limite não precisa apagar o vínculo, e o vínculo não precisa apagar meu limite.”",

      "Escolha apenas o próximo gesto possível: continuar, pausar, responder depois ou voltar à leitura.",
    ],
  });

export const PILLAR_02_ANCHORS:
  readonly PillarAnchor[] = [
    PILLAR_02_CONSCIOUSNESS_ANCHOR,
    PILLAR_02_JUDGMENT_ANCHOR,
    PILLAR_02_PRESENCE_ANCHOR,
  ] as const;

export const PILLAR_02_ANCHOR_INDEX =
  new Map(
    PILLAR_02_ANCHORS.map(
      (anchor) => [
        anchor.id,
        anchor,
      ],
    ),
  );
