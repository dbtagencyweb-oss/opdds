import type { PillarId } from "../../core";
import type {
  ExperienceTarget,
  IntermediateExperienceCounts,
} from "../experience.contracts";

export const INTERLUDE_FENDA_ID = "interlude_fenda" as const;

export const INTERLUDE_FENDA_PREVIOUS_PILLAR_ID =
  "pillar_02_familia" satisfies PillarId;

export const INTERLUDE_FENDA_NEXT_PILLAR_ID =
  "pillar_03_luto" satisfies PillarId;

export type InterludeFendaId = typeof INTERLUDE_FENDA_ID;

export const INTERLUDE_FENDA_TARGET = Object.freeze({
  kind: "interlude",
  experienceId: INTERLUDE_FENDA_ID,
  nextPillarId: INTERLUDE_FENDA_NEXT_PILLAR_ID,
} satisfies ExperienceTarget);

export const INTERLUDE_FENDA_EXIT_TARGET = Object.freeze({
  kind: "pillar",
  pillarId: INTERLUDE_FENDA_NEXT_PILLAR_ID,
} satisfies ExperienceTarget);

export const INTERLUDE_FENDA_EXPECTED_COUNTS =
  Object.freeze({
    canonicalSections: 10,
    signals: 6,
    invitations: 3,
    actionChoices: 9,
    microReturns: 6,
    predictiveRules: 6,
    transitions: 7,
    closureRoutes: 6,
  } satisfies IntermediateExperienceCounts);

export type InterludeFendaClosureStatus =
  | "visited"
  | "completed"
  | "completed_without_reflection";

export interface InterludeFendaClosureInput {
  readonly status: InterludeFendaClosureStatus;
  readonly selectedRoute:
    | "canonical_support_letter"
    | "canonical_anchor"
    | "canonical_closing"
    | "pause"
    | "return_to_book"
    | "continue_to_pillar_03";
}

export interface InterludeFendaClosureResult {
  readonly experienceId: InterludeFendaId;
  readonly status: InterludeFendaClosureStatus;
  readonly reflectionComplete: boolean;
  readonly closureComplete: boolean;
  readonly complete: boolean;
  readonly synthesisGenerated: false;
  readonly selectedRoute: string;
  readonly blocksReading: false;
}

export interface InterludeFendaValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface InterludeFendaValidationReport {
  readonly valid: boolean;
  readonly errors: readonly InterludeFendaValidationIssue[];
  readonly warnings: readonly InterludeFendaValidationIssue[];
}

export interface InterludeFendaPublicationManifest {
  readonly schemaVersion: "igentmind.experience.manifest.v1";
  readonly experienceId: InterludeFendaId;
  readonly kind: "interlude";
  readonly previousPillarId: typeof INTERLUDE_FENDA_PREVIOUS_PILLAR_ID;
  readonly nextPillarId: typeof INTERLUDE_FENDA_NEXT_PILLAR_ID;
  readonly counts: IntermediateExperienceCounts;
  readonly readingBlocked: false;
  readonly countsAsPillar: false;
  readonly includesReaderPrivateContent: false;
}

export interface InterludeFendaPublicationArtifact {
  readonly schemaVersion: "igentmind.experience.publication.v1";
  readonly experienceId: InterludeFendaId;
  readonly mode: "publication";
  readonly manifest: InterludeFendaPublicationManifest;
  readonly validation: InterludeFendaValidationReport;
  readonly checksum: string;
  readonly readiness: boolean;
}
