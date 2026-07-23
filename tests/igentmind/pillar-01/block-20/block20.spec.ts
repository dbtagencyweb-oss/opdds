// tests/igentmind/pillar-01/block-20/block20.spec.ts

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  Block20Adapter,
  Block20CommandType,
  Block20Fixture,
  Block20Snapshot,
  PILLAR_01_ID,
  PILLAR_02_ID,
} from "./block20.types";

import {
  BASE_FIXTURE,
  BOOK_CURSORS,
  EDITED_MEMORY_TEXT,
  FIXED_NOW,
  OPEN_CORRECTION_TEXT,
  OPTION_IDS,
  ORIGINAL_MEMORY_SUGGESTION,
  PRIVATE_JOURNAL_TEXT,
  PRIVATE_LETTER_TEXT,
  QUESTION_IDS,
  SCENARIO_MATRIX,
} from "./block20.fixtures";

import {
  assertNoPrivateTextInTelemetry,
  auditBlock20Snapshot,
} from "./block20.audit";

import {
  createBlock20Sut,
} from "./block20.sut";

let sut: Block20Adapter;

async function resetWith(
  patch: Partial<Block20Fixture> = {},
): Promise<void> {
  const fixture: Block20Fixture = {
    ...BASE_FIXTURE,
    ...patch,
    scales: {
      ...BASE_FIXTURE.scales,
      ...(patch.scales ?? {}),
    },
    consent: {
      ...BASE_FIXTURE.consent,
      ...(patch.consent ?? {}),
    },
    featureFlags: {
      ...BASE_FIXTURE.featureFlags,
      ...(patch.featureFlags ?? {}),
    },
    clock: {
      ...BASE_FIXTURE.clock,
      ...(patch.clock ?? {}),
    },
  };

  await sut.reset(fixture);
}

async function act(
  type: Block20CommandType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  await sut.dispatch({
    type,
    payload,
    at: FIXED_NOW,
  });
}

async function snapshot(): Promise<Block20Snapshot> {
  return sut.snapshot();
}

function expectBookUnblocked(
  current: Block20Snapshot,
): void {
  expect(current.navigation.blocked).toBe(false);
}

function expectTurnContract(
  current: Block20Snapshot,
): void {
  const turn = current.lastTurn;

  expect(turn).not.toBeNull();

  if (!turn) {
    return;
  }

  expect(turn.questionCount).toBeLessThanOrEqual(1);
  expect(turn.visibleMoves.length).toBeLessThanOrEqual(3);
  expect(turn.usedMemoryIds.length).toBeLessThanOrEqual(1);

  for (const change of turn.scaleChanges) {
    expect([-1, 0, 1]).toContain(change.delta);
    expect(change.after).toBeGreaterThanOrEqual(0);
    expect(change.after).toBeLessThanOrEqual(4);
  }
}

function expectNoAuditErrors(
  current: Block20Snapshot,
): void {
  const errors = auditBlock20Snapshot(current).filter(
    (issue) => issue.severity === "error",
  );

  expect(errors).toEqual([]);
}

async function openPhase(
  phase: "consciousness" | "judgment" | "presence",
  returnCursor:
    | typeof BOOK_CURSORS.consciousnessInvite
    | typeof BOOK_CURSORS.judgmentInvite
    | typeof BOOK_CURSORS.presenceInvite,
): Promise<void> {
  await act("READ_TO", {
    cursor: returnCursor,
  });

  await act("OPEN_PHASE_INVITE", {
    phase,
    returnCursor,
  });
}

async function answerAllQuestions(): Promise<void> {
  const phases = [
    "consciousness",
    "judgment",
    "presence",
  ] as const;

  const phaseCursors = {
    consciousness: BOOK_CURSORS.consciousnessInvite,
    judgment: BOOK_CURSORS.judgmentInvite,
    presence: BOOK_CURSORS.presenceInvite,
  } as const;

  for (const phase of phases) {
    await openPhase(phase, phaseCursors[phase]);

    for (
      let index = 0;
      index < QUESTION_IDS[phase].length;
      index += 1
    ) {
      await act("ANSWER_CLOSED", {
        phase,
        questionId: QUESTION_IDS[phase][index],
        optionId: OPTION_IDS[phase][index],
      });

      expectTurnContract(await snapshot());
    }
  }
}

