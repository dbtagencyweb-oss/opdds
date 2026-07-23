import type {
  Pillar03Block29Counts,
  Pillar03Block29ValidationIssue,
  Pillar03Block29ValidationReport,
  Pillar03Question,
  Pillar03ResponseBlock,
  Pillar03SemanticPosition,
} from "./pillar-03.block29.contracts";

import {
  PILLAR_03_ID,
} from "./pillar-03.block28.contracts";

import {
  PILLAR_03_CANONICAL_SECTIONS,
} from "./pillar-03.canonical";

import {
  PILLAR_03_SIGNALS,
} from "./pillar-03.signals";

import {
  PILLAR_03_QUESTIONS,
} from "./pillar-03.questions";

const EXPECTED_SEMANTIC_POSITIONS =
  Object.freeze([
    "recognition",
    "minimization",
    "defense",
    "ambivalence",
    "desire",
    "uncertainty",
  ] satisfies readonly Pillar03SemanticPosition[]);

const ALLOWED_DELTAS =
  new Set([-1, 0, 1]);

const FORBIDDEN_LANGUAGE =
  Object.freeze([
    /\bvocê tem trauma\b/i,
    /\bvocê é traumatizado\b/i,
    /\bvocê é incapaz\b/i,
    /\bvocê precisa superar\b/i,
    /\bsupere essa perda\b/i,
    /\bencerrou emocionalmente\b/i,
    /\bcura completa\b/i,
    /\bluto patológico\b/i,
    /\bdiagnóstico\b/i,
    /\bsubstitua a pessoa\b/i,
    /\besqueça quem partiu\b/i,
    /\bcorte contato\b/i,
  ]);

function issue(
  code: string,
  message: string,
  path?: string,
): Pillar03Block29ValidationIssue {
  return Object.freeze({
    code,
    message,
    path,
  });
}

function countQuestionMarks(
  blocks: readonly Pillar03ResponseBlock[],
): number {
  return blocks.reduce(
    (total, block) =>
      total +
      [...block.text].filter(
        (character) => character === "?",
      ).length,
    0,
  );
}

function collectVisibleText(
  question: Pillar03Question,
): string {
  return JSON.stringify({
    prompt: question.prompt,
    options: question.options,
    openAnswer: question.openAnswer.responses,
  });
}

export function getPillar03Block29Counts(): Pillar03Block29Counts {
  const options =
    PILLAR_03_QUESTIONS.flatMap(
      (question) => question.options,
    );

  return Object.freeze({
    questions: PILLAR_03_QUESTIONS.length,
    options: options.length,
    openAnswers:
      PILLAR_03_QUESTIONS.filter(
        (question) =>
          question.openAnswer.enabled,
      ).length,

    minimalOptionResponses:
      options.filter(
        (option) =>
          option.responses.minimal !==
          undefined,
      ).length,

    standardOptionResponses:
      options.filter(
        (option) =>
          option.responses.standard !==
          undefined,
      ).length,

    deepOptionResponses:
      options.filter(
        (option) =>
          option.responses.deep !==
          undefined,
      ).length,

    optionResponseVariants:
      options.length * 3,

    openAnswerResponseVariants:
      PILLAR_03_QUESTIONS.length * 3,

    consciousnessQuestions:
      PILLAR_03_QUESTIONS.filter(
        (question) =>
          question.phase ===
          "consciousness",
      ).length,

    judgmentQuestions:
      PILLAR_03_QUESTIONS.filter(
        (question) =>
          question.phase === "judgment",
      ).length,

    presenceQuestions:
      PILLAR_03_QUESTIONS.filter(
        (question) =>
          question.phase === "presence",
      ).length,
  });
}

function validateQuestionCounts(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  const counts =
    getPillar03Block29Counts();

  if (counts.questions !== 9) {
    errors.push(
      issue(
        "P03_Q_COUNT",
        "O Pilar III deve possuir nove perguntas.",
        "questions",
      ),
    );
  }

  if (counts.options !== 54) {
    errors.push(
      issue(
        "P03_OPTION_COUNT",
        "O Pilar III deve possuir 54 opções.",
        "questions.options",
      ),
    );
  }

  if (counts.openAnswers !== 9) {
    errors.push(
      issue(
        "P03_OPEN_ANSWER_COUNT",
        "Cada pergunta deve possuir uma resposta aberta.",
        "questions.openAnswer",
      ),
    );
  }

  if (
    counts.consciousnessQuestions !== 3 ||
    counts.judgmentQuestions !== 3 ||
    counts.presenceQuestions !== 3
  ) {
    errors.push(
      issue(
        "P03_PHASE_QUESTION_COUNT",
        "Devem existir três perguntas por fase.",
        "questions",
      ),
    );
  }

  if (
    counts.minimalOptionResponses !== 54 ||
    counts.standardOptionResponses !== 54 ||
    counts.deepOptionResponses !== 54
  ) {
    errors.push(
      issue(
        "P03_RESPONSE_LAYER_COUNT",
        "Cada opção deve possuir respostas minimal, standard e deep.",
        "questions.options.responses",
      ),
    );
  }
}

