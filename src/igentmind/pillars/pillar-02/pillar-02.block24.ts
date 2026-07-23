// src/igentmind/pillars/pillar-02/pillar-02.block24.ts

import type {
  Pillar02Block24Artifact,
} from "./pillar-02.block24.contracts";

import {
  PILLAR_02_OPTIONS,
  PILLAR_02_QUESTIONS,
} from "./pillar-02.questions";

import {
  validatePillar02Block24,
} from "./pillar-02.block24.validation";

export const PILLAR_02_BLOCK_24_VALIDATION =
  validatePillar02Block24(
    PILLAR_02_QUESTIONS,
  );

export const PILLAR_02_BLOCK_24:
  Pillar02Block24Artifact = {
    schemaVersion:
      "igentmind-pillar-02-block-24/1.0",

    pillarId:
      "pillar_02_familia",

    status:
      "question_package_complete",

    questions:
      PILLAR_02_QUESTIONS,

    counts: {
      phases: 3,
      questions: 9,
      questionsPerPhase: 3,
      options: 54,
      optionsPerQuestion: 6,
      responseVariantsPerOption: 3,
      openResponseVariantsPerQuestion: 3,
    },

    origins: {
      bookExactPrompts:
        PILLAR_02_QUESTIONS.filter(
          (question) =>
            question.prompt
              .editorialOrigin ===
            "book_exact",
        ).length as 3,

      companionPrompts:
        PILLAR_02_QUESTIONS.filter(
          (question) =>
            question.prompt
              .editorialOrigin ===
            "igent_companion",
        ).length as 6,

      companionOptions:
        PILLAR_02_OPTIONS.filter(
          (option) =>
            option.label
              .editorialOrigin ===
            "igent_companion",
        ).length as 54,
    },

    validation:
      PILLAR_02_BLOCK_24_VALIDATION,

    readyForResources:
      PILLAR_02_BLOCK_24_VALIDATION.valid,
  };

if (
  !PILLAR_02_BLOCK_24_VALIDATION.valid
) {
  throw new Error(
    [
      "Falha na validação do Bloco 24.",

      ...PILLAR_02_BLOCK_24_VALIDATION
        .errors
        .map(
          (error) =>
            `${error.code}: ${error.message}`,
        ),
    ].join("\n"),
  );
}
