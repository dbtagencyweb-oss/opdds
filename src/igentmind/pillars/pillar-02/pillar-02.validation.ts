// src/igentmind/pillars/pillar-02/pillar-02.validation.ts

import {
  REFLECTION_PHASES,
} from "../../core";

import type {
  PillarPredictiveRule,
  PillarSignalDefinition,
} from "../template";

import type {
  Pillar02Block23Artifact,
  Pillar02QuestionBlueprint,
  Pillar02ValidationIssue,
  Pillar02ValidationReport,
} from "./pillar-02.contracts";

const EXPECTED_SECTION_TITLES = {
  identity: "Família",
  threshold: "Raiz",

  manifesto:
    "O primeiro lugar onde aprendemos a nos calar",

  narrative:
    "O pacto silencioso e a dívida emocional que não termina",

  consciousness:
    "Ver o contrato que nunca foi assinado",

  judgment:
    "Quando a moral familiar vira prisão interna",

  presence:
    "Ficar onde antes você se retraía",

  support_letter:
    "Ficar onde antes você se retraía",

  anchor:
    "O exercício da devolução silenciosa",

  closing:
    "O que te formou não precisa te governar",
} as const;

const FORBIDDEN_COMPANION_DIRECTIONS = [
  "corte sua família",
  "abandone sua família",
  "rompa com sua família",
  "sua família é o problema",
  "sua família é tóxica",
  "seus pais são culpados",
  "você precisa confrontar",
  "você deve perdoar",
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
  issues: Pillar02ValidationIssue[],
  issue: Pillar02ValidationIssue,
): void {
  issues.push(issue);
}

function validateQuestion(
  question: Pillar02QuestionBlueprint,
  signalIds: Set<string>,
  issues: Pillar02ValidationIssue[],
): void {
  if (
    !question.id.startsWith(
      `p02_${question.phase}_q0`,
    )
  ) {
    addIssue(issues, {
      code: "P02_QUESTION_ID_INVALID",
      severity: "error",
      message:
        "A pergunta não usa o namespace estável esperado.",
      path: `questions.${question.id}`,
      observed: question.id,
    });
  }

  if (
    question.prompt.text
      .split("?")
      .length - 1 !== 1
  ) {
    addIssue(issues, {
      code: "P02_QUESTION_FORMAT_INVALID",
      severity: "error",
      message:
        "Cada pergunta-base precisa conter uma única pergunta visível.",
      path:
        `questions.${question.id}.prompt`,
      observed: question.prompt.text,
    });
  }

  if (
    question.closedOptionConfidence !==
      "low" ||
    question.createsPatternAlone !== false ||
    question.allowOpenAnswer !== true
  ) {
    addIssue(issues, {
      code: "P02_INTERPRETATION_CONTRACT_INVALID",
      severity: "error",
      message:
        "A pergunta viola o contrato de confiança, padrão ou resposta aberta.",
      path: `questions.${question.id}`,
    });
  }

  for (
    const signalId
    of question.detectsSignalIds
  ) {
    if (!signalIds.has(signalId)) {
      addIssue(issues, {
        code: "P02_UNREGISTERED_SIGNAL",
        severity: "error",
        message:
          `Sinal não registrado: ${signalId}.`,
        path:
          `questions.${question.id}.detectsSignalIds`,
      });
    }
  }

  const companionText = [
    question.prompt.text,
    question.intention,
    question.responseDirection.minimal,
    question.responseDirection.standard,
    question.responseDirection.deep,
    ...question.guardrails,
  ]
    .map(normalize)
    .join(" ");

  for (
    const forbiddenDirection
    of FORBIDDEN_COMPANION_DIRECTIONS
  ) {
    if (
      companionText.includes(
        normalize(forbiddenDirection),
      )
    ) {
      addIssue(issues, {
        code: "P02_FORBIDDEN_DIRECTION",
        severity: "error",
        message:
          "A pergunta ou sua direção editorial prescreve acusação, ruptura ou decisão externa.",
        path: `questions.${question.id}`,
        observed: forbiddenDirection,
      });
    }
  }
}

