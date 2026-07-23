// src/igentmind/runtime/igentmind.runtime.ts

import {
  applyScaleDelta,
  BookCursor,
  clampScale,
  completeClosureWithSynthesis,
  completeClosureWithoutSynthesis,
  composeVisibleResponse,
  ContentReferenceSnapshot,
  createCanonicalContentRegistry,
  createInitialClosureState,
  DebugSnapshot,
  IGentMindAdapter,
  IGentMindCommand,
  IGentMindFixture,
  IGentMindSnapshot,
  INTERVENTION_TYPES,
  isBookCursor,
  isInterventionType,
  isPillarId,
  LastTurnSnapshot,
  markClosurePartial,
  materializeClosure,
  MemoryStore,
  normalizeInterpretation,
  normalizeNextMove,
  OutboundMessageSnapshot,
  PILLAR_01_ID,
  PILLAR_02_ID,
  PillarId,
  PRIORITY_RULES,
  PriorityRule,
  ReaderState,
  READER_STATES,
  ReflectionPhase,
  REFLECTION_PHASES,
  resolvePriority,
  sanitizeTelemetryPayload,
  ScaleName,
  SCALE_NAMES,
  SignalId,
  TelemetryEventSnapshot,
  VisibleMoveSnapshot,
  WritingItemSnapshot,
  WritingResourceType,
} from "../core";

import type {
  ClosureState,
  ContentRegistry,
  InterpretationEvidence,
  NavigationSnapshot,
  ReflectionProgressSnapshot,
  SafetySnapshot,
  ScaleSnapshot,
} from "../core";

function deepClone<T>(
  value: T,
): T {
  return JSON.parse(
    JSON.stringify(value),
  ) as T;
}

function createPhaseProgress():
  ReflectionProgressSnapshot {
  return {
    offeredInvites: 0,
    acceptedInvites: 0,
    dismissedInvites: 0,
    answeredQuestions: 0,
    skippedQuestions: 0,

    phaseProgress: {
      consciousness: {
        offered: 0,
        answered: 0,
        skipped: 0,
        complete: false,
      },

      judgment: {
        offered: 0,
        answered: 0,
        skipped: 0,
        complete: false,
      },

      presence: {
        offered: 0,
        answered: 0,
        skipped: 0,
        complete: false,
      },
    },
  };
}

function requireString(
  payload: Record<string, unknown>,
  key: string,
): string {
  const value = payload[key];

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `Campo obrigatório ausente: ${key}`,
    );
  }

  return value;
}

function requirePhase(
  value: unknown,
): ReflectionPhase {
  if (
    !REFLECTION_PHASES.includes(
      value as ReflectionPhase,
    )
  ) {
    throw new Error(
      `Fase inválida: ${String(value)}`,
    );
  }

  return value as ReflectionPhase;
}

function requireReaderState(
  value: unknown,
): ReaderState {
  if (
    !READER_STATES.includes(
      value as ReaderState,
    )
  ) {
    throw new Error(
      `Estado do leitor inválido: ${String(value)}`,
    );
  }

  return value as ReaderState;
}

function requireScaleName(
  value: unknown,
): ScaleName {
  if (
    !SCALE_NAMES.includes(
      value as ScaleName,
    )
  ) {
    throw new Error(
      `Escala inválida: ${String(value)}`,
    );
  }

  return value as ScaleName;
}

function requireWritingType(
  value: unknown,
): WritingResourceType {
  if (
    value !== "journal" &&
    value !== "letter" &&
    value !== "anchor"
  ) {
    throw new Error(
      `Tipo de escrita inválido: ${String(value)}`,
    );
  }

  return value;
}

