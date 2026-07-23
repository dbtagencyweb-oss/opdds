import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  type Block26ValidationIssue,
  type Block26ValidationReport,
  type Pillar02PackageCounts,
} from "./pillar-02.block26.contracts";

import {
  createPillar02Closure,
  PILLAR_02_CLOSURE,
} from "./pillar-02.closure";

import {
  canCreatePillar02MemoryCandidateFrom,
  confirmPillar02MemoryCandidate,
  createEmptyPillar02MemoryStore,
  createPillar02MemoryCandidate,
  createPillar02MemoryTelemetry,
  savePillar02ConfirmedMemory,
} from "./pillar-02.memory";

import {
  PILLAR_02_IMMEDIATE_CONTINUATION,
  resolveInterludeFendaExit,
} from "./pillar-02.continuation";

import { PILLAR_02_TRANSITIONS } from "./pillar-02.transitions";

import {
  PILLAR_02_PACKAGE_INPUT,
  PILLAR_02_RESOURCE_INDEXES,
} from "./pillar-02.package";

import {
  createPillar02PublicationChecksum,
  getPillar02PackageCounts,
} from "./pillar-02.publication";

const EXPECTED_COUNTS: Pillar02PackageCounts = Object.freeze({
  canonicalSections: 10,
  signals: 9,
  questions: 9,
  options: 54,
  microReturns: 18,
  journals: 6,
  letters: 3,
  anchors: 3,
  predictiveRules: 9,
  transitions: 6,
});

const EXPECTED_TRANSITION_ORDER = Object.freeze([
  ["book", "consciousness", "automatic_invite"],
  ["consciousness", "judgment", "phase_complete"],
  ["judgment", "presence", "phase_complete"],
  ["presence", "closure", "phase_complete"],
  ["closure", "interlude", "pillar_complete"],
  ["pause", "book", "resume_requested"],
] as const);

const RESOURCE_REFERENCE_KEYS = new Set([
  "resourceId",
  "contentId",
  "nextContentId",
  "microReturnId",
  "journalId",
  "letterId",
  "anchorId",
  "questionId",
  "signalId",
]);

function createIssue(
  code: string,
  message: string,
  path?: string,
): Block26ValidationIssue {
  return Object.freeze({
    code,
    severity: "error",
    message,
    path,
  });
}

function getIdentityId(identity: unknown): unknown {
  if (typeof identity !== "object" || identity === null) {
    return undefined;
  }

  const record = identity as Record<string, unknown>;
  return record.id ?? record.pillarId;
}

function collectReferencedResourceIds(
  value: unknown,
  output: Set<string>,
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectReferencedResourceIds(item, output);
    }

    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, child] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (
      RESOURCE_REFERENCE_KEYS.has(key) &&
      typeof child === "string" &&
      child.startsWith("p02_")
    ) {
      output.add(child);
    }

    collectReferencedResourceIds(child, output);
  }
}

function knownResourceIds(): Set<string> {
  return new Set([
    ...PILLAR_02_RESOURCE_INDEXES.canonicalSections.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.signals.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.questions.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.microReturns.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.journals.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.letters.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.anchors.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.predictiveRules.keys(),
    ...PILLAR_02_RESOURCE_INDEXES.transitions.keys(),
    PILLAR_02_CLOSURE.companionContent.id,
  ]);
}

function validateCounts(errors: Block26ValidationIssue[]): void {
  const actual = getPillar02PackageCounts();

  for (const key of Object.keys(EXPECTED_COUNTS) as Array<
    keyof Pillar02PackageCounts
  >) {
    if (actual[key] !== EXPECTED_COUNTS[key]) {
      errors.push(
        createIssue(
          "P02_COUNT_MISMATCH",
          `Contagem inválida para ${key}: esperado ${EXPECTED_COUNTS[key]}, recebido ${actual[key]}.`,
          `counts.${key}`,
        ),
      );
    }
  }
}

function validateTransitions(errors: Block26ValidationIssue[]): void {
  if (PILLAR_02_TRANSITIONS.length !== 6) {
    errors.push(
      createIssue(
        "P02_TRANSITION_COUNT",
        "O Pilar II deve possuir exatamente seis transições.",
        "transitions",
      ),
    );

    return;
  }

  PILLAR_02_TRANSITIONS.forEach((transition, index) => {
    const expected = EXPECTED_TRANSITION_ORDER[index];

    if (
      transition.from !== expected[0] ||
      transition.to !== expected[1] ||
      transition.trigger !== expected[2]
    ) {
      errors.push(
        createIssue(
          "P02_TRANSITION_ORDER",
          `A transição ${transition.id} está fora da ordem ou direção oficial.`,
          `transitions.${index}`,
        ),
      );
    }

    if (!transition.optional || transition.blocking) {
      errors.push(
        createIssue(
          "P02_TRANSITION_BLOCKING",
          `A transição ${transition.id} deve ser opcional e não bloqueante.`,
          `transitions.${index}`,
        ),
      );
    }
  });

  const continuationTransition = PILLAR_02_TRANSITIONS[4];

  if (
    continuationTransition.target?.kind !== "interlude" ||
    continuationTransition.target.experienceId !== INTERLUDE_FENDA_ID ||
    continuationTransition.target.nextPillarId !== PILLAR_03_ID
  ) {
    errors.push(
      createIssue(
        "P02_INVALID_INTERLUDE_CONTINUATION",
        "O fechamento deve continuar primeiro para interlude_fenda.",
        "transitions.4.target",
      ),
    );
  }

  const bypass = PILLAR_02_TRANSITIONS.some(
    (transition) =>
      transition.from === "closure" &&
      transition.target?.kind === "pillar" &&
      transition.target.pillarId === PILLAR_03_ID,
  );

  if (bypass) {
    errors.push(
      createIssue(
        "P02_INTERLUDE_BYPASS",
        "O Pilar II não pode avançar diretamente para o Pilar III.",
        "transitions",
      ),
    );
  }
}

