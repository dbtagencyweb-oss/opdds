// src/igentmind/pillars/pillar-02/pillar-02.block24.validation.ts

import {
  assertEditorialCombination,
  REFLECTION_PHASES,
} from "../../core";

import {
  createOptionId,
  createQuestionId,
  type EditorialContent,
  type PillarQuestion,
  type ResponseVariants,
} from "../template";

import {
  PILLAR_02_QUESTION_BLUEPRINTS,
} from "./pillar-02.questions-base";

import {
  PILLAR_02_SIGNALS,
} from "./pillar-02.signals";

import type {
  Pillar02Block24Issue,
  Pillar02Block24Validation,
} from "./pillar-02.block24.contracts";

const FORBIDDEN_DIRECTIONS = [
  "abandone sua família",
  "rompa com sua família",
  "corte sua família",
  "confronte sua família",
  "sua família é tóxica",
  "sua família é o problema",
  "seus pais são culpados",
  "você deve perdoar",
  "você precisa perdoar",
  "você deve se afastar",
  "você precisa se afastar",
] as const;

const DIAGNOSTIC_TERMS = [
  "narcisista",
  "narcisismo",
  "codependência",
  "codependente",
  "diagnóstico",
  "transtorno",
] as const;

function normalizeText(
  text: string,
): string {
  return text
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function addIssue(
  issues: Pillar02Block24Issue[],
  issue: Pillar02Block24Issue,
): void {
  issues.push(issue);
}

function validateEditorialContent(
  content: EditorialContent,
  path: string,
  issues: Pillar02Block24Issue[],
): void {
  if (!content.id.trim()) {
    addIssue(issues, {
      code: "P02_B24_CONTENT_ID_EMPTY",
      severity: "error",
      message:
        "Conteúdo editorial sem ID.",
      path: `${path}.id`,
    });
  }

  if (!content.text.trim()) {
    addIssue(issues, {
      code: "P02_B24_CONTENT_TEXT_EMPTY",
      severity: "error",
      message:
        "Conteúdo editorial vazio.",
      path: `${path}.text`,
    });
  }

  try {
    assertEditorialCombination({
      editorialOrigin:
        content.editorialOrigin,

      generationMode:
        content.generationMode,
    });
  } catch (error) {
    addIssue(issues, {
      code: "P02_B24_ORIGIN_MODE_INVALID",
      severity: "error",

      message:
        error instanceof Error
          ? error.message
          : "Origem editorial inválida.",

      path,
    });
  }
}

function validateCompanionContent(
  content: EditorialContent,
  path: string,
  issues: Pillar02Block24Issue[],
): void {
  validateEditorialContent(
    content,
    path,
    issues,
  );

  if (
    content.editorialOrigin !==
      "igent_companion" ||
    content.generationMode !== "fixed"
  ) {
    addIssue(issues, {
      code: "P02_B24_COMPANION_ORIGIN_INVALID",
      severity: "error",

      message:
        "Opções e respostas do Bloco 24 precisam ser conteúdo fixo do iGentMIND.",

      path,

      observed: {
        editorialOrigin:
          content.editorialOrigin,

        generationMode:
          content.generationMode,
      },

      expected: {
        editorialOrigin:
          "igent_companion",

        generationMode: "fixed",
      },
    });
  }
}

function validateResponseVariants(
  responses: ResponseVariants,
  path: string,
  issues: Pillar02Block24Issue[],
): void {
  validateCompanionContent(
    responses.minimal,
    `${path}.minimal`,
    issues,
  );

  validateCompanionContent(
    responses.standard,
    `${path}.standard`,
    issues,
  );

  validateCompanionContent(
    responses.deep,
    `${path}.deep`,
    issues,
  );

  const texts = [
    responses.minimal.text,
    responses.standard.text,
    responses.deep.text,
  ];

  if (
    new Set(texts).size !==
    texts.length
  ) {
    addIssue(issues, {
      code: "P02_B24_RESPONSE_VARIANTS_DUPLICATE",
      severity: "error",

      message:
        "As três profundidades precisam ter textos distintos.",

      path,
    });
  }
}

function validateForbiddenLanguage(
  text: string,
  path: string,
  issues: Pillar02Block24Issue[],
): void {
  const normalized =
    normalizeText(text);

  for (
    const forbidden
    of FORBIDDEN_DIRECTIONS
  ) {
    if (
      normalized.includes(
        normalizeText(forbidden),
      )
    ) {
      addIssue(issues, {
        code: "P02_B24_FORBIDDEN_DIRECTION",
        severity: "error",

        message:
          "O conteúdo prescreve acusação, afastamento ou rompimento familiar.",

        path,
        observed: forbidden,
      });
    }
  }

  for (
    const diagnostic
    of DIAGNOSTIC_TERMS
  ) {
    if (
      normalized.includes(
        normalizeText(diagnostic),
      )
    ) {
      addIssue(issues, {
        code: "P02_B24_DIAGNOSTIC_LANGUAGE",
        severity: "error",

        message:
          "O conteúdo utiliza linguagem diagnóstica proibida.",

        path,
        observed: diagnostic,
      });
    }
  }
}

function collectQuestionText(
  question: PillarQuestion,
): string {
  return [
    question.prompt.text,

    question.openResponse.minimal.text,
    question.openResponse.standard.text,
    question.openResponse.deep.text,

    ...question.options.flatMap(
      (option) => [
        option.label.text,
        option.responses.minimal.text,
        option.responses.standard.text,
        option.responses.deep.text,
      ],
    ),
  ].join(" ");
}

export function validatePillar02Block24(
  questions:
    readonly PillarQuestion[],
): Pillar02Block24Validation {
  const issues:
    Pillar02Block24Issue[] = [];

  const registeredSignals =
    new Set(
      PILLAR_02_SIGNALS.map(
        (signal) => signal.id,
      ),
    );

  const blueprints =
    new Map(
      PILLAR_02_QUESTION_BLUEPRINTS.map(
        (blueprint) => [
          blueprint.id,
          blueprint,
        ],
      ),
    );

  if (questions.length !== 9) {
    addIssue(issues, {
      code: "P02_B24_QUESTION_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de nove perguntas completas.",

      observed: questions.length,
      expected: 9,
    });
  }

  const questionIds =
    questions.map(
      (question) => question.id,
    );

  if (
    new Set(questionIds).size !==
    questionIds.length
  ) {
    addIssue(issues, {
      code: "P02_B24_DUPLICATE_QUESTION_IDS",
      severity: "error",
      message:
        "Existem IDs de perguntas duplicados.",
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseQuestions =
      questions
        .filter(
          (question) =>
            question.phase === phase,
        )
        .sort(
          (left, right) =>
            left.order - right.order,
        );

    if (phaseQuestions.length !== 3) {
      addIssue(issues, {
        code: "P02_B24_PHASE_QUESTION_COUNT",
        severity: "error",

        message:
          `A fase ${phase} precisa de três perguntas.`,

        observed:
          phaseQuestions.length,

        expected: 3,
      });
    }

    phaseQuestions.forEach(
      (question, index) => {
        const expectedOrder =
          (index + 1) as 1 | 2 | 3;

        const expectedId =
          createQuestionId(
            2,
            phase,
            expectedOrder,
          );

        if (
          question.id !== expectedId
        ) {
          addIssue(issues, {
            code: "P02_B24_QUESTION_ID_INVALID",
            severity: "error",

            message:
              "Pergunta fora do padrão estável de IDs.",

            path: `questions.${question.id}.id`,
            observed: question.id,
            expected: expectedId,
          });
        }

        if (
          question.order !==
          expectedOrder
        ) {
          addIssue(issues, {
            code: "P02_B24_QUESTION_ORDER_INVALID",
            severity: "error",

            message:
              "Ordem da pergunta inconsistente.",

            path: `questions.${question.id}.order`,
            observed: question.order,
            expected: expectedOrder,
          });
        }
      },
    );
  }

  let optionCount = 0;
  const allOptionIds: string[] = [];

  for (
    let questionIndex = 0;
    questionIndex < questions.length;
    questionIndex += 1
  ) {
    const question =
      questions[questionIndex];

    const questionPath =
      `questions[${questionIndex}]`;

    const blueprint =
      blueprints.get(question.id);

    if (!blueprint) {
      addIssue(issues, {
        code: "P02_B24_BLUEPRINT_NOT_FOUND",
        severity: "error",

        message:
          "A pergunta não possui blueprint no Bloco 23.",

        path: questionPath,
        observed: question.id,
      });
    } else {
      if (
        question.prompt.text !==
        blueprint.prompt.text
      ) {
        addIssue(issues, {
          code: "P02_B24_PROMPT_MISMATCH",
          severity: "error",

          message:
            "O texto da pergunta diverge do blueprint aprovado.",

          path:
            `${questionPath}.prompt.text`,

          observed:
            question.prompt.text,

          expected:
            blueprint.prompt.text,
        });
      }

      if (
        question.prompt
          .editorialOrigin !==
        blueprint.prompt
          .editorialOrigin
      ) {
        addIssue(issues, {
          code: "P02_B24_PROMPT_ORIGIN_MISMATCH",
          severity: "error",

          message:
            "A origem editorial da pergunta foi alterada.",

          path:
            `${questionPath}.prompt.editorialOrigin`,

          observed:
            question.prompt
              .editorialOrigin,

          expected:
            blueprint.prompt
              .editorialOrigin,
        });
      }

      if (
        blueprint
          .createsPatternAlone !==
          false ||
        blueprint
          .closedOptionConfidence !==
          "low"
      ) {
        addIssue(issues, {
          code: "P02_B24_BLUEPRINT_CONTRACT_INVALID",
          severity: "error",

          message:
            "O blueprint permite inferência excessiva.",
          path: questionPath,
        });
      }
    }

    validateEditorialContent(
      question.prompt,
      `${questionPath}.prompt`,
      issues,
    );

    validateResponseVariants(
      question.openResponse,
      `${questionPath}.openResponse`,
      issues,
    );

    if (
      question.allowOpenAnswer !==
      true
    ) {
      addIssue(issues, {
        code: "P02_B24_OPEN_ANSWER_DISABLED",
        severity: "error",

        message:
          "Toda pergunta precisa aceitar resposta aberta.",

        path:
          `${questionPath}.allowOpenAnswer`,
      });
    }

    if (
      question.options.length !== 6
    ) {
      addIssue(issues, {
        code: "P02_B24_OPTION_COUNT",
        severity: "error",

        message:
          "Cada pergunta precisa de seis opções.",

        path:
          `${questionPath}.options`,

        observed:
          question.options.length,

        expected: 6,
      });
    }

    optionCount +=
      question.options.length;

    const labels =
      question.options.map(
        (option) =>
          normalizeText(
            option.label.text,
          ),
      );

    if (
      new Set(labels).size !==
      labels.length
    ) {
      addIssue(issues, {
        code: "P02_B24_DUPLICATE_OPTION_LABELS",
        severity: "error",

        message:
          "A pergunta possui opções textualmente duplicadas.",

        path:
          `${questionPath}.options`,
      });
    }

    for (
      let optionIndex = 0;
      optionIndex <
      question.options.length;
      optionIndex += 1
    ) {
      const option =
        question.options[optionIndex];

      const optionPath =
        `${questionPath}.options[${optionIndex}]`;

      const expectedOptionId =
        createOptionId(
          question.id,
          optionIndex + 1,
        );

      allOptionIds.push(option.id);

      if (
        option.id !==
        expectedOptionId
      ) {
        addIssue(issues, {
          code: "P02_B24_OPTION_ID_INVALID",
          severity: "error",

          message:
            "Opção fora do padrão estável de IDs.",

          path:
            `${optionPath}.id`,

          observed:
            option.id,

          expected:
            expectedOptionId,
        });
      }

      validateCompanionContent(
        option.label,
        `${optionPath}.label`,
        issues,
      );

      validateResponseVariants(
        option.responses,
        `${optionPath}.responses`,
        issues,
      );

      if (
        option.signals.length === 0
      ) {
        addIssue(issues, {
          code: "P02_B24_OPTION_WITHOUT_SIGNAL",
          severity: "error",

          message:
            "Toda opção precisa de pelo menos um sinal de baixa confiança.",

          path:
            `${optionPath}.signals`,
        });
      }

      for (
        let signalIndex = 0;
        signalIndex <
        option.signals.length;
        signalIndex += 1
      ) {
        const binding =
          option.signals[signalIndex];

        if (
          !registeredSignals.has(
            binding.signalId,
          )
        ) {
          addIssue(issues, {
            code: "P02_B24_SIGNAL_NOT_REGISTERED",
            severity: "error",

            message:
              "A opção referencia sinal não registrado.",

            path:
              `${optionPath}.signals[${signalIndex}]`,

            observed:
              binding.signalId,
          });
        }

        if (
          binding.confidence > 0.35
        ) {
          addIssue(issues, {
            code: "P02_B24_SIGNAL_CONFIDENCE_HIGH",
            severity: "error",

            message:
              "Opção fechada iniciou com confiança excessiva.",

            path:
              `${optionPath}.signals[${signalIndex}].confidence`,

            observed:
              binding.confidence,

            expected: "<= 0.35",
          });
        }
      }

      if (
        option.scaleEffects.length > 2
      ) {
        addIssue(issues, {
          code: "P02_B24_TOO_MANY_SCALE_EFFECTS",
          severity: "warning",

          message:
            "A opção aplica mais de dois efeitos de escala.",

          path:
            `${optionPath}.scaleEffects`,
        });
      }

      for (
        let effectIndex = 0;
        effectIndex <
        option.scaleEffects.length;
        effectIndex += 1
      ) {
        const effect =
          option.scaleEffects[
            effectIndex
          ];

        if (
          ![-1, 0, 1].includes(
            effect.delta,
          )
        ) {
          addIssue(issues, {
            code: "P02_B24_SCALE_DELTA_INVALID",
            severity: "error",

            message:
              "Efeitos de escala aceitam somente -1, 0 ou 1.",

            path:
              `${optionPath}.scaleEffects[${effectIndex}]`,

            observed:
              effect.delta,
          });
        }
      }
    }

    validateForbiddenLanguage(
      collectQuestionText(
        question,
      ),

      questionPath,
      issues,
    );
  }

  if (optionCount !== 54) {
    addIssue(issues, {
      code: "P02_B24_TOTAL_OPTION_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de 54 opções.",

      observed: optionCount,
      expected: 54,
    });
  }

  if (
    new Set(allOptionIds).size !==
    allOptionIds.length
  ) {
    addIssue(issues, {
      code: "P02_B24_DUPLICATE_OPTION_IDS",
      severity: "error",

      message:
        "Existem IDs de opções duplicados.",
    });
  }

  const bookExactPrompts =
    questions.filter(
      (question) =>
        question.prompt
          .editorialOrigin ===
        "book_exact",
    );

  const companionPrompts =
    questions.filter(
      (question) =>
        question.prompt
          .editorialOrigin ===
        "igent_companion",
    );

  if (
    bookExactPrompts.length !== 3
  ) {
    addIssue(issues, {
      code: "P02_B24_BOOK_PROMPT_COUNT",
      severity: "error",

      message:
        "Exatamente três perguntas devem permanecer book_exact.",

      observed:
        bookExactPrompts.length,

      expected: 3,
    });
  }

  if (
    !bookExactPrompts.every(
      (question) =>
        question.phase ===
        "consciousness",
    )
  ) {
    addIssue(issues, {
      code: "P02_B24_BOOK_PROMPT_PHASE",
      severity: "error",

      message:
        "As perguntas book_exact precisam estar na fase Consciência.",
    });
  }

  if (
    companionPrompts.length !== 6
  ) {
    addIssue(issues, {
      code: "P02_B24_COMPANION_PROMPT_COUNT",
      severity: "error",

      message:
        "Exatamente seis perguntas precisam ser complementares.",

      observed:
        companionPrompts.length,

      expected: 6,
    });
  }

  const errors =
    issues.filter(
      (issue) =>
        issue.severity === "error",
    );

  const warnings =
    issues.filter(
      (issue) =>
        issue.severity === "warning",
    );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
