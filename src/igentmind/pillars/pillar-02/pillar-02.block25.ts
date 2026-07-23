// src/igentmind/pillars/pillar-02/pillar-02.block25.ts

import type {
  Pillar02Block25Artifact,
} from "./pillar-02.block25.contracts";

import {
  PILLAR_02_ANCHORS,
} from "./pillar-02.anchors";

import {
  PILLAR_02_JOURNALS,
} from "./pillar-02.journals";

import {
  PILLAR_02_LETTERS,
} from "./pillar-02.letters";

import {
  PILLAR_02_MICRO_RETURNS,
} from "./pillar-02.micro-returns";

import {
  PILLAR_02_PREDICTIVE_RULES_CONNECTED,
} from "./pillar-02.predictive-rules.connected";

import {
  validatePillar02Block25,
} from "./pillar-02.block25.validation";

export const PILLAR_02_BLOCK_25_VALIDATION =
  validatePillar02Block25({
    microReturns:
      PILLAR_02_MICRO_RETURNS,

    journals:
      PILLAR_02_JOURNALS,

    letters:
      PILLAR_02_LETTERS,

    anchors:
      PILLAR_02_ANCHORS,

    predictiveRules:
      PILLAR_02_PREDICTIVE_RULES_CONNECTED,
  });

const anchorStepCount =
  PILLAR_02_ANCHORS.reduce(
    (total, anchor) =>
      total +
      anchor.steps.length,
    0,
  );

const connectedRuleCount =
  PILLAR_02_PREDICTIVE_RULES_CONNECTED
    .filter(
      (rule) =>
        rule.effect.resourceId !==
        undefined,
    )
    .length;

export const PILLAR_02_BLOCK_25:
  Pillar02Block25Artifact = {
    schemaVersion:
      "igentmind-pillar-02-block-25/1.0",

    pillarId:
      "pillar_02_familia",

    status:
      "resource_package_complete",

    microReturns:
      PILLAR_02_MICRO_RETURNS,

    journals:
      PILLAR_02_JOURNALS,

    letters:
      PILLAR_02_LETTERS,

    anchors:
      PILLAR_02_ANCHORS,

    predictiveRules:
      PILLAR_02_PREDICTIVE_RULES_CONNECTED,

    counts: {
      microReturns:
        PILLAR_02_MICRO_RETURNS
          .length as 18,

      microReturnsPerPhase: 6,

      journals:
        PILLAR_02_JOURNALS
          .length as 6,

      journalsPerPhase: 2,

      letters:
        PILLAR_02_LETTERS
          .length as 3,

      lettersPerPhase: 1,

      anchors:
        PILLAR_02_ANCHORS
          .length as 3,

      anchorsPerPhase: 1,

      anchorSteps:
        anchorStepCount as 12,

      predictiveRules:
        PILLAR_02_PREDICTIVE_RULES_CONNECTED
          .length as 9,

      connectedRules:
        connectedRuleCount as 3,
    },

    privacy: {
      privateJournals:
        PILLAR_02_JOURNALS
          .filter(
            (journal) =>
              journal.visibility ===
              "private",
          )
          .length as 6,

      nonExportableJournals:
        PILLAR_02_JOURNALS
          .filter(
            (journal) =>
              journal.exportAllowed ===
              false,
          )
          .length as 6,

      privateLetters:
        PILLAR_02_LETTERS
          .filter(
            (letter) =>
              letter.visibility ===
              "private",
          )
          .length as 3,

      nonSendableLetters:
        PILLAR_02_LETTERS
          .filter(
            (letter) =>
              letter.sendAllowed ===
              false,
          )
          .length as 3,

      telemetryContentAllowed: 0,
    },

    validation:
      PILLAR_02_BLOCK_25_VALIDATION,

    readyForClosureAndTransitions:
      PILLAR_02_BLOCK_25_VALIDATION
        .valid,
  };

if (
  !PILLAR_02_BLOCK_25_VALIDATION.valid
) {
  throw new Error(
    [
      "Falha na validação do Bloco 25.",

      ...PILLAR_02_BLOCK_25_VALIDATION
        .errors
        .map(
          (error) =>
            `${error.code}: ${error.message}`,
        ),
    ].join("\n"),
  );
}
