// src/igentmind/core/contracts.ts

export const PILLAR_IDS = {
  recognition: "pillar_01_reconhecimento",
  family: "pillar_02_familia",
  grief: "pillar_03_luto",
  work: "pillar_04_trabalho",
  pain: "pillar_05_dor",
  desire: "pillar_06_desejo",
  faith: "pillar_07_fe",
  scarcity: "pillar_08_escassez",
  emptiness: "pillar_09_vazio",
} as const;

export const PILLAR_01_ID =
  PILLAR_IDS.recognition;

export const PILLAR_02_ID =
  PILLAR_IDS.family;

export const LEGACY_PILLAR_01_ID =
  "pillar_01_vinculo" as const;

export type PillarId =
  (typeof PILLAR_IDS)[keyof typeof PILLAR_IDS];

export const READER_STATES = [
  "unmapped",
  "observing",
  "defensive",
  "oscillating",
  "available",
  "integrating",
  "overloaded",
  "paused",
] as const;

export type ReaderState =
  (typeof READER_STATES)[number];

export const REFLECTION_PHASES = [
  "consciousness",
  "judgment",
  "presence",
] as const;

export type ReflectionPhase =
  (typeof REFLECTION_PHASES)[number];

export const INTERVENTION_TYPES = [
  "mirror",
  "displacement",
  "question",
  "micro_return",
  "journal",
  "letter",
  "anchor",
  "memory_recall",
  "connection",
  "pause",
  "closure",
] as const;

export type InterventionType =
  (typeof INTERVENTION_TYPES)[number];

export const PRIORITY_RULES = [
  "safety",
  "explicit_choice",
  "overload",
  "pause",
  "state",
  "depth",
  "signal",
  "open_thread",
  "progression",
  "memory",
  "editorial_rotation",
] as const;

export type PriorityRule =
  (typeof PRIORITY_RULES)[number];

export const SCALE_NAMES = [
  "awareness",
  "judgment",
  "presence",
  "readiness",
  "load",
  "avoidance",
  "agency",
] as const;

export type ScaleName =
  (typeof SCALE_NAMES)[number];

export type ScaleDelta = -1 | 0 | 1;

export interface ScaleSnapshot {
  awareness: number;
  judgment: number;
  presence: number;
  readiness: number;
  load: number;
  avoidance: number;
  agency: number;
}

export interface ScaleChange {
  scale: ScaleName;
  before: number;
  delta: ScaleDelta;
  after: number;
}

export type EditorialOrigin =
  | "book_exact"
  | "book_approved_adaptation"
  | "igent_companion";

export type GenerationMode =
  | "fixed"
  | "templated"
  | "generated";

/**
 * Compatibilidade temporária.
 *
 * ContentOrigin representa exclusivamente origem editorial.
 * Nunca deve receber fixed, templated ou generated.
 *
 * @deprecated Use EditorialOrigin.
 */
export type ContentOrigin = EditorialOrigin;

export interface BookCursor {
  contentId: string;
  sectionId: string;
  anchorId: string;
  offset?: number;
}

export interface ContentReferenceSnapshot {
  contentId: string;
  editorialOrigin: EditorialOrigin;
  generationMode: GenerationMode;
  resolved: boolean;
  canonical: boolean;

  /**
   * Campo proibido no modelo novo.
   */
  contentOrigin?: never;
}

export type NextMove =
  | {
      kind: "continue_reading";
      reasonCode?: string;
    }
  | {
      kind: "return_to_book";
      bookCursor: BookCursor;
      reasonCode?: string;
    }
  | {
      kind: "ask_question";
      targetId?: string;
      reasonCode?: string;
    }
  | {
      kind: "micro_return";
      targetId: string;
      reasonCode?: string;
    }
  | {
      kind: "open_journal";
      targetId: string;
      reasonCode?: string;
    }
  | {
      kind: "open_letter";
      targetId: string;
      reasonCode?: string;
    }
  | {
      kind: "open_anchor";
      targetId: string;
      reasonCode?: string;
    }
  | {
      kind: "pause";
      reasonCode?: string;
    }
  | {
      kind: "close_pillar";
      targetId?: string;
      reasonCode?: string;
    }
  | {
      kind: "continue_to_pillar";
      targetId: PillarId;
      bookCursor: BookCursor;
      reasonCode?: string;
    }
  | {
      kind: "safety_stop";
      reasonCode: string;
    };

