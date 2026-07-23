// src/igentmind/pillars/pillar-02/pillar-02.block25.validation.ts

import {
  REFLECTION_PHASES,
} from "../../core";

import type {
  ReflectionPhase,
} from "../../core";

import {
  createResourceId,
  type EditorialContent,
  type PillarAnchor,
  type PillarJournal,
  type PillarLetter,
  type PillarMicroReturn,
  type PillarPredictiveRule,
} from "../template";

import type {
  Pillar02Block25Issue,
  Pillar02Block25Validation,
} from "./pillar-02.block25.contracts";

import {
  PILLAR_02_RESOURCE_KIND_BY_ID,
} from "./pillar-02.resources";

import {
  PILLAR_02_SIGNAL_IDS,
} from "./pillar-02.signals";

const EXPECTED_MICRO_FUNCTIONS = [
  "recognition",
  "contradiction",
  "protection",
  "cost",
  "permission",
  "presence",
] as const;

const FORBIDDEN_DIRECTIONS = [
  "abandone sua família",
  "rompa com sua família",
  "corte sua família",
  "confronte sua família",
  "sua família é tóxica",
  "seus pais são culpados",
  "você precisa se afastar",
  "você deve se afastar",
  "você precisa perdoar",
  "você deve perdoar",
] as const;

const DIAGNOSTIC_TERMS = [
  "narcisista",
  "narcisismo",
  "codependência",
  "codependente",
  "transtorno",
  "diagnóstico",
] as const;

function normalize(
  value: string,
): string {
  return value
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
  issues: Pillar02Block25Issue[],
  issue: Pillar02Block25Issue,
): void {
  issues.push(issue);
}

function validateCompanionContent(
  content: EditorialContent,
  path: string,
  issues: Pillar02Block25Issue[],
): void {
  if (!content.id.trim()) {
    addIssue(issues, {
      code: "P02_B25_CONTENT_ID_EMPTY",
      severity: "error",
      message:
        "Conteúdo sem ID.",
      path: `${path}.id`,
    });
  }

  if (!content.text.trim()) {
    addIssue(issues, {
      code: "P02_B25_CONTENT_TEXT_EMPTY",
      severity: "error",
      message:
        "Conteúdo textual vazio.",
      path: `${path}.text`,
    });
  }

  if (
    content.editorialOrigin !==
      "igent_companion" ||
    content.generationMode !== "fixed"
  ) {
    addIssue(issues, {
      code: "P02_B25_CONTENT_ORIGIN_INVALID",
      severity: "error",

      message:
        "Recursos complementares precisam usar igent_companion e fixed.",

      path,

      observed: {
        editorialOrigin:
          content.editorialOrigin,

        generationMode:
          content.generationMode,
      },
    });
  }
}

function validateLanguage(
  text: string,
  path: string,
  issues: Pillar02Block25Issue[],
): void {
  const normalizedText =
    normalize(text);

  for (const expression of FORBIDDEN_DIRECTIONS) {
    if (
      normalizedText.includes(
        normalize(expression),
      )
    ) {
      addIssue(issues, {
        code: "P02_B25_FORBIDDEN_DIRECTION",
        severity: "error",

        message:
          "O recurso prescreve acusação, rompimento ou afastamento familiar.",

        path,
        observed: expression,
      });
    }
  }

  for (const term of DIAGNOSTIC_TERMS) {
    if (
      normalizedText.includes(
        normalize(term),
      )
    ) {
      addIssue(issues, {
        code: "P02_B25_DIAGNOSTIC_LANGUAGE",
        severity: "error",

        message:
          "O recurso utiliza linguagem diagnóstica.",

        path,
        observed: term,
      });
    }
  }
}

function validateIds(
  ids: readonly string[],
  issues: Pillar02Block25Issue[],
): void {
  if (
    new Set(ids).size !==
    ids.length
  ) {
    addIssue(issues, {
      code: "P02_B25_DUPLICATE_IDS",
      severity: "error",
      message:
        "Existem IDs duplicados no pacote de recursos.",
    });
  }

  for (const id of ids) {
    if (!id.startsWith("p02_")) {
      addIssue(issues, {
        code: "P02_B25_RESOURCE_NAMESPACE_INVALID",
        severity: "error",

        message:
          "Recurso fora do namespace do Pilar II.",

        observed: id,
      });
    }
  }
}

