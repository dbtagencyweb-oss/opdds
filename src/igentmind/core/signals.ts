// src/igentmind/core/signals.ts

import {
  CoreSignalId,
  SignalDefinition,
  SignalId,
  SignalObservation,
} from "./contracts";

import {
  DomainInvariantError,
} from "./invariants";

const CORE_SIGNAL_DEFINITIONS:
  readonly SignalDefinition[] = [
    {
      id: "reader_defensive",
      description:
        "O estado atual do leitor indica proteção ou retração.",
      allowedPhases: "global",
      defaultConfidence: 0.7,
    },
    {
      id: "reader_overloaded",
      description:
        "A carga atual do leitor atingiu o limite operacional.",
      allowedPhases: "global",
      defaultConfidence: 0.9,
    },
    {
      id: "reader_pause_requested",
      description:
        "O leitor pediu explicitamente uma pausa.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "closed_answer_selected",
      description:
        "Uma alternativa fechada foi selecionada.",
      allowedPhases: "global",
      defaultConfidence: 0.3,
    },
    {
      id: "open_answer_received",
      description:
        "O leitor forneceu uma resposta aberta.",
      allowedPhases: "global",
      defaultConfidence: 0.75,
    },
    {
      id: "open_answer_correction",
      description:
        "Uma resposta aberta corrigiu uma opção fechada.",
      allowedPhases: "global",
      defaultConfidence: 0.85,
    },
    {
      id: "memory_candidate_created",
      description:
        "Uma possível memória foi apresentada para confirmação.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "memory_confirmed",
      description:
        "O leitor confirmou explicitamente uma memória.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "memory_refused",
      description:
        "O leitor recusou explicitamente uma memória.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "writing_declined",
      description:
        "O leitor recusou uma proposta de escrita.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "anchor_interrupted",
      description:
        "Uma âncora foi interrompida antes da conclusão.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "content_reference_missing",
      description:
        "Uma referência editorial não pôde ser resolvida.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "safety_high_risk",
      description:
        "Um sinal de segurança exige suspensão da reflexão.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
    {
      id: "navigation_resume",
      description:
        "O leitor retornou a uma jornada anterior.",
      allowedPhases: "global",
      defaultConfidence: 1,
    },
  ];

export class SignalRegistry {
  private readonly definitions =
    new Map<SignalId, SignalDefinition>();

  constructor() {
    this.registerMany(
      CORE_SIGNAL_DEFINITIONS,
    );
  }

  register(
    definition: SignalDefinition,
  ): void {
    if (
      definition.defaultConfidence < 0 ||
      definition.defaultConfidence > 1
    ) {
      throw new DomainInvariantError(
        "INVALID_SIGNAL_CONFIDENCE",
        `Confiança inválida no sinal ${definition.id}.`,
      );
    }

    this.definitions.set(
      definition.id,
      definition,
    );
  }

  registerMany(
    definitions:
      readonly SignalDefinition[],
  ): void {
    for (const definition of definitions) {
      this.register(definition);
    }
  }

  has(id: SignalId): boolean {
    return this.definitions.has(id);
  }

  get(
    id: SignalId,
  ): SignalDefinition {
    const definition =
      this.definitions.get(id);

    if (!definition) {
      throw new DomainInvariantError(
        "UNREGISTERED_SIGNAL",
        `Sinal não registrado: ${id}`,
      );
    }

    return definition;
  }

  normalize(
    observations:
      readonly SignalObservation[],
  ): SignalObservation[] {
    const unique =
      new Map<string, SignalObservation>();

    for (const observation of observations) {
      this.get(observation.id);

      const key =
        `${observation.id}:${observation.role}`;

      const normalized: SignalObservation = {
        ...observation,
        confidence: Math.max(
          0,
          Math.min(1, observation.confidence),
        ),
      };

      const current =
        unique.get(key);

      if (
        !current ||
        normalized.confidence >
          current.confidence
      ) {
        unique.set(key, normalized);
      }
    }

    return Array.from(unique.values());
  }
}

export const signalRegistry =
  new SignalRegistry();

export function isCoreSignalId(
  value: string,
): value is CoreSignalId {
  return CORE_SIGNAL_DEFINITIONS.some(
    (definition) =>
      definition.id === value,
  );
}
