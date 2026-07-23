import {
  PILLAR_02_ID,
  type CreatePillar02ClosureInput,
  type Pillar02ClosureDefinition,
  type Pillar02ClosureResult,
  type Pillar02ClosureRoute,
  type Pillar02ClosureRouteId,
} from "./pillar-02.block26.contracts";
import { PILLAR_02_IMMEDIATE_CONTINUATION } from "./pillar-02.continuation";

const PILLAR_02_CLOSURE_ROUTES = Object.freeze([
  Object.freeze({
    id: "canonical_support_letter",
    label: "Acessar a carta de sustentação do livro",
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
    label: "Acessar a âncora prática do livro",
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
    label: "Retomar o fecho canônico do Pilar II",
    optional: true,
    blocking: false,
    readerChoiceRequired: true,
    target: Object.freeze({
      kind: "canonical_section",
      sectionKind: "closing",
    }),
  }),
  Object.freeze({
    id: "companion_closure",
    label: "Encerrar esta reflexão sem exigir uma conclusão",
    optional: true,
    blocking: false,
    readerChoiceRequired: true,
    target: Object.freeze({
      kind: "companion_content",
      contentId: "p02_companion_closure_01",
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
    id: "interlude_fenda",
    label: "Seguir para o Interlúdio Fenda",
    optional: true,
    blocking: false,
    readerChoiceRequired: true,
    target: PILLAR_02_IMMEDIATE_CONTINUATION,
  }),
] satisfies readonly Pillar02ClosureRoute[]);

export const PILLAR_02_CLOSURE = Object.freeze({
  id: "p02_closure",
  pillarId: PILLAR_02_ID,
  synthesisOptional: true,
  allowPartialClosure: true,
  requireAllQuestionsAnswered: false,
  emotionallyResolvedClaim: false,
  blocksReading: false,
  routes: PILLAR_02_CLOSURE_ROUTES,
  companionContent: Object.freeze({
    id: "p02_companion_closure_01",
    editorialOrigin: "igent_companion",
    generationMode: "fixed",
    text:
      "Você pode encerrar esta passagem sem resolver o tema. O que apareceu pode permanecer apenas como algo percebido, sem se transformar agora em decisão, explicação ou confronto.",
  }),
} satisfies Pillar02ClosureDefinition);

export function getPillar02ClosureRoute(
  routeId: Pillar02ClosureRouteId,
): Pillar02ClosureRoute {
  const route = PILLAR_02_CLOSURE.routes.find(
    (candidate) => candidate.id === routeId,
  );

  if (!route) {
    throw new Error(`Rota de fechamento desconhecida: ${routeId}.`);
  }

  return route;
}

export function createPillar02Closure(
  input: CreatePillar02ClosureInput,
): Pillar02ClosureResult {
  const selectedRoute = getPillar02ClosureRoute(input.selectedRoute);

  if (input.status === "completed") {
    const synthesis = input.synthesis?.trim();

    if (!synthesis) {
      throw new Error(
        'O status "completed" exige uma síntese explicitamente fornecida.',
      );
    }

    return Object.freeze({
      pillarId: PILLAR_02_ID,
      status: input.status,
      reflectionComplete: input.reflectionComplete,
      closureComplete: true,
      complete: true,
      synthesisGenerated: true,
      synthesis,
      selectedRoute,
      blocksReading: false,
    });
  }

  if (input.status === "completed_without_synthesis") {
    return Object.freeze({
      pillarId: PILLAR_02_ID,
      status: input.status,
      reflectionComplete: input.reflectionComplete,
      closureComplete: true,
      complete: true,
      synthesisGenerated: false,
      selectedRoute,
      blocksReading: false,
    });
  }

  return Object.freeze({
    pillarId: PILLAR_02_ID,
    status: "partial",
    reflectionComplete: input.reflectionComplete,
    closureComplete: false,
    complete: false,
    synthesisGenerated: false,
    selectedRoute,
    blocksReading: false,
  });
}
