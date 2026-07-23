import { PILLAR_02_IMMEDIATE_CONTINUATION } from "../../pillars/pillar-02/pillar-02.continuation";

import {
  INTERLUDE_FENDA_EXPECTED_COUNTS,
  INTERLUDE_FENDA_ID,
  INTERLUDE_FENDA_NEXT_PILLAR_ID,
  type InterludeFendaValidationIssue,
  type InterludeFendaValidationReport,
} from "./interlude-fenda.contracts";

import { INTERLUDE_FENDA_CANONICAL_SECTIONS } from "./interlude-fenda.canonical";
import { INTERLUDE_FENDA_CLOSURE } from "./interlude-fenda.closure";
import { INTERLUDE_FENDA_IDENTITY } from "./interlude-fenda.identity";
import { INTERLUDE_FENDA_INVITATIONS } from "./interlude-fenda.invitations";
import {
  getInterludeFendaCounts,
  INTERLUDE_FENDA_PACKAGE,
} from "./interlude-fenda.package";
import { INTERLUDE_FENDA_MICRO_RETURNS } from "./interlude-fenda.resources";
import { INTERLUDE_FENDA_PREDICTIVE_RULES } from "./interlude-fenda.rules";
import { INTERLUDE_FENDA_SIGNALS } from "./interlude-fenda.signals";
import { INTERLUDE_FENDA_TRANSITIONS } from "./interlude-fenda.transitions";

function issue(
  code: string,
  message: string,
  path?: string,
): InterludeFendaValidationIssue {
  return Object.freeze({
    code,
    message,
    path,
  });
}

function validateCounts(
  errors: InterludeFendaValidationIssue[],
): void {
  const counts = getInterludeFendaCounts();

  for (const key of Object.keys(
    INTERLUDE_FENDA_EXPECTED_COUNTS,
  ) as Array<keyof typeof INTERLUDE_FENDA_EXPECTED_COUNTS>) {
    if (
      counts[key] !==
      INTERLUDE_FENDA_EXPECTED_COUNTS[key]
    ) {
      errors.push(
        issue(
          "IFD_COUNT_MISMATCH",
          `Contagem inválida em ${key}: esperado ${INTERLUDE_FENDA_EXPECTED_COUNTS[key]}, recebido ${counts[key]}.`,
          `counts.${key}`,
        ),
      );
    }
  }
}

function validateIdentity(
  errors: InterludeFendaValidationIssue[],
): void {
  if (INTERLUDE_FENDA_IDENTITY.id !== INTERLUDE_FENDA_ID) {
    errors.push(
      issue(
        "IFD_INVALID_ID",
        "O ID da experiência deve ser interlude_fenda.",
        "identity.id",
      ),
    );
  }

  if (INTERLUDE_FENDA_IDENTITY.kind !== "interlude") {
    errors.push(
      issue(
        "IFD_INVALID_KIND",
        "Fenda deve ser uma experiência do tipo interlude.",
        "identity.kind",
      ),
    );
  }

  if (INTERLUDE_FENDA_IDENTITY.countsAsPillar) {
    errors.push(
      issue(
        "IFD_COUNTS_AS_PILLAR",
        "O Interlúdio não pode ser contado como pilar.",
        "identity.countsAsPillar",
      ),
    );
  }

  if (INTERLUDE_FENDA_IDENTITY.blocksReading) {
    errors.push(
      issue(
        "IFD_BLOCKS_READING",
        "O Interlúdio não pode bloquear a leitura.",
        "identity.blocksReading",
      ),
    );
  }
}

