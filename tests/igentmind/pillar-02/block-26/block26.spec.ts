import { describe, expect, it } from "vitest";

import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_BLOCK_26,
  PILLAR_02_BLOCK_26_VALIDATION,
  PILLAR_02_CLOSURE,
  PILLAR_02_ID,
  PILLAR_02_IMMEDIATE_CONTINUATION,
  PILLAR_02_PACKAGE,
  PILLAR_02_PACKAGE_INPUT,
  PILLAR_02_PUBLICATION_ARTIFACT,
  PILLAR_02_RESOURCE_INDEXES,
  PILLAR_02_TRANSITIONS,
  PILLAR_03_ID,
  assertPillar02Block26PublicationReady,
  canBypassInterludeFendaFromPillar02,
  canCreatePillar02MemoryCandidateFrom,
  confirmPillar02MemoryCandidate,
  createEmptyPillar02MemoryStore,
  createPillar02Closure,
  createPillar02MemoryCandidate,
  createPillar02MemoryTelemetry,
  createPillar02PublicationChecksum,
  declinePillar02MemoryCandidate,
  editPillar02MemoryCandidate,
  getPillar02PackageCounts,
  resolveInterludeFendaExit,
  savePillar02ConfirmedMemory,
  selectPillar02MemoryForResponse,
  validatePillar02Block26,
} from "../../../../src/igentmind/pillars/pillar-02";

function createConfirmedMemory(
  candidateId: string,
  memoryId: string,
  text: string,
) {
  const candidate = createPillar02MemoryCandidate({
    candidateId,
    kind: "personal_boundary",
    text,
    origin: "manual_entry",
  });

  return confirmPillar02MemoryCandidate(candidate, memoryId);
}