function validateRules(
  rules:
    readonly PillarPredictiveRule[],
  signalIds: Set<string>,
  issues: Pillar02ValidationIssue[],
): void {
  if (rules.length !== 9) {
    addIssue(issues, {
      code: "P02_RULE_COUNT_INVALID",
      severity: "error",
      message:
        "O Pilar II precisa de nove regras preditivas.",
      observed: rules.length,
      expected: 9,
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseRules =
      rules.filter(
        (rule) =>
          rule.phase === phase,
      );

    if (phaseRules.length !== 3) {
      addIssue(issues, {
        code: "P02_PHASE_RULE_COUNT_INVALID",
        severity: "error",
        message:
          `A fase ${phase} precisa de três regras preditivas.`,
        observed: phaseRules.length,
        expected: 3,
      });
    }
  }

  for (const rule of rules) {
    const referencedSignals = [
      ...(rule.condition.allSignalIds ?? []),
      ...(rule.condition.anySignalIds ?? []),
    ];

    for (const signalId of referencedSignals) {
      if (!signalIds.has(signalId)) {
        addIssue(issues, {
          code: "P02_RULE_SIGNAL_INVALID",
          severity: "error",
          message:
            `A regra ${rule.id} referencia um sinal inexistente.`,
          path: `predictiveRules.${rule.id}`,
          observed: signalId,
        });
      }
    }

    if (
      rule.effect.resourceId !== undefined
    ) {
      addIssue(issues, {
        code: "P02_PREMATURE_RESOURCE_REFERENCE",
        severity: "warning",
        message:
          "A regra referencia um recurso antes do Bloco 25.",
        path:
          `predictiveRules.${rule.id}.effect.resourceId`,
      });
    }
  }
}

function validateSignals(
  signals:
    readonly PillarSignalDefinition[],
  issues: Pillar02ValidationIssue[],
): Set<string> {
  const signalIds =
    new Set<string>();

  if (signals.length !== 9) {
    addIssue(issues, {
      code: "P02_SIGNAL_COUNT_INVALID",
      severity: "error",
      message:
        "O Pilar II precisa de nove sinais editoriais.",
      observed: signals.length,
      expected: 9,
    });
  }

  for (const signal of signals) {
    if (
      !signal.id.startsWith("p02_")
    ) {
      addIssue(issues, {
        code: "P02_SIGNAL_NAMESPACE_INVALID",
        severity: "error",
        message:
          "O sinal não pertence ao namespace do Pilar II.",
        path: `signals.${signal.id}`,
      });
    }

    if (signalIds.has(signal.id)) {
      addIssue(issues, {
        code: "P02_SIGNAL_DUPLICATE",
        severity: "error",
        message:
          "Sinal duplicado.",
        path: `signals.${signal.id}`,
      });
    }

    signalIds.add(signal.id);

    if (
      signal.defaultConfidence > 0.35
    ) {
      addIssue(issues, {
        code: "P02_SIGNAL_CONFIDENCE_HIGH",
        severity: "error",
        message:
          "O sinal editorial inicia com confiança excessiva.",
        path:
          `signals.${signal.id}.defaultConfidence`,
        observed:
          signal.defaultConfidence,
        expected: "<= 0.35",
      });
    }
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseSignals =
      signals.filter(
        (signal) =>
          signal.phase === phase,
      );

    if (phaseSignals.length !== 3) {
      addIssue(issues, {
        code: "P02_PHASE_SIGNAL_COUNT_INVALID",
        severity: "error",
        message:
          `A fase ${phase} precisa de três sinais.`,
        observed: phaseSignals.length,
        expected: 3,
      });
    }
  }

  return signalIds;
}

export function validatePillar02Block23(
  artifact: Pillar02Block23Artifact,
): Pillar02ValidationReport {
  const issues:
    Pillar02ValidationIssue[] = [];

  if (
    artifact.dossier.identity.id !==
      "pillar_02_familia"
  ) {
    addIssue(issues, {
      code: "P02_ID_INVALID",
      severity: "error",
      message:
        "O ID oficial do Pilar II foi alterado.",
      observed:
        artifact.dossier.identity.id,
      expected:
        "pillar_02_familia",
    });
  }

  if (
    JSON.stringify(artifact).includes(
      "pillar_01_vinculo",
    )
  ) {
    addIssue(issues, {
      code: "P02_LEGACY_ID_FOUND",
      severity: "error",
      message:
        "O pacote contém o ID legado do Pilar I.",
    });
  }

  if (
    artifact.dossier
      .canonicalSections.length !== 10
  ) {
    addIssue(issues, {
      code: "P02_SECTION_COUNT_INVALID",
      severity: "error",
      message:
        "O Pilar II precisa das dez seções canônicas.",
      observed:
        artifact.dossier
          .canonicalSections.length,
      expected: 10,
    });
  }

  for (
    const section
    of artifact.dossier
      .canonicalSections
  ) {
    const expectedTitle =
      EXPECTED_SECTION_TITLES[
        section.kind
      ];

    if (
      expectedTitle !== undefined &&
      section.title.text !==
        expectedTitle
    ) {
      addIssue(issues, {
        code: "P02_CANONICAL_TITLE_MISMATCH",
        severity: "error",
        message:
          `Título canônico alterado na seção ${section.kind}.`,
        path:
          `canonicalSections.${section.kind}.title`,
        observed:
          section.title.text,
        expected: expectedTitle,
      });
    }

    const canInvite =
      section.kind ===
        "consciousness" ||
      section.kind === "judgment" ||
      section.kind === "presence";

    if (
      section.automaticInvite ===
        "after_section" &&
      !canInvite
    ) {
      addIssue(issues, {
        code: "P02_INVITE_LOCATION_INVALID",
        severity: "error",
        message:
          "Convite automático em seção proibida.",
        path:
          `canonicalSections.${section.kind}.automaticInvite`,
      });
    }
  }

  if (
    artifact.dossier.continuation
      .immediateExperienceId !==
      "interlude_fenda"
  ) {
    addIssue(issues, {
      code: "P02_INTERLUDE_BYPASSED",
      severity: "error",
      message:
        "A continuação imediata do Pilar II precisa ser o Interlúdio Fenda.",
      observed:
        artifact.dossier.continuation
          .immediateExperienceId,
      expected: "interlude_fenda",
    });
  }

  if (
    artifact.dossier.continuation
      .bypassInterludeAllowed !== false
  ) {
    addIssue(issues, {
      code: "P02_INTERLUDE_BYPASS_ALLOWED",
      severity: "error",
      message:
        "O fluxo editorial não pode pular automaticamente o Interlúdio Fenda.",
    });
  }

  const signalIds =
    validateSignals(
      artifact.signals,
      issues,
    );

  if (artifact.questions.length !== 9) {
    addIssue(issues, {
      code: "P02_QUESTION_COUNT_INVALID",
      severity: "error",
      message:
        "O Pilar II precisa de nove perguntas-base.",
      observed:
        artifact.questions.length,
      expected: 9,
    });
  }

  for (const phase of REFLECTION_PHASES) {
    const phaseQuestions =
      artifact.questions.filter(
        (question) =>
          question.phase === phase,
      );

    if (phaseQuestions.length !== 3) {
      addIssue(issues, {
        code: "P02_PHASE_QUESTION_COUNT_INVALID",
        severity: "error",
        message:
          `A fase ${phase} precisa de três perguntas.`,
        observed:
          phaseQuestions.length,
        expected: 3,
      });
    }
  }

  for (
    const question
    of artifact.questions
  ) {
    validateQuestion(
      question,
      signalIds,
      issues,
    );
  }

  validateRules(
    artifact.predictiveRules,
    signalIds,
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
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