function validateMicroReturns(
  microReturns:
    readonly PillarMicroReturn[],
  issues: Pillar02Block25Issue[],
): void {
  if (microReturns.length !== 18) {
    addIssue(issues, {
      code: "P02_B25_MICRO_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de 18 micro-retornos.",

      observed: microReturns.length,
      expected: 18,
    });
  }

  const registeredSignals =
    new Set(PILLAR_02_SIGNAL_IDS);

  for (const phase of REFLECTION_PHASES) {
    const phaseItems =
      microReturns
        .filter(
          (item) =>
            item.phase === phase,
        )
        .sort(
          (left, right) =>
            left.order - right.order,
        );

    if (phaseItems.length !== 6) {
      addIssue(issues, {
        code: "P02_B25_PHASE_MICRO_COUNT",
        severity: "error",

        message:
          `A fase ${phase} precisa de seis micro-retornos.`,

        observed: phaseItems.length,
        expected: 6,
      });
    }

    const functions =
      phaseItems.map(
        (item) =>
          item.function,
      );

    expectExactFunctions(
      phase,
      functions,
      issues,
    );

    phaseItems.forEach(
      (item, index) => {
        const expectedId =
          createResourceId(
            2,
            "micro_return",
            phase,
            index + 1,
          );

        if (item.id !== expectedId) {
          addIssue(issues, {
            code: "P02_B25_MICRO_ID_INVALID",
            severity: "error",

            message:
              "Micro-retorno fora do padrão de IDs.",

            path: `microReturns.${item.id}`,
            observed: item.id,
            expected: expectedId,
          });
        }

        validateCompanionContent(
          item.copy,
          `microReturns.${item.id}.copy`,
          issues,
        );

        validateLanguage(
          item.copy.text,
          `microReturns.${item.id}.copy.text`,
          issues,
        );

        if (
          item.triggerSignalIds.length === 0
        ) {
          addIssue(issues, {
            code: "P02_B25_MICRO_WITHOUT_SIGNAL",
            severity: "error",

            message:
              "Micro-retorno sem sinal de ativação.",

            path:
              `microReturns.${item.id}.triggerSignalIds`,
          });
        }

        for (
          const signalId
          of item.triggerSignalIds
        ) {
          if (
            !registeredSignals.has(signalId)
          ) {
            addIssue(issues, {
              code: "P02_B25_MICRO_SIGNAL_INVALID",
              severity: "error",

              message:
                "Micro-retorno referencia sinal não registrado.",

              path:
                `microReturns.${item.id}.triggerSignalIds`,

              observed: signalId,
            });
          }
        }
      },
    );
  }
}

function expectExactFunctions(
  phase: ReflectionPhase,
  functions: readonly string[],
  issues: Pillar02Block25Issue[],
): void {
  for (
    const expectedFunction
    of EXPECTED_MICRO_FUNCTIONS
  ) {
    if (
      !functions.includes(
        expectedFunction,
      )
    ) {
      addIssue(issues, {
        code: "P02_B25_MICRO_FUNCTION_MISSING",
        severity: "error",

        message:
          `Função ${expectedFunction} ausente na fase ${phase}.`,

        path:
          `microReturns.${phase}`,
      });
    }
  }

  if (
    new Set(functions).size !==
    functions.length
  ) {
    addIssue(issues, {
      code: "P02_B25_MICRO_FUNCTION_DUPLICATE",
      severity: "error",

      message:
        `A fase ${phase} possui funções de micro-retorno duplicadas.`,

      path:
        `microReturns.${phase}`,
    });
  }
}

