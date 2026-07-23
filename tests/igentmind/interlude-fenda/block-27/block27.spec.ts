import { describe, expect, it } from "vitest";

import { PILLAR_02_IMMEDIATE_CONTINUATION } from "../../../../src/igentmind/pillars/pillar-02/pillar-02.continuation";

import {
  INTERLUDE_FENDA_BLOCK_27,
  INTERLUDE_FENDA_BLOCK_27_VALIDATION,
  INTERLUDE_FENDA_CANONICAL_SECTIONS,
  INTERLUDE_FENDA_CLOSURE,
  INTERLUDE_FENDA_EXIT_TARGET,
  INTERLUDE_FENDA_EXPECTED_COUNTS,
  INTERLUDE_FENDA_ID,
  INTERLUDE_FENDA_IDENTITY,
  INTERLUDE_FENDA_INVITATIONS,
  INTERLUDE_FENDA_MICRO_RETURNS,
  INTERLUDE_FENDA_NEXT_PILLAR_ID,
  INTERLUDE_FENDA_PACKAGE,
  INTERLUDE_FENDA_PREDICTIVE_RULES,
  INTERLUDE_FENDA_PUBLICATION_ARTIFACT,
  INTERLUDE_FENDA_SIGNALS,
  INTERLUDE_FENDA_TRANSITIONS,
  assertInterludeFendaPublicationReady,
  createInterludeFendaChecksum,
  createInterludeFendaClosure,
  getInterludeFendaCounts,
  validateInterludeFendaBlock27,
} from "../../../../src/igentmind/experiences/interlude-fenda";

