import {
  PILLAR_03_ID,
  type Pillar03SignalDefinition,
} from "./pillar-03.block28.contracts";

export const PILLAR_03_SIGNALS = Object.freeze([
  Object.freeze({
    id: "p03_absence_still_active",
    pillarId: PILLAR_03_ID,
    phase: "consciousness",
    label: "Ausência ainda ativa",
    description:
      "Hipótese temporária de que uma perda ou ausência continua influenciando experiências presentes.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      awareness: 1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_unritualized_loss",
    pillarId: PILLAR_03_ID,
    phase: "consciousness",
    label: "Perda sem ritual",
    description:
      "Hipótese temporária de que o leitor reconhece uma perda que não recebeu espaço, nome ou pausa.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      awareness: 1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_functional_suspension",
    pillarId: PILLAR_03_ID,
    phase: "consciousness",
    label: "Funcionamento durante a suspensão",
    description:
      "Hipótese temporária de manutenção da rotina enquanto a experiência da perda permanece pouco nomeada.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      avoidance: 1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),

  Object.freeze({
    id: "p03_grief_timeline_pressure",
    pillarId: PILLAR_03_ID,
    phase: "judgment",
    label: "Cobrança temporal",
    description:
      "Hipótese temporária de julgamento interno baseado na ideia de que a perda já deveria ter deixado de produzir efeito.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      judgment: 1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_longing_shame",
    pillarId: PILLAR_03_ID,
    phase: "judgment",
    label: "Vergonha da saudade",
    description:
      "Hipótese temporária de condenação interna por ainda sentir falta, vínculo ou ambivalência.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      judgment: 1,
      presence: -1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_strength_obligation",
    pillarId: PILLAR_03_ID,
    phase: "judgment",
    label: "Obrigação de permanecer forte",
    description:
      "Hipótese temporária de que o leitor se exige funcionalidade ou controle para não demonstrar o impacto da ausência.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      judgment: 1,
      avoidance: 1,
      load: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),

  Object.freeze({
    id: "p03_allowing_absence",
    pillarId: PILLAR_03_ID,
    phase: "presence",
    label: "Permissão para a ausência existir",
    description:
      "Disponibilidade temporária para reconhecer a falta sem preenchê-la ou explicá-la imediatamente.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      presence: 1,
      agency: 1,
      avoidance: -1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_non_replacement_capacity",
    pillarId: PILLAR_03_ID,
    phase: "presence",
    label: "Capacidade de não substituir",
    description:
      "Disponibilidade temporária para permitir que o espaço deixado por uma perda exista sem substituição automática.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      presence: 1,
      avoidance: -1,
      readiness: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
  Object.freeze({
    id: "p03_integration_without_erasure",
    pillarId: PILLAR_03_ID,
    phase: "presence",
    label: "Integração sem apagamento",
    description:
      "Disponibilidade temporária para carregar uma marca sem exigir que ela desapareça ou governe toda a experiência.",
    initialConfidence: "low",
    initialConfidenceValue: 0.3,
    minimumOccurrencesForPattern: 3,
    isolatedClosedOptionCreatesPattern: false,
    scaleEffects: Object.freeze({
      awareness: 1,
      presence: 1,
      agency: 1,
    }),
    diagnostic: false,
    permanentTrait: false,
    classifiesThirdParty: false,
    sourceType: "temporary_narrative_hypothesis",
  }),
] satisfies readonly Pillar03SignalDefinition[]);

export const PILLAR_03_SIGNAL_INDEX: ReadonlyMap<
  string,
  Pillar03SignalDefinition
> = new Map(
  PILLAR_03_SIGNALS.map((signal) => [
    signal.id,
    signal,
  ]),
);
