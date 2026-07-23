import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PILLAR_03_BLOCK_29,
  PILLAR_03_BLOCK_29_ARTIFACT,
  PILLAR_03_BLOCK_29_VALIDATION,
  PILLAR_03_OPEN_ANSWER_INDEX,
  PILLAR_03_OPTION_INDEX,
  PILLAR_03_QUESTIONS,
  PILLAR_03_QUESTION_INDEX,
  PILLAR_03_SIGNALS,
  assertPillar03Block29Ready,
  createPillar03Block29Checksum,
  getPillar03Block29Counts,
  validatePillar03Block29,
} from "../../../../src/igentmind/pillars/pillar-03";

const SEMANTIC_POSITIONS = [
  "recognition",
  "minimization",
  "defense",
  "ambivalence",
  "desire",
  "uncertainty",
];

describe(
  "Bloco 29 — Perguntas do Pilar III",
  () => {
    it("1. possui nove perguntas", () => {
      expect(
        PILLAR_03_QUESTIONS,
      ).toHaveLength(9);
    });

    it("2. possui três perguntas de Consciência", () => {
      expect(
        PILLAR_03_QUESTIONS.filter(
          (question) =>
            question.phase ===
            "consciousness",
        ),
      ).toHaveLength(3);
    });

    it("3. possui três perguntas de Julgamento", () => {
      expect(
        PILLAR_03_QUESTIONS.filter(
          (question) =>
            question.phase ===
            "judgment",
        ),
      ).toHaveLength(3);
    });

    it("4. possui três perguntas de Presença", () => {
      expect(
        PILLAR_03_QUESTIONS.filter(
          (question) =>
            question.phase ===
            "presence",
        ),
      ).toHaveLength(3);
    });

    it("5. preserva a ordem global de um a nove", () => {
      expect(
        PILLAR_03_QUESTIONS.map(
          (question) => question.order,
        ),
      ).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9,
      ]);
    });

    it("6. preserva três posições internas por fase", () => {
      for (const phase of [
        "consciousness",
        "judgment",
        "presence",
      ] as const) {
        expect(
          PILLAR_03_QUESTIONS.filter(
            (question) =>
              question.phase === phase,
          ).map(
            (question) =>
              question.phaseOrder,
          ),
        ).toEqual([1, 2, 3]);
      }
    });

    it("7. usa o ID oficial do Pilar III", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.pillarId ===
            "pillar_03_luto",
        ),
      ).toBe(true);
    });

    it("8. usa IDs correspondentes às fases", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.id.startsWith(
            `p03_${question.phase}_q`,
          ),
        ).toBe(true);
      }
    });

    it("9. classifica perguntas como conteúdo complementar", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.editorialOrigin ===
            "igent_companion",
        ),
      ).toBe(true);
    });

    it("10. mantém perguntas em modo fixed", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.generationMode ===
            "fixed",
        ),
      ).toBe(true);
    });

    it("11. mantém perguntas opcionais", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.optional === true,
        ),
      ).toBe(true);
    });

    it("12. mantém perguntas não bloqueantes", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.blocking === false,
        ),
      ).toBe(true);
    });

    it("13. mantém uma pergunta por turno", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question
              .oneQuestionPerTurn ===
            true,
        ),
      ).toBe(true);
    });

    it("14. vincula perguntas à seção correspondente", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.canonicalSectionId,
        ).toBe(`p03_${question.phase}`);
      }
    });

    it("15. possui seis opções em cada pergunta", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.options,
        ).toHaveLength(6);
      }
    });

    it("16. possui 54 opções", () => {
      expect(
        PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        ),
      ).toHaveLength(54);
    });

    it("17. preserva as seis posições semânticas", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.options.map(
            (option) =>
              option.semanticPosition,
          ),
        ).toEqual(SEMANTIC_POSITIONS);
      }
    });

    it("18. possui IDs únicos de perguntas", () => {
      const ids =
        PILLAR_03_QUESTIONS.map(
          (question) => question.id,
        );

      expect(
        new Set(ids).size,
      ).toBe(ids.length);
    });

    it("19. possui IDs únicos de opções", () => {
      const ids =
        PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options.map(
              (option) => option.id,
            ),
        );

      expect(
        new Set(ids).size,
      ).toBe(ids.length);
    });

    it("20. começa todas as opções com confiança baixa", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option.interpretationConfidence,
        ).toBe("low");
      }
    });

    it("21. impede opção isolada de formar padrão", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option
            .isolatedSelectionCreatesPattern,
        ).toBe(false);

        expect(
          option.signalBindings.every(
            (binding) =>
              binding
                .createsPatternAlone ===
              false,
          ),
        ).toBe(true);
      }
    });

    it("22. referencia somente sinais existentes", () => {
      const signalIds: Set<string> = new Set(
        PILLAR_03_SIGNALS.map(
          (signal) => signal.id,
        ),
      );

      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (
          const binding
          of option.signalBindings
        ) {
          expect(
            signalIds.has(
              binding.signalId,
            ),
          ).toBe(true);
        }
      }
    });

    it("23. possui um vínculo primário por opção", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option.signalBindings,
        ).toHaveLength(1);

        expect(
          option.signalBindings[0].role,
        ).toBe("primary");
      }
    });

    it("24. usa apenas deltas permitidos", () => {
      const allowed =
        new Set([-1, 0, 1]);

      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (
          const delta
          of Object.values(
            option.scaleEffects,
          )
        ) {
          expect(
            allowed.has(delta),
          ).toBe(true);
        }
      }
    });

    it("25. possui resposta minimal em todas as opções", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option.responses.minimal,
        ).toBeDefined();

        expect(
          option.responses.minimal
            .visibleMoves,
        ).toBe(1);
      }
    });

    it("26. possui resposta standard em todas as opções", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option.responses.standard,
        ).toBeDefined();

        expect(
          option.responses.standard
            .visibleMoves,
        ).toBe(2);
      }
    });

    it("27. possui resposta deep em todas as opções", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        expect(
          option.responses.deep,
        ).toBeDefined();

        expect(
          option.responses.deep
            .visibleMoves,
        ).toBe(3);
      }
    });

    it("28. produz 162 variantes de respostas fechadas", () => {
      expect(
        getPillar03Block29Counts()
          .optionResponseVariants,
      ).toBe(162);
    });

    it("29. limita respostas a três movimentos", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (const depth of [
          "minimal",
          "standard",
          "deep",
        ] as const) {
          expect(
            option.responses[depth]
              .visibleMoves,
          ).toBeLessThanOrEqual(3);

          expect(
            option.responses[depth]
              .blocks,
          ).toHaveLength(
            option.responses[depth]
              .visibleMoves,
          );
        }
      }
    });

    it("30. mantém no máximo uma pergunta em cada resposta", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (const depth of [
          "minimal",
          "standard",
          "deep",
        ] as const) {
          const questionMarks =
            option.responses[
              depth
            ].blocks.reduce(
              (total, block) =>
                total +
                [...block.text].filter(
                  (character) =>
                    character === "?",
                ).length,
              0,
            );

          expect(
            questionMarks,
          ).toBeLessThanOrEqual(1);
        }
      }
    });

    it("31. não diagnostica nas respostas", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (const depth of [
          "minimal",
          "standard",
          "deep",
        ] as const) {
          expect(
            option.responses[depth]
              .diagnostic,
          ).toBe(false);
        }
      }
    });

    it("32. não afirma resolução emocional", () => {
      for (
        const option
        of PILLAR_03_QUESTIONS.flatMap(
          (question) =>
            question.options,
        )
      ) {
        for (const depth of [
          "minimal",
          "standard",
          "deep",
        ] as const) {
          expect(
            option.responses[depth]
              .claimsResolution,
          ).toBe(false);
        }
      }
    });

    it("33. possui resposta aberta em cada pergunta", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.openAnswer.enabled,
        ).toBe(true);

        expect(
          question.openAnswer.prompt,
        ).toBe(
          "Escreva com suas próprias palavras.",
        );
      }
    });

    it("34. prioriza resposta aberta sobre opção fechada", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          question.openAnswer
            .interpretivePriority,
        ).toBe(
          "higher_than_closed_option",
        );

        expect(
          question.openAnswer
            .contradictionOverridesClosedOption,
        ).toBe(true);
      }
    });

    it("35. prioriza as palavras do leitor", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.openAnswer
              .responseMustPrioritizeReaderWords,
        ),
      ).toBe(true);
    });

    it("36. não cria memória automaticamente", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.openAnswer
              .automaticMemoryCreation ===
            false,
        ),
      ).toBe(true);
    });

    it("37. exige consentimento para memória", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.openAnswer
              .memoryRequiresExplicitConsent ===
            true,
        ),
      ).toBe(true);
    });

    it("38. exclui respostas abertas da telemetria", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.openAnswer
              .includedInTelemetry ===
            false,
        ),
      ).toBe(true);
    });

    it("39. exclui respostas abertas do snapshot público", () => {
      expect(
        PILLAR_03_QUESTIONS.every(
          (question) =>
            question.openAnswer
              .includedInPublicSnapshot ===
            false,
        ),
      ).toBe(true);
    });

    it("40. possui três camadas para respostas abertas", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        expect(
          Object.keys(
            question.openAnswer
              .responses,
          ),
        ).toEqual([
          "minimal",
          "standard",
          "deep",
        ]);
      }
    });

    it("41. usa geração templated nas respostas abertas", () => {
      for (
        const question
        of PILLAR_03_QUESTIONS
      ) {
        for (const depth of [
          "minimal",
          "standard",
          "deep",
        ] as const) {
          expect(
            question.openAnswer
              .responses[depth]
              .generationMode,
          ).toBe("templated");
        }
      }
    });

    it("42. produz 27 variantes para respostas abertas", () => {
      expect(
        getPillar03Block29Counts()
          .openAnswerResponseVariants,
      ).toBe(27);
    });

    it("43. cria índice das nove perguntas", () => {
      expect(
        PILLAR_03_QUESTION_INDEX.size,
      ).toBe(9);
    });

    it("44. cria índice das 54 opções", () => {
      expect(
        PILLAR_03_OPTION_INDEX.size,
      ).toBe(54);
    });

    it("45. cria índice das nove respostas abertas", () => {
      expect(
        PILLAR_03_OPEN_ANSWER_INDEX.size,
      ).toBe(9);
    });

    it("46. não referencia recursos dos próximos blocos", () => {
      const serialized =
        JSON.stringify(
          PILLAR_03_QUESTIONS,
        );

      expect(
        serialized,
      ).not.toContain('"resourceId"');

      expect(
        serialized,
      ).not.toContain('"journalId"');

      expect(
        serialized,
      ).not.toContain('"letterId"');

      expect(
        serialized,
      ).not.toContain('"anchorId"');

      expect(
        serialized,
      ).not.toContain('"microReturnId"');
    });

    it("47. não contém o ID legado", () => {
      expect(
        JSON.stringify(
          PILLAR_03_QUESTIONS,
        ),
      ).not.toContain(
        "pillar_01_vinculo",
      );
    });

    it("48. apresenta as contagens finais corretas", () => {
      expect(
        getPillar03Block29Counts(),
      ).toEqual({
        questions: 9,
        options: 54,
        openAnswers: 9,

        minimalOptionResponses: 54,
        standardOptionResponses: 54,
        deepOptionResponses: 54,

        optionResponseVariants: 162,
        openAnswerResponseVariants: 27,

        consciousnessQuestions: 3,
        judgmentQuestions: 3,
        presenceQuestions: 3,
      });
    });

    it("49. gera checksum estável", () => {
      expect(
        createPillar03Block29Checksum(),
      ).toBe(
        createPillar03Block29Checksum(),
      );
    });

    it("50. mantém publicationReady false", () => {
      expect(
        PILLAR_03_BLOCK_29_ARTIFACT
          .publicationReady,
      ).toBe(false);

      expect(
        PILLAR_03_BLOCK_29
          .publicationReady,
      ).toBe(false);
    });

    it("51. indica o Bloco 30 como próximo", () => {
      expect(
        PILLAR_03_BLOCK_29
          .nextRequiredBlock,
      ).toBe(30);

      expect(
        PILLAR_03_BLOCK_29.manifest
          .nextRequiredBlock,
      ).toBe(30);
    });

    it("52. conclui a validação sem erros", () => {
      const validation =
        validatePillar03Block29();

      expect(validation.valid).toBe(
        true,
      );

      expect(
        validation.errors,
      ).toEqual([]);
    });

    it("53. entrega o banco de perguntas pronto", () => {
      expect(
        PILLAR_03_BLOCK_29_VALIDATION
          .valid,
      ).toBe(true);

      expect(
        PILLAR_03_BLOCK_29_ARTIFACT
          .questionBankReady,
      ).toBe(true);

      expect(
        PILLAR_03_BLOCK_29
          .questionBankReady,
      ).toBe(true);

      expect(() =>
        assertPillar03Block29Ready(),
      ).not.toThrow();
    });
  },
);