function validateCanonicalSections(
  errors: InterludeFendaValidationIssue[],
): void {
  const expected = [
    ["identity", "Interlúdio"],
    ["threshold", "Fenda"],
    ["manifesto", "O preço invisível de querer ficar"],
    ["narrative", "Quando a rejeição vira identidade"],
    [
      "consciousness",
      "Onde eu me adapto para não ser excluído",
    ],
    [
      "judgment",
      "Quando querer pertencer vira fraqueza aos próprios olhos",
    ],
    ["presence", "Ficar mesmo com o medo de não caber"],
    [
      "support_letter",
      "Ficar mesmo com o medo de não caber",
    ],
    ["anchor", "O exercício do espaço próprio"],
    ["closing", "Pertencer não é se reduzir"],
  ] as const;

  INTERLUDE_FENDA_CANONICAL_SECTIONS.forEach(
    (section, index) => {
      const expectedSection = expected[index];

      if (
        section.kind !== expectedSection[0] ||
        section.title !== expectedSection[1]
      ) {
        errors.push(
          issue(
            "IFD_CANONICAL_SECTION",
            `Seção canônica inválida na posição ${index}.`,
            `canonicalSections.${index}`,
          ),
        );
      }

      if (
        section.editorialOrigin !== "book_exact" ||
        section.generationMode !== "fixed"
      ) {
        errors.push(
          issue(
            "IFD_CANONICAL_ORIGIN",
            `A seção ${section.id} deve ser book_exact e fixed.`,
            `canonicalSections.${index}`,
          ),
        );
      }

      if (
        section.bodyPolicy !==
        "canonical_source_reference_only"
      ) {
        errors.push(
          issue(
            "IFD_CANONICAL_BODY_POLICY",
            `A seção ${section.id} não pode recriar o corpo canônico.`,
            `canonicalSections.${index}`,
          ),
        );
      }

      if ("text" in section || "body" in section) {
        errors.push(
          issue(
            "IFD_INVENTED_CANONICAL_TEXT",
            `A seção ${section.id} deve apontar para a fonte, não armazenar texto inventado.`,
            `canonicalSections.${index}`,
          ),
        );
      }
    },
  );

  const invitationSections =
    INTERLUDE_FENDA_CANONICAL_SECTIONS.filter(
      (section) => section.automaticInviteAfter,
    ).map((section) => section.kind);

  if (
    JSON.stringify(invitationSections) !==
    JSON.stringify([
      "consciousness",
      "judgment",
      "presence",
    ])
  ) {
    errors.push(
      issue(
        "IFD_AUTOMATIC_INVITES",
        "Convites automáticos devem existir apenas após Consciência, Julgamento e Presença.",
        "canonicalSections",
      ),
    );
  }
}

function validateInvitations(
  errors: InterludeFendaValidationIssue[],
): void {
  const canonicalIds = new Set(
    INTERLUDE_FENDA_CANONICAL_SECTIONS.map(
      (section) => section.id,
    ),
  );

  for (const invitation of INTERLUDE_FENDA_INVITATIONS) {
    if (!canonicalIds.has(invitation.afterSectionId)) {
      errors.push(
        issue(
          "IFD_INVITATION_SECTION",
          `Seção de convite não encontrada: ${invitation.afterSectionId}.`,
          `invitations.${invitation.id}`,
        ),
      );
    }

    if (
      !invitation.optional ||
      invitation.blocking ||
      !invitation.oneQuestionPerTurn
    ) {
      errors.push(
        issue(
          "IFD_INVITATION_BEHAVIOR",
          `O convite ${invitation.id} deve ser opcional, não bloqueante e conter uma pergunta por turno.`,
          `invitations.${invitation.id}`,
        ),
      );
    }

    if (invitation.maxVisibleMoves > 3) {
      errors.push(
        issue(
          "IFD_VISIBLE_MOVES",
          `O convite ${invitation.id} ultrapassa três movimentos visíveis.`,
          `invitations.${invitation.id}`,
        ),
      );
    }

    if (invitation.telemetryIncludesAnswer) {
      errors.push(
        issue(
          "IFD_PRIVATE_TELEMETRY",
          `A resposta aberta do convite ${invitation.id} não pode entrar na telemetria.`,
          `invitations.${invitation.id}`,
        ),
      );
    }

    for (const choice of invitation.choices) {
      if (
        choice.semanticInterpretation ||
        choice.createsSignal ||
        choice.createsMemory
      ) {
        errors.push(
          issue(
            "IFD_ACTION_CHOICE_INTERPRETATION",
            `A ação ${choice.id} não pode funcionar como opção psicológica.`,
            `invitations.${invitation.id}.choices`,
          ),
        );
      }
    }
  }
}

