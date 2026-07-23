// src/igentmind/pillars/pillar-02/pillar-02.block24.contracts.ts

import type {
  PillarQuestion,
} from "../template";

export interface Pillar02Block24Issue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
  observed?: unknown;
  expected?: unknown;
}

export interface Pillar02Block24Validation {
  valid: boolean;

  errors:
    readonly Pillar02Block24Issue[];

  warnings:
    readonly Pillar02Block24Issue[];
}

export interface Pillar02Block24Artifact {
  schemaVersion:
    "igentmind-pillar-02-block-24/1.0";

  pillarId:
    "pillar_02_familia";

  status:
    "question_package_complete";

  questions:
    readonly PillarQuestion[];

  counts: {
    phases: 3;
    questions: 9;
    questionsPerPhase: 3;
    options: 54;
    optionsPerQuestion: 6;
    responseVariantsPerOption: 3;
    openResponseVariantsPerQuestion: 3;
  };

  origins: {
    bookExactPrompts: 3;
    companionPrompts: 6;
    companionOptions: 54;
  };

  validation:
    Pillar02Block24Validation;

  readyForResources:
    boolean;
}
