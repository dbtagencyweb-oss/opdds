// tests/igentmind/block-21/block21.spec.ts

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  applyScaleDelta,
  assertEditorialCombination,
  completeClosureWithSynthesis,
  completeClosureWithoutSynthesis,
  composeVisibleResponse,
  createCanonicalContentRegistry,
  deriveClosureComplete,
  DomainInvariantError,
  MemoryStore,
  normalizeInterpretation,
  normalizeNextMove,
  PILLAR_01_ID,
  PILLAR_02_ID,
  sanitizeTelemetryPayload,
  SignalRegistry,
} from "../../../src/igentmind/core";

describe(
  "BLOCO 21 — contratos consolidados",
  () => {
    it(
      "[B21-T01] mantém o ID técnico oficial",
      () => {
        expect(PILLAR_01_ID).toBe(
          "pillar_01_reconhecimento",
        );

        expect(PILLAR_01_ID).not.toBe(
          "pillar_01_vinculo",
        );
      },
    );

    it(
      "[B21-T02] separa origem editorial de geração",
      () => {
        expect(() =>
          assertEditorialCombination({
            editorialOrigin:
              "book_exact",
            generationMode: "fixed",
          }),
        ).not.toThrow();

        expect(() =>
          assertEditorialCombination({
            editorialOrigin:
              "book_exact",
            generationMode:
              "generated",
          }),
        ).toThrow(
          DomainInvariantError,
        );
      },
    );

    it(
      "[B21-T03] aplica clamp superior e inferior",
      () => {
        expect(
          applyScaleDelta(
            "awareness",
            4,
            1,
          ).after,
        ).toBe(4);

        expect(
          applyScaleDelta(
            "presence",
            0,
            -1,
          ).after,
        ).toBe(0);
      },
    );

    it(
      "[B21-T04] rejeita delta inválido",
      () => {
        expect(() =>
          applyScaleDelta(
            "agency",
            2,
            2,
          ),
        ).toThrow(
          DomainInvariantError,
        );
      },
    );

    it(
      "[B21-T05] normaliza next_move legado",
      () => {
        expect(
          normalizeNextMove({
            type:
              "continue_to_pillar",
            target_id:
              PILLAR_02_ID,

            cursor: {
              contentId:
                PILLAR_02_ID,
              sectionId:
                "identity",
              anchorId:
                "start",
            },
          }),
        ).toEqual({
          kind:
            "continue_to_pillar",
          targetId:
            PILLAR_02_ID,

          bookCursor: {
            contentId:
              PILLAR_02_ID,
            sectionId:
              "identity",
            anchorId:
              "start",
          },

          reasonCode: undefined,
        });
      },
    );

    it(
      "[B21-T06] limita composição visível",
      () => {
        const result =
          composeVisibleResponse({
            requestedMoves: [
              {
                type: "mirror",
              },
              {
                type:
                  "displacement",
              },
              {
                type: "question",
              },
              {
                type: "journal",
              },
            ],

            requestedQuestionCount: 4,

            requestedMemoryIds: [
              "memory-01",
              "memory-02",
            ],

            nextMove: {
              kind:
                "continue_reading",
            },
          });

        expect(
          result.visibleMoves,
        ).toHaveLength(3);

        expect(
          result.questionCount,
        ).toBe(1);

        expect(
          result.usedMemoryIds,
        ).toEqual([
          "memory-01",
        ]);
      },
    );

    it(
      "[B21-T07] dá prioridade à resposta aberta",
      () => {
        const result =
          normalizeInterpretation({
            closedEvidence: [
              {
                source: "closed",
                confidence: 0.9,
                signalIds: [
                  "closed_answer_selected",
                ],
              },
            ],

            openEvidence: {
              source: "open",
              confidence: 0.8,
              signalIds: [
                "open_answer_correction",
              ],
            },
          });

        expect(
          result.authoritativeSource,
        ).toBe("open");

        expect(
          result.evidence[0]
            .confidence,
        ).toBeLessThanOrEqual(
          0.35,
        );

        expect(
          result.evidence[0]
            .superseded,
        ).toBe(true);
      },
    );

    it(
      "[B21-T08] exige confirmação para memória",
      () => {
        const memory =
          new MemoryStore(
            () =>
              "2026-07-12T13:00:00.000-03:00",
          );

        expect(() =>
          memory.confirm(
            "unknown-memory",
          ),
        ).toThrow(
          DomainInvariantError,
        );

        memory.propose(
          "memory-01",
          "Texto original",
        );

        memory.edit(
          "memory-01",
          "Texto editado",
        );

        const confirmed =
          memory.confirm(
            "memory-01",
            "Texto editado",
          );

        expect(confirmed).toMatchObject({
          text: "Texto editado",
          consent: "confirmed",
          source:
            "reader_confirmed",
          editedBeforeConfirmation:
            true,
        });
      },
    );

    it(
      "[B21-T09] não duplica memória",
      () => {
        const memory =
          new MemoryStore(
            () =>
              "2026-07-12T13:00:00.000-03:00",
          );

        memory.propose(
          "memory-01",
          "Mesmo conteúdo",
        );

        memory.confirm(
          "memory-01",
        );

        memory.propose(
          "memory-02",
          "Mesmo conteúdo",
        );

        memory.confirm(
          "memory-02",
        );

        expect(
          memory.snapshot().confirmed,
        ).toHaveLength(1);
      },
    );

    it(
      "[B21-T10] deriva complete pelo status",
      () => {
        expect(
          deriveClosureComplete(
            "partial",
          ),
        ).toBe(false);

        expect(
          deriveClosureComplete(
            completeClosureWithSynthesis()
              .status,
          ),
        ).toBe(true);

        expect(
          deriveClosureComplete(
            completeClosureWithoutSynthesis()
              .status,
          ),
        ).toBe(true);
      },
    );

    it(
      "[B21-T11] remove conteúdo privado da telemetria",
      () => {
        expect(
          sanitizeTelemetryPayload({
            resourceId:
              "journal-01",

            text:
              "Conteúdo privado",

            nested: {
              body:
                "Carta privada",
              safe:
                "metadata",
            },
          }),
        ).toEqual({
          resourceId:
            "journal-01",

          nested: {
            safe:
              "metadata",
          },
        });
      },
    );

    it(
      "[B21-T12] rejeita sinal local sem registro",
      () => {
        const registry =
          new SignalRegistry();

        expect(() =>
          registry.normalize([
            {
              id:
                "pillar_01_unregistered",
              role: "primary",
              confidence: 0.9,
              source:
                "open_answer",
            },
          ]),
        ).toThrow(
          DomainInvariantError,
        );
      },
    );

    it(
      "[B21-T13] resolve referências canônicas",
      () => {
        const registry =
          createCanonicalContentRegistry();

        const entry =
          registry.resolveByCursor({
            contentId:
              PILLAR_01_ID,
            sectionId:
              "canonical-ritual",
            anchorId:
              "start",
          });

        expect(entry).toMatchObject({
          editorialOrigin:
            "book_exact",
          generationMode:
            "fixed",
          canonical: true,
        });
      },
    );
  },
);