beforeEach(async () => {
  sut = await createBlock20Sut();
  await resetWith();
});

afterEach(async () => {
  await sut.dispose?.();
});

describe("BLOCO 20 — conexão e fixtures", () => {
  it("[B20-C01] carrega o Pilar I com o ID oficial", async () => {
    const current = await snapshot();

    expect(current.pillarId).toBe(PILLAR_01_ID);
    expect(current.sessionId).toBe(BASE_FIXTURE.sessionId);
    expect(current.readerId).toBe(BASE_FIXTURE.readerId);
    expectBookUnblocked(current);
  });

  it("[B20-C02] possui os 22 cenários obrigatórios", () => {
    expect(SCENARIO_MATRIX).toHaveLength(22);

    expect(
      new Set(SCENARIO_MATRIX.map((item) => item.id)).size,
    ).toBe(22);
  });
});

describe("BLOCO 20 — testes unitários de contrato", () => {
  it("[B20-U01] limita escala superior em quatro", async () => {
    await act("TEST_APPLY_SCALE_DELTA", {
      scale: "awareness",
      initial: 4,
      delta: 1,
    });

    const current = await snapshot();
    const probe = current.debug?.lastScaleProbe;

    expect(probe?.accepted).toBe(true);
    expect(probe?.change).toEqual({
      scale: "awareness",
      before: 4,
      delta: 1,
      after: 4,
    });
  });

  it("[B20-U02] limita escala inferior em zero", async () => {
    await act("TEST_APPLY_SCALE_DELTA", {
      scale: "presence",
      initial: 0,
      delta: -1,
    });

    const current = await snapshot();
    const probe = current.debug?.lastScaleProbe;

    expect(probe?.accepted).toBe(true);
    expect(probe?.change).toEqual({
      scale: "presence",
      before: 0,
      delta: -1,
      after: 0,
    });
  });

  it("[B20-U03] rejeita delta diferente de -1, 0 ou 1", async () => {
    await act("TEST_APPLY_SCALE_DELTA", {
      scale: "agency",
      initial: 2,
      delta: 2,
    });

    const current = await snapshot();
    const probe = current.debug?.lastScaleProbe;

    expect(probe?.accepted).toBe(false);
    expect(probe?.rejectionCode).toBe(
      "INVALID_SCALE_DELTA",
    );
  });

  it("[B20-U04] resolve a prioridade global na ordem definida", async () => {
    await act("TEST_RESOLVE_PRIORITY", {
      candidates: [
        "memory",
        "open_thread",
        "overload",
        "explicit_choice",
        "safety",
      ],
    });

    const current = await snapshot();
    const probe = current.debug?.lastPriorityProbe;

    expect(probe?.selected).toBe("safety");

    expect(probe?.trace).toEqual([
      "safety",
      "explicit_choice",
      "overload",
      "open_thread",
      "memory",
    ]);
  });

  it("[B20-U05] compõe no máximo três movimentos visíveis", async () => {
    await act("TEST_COMPOSE_RESPONSE", {
      requestedMoves: [
        "mirror",
        "displacement",
        "question",
        "journal",
        "anchor",
      ],
      requestedQuestionCount: 2,
      requestedMemoryIds: [
        "memory-01",
        "memory-02",
      ],
    });

    const current = await snapshot();
    const probe = current.debug?.lastCompositionProbe;

    expect(probe?.visibleMoves.length).toBeLessThanOrEqual(
      3,
    );

    expect(probe?.questionCount).toBeLessThanOrEqual(1);
    expect(probe?.usedMemoryIds.length).toBeLessThanOrEqual(
      1,
    );

    expect(probe?.nextMove).toMatchObject({
      kind: expect.any(String),
    });
  });
});

