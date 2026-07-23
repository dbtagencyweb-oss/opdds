// tests/igentmind/pillar-02/block-24/block24.spec.ts

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  REFLECTION_PHASES,
} from "../../../../src/igentmind/core";

import {
  createOptionId,
  createQuestionId,
} from "../../../../src/igentmind/pillars/template";

import {
  PILLAR_02_BLOCK_24,
  PILLAR_02_BLOCK_24_VALIDATION,
  PILLAR_02_OPTIONS,
  PILLAR_02_QUESTIONS,
  PILLAR_02_QUESTIONS_BY_PHASE,
  PILLAR_02_SIGNALS,
  validatePillar02Block24,
} from "../../../../src/igentmind/pillars/pillar-02";

describe(
  "BLOCO 24 — Pilar II: perguntas e respostas",
  () => {
    it(
      "[B24-T01] usa o ID oficial",
      () => {
        expect(
          PILLAR_02_BLOCK_24.pillarId,
        ).toBe(
          "pillar_02_familia",
        );

        expect(
          JSON.stringify(
            PILLAR_02_BLOCK_24,
          ),
        ).not.toContain(
          "pillar_01_vinculo",
        );
      },
    );

    it(
      "[B24-T02] possui nove perguntas",
      () => {
        expect(
          PILLAR_02_QUESTIONS,
        ).toHaveLength(9);

        expect(
          PILLAR_02_BLOCK_24
            .counts.questions,
        ).toBe(9);
      },
    );

    it(
      "[B24-T03] possui três perguntas por fase",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_QUESTIONS_BY_PHASE[
              phase
            ],
          ).toHaveLength(3);
        }
      },
    );

    it(
      "[B24-T04] possui seis opções por pergunta",
      () => {
        for (
          const question
          of PILLAR_02_QUESTIONS
        ) {
          expect(
            question.options,
          ).toHaveLength(6);
        }
      },
    );

    it(
      "[B24-T05] possui 54 opções",
      () => {
        expect(
          PILLAR_02_OPTIONS,
        ).toHaveLength(54);

        expect(
          PILLAR_02_BLOCK_24
            .counts.options,
        ).toBe(54);
      },
    );

    it(
      "[B24-T06] usa IDs estáveis",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          const questions =
            PILLAR_02_QUESTIONS_BY_PHASE[
              phase
            ];

          questions.forEach(
            (
              question,
              questionIndex,
            ) => {
              expect(
                question.id,
              ).toBe(
                createQuestionId(
                  2,
                  phase,
                  (
                    questionIndex + 1
                  ) as 1 | 2 | 3,
                ),
              );

              question.options.forEach(
                (
                  option,
                  optionIndex,
                ) => {
                  expect(
                    option.id,
                  ).toBe(
                    createOptionId(
                      question.id,
                      optionIndex + 1,
                    ),
                  );
                },
              );
            },
          );
        }
      },
    );

    it(
      "[B24-T07] não possui IDs duplicados",
      () => {
        const questionIds =
          PILLAR_02_QUESTIONS.map(
            (question) =>
              question.id,
          );

        const optionIds =
          PILLAR_02_OPTIONS.map(
            (option) =>
              option.id,
          );

        expect(
          new Set(questionIds).size,
        ).toBe(
          questionIds.length,
        );

        expect(
          new Set(optionIds).size,
        ).toBe(
          optionIds.length,
        );
      },
    );

    it(
      "[B24-T08] preserva três perguntas canônicas",
      () => {
        const canonical =
          PILLAR_02_QUESTIONS.filter(
            (question) =>
              question.prompt
                .editorialOrigin ===
              "book_exact",
          );

        expect(canonical).toHaveLength(3);

        expect(
          canonical.every(
            (question) =>
              question.phase ===
              "consciousness",
          ),
        ).toBe(true);

        expect(
          canonical.map(
            (question) =>
              question.prompt.text,
          ),
        ).toEqual([
          "Em que momentos da minha vida adulta eu me sinto pequeno de novo?",
          "Onde eu me contenho mesmo estando seguro?",
          "Onde eu continuo tentando manter um equilíbrio que não é meu dever sustentar?",
        ]);
      },
    );

    it(
      "[B24-T09] identifica seis perguntas complementares",
      () => {
        const companion =
          PILLAR_02_QUESTIONS.filter(
            (question) =>
              question.prompt
                .editorialOrigin ===
              "igent_companion",
          );

        expect(companion).toHaveLength(6);

        expect(
          companion.every(
            (question) =>
              question.phase ===
                "judgment" ||
              question.phase ===
                "presence",
          ),
        ).toBe(true);
      },
    );

    it(
      "[B24-T10] mantém opções e respostas como companion fixed",
      () => {
        for (
          const option
          of PILLAR_02_OPTIONS
        ) {
          expect(
            option.label,
          ).toMatchObject({
            editorialOrigin:
              "igent_companion",

            generationMode:
              "fixed",
          });

          expect(
            option.responses.minimal,
          ).toMatchObject({
            editorialOrigin:
              "igent_companion",

            generationMode:
              "fixed",
          });

          expect(
            option.responses.standard,
          ).toMatchObject({
            editorialOrigin:
              "igent_companion",

            generationMode:
              "fixed",
          });

          expect(
            option.responses.deep,
          ).toMatchObject({
            editorialOrigin:
              "igent_companion",

            generationMode:
              "fixed",
          });
        }
      },
    );

    it(
      "[B24-T11] possui três profundidades distintas por opção",
      () => {
        for (
          const option
          of PILLAR_02_OPTIONS
        ) {
          const texts = [
            option.responses
              .minimal.text,

            option.responses
              .standard.text,

            option.responses
              .deep.text,
          ];

          expect(
            new Set(texts).size,
          ).toBe(3);

          expect(
            texts.every(
              (text) =>
                text.trim().length > 0,
            ),
          ).toBe(true);
        }
      },
    );

    it(
      "[B24-T12] possui resposta aberta em toda pergunta",
      () => {
        for (
          const question
          of PILLAR_02_QUESTIONS
        ) {
          expect(
            question.allowOpenAnswer,
          ).toBe(true);

          expect(
            question.openResponse
              .minimal.text,
          ).not.toBe("");

          expect(
            question.openResponse
              .standard.text,
          ).not.toBe("");

          expect(
            question.openResponse
              .deep.text,
          ).not.toBe("");
        }
      },
    );

    it(
      "[B24-T13] mantém confiança fechada baixa",
      () => {
        for (
          const option
          of PILLAR_02_OPTIONS
        ) {
          expect(
            option.signals.length,
          ).toBeGreaterThan(0);

          for (
            const binding
            of option.signals
          ) {
            expect(
              binding.confidence,
            ).toBeLessThanOrEqual(
              0.35,
            );
          }
        }
      },
    );

    it(
      "[B24-T14] referencia somente sinais registrados",
      () => {
        const signalIds =
          new Set(
            PILLAR_02_SIGNALS.map(
              (signal) =>
                signal.id,
            ),
          );

        for (
          const option
          of PILLAR_02_OPTIONS
        ) {
          for (
            const binding
            of option.signals
          ) {
            expect(
              signalIds.has(
                binding.signalId,
              ),
            ).toBe(true);
          }
        }
      },
    );

    it(
      "[B24-T15] usa apenas deltas permitidos",
      () => {
        for (
          const option
          of PILLAR_02_OPTIONS
        ) {
          for (
            const effect
            of option.scaleEffects
          ) {
            expect(
              [-1, 0, 1],
            ).toContain(
              effect.delta,
            );
          }
        }
      },
    );

    it(
      "[B24-T16] nenhuma opção isolada cria padrão",
      () => {
        for (
          const question
          of PILLAR_02_QUESTIONS
        ) {
          expect(
            question.options.length,
          ).toBe(6);

          for (
            const option
            of question.options
          ) {
            expect(
              option.signals.every(
                (signal) =>
                  signal.confidence <=
                  0.35,
              ),
            ).toBe(true);
          }
        }
      },
    );

    it(
      "[B24-T17] cobre as três direções editoriais",
      () => {
        const consciousnessText =
          JSON.stringify(
            PILLAR_02_QUESTIONS_BY_PHASE
              .consciousness,
          );

        const judgmentText =
          JSON.stringify(
            PILLAR_02_QUESTIONS_BY_PHASE
              .judgment,
          );

        const presenceText =
          JSON.stringify(
            PILLAR_02_QUESTIONS_BY_PHASE
              .presence,
          );

        expect(
          consciousnessText,
        ).toContain(
          "p02_learned_role",
        );

        expect(
          consciousnessText,
        ).toContain(
          "p02_inherited_silence",
        );

        expect(
          judgmentText,
        ).toContain(
          "p02_family_guilt",
        );

        expect(
          judgmentText,
        ).toContain(
          "p02_emotional_debt",
        );

        expect(
          judgmentText,
        ).toContain(
          "p02_disloyalty_fear",
        );

        expect(
          presenceText,
        ).toContain(
          "p02_boundary_presence",
        );

        expect(
          presenceText,
        ).toContain(
          "p02_non_erasing_belonging",
        );

        expect(
          presenceText,
        ).toContain(
          "p02_ambivalence_capacity",
        );
      },
    );

    it(
      "[B24-T18] não prescreve decisão familiar externa",
      () => {
        const serialized =
          JSON.stringify(
            PILLAR_02_QUESTIONS,
          ).toLowerCase();

        const prohibited = [
          "abandone sua família",
          "rompa com sua família",
          "corte sua família",
          "confronte sua família",
          "sua família é tóxica",
          "seus pais são culpados",
          "você deve perdoar",
          "você precisa se afastar",
        ];

        for (
          const expression
          of prohibited
        ) {
          expect(
            serialized,
          ).not.toContain(
            expression,
          );
        }
      },
    );

    it(
      "[B24-T19] valida integralmente o pacote",
      () => {
        const validation =
          validatePillar02Block24(
            PILLAR_02_QUESTIONS,
          );

        expect(
          validation.errors,
        ).toEqual([]);

        expect(
          validation.valid,
        ).toBe(true);

        expect(
          PILLAR_02_BLOCK_24_VALIDATION
            .valid,
        ).toBe(true);
      },
    );

    it(
      "[B24-T20] está pronto para os recursos do Bloco 25",
      () => {
        expect(
          PILLAR_02_BLOCK_24.status,
        ).toBe(
          "question_package_complete",
        );

        expect(
          PILLAR_02_BLOCK_24
            .readyForResources,
        ).toBe(true);
      },
    );
  },
);
