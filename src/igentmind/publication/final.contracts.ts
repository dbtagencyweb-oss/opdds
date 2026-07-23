import type {
  EditorialOrigin,
  GenerationMode,
  PillarId,
  ReflectionPhase,
  ResponseDepth,
} from "../core";

export type FinalSemanticPosition =
  | "recognition"
  | "minimization"
  | "defense"
  | "ambivalence"
  | "desire"
  | "uncertainty";

export type FinalMicroReturnFunction =
  | "recognition"
  | "contradiction"
  | "protection"
  | "cost"
  | "permission"
  | "presence";

export interface FinalCanonicalSectionSpec {
  readonly order: number;
  readonly kind: string;
  readonly title: string;
  readonly pages: string;
}

export interface FinalPillarMasterSpec {
  readonly ordinal: number;
  readonly id: PillarId;
  readonly internalTitle: string;
  readonly subtitle: string;
  readonly opening: string;
  readonly threshold: string;
  readonly thesis: string;
  readonly centralMovement: string;
  readonly nextExperience: string;
  readonly canonicalException?: string;
  readonly canonicalSections:
    readonly FinalCanonicalSectionSpec[];
  readonly signals: Readonly<
    Record<ReflectionPhase, readonly string[]>
  >;
  readonly questions: Readonly<
    Record<ReflectionPhase, readonly string[]>
  >;
  readonly journals: readonly string[];
  readonly letters: readonly string[];
  readonly anchors: readonly string[];
  readonly editorialLimits: readonly string[];
}

export interface FinalGeneratedQuestionOption {
  readonly id: string;
  readonly semanticPosition: FinalSemanticPosition;
  readonly visibleText: string;
  readonly interpretationConfidence: "low";
  readonly createsPatternAlone: false;
  readonly privateContentInTelemetry: false;
  readonly responses: Readonly<
    Record<ResponseDepth, readonly string[]>
  >;
}

export interface FinalGeneratedQuestion {
  readonly id: string;
  readonly phase: ReflectionPhase;
  readonly order: number;
  readonly prompt: string;
  readonly oneQuestionPerTurn: true;
  readonly optional: true;
  readonly blocksReading: false;
  readonly options:
    readonly FinalGeneratedQuestionOption[];
  readonly openAnswer: {
    readonly id: string;
    readonly enabled: true;
    readonly priority:
      "higher_than_closed_option";
    readonly telemetryContentAllowed: false;
    readonly memoryRequiresConsent: true;
  };
}

export interface FinalComplementaryResource {
  readonly id: string;
  readonly kind:
    | "micro_return"
    | "journal"
    | "letter"
    | "anchor";
  readonly phase: ReflectionPhase;
  readonly title?: string;
  readonly text: string;
  readonly private: boolean;
  readonly sendAllowed: false;
  readonly telemetryContentAllowed: false;
  readonly interruptionAllowed?: true;
  readonly replacesCanonicalContent: false;
  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";
}

export interface FinalPredictiveRule {
  readonly id: string;
  readonly phase: ReflectionPhase;
  readonly family:
    | "deepening"
    | "protection"
    | "integration";
  readonly signalId: string;
  readonly resourceId?: string;
  readonly depth: ResponseDepth;
  readonly blocksReading: false;
  readonly safetyDelegatedToCore: true;
}

export interface FinalTransitionRule {
  readonly id: string;
  readonly kind:
    | "priority"
    | "secondary"
    | "next"
    | "previous";
  readonly targetId: string;
  readonly reason: string;
  readonly automatic: false;
}

export interface FinalPillarPackage {
  readonly schemaVersion:
    "igentmind.final-pillar.v1";
  readonly blockRange: readonly number[];
  readonly pillarId: PillarId;
  readonly ordinal: number;
  readonly identity: {
    readonly internalTitle: string;
    readonly subtitle: string;
    readonly opening: string;
    readonly threshold: string;
    readonly thesis: string;
    readonly centralMovement: string;
    readonly editorialOrigin:
      EditorialOrigin;
    readonly generationMode:
      GenerationMode;
  };
  readonly canonicalSections:
    readonly FinalCanonicalSectionSpec[];
  readonly signals: readonly string[];
  readonly questions:
    readonly FinalGeneratedQuestion[];
  readonly resources:
    readonly FinalComplementaryResource[];
  readonly predictiveRules:
    readonly FinalPredictiveRule[];
  readonly transitions:
    readonly FinalTransitionRule[];
  readonly closure: {
    readonly id: string;
    readonly completeRequiresAllQuestions: false;
    readonly synthesisOptional: true;
    readonly nextExperience: string;
    readonly blocksReading: false;
  };
  readonly memoryPolicy: {
    readonly candidateAllowed: true;
    readonly requiresExplicitConsent: true;
    readonly editableBeforeConfirmation: true;
    readonly oneMemoryPerResponse: true;
  };
  readonly publicationGate: {
    readonly mode: "publication";
    readonly ready: boolean;
    readonly errors: readonly string[];
  };
}

export interface FinalPresenceNotebook {
  readonly id: string;
  readonly block: 31 | 41 | 51;
  readonly title: string;
  readonly after: readonly string[];
  readonly next: string;
  readonly invitations: readonly string[];
  readonly writingPrivate: true;
  readonly optional: true;
  readonly blocksReading: false;
}

export interface FinalClosingExperience {
  readonly id: string;
  readonly title: string;
  readonly kind:
    | "final_letter"
    | "epilogue"
    | "afterword"
    | "final_reflection_notebook";
  readonly canonical: true;
  readonly optional: true;
  readonly blocksReading: false;
}

export interface FinalProjectManifest {
  readonly schemaVersion:
    "igentmind.final-project.v1";
  readonly implementedBlocks: readonly number[];
  readonly compiledPillarIds: readonly PillarId[];
  readonly pillars: readonly FinalPillarPackage[];
  readonly notebooks:
    readonly FinalPresenceNotebook[];
  readonly closingExperiences:
    readonly FinalClosingExperience[];
  readonly journeyMemoryPolicy: {
    readonly consentRequired: true;
    readonly privateWritingExcluded: true;
    readonly oneMemoryPerResponse: true;
    readonly diagnostic: false;
  };
  readonly navigationPolicy: {
    readonly readingNeverBlocked: true;
    readonly returnCursorPreserved: true;
    readonly reflectionsSkippable: true;
    readonly resumeExact: true;
  };
  readonly publicationGate: {
    readonly ready: boolean;
    readonly errors: readonly string[];
    readonly counts: {
      readonly pillars: number;
      readonly generatedQuestions: number;
      readonly generatedOptions: number;
      readonly resources: number;
      readonly notebooks: number;
      readonly closingExperiences: number;
    };
  };
}