describe("BLOCO 20 — jornadas reais", () => {
  it("[B20-J01] permite leitura integral sem usar o iGentMIND", async () => {
    await act("READ_TO", {
      cursor: BOOK_CURSORS.consciousnessInvite,
    });

    await act("DISMISS_INVITE", {
      phase: "consciousness",
    });

    await act("READ_TO", {
      cursor: BOOK_CURSORS.judgmentInvite,
    });

    await act("DISMISS_INVITE", {
      phase: "judgment",
    });

    await act("READ_TO", {
      cursor: BOOK_CURSORS.presenceInvite,
    });

    await act("DISMISS_INVITE", {
      phase: "presence",
    });

    await act("READ_TO", {
      cursor: BOOK_CURSORS.pillarEnd,
    });

    const current = await snapshot();

    expect(current.navigation.bookCursor).toEqual(
      BOOK_CURSORS.pillarEnd,
    );

    expect(current.reflection.offeredInvites).toBe(3);
    expect(current.reflection.acceptedInvites).toBe(0);
    expect(current.reflection.answeredQuestions).toBe(0);
    expect(current.memory.confirmed).toHaveLength(0);
    expect(current.writing.items).toHaveLength(0);

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J02] aceita apenas uma pergunta e retorna ao livro", async () => {
    await openPhase(
      "consciousness",
      BOOK_CURSORS.consciousnessInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "consciousness",
      questionId: QUESTION_IDS.consciousness[0],
      optionId: OPTION_IDS.consciousness[0],
    });

    const afterAnswer = await snapshot();

    expect(afterAnswer.reflection.answeredQuestions).toBe(1);
    expectTurnContract(afterAnswer);

    await act("EXIT_REFLECTION");

    const current = await snapshot();

    expect(current.reflection.answeredQuestions).toBe(1);

    expect(current.navigation.bookCursor).toEqual(
      BOOK_CURSORS.consciousnessInvite,
    );

    expect(current.navigation.returnCursor).toEqual(
      BOOK_CURSORS.consciousnessInvite,
    );

    expectBookUnblocked(current);
  });

  it("[B20-J03] responde as nove perguntas sem ultrapassar limites", async () => {
    await answerAllQuestions();

    const current = await snapshot();

    expect(current.reflection.answeredQuestions).toBe(9);

    expect(
      current.reflection.phaseProgress.consciousness.complete,
    ).toBe(true);

    expect(
      current.reflection.phaseProgress.judgment.complete,
    ).toBe(true);

    expect(
      current.reflection.phaseProgress.presence.complete,
    ).toBe(true);

    for (const value of Object.values(current.scales)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(4);
    }

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J04] reduz profundidade diante de estado defensivo", async () => {
    await resetWith({
      readerState: "defensive",
    });

    await openPhase(
      "consciousness",
      BOOK_CURSORS.consciousnessInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "consciousness",
      questionId: QUESTION_IDS.consciousness[0],
      optionId: OPTION_IDS.consciousness[0],
    });

    const current = await snapshot();

    expect(current.lastTurn?.responseDepth).not.toBe("deep");

    const moveTypes =
      current.lastTurn?.visibleMoves.map(
        (move) => move.type,
      ) ?? [];

    expect(moveTypes).not.toContain("journal");
    expect(moveTypes).not.toContain("letter");
    expect(moveTypes).not.toContain("anchor");

    expectTurnContract(current);
    expectBookUnblocked(current);
  });

  it("[B20-J05] prioriza pausa ou retorno quando load é quatro", async () => {
    await resetWith({
      readerState: "overloaded",
      scales: {
        ...BASE_FIXTURE.scales,
        load: 4,
      },
    });

    await openPhase(
      "judgment",
      BOOK_CURSORS.judgmentInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "judgment",
      questionId: QUESTION_IDS.judgment[0],
      optionId: OPTION_IDS.judgment[0],
    });

    const current = await snapshot();

    expect(current.lastTurn?.responseDepth).not.toBe("deep");

    expect([
      "pause",
      "return_to_book",
      "continue_reading",
    ]).toContain(current.lastTurn?.nextMove?.kind);

    expect(
      current.lastTurn?.visibleMoves.some(
        (move) =>
          move.type === "journal" ||
          move.type === "letter",
      ),
    ).toBe(false);

    expectBookUnblocked(current);
  });

  it("[B20-J06] permite pular perguntas sem bloquear a progressão", async () => {
    await openPhase(
      "consciousness",
      BOOK_CURSORS.consciousnessInvite,
    );

    await act("SKIP_QUESTION", {
      questionId: QUESTION_IDS.consciousness[0],
    });

    await act("SKIP_QUESTION", {
      questionId: QUESTION_IDS.consciousness[1],
    });

    await act("ANSWER_CLOSED", {
      phase: "consciousness",
      questionId: QUESTION_IDS.consciousness[2],
      optionId: OPTION_IDS.consciousness[2],
    });

    await act("EXIT_REFLECTION");

    const current = await snapshot();

    expect(current.reflection.skippedQuestions).toBe(2);
    expect(current.reflection.answeredQuestions).toBe(1);

    expect(
      current.reflection.phaseProgress.consciousness
        .answered,
    ).toBe(1);

    expect(
      current.reflection.phaseProgress.consciousness
        .skipped,
    ).toBe(2);

    expectBookUnblocked(current);
  });

  it("[B20-J07] respeita recusa de escrita", async () => {
    await openPhase(
      "presence",
      BOOK_CURSORS.presenceInvite,
    );

    await act("DECLINE_WRITING", {
      resourceType: "journal",
    });

    const current = await snapshot();

    expect(current.writing.declinedTypes).toContain(
      "journal",
    );

    expect(
      current.writing.items.some(
        (item) => item.type === "journal",
      ),
    ).toBe(false);

    expect(
      current.lastTurn?.visibleMoves.filter(
        (move) => move.type === "journal",
      ),
    ).toHaveLength(0);

    expectBookUnblocked(current);
  });

  it("[B20-J08] mantém diário totalmente privado", async () => {
    await act("OPEN_JOURNAL", {
      journalId: "p01_journal_01",
    });

    await act("SAVE_PRIVATE_JOURNAL", {
      journalId: "p01_journal_01",
      text: PRIVATE_JOURNAL_TEXT,
    });

    const current = await snapshot();

    const journal = current.writing.items.find(
      (item) => item.id === "p01_journal_01",
    );

    expect(journal).toMatchObject({
      type: "journal",
      status: "saved",
      visibility: "private",
    });

    expect(current.memory.confirmed).toHaveLength(0);

    const privacyIssues =
      assertNoPrivateTextInTelemetry(
        current,
        [PRIVATE_JOURNAL_TEXT],
      );

    expect(privacyIssues).toEqual([]);
    expectNoAuditErrors(current);
  });

  it("[B20-J09] impede envio de carta privada", async () => {
    await act("OPEN_LETTER", {
      letterId: "p01_letter_01",
    });

    await act("SAVE_PRIVATE_LETTER", {
      letterId: "p01_letter_01",
      text: PRIVATE_LETTER_TEXT,
    });

    const current = await snapshot();
    const outbound = await sut.outbound();

    const letter = current.writing.items.find(
      (item) => item.id === "p01_letter_01",
    );

    expect(letter).toMatchObject({
      type: "letter",
      status: "saved",
      visibility: "private",
    });

    expect(outbound).toHaveLength(0);
    expect(current.outbound).toHaveLength(0);

    expect(
      assertNoPrivateTextInTelemetry(
        current,
        [PRIVATE_LETTER_TEXT],
      ),
    ).toEqual([]);
  });

  it("[B20-J10] preserva âncora interrompida como incompleta", async () => {
    await act("OPEN_ANCHOR", {
      anchorId: "p01_anchor_01",
    });

    await act("INTERRUPT_ANCHOR", {
      anchorId: "p01_anchor_01",
      stepIndex: 1,
    });

    const current = await snapshot();

    const anchor = current.writing.items.find(
      (item) => item.id === "p01_anchor_01",
    );

    expect(anchor).toMatchObject({
      type: "anchor",
      status: "interrupted",
      complete: false,
    });

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J11] deixa resposta aberta corrigir opção fechada", async () => {
    await openPhase(
      "judgment",
      BOOK_CURSORS.judgmentInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "judgment",
      questionId: QUESTION_IDS.judgment[0],
      optionId: OPTION_IDS.judgment[0],
    });

    await act("ANSWER_OPEN", {
      phase: "judgment",
      questionId: QUESTION_IDS.judgment[0],
      text: OPEN_CORRECTION_TEXT,
      correctsPreviousClosedAnswer: true,
    });

    const current = await snapshot();
    const interpretation =
      current.lastTurn?.interpretation;

    expect(
      interpretation?.authoritativeSource,
    ).toBe("open");

    const closedEvidence =
      interpretation?.evidence.filter(
        (item) => item.source === "closed",
      ) ?? [];

    expect(closedEvidence.length).toBeGreaterThan(0);

    for (const evidence of closedEvidence) {
      expect(
        evidence.superseded ||
        evidence.confidence <= 0.35,
      ).toBe(true);
    }

    const openEvidence =
      interpretation?.evidence.find(
        (item) => item.source === "open",
      );

    expect(openEvidence).toBeDefined();

    expect(openEvidence?.confidence).toBeGreaterThan(
      Math.max(
        ...closedEvidence.map(
          (evidence) => evidence.confidence,
        ),
      ),
    );
  });

  it("[B20-J12] não cria memória quando o leitor recusa", async () => {
    await act("REFUSE_MEMORY", {
      candidateId: "memory-candidate-01",
      suggestedText: ORIGINAL_MEMORY_SUGGESTION,
    });

    const current = await snapshot();

    expect(current.memory.confirmed).toHaveLength(0);

    expect(
      current.memory.refusedCandidateIds,
    ).toContain("memory-candidate-01");

    expect(
      current.memory.pendingCandidateIds,
    ).not.toContain("memory-candidate-01");

    expect(
      JSON.stringify(current.telemetry),
    ).not.toContain(ORIGINAL_MEMORY_SUGGESTION);
  });

  it("[B20-J13] armazena somente memória editada e confirmada", async () => {
    await act("EDIT_MEMORY", {
      candidateId: "memory-candidate-02",
      originalText: ORIGINAL_MEMORY_SUGGESTION,
      editedText: EDITED_MEMORY_TEXT,
    });

    await act("CONFIRM_MEMORY", {
      candidateId: "memory-candidate-02",
      confirmedText: EDITED_MEMORY_TEXT,
    });

    const current = await snapshot();

    expect(current.memory.confirmed).toHaveLength(1);

    expect(current.memory.confirmed[0]).toMatchObject({
      text: EDITED_MEMORY_TEXT,
      consent: "confirmed",
      source: "reader_confirmed",
      editedBeforeConfirmation: true,
    });

    expect(
      current.memory.confirmed.some(
        (memory) =>
          memory.text === ORIGINAL_MEMORY_SUGGESTION,
      ),
    ).toBe(false);
  });

  it("[B20-J14] conclui fechamento sem síntese", async () => {
    await act("REQUEST_CLOSURE", {
      synthesis: "optional",
    });

    await act("SKIP_SYNTHESIS");

    const current = await snapshot();

    expect(current.closure).toMatchObject({
      status: "completed_without_synthesis",
      complete: true,
      synthesisGenerated: false,
    });

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J15] mantém fechamento parcial como incompleto", async () => {
    await openPhase(
      "consciousness",
      BOOK_CURSORS.consciousnessInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "consciousness",
      questionId: QUESTION_IDS.consciousness[0],
      optionId: OPTION_IDS.consciousness[0],
    });

    await act("REQUEST_CLOSURE", {
      synthesis: "partial",
    });

    const current = await snapshot();

    expect(current.closure.status).toBe("partial");
    expect(current.closure.complete).toBe(false);

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J16] conclui fechamento após reflexão completa", async () => {
    await answerAllQuestions();

    await act("REQUEST_CLOSURE", {
      synthesis: "requested",
    });

    await act("GENERATE_SYNTHESIS");

    const current = await snapshot();

    expect(current.closure.status).toBe("completed");
    expect(current.closure.complete).toBe(true);
    expect(current.closure.synthesisGenerated).toBe(true);

    expect(current.closure.availableRoutes).toEqual(
      expect.arrayContaining([
        "canonical_support_letter",
        "canonical_recognition_ritual",
        "canonical_pillar_closing",
        "pause",
        "pillar_02_familia",
      ]),
    );

    expectNoAuditErrors(current);
  });

  it("[B20-J17] retorna ao ponto exato após reflexão", async () => {
    await act("READ_TO", {
      cursor: BOOK_CURSORS.judgmentInvite,
    });

    await act("OPEN_PHASE_INVITE", {
      phase: "judgment",
      returnCursor: BOOK_CURSORS.judgmentInvite,
    });

    await act("ANSWER_CLOSED", {
      phase: "judgment",
      questionId: QUESTION_IDS.judgment[1],
      optionId: OPTION_IDS.judgment[1],
    });

    await act("RETURN_TO_BOOK");

    const current = await snapshot();

    expect(current.navigation.returnCursor).toEqual(
      BOOK_CURSORS.judgmentInvite,
    );

    expect(current.navigation.bookCursor).toEqual(
      BOOK_CURSORS.judgmentInvite,
    );

    expect(current.lastTurn?.nextMove).toMatchObject({
      kind: "return_to_book",
      bookCursor: BOOK_CURSORS.judgmentInvite,
    });
  });

  it("[B20-J18] continua para Pilar II — Família", async () => {
    await act("READ_TO", {
      cursor: BOOK_CURSORS.pillarEnd,
    });

    await act("CONTINUE_TO_PILLAR", {
      pillarId: PILLAR_02_ID,
      cursor: BOOK_CURSORS.pillar02Start,
    });

    const current = await snapshot();

    expect(current.navigation.targetPillarId).toBe(
      PILLAR_02_ID,
    );

    expect(current.navigation.bookCursor).toEqual(
      BOOK_CURSORS.pillar02Start,
    );

    expect(JSON.stringify(current)).not.toContain(
      "pillar_01_vinculo",
    );
  });

  it("[B20-J19] falha fechado quando referência canônica não existe", async () => {
    await act("INJECT_CONTENT_REFERENCE_FAILURE", {
      contentId: "p01_missing_book_reference",
      expectedEditorialOrigin: "book_exact",
    });

    const current = await snapshot();
    const failure =
      current.lastTurn?.contentReferenceFailure;

    expect(failure).toMatchObject({
      active: true,
      failClosed: true,
      inventedReplacement: false,
      failedContentId: "p01_missing_book_reference",
    });

    expect(current.lastTurn?.nextMove?.kind).toBe(
      "continue_reading",
    );

    expectBookUnblocked(current);
    expectNoAuditErrors(current);
  });

  it("[B20-J20] safety vence estado, progressão e escolha editorial", async () => {
    await act("OPEN_PHASE_INVITE", {
      phase: "presence",
      returnCursor: BOOK_CURSORS.presenceInvite,
    });

    await act("EMIT_SAFETY_SIGNAL", {
      signalId: "high_risk_signal",
      confidence: 1,
    });

    const current = await snapshot();

    expect(current.safety.active).toBe(true);
    expect(current.safety.reflectionSuspended).toBe(true);

    expect(current.lastTurn?.selectedPriority).toBe(
      "safety",
    );

    expect(current.lastTurn?.responseDepth).not.toBe(
      "deep",
    );

    expect(current.lastTurn?.nextMove?.kind).toBe(
      "safety_stop",
    );

    expectNoAuditErrors(current);
  });

  it("[B20-J21] bloqueia conteúdo privado em toda telemetria", async () => {
    await act("OPEN_JOURNAL", {
      journalId: "p01_journal_privacy",
    });

    await act("SAVE_PRIVATE_JOURNAL", {
      journalId: "p01_journal_privacy",
      text: PRIVATE_JOURNAL_TEXT,
    });

    await act("OPEN_LETTER", {
      letterId: "p01_letter_privacy",
    });

    await act("SAVE_PRIVATE_LETTER", {
      letterId: "p01_letter_privacy",
      text: PRIVATE_LETTER_TEXT,
    });

    await openPhase(
      "judgment",
      BOOK_CURSORS.judgmentInvite,
    );

    await act("ANSWER_OPEN", {
      phase: "judgment",
      questionId: QUESTION_IDS.judgment[1],
      text: OPEN_CORRECTION_TEXT,
    });

    const current = await snapshot();

    const issues = assertNoPrivateTextInTelemetry(
      current,
      [
        PRIVATE_JOURNAL_TEXT,
        PRIVATE_LETTER_TEXT,
        OPEN_CORRECTION_TEXT,
      ],
    );

    expect(issues).toEqual([]);

    for (const event of current.telemetry) {
      expect(event.payload).not.toHaveProperty("text");
      expect(event.payload).not.toHaveProperty("content");
      expect(event.payload).not.toHaveProperty("body");
      expect(event.payload).not.toHaveProperty("snippet");
      expect(event.payload).not.toHaveProperty("answer");
    }
  });

  it("[B20-J22] reabre o Pilar I sem duplicar progresso ou memória", async () => {
    await openPhase(
      "consciousness",
      BOOK_CURSORS.consciousnessInvite,
    );

    await act("ANSWER_CLOSED", {
      phase: "consciousness",
      questionId: QUESTION_IDS.consciousness[0],
      optionId: OPTION_IDS.consciousness[0],
    });

    await act("EDIT_MEMORY", {
      candidateId: "memory-reopen-01",
      originalText: ORIGINAL_MEMORY_SUGGESTION,
      editedText: EDITED_MEMORY_TEXT,
    });

    await act("CONFIRM_MEMORY", {
      candidateId: "memory-reopen-01",
      confirmedText: EDITED_MEMORY_TEXT,
    });

    await act("RETURN_TO_BOOK");
    await act("CLOSE_SESSION");

    const beforeReopen = await snapshot();

    await act("REOPEN_PILLAR", {
      pillarId: PILLAR_01_ID,
    });

    const afterReopen = await snapshot();

    expect(
      afterReopen.reflection.answeredQuestions,
    ).toBe(beforeReopen.reflection.answeredQuestions);

    expect(afterReopen.memory.confirmed).toHaveLength(1);

    expect(
      new Set(
        afterReopen.memory.confirmed.map(
          (memory) => memory.id,
        ),
      ).size,
    ).toBe(afterReopen.memory.confirmed.length);

    expect(afterReopen.navigation.bookCursor).toEqual(
      beforeReopen.navigation.bookCursor,
    );

    expect(
      afterReopen.navigation.resumeOfferVisible,
    ).toBe(true);

    expectBookUnblocked(afterReopen);
    expectNoAuditErrors(afterReopen);
  });
});

