// src/igentmind/pillars/pillar-02/pillar-02.block25.contracts.ts

import type {
  PillarAnchor,
  PillarJournal,
  PillarLetter,
  PillarMicroReturn,
  PillarPredictiveRule,
} from "../template";

export interface Pillar02Block25Issue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
  observed?: unknown;
  expected?: unknown;
}

export interface Pillar02Block25Validation {
  valid: boolean;

  errors:
    readonly Pillar02Block25Issue[];

  warnings:
    readonly Pillar02Block25Issue[];
}

export interface Pillar02Block25Artifact {
  schemaVersion:
    "igentmind-pillar-02-block-25/1.0";

  pillarId:
    "pillar_02_familia";

  status:
    "resource_package_complete";

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

  counts: {
    microReturns: 18;
    microReturnsPerPhase: 6;

    journals: 6;
    journalsPerPhase: 2;

    letters: 3;
    lettersPerPhase: 1;

    anchors: 3;
    anchorsPerPhase: 1;

    anchorSteps: 12;

    predictiveRules: 9;
    connectedRules: 3;
  };

  privacy: {
    privateJournals: 6;
    nonExportableJournals: 6;
    privateLetters: 3;
    nonSendableLetters: 3;
    telemetryContentAllowed: 0;
  };

  validation:
    Pillar02Block25Validation;

  readyForClosureAndTransitions:
    boolean;
}
