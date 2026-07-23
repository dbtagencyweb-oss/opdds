import type {
  EditorialOrigin,
  GenerationMode,
  PillarId,
  ReaderState,
  ReflectionPhase,
} from "../core";

import type { ExperienceTarget } from "../pillars/pillar-02/pillar-02.block26.contracts";

export type { ExperienceTarget };

export type IntermediateExperienceKind = "interlude";

export type IntermediateExperienceNode =
  | "entry"
  | "book"
  | "consciousness"
  | "judgment"
  | "presence"
  | "closure"
  | "pause"
  | "exit";

export type IntermediateExperienceTrigger =
  | "experience_entered"
  | "automatic_invite"
  | "phase_complete"
  | "experience_complete"
  | "resume_requested";

export type ExperienceActionChoiceId =
  | "write"
  | "pause"
  | "continue";

export interface IntermediateExperienceIdentity<
  ExperienceId extends string,
> {
  readonly id: ExperienceId;
  readonly kind: IntermediateExperienceKind;
  readonly title: string;
  readonly internalTitle: string;
  readonly previousPillarId: PillarId;
  readonly nextPillarId: PillarId;
  readonly compact: true;
  readonly countsAsPillar: false;
  readonly blocksReading: false;
  readonly skippableByExplicitChoice: true;
}

export interface ExperienceCanonicalSection {
  readonly id: string;
  readonly kind:
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
  readonly title: string;
  readonly editorialOrigin: EditorialOrigin;
  readonly generationMode: GenerationMode;
  readonly automaticInviteAfter: boolean;
  readonly sourceReference: {
    readonly documentId: "O_Poder_dos_Desacreditados_FINAL_25-06-26";
    readonly pageStart: number;
    readonly pageEnd: number;
  };
  readonly bodyPolicy: "canonical_source_reference_only";
}

export interface ExperienceSignalDefinition {
  readonly id: string;
  readonly phase: ReflectionPhase;
  readonly label: string;
  readonly description: string;
  readonly persistence: "session_only";
  readonly initialConfidence: 0.3;
  readonly minimumOccurrencesForPattern: 3;
  readonly diagnostic: false;
  readonly classifiesThirdParty: false;
}

export interface ExperienceActionChoice {
  readonly id: ExperienceActionChoiceId;
  readonly label: string;
  readonly semanticInterpretation: false;
  readonly createsSignal: false;
  readonly createsMemory: false;
}

export interface ExperienceInvitation {
  readonly id: string;
  readonly phase: ReflectionPhase;
  readonly afterSectionId: string;
  readonly prompt: string;
  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";
  readonly optional: true;
  readonly blocking: false;
  readonly openAnswerEnabled: true;
  readonly oneQuestionPerTurn: true;
  readonly maxVisibleMoves: 2;
  readonly choices: readonly ExperienceActionChoice[];
  readonly memoryPolicy: "explicit_consent_only";
  readonly telemetryIncludesAnswer: false;
}

export interface ExperienceMicroReturn {
  readonly id: string;
  readonly phase: ReflectionPhase;
  readonly text: string;
  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";
  readonly diagnostic: false;
  readonly prescriptive: false;
}

export interface ExperiencePredictiveRule {
  readonly id: string;
  readonly phase: ReflectionPhase | "global";
  readonly priority:
    | "safety"
    | "explicit_choice"
    | "overload"
    | "pause"
    | "state"
    | "signal"
    | "progression";
  readonly minimumOccurrences: number;
  readonly when: readonly string[];
  readonly action:
    | "mirror_only"
    | "offer_pause"
    | "offer_micro_return"
    | "offer_canonical_anchor"
    | "return_to_book"
    | "continue_to_next_pillar";
  readonly resourceId?: string;
  readonly avoid: readonly string[];
}

export interface IntermediateExperienceTransition {
  readonly id: string;
  readonly from: IntermediateExperienceNode;
  readonly to: IntermediateExperienceNode;
  readonly trigger: IntermediateExperienceTrigger;
  readonly optional: boolean;
  readonly blocking: false;
  readonly target?: ExperienceTarget;
}

export interface ExperienceClosureRoute {
  readonly id:
    | "canonical_support_letter"
    | "canonical_anchor"
    | "canonical_closing"
    | "pause"
    | "return_to_book"
    | "continue_to_pillar_03";
  readonly label: string;
  readonly optional: true;
  readonly blocking: false;
  readonly readerChoiceRequired: true;
  readonly target:
    | {
        readonly kind: "canonical_section";
        readonly sectionKind:
          | "support_letter"
          | "anchor"
          | "closing";
      }
    | {
        readonly kind: "reader_surface";
        readonly surface: "pause" | "book";
      }
    | ExperienceTarget;
}

export interface ExperienceClosureDefinition {
  readonly id: string;
  readonly synthesisRequired: false;
  readonly reflectionRequired: false;
  readonly emotionallyResolvedClaim: false;
  readonly blocksReading: false;
  readonly routes: readonly ExperienceClosureRoute[];
}

export interface IntermediateExperienceDefinition<
  ExperienceId extends string,
> {
  readonly identity: IntermediateExperienceIdentity<ExperienceId>;
  readonly canonicalSections: readonly ExperienceCanonicalSection[];
  readonly signals: readonly ExperienceSignalDefinition[];
  readonly invitations: readonly ExperienceInvitation[];
  readonly microReturns: readonly ExperienceMicroReturn[];
  readonly predictiveRules: readonly ExperiencePredictiveRule[];
  readonly transitions: readonly IntermediateExperienceTransition[];
  readonly closure: ExperienceClosureDefinition;
  readonly allowedReaderStates: readonly ReaderState[];
}

export interface IntermediateExperienceIndexes {
  readonly canonicalSections: ReadonlyMap<
    string,
    ExperienceCanonicalSection
  >;
  readonly signals: ReadonlyMap<string, ExperienceSignalDefinition>;
  readonly invitations: ReadonlyMap<string, ExperienceInvitation>;
  readonly microReturns: ReadonlyMap<string, ExperienceMicroReturn>;
  readonly predictiveRules: ReadonlyMap<
    string,
    ExperiencePredictiveRule
  >;
  readonly transitions: ReadonlyMap<
    string,
    IntermediateExperienceTransition
  >;
}

export interface IntermediateExperiencePackage<
  ExperienceId extends string,
> extends IntermediateExperienceDefinition<ExperienceId> {
  readonly indexes: IntermediateExperienceIndexes;
  readonly mode: "publication";
}

export interface IntermediateExperienceCounts {
  readonly canonicalSections: number;
  readonly signals: number;
  readonly invitations: number;
  readonly actionChoices: number;
  readonly microReturns: number;
  readonly predictiveRules: number;
  readonly transitions: number;
  readonly closureRoutes: number;
}