describe("BLOCO 20 — navegação editorial e regressão", () => {
  it("[B20-R01] não dispara convites em seções proibidas", async () => {
    const forbiddenCursors = [
      BOOK_CURSORS.pillarStart,
      BOOK_CURSORS.limiar,
      BOOK_CURSORS.manifesto,
      BOOK_CURSORS.narrative,
      BOOK_CURSORS.supportLetter,
      BOOK_CURSORS.ritual,
      BOOK_CURSORS.pillarEnd,
    ];

    for (const cursor of forbiddenCursors) {
      const before = await snapshot();

      await act("READ_TO", {
        cursor,
      });

      const after = await snapshot();

      expect(
        after.reflection.offeredInvites,
      ).toBe(before.reflection.offeredInvites);
    }
  });

  it("[B20-R02] dispara convites apenas após as três fases", async () => {
    const allowed = [
      {
        phase: "consciousness",
        cursor: BOOK_CURSORS.consciousnessInvite,
      },
      {
        phase: "judgment",
        cursor: BOOK_CURSORS.judgmentInvite,
      },
      {
        phase: "presence",
        cursor: BOOK_CURSORS.presenceInvite,
      },
    ] as const;

    for (const item of allowed) {
      const before = await snapshot();

      await act("READ_TO", {
        cursor: item.cursor,
      });

      const after = await snapshot();

      expect(
        after.reflection.offeredInvites,
      ).toBe(before.reflection.offeredInvites + 1);

      await act("DISMISS_INVITE", {
        phase: item.phase,
      });
    }
  });

  it("[B20-R03] mantém origem editorial separada do generation_mode", async () => {
    await act("READ_TO", {
      cursor: BOOK_CURSORS.ritual,
    });

    const current = await snapshot();
    const references =
      current.lastTurn?.contentReferences ?? [];

    for (const reference of references) {
      expect(reference).toHaveProperty(
        "editorialOrigin",
      );

      expect(reference).toHaveProperty(
        "generationMode",
      );

      expect(reference).not.toHaveProperty(
        "contentOrigin",
      );

      if (reference.editorialOrigin === "book_exact") {
        expect(reference.generationMode).toBe("fixed");
      }
    }
  });

  it("[B20-R04] não permite ID técnico legado", async () => {
    await answerAllQuestions();

    const current = await snapshot();

    expect(JSON.stringify(current)).not.toContain(
      "pillar_01_vinculo",
    );
  });

  it("[B20-R05] executa auditoria consolidada sem erro estrutural", async () => {
    await answerAllQuestions();

    await act("REQUEST_CLOSURE", {
      synthesis: "requested",
    });

    await act("GENERATE_SYNTHESIS");

    const current = await snapshot();
    const issues = auditBlock20Snapshot(current);

    expect(
      issues.filter(
        (issue) => issue.severity === "error",
      ),
    ).toEqual([]);
  });
});
