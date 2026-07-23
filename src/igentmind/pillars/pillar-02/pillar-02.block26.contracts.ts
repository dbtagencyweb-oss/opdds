import type { PillarId } from "../../core";

export const PILLAR_02_ID = "pillar_02_familia" satisfies PillarId;
export const PILLAR_03_ID = "pillar_03_luto" satisfies PillarId;
export const INTERLUDE_FENDA_ID = "interlude_fenda" as const;

export type InterludeExperienceId = typeof INTERLUDE_FENDA_ID;

export type ExperienceTarget =
  | {
      readonly kind: "pillar";
      readonly pillarId: PillarId;
    }
  | {
      readonly kind: "interlude";
      readonly experienceId: InterludeExperienceId;
      readonly nextPillarId: typeof PILLAR_03_ID;
    };

export type Pillar02TransitionNode =
  | "book"
  | "consciousness"
  | "judgment"
  | "presence"
  | "closure"
  | "pause"
  | "interlude";

export type Pillar02TransitionTrigger =
  | "automatic_invite"
  | "phase_complete"
  | "pillar_complete"
  | "resume_requested";

export interface Pillar02Transition {
  readonly id: string;
  readonly from: Pillar02TransitionNode;
  readonly to: Pillar02TransitionNode;
  readonly trigger: Pillar02TransitionTrigger;
  readonly optional: true;
  readonly blocking: false;
  readonly target?: ExperienceTarget;
}

export type Pillar02ClosureStatus =
  | "partial"
  | "completed"
  | "completed_without_synthesis";

export type Pillar02ClosureRouteId =
  | "canonical_support_letter"
  | "canonical_anchor"
  | "canonical_closing"
  | "companion_closure"
  | "pause"
  | "return_to_book"
  | "interlude_fenda";

export type Pillar02ClosureRouteTarget =
  | {
      readonly kind: "canonical_section";
      readonly sectionKind: "support_letter" | "anchor" | "closing";
    }
  | {
      readonly kind: "companion_content";
      readonly contentId: "p02_companion_closure_01";
    }
  | {
      readonly kind: "reader_surface";
      readonly surface: "pause" | "book";
    }
  | ExperienceTarget;

export interface Pillar02ClosureRoute {
  readonly id: Pillar02ClosureRouteId;
  readonly label: string;
  readonly optional: true;
  readonly blocking: false;
  readonly readerChoiceRequired: true;
  readonly target: Pillar02ClosureRouteTarget;
}

export interface Pillar02ClosureDefinition {
  readonly id: "p02_closure";
  readonly pillarId: typeof PILLAR_02_ID;
  readonly synthesisOptional: true;
  readonly allowPartialClosure: true;
  readonly requireAllQuestionsAnswered: false;
  readonly emotionallyResolvedClaim: false;
  readonly blocksReading: false;
  readonly routes: readonly Pillar02ClosureRoute[];
  readonly companionContent: {
    readonly id: "p02_companion_closure_01";
    readonly editorialOrigin: "igent_companion";
    readonly generationMode: "fixed";
    readonly text: string;
  };
}

export interface CreatePillar02ClosureInput {
  readonly status: Pillar02ClosureStatus;
  readonly reflectionComplete: boolean;
  readonly selectedRoute: Pillar02ClosureRouteId;
  readonly synthesis?: string;
}

export interface Pillar02ClosureResult {
  readonly pillarId: typeof PILLAR_02_ID;
  readonly status: Pillar02ClosureStatus;
  readonly reflectionComplete: boolean;
  readonly closureComplete: boolean;
  readonly complete: boolean;
  readonly synthesisGenerated: boolean;
  readonly synthesis?: string;
  readonly selectedRoute: Pillar02ClosureRoute;
  readonly blocksReading: false;
}

export type Pillar02MemoryKind =
  | "learned_role"
  | "family_guilt"
  | "personal_boundary"
  | "belonging_practice";

export type Pillar02MemoryCandidateOrigin =
  | "manual_entry"
  | "open_answer"
  | "reader_edit"
  | "closure_summary";

export type Pillar02ForbiddenAutomaticMemoryOrigin =
  | "closed_option"
  | "journal"
  | "letter"
  | "telemetry"
  | "inference";

export type Pillar02MemoryConsent =
  | "pending"
  | "confirmed"
  | "declined";

export interface CreatePillar02MemoryCandidateInput {
  readonly candidateId: string;
  readonly kind: Pillar02MemoryKind;
  readonly text: string;
  readonly origin: Pillar02MemoryCandidateOrigin;
}

export interface Pillar02MemoryCandidate {
  readonly candidateId: string;
  readonly pillarId: typeof PILLAR_02_ID;
  readonly kind: Pillar02MemoryKind;
  readonly text: string;
  readonly origin: Pillar02MemoryCandidateOrigin;
  readonly consent: "pending";
  readonly source: "reader_proposed";
  readonly version: number;
}

export interface Pillar02DeclinedMemoryCandidate {
  readonly candidateId: string;
  readonly pillarId: typeof PILLAR_02_ID;
  readonly kind: Pillar02MemoryKind;
  readonly consent: "declined";
  readonly source: "reader_declined";
  readonly version: number;
}

export interface Pillar02ConfirmedMemory {
  readonly memoryId: string;
  readonly candidateId: string;
  readonly pillarId: typeof PILLAR_02_ID;
  readonly kind: Pillar02MemoryKind;
  readonly text: string;
  readonly normalizedFingerprint: string;
  readonly consent: "confirmed";
  readonly source: "reader_confirmed";
  readonly version: number;
}

export interface Pillar02MemoryStore {
  readonly memories: readonly Pillar02ConfirmedMemory[];
}

export interface Pillar02MemoryTelemetry {
  readonly event: "memory_confirmed" | "memory_declined" | "memory_recalled";
  readonly pillarId: typeof PILLAR_02_ID;
  readonly memoryId?: string;
  readonly candidateId?: string;
  readonly kind: Pillar02MemoryKind;
  readonly includesPrivateContent: false;
}

export interface Pillar02PackageCounts {
  readonly canonicalSections: number;
  readonly signals: number;
  readonly questions: number;
  readonly options: number;
  readonly microReturns: number;
  readonly journals: number;
  readonly letters: number;
  readonly anchors: number;
  readonly predictiveRules: number;
  readonly transitions: number;
}

export type Block26ValidationSeverity = "error" | "warning";

export interface Block26ValidationIssue {
  readonly code: string;
  readonly severity: Block26ValidationSeverity;
  readonly message: string;
  readonly path?: string;
}

export interface Block26ValidationReport {
  readonly valid: boolean;
  readonly errors: readonly Block26ValidationIssue[];
  readonly warnings: readonly Block26ValidationIssue[];
}

export interface Pillar02PublicationManifest {
  readonly schemaVersion: "igentmind.pillar.manifest.v1";
  readonly pillarId: typeof PILLAR_02_ID;
  readonly mode: "publication";
  readonly immediateContinuation: {
    readonly experienceId: typeof INTERLUDE_FENDA_ID;
    readonly nextPillarId: typeof PILLAR_03_ID;
  };
  readonly counts: Pillar02PackageCounts;
  readonly readingBlocked: false;
  readonly includesReaderPrivateContent: false;
}

export interface Pillar02PublicationArtifact {
  readonly schemaVersion: "igentmind.pillar.publication.v1";
  readonly pillarId: typeof PILLAR_02_ID;
  readonly mode: "publication";
  readonly manifest: Pillar02PublicationManifest;
  readonly validation: Block26ValidationReport;
  readonly checksum: string;
  readonly readiness: boolean;
}