describe("Bloco 27 — Interlúdio Fenda", () => {
  it("1. usa o ID oficial interlude_fenda", () => {
    expect(INTERLUDE_FENDA_IDENTITY.id).toBe(
      "interlude_fenda",
    );
  });

  it("2. modela Fenda como interlúdio", () => {
    expect(INTERLUDE_FENDA_IDENTITY.kind).toBe(
      "interlude",
    );
  });

  it("3. não conta o Interlúdio como pilar", () => {
    expect(
      INTERLUDE_FENDA_IDENTITY.countsAsPillar,
    ).toBe(false);
  });

  it("4. preserva o Pilar II como origem", () => {
    expect(
      INTERLUDE_FENDA_IDENTITY.previousPillarId,
    ).toBe("pillar_02_familia");
  });

  it("5. preserva pillar_03_luto como próximo pilar", () => {
    expect(
      INTERLUDE_FENDA_IDENTITY.nextPillarId,
    ).toBe("pillar_03_luto");
  });

  it("6. não usa interlude_fenda como PillarId", () => {
    expect(INTERLUDE_FENDA_EXIT_TARGET).toEqual({
      kind: "pillar",
      pillarId: "pillar_03_luto",
    });

    expect(INTERLUDE_FENDA_EXIT_TARGET).not.toEqual({
      kind: "pillar",
      pillarId: INTERLUDE_FENDA_ID,
    });
  });

  it("7. mantém compatibilidade com a continuidade do Pilar II", () => {
    expect(PILLAR_02_IMMEDIATE_CONTINUATION).toEqual({
      kind: "interlude",
      experienceId: "interlude_fenda",
      nextPillarId: "pillar_03_luto",
    });
  });

  it("8. possui dez seções canônicas", () => {
    expect(
      INTERLUDE_FENDA_CANONICAL_SECTIONS,
    ).toHaveLength(10);
  });

  it("9. preserva a ordem das seções canônicas", () => {
    expect(
      INTERLUDE_FENDA_CANONICAL_SECTIONS.map(
        (section) => section.kind,
      ),
    ).toEqual([
      "identity",
      "threshold",
      "manifesto",
      "narrative",
      "consciousness",
      "judgment",
      "presence",
      "support_letter",
      "anchor",
      "closing",
    ]);
  });

  it("10. preserva os títulos canônicos", () => {
    expect(
      INTERLUDE_FENDA_CANONICAL_SECTIONS.map(
        (section) => section.title,
      ),
    ).toEqual([
      "Interlúdio",
      "Fenda",
      "O preço invisível de querer ficar",
      "Quando a rejeição vira identidade",
      "Onde eu me adapto para não ser excluído",
      "Quando querer pertencer vira fraqueza aos próprios olhos",
      "Ficar mesmo com o medo de não caber",
      "Ficar mesmo com o medo de não caber",
      "O exercício do espaço próprio",
      "Pertencer não é se reduzir",
    ]);
  });

  it("11. classifica todas as seções como book_exact e fixed", () => {
    expect(
      INTERLUDE_FENDA_CANONICAL_SECTIONS.every(
        (section) =>
          section.editorialOrigin === "book_exact" &&
          section.generationMode === "fixed",
      ),
    ).toBe(true);
  });

  it("12. referencia o PDF sem duplicar o corpo canônico", () => {
    for (const section of INTERLUDE_FENDA_CANONICAL_SECTIONS) {
      expect(section.bodyPolicy).toBe(
        "canonical_source_reference_only",
      );
      expect(section).not.toHaveProperty("text");
      expect(section).not.toHaveProperty("body");
    }
  });

  it("13. ativa convites somente após as três fases", () => {
    expect(
      INTERLUDE_FENDA_CANONICAL_SECTIONS.filter(
        (section) => section.automaticInviteAfter,
      ).map((section) => section.kind),
    ).toEqual([
      "consciousness",
      "judgment",
      "presence",
    ]);
  });

  it("14. possui três convites complementares", () => {
    expect(INTERLUDE_FENDA_INVITATIONS).toHaveLength(
      3,
    );
  });

  it("15. mantém uma pergunta por turno", () => {
    expect(
      INTERLUDE_FENDA_INVITATIONS.every(
        (invitation) =>
          invitation.oneQuestionPerTurn === true,
      ),
    ).toBe(true);
  });

  it("16. mantém todos os convites opcionais", () => {
    expect(
      INTERLUDE_FENDA_INVITATIONS.every(
        (invitation) =>
          invitation.optional &&
          invitation.blocking === false,
      ),
    ).toBe(true);
  });

  it("17. limita cada convite a dois movimentos visíveis", () => {
    expect(
      INTERLUDE_FENDA_INVITATIONS.every(
        (invitation) =>
          invitation.maxVisibleMoves === 2,
      ),
    ).toBe(true);
  });

  it("18. oferece escrever, pausar ou continuar", () => {
    for (const invitation of INTERLUDE_FENDA_INVITATIONS) {
      expect(
        invitation.choices.map((choice) => choice.id),
      ).toEqual(["write", "pause", "continue"]);
    }
  });

  it("19. não interpreta ações como opções psicológicas", () => {
    for (const invitation of INTERLUDE_FENDA_INVITATIONS) {
      for (const choice of invitation.choices) {
        expect(choice.semanticInterpretation).toBe(
          false,
        );
        expect(choice.createsSignal).toBe(false);
        expect(choice.createsMemory).toBe(false);
      }
    }
  });

  it("20. mantém respostas abertas fora da telemetria", () => {
    expect(
      INTERLUDE_FENDA_INVITATIONS.every(
        (invitation) =>
          invitation.telemetryIncludesAnswer === false,
      ),
    ).toBe(true);
  });

  it("21. exige consentimento explícito para memória", () => {
    expect(
      INTERLUDE_FENDA_INVITATIONS.every(
        (invitation) =>
          invitation.memoryPolicy ===
          "explicit_consent_only",
      ),
    ).toBe(true);
  });

  it("22. possui seis sinais transitórios", () => {
    expect(INTERLUDE_FENDA_SIGNALS).toHaveLength(6);
  });

  it("23. inicia sinais com baixa confiança", () => {
    expect(
      INTERLUDE_FENDA_SIGNALS.every(
        (signal) =>
          signal.initialConfidence === 0.3,
      ),
    ).toBe(true);
  });

  it("24. exige três ocorrências antes de formar padrão", () => {
    expect(
      INTERLUDE_FENDA_SIGNALS.every(
        (signal) =>
          signal.minimumOccurrencesForPattern === 3,
      ),
    ).toBe(true);
  });

  it("25. não diagnostica nem classifica terceiros", () => {
    expect(
      INTERLUDE_FENDA_SIGNALS.every(
        (signal) =>
          signal.diagnostic === false &&
          signal.classifiesThirdParty === false,
      ),
    ).toBe(true);
  });

  it("26. mantém sinais apenas na sessão", () => {
    expect(
      INTERLUDE_FENDA_SIGNALS.every(
        (signal) =>
          signal.persistence === "session_only",
      ),
    ).toBe(true);
  });

  it("27. possui seis micro-retornos", () => {
    expect(
      INTERLUDE_FENDA_MICRO_RETURNS,
    ).toHaveLength(6);
  });

  it("28. distribui dois micro-retornos por fase", () => {
    const phases = [
      "consciousness",
      "judgment",
      "presence",
    ] as const;

    for (const phase of phases) {
      expect(
        INTERLUDE_FENDA_MICRO_RETURNS.filter(
          (item) => item.phase === phase,
        ),
      ).toHaveLength(2);
    }
  });

  it("29. possui seis regras preditivas", () => {
    expect(
      INTERLUDE_FENDA_PREDICTIVE_RULES,
    ).toHaveLength(6);
  });

  it("30. prioriza sobrecarga antes de aprofundamento", () => {
    expect(
      INTERLUDE_FENDA_PREDICTIVE_RULES[0],
    ).toMatchObject({
      priority: "overload",
      action: "offer_pause",
    });
  });

  it("31. respeita a escolha explícita de continuar", () => {
    expect(
      INTERLUDE_FENDA_PREDICTIVE_RULES[1],
    ).toMatchObject({
      priority: "explicit_choice",
      action: "return_to_book",
    });
  });

  it("32. resolve todos os recursos das regras", () => {
    const resourceIds: Set<string> = new Set([
      ...INTERLUDE_FENDA_CANONICAL_SECTIONS.map(
        (section) => section.id,
      ),
      ...INTERLUDE_FENDA_MICRO_RETURNS.map(
        (resource) => resource.id,
      ),
    ]);

    for (const rule of INTERLUDE_FENDA_PREDICTIVE_RULES) {
      if (rule.resourceId) {
        expect(resourceIds.has(rule.resourceId)).toBe(
          true,
        );
      }
    }
  });

  it("33. possui sete transições", () => {
    expect(
      INTERLUDE_FENDA_TRANSITIONS,
    ).toHaveLength(7);
  });

  it("34. inicia na superfície do livro", () => {
    expect(INTERLUDE_FENDA_TRANSITIONS[0]).toMatchObject({
      from: "entry",
      to: "book",
      trigger: "experience_entered",
      blocking: false,
    });
  });

  it("35. retorna de pausa para o livro", () => {
    expect(INTERLUDE_FENDA_TRANSITIONS[6]).toMatchObject({
      from: "pause",
      to: "book",
      trigger: "resume_requested",
      optional: true,
      blocking: false,
    });
  });

  it("36. sai somente para pillar_03_luto", () => {
    expect(INTERLUDE_FENDA_TRANSITIONS[5]).toMatchObject({
      from: "closure",
      to: "exit",
      trigger: "experience_complete",
      target: {
        kind: "pillar",
        pillarId: INTERLUDE_FENDA_NEXT_PILLAR_ID,
      },
    });
  });

  it("37. mantém todas as transições não bloqueantes", () => {
    expect(
      INTERLUDE_FENDA_TRANSITIONS.every(
        (transition) =>
          transition.blocking === false,
      ),
    ).toBe(true);
  });

  it("38. disponibiliza seis rotas de fechamento", () => {
    expect(INTERLUDE_FENDA_CLOSURE.routes).toHaveLength(
      6,
    );
  });

  it("39. preserva carta, âncora e fecho canônicos", () => {
    expect(
      INTERLUDE_FENDA_CLOSURE.routes
        .slice(0, 3)
        .map((route) => route.id),
    ).toEqual([
      "canonical_support_letter",
      "canonical_anchor",
      "canonical_closing",
    ]);
  });

  it("40. permite seguir explicitamente para o Pilar III", () => {
    expect(
      INTERLUDE_FENDA_CLOSURE.routes.at(-1),
    ).toMatchObject({
      id: "continue_to_pillar_03",
      target: {
        kind: "pillar",
        pillarId: "pillar_03_luto",
      },
    });
  });

  it("41. permite concluir sem reflexão", () => {
    const result = createInterludeFendaClosure({
      status: "completed_without_reflection",
      selectedRoute: "continue_to_pillar_03",
    });

    expect(result.complete).toBe(true);
    expect(result.closureComplete).toBe(true);
    expect(result.reflectionComplete).toBe(false);
  });

  it("42. permite fechamento apenas visitado", () => {
    const result = createInterludeFendaClosure({
      status: "visited",
      selectedRoute: "return_to_book",
    });

    expect(result.complete).toBe(false);
    expect(result.closureComplete).toBe(false);
    expect(result.blocksReading).toBe(false);
  });

  it("43. não gera síntese obrigatória", () => {
    const result = createInterludeFendaClosure({
      status: "completed",
      selectedRoute: "continue_to_pillar_03",
    });

    expect(result.synthesisGenerated).toBe(false);
  });

  it("44. apresenta as contagens oficiais do pacote", () => {
    expect(getInterludeFendaCounts()).toEqual(
      INTERLUDE_FENDA_EXPECTED_COUNTS,
    );
  });

  it("45. compila o pacote em modo publication", () => {
    expect(INTERLUDE_FENDA_PACKAGE.mode).toBe(
      "publication",
    );
  });

  it("46. gera checksum estável", () => {
    expect(createInterludeFendaChecksum()).toBe(
      createInterludeFendaChecksum(),
    );
  });

  it("47. não inclui conteúdo privado no manifest", () => {
    expect(
      INTERLUDE_FENDA_PUBLICATION_ARTIFACT.manifest
        .includesReaderPrivateContent,
    ).toBe(false);
  });

  it("48. não bloqueia leitura no manifest", () => {
    expect(
      INTERLUDE_FENDA_PUBLICATION_ARTIFACT.manifest
        .readingBlocked,
    ).toBe(false);
  });

  it("49. não contém o ID legado", () => {
    expect(
      JSON.stringify(INTERLUDE_FENDA_PACKAGE),
    ).not.toContain("pillar_01_vinculo");
  });

  it("50. conclui a validação integral sem erros", () => {
    const validation =
      validateInterludeFendaBlock27();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("51. entrega publication gate pronto", () => {
    expect(
      INTERLUDE_FENDA_BLOCK_27_VALIDATION.valid,
    ).toBe(true);

    expect(
      INTERLUDE_FENDA_PUBLICATION_ARTIFACT.readiness,
    ).toBe(true);

    expect(
      INTERLUDE_FENDA_BLOCK_27.readiness,
    ).toBe(true);

    expect(() =>
      assertInterludeFendaPublicationReady(),
    ).not.toThrow();
  });
});