describe("Bloco 26 — Pilar II", () => {
  it("1. usa o ID oficial pillar_02_familia", () => {
    const identity = PILLAR_02_PACKAGE_INPUT.identity as {
      id?: string;
      pillarId?: string;
    };

    expect(identity.id ?? identity.pillarId).toBe(PILLAR_02_ID);
  });

  it("2. possui exatamente seis transições", () => {
    expect(PILLAR_02_TRANSITIONS).toHaveLength(6);
  });

  it("3. preserva a ordem oficial das transições", () => {
    expect(
      PILLAR_02_TRANSITIONS.map(({ from, to, trigger }) => ({
        from,
        to,
        trigger,
      })),
    ).toEqual([
      {
        from: "book",
        to: "consciousness",
        trigger: "automatic_invite",
      },
      {
        from: "consciousness",
        to: "judgment",
        trigger: "phase_complete",
      },
      {
        from: "judgment",
        to: "presence",
        trigger: "phase_complete",
      },
      {
        from: "presence",
        to: "closure",
        trigger: "phase_complete",
      },
      {
        from: "closure",
        to: "interlude",
        trigger: "pillar_complete",
      },
      {
        from: "pause",
        to: "book",
        trigger: "resume_requested",
      },
    ]);
  });

  it("4. mantém todas as transições opcionais", () => {
    expect(
      PILLAR_02_TRANSITIONS.every((transition) => transition.optional),
    ).toBe(true);
  });

  it("5. mantém todas as transições não bloqueantes", () => {
    expect(
      PILLAR_02_TRANSITIONS.every(
        (transition) => transition.blocking === false,
      ),
    ).toBe(true);
  });

  it("6. retorna de pause para book", () => {
    expect(PILLAR_02_TRANSITIONS[5]).toMatchObject({
      from: "pause",
      to: "book",
      trigger: "resume_requested",
    });
  });

  it("7. continua imediatamente para interlude_fenda", () => {
    expect(PILLAR_02_IMMEDIATE_CONTINUATION).toEqual({
      kind: "interlude",
      experienceId: INTERLUDE_FENDA_ID,
      nextPillarId: PILLAR_03_ID,
    });
  });

  it("8. preserva pillar_03_luto como próximo pilar", () => {
    expect(PILLAR_02_IMMEDIATE_CONTINUATION.nextPillarId).toBe(
      "pillar_03_luto",
    );
  });

  it("9. não trata interlude_fenda como PillarId", () => {
    expect(PILLAR_02_IMMEDIATE_CONTINUATION.kind).toBe("interlude");
    expect(PILLAR_02_IMMEDIATE_CONTINUATION).not.toHaveProperty(
      "pillarId",
    );
  });

  it("10. não permite bypass do Interlúdio", () => {
    expect(
      canBypassInterludeFendaFromPillar02(
        PILLAR_02_IMMEDIATE_CONTINUATION,
      ),
    ).toBe(false);
  });

  it("11. faz o Interlúdio apontar posteriormente para o Pilar III", () => {
    expect(resolveInterludeFendaExit()).toEqual({
      kind: "pillar",
      pillarId: PILLAR_03_ID,
    });
  });

  it("12. cria fechamento parcial com complete false", () => {
    const closure = createPillar02Closure({
      status: "partial",
      reflectionComplete: false,
      selectedRoute: "return_to_book",
    });

    expect(closure.complete).toBe(false);
    expect(closure.closureComplete).toBe(false);
    expect(closure.synthesisGenerated).toBe(false);
  });

  it("13. cria fechamento completo com síntese", () => {
    const closure = createPillar02Closure({
      status: "completed",
      reflectionComplete: true,
      selectedRoute: "interlude_fenda",
      synthesis: "Quero lembrar do limite que reconheci.",
    });

    expect(closure.complete).toBe(true);
    expect(closure.closureComplete).toBe(true);
    expect(closure.synthesisGenerated).toBe(true);
  });

  it("14. rejeita completed sem síntese", () => {
    expect(() =>
      createPillar02Closure({
        status: "completed",
        reflectionComplete: true,
        selectedRoute: "return_to_book",
      }),
    ).toThrow();
  });

  it("15. cria fechamento completo sem síntese", () => {
    const closure = createPillar02Closure({
      status: "completed_without_synthesis",
      reflectionComplete: false,
      selectedRoute: "return_to_book",
    });

    expect(closure.complete).toBe(true);
    expect(closure.closureComplete).toBe(true);
    expect(closure.synthesisGenerated).toBe(false);
    expect(closure).not.toHaveProperty("synthesis");
  });

  it("16. separa reflectionComplete de closureComplete", () => {
    const closure = createPillar02Closure({
      status: "completed_without_synthesis",
      reflectionComplete: false,
      selectedRoute: "interlude_fenda",
    });

    expect(closure.reflectionComplete).toBe(false);
    expect(closure.closureComplete).toBe(true);
  });

  it("17. não exige que todas as perguntas tenham sido respondidas", () => {
    expect(PILLAR_02_CLOSURE.requireAllQuestionsAnswered).toBe(false);
    expect(PILLAR_02_CLOSURE.allowPartialClosure).toBe(true);
  });

  it("18. não bloqueia a leitura no fechamento", () => {
    expect(PILLAR_02_CLOSURE.blocksReading).toBe(false);

    const closure = createPillar02Closure({
      status: "partial",
      reflectionComplete: false,
      selectedRoute: "return_to_book",
    });

    expect(closure.blocksReading).toBe(false);
  });

  it("19. disponibiliza todas as rotas obrigatórias", () => {
    expect(PILLAR_02_CLOSURE.routes.map((route) => route.id)).toEqual([
      "canonical_support_letter",
      "canonical_anchor",
      "canonical_closing",
      "companion_closure",
      "pause",
      "return_to_book",
      "interlude_fenda",
    ]);
  });

  it("20. mantém as rotas canônicas como referências", () => {
    const canonicalRoutes = PILLAR_02_CLOSURE.routes.filter(
      (route) => route.target.kind === "canonical_section",
    );

    expect(canonicalRoutes).toHaveLength(3);

    for (const route of canonicalRoutes) {
      expect(route.target).not.toHaveProperty("text");
    }
  });

  it("21. não permite opção fechada criar memória", () => {
    expect(canCreatePillar02MemoryCandidateFrom("closed_option")).toBe(
      false,
    );
  });

  it("22. não permite diário criar memória automaticamente", () => {
    expect(canCreatePillar02MemoryCandidateFrom("journal")).toBe(false);
  });

  it("23. não permite carta criar memória automaticamente", () => {
    expect(canCreatePillar02MemoryCandidateFrom("letter")).toBe(false);
  });

  it("24. exige confirmação antes de salvar memória", () => {
    const candidate = createPillar02MemoryCandidate({
      candidateId: "candidate_01",
      kind: "learned_role",
      text: "Tento manter o ambiente estável antes de perceber o que sinto.",
      origin: "open_answer",
    });

    expect(candidate.consent).toBe("pending");
    expect(candidate.source).toBe("reader_proposed");

    expect(() =>
      savePillar02ConfirmedMemory(
        createEmptyPillar02MemoryStore(),
        candidate as never,
      ),
    ).toThrow();
  });

  it("25. não salva memória recusada", () => {
    const candidate = createPillar02MemoryCandidate({
      candidateId: "candidate_02",
      kind: "family_guilt",
      text: "Sinto culpa quando penso em escolher diferente.",
      origin: "manual_entry",
    });

    const declined = declinePillar02MemoryCandidate(candidate);

    expect(declined.consent).toBe("declined");
    expect(declined.source).toBe("reader_declined");
    expect(declined).not.toHaveProperty("text");
  });

  it("26. salva somente a versão editada e confirmada", () => {
    const original = createPillar02MemoryCandidate({
      candidateId: "candidate_03",
      kind: "personal_boundary",
      text: "Preciso explicar todos os meus limites.",
      origin: "manual_entry",
    });

    const edited = editPillar02MemoryCandidate(
      original,
      "Posso reconhecer um limite antes de explicá-lo.",
    );

    const confirmed = confirmPillar02MemoryCandidate(
      edited,
      "memory_03",
    );

    expect(confirmed.text).toBe(
      "Posso reconhecer um limite antes de explicá-lo.",
    );
    expect(confirmed.text).not.toBe(original.text);
    expect(confirmed.consent).toBe("confirmed");
    expect(confirmed.source).toBe("reader_confirmed");
  });

  it("27. bloqueia memória duplicada", () => {
    const memory = createConfirmedMemory(
      "candidate_04",
      "memory_04",
      "Posso sustentar um limite sem transformar ninguém em inimigo.",
    );

    const firstStore = savePillar02ConfirmedMemory(
      createEmptyPillar02MemoryStore(),
      memory,
    );

    const secondStore = savePillar02ConfirmedMemory(
      firstStore,
      memory,
    );

    expect(secondStore.memories).toHaveLength(1);
  });

  it("28. usa no máximo uma memória por resposta", () => {
    const memories = [
      createConfirmedMemory(
        "candidate_05",
        "memory_05",
        "Posso perceber o papel antes de cumpri-lo.",
      ),
      createConfirmedMemory(
        "candidate_06",
        "memory_06",
        "Posso separar culpa de responsabilidade.",
      ),
    ];

    expect(selectPillar02MemoryForResponse(memories)).toHaveLength(1);
  });

  it("29. recupera a memória preferida sem ultrapassar uma", () => {
    const memories = [
      createConfirmedMemory(
        "candidate_07",
        "memory_07",
        "Primeira memória.",
      ),
      createConfirmedMemory(
        "candidate_08",
        "memory_08",
        "Segunda memória.",
      ),
    ];

    const selected = selectPillar02MemoryForResponse(
      memories,
      "memory_08",
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].memoryId).toBe("memory_08");
  });

  it("30. mantém conteúdo privado fora da telemetria", () => {
    const memory = createConfirmedMemory(
      "candidate_09",
      "memory_09",
      "Este texto privado não pode entrar na telemetria.",
    );

    const telemetry = createPillar02MemoryTelemetry({
      event: "memory_confirmed",
      memory,
    });

    const serialized = JSON.stringify(telemetry);

    expect(telemetry.includesPrivateContent).toBe(false);
    expect(serialized).not.toContain(memory.text);
    expect(serialized).not.toContain(memory.normalizedFingerprint);
  });

  it("31. compila o pacote final", () => {
    expect(PILLAR_02_PACKAGE).toBeDefined();
    expect(PILLAR_02_BLOCK_26.package).toBe(PILLAR_02_PACKAGE);
  });

  it("32. possui as contagens finais obrigatórias", () => {
    expect(getPillar02PackageCounts()).toEqual({
      canonicalSections: 10,
      signals: 9,
      questions: 9,
      options: 54,
      microReturns: 18,
      journals: 6,
      letters: 3,
      anchors: 3,
      predictiveRules: 9,
      transitions: 6,
    });
  });

  it("33. resolve as três regras preditivas conectadas obrigatórias", () => {
    expect(
      PILLAR_02_RESOURCE_INDEXES.microReturns.has(
        "p02_micro_consciousness_03",
      ),
    ).toBe(true);

    expect(
      PILLAR_02_RESOURCE_INDEXES.anchors.has(
        "p02_anchor_presence_01",
      ),
    ).toBe(true);

    expect(
      PILLAR_02_RESOURCE_INDEXES.journals.has(
        "p02_journal_presence_01",
      ),
    ).toBe(true);
  });

  it("34. gera checksum estável", () => {
    expect(createPillar02PublicationChecksum()).toBe(
      createPillar02PublicationChecksum(),
    );
  });

  it("35. gera manifest sem conteúdo privado", () => {
    expect(
      PILLAR_02_PUBLICATION_ARTIFACT.manifest
        .includesReaderPrivateContent,
    ).toBe(false);

    expect(
      PILLAR_02_PUBLICATION_ARTIFACT.manifest.readingBlocked,
    ).toBe(false);
  });

  it("36. não contém o ID legado pillar_01_vinculo", () => {
    expect(JSON.stringify(PILLAR_02_PACKAGE_INPUT)).not.toContain(
      "pillar_01_vinculo",
    );
  });

  it("37. conclui a validação integral sem erros", () => {
    const validation = validatePillar02Block26();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("38. publica somente quando o gate está pronto", () => {
    expect(PILLAR_02_BLOCK_26_VALIDATION.valid).toBe(true);
    expect(PILLAR_02_PUBLICATION_ARTIFACT.readiness).toBe(true);
    expect(() => assertPillar02Block26PublicationReady()).not.toThrow();
  });
});
