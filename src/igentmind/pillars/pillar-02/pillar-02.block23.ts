// src/igentmind/pillars/pillar-02/pillar-02.block23.ts

import type {
  Pillar02Block23Artifact,
} from "./pillar-02.contracts";

import {
  PILLAR_02_EDITORIAL_DOSSIER,
} from "./pillar-02.editorial";

import {
  PILLAR_02_PREDICTIVE_RULES,
} from "./pillar-02.predictive-rules";

import {
  PILLAR_02_QUESTION_BLUEPRINTS,
} from "./pillar-02.questions-base";

import {
  PILLAR_02_SIGNALS,
} from "./pillar-02.signals";

import {
  validatePillar02Block23,
} from "./pillar-02.validation";

export const PILLAR_02_BLOCK_23:
  Pillar02Block23Artifact = {
    schemaVersion:
      "igentmind-pillar-02-block-23/1.0",

    status: "editorial_blueprint",

    dossier:
      PILLAR_02_EDITORIAL_DOSSIER,

    signals:
      PILLAR_02_SIGNALS,

    questions:
      PILLAR_02_QUESTION_BLUEPRINTS,

    predictiveRules:
      PILLAR_02_PREDICTIVE_RULES,

    counts: {
      canonicalSections: 10,
      signals: 9,
      questions: 9,
      predictiveRules: 9,
    },

    readyForQuestionExpansion: true,
  };

export const PILLAR_02_BLOCK_23_VALIDATION =
  validatePillar02Block23(
    PILLAR_02_BLOCK_23,
  );

if (
  !PILLAR_02_BLOCK_23_VALIDATION.valid
) {
  throw new Error(
    [
      "Falha na validação do Bloco 23.",
      ...PILLAR_02_BLOCK_23_VALIDATION
        .errors
        .map(
          (error) =>
            `${error.code}: ${error.message}`,
        ),
    ].join("\n"),
  );
}