function validateClosure(errors: Block26ValidationIssue[]): void {
  const expectedRoutes = [
    "canonical_support_letter",
    "canonical_anchor",
    "canonical_closing",
    "companion_closure",
    "pause",
    "return_to_book",
    "interlude_fenda",
  ];

  const actualRoutes = PILLAR_02_CLOSURE.routes.map((route) => route.id);

  if (JSON.stringify(actualRoutes) !== JSON.stringify(expectedRoutes)) {
    errors.push(
      createIssue(
        "P02_CLOSURE_ROUTES",
        "As rotas obrigatórias do fechamento não foram preservadas.",
        "closure.routes",
      ),
    );
  }

  const partial = createPillar02Closure({
    status: "partial",
    reflectionComplete: true,
    selectedRoute: "return_to_book",
  });

  if (partial.complete || partial.closureComplete) {
    errors.push(
      createIssue(
        "P02_PARTIAL_CLOSURE",
        "O fechamento parcial deve manter complete e closureComplete como false.",
        "closure.partial",
      ),
    );
  }

  const completed = createPillar02Closure({
    status: "completed",
    reflectionComplete: false,
    selectedRoute: "interlude_fenda",
    synthesis: "Síntese confirmada pelo leitor.",
  });

  if (
    !completed.complete ||
    !completed.closureComplete ||
    !completed.synthesisGenerated
  ) {
    errors.push(
      createIssue(
        "P02_COMPLETED_CLOSURE",
        "O fechamento completo com síntese possui estado inválido.",
        "closure.completed",
      ),
    );
  }

  const withoutSynthesis = createPillar02Closure({
    status: "completed_without_synthesis",
    reflectionComplete: false,
    selectedRoute: "return_to_book",
  });

  if (
    !withoutSynthesis.complete ||
    !withoutSynthesis.closureComplete ||
    withoutSynthesis.synthesisGenerated
  ) {
    errors.push(
      createIssue(
        "P02_CLOSURE_WITHOUT_SYNTHESIS",
        "O fechamento sem síntese possui estado inválido.",
        "closure.completed_without_synthesis",
      ),
    );
  }

  if (
    completed.reflectionComplete === completed.closureComplete &&
    completed.reflectionComplete === true
  ) {
    errors.push(
      createIssue(
        "P02_REFLECTION_CLOSURE_COUPLED",
        "reflectionComplete não pode ser automaticamente igualado a closureComplete.",
        "closure",
      ),
    );
  }
}

function validateMemory(errors: Block26ValidationIssue[]): void {
  if (
    canCreatePillar02MemoryCandidateFrom("closed_option") ||
    canCreatePillar02MemoryCandidateFrom("journal") ||
    canCreatePillar02MemoryCandidateFrom("letter")
  ) {
    errors.push(
      createIssue(
        "P02_PRIVATE_MEMORY_AUTOMATION",
        "Opções fechadas, diários e cartas não podem criar memória automaticamente.",
        "memory",
      ),
    );
  }

  const candidate = createPillar02MemoryCandidate({
    candidateId: "candidate_validation_01",
    kind: "personal_boundary",
    text: "Posso lembrar do meu limite antes de me explicar.",
    origin: "manual_entry",
  });

  const confirmed = confirmPillar02MemoryCandidate(
    candidate,
    "memory_validation_01",
  );

  if (
    confirmed.consent !== "confirmed" ||
    confirmed.source !== "reader_confirmed"
  ) {
    errors.push(
      createIssue(
        "P02_MEMORY_CONFIRMATION",
        "A memória consolidada exige confirmação explícita do leitor.",
        "memory.confirmed",
      ),
    );
  }

  const firstStore = savePillar02ConfirmedMemory(
    createEmptyPillar02MemoryStore(),
    confirmed,
  );

  const duplicateStore = savePillar02ConfirmedMemory(firstStore, confirmed);

  if (duplicateStore.memories.length !== 1) {
    errors.push(
      createIssue(
        "P02_MEMORY_DUPLICATE",
        "A mesma memória foi armazenada mais de uma vez.",
        "memory.store",
      ),
    );
  }

  const telemetry = createPillar02MemoryTelemetry({
    event: "memory_confirmed",
    memory: confirmed,
  });

  const serializedTelemetry = JSON.stringify(telemetry);

  if (
    serializedTelemetry.includes(confirmed.text) ||
    serializedTelemetry.includes(confirmed.normalizedFingerprint)
  ) {
    errors.push(
      createIssue(
        "P02_PRIVATE_TELEMETRY",
        "A telemetria contém conteúdo privado da memória.",
        "memory.telemetry",
      ),
    );
  }
}

