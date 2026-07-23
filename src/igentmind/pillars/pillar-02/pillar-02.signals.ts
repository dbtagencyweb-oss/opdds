// src/igentmind/pillars/pillar-02/pillar-02.signals.ts

import type {
  PillarSignalDefinition,
} from "../template";

export const PILLAR_02_SIGNALS:
  readonly PillarSignalDefinition[] = [
    {
      id: "p02_learned_role",

      label: "Papel aprendido",

      description:
        "Indica que o leitor pode estar reconhecendo uma função familiar assumida para preservar estabilidade, aprovação ou pertencimento.",

      phase: "consciousness",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_environment_vigilance",

      label: "Vigilância do ambiente",

      description:
        "Indica atenção excessiva ao humor, à reação ou ao equilíbrio emocional das outras pessoas.",

      phase: "consciousness",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_inherited_silence",

      label: "Silêncio aprendido",

      description:
        "Indica contenção automática de opinião, emoção, necessidade ou discordância para evitar desconforto relacional.",

      phase: "consciousness",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_family_guilt",

      label: "Culpa familiar",

      description:
        "Indica culpa ativada pela possibilidade de desagradar, escolher diferente, negar um pedido ou deixar de cumprir um papel esperado.",

      phase: "judgment",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_emotional_debt",

      label: "Dívida emocional",

      description:
        "Indica sensação persistente de dever disponibilidade, estabilidade, compensação ou retribuição para continuar pertencendo.",

      phase: "judgment",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_disloyalty_fear",

      label: "Medo de deslealdade",

      description:
        "Indica receio de que autonomia, discordância ou limite sejam interpretados internamente como traição, ingratidão ou abandono.",

      phase: "judgment",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_boundary_presence",

      label: "Presença diante do limite",

      description:
        "Indica capacidade inicial de perceber um limite sem convertê-lo imediatamente em justificativa, culpa ou confronto.",

      phase: "presence",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_non_erasing_belonging",

      label: "Pertencimento sem apagamento",

      description:
        "Indica abertura para reconhecer que vínculo e identidade própria podem coexistir.",

      phase: "presence",

      defaultConfidence: 0.3,
    },

    {
      id: "p02_ambivalence_capacity",

      label: "Capacidade de ambivalência",

      description:
        "Indica possibilidade de sustentar amor, gratidão, frustração, raiva e falta sem reduzir a família a uma única narrativa.",

      phase: "presence",

      defaultConfidence: 0.3,
    },
  ] as const;

export const PILLAR_02_SIGNAL_IDS =
  PILLAR_02_SIGNALS.map(
    (signal) => signal.id,
  );

export function isPillar02SignalId(
  value: string,
): boolean {
  return PILLAR_02_SIGNAL_IDS.includes(
    value,
  );
}