function validateQuestionOrder(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  PILLAR_03_QUESTIONS.forEach(
    (question, index) => {
      if (question.order !== index + 1) {
        errors.push(
          issue(
            "P03_QUESTION_ORDER",
            `Ordem inválida em ${question.id}.`,
            `questions.${index}.order`,
          ),
        );
      }
    },
  );

  for (const phase of [
    "consciousness",
    "judgment",
    "presence",
  ] as const) {
    const phaseQuestions =
      PILLAR_03_QUESTIONS.filter(
        (question) =>
          question.phase === phase,
      );

    phaseQuestions.forEach(
      (question, index) => {
        if (
          question.phaseOrder !== index + 1
        ) {
          errors.push(
            issue(
              "P03_PHASE_ORDER",
              `Ordem interna inválida em ${question.id}.`,
              `questions.${question.id}.phaseOrder`,
            ),
          );
        }
      },
    );
  }
}

function validateQuestionContracts(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  const questionIds = new Set<string>();
  const optionIds = new Set<string>();
  const openAnswerIds = new Set<string>();

  const canonicalSectionIds = new Set(
    PILLAR_03_CANONICAL_SECTIONS.map(
      (section) => section.id,
    ),
  );

  const signalIds: Set<string> = new Set(
    PILLAR_03_SIGNALS.map(
      (signal) => signal.id,
    ),
  );

  for (const question of PILLAR_03_QUESTIONS) {
    if (questionIds.has(question.id)) {
      errors.push(
        issue(
          "P03_DUPLICATE_QUESTION",
          `Pergunta duplicada: ${question.id}.`,
          `questions.${question.id}`,
        ),
      );
    }

    questionIds.add(question.id);

    if (question.pillarId !== PILLAR_03_ID) {
      errors.push(
        issue(
          "P03_QUESTION_PILLAR",
          `${question.id} não pertence ao Pilar III.`,
          `questions.${question.id}.pillarId`,
        ),
      );
    }

    if (
      !question.id.startsWith(
        `p03_${question.phase}_q`,
      )
    ) {
      errors.push(
        issue(
          "P03_QUESTION_ID_PHASE",
          `${question.id} não corresponde à própria fase.`,
          `questions.${question.id}.id`,
        ),
      );
    }

    if (
      question.editorialOrigin !==
        "igent_companion" ||
      question.generationMode !== "fixed"
    ) {
      errors.push(
        issue(
          "P03_QUESTION_ORIGIN",
          `${question.id} deve ser conteúdo complementar fixo.`,
          `questions.${question.id}`,
        ),
      );
    }

    if (
      !question.optional ||
      question.blocking ||
      !question.oneQuestionPerTurn
    ) {
      errors.push(
        issue(
          "P03_QUESTION_NAVIGATION",
          `${question.id} viola escolha ou navegação.`,
          `questions.${question.id}`,
        ),
      );
    }

    if (
      !canonicalSectionIds.has(
        question.canonicalSectionId,
      )
    ) {
      errors.push(
        issue(
          "P03_UNKNOWN_CANONICAL_SECTION",
          `${question.id} referencia seção canônica inexistente.`,
          `questions.${question.id}.canonicalSectionId`,
        ),
      );
    }

    const expectedCanonicalSection =
      `p03_${question.phase}`;

    if (
      question.canonicalSectionId !==
      expectedCanonicalSection
    ) {
      errors.push(
        issue(
          "P03_CANONICAL_PHASE_MISMATCH",
          `${question.id} não está vinculado à seção de sua fase.`,
          `questions.${question.id}.canonicalSectionId`,
        ),
      );
    }

    if (question.options.length !== 6) {
      errors.push(
        issue(
          "P03_OPTIONS_PER_QUESTION",
          `${question.id} deve possuir seis opções.`,
          `questions.${question.id}.options`,
        ),
      );
    }

    const semanticPositions =
      question.options.map(
        (option) =>
          option.semanticPosition,
      );

    if (
      JSON.stringify(semanticPositions) !==
      JSON.stringify(
        EXPECTED_SEMANTIC_POSITIONS,
      )
    ) {
      errors.push(
        issue(
          "P03_SEMANTIC_POSITIONS",
          `${question.id} não preserva as seis posições oficiais na ordem definida.`,
          `questions.${question.id}.options`,
        ),
      );
    }

    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        errors.push(
          issue(
            "P03_DUPLICATE_OPTION",
            `Opção duplicada: ${option.id}.`,
            `questions.${question.id}.options`,
          ),
        );
      }

      optionIds.add(option.id);

      if (
        option.questionId !== question.id
      ) {
        errors.push(
          issue(
            "P03_OPTION_QUESTION_ID",
            `${option.id} aponta para pergunta incorreta.`,
            `questions.${question.id}.options.${option.id}`,
          ),
        );
      }

      if (
        option.editorialOrigin !==
          "igent_companion" ||
        option.generationMode !== "fixed"
      ) {
        errors.push(
          issue(
            "P03_OPTION_ORIGIN",
            `${option.id} deve ser conteúdo complementar fixo.`,
            `questions.${question.id}.options.${option.id}`,
          ),
        );
      }

      if (
        option.interpretationConfidence !==
          "low" ||
        option.isolatedSelectionCreatesPattern
      ) {
        errors.push(
          issue(
            "P03_CLOSED_OPTION_CONFIDENCE",
            `${option.id} viola a política de baixa confiança.`,
            `questions.${question.id}.options.${option.id}`,
          ),
        );
      }

      if (
        option.signalBindings.length !== 1
      ) {
        errors.push(
          issue(
            "P03_SIGNAL_BINDING_COUNT",
            `${option.id} deve possuir um vínculo primário.`,
            `questions.${question.id}.options.${option.id}.signalBindings`,
          ),
        );
      }

      for (
        const binding
        of option.signalBindings
      ) {
        if (
          !signalIds.has(binding.signalId)
        ) {
          errors.push(
            issue(
              "P03_UNKNOWN_SIGNAL",
              `${option.id} referencia o sinal inexistente ${binding.signalId}.`,
              `questions.${question.id}.options.${option.id}.signalBindings`,
            ),
          );
        }

        if (binding.createsPatternAlone) {
          errors.push(
            issue(
              "P03_SINGLE_OPTION_PATTERN",
              `${option.id} não pode criar padrão isoladamente.`,
              `questions.${question.id}.options.${option.id}.signalBindings`,
            ),
          );
        }
      }

      for (
        const delta
        of Object.values(
          option.scaleEffects,
        )
      ) {
        if (
          delta !== undefined &&
          !ALLOWED_DELTAS.has(delta)
        ) {
          errors.push(
            issue(
              "P03_INVALID_DELTA",
              `${option.id} possui delta fora de -1, 0 ou 1.`,
              `questions.${question.id}.options.${option.id}.scaleEffects`,
            ),
          );
        }
      }

      const responseDepths = [
        "minimal",
        "standard",
        "deep",
      ] as const;

      responseDepths.forEach(
        (depth, index) => {
          const response =
            option.responses[depth];

          if (
            response.depth !== depth
          ) {
            errors.push(
              issue(
                "P03_RESPONSE_DEPTH",
                `${option.id} possui camada ${depth} inválida.`,
                `questions.${question.id}.options.${option.id}.responses.${depth}`,
              ),
            );
          }

          if (
            response.visibleMoves !==
            index + 1
          ) {
            errors.push(
              issue(
                "P03_VISIBLE_MOVE_COUNT",
                `${option.id}.${depth} possui número inválido de movimentos.`,
                `questions.${question.id}.options.${option.id}.responses.${depth}`,
              ),
            );
          }

          if (
            response.blocks.length !==
            response.visibleMoves ||
            response.visibleMoves > 3
          ) {
            errors.push(
              issue(
                "P03_RESPONSE_BLOCK_COUNT",
                `${option.id}.${depth} ultrapassa ou não corresponde aos movimentos visíveis.`,
                `questions.${question.id}.options.${option.id}.responses.${depth}`,
              ),
            );
          }

          if (
            countQuestionMarks(
              response.blocks,
            ) > 1
          ) {
            errors.push(
              issue(
                "P03_MULTIPLE_QUESTIONS",
                `${option.id}.${depth} apresenta mais de uma pergunta.`,
                `questions.${question.id}.options.${option.id}.responses.${depth}`,
              ),
            );
          }

          if (
            response.diagnostic ||
            response.claimsResolution
          ) {
            errors.push(
              issue(
                "P03_RESPONSE_CLAIM",
                `${option.id}.${depth} não pode diagnosticar ou afirmar resolução.`,
                `questions.${question.id}.options.${option.id}.responses.${depth}`,
              ),
            );
          }
        },
      );
    }

    const openAnswer =
      question.openAnswer;

    if (
      openAnswerIds.has(openAnswer.id)
    ) {
      errors.push(
        issue(
          "P03_DUPLICATE_OPEN_ANSWER",
          `Resposta aberta duplicada: ${openAnswer.id}.`,
          `questions.${question.id}.openAnswer`,
        ),
      );
    }

    openAnswerIds.add(openAnswer.id);

    if (
      !openAnswer.enabled ||
      openAnswer.interpretivePriority !==
        "higher_than_closed_option" ||
      !openAnswer
        .responseMustPrioritizeReaderWords ||
      !openAnswer
        .contradictionOverridesClosedOption
    ) {
      errors.push(
        issue(
          "P03_OPEN_ANSWER_PRIORITY",
          `${question.id} não prioriza adequadamente a resposta aberta.`,
          `questions.${question.id}.openAnswer`,
        ),
      );
    }

    if (
      openAnswer.automaticMemoryCreation ||
      !openAnswer
        .memoryRequiresExplicitConsent
    ) {
      errors.push(
        issue(
          "P03_OPEN_ANSWER_MEMORY",
          `${question.id} viola o consentimento de memória.`,
          `questions.${question.id}.openAnswer`,
        ),
      );
    }

    if (
      openAnswer.includedInTelemetry ||
      openAnswer.includedInPublicSnapshot
    ) {
      errors.push(
        issue(
          "P03_OPEN_ANSWER_PRIVACY",
          `${question.id} permite conteúdo privado em telemetria ou snapshot.`,
          `questions.${question.id}.openAnswer`,
        ),
      );
    }

    for (const depth of [
      "minimal",
      "standard",
      "deep",
    ] as const) {
      const response =
        openAnswer.responses[depth];

      if (
        response.editorialOrigin !==
          "igent_companion" ||
        response.generationMode !==
          "templated"
      ) {
        errors.push(
          issue(
            "P03_OPEN_RESPONSE_MODE",
            `${question.id}.${depth} deve ser conteúdo complementar templated.`,
            `questions.${question.id}.openAnswer.responses.${depth}`,
          ),
        );
      }

      if (
        response.templateBlocks.length !==
        response.visibleMoves
      ) {
        errors.push(
          issue(
            "P03_OPEN_RESPONSE_BLOCKS",
            `${question.id}.${depth} possui movimentos inconsistentes.`,
            `questions.${question.id}.openAnswer.responses.${depth}`,
          ),
        );
      }

      if (
        countQuestionMarks(
          response.templateBlocks,
        ) > 1
      ) {
        errors.push(
          issue(
            "P03_OPEN_MULTIPLE_QUESTIONS",
            `${question.id}.${depth} apresenta mais de uma pergunta.`,
            `questions.${question.id}.openAnswer.responses.${depth}`,
          ),
        );
      }
    }
  }
}