export type ResponseDepth =
  | "minimal"
  | "standard"
  | "deep";

export interface VisibleMoveSnapshot {
  type: InterventionType;
  contentId?: string;
}

export type CoreSignalId =
  | "reader_defensive"
  | "reader_overloaded"
  | "reader_pause_requested"
  | "closed_answer_selected"
  | "open_answer_received"
  | "open_answer_correction"
  | "memory_candidate_created"
  | "memory_confirmed"
  | "memory_refused"
  | "writing_declined"
  | "anchor_interrupted"
  | "content_reference_missing"
  | "safety_high_risk"
  | "navigation_resume";

export type PillarSignalId =
  `pillar_${number}_${string}`;

export type SignalId =
  | CoreSignalId
  | PillarSignalId;

export type SignalRole =
  | "primary"
  | "secondary";

export interface SignalDefinition {
  id: SignalId;
  description: string;
  allowedPhases: readonly ReflectionPhase[] | "global";
  defaultConfidence: number;
}

export interface SignalObservation {
  id: SignalId;
  role: SignalRole;
  confidence: number;
  source:
    | "closed_answer"
    | "open_answer"
    | "reader_state"
    | "memory"
    | "system";
}

/**
 * Aliases temporários para imports dos blocos anteriores.
 */
export type PrimarySignal =
  SignalObservation & {
    role: "primary";
  };

export type SecondarySignal =
  SignalObservation & {
    role: "secondary";
  };

export interface InterpretationEvidence {
  source:
    | "closed"
    | "open"
    | "memory"
    | "state";

  confidence: number;
  signalIds: SignalId[];
  superseded?: boolean;
}

export interface InterpretationSnapshot {
  authoritativeSource:
    | "closed"
    | "open"
    | "memory"
    | "state"
    | null;

  evidence: InterpretationEvidence[];
}

export interface ContentReferenceFailure {
  active: boolean;
  failClosed: boolean;
  inventedReplacement: boolean;
  failedContentId?: string;
}

export interface LastTurnSnapshot {
  turnId: string;
  questionCount: number;
  responseDepth: ResponseDepth | null;
  visibleMoves: VisibleMoveSnapshot[];
  usedMemoryIds: string[];
  scaleChanges: ScaleChange[];
  selectedPriority: PriorityRule | null;
  priorityTrace: PriorityRule[];
  nextMove: NextMove | null;
  interpretation: InterpretationSnapshot | null;
  contentReferences: ContentReferenceSnapshot[];
  contentReferenceFailure?: ContentReferenceFailure;
}

export interface PhaseProgressSnapshot {
  offered: number;
  answered: number;
  skipped: number;
  complete: boolean;
}

export interface ReflectionProgressSnapshot {
  offeredInvites: number;
  acceptedInvites: number;
  dismissedInvites: number;
  answeredQuestions: number;
  skippedQuestions: number;

  phaseProgress: Record<
    ReflectionPhase,
    PhaseProgressSnapshot
  >;
}

export type WritingResourceType =
  | "journal"
  | "letter"
  | "anchor";

export interface WritingItemSnapshot {
  id: string;
  type: WritingResourceType;

  status:
    | "opened"
    | "draft"
    | "saved"
    | "interrupted"
    | "completed"
    | "declined";

  visibility: "private";
  complete: boolean;

  /**
   * Disponível somente no adaptador interno de testes.
   * Não deve ser exposto por APIs públicas.
   */
  content?: string;
}

export interface WritingSnapshot {
  items: WritingItemSnapshot[];
  declinedTypes: WritingResourceType[];
}

export interface MemoryRecordSnapshot {
  id: string;
  text: string;
  consent: "confirmed";
  confirmedAt: string;
  source: "reader_confirmed";
  editedBeforeConfirmation: boolean;
}

export interface MemorySnapshot {
  confirmed: MemoryRecordSnapshot[];
  refusedCandidateIds: string[];
  pendingCandidateIds: string[];
  lastUsedMemoryId: string | null;
}

export type ClosureStatus =
  | "not_started"
  | "partial"
  | "completed"
  | "completed_without_synthesis"
  | "paused";