function validateSignalsAndLanguage(
  errors: InterludeFendaValidationIssue[],
): void {
  for (const signal of INTERLUDE_FENDA_SIGNALS) {
    if (
      signal.persistence !== "session_only" ||
      signal.initialConfidence !== 0.3 ||
      signal.minimumOccurrencesForPattern < 3
    ) {
      errors.push(
        issue(
          "IFD_SIGNAL_POLICY",
          `O sinal ${signal.id} viola a política de baixa confiança e recorrência.`,
          `signals.${signal.id}`,
        ),
      );
    }

    if (signal.diagnostic || signal.classifiesThirdParty) {
      errors.push(
        issue(
          "IFD_DIAGNOSTIC_SIGNAL",
          `O sinal ${signal.id} não pode diagnosticar ou classificar terceiros.`,
          `signals.${signal.id}`,
        ),
      );
    }
  }

  const visibleContent = JSON.stringify({
    invitations: INTERLUDE_FENDA_INVITATIONS,
    microReturns: INTERLUDE_FENDA_MICRO_RETURNS,
  }).toLocaleLowerCase("pt-BR");

  const forbiddenPatterns = [
    /\bvocê tem trauma\b/,
    /\bvocê é dependente\b/,
    /\bsua família causou\b/,
    /\bvocê deve romper\b/,
    /\bcorte contato\b/,
    /\bcura completa\b/,
    /\bsuperação definitiva\b/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(visibleContent)) {
      errors.push(
        issue(
          "IFD_UNSAFE_LANGUAGE",
          `Linguagem proibida encontrada: ${pattern.source}.`,
          "visibleContent",
        ),
      );
    }
  }
}