function validateLanguage(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  for (const question of PILLAR_03_QUESTIONS) {
    const content =
      collectVisibleText(question);

    for (
      const pattern
      of FORBIDDEN_LANGUAGE
    ) {
      if (pattern.test(content)) {
        errors.push(
          issue(
            "P03_FORBIDDEN_LANGUAGE",
            `Linguagem proibida encontrada em ${question.id}: ${pattern.source}.`,
            `questions.${question.id}`,
          ),
        );
      }
    }
  }
}

function validateNoPrematureResources(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  const serialized =
    JSON.stringify(
      PILLAR_03_QUESTIONS,
    );

  const prematureKeys = [
    "resourceId",
    "journalId",
    "letterId",
    "anchorId",
    "microReturnId",
  ];

  for (const key of prematureKeys) {
    if (serialized.includes(`"${key}"`)) {
      errors.push(
        issue(
          "P03_PREMATURE_RESOURCE_REFERENCE",
          `O Bloco 29 contém referência prematura: ${key}.`,
          "questions",
        ),
      );
    }
  }
}

function validateLegacyId(
  errors:
    Pillar03Block29ValidationIssue[],
): void {
  if (
    JSON.stringify(
      PILLAR_03_QUESTIONS,
    ).includes("pillar_01_vinculo")
  ) {
    errors.push(
      issue(
        "P03_LEGACY_ID",
        "O ID legado pillar_01_vinculo não pode aparecer.",
        "questions",
      ),
    );
  }
}

export function validatePillar03Block29(): Pillar03Block29ValidationReport {
  const errors:
    Pillar03Block29ValidationIssue[] = [];

  const warnings:
    Pillar03Block29ValidationIssue[] = [];

  validateQuestionCounts(errors);
  validateQuestionOrder(errors);
  validateQuestionContracts(errors);
  validateLanguage(errors);
  validateNoPrematureResources(errors);
  validateLegacyId(errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
  });
}