export class IGentMindRuntime
implements IGentMindAdapter {
  private fixture:
    IGentMindFixture | null = null;

  private pillarId:
    PillarId = PILLAR_01_ID;

  private readerState:
    ReaderState = "unmapped";

  private phase:
    ReflectionPhase | null = null;

  private scales:
    ScaleSnapshot = {
      awareness: 0,
      judgment: 0,
      presence: 0,
      readiness: 0,
      load: 0,
      avoidance: 0,
      agency: 0,
    };

  private reflection =
    createPhaseProgress();

  private navigation:
    NavigationSnapshot = {
      bookCursor: {
        contentId: PILLAR_01_ID,
        sectionId: "identity",
        anchorId: "start",
      },

      returnCursor: null,
      targetPillarId: null,
      blocked: false,
      resumeOfferVisible: false,
    };

  private safety:
    SafetySnapshot = {
      active: false,
      reflectionSuspended: false,
      reasonCode: null,
    };

  private closureState:
    ClosureState =
      createInitialClosureState();

  private lastTurn:
    LastTurnSnapshot | null = null;

  private debug:
    DebugSnapshot | undefined;

  private memoryStore:
    MemoryStore = new MemoryStore(
      () => new Date().toISOString(),
    );

  private readonly writingItems =
    new Map<string, WritingItemSnapshot>();

  private readonly declinedWriting =
    new Set<WritingResourceType>();

  private readonly telemetryEvents:
    TelemetryEventSnapshot[] = [];

  private readonly outboundMessages:
    OutboundMessageSnapshot[] = [];

  private readonly answeredQuestionIds =
    new Set<string>();

  private readonly skippedQuestionIds =
    new Set<string>();

  private readonly questionPhase =
    new Map<string, ReflectionPhase>();

  private readonly interpretationByQuestion =
    new Map<string, InterpretationEvidence[]>();

  private readonly offeredCursorKeys =
    new Set<string>();

  private readonly contentRegistry:
    ContentRegistry =
      createCanonicalContentRegistry();

  private turnCounter = 0;
  private closed = false;

  async reset(
    fixture: IGentMindFixture,
  ): Promise<void> {
    this.fixture = deepClone(fixture);
    this.pillarId = fixture.pillarId;
    this.readerState =
      fixture.readerState;
    this.phase = fixture.phase;

    this.scales = {
      awareness:
        clampScale(fixture.scales.awareness),
      judgment:
        clampScale(fixture.scales.judgment),
      presence:
        clampScale(fixture.scales.presence),
      readiness:
        clampScale(fixture.scales.readiness),
      load:
        clampScale(fixture.scales.load),
      avoidance:
        clampScale(fixture.scales.avoidance),
      agency:
        clampScale(fixture.scales.agency),
    };

    this.reflection =
      createPhaseProgress();

    this.navigation = {
      bookCursor:
        deepClone(fixture.bookCursor),
      returnCursor: null,
      targetPillarId: null,
      blocked: false,
      resumeOfferVisible: false,
    };

    this.safety = {
      active: false,
      reflectionSuspended: false,
      reasonCode: null,
    };

    this.closureState =
      createInitialClosureState();

    this.lastTurn = null;
    this.debug = undefined;

    this.memoryStore =
      new MemoryStore(
        () =>
          this.fixture?.clock.now ??
          new Date().toISOString(),
      );

    this.writingItems.clear();
    this.declinedWriting.clear();
    this.telemetryEvents.length = 0;
    this.outboundMessages.length = 0;
    this.answeredQuestionIds.clear();
    this.skippedQuestionIds.clear();
    this.questionPhase.clear();
    this.interpretationByQuestion.clear();
    this.offeredCursorKeys.clear();

    this.turnCounter = 0;
    this.closed = false;
  }

  async dispatch(
    command: IGentMindCommand,
  ): Promise<void> {
    this.assertReady();

    const payload =
      command.payload ?? {};

    switch (command.type) {
      case "READ_TO":
        this.readTo(payload);
        return;

      case "OPEN_PHASE_INVITE":
        this.openPhaseInvite(payload);
        return;

      case "DISMISS_INVITE":
        this.dismissInvite(payload);
        return;

      case "EXIT_REFLECTION":
      case "RETURN_TO_BOOK":
        this.returnToBook();
        return;

      case "ANSWER_CLOSED":
        this.answerClosed(payload);
        return;

      case "ANSWER_OPEN":
        this.answerOpen(payload);
        return;

      case "SKIP_QUESTION":
        this.skipQuestion(payload);
        return;

      case "DECLINE_WRITING":
        this.declineWriting(payload);
        return;

      case "OPEN_JOURNAL":
        this.openWriting(
          "journal",
          requireString(
            payload,
            "journalId",
          ),
        );
        return;

      case "SAVE_PRIVATE_JOURNAL":
        this.saveWriting(
          "journal",
          requireString(
            payload,
            "journalId",
          ),
          requireString(payload, "text"),
        );
        return;

      case "OPEN_LETTER":
        this.openWriting(
          "letter",
          requireString(
            payload,
            "letterId",
          ),
        );
        return;

      case "SAVE_PRIVATE_LETTER":
        this.saveWriting(
          "letter",
          requireString(
            payload,
            "letterId",
          ),
          requireString(payload, "text"),
        );
        return;

      case "OPEN_ANCHOR":
        this.openWriting(
          "anchor",
          requireString(
            payload,
            "anchorId",
          ),
        );
        return;

      case "INTERRUPT_ANCHOR":
        this.interruptAnchor(payload);
        return;

      case "REFUSE_MEMORY":
        this.refuseMemory(payload);
        return;

      case "EDIT_MEMORY":
        this.editMemory(payload);
        return;

      case "CONFIRM_MEMORY":
        this.confirmMemory(payload);
        return;

      case "REQUEST_CLOSURE":
        this.requestClosure(payload);
        return;

      case "SKIP_SYNTHESIS":
        this.closureState =
          completeClosureWithoutSynthesis();

        this.lastTurn = this.makeTurn({
          visibleMoves: [
            {
              type: "closure",
            },
          ],
          nextMove: {
            kind: "close_pillar",
            targetId: PILLAR_01_ID,
          },
        });

        this.emit(
          "closure_completed",
          {
            synthesisGenerated: false,
          },
        );
        return;

      case "GENERATE_SYNTHESIS":
        this.closureState =
          completeClosureWithSynthesis();

        this.lastTurn = this.makeTurn({
          visibleMoves: [
            {
              type: "closure",
            },
          ],
          nextMove: {
            kind: "close_pillar",
            targetId: PILLAR_01_ID,
          },
        });

        this.emit(
          "closure_completed",
          {
            synthesisGenerated: true,
          },
        );
        return;

      case "CONTINUE_TO_PILLAR":
        this.continueToPillar(payload);
        return;

      case "INJECT_CONTENT_REFERENCE_FAILURE":
        this.injectContentFailure(payload);
        return;

      case "SET_READER_STATE":
        this.readerState =
          requireReaderState(
            payload.readerState ??
            payload.state,
          );
        return;

      case "SET_LOAD":
        this.scales.load =
          clampScale(
            Number(
              payload.load ??
              payload.value,
            ),
          );
        return;

      case "EMIT_SAFETY_SIGNAL":
        this.emitSafetySignal(payload);
        return;

      case "CLOSE_SESSION":
        this.closed = true;
        return;

      case "REOPEN_PILLAR":
        this.reopenPillar(payload);
        return;

      case "TEST_APPLY_SCALE_DELTA":
        this.testScaleDelta(payload);
        return;

      case "TEST_RESOLVE_PRIORITY":
        this.testResolvePriority(payload);
        return;

      case "TEST_COMPOSE_RESPONSE":
        this.testComposeResponse(payload);
        return;
    }
  }

  async snapshot():
    Promise<IGentMindSnapshot> {
    this.assertReady();

    return deepClone({
      sessionId:
        this.fixture!.sessionId,
      readerId:
        this.fixture!.readerId,
      pillarId: this.pillarId,
      readerState: this.readerState,
      phase: this.phase,
      scales: this.scales,
      reflection: this.reflection,

      writing: {
        items: Array.from(
          this.writingItems.values(),
        ),

        declinedTypes:
          Array.from(
            this.declinedWriting,
          ),
      },

      memory:
        this.memoryStore.snapshot(),

      closure:
        materializeClosure(
          this.closureState,
        ),

      navigation: this.navigation,
      safety: this.safety,
      lastTurn: this.lastTurn,

      telemetry:
        this.telemetryEvents,

      outbound:
        this.outboundMessages,

      debug: this.debug,
    });
  }

  async telemetry():
    Promise<TelemetryEventSnapshot[]> {
    return deepClone(
      this.telemetryEvents,
    );
  }

  async outbound():
    Promise<OutboundMessageSnapshot[]> {
    return deepClone(
      this.outboundMessages,
    );
  }

  async dispose():
    Promise<void> {
    this.closed = true;
  }

  private readTo(
    payload: Record<string, unknown>,
  ): void {
    const cursor = payload.cursor;

    if (!isBookCursor(cursor)) {
      throw new Error(
        "READ_TO exige um BookCursor válido.",
      );
    }

    this.navigation.bookCursor =
      deepClone(cursor);

    this.navigation.blocked = false;

    const contentReferences =
      this.resolveContentReferences(cursor);

    this.lastTurn = this.makeTurn({
      contentReferences,
      nextMove: {
        kind: "continue_reading",
      },
    });

    const invitePhase =
      this.autoInvitePhase(cursor);

    if (
      invitePhase &&
      this.fixture?.featureFlags
        .automaticInvitesEnabled
    ) {
      const key =
        `${cursor.contentId}:${cursor.sectionId}:${cursor.anchorId}`;

      if (!this.offeredCursorKeys.has(key)) {
        this.offeredCursorKeys.add(key);

        this.reflection.offeredInvites += 1;

        this.reflection
          .phaseProgress[
            invitePhase
          ].offered += 1;
      }
    }

    this.emit("book_cursor_changed", {
      contentId: cursor.contentId,
      sectionId: cursor.sectionId,
      anchorId: cursor.anchorId,
    });
  }

  private openPhaseInvite(
    payload: Record<string, unknown>,
  ): void {
    const phase =
      requirePhase(payload.phase);

    const returnCursor =
      payload.returnCursor;

    if (
      returnCursor !== undefined &&
      !isBookCursor(returnCursor)
    ) {
      throw new Error(
        "returnCursor inválido.",
      );
    }

    this.phase = phase;
    this.reflection.acceptedInvites += 1;

    if (returnCursor) {
      this.navigation.returnCursor =
        deepClone(returnCursor);
    } else {
      this.navigation.returnCursor =
        deepClone(
          this.navigation.bookCursor,
        );
    }

    this.lastTurn = this.makeTurn({
      questionCount: 1,
      visibleMoves: [
        {
          type: "question",
        },
      ],
      nextMove: {
        kind: "ask_question",
      },
    });

    this.emit(
      "phase_invite_accepted",
      { phase },
    );
  }

  private dismissInvite(
    payload: Record<string, unknown>,
  ): void {
    const phase =
      requirePhase(payload.phase);

    this.reflection.dismissedInvites += 1;
    this.phase = null;

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "phase_invite_dismissed",
      { phase },
    );
  }

  private returnToBook(): void {
    const cursor =
      this.navigation.returnCursor ??
      this.navigation.bookCursor;

    this.navigation.bookCursor =
      deepClone(cursor);

    this.phase = null;

    this.lastTurn = this.makeTurn({
      nextMove: normalizeNextMove({
        kind: "return_to_book",
        bookCursor: cursor,
      }),
    });

    this.emit("returned_to_book", {
      contentId: cursor.contentId,
      sectionId: cursor.sectionId,
      anchorId: cursor.anchorId,
    });
  }

  private answerClosed(
    payload: Record<string, unknown>,
  ): void {
    const phase =
      requirePhase(payload.phase);

    const questionId =
      requireString(
        payload,
        "questionId",
      );

    const optionId =
      requireString(
        payload,
        "optionId",
      );

    this.recordAnswer(
      questionId,
      phase,
    );

    const closedEvidence:
      InterpretationEvidence = {
        source: "closed",
        confidence: 0.3,
        signalIds: [
          "closed_answer_selected",
        ],
      };

    this.interpretationByQuestion.set(
      questionId,
      [closedEvidence],
    );

    const priority =
      this.resolveCurrentPriority();

    this.lastTurn = this.makeTurn({
      responseDepth:
        this.resolveResponseDepth(),

      visibleMoves: [
        {
          type: "mirror",
        },
        {
          type: "micro_return",
        },
      ],

      selectedPriority:
        priority.selected,

      priorityTrace:
        priority.trace,

      interpretation:
        normalizeInterpretation({
          closedEvidence: [
            closedEvidence,
          ],
        }),

      nextMove:
        this.scales.load >= 4
          ? {
              kind: "pause",
              reasonCode:
                "reader_overloaded",
            }
          : {
              kind: "continue_reading",
            },
    });

    this.emit("closed_answer_recorded", {
      phase,
      questionId,
      optionId,
    });
  }

  private answerOpen(
    payload: Record<string, unknown>,
  ): void {
    const phase =
      requirePhase(payload.phase);

    const questionId =
      requireString(
        payload,
        "questionId",
      );

    requireString(payload, "text");

    this.recordAnswer(
      questionId,
      phase,
    );

    const previousEvidence =
      this.interpretationByQuestion.get(
        questionId,
      ) ?? [];

    const correction =
      payload.correctsPreviousClosedAnswer === true;

    const signalId: SignalId =
      correction
        ? "open_answer_correction"
        : "open_answer_received";

    const openEvidence:
      InterpretationEvidence = {
        source: "open",
        confidence: correction
          ? 0.85
          : 0.75,
        signalIds: [signalId],
      };

    const interpretation =
      normalizeInterpretation({
        closedEvidence:
          previousEvidence.filter(
            (evidence) =>
              evidence.source === "closed",
          ),

        openEvidence,
      });

    this.interpretationByQuestion.set(
      questionId,
      interpretation.evidence,
    );

    const priority =
      this.resolveCurrentPriority();

    this.lastTurn = this.makeTurn({
      responseDepth:
        this.resolveResponseDepth(),

      visibleMoves: [
        {
          type: "mirror",
        },
        {
          type: "displacement",
        },
      ],

      selectedPriority:
        priority.selected,

      priorityTrace:
        priority.trace,

      interpretation,

      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit("open_answer_recorded", {
      phase,
      questionId,
      correctsPreviousClosedAnswer:
        correction,
    });
  }

  private skipQuestion(
    payload: Record<string, unknown>,
  ): void {
    const questionId =
      requireString(
        payload,
        "questionId",
      );

    if (
      this.answeredQuestionIds.has(
        questionId,
      ) ||
      this.skippedQuestionIds.has(
        questionId,
      )
    ) {
      return;
    }

    const phase =
      this.phase ?? "consciousness";

    this.skippedQuestionIds.add(
      questionId,
    );

    this.questionPhase.set(
      questionId,
      phase,
    );

    this.reflection.skippedQuestions += 1;

    this.reflection
      .phaseProgress[
        phase
      ].skipped += 1;

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "question_skipped",
      {
        phase,
        questionId,
      },
    );
  }

  private declineWriting(
    payload: Record<string, unknown>,
  ): void {
    const resourceType =
      requireWritingType(
        payload.resourceType,
      );

    this.declinedWriting.add(
      resourceType,
    );

    this.lastTurn = this.makeTurn({
      visibleMoves: [
        {
          type: "pause",
        },
      ],
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "writing_declined",
      { resourceType },
    );
  }

  private openWriting(
    type: WritingResourceType,
    id: string,
  ): void {
    this.writingItems.set(id, {
      id,
      type,
      status: "opened",
      visibility: "private",
      complete: false,
    });

    const intervention =
      type === "journal"
        ? "journal"
        : type === "letter"
          ? "letter"
          : "anchor";

    this.lastTurn = this.makeTurn({
      visibleMoves: [
        {
          type: intervention,
          contentId: id,
        },
      ],
      nextMove: {
        kind:
          type === "journal"
            ? "open_journal"
            : type === "letter"
              ? "open_letter"
              : "open_anchor",
        targetId: id,
      },
    });

    this.emit(
      "private_resource_opened",
      {
        resourceId: id,
        resourceType: type,
      },
    );
  }

  private saveWriting(
    type: "journal" | "letter",
    id: string,
    text: string,
  ): void {
    this.writingItems.set(id, {
      id,
      type,
      status: "saved",
      visibility: "private",
      complete: true,
      content: text,
    });

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "private_resource_saved",
      {
        resourceId: id,
        resourceType: type,
      },
    );
  }

  private interruptAnchor(
    payload: Record<string, unknown>,
  ): void {
    const anchorId =
      requireString(
        payload,
        "anchorId",
      );

    this.writingItems.set(
      anchorId,
      {
        id: anchorId,
        type: "anchor",
        status: "interrupted",
        visibility: "private",
        complete: false,
      },
    );

    this.lastTurn = this.makeTurn({
      visibleMoves: [
        {
          type: "pause",
        },
      ],
      nextMove: {
        kind: "return_to_book",
        bookCursor:
          this.navigation.bookCursor,
      },
    });

    this.emit(
      "anchor_interrupted",
      {
        anchorId,
        stepIndex:
          typeof payload.stepIndex === "number"
            ? payload.stepIndex
            : undefined,
      },
    );
  }

  private refuseMemory(
    payload: Record<string, unknown>,
  ): void {
    const candidateId =
      requireString(
        payload,
        "candidateId",
      );

    this.memoryStore.refuse(
      candidateId,
    );

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "memory_refused",
      { candidateId },
    );
  }

  private editMemory(
    payload: Record<string, unknown>,
  ): void {
    const candidateId =
      requireString(
        payload,
        "candidateId",
      );

    const originalText =
      requireString(
        payload,
        "originalText",
      );

    const editedText =
      requireString(
        payload,
        "editedText",
      );

    if (
      !this.memoryStore.hasCandidate(
        candidateId,
      )
    ) {
      this.memoryStore.propose(
        candidateId,
        originalText,
      );
    }

    this.memoryStore.edit(
      candidateId,
      editedText,
    );

    this.emit(
      "memory_candidate_edited",
      { candidateId },
    );
  }

  private confirmMemory(
    payload: Record<string, unknown>,
  ): void {
    const candidateId =
      requireString(
        payload,
        "candidateId",
      );

    const confirmedText =
      requireString(
        payload,
        "confirmedText",
      );

    if (
      !this.memoryStore.hasCandidate(
        candidateId,
      )
    ) {
      this.memoryStore.propose(
        candidateId,
        confirmedText,
      );
    }

    this.memoryStore.confirm(
      candidateId,
      confirmedText,
    );

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
      },
    });

    this.emit(
      "memory_confirmed",
      { candidateId },
    );
  }

  private requestClosure(
    payload: Record<string, unknown>,
  ): void {
    if (payload.synthesis === "partial") {
      this.closureState =
        markClosurePartial();
    }

    this.lastTurn = this.makeTurn({
      visibleMoves: [
        {
          type: "closure",
        },
      ],
      nextMove: {
        kind: "close_pillar",
        targetId: PILLAR_01_ID,
      },
    });

    this.emit(
      "closure_requested",
      {
        mode:
          typeof payload.synthesis === "string"
            ? payload.synthesis
            : "optional",
      },
    );
  }

  private continueToPillar(
    payload: Record<string, unknown>,
  ): void {
    const pillarId =
      payload.pillarId;

    const cursor =
      payload.cursor;

    if (!isPillarId(pillarId)) {
      throw new Error(
        "PillarId de destino inválido.",
      );
    }

    if (!isBookCursor(cursor)) {
      throw new Error(
        "Cursor de destino inválido.",
      );
    }

    this.navigation.targetPillarId =
      pillarId;

    this.navigation.bookCursor =
      deepClone(cursor);

    this.pillarId = pillarId;

    this.lastTurn = this.makeTurn({
      contentReferences:
        this.resolveContentReferences(
          cursor,
        ),

      nextMove: normalizeNextMove({
        kind: "continue_to_pillar",
        targetId: pillarId,
        bookCursor: cursor,
      }),
    });

    this.emit(
      "pillar_transition",
      {
        targetPillarId: pillarId,
        sectionId: cursor.sectionId,
      },
    );
  }

  private injectContentFailure(
    payload: Record<string, unknown>,
  ): void {
    const contentId =
      requireString(
        payload,
        "contentId",
      );

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
        reasonCode:
          "content_reference_missing",
      },

      contentReferenceFailure: {
        active: true,
        failClosed: true,
        inventedReplacement: false,
        failedContentId: contentId,
      },
    });

    this.emit(
      "content_reference_failed",
      { contentId },
    );
  }

  private emitSafetySignal(
    payload: Record<string, unknown>,
  ): void {
    const signalId =
      typeof payload.signalId === "string"
        ? payload.signalId
        : "safety_high_risk";

    this.safety = {
      active: true,
      reflectionSuspended: true,
      reasonCode: signalId,
    };

    this.readerState = "paused";
    this.phase = null;

    this.lastTurn = this.makeTurn({
      responseDepth: "minimal",

      visibleMoves: [
        {
          type: "pause",
        },
      ],

      selectedPriority: "safety",

      priorityTrace: [
        "safety",
      ],

      nextMove: {
        kind: "safety_stop",
        reasonCode: signalId,
      },
    });

    this.emit(
      "safety_mode_activated",
      { signalId },
    );
  }

  private reopenPillar(
    payload: Record<string, unknown>,
  ): void {
    const pillarId =
      payload.pillarId;

    if (
      pillarId !== PILLAR_01_ID
    ) {
      throw new Error(
        "O Bloco 21 só reabre o Pilar I neste runtime.",
      );
    }

    this.pillarId =
      PILLAR_01_ID;

    this.navigation.targetPillarId =
      null;

    this.navigation.resumeOfferVisible =
      true;

    this.closed = false;

    this.lastTurn = this.makeTurn({
      nextMove: {
        kind: "continue_reading",
        reasonCode:
          "navigation_resume",
      },
    });

    this.emit(
      "pillar_reopened",
      {
        pillarId:
          PILLAR_01_ID,
      },
    );
  }

  private testScaleDelta(
    payload: Record<string, unknown>,
  ): void {
    const scale =
      requireScaleName(
        payload.scale,
      );

    const initial =
      Number(payload.initial);

    const delta =
      Number(payload.delta);

    try {
      const change =
        applyScaleDelta(
          scale,
          initial,
          delta,
        );

      this.debug = {
        ...this.debug,
        lastScaleProbe: {
          accepted: true,
          change,
        },
      };
    } catch (error) {
      this.debug = {
        ...this.debug,
        lastScaleProbe: {
          accepted: false,
          rejectionCode:
            error instanceof Error &&
            "code" in error
              ? String(
                  (
                    error as {
                      code: unknown;
                    }
                  ).code,
                )
              : "INVALID_SCALE_DELTA",
        },
      };
    }
  }

  private testResolvePriority(
    payload: Record<string, unknown>,
  ): void {
    const rawCandidates =
      Array.isArray(payload.candidates)
        ? payload.candidates
        : [];

    const candidates =
      rawCandidates.filter(
        (
          item,
        ): item is PriorityRule =>
          PRIORITY_RULES.includes(
            item as PriorityRule,
          ),
      );

    const result =
      resolvePriority(candidates);

    this.debug = {
      ...this.debug,
      lastPriorityProbe: result,
    };
  }

  private testComposeResponse(
    payload: Record<string, unknown>,
  ): void {
    const rawMoves =
      Array.isArray(
        payload.requestedMoves,
      )
        ? payload.requestedMoves
        : [];

    const requestedMoves:
      VisibleMoveSnapshot[] =
        rawMoves
          .filter(isInterventionType)
          .map((type) => ({
            type,
          }));

    const rawMemoryIds =
      Array.isArray(
        payload.requestedMemoryIds,
      )
        ? payload.requestedMemoryIds
        : [];

    const requestedMemoryIds =
      rawMemoryIds.filter(
        (
          item,
        ): item is string =>
          typeof item === "string",
      );

    const result =
      composeVisibleResponse({
        requestedMoves,
        requestedQuestionCount:
          Number(
            payload.requestedQuestionCount ??
            0,
          ),

        requestedMemoryIds,

        nextMove: {
          kind: "continue_reading",
        },
      });

    this.debug = {
      ...this.debug,
      lastCompositionProbe: result,
    };
  }

  private recordAnswer(
    questionId: string,
    phase: ReflectionPhase,
  ): void {
    if (
      this.answeredQuestionIds.has(
        questionId,
      )
    ) {
      return;
    }

    this.skippedQuestionIds.delete(
      questionId,
    );

    this.answeredQuestionIds.add(
      questionId,
    );

    this.questionPhase.set(
      questionId,
      phase,
    );

    this.reflection.answeredQuestions += 1;

    const phaseProgress =
      this.reflection
        .phaseProgress[phase];

    phaseProgress.answered += 1;

    phaseProgress.complete =
      phaseProgress.answered >= 3;
  }

  private resolveCurrentPriority(): {
    selected: PriorityRule;
    trace: PriorityRule[];
  } {
    if (this.safety.active) {
      return resolvePriority([
        "safety",
      ]);
    }

    const candidates:
      PriorityRule[] = [];

    if (this.scales.load >= 4) {
      candidates.push("overload");
    }

    if (
      this.readerState === "paused"
    ) {
      candidates.push("pause");
    }

    if (
      this.readerState ===
        "defensive" ||
      this.readerState ===
        "oscillating"
    ) {
      candidates.push("state");
    }

    candidates.push("signal");

    return resolvePriority(
      candidates,
    );
  }

  private resolveResponseDepth():
    "minimal" | "standard" | "deep" {
    if (
      this.safety.active ||
      this.scales.load >= 4 ||
      this.readerState === "overloaded"
    ) {
      return "minimal";
    }

    if (
      this.readerState === "defensive"
    ) {
      return "minimal";
    }

    if (
      this.readerState === "integrating" &&
      this.scales.readiness >= 3
    ) {
      return "deep";
    }

    return "standard";
  }

  private resolveContentReferences(
    cursor: BookCursor,
  ): ContentReferenceSnapshot[] {
    const entry =
      this.contentRegistry.resolveByCursor(
        cursor,
      );

    if (!entry) {
      return [];
    }

    return [
      this.contentRegistry.toReference(
        entry,
      ),
    ];
  }

  private autoInvitePhase(
    cursor: BookCursor,
  ): ReflectionPhase | null {
    if (
      cursor.anchorId !==
      "section-end"
    ) {
      return null;
    }

    if (
      cursor.sectionId ===
      "consciousness"
    ) {
      return "consciousness";
    }

    if (
      cursor.sectionId ===
      "judgment"
    ) {
      return "judgment";
    }

    if (
      cursor.sectionId ===
      "presence"
    ) {
      return "presence";
    }

    return null;
  }

  private makeTurn(
    patch: Partial<
      LastTurnSnapshot
    > = {},
  ): LastTurnSnapshot {
    this.turnCounter += 1;

    return {
      turnId:
        `turn-${this.turnCounter}`,

      questionCount: 0,
      responseDepth: null,
      visibleMoves: [],
      usedMemoryIds: [],
      scaleChanges: [],
      selectedPriority: null,
      priorityTrace: [],
      nextMove: null,
      interpretation: null,
      contentReferences: [],
      ...patch,
    };
  }

  private emit(
    eventName: string,
    payload:
      Record<string, unknown>,
  ): void {
    const sanitized =
      sanitizeTelemetryPayload(
        payload,
      );

    this.telemetryEvents.push({
      eventName,
      timestamp:
        this.fixture?.clock.now ??
        new Date().toISOString(),

      payload:
        (
          sanitized &&
          typeof sanitized === "object"
        )
          ? sanitized as
              Record<string, unknown>
          : {},
    });
  }

  private assertReady(): void {
    if (!this.fixture) {
      throw new Error(
        "O runtime precisa receber reset(fixture) antes do uso.",
      );
    }
  }
}
