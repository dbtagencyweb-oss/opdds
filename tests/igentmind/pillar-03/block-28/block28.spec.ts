import { describe, expect, it } from "vitest";

import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_BLOCK_28,
  PILLAR_03_BLOCK_28_ARTIFACT,
  PILLAR_03_BLOCK_28_VALIDATION,
  PILLAR_03_CANONICAL_SECTIONS,
  PILLAR_03_DOSSIER,
  PILLAR_03_ENTRY,
  PILLAR_03_ID,
  PILLAR_03_IDENTITY,
  PILLAR_03_PREDICTIVE_RULES,
  PILLAR_03_SIGNAL_INDEX,
  PILLAR_03_SIGNALS,
  PILLAR_04_ID,
  assertPillar03Block28Ready,
  createPillar03Block28Checksum,
  getPillar03Block28Counts,
  validatePillar03Block28,
  validatePillar03EntryCompatibility,
} from "../../../../src/igentmind/pillars/pillar-03";

describe("Bloco 28 — Pilar III", () => {
  it("1. usa o ID oficial pillar_03_luto", () => {
    expect(PILLAR_03_IDENTITY.id).toBe(
      "pillar_03_luto",
    );
  });

  it("2. preserva o título Luto", () => {
    expect(PILLAR_03_IDENTITY.title).toBe(
      "Luto",
    );
  });

  it("3. preserva o subtítulo canônico", () => {
    expect(PILLAR_03_IDENTITY.subtitle).toBe(
      "Quando a ausência permanece.",
    );
  });

  it("4. preserva o título interno do livro", () => {
    expect(
      PILLAR_03_IDENTITY.internalTitle,
    ).toBe(
      "Pilar III — Luto, Ausência & Quebra de Laços",
    );
  });

  it("5. preserva a frase de abertura", () => {
    expect(
      PILLAR_03_IDENTITY.openingStatement,
    ).toBe(
      "Nem toda perda termina quando alguém parte. Algumas continuam vivendo dentro de nós.",
    );
  });

  it("6. preserva o Pilar II como pilar anterior", () => {
    expect(
      PILLAR_03_IDENTITY.previousPillarId,
    ).toBe(PILLAR_02_ID);
  });

  it("7. recebe entrada imediata do Interlúdio Fenda", () => {
    expect(
      PILLAR_03_IDENTITY.entryExperienceId,
    ).toBe(INTERLUDE_FENDA_ID);
  });

  it("8. preserva o Pilar IV como próximo pilar", () => {
    expect(
      PILLAR_03_IDENTITY.nextPillarId,
    ).toBe(PILLAR_04_ID);
  });

  it("9. não trata interlude_fenda como PillarId", () => {
    expect(PILLAR_03_ENTRY.source).toEqual({
      kind: "interlude",
      experienceId: "interlude_fenda",
    });

    expect(
      PILLAR_03_ENTRY.source,
    ).not.toHaveProperty("pillarId");
  });

  it("10. direciona a entrada para pillar_03_luto", () => {
    expect(PILLAR_03_ENTRY.target).toEqual({
      kind: "pillar",
      pillarId: PILLAR_03_ID,
    });
  });

  it("11. mantém compatibilidade com a saída da Fenda", () => {
    expect(
      validatePillar03EntryCompatibility(),
    ).toBe(true);
  });

  it("12. não torna a entrada automática", () => {
    expect(PILLAR_03_ENTRY.automatic).toBe(
      false,
    );

    expect(
      PILLAR_03_ENTRY
        .explicitChoicePreserved,
    ).toBe(true);
  });

  it("13. não bloqueia a leitura", () => {
    expect(
      PILLAR_03_IDENTITY.blocksReading,
    ).toBe(false);

    expect(
      PILLAR_03_ENTRY.blocksReading,
    ).toBe(false);
  });

  it("14. possui dez seções canônicas", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS,
    ).toHaveLength(10);
  });

  it("15. preserva a ordem canônica", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS.map(
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

  it("16. preserva os dez títulos canônicos", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS.map(
        (section) => section.title,
      ),
    ).toEqual([
      "Luto",
      "Vazio",
      "O que continua doendo depois que tudo já aconteceu",
      "O luto que não teve corpo para cair",
      "O que continua faltando mesmo quando a vida seguiu",
      "Quando sentir saudade vira atraso",
      "Ficar com o vazio sem transformá-lo em fuga",
      "A quem está cansado de provar",
      "O ritual do nome não dito",
      "Nem toda perda se fecha. Mas toda perda ignorada cobra.",
    ]);
  });

  it("17. classifica todas as seções como book_exact", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS.every(
        (section) =>
          section.editorialOrigin ===
          "book_exact",
      ),
    ).toBe(true);
  });

  it("18. mantém generationMode fixed", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS.every(
        (section) =>
          section.generationMode === "fixed",
      ),
    ).toBe(true);
  });

  it("19. não incorpora corpos canônicos", () => {
    for (const section of PILLAR_03_CANONICAL_SECTIONS) {
      expect(section.bodyPolicy).toBe(
        "canonical_source_reference_only",
      );

      expect(section).not.toHaveProperty(
        "body",
      );

      expect(section).not.toHaveProperty(
        "text",
      );

      expect(section).not.toHaveProperty(
        "content",
      );
    }
  });

  it("20. ativa convites somente após as três fases", () => {
    expect(
      PILLAR_03_CANONICAL_SECTIONS.filter(
        (section) =>
          section.automaticInviteAfter,
      ).map((section) => section.kind),
    ).toEqual([
      "consciousness",
      "judgment",
      "presence",
    ]);
  });

  it("21. registra o dossiê como conteúdo complementar", () => {
    expect(
      PILLAR_03_DOSSIER.editorialOrigin,
    ).toBe("igent_companion");

    expect(
      PILLAR_03_DOSSIER.generationMode,
    ).toBe("fixed");
  });

  it("22. não diagnostica o leitor", () => {
    expect(
      PILLAR_03_DOSSIER.diagnosesReader,
    ).toBe(false);
  });

  it("23. não classifica terceiros", () => {
    expect(
      PILLAR_03_DOSSIER
        .classifiesThirdParties,
    ).toBe(false);
  });

  it("24. não exige fechamento emocional", () => {
    expect(
      PILLAR_03_DOSSIER.requiresClosure,
    ).toBe(false);
  });

  it("25. delega segurança para o core", () => {
    expect(
      PILLAR_03_DOSSIER
        .delegatesSafetyToCore,
    ).toBe(true);
  });

  it("26. possui nove sinais", () => {
    expect(PILLAR_03_SIGNALS).toHaveLength(
      9,
    );
  });

  it("27. possui três sinais por fase", () => {
    expect(
      getPillar03Block28Counts(),
    ).toMatchObject({
      consciousnessSignals: 3,
      judgmentSignals: 3,
      presenceSignals: 3,
    });
  });

  it("28. inicia todos os sinais com baixa confiança", () => {
    expect(
      PILLAR_03_SIGNALS.every(
        (signal) =>
          signal.initialConfidence ===
            "low" &&
          signal.initialConfidenceValue ===
            0.3,
      ),
    ).toBe(true);
  });

  it("29. exige três ocorrências antes de formar padrão", () => {
    expect(
      PILLAR_03_SIGNALS.every(
        (signal) =>
          signal.minimumOccurrencesForPattern ===
          3,
      ),
    ).toBe(true);
  });

  it("30. impede opção fechada isolada de formar padrão", () => {
    expect(
      PILLAR_03_SIGNALS.every(
        (signal) =>
          signal
            .isolatedClosedOptionCreatesPattern ===
          false,
      ),
    ).toBe(true);
  });

  it("31. não cria sinais diagnósticos", () => {
    expect(
      PILLAR_03_SIGNALS.every(
        (signal) =>
          signal.diagnostic === false &&
          signal.permanentTrait === false &&
          signal.classifiesThirdParty ===
            false,
      ),
    ).toBe(true);
  });

  it("32. usa apenas deltas -1, 0 ou 1", () => {
    const allowed = new Set([-1, 0, 1]);

    for (const signal of PILLAR_03_SIGNALS) {
      for (const delta of Object.values(
        signal.scaleEffects,
      )) {
        expect(allowed.has(delta)).toBe(
          true,
        );
      }
    }
  });

  it("33. cria índice para todos os sinais", () => {
    expect(
      PILLAR_03_SIGNAL_INDEX.size,
    ).toBe(9);

    for (const signal of PILLAR_03_SIGNALS) {
      expect(
        PILLAR_03_SIGNAL_INDEX.get(
          signal.id,
        ),
      ).toBe(signal);
    }
  });

  it("34. possui nove regras preditivas", () => {
    expect(
      PILLAR_03_PREDICTIVE_RULES,
    ).toHaveLength(9);
  });

  it("35. possui três regras por fase", () => {
    for (const phase of [
      "consciousness",
      "judgment",
      "presence",
    ] as const) {
      expect(
        PILLAR_03_PREDICTIVE_RULES.filter(
          (rule) => rule.phase === phase,
        ),
      ).toHaveLength(3);
    }
  });

  it("36. possui três regras por família", () => {
    expect(
      getPillar03Block28Counts(),
    ).toMatchObject({
      deepeningRules: 3,
      protectionRules: 3,
      integrationRules: 3,
    });
  });

  it("37. mantém todas as regras não bloqueantes", () => {
    expect(
      PILLAR_03_PREDICTIVE_RULES.every(
        (rule) =>
          rule.blocksReading === false,
      ),
    ).toBe(true);
  });

  it("38. preserva a escolha do leitor em todas as regras", () => {
    expect(
      PILLAR_03_PREDICTIVE_RULES.every(
        (rule) =>
          rule.readerChoicePreserved ===
          true,
      ),
    ).toBe(true);
  });

  it("39. delega segurança de todas as regras ao core", () => {
    expect(
      PILLAR_03_PREDICTIVE_RULES.every(
        (rule) =>
          rule.delegatesSafetyToCore ===
          true,
      ),
    ).toBe(true);
  });

  it("40. referencia somente sinais existentes", () => {
    const signalIds: Set<string> = new Set(
      PILLAR_03_SIGNALS.map(
        (signal) => signal.id,
      ),
    );

    for (const rule of PILLAR_03_PREDICTIVE_RULES) {
      for (const condition of rule.conditions) {
        if (
          condition.source === "signal"
        ) {
          expect(
            signalIds.has(condition.key),
          ).toBe(true);
        }
      }
    }
  });

  it("41. não cria resourceId antes dos recursos", () => {
    for (const rule of PILLAR_03_PREDICTIVE_RULES) {
      expect(
        rule.recommendedMove,
      ).not.toHaveProperty("resourceId");
    }
  });

  it("42. marca vínculos futuros para o Bloco 30", () => {
    const intents =
      PILLAR_03_PREDICTIVE_RULES.flatMap(
        (rule) =>
          rule.recommendedMove
            .resourceIntent
            ? [
                rule.recommendedMove
                  .resourceIntent,
              ]
            : [],
      );

    expect(intents.length).toBeGreaterThan(
      0,
    );

    expect(
      intents.every(
        (intent) =>
          intent.bindingStatus ===
          "pending_block_30",
      ),
    ).toBe(true);
  });

  it("43. exige confirmação explícita para futura memória", () => {
    const integrationRule =
      PILLAR_03_PREDICTIVE_RULES.find(
        (rule) =>
          rule.id ===
          "p03_rule_presence_03",
      );

    expect(
      integrationRule?.recommendedMove
        .memoryCandidatePolicy,
    ).toBe("explicit_confirmation_only");
  });

  it("44. não contém o ID legado", () => {
    expect(
      JSON.stringify(PILLAR_03_BLOCK_28),
    ).not.toContain(
      "pillar_01_vinculo",
    );
  });

  it("45. não inclui conteúdo privado", () => {
    const serialized = JSON.stringify(
      PILLAR_03_BLOCK_28,
    );

    expect(serialized).not.toContain(
      "journalEntry",
    );

    expect(serialized).not.toContain(
      "letterBody",
    );

    expect(serialized).not.toContain(
      "openAnswerText",
    );

    expect(serialized).not.toContain(
      "memoryText",
    );
  });

  it("46. apresenta as contagens corretas", () => {
    expect(
      getPillar03Block28Counts(),
    ).toEqual({
      canonicalSections: 10,
      signals: 9,
      predictiveRules: 9,
      consciousnessSignals: 3,
      judgmentSignals: 3,
      presenceSignals: 3,
      deepeningRules: 3,
      protectionRules: 3,
      integrationRules: 3,
    });
  });

  it("47. gera checksum estável", () => {
    expect(
      createPillar03Block28Checksum(),
    ).toBe(
      createPillar03Block28Checksum(),
    );
  });

  it("48. mantém publicationReady false nesta etapa", () => {
    expect(
      PILLAR_03_BLOCK_28_ARTIFACT
        .publicationReady,
    ).toBe(false);

    expect(
      PILLAR_03_BLOCK_28.manifest
        .publicationReady,
    ).toBe(false);
  });

  it("49. indica o Bloco 29 como próximo bloco", () => {
    expect(
      PILLAR_03_BLOCK_28
        .nextRequiredBlock,
    ).toBe(29);

    expect(
      PILLAR_03_BLOCK_28.manifest
        .nextRequiredBlock,
    ).toBe(29);
  });

  it("50. conclui a validação sem erros", () => {
    const validation =
      validatePillar03Block28();

    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("51. entrega a fundação pronta", () => {
    expect(
      PILLAR_03_BLOCK_28_VALIDATION.valid,
    ).toBe(true);

    expect(
      PILLAR_03_BLOCK_28_ARTIFACT
        .foundationReady,
    ).toBe(true);

    expect(
      PILLAR_03_BLOCK_28.foundationReady,
    ).toBe(true);

    expect(() =>
      assertPillar03Block28Ready(),
    ).not.toThrow();
  });
});
