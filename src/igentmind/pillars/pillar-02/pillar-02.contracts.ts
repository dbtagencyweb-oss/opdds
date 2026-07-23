// src/igentmind/pillars/pillar-02/pillar-02.contracts.ts

import type {
  PillarId,
  ReflectionPhase,
  ScaleName,
} from "../../core";

import type {
  EditorialContent,
  PillarCanonicalSection,
  PillarIdentity,
  PillarPredictiveRule,
  PillarSignalDefinition,
} from "../template";

export const PILLAR_02_EXPERIENCE_IDS = {
  pillar: "pillar_02_familia",
  interlude: "interlude_fenda",
  nextPillar: "pillar_03_luto",
} as const;

export type Pillar02ExperienceId =
  (typeof PILLAR_02_EXPERIENCE_IDS)[keyof typeof PILLAR_02_EXPERIENCE_IDS];

export interface Pillar02EditorialBoundary {
  id: string;
  rule: string;
  reason: string;
}

export interface Pillar02PhaseDossier {
  phase: ReflectionPhase;

  canonicalSectionId: string;
  canonicalSectionTitle: string;

  purpose: string;
  centralDistinction: string;

  coreTensions: readonly string[];
  expectedMovement: string;

  questionIds: readonly string[];
  signalIds: readonly string[];

  prohibitedDirections: readonly string[];
}

export interface Pillar02QuestionBlueprint {
  id: string;
  phase: ReflectionPhase;
  order: 1 | 2 | 3;

  prompt: EditorialContent;

  detectsSignalIds: readonly string[];

  primaryScale: ScaleName;
  secondaryScale?: ScaleName;

  intention: string;

  responseDirection: {
    minimal: string;
    standard: string;
    deep: string;
  };

  guardrails: readonly string[];

  allowOpenAnswer: true;
  closedOptionConfidence: "low";
  createsPatternAlone: false;
}

export interface Pillar02EditorialDossier {
  identity: PillarIdentity;

  internalBookHeading: EditorialContent;

  canonicalSections:
    readonly PillarCanonicalSection[];

  editorialThesis: string;

  coreMovement: {
    consciousness: string;
    judgment: string;
    presence: string;
  };

  boundaries:
    readonly Pillar02EditorialBoundary[];

  phases:
    Readonly<
      Record<
        ReflectionPhase,
        Pillar02PhaseDossier
      >
    >;

  continuation: {
    immediateExperienceId:
      typeof PILLAR_02_EXPERIENCE_IDS.interlude;

    nextPillarId:
      typeof PILLAR_02_EXPERIENCE_IDS.nextPillar;

    bypassInterludeAllowed: false;
  };
}

export interface Pillar02Block23Artifact {
  schemaVersion:
    "igentmind-pillar-02-block-23/1.0";

  status: "editorial_blueprint";

  dossier: Pillar02EditorialDossier;

  signals:
    readonly PillarSignalDefinition[];

  questions:
    readonly Pillar02QuestionBlueprint[];

  predictiveRules:
    readonly PillarPredictiveRule[];

  counts: {
    canonicalSections: 10;
    signals: 9;
    questions: 9;
    predictiveRules: 9;
  };

  readyForQuestionExpansion: boolean;
}

export interface Pillar02ValidationIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
  observed?: unknown;
  expected?: unknown;
}

export interface Pillar02ValidationReport {
  valid: boolean;

  errors:
    readonly Pillar02ValidationIssue[];

  warnings:
    readonly Pillar02ValidationIssue[];
}

export type Pillar02PillarId =
  Extract<
    PillarId,
    "pillar_02_familia"
  >;
