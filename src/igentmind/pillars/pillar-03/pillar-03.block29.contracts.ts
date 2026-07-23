import type {
  InterventionType,
  ReflectionPhase,
} from "../../core";

import type {
  Pillar03Id,
  Pillar03ScaleDelta,
  Pillar03ScaleKey,
} from "./pillar-03.block28.contracts";

export type Pillar03SemanticPosition =
  | "recognition"
  | "minimization"
  | "defense"
  | "ambivalence"
  | "desire"
  | "uncertainty";

export type Pillar03ResponseDepth =
  | "minimal"
  | "standard"
  | "deep";

export type Pillar03QuestionOrder =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

export type Pillar03PhaseQuestionOrder = 1 | 2 | 3;

export type Pillar03OptionEvidence =
  | "weak"
  | "moderate";

export interface Pillar03SignalBinding {
  readonly signalId: string;
  readonly role: "primary";
  readonly evidence: Pillar03OptionEvidence;
  readonly occurrenceIncrement: 0 | 1;
  readonly createsPatternAlone: false;
}

export interface Pillar03MirrorBlock {
  readonly kind: "mirror";
  readonly text: string;
}

export interface Pillar03DisplacementBlock {
  readonly kind: "displacement";
  readonly text: string;
}

export interface Pillar03NextMoveBlock {
  readonly kind: "next_move";
  readonly interventionType: Extract<
    InterventionType,
    "question" | "pause"
  >;
  readonly text: string;
}

export type Pillar03ResponseBlock =
  | Pillar03MirrorBlock
  | Pillar03DisplacementBlock
  | Pillar03NextMoveBlock;

export interface Pillar03LayeredResponse {
  readonly depth: Pillar03ResponseDepth;
  readonly blocks: readonly Pillar03ResponseBlock[];
  readonly visibleMoves: 1 | 2 | 3;
  readonly asksAtMostOneQuestion: true;
  readonly diagnostic: false;
  readonly claimsResolution: false;
}

export interface Pillar03QuestionOption {
  readonly id: string;
  readonly questionId: string;
  readonly semanticPosition: Pillar03SemanticPosition;
  readonly visibleText: string;

  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";

  readonly interpretationConfidence: "low";
  readonly isolatedSelectionCreatesPattern: false;

  readonly signalBindings:
    readonly Pillar03SignalBinding[];

  readonly scaleEffects: Readonly<
    Partial<
      Record<Pillar03ScaleKey, Pillar03ScaleDelta>
    >
  >;

  readonly responses: Readonly<
    Record<
      Pillar03ResponseDepth,
      Pillar03LayeredResponse
    >
  >;
}

export interface Pillar03OpenAnswerTemplate {
  readonly depth: Pillar03ResponseDepth;
  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "templated";
  readonly templateBlocks:
    readonly Pillar03ResponseBlock[];
  readonly visibleMoves: 1 | 2 | 3;
  readonly asksAtMostOneQuestion: true;
}

export interface Pillar03OpenAnswerDefinition {
  readonly id: string;
  readonly enabled: true;
  readonly prompt:
    "Escreva com suas próprias palavras.";

  readonly interpretivePriority:
    "higher_than_closed_option";

  readonly signalExtractionMode:
    "tentative_from_reader_language";

  readonly responseMustPrioritizeReaderWords: true;
  readonly contradictionOverridesClosedOption: true;

  readonly automaticMemoryCreation: false;
  readonly memoryRequiresExplicitConsent: true;

  readonly includedInTelemetry: false;
  readonly includedInPublicSnapshot: false;

  readonly responses: Readonly<
    Record<
      Pillar03ResponseDepth,
      Pillar03OpenAnswerTemplate
    >
  >;
}

export interface Pillar03Question {
  readonly id: string;
  readonly pillarId: Pillar03Id;
  readonly order: Pillar03QuestionOrder;
  readonly phaseOrder: Pillar03PhaseQuestionOrder;
  readonly phase: ReflectionPhase;

  readonly prompt: string;
  readonly canonicalSectionId:
    | "p03_consciousness"
    | "p03_judgment"
    | "p03_presence";

  readonly editorialOrigin: "igent_companion";
  readonly generationMode: "fixed";

  readonly optional: true;
  readonly blocking: false;
  readonly oneQuestionPerTurn: true;

  readonly options:
    readonly Pillar03QuestionOption[];

  readonly openAnswer:
    Pillar03OpenAnswerDefinition;
}

export interface Pillar03OptionBlueprint {
  readonly id: string;
  readonly semanticPosition:
    Pillar03SemanticPosition;
  readonly visibleText: string;

  readonly mirror: string;
  readonly displacement: string;

  readonly nextMove: {
    readonly interventionType:
      | "question"
      | "pause";
    readonly text: string;
  };

  readonly scaleEffects?: Readonly<
    Partial<
      Record<Pillar03ScaleKey, Pillar03ScaleDelta>
    >
  >;
}

export interface CreatePillar03QuestionInput {
  readonly id: string;
  readonly order: Pillar03QuestionOrder;
  readonly phaseOrder: Pillar03PhaseQuestionOrder;
  readonly phase: ReflectionPhase;
  readonly prompt: string;

  readonly canonicalSectionId:
    | "p03_consciousness"
    | "p03_judgment"
    | "p03_presence";

  readonly primarySignalId: string;

  readonly openAnswerDisplacement: string;
  readonly openAnswerNextMove: {
    readonly interventionType:
      | "question"
      | "pause";
    readonly text: string;
  };

  readonly options:
    readonly Pillar03OptionBlueprint[];
}

export interface Pillar03Block29Counts {
  readonly questions: number;
  readonly options: number;
  readonly openAnswers: number;

  readonly minimalOptionResponses: number;
  readonly standardOptionResponses: number;
  readonly deepOptionResponses: number;

  readonly optionResponseVariants: number;
  readonly openAnswerResponseVariants: number;

  readonly consciousnessQuestions: number;
  readonly judgmentQuestions: number;
  readonly presenceQuestions: number;
}

export interface Pillar03Block29ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface Pillar03Block29ValidationReport {
  readonly valid: boolean;
  readonly errors:
    readonly Pillar03Block29ValidationIssue[];
  readonly warnings:
    readonly Pillar03Block29ValidationIssue[];
}

export interface Pillar03Block29Manifest {
  readonly schemaVersion:
    "igentmind.pillar.questions.v1";
  readonly pillarId: Pillar03Id;
  readonly stage:
    "question_response_bank";
  readonly counts: Pillar03Block29Counts;

  readonly openAnswerPriority:
    "higher_than_closed_option";
  readonly privateAnswersInTelemetry: false;
  readonly automaticMemoryCreation: false;

  readonly readingBlocked: false;
  readonly publicationReady: false;
  readonly nextRequiredBlock: 30;
}

export interface Pillar03Block29Artifact {
  readonly schemaVersion:
    "igentmind.pillar.questions-artifact.v1";
  readonly pillarId: Pillar03Id;
  readonly manifest: Pillar03Block29Manifest;
  readonly validation:
    Pillar03Block29ValidationReport;
  readonly checksum: string;
  readonly questionBankReady: boolean;
  readonly publicationReady: false;
}