function validateRulesAndResources(
  errors: InterludeFendaValidationIssue[],
): void {
  const validResourceIds: Set<string> = new Set([
    ...INTERLUDE_FENDA_CANONICAL_SECTIONS.map(
      (section) => section.id,
    ),
    ...INTERLUDE_FENDA_MICRO_RETURNS.map(
      (resource) => resource.id,
    ),
  ]);

  for (const rule of INTERLUDE_FENDA_PREDICTIVE_RULES) {
    if (
      rule.resourceId &&
      !validResourceIds.has(rule.resourceId)
    ) {
      errors.push(
        issue(
          "IFD_UNRESOLVED_RESOURCE",
          `Recurso não resolvido na regra ${rule.id}: ${rule.resourceId}.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }

    if (rule.minimumOccurrences < 1) {
      errors.push(
        issue(
          "IFD_INVALID_OCCURRENCE_THRESHOLD",
          `A regra ${rule.id} possui limiar inválido.`,
          `predictiveRules.${rule.id}`,
        ),
      );
    }
  }
}

function validateTransitions(
  errors: InterludeFendaValidationIssue[],
): void {
  const expectedOrder = [
    ["entry", "book", "experience_entered"],
    ["book", "consciousness", "automatic_invite"],
    ["consciousness", "judgment", "phase_complete"],
    ["judgment", "presence", "phase_complete"],
    ["presence", "closure", "phase_complete"],
    ["closure", "exit", "experience_complete"],
    ["pause", "book", "resume_requested"],
  ] as const;

  INTERLUDE_FENDA_TRANSITIONS.forEach(
    (transition, index) => {
      const expected = expectedOrder[index];

      if (
        transition.from !== expected[0] ||
        transition.to !== expected[1] ||
        transition.trigger !== expected[2]
      ) {
        errors.push(
          issue(
            "IFD_TRANSITION_ORDER",
            `Transição inválida na posição ${index}.`,
            `transitions.${index}`,
          ),
        );
      }

      if (transition.blocking) {
        errors.push(
          issue(
            "IFD_BLOCKING_TRANSITION",
            `A transição ${transition.id} não pode bloquear a leitura.`,
            `transitions.${index}`,
          ),
        );
      }
    },
  );

  const exitTransition = INTERLUDE_FENDA_TRANSITIONS[5];

  if (
    exitTransition.target?.kind !== "pillar" ||
    exitTransition.target.pillarId !==
      INTERLUDE_FENDA_NEXT_PILLAR_ID
  ) {
    errors.push(
      issue(
        "IFD_INVALID_EXIT",
        "A saída do Interlúdio deve apontar para pillar_03_luto.",
        "transitions.5.target",
      ),
    );
  }

  const interludeUsedAsPillar = INTERLUDE_FENDA_TRANSITIONS.some(
    (transition) =>
      transition.target?.kind === "pillar" &&
      transition.target.pillarId ===
        (INTERLUDE_FENDA_ID as string),
  );

  if (interludeUsedAsPillar) {
    errors.push(
      issue(
        "IFD_USED_AS_PILLAR_ID",
        "interlude_fenda não pode ser usado como PillarId.",
        "transitions",
      ),
    );
  }
}

function validateContinuityCompatibility(
  errors: InterludeFendaValidationIssue[],
): void {
  if (
    PILLAR_02_IMMEDIATE_CONTINUATION.kind !== "interlude" ||
    PILLAR_02_IMMEDIATE_CONTINUATION.experienceId !==
      INTERLUDE_FENDA_ID ||
    PILLAR_02_IMMEDIATE_CONTINUATION.nextPillarId !==
      INTERLUDE_FENDA_NEXT_PILLAR_ID
  ) {
    errors.push(
      issue(
        "IFD_PILLAR_02_COMPATIBILITY",
        "A continuidade do Pilar II não corresponde ao Interlúdio Fenda.",
        "pillar02.continuation",
      ),
    );
  }
}

function validateClosure(
  errors: InterludeFendaValidationIssue[],
): void {
  const routeIds = INTERLUDE_FENDA_CLOSURE.routes.map(
    (route) => route.id,
  );

  const expectedRouteIds = [
    "canonical_support_letter",
    "canonical_anchor",
    "canonical_closing",
    "pause",
    "return_to_book",
    "continue_to_pillar_03",
  ];

  if (
    JSON.stringify(routeIds) !==
    JSON.stringify(expectedRouteIds)
  ) {
    errors.push(
      issue(
        "IFD_CLOSURE_ROUTES",
        "As rotas de fechamento do Interlúdio estão incompletas.",
        "closure.routes",
      ),
    );
  }

  if (
    INTERLUDE_FENDA_CLOSURE.synthesisRequired ||
    INTERLUDE_FENDA_CLOSURE.reflectionRequired ||
    INTERLUDE_FENDA_CLOSURE.emotionallyResolvedClaim ||
    INTERLUDE_FENDA_CLOSURE.blocksReading
  ) {
    errors.push(
      issue(
        "IFD_CLOSURE_POLICY",
        "O fechamento não pode exigir reflexão, síntese, resolução emocional ou bloquear leitura.",
        "closure",
      ),
    );
  }
}

function validateLegacyIds(
  errors: InterludeFendaValidationIssue[],
): void {
  const serialized = JSON.stringify(INTERLUDE_FENDA_PACKAGE);

  if (serialized.includes("pillar_01_vinculo")) {
    errors.push(
      issue(
        "IFD_LEGACY_ID",
        "O ID legado pillar_01_vinculo não pode aparecer.",
        "package",
      ),
    );
  }
}

export function validateInterludeFendaBlock27(): InterludeFendaValidationReport {
  const errors: InterludeFendaValidationIssue[] = [];
  const warnings: InterludeFendaValidationIssue[] = [];

  validateCounts(errors);
  validateIdentity(errors);
  validateCanonicalSections(errors);
  validateInvitations(errors);
  validateSignalsAndLanguage(errors);
  validateRulesAndResources(errors);
  validateTransitions(errors);
  validateContinuityCompatibility(errors);
  validateClosure(errors);
  validateLegacyIds(errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}
