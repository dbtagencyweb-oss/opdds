import type {
  InterventionType,
  PillarId,
  ReaderState,
  ReflectionPhase,
} from "../../core";

export const PILLAR_03_ID =
  "pillar_03_luto" satisfies PillarId;

export const PILLAR_02_ID =
  "pillar_02_familia" satisfies PillarId;

export const PILLAR_04_ID =
  "pillar_04_trabalho" satisfies PillarId;

export const INTERLUDE_FENDA_ID =
  "interlude_fenda" as const;

export type Pillar03Id = typeof PILLAR_03_ID;

export type Pillar03CanonicalSectionKind =
  | "identity"
  | "threshold"
  | "manifesto"
  | "narrative"
  | "consciousness"
  | "judgment"
  | "presence"
  | "support_letter"
  | "anchor"
  | "closing";

export interface Pillar03Identity {
  readonly id: Pillar03Id;
  readonly order: 3;
  readonly title: "Luto";
  readonly subtitle: "Quando a ausência permanece.";
  readonly internalTitle:
    "Pilar III — Luto, Ausência & Quebra de Laços";
  readonly openingStatement:
    "Nem toda perda termina quando alguém parte. Algumas continuam vivendo dentro de nós.";
  readonly actId: "act_01_survival";
  readonly actTitle: "Sobrevivência";
  readonly previousPillarId: typeof PILLAR_02_ID;
  readonly entryExperienceId: typeof INTERLUDE_FENDA_ID;
  readonly nextPillarId: typeof PILLAR_04_ID;
  readonly blocksReading: false;
}

export interface Pillar03EntryDefinition {
  readonly source: {
    readonly kind: "interlude";
    readonly experienceId: typeof INTERLUDE_FENDA_ID;
  };
  readonly target: {
    readonly kind: "pillar";
    readonly pillarId: Pillar03Id;
  };
  readonly automatic: false;
  readonly explicitChoicePreserved: true;
  readonly blocksReading: false;
}

export interface Pillar03CanonicalSection {
  readonly id: string;
  readonly pillarId: Pillar03Id;
  readonly kind: Pillar03CanonicalSectionKind;
  readonly title: string;
  readonly editorialOrigin: "book_exact";
  readonly generationMode: "fixed";
  readonly bodyPolicy:
    "canonical_source_reference_only";
  readonly automaticInviteAfter: boolean;
  readonly sourceReference: {
    readonly documentId:
      "O_Poder_dos_Desacreditados_FINAL_25-06-26";
    readonly pageStart: number;
    readonly pageEnd: number;
  };
}

export interface Pillar03Connection {
  readonly target:
    | typeof PILLAR_02_ID
    | typeof PILLAR_04_ID
    | "pillar_05_dor"
    | "pillar_06_desejo"
    | "pillar_07_fe"
    | "pillar_09_vazio"
    | typeof INTERLUDE_FENDA_ID;
  readonly kind:
    | "previous"
    | "next"
    | "priority"
    | "secondary";
  readonly reason: string;
}

export interface Pillar03EditorialDossier {
  readonly pillarId: Pillar03Id;
  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";

  readonly thesis: string;
  readonly centralDilemma: string;
  readonly centralMovement: string;

  readonly whatThisPillarExplores: readonly string[];
  readonly experiencesThatMayAppear: readonly string[];
  readonly protectionsThatMayAppear: readonly string[];
  readonly presenceMovements: readonly string[];

  readonly editorialLimits: readonly string[];
  readonly readerFacingPrinciples: readonly string[];
  readonly connections: readonly Pillar03Connection[];

  readonly delegatesSafetyToCore: true;
  readonly diagnosesReader: false;
  readonly classifiesThirdParties: false;
  readonly requiresClosure: false;
}

export type Pillar03ScaleKey =
  | "awareness"
  | "judgment"
  | "presence"
  | "readiness"
  | "load"
  | "avoidance"
  | "agency";

export type Pillar03ScaleDelta = -1 | 0 | 1;

export type Pillar03SignalConfidence =
  | "low"
  | "medium"
  | "high";

export interface Pillar03SignalDefinition {
  readonly id: string;
  readonly pillarId: Pillar03Id;
  readonly phase: ReflectionPhase;
  readonly label: string;
  readonly description: string;

