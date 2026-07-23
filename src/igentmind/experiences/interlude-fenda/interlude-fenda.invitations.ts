import type {
  ExperienceActionChoice,
  ExperienceInvitation,
} from "../experience.contracts";

const INTERLUDE_ACTION_CHOICES = Object.freeze([
  Object.freeze({
    id: "write",
    label: "Escrever com minhas palavras",
    semanticInterpretation: false,
    createsSignal: false,
    createsMemory: false,
  }),
  Object.freeze({
    id: "pause",
    label: "Pausar por agora",
    semanticInterpretation: false,
    createsSignal: false,
    createsMemory: false,
  }),
  Object.freeze({
    id: "continue",
    label: "Continuar a leitura",
    semanticInterpretation: false,
    createsSignal: false,
    createsMemory: false,
  }),
] satisfies readonly ExperienceActionChoice[]);

export const INTERLUDE_FENDA_INVITATIONS = Object.freeze([
  Object.freeze({
    id: "ifd_invitation_consciousness_01",
    phase: "consciousness",
    afterSectionId: "ifd_consciousness",
    prompt:
      "Em que tipo de vínculo eu me percebo ajustando antes mesmo de saber o que quero?",
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
    optional: true,
    blocking: false,
    openAnswerEnabled: true,
    oneQuestionPerTurn: true,
    maxVisibleMoves: 2,
    choices: INTERLUDE_ACTION_CHOICES,
    memoryPolicy: "explicit_consent_only",
    telemetryIncludesAnswer: false,
  }),
  Object.freeze({
    id: "ifd_invitation_judgment_01",
    phase: "judgment",
    afterSectionId: "ifd_judgment",
    prompt:
      "Que julgamento aparece quando eu imagino ocupar mais espaço sem pedir desculpas por isso?",
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
    optional: true,
    blocking: false,
    openAnswerEnabled: true,
    oneQuestionPerTurn: true,
    maxVisibleMoves: 2,
    choices: INTERLUDE_ACTION_CHOICES,
    memoryPolicy: "explicit_consent_only",
    telemetryIncludesAnswer: false,
  }),
  Object.freeze({
    id: "ifd_invitation_presence_01",
    phase: "presence",
    afterSectionId: "ifd_presence",
    prompt:
      "Qual pequeno gesto me permitiria permanecer mais inteiro sem transformar isso em confronto?",
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
    optional: true,
    blocking: false,
    openAnswerEnabled: true,
    oneQuestionPerTurn: true,
    maxVisibleMoves: 2,
    choices: INTERLUDE_ACTION_CHOICES,
    memoryPolicy: "explicit_consent_only",
    telemetryIncludesAnswer: false,
  }),
] satisfies readonly ExperienceInvitation[]);
