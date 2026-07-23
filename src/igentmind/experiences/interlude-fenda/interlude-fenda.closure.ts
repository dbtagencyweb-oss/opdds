import type {
  ExperienceClosureDefinition,
  ExperienceClosureRoute,
} from "../experience.contracts";

import {
  INTERLUDE_FENDA_EXIT_TARGET,
  INTERLUDE_FENDA_ID,
  type InterludeFendaClosureInput,
  type InterludeFendaClosureResult,
} from "./interlude-fenda.contracts";

export const INTERLUDE_FENDA_CLOSURE_ROUTES =
  Object.freeze([
    Object.freeze({
      id: "canonical_support_letter",
      label: "Acessar a carta de sustentação",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: Object.freeze({
        kind: "canonical_section",
        sectionKind: "support_letter",
      }),
    }),
    Object.freeze({
      id: "canonical_anchor",
      label: "Acessar o exercício do espaço próprio",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: Object.freeze({
        kind: "canonical_section",
        sectionKind: "anchor",
      }),
    }),
    Object.freeze({
      id: "canonical_closing",
      label: "Retomar o fecho do Interlúdio",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: Object.freeze({
        kind: "canonical_section",
        sectionKind: "closing",
      }),
    }),
    Object.freeze({
      id: "pause",
      label: "Pausar por agora",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: Object.freeze({
        kind: "reader_surface",
        surface: "pause",
      }),
    }),
    Object.freeze({
      id: "return_to_book",
      label: "Voltar ao livro",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: Object.freeze({
        kind: "reader_surface",
        surface: "book",
      }),
    }),
    Object.freeze({
      id: "continue_to_pillar_03",
      label: "Seguir para o Pilar III — Luto",
      optional: true,
      blocking: false,
      readerChoiceRequired: true,
      target: INTERLUDE_FENDA_EXIT_TARGET,
    }),
  ] satisfies readonly ExperienceClosureRoute[]);

export const INTERLUDE_FENDA_CLOSURE = Object.freeze({
  id: "ifd_closure_definition",
  synthesisRequired: false,
  reflectionRequired: false,
  emotionallyResolvedClaim: false,
  blocksReading: false,
  routes: INTERLUDE_FENDA_CLOSURE_ROUTES,
} satisfies ExperienceClosureDefinition);

export function createInterludeFendaClosure(
  input: InterludeFendaClosureInput,
): InterludeFendaClosureResult {
  const routeExists = INTERLUDE_FENDA_CLOSURE.routes.some(
    (route) => route.id === input.selectedRoute,
  );

  if (!routeExists) {
    throw new Error(
      `Rota de fechamento inválida: ${input.selectedRoute}.`,
    );
  }

  if (input.status === "completed") {
    return Object.freeze({
      experienceId: INTERLUDE_FENDA_ID,
      status: input.status,
      reflectionComplete: true,
      closureComplete: true,
      complete: true,
      synthesisGenerated: false,
      selectedRoute: input.selectedRoute,
      blocksReading: false,
    });
  }

  if (input.status === "completed_without_reflection") {
    return Object.freeze({
      experienceId: INTERLUDE_FENDA_ID,
      status: input.status,
      reflectionComplete: false,
      closureComplete: true,
      complete: true,
      synthesisGenerated: false,
      selectedRoute: input.selectedRoute,
      blocksReading: false,
    });
  }

  return Object.freeze({
    experienceId: INTERLUDE_FENDA_ID,
    status: "visited",
    reflectionComplete: false,
    closureComplete: false,
    complete: false,
    synthesisGenerated: false,
    selectedRoute: input.selectedRoute,
    blocksReading: false,
  });
}