  readonly initialConfidence: "low";
  readonly initialConfidenceValue: 0.3;
  readonly minimumOccurrencesForPattern: 3;
  readonly isolatedClosedOptionCreatesPattern: false;

  readonly scaleEffects: Readonly<
    Partial<Record<Pillar03ScaleKey, Pillar03ScaleDelta>>
  >;

  readonly diagnostic: false;
  readonly permanentTrait: false;
  readonly classifiesThirdParty: false;
  readonly sourceType: "temporary_narrative_hypothesis";
}

export type Pillar03PredictiveRuleFamily =
  | "deepening"
  | "protection"
  | "integration";

export type Pillar03PredictivePriority =
  | "explicit_choice"
  | "overload"
  | "pause"
  | "state"
  | "depth"
  | "signal"
  | "open_thread"
  | "progression"
  | "memory"
  | "editorial_rotation";

export type Pillar03ConditionOperator =
  | "eq"
  | "gte"
  | "lte"
  | "includes"
  | "repeated_gte";

export interface Pillar03RuleCondition {
  readonly source:
    | "signal"
    | "scale"
    | "reader_state"
    | "interaction"
    | "open_answer"
    | "explicit_choice";
  readonly key: string;
  readonly operator: Pillar03ConditionOperator;
  readonly value: string | number | boolean;
}

export interface Pillar03ResourceIntent {
  readonly resourceType:
    | "micro_return"
    | "journal"
    | "letter"
    | "anchor";
  readonly phase: ReflectionPhase;
  readonly slot: 1 | 2;
  readonly bindingStatus: "pending_block_30";
}

export interface Pillar03RecommendedMove {
  readonly type: InterventionType;
  readonly depth?: "minimal" | "standard" | "deep";
  readonly resourceIntent?: Pillar03ResourceIntent;
  readonly memoryCandidatePolicy?:
    "explicit_confirmation_only";
}

export interface Pillar03PredictiveRuleDraft {
  readonly id: string;
  readonly pillarId: Pillar03Id;
  readonly phase: ReflectionPhase;
  readonly family: Pillar03PredictiveRuleFamily;
  readonly priority: Pillar03PredictivePriority;

  readonly minimumOccurrences: number;
  readonly allowedReaderStates:
    readonly ReaderState[];
  readonly conditions:
    readonly Pillar03RuleCondition[];

  readonly recommendedMove:
    Pillar03RecommendedMove;

  readonly avoid: readonly string[];
  readonly delegatesSafetyToCore: true;
  readonly readerChoicePreserved: true;
  readonly blocksReading: false;
}

export interface Pillar03Block28Counts {
  readonly canonicalSections: number;
  readonly signals: number;
  readonly predictiveRules: number;
  readonly consciousnessSignals: number;
  readonly judgmentSignals: number;
  readonly presenceSignals: number;
  readonly deepeningRules: number;
  readonly protectionRules: number;
  readonly integrationRules: number;
}

export interface Pillar03Block28ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface Pillar03Block28ValidationReport {
  readonly valid: boolean;
  readonly errors:
    readonly Pillar03Block28ValidationIssue[];
  readonly warnings:
    readonly Pillar03Block28ValidationIssue[];
}

export interface Pillar03Block28Manifest {
  readonly schemaVersion:
    "igentmind.pillar.foundation.v1";
  readonly pillarId: Pillar03Id;
  readonly stage:
    "editorial_predictive_foundation";
  readonly counts: Pillar03Block28Counts;
  readonly entryExperienceId:
    typeof INTERLUDE_FENDA_ID;
  readonly previousPillarId:
    typeof PILLAR_02_ID;
  readonly nextPillarId:
    typeof PILLAR_04_ID;
  readonly readingBlocked: false;
  readonly includesReaderPrivateContent: false;
  readonly canonicalBodiesEmbedded: false;
  readonly publicationReady: false;
  readonly nextRequiredBlock: 29;
}

export interface Pillar03Block28Artifact {
  readonly schemaVersion:
    "igentmind.pillar.foundation-artifact.v1";
  readonly pillarId: Pillar03Id;
  readonly manifest: Pillar03Block28Manifest;
  readonly validation:
    Pillar03Block28ValidationReport;
  readonly checksum: string;
  readonly foundationReady: boolean;
  readonly publicationReady: false;
}
