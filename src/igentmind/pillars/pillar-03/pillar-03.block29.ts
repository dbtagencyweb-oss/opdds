import {
  buildPillar03Block29Artifact,
  createPillar03Block29Manifest,
} from "./pillar-03.block29.artifact";

import {
  getPillar03Block29Counts,
  validatePillar03Block29,
} from "./pillar-03.block29.validation";

import {
  PILLAR_03_OPEN_ANSWER_INDEX,
  PILLAR_03_OPTION_INDEX,
  PILLAR_03_QUESTION_INDEX,
  PILLAR_03_QUESTIONS,
} from "./pillar-03.questions";

export const PILLAR_03_BLOCK_29_VALIDATION =
  validatePillar03Block29();

export const PILLAR_03_BLOCK_29_ARTIFACT =
  buildPillar03Block29Artifact(
    PILLAR_03_BLOCK_29_VALIDATION,
  );

export const PILLAR_03_BLOCK_29 =
  Object.freeze({
    stage: "question_response_bank",

    questions: PILLAR_03_QUESTIONS,

    indexes: Object.freeze({
      questions:
        PILLAR_03_QUESTION_INDEX,
      options:
        PILLAR_03_OPTION_INDEX,
      openAnswers:
        PILLAR_03_OPEN_ANSWER_INDEX,
    }),

    counts:
      getPillar03Block29Counts(),

    manifest:
      createPillar03Block29Manifest(),

    validation:
      PILLAR_03_BLOCK_29_VALIDATION,

    artifact:
      PILLAR_03_BLOCK_29_ARTIFACT,

    questionBankReady:
      PILLAR_03_BLOCK_29_ARTIFACT
        .questionBankReady,

    publicationReady: false,
    nextRequiredBlock: 30,
  } as const);

export function assertPillar03Block29Ready(): void {
  if (
    !PILLAR_03_BLOCK_29_ARTIFACT
      .questionBankReady
  ) {
    const details =
      PILLAR_03_BLOCK_29_VALIDATION.errors
        .map(
          (current) =>
            `${current.code}: ${current.message}`,
        )
        .join("\n");

    throw new Error(
      `O banco de perguntas do Pilar III não está pronto.\n${details}`,
    );
  }
}