export interface ClosureSnapshot {
  status: ClosureStatus;
  complete: boolean;
  synthesisGenerated: boolean;
  availableRoutes: string[];
}

export interface NavigationSnapshot {
  bookCursor: BookCursor;
  returnCursor: BookCursor | null;
  targetPillarId: PillarId | null;
  blocked: boolean;
  resumeOfferVisible: boolean;
}

export interface SafetySnapshot {
  active: boolean;
  reflectionSuspended: boolean;
  reasonCode: string | null;
}

export interface TelemetryEventSnapshot {
  eventName: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface OutboundMessageSnapshot {
  id: string;
  channel: string;
  recipient?: string;
  body?: string;
}

export interface DebugSnapshot {
  lastScaleProbe?: {
    accepted: boolean;
    rejectionCode?: string;
    change?: ScaleChange;
  };

  lastPriorityProbe?: {
    selected: PriorityRule;
    trace: PriorityRule[];
  };

  lastCompositionProbe?: {
    questionCount: number;
    visibleMoves: VisibleMoveSnapshot[];
    usedMemoryIds: string[];
    nextMove: NextMove | null;
  };
}

export interface IGentMindSnapshot {
  sessionId: string;
  readerId: string;
  pillarId: PillarId;
  readerState: ReaderState;
  phase: ReflectionPhase | null;
  scales: ScaleSnapshot;
  reflection: ReflectionProgressSnapshot;
  writing: WritingSnapshot;
  memory: MemorySnapshot;
  closure: ClosureSnapshot;
  navigation: NavigationSnapshot;
  safety: SafetySnapshot;
  lastTurn: LastTurnSnapshot | null;
  telemetry: TelemetryEventSnapshot[];
  outbound: OutboundMessageSnapshot[];
  debug?: DebugSnapshot;
}

export interface IGentMindFixture {
  sessionId: string;
  readerId: string;
  pillarId: PillarId;
  readerState: ReaderState;
  phase: ReflectionPhase | null;
  scales: ScaleSnapshot;
  bookCursor: BookCursor;

  consent: {
    memory: boolean;
    privateWriting: boolean;
    telemetryPrivateContent: false;
  };

  featureFlags: {
    iGentMindEnabled: boolean;
    automaticInvitesEnabled: boolean;
    testMode: true;
  };

  clock: {
    now: string;
  };
}

export type IGentMindCommandType =
  | "READ_TO"
  | "OPEN_PHASE_INVITE"
  | "DISMISS_INVITE"
  | "EXIT_REFLECTION"
  | "ANSWER_CLOSED"
  | "ANSWER_OPEN"
  | "SKIP_QUESTION"
  | "DECLINE_WRITING"
  | "OPEN_JOURNAL"
  | "SAVE_PRIVATE_JOURNAL"
  | "OPEN_LETTER"
  | "SAVE_PRIVATE_LETTER"
  | "OPEN_ANCHOR"
  | "INTERRUPT_ANCHOR"
  | "REFUSE_MEMORY"
  | "EDIT_MEMORY"
  | "CONFIRM_MEMORY"
  | "REQUEST_CLOSURE"
  | "SKIP_SYNTHESIS"
  | "GENERATE_SYNTHESIS"
  | "CONTINUE_TO_PILLAR"
  | "RETURN_TO_BOOK"
  | "INJECT_CONTENT_REFERENCE_FAILURE"
  | "SET_READER_STATE"
  | "SET_LOAD"
  | "EMIT_SAFETY_SIGNAL"
  | "CLOSE_SESSION"
  | "REOPEN_PILLAR"
  | "TEST_APPLY_SCALE_DELTA"
  | "TEST_RESOLVE_PRIORITY"
  | "TEST_COMPOSE_RESPONSE";

export interface IGentMindCommand {
  type: IGentMindCommandType;
  payload?: Record<string, unknown>;
  at?: string;
}

export interface IGentMindAdapter {
  reset(fixture: IGentMindFixture): Promise<void>;
  dispatch(command: IGentMindCommand): Promise<void>;
  snapshot(): Promise<IGentMindSnapshot>;
  telemetry(): Promise<TelemetryEventSnapshot[]>;
  outbound(): Promise<OutboundMessageSnapshot[]>;
  dispose?(): Promise<void>;
}

export type CreateIGentMindAdapter =
  () => Promise<IGentMindAdapter>;