function validateJournals(
  journals:
    readonly PillarJournal[],
  issues: Pillar02Block25Issue[],
): void {
  if (journals.length !== 6) {
    addIssue(issues, {
      code: "P02_B25_JOURNAL_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de seis diários.",

      observed: journals.length,
      expected: 6,
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseItems =
      journals
        .filter(
          (item) =>
            item.phase === phase,
        )
        .sort(
          (left, right) =>
            left.order - right.order,
        );

    if (phaseItems.length !== 2) {
      addIssue(issues, {
        code: "P02_B25_PHASE_JOURNAL_COUNT",
        severity: "error",

        message:
          `A fase ${phase} precisa de dois diários.`,

        observed: phaseItems.length,
        expected: 2,
      });
    }

    phaseItems.forEach(
      (journal, index) => {
        const expectedId =
          createResourceId(
            2,
            "journal",
            phase,
            index + 1,
          );

        if (journal.id !== expectedId) {
          addIssue(issues, {
            code: "P02_B25_JOURNAL_ID_INVALID",
            severity: "error",

            message:
              "Diário fora do padrão de IDs.",

            observed: journal.id,
            expected: expectedId,
          });
        }

        validateCompanionContent(
          journal.title,
          `journals.${journal.id}.title`,
          issues,
        );

        validateCompanionContent(
          journal.prompt,
          `journals.${journal.id}.prompt`,
          issues,
        );

        validateLanguage(
          `${journal.title.text} ${journal.prompt.text}`,
          `journals.${journal.id}`,
          issues,
        );

        if (
          journal.visibility !== "private" ||
          journal.exportAllowed !== false ||
          journal.telemetryContentAllowed !== false
        ) {
          addIssue(issues, {
            code: "P02_B25_JOURNAL_PRIVACY_INVALID",
            severity: "error",

            message:
              "Diário viola o contrato de privacidade.",

            path:
              `journals.${journal.id}`,
          });
        }
      },
    );
  }
}

function validateLetters(
  letters:
    readonly PillarLetter[],
  issues: Pillar02Block25Issue[],
): void {
  if (letters.length !== 3) {
    addIssue(issues, {
      code: "P02_B25_LETTER_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de três cartas.",

      observed: letters.length,
      expected: 3,
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseItems =
      letters.filter(
        (item) =>
          item.phase === phase,
      );

    if (phaseItems.length !== 1) {
      addIssue(issues, {
        code: "P02_B25_PHASE_LETTER_COUNT",
        severity: "error",

        message:
          `A fase ${phase} precisa de uma carta.`,

        observed: phaseItems.length,
        expected: 1,
      });

      continue;
    }

    const letter = phaseItems[0];

    const expectedId =
      createResourceId(
        2,
        "letter",
        phase,
        1,
      );

    if (letter.id !== expectedId) {
      addIssue(issues, {
        code: "P02_B25_LETTER_ID_INVALID",
        severity: "error",

        message:
          "Carta fora do padrão de IDs.",

        observed: letter.id,
        expected: expectedId,
      });
    }

    validateCompanionContent(
      letter.title,
      `letters.${letter.id}.title`,
      issues,
    );

    validateCompanionContent(
      letter.prompt,
      `letters.${letter.id}.prompt`,
      issues,
    );

    validateLanguage(
      `${letter.title.text} ${letter.prompt.text}`,
      `letters.${letter.id}`,
      issues,
    );

    if (
      letter.visibility !== "private" ||
      letter.sendAllowed !== false ||
      letter.telemetryContentAllowed !== false
    ) {
      addIssue(issues, {
        code: "P02_B25_LETTER_PRIVACY_INVALID",
        severity: "error",

        message:
          "Carta viola o contrato de privacidade ou permite envio.",

        path:
          `letters.${letter.id}`,
      });
    }

    if (
      !normalize(
        letter.prompt.text,
      ).includes(
        normalize(
          "não deve ser enviada",
        ),
      )
    ) {
      addIssue(issues, {
        code: "P02_B25_LETTER_NO_SEND_COPY_MISSING",
        severity: "warning",

        message:
          "A instrução textual de não envio não está explícita.",

        path:
          `letters.${letter.id}.prompt`,
      });
    }
  }
}

function validateAnchors(
  anchors:
    readonly PillarAnchor[],
  issues: Pillar02Block25Issue[],
): void {
  if (anchors.length !== 3) {
    addIssue(issues, {
      code: "P02_B25_ANCHOR_COUNT",
      severity: "error",

      message:
        "O Pilar II precisa de três âncoras.",

      observed: anchors.length,
      expected: 3,
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseItems =
      anchors.filter(
        (item) =>
          item.phase === phase,
      );

    if (phaseItems.length !== 1) {
      addIssue(issues, {
        code: "P02_B25_PHASE_ANCHOR_COUNT",
        severity: "error",

        message:
          `A fase ${phase} precisa de uma âncora.`,

        observed: phaseItems.length,
        expected: 1,
      });

      continue;
    }

    const anchor =
      phaseItems[0];

    const expectedId =
      createResourceId(
        2,
        "anchor",
        phase,
        1,
      );

    if (anchor.id !== expectedId) {
      addIssue(issues, {
        code: "P02_B25_ANCHOR_ID_INVALID",
        severity: "error",

        message:
          "Âncora fora do padrão de IDs.",

        observed: anchor.id,
        expected: expectedId,
      });
    }

    validateCompanionContent(
      anchor.title,
      `anchors.${anchor.id}.title`,
      issues,
    );

    validateCompanionContent(
      anchor.introduction,
      `anchors.${anchor.id}.introduction`,
      issues,
    );

    if (anchor.steps.length !== 4) {
      addIssue(issues, {
        code: "P02_B25_ANCHOR_STEP_COUNT",
        severity: "error",

        message:
          "Cada âncora do Pilar II precisa de quatro passos.",

        path:
          `anchors.${anchor.id}.steps`,

        observed:
          anchor.steps.length,

        expected: 4,
      });
    }

    anchor.steps.forEach(
      (step, index) => {
        if (
          step.order !==
          index + 1
        ) {
          addIssue(issues, {
            code: "P02_B25_ANCHOR_STEP_ORDER_INVALID",
            severity: "error",

            message:
              "Ordem dos passos da âncora inválida.",

            path:
              `anchors.${anchor.id}.steps[${index}]`,

            observed:
              step.order,

            expected:
              index + 1,
          });
        }

        validateCompanionContent(
          step.copy,
          `anchors.${anchor.id}.steps[${index}].copy`,
          issues,
        );

        validateLanguage(
          step.copy.text,
          `anchors.${anchor.id}.steps[${index}].copy.text`,
          issues,
        );
      },
    );

    if (
      anchor.interruptionAllowed !== true ||
      anchor.completionRequired !== false ||
      anchor.replacesCanonicalAnchor !== false
    ) {
      addIssue(issues, {
        code: "P02_B25_ANCHOR_BEHAVIOR_INVALID",
        severity: "error",

        message:
          "Âncora complementar exige conclusão ou substitui a âncora canônica.",

        path:
          `anchors.${anchor.id}`,
      });
    }
  }
}

function validateConnectedRules(
  rules:
    readonly PillarPredictiveRule[],
  issues: Pillar02Block25Issue[],
): void {
  if (rules.length !== 9) {
    addIssue(issues, {
      code: "P02_B25_RULE_COUNT",
      severity: "error",

      message:
        "O pacote precisa preservar nove regras preditivas.",

      observed: rules.length,
      expected: 9,
    });
  }

  const connectedRules =
    rules.filter(
      (rule) =>
        rule.effect.resourceId !==
        undefined,
    );

  if (connectedRules.length !== 3) {
    addIssue(issues, {
      code: "P02_B25_CONNECTED_RULE_COUNT",
      severity: "error",

      message:
        "Exatamente três regras devem possuir resourceId neste bloco.",

      observed:
        connectedRules.length,

      expected: 3,
    });
  }

  for (const rule of connectedRules) {
    const resourceId =
      rule.effect.resourceId;

    if (!resourceId) {
      continue;
    }

    const resourceKind =
      PILLAR_02_RESOURCE_KIND_BY_ID
        .get(resourceId);

    if (!resourceKind) {
      addIssue(issues, {
        code: "P02_B25_RULE_RESOURCE_NOT_FOUND",
        severity: "error",

        message:
          "Regra preditiva referencia recurso inexistente.",

        path:
          `predictiveRules.${rule.id}.effect.resourceId`,

        observed: resourceId,
      });

      continue;
    }

    const expectedKind:
      string | undefined = (
      {
      micro_return:
        "micro_return",

      journal:
        "journal",

      letter:
        "letter",

      anchor:
        "anchor",
      } as Record<string, string>
    )[rule.effect.intervention];

    if (
      expectedKind !== undefined &&
      resourceKind !== expectedKind
    ) {
      addIssue(issues, {
        code: "P02_B25_RULE_RESOURCE_TYPE_MISMATCH",
        severity: "error",

        message:
          "O tipo do recurso não corresponde à intervenção da regra.",

        path:
          `predictiveRules.${rule.id}.effect`,

        observed: {
          intervention:
            rule.effect.intervention,

          resourceKind,
        },

        expected:
          expectedKind,
      });
    }
  }
}

export function validatePillar02Block25(input: {
  microReturns:
    readonly PillarMicroReturn[];

  journals:
    readonly PillarJournal[];

  letters:
    readonly PillarLetter[];

  anchors:
    readonly PillarAnchor[];

  predictiveRules:
    readonly PillarPredictiveRule[];
}): Pillar02Block25Validation {
  const issues:
    Pillar02Block25Issue[] = [];

  validateIds(
    [
      ...input.microReturns.map(
        (item) => item.id,
      ),

      ...input.journals.map(
        (item) => item.id,
      ),

      ...input.letters.map(
        (item) => item.id,
      ),

      ...input.anchors.map(
        (item) => item.id,
      ),
    ],
    issues,
  );

  validateMicroReturns(
    input.microReturns,
    issues,
  );

  validateJournals(
    input.journals,
    issues,
  );

  validateLetters(
    input.letters,
    issues,
  );

  validateAnchors(
    input.anchors,
    issues,
  );

  validateConnectedRules(
    input.predictiveRules,
    issues,
  );

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
    valid:
      errors.length === 0,
    errors,
    warnings,
  };
}