function validateReferences(errors: Block26ValidationIssue[]): void {
  const references = new Set<string>();

  collectReferencedResourceIds(
    PILLAR_02_PACKAGE_INPUT.predictiveRules,
    references,
  );

  const knownIds = knownResourceIds();

  for (const reference of references) {
    if (!knownIds.has(reference)) {
      errors.push(
        createIssue(
          "P02_UNRESOLVED_RESOURCE",
          `Referência de recurso não resolvida: ${reference}.`,
          "predictiveRules",
        ),
      );
    }
  }
}

function validateLanguageAndEditorialSafety(
  errors: Block26ValidationIssue[],
): void {
  const companionText =
    PILLAR_02_CLOSURE.companionContent.text.toLocaleLowerCase("pt-BR");

  const forbiddenPatterns = [
    /\bvocê tem\b/,
    /\bsua família é\b/,
    /\bdiagnóstico\b/,
    /\bcura completa\b/,
    /\bsuperou definitivamente\b/,
    /\bdeve romper\b/,
    /\brompa com\b/,
    /\bcorte contato\b/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(companionText)) {
      errors.push(
        createIssue(
          "P02_UNSAFE_LANGUAGE",
          `O fechamento complementar contém linguagem proibida: ${pattern.source}.`,
          "closure.companionContent.text",
        ),
      );
    }
  }

  for (const route of PILLAR_02_CLOSURE.routes) {
    if (
      route.target.kind === "canonical_section" &&
      "text" in route.target
    ) {
      errors.push(
        createIssue(
          "P02_INVENTED_CANONICAL_TEXT",
          "Rotas canônicas devem referenciar seções, não recriar texto editorial.",
          `closure.routes.${route.id}`,
        ),
      );
    }
  }
}

function validateIdentityAndContinuity(
  errors: Block26ValidationIssue[],
): void {
  if (getIdentityId(PILLAR_02_PACKAGE_INPUT.identity) !== PILLAR_02_ID) {
    errors.push(
      createIssue(
        "P02_INVALID_ID",
        `O ID oficial deve ser ${PILLAR_02_ID}.`,
        "identity",
      ),
    );
  }

  const serialized = JSON.stringify(PILLAR_02_PACKAGE_INPUT);

  if (serialized.includes("pillar_01_vinculo")) {
    errors.push(
      createIssue(
        "P02_LEGACY_ID",
        "O ID legado pillar_01_vinculo não pode aparecer no pacote.",
        "package",
      ),
    );
  }

  if (
    PILLAR_02_IMMEDIATE_CONTINUATION.kind !== "interlude" ||
    PILLAR_02_IMMEDIATE_CONTINUATION.experienceId !== INTERLUDE_FENDA_ID
  ) {
    errors.push(
      createIssue(
        "P02_CONTINUATION_KIND",
        "A continuidade imediata deve ser uma experiência intermediária.",
        "continuation",
      ),
    );
  }

  if ("pillarId" in PILLAR_02_IMMEDIATE_CONTINUATION) {
    errors.push(
      createIssue(
        "P02_INTERLUDE_AS_PILLAR",
        "interlude_fenda não pode ser modelado como PillarId.",
        "continuation",
      ),
    );
  }

  const interludeExit = resolveInterludeFendaExit();

  if (
    interludeExit.kind !== "pillar" ||
    interludeExit.pillarId !== PILLAR_03_ID
  ) {
    errors.push(
      createIssue(
        "P02_INTERLUDE_EXIT",
        "O Interlúdio Fenda deve apontar posteriormente para pillar_03_luto.",
        "continuation.interludeExit",
      ),
    );
  }
}

function validateChecksum(errors: Block26ValidationIssue[]): void {
  const first = createPillar02PublicationChecksum();
  const second = createPillar02PublicationChecksum();

  if (first !== second || first.length === 0) {
    errors.push(
      createIssue(
        "P02_UNSTABLE_CHECKSUM",
        "O checksum de publicação não é estável.",
        "publication.checksum",
      ),
    );
  }
}

export function validatePillar02Block26(): Block26ValidationReport {
  const errors: Block26ValidationIssue[] = [];
  const warnings: Block26ValidationIssue[] = [];

  validateIdentityAndContinuity(errors);
  validateCounts(errors);
  validateTransitions(errors);
  validateClosure(errors);
  validateMemory(errors);
  validateReferences(errors);
  validateLanguageAndEditorialSafety(errors);
  validateChecksum(errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}
