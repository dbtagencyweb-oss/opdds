import type { ExperienceSignalDefinition } from "../experience.contracts";

export const INTERLUDE_FENDA_SIGNALS = Object.freeze([
  Object.freeze({
    id: "ifd_automatic_adaptation",
    phase: "consciousness",
    label: "Adaptação automática",
    description:
      "Hipótese temporária de que o leitor percebe ajustes feitos antes de reconhecer a própria vontade.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
  Object.freeze({
    id: "ifd_rejection_vigilance",
    phase: "consciousness",
    label: "Vigilância diante da rejeição",
    description:
      "Hipótese temporária de atenção elevada ao risco de desaprovação ou afastamento.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
  Object.freeze({
    id: "ifd_belonging_shame",
    phase: "judgment",
    label: "Vergonha de desejar pertencimento",
    description:
      "Hipótese temporária de julgamento sobre a necessidade humana de proximidade.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
  Object.freeze({
    id: "ifd_self_reduction",
    phase: "judgment",
    label: "Redução de si",
    description:
      "Hipótese temporária de condenação interna quando o leitor ocupa espaço ou apresenta diferença.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
  Object.freeze({
    id: "ifd_pause_before_adjustment",
    phase: "presence",
    label: "Pausa antes do ajuste",
    description:
      "Disponibilidade temporária para criar um intervalo antes de se adaptar automaticamente.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
  Object.freeze({
    id: "ifd_non_erasing_belonging",
    phase: "presence",
    label: "Pertencimento sem apagamento",
    description:
      "Disponibilidade temporária para considerar vínculos que não exijam redução da própria presença.",
    persistence: "session_only",
    initialConfidence: 0.3,
    minimumOccurrencesForPattern: 3,
    diagnostic: false,
    classifiesThirdParty: false,
  }),
] satisfies readonly ExperienceSignalDefinition[]);
