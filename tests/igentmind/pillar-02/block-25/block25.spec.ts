// tests/igentmind/pillar-02/block-25/block25.spec.ts

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  REFLECTION_PHASES,
} from "../../../../src/igentmind/core";

import {
  createResourceId,
  selectMicroReturn,
} from "../../../../src/igentmind/pillars/template";

import {
  PILLAR_02_ANCHORS,
  PILLAR_02_BLOCK_25,
  PILLAR_02_BLOCK_25_VALIDATION,
  PILLAR_02_JOURNALS,
  PILLAR_02_LETTERS,
  PILLAR_02_MICRO_RETURNS,
  PILLAR_02_PREDICTIVE_RULES_CONNECTED,
  PILLAR_02_RESOURCE_IDS,
  validatePillar02Block25,
} from "../../../../src/igentmind/pillars/pillar-02";

describe(
  "BLOCO 25 — Recursos do Pilar II",
  () => {
    it(
      "[B25-T01] usa o ID oficial",
      () => {
        expect(
          PILLAR_02_BLOCK_25.pillarId,
        ).toBe(
          "pillar_02_familia",
        );

        expect(
          JSON.stringify(
            PILLAR_02_BLOCK_25,
          ),
        ).not.toContain(
          "pillar_01_vinculo",
        );
      },
    );

    it(
      "[B25-T02] possui 18 micro-retornos",
      () => {
        expect(
          PILLAR_02_MICRO_RETURNS,
        ).toHaveLength(18);

        expect(
          PILLAR_02_BLOCK_25
            .counts.microReturns,
        ).toBe(18);
      },
    );

    it(
      "[B25-T03] possui seis micro-retornos por fase",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_MICRO_RETURNS
              .filter(
                (item) =>
                  item.phase === phase,
              ),
          ).toHaveLength(6);
        }
      },
    );

    it(
      "[B25-T04] cobre as seis funções em cada fase",
      () => {
        const expected = [
          "recognition",
          "contradiction",
          "protection",
          "cost",
          "permission",
          "presence",
        ];

        for (
          const phase
          of REFLECTION_PHASES
        ) {
          const functions =
            PILLAR_02_MICRO_RETURNS
              .filter(
                (item) =>
                  item.phase === phase,
              )
              .map(
                (item) =>
                  item.function,
              );

          expect(
            functions,
          ).toEqual(expected);

          expect(
            new Set(functions).size,
          ).toBe(6);
        }
      },
    );

    it(
      "[B25-T05] usa IDs estáveis nos micro-retornos",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          const items =
            PILLAR_02_MICRO_RETURNS
              .filter(
                (item) =>
                  item.phase === phase,
              );

          items.forEach(
            (item, index) => {
              expect(item.id).toBe(
                createResourceId(
                  2,
                  "micro_return",
                  phase,
                  index + 1,
                ),
              );
            },
          );
        }
      },
    );

    it(
      "[B25-T06] possui seis diários privados",
      () => {
        expect(
          PILLAR_02_JOURNALS,
        ).toHaveLength(6);

        for (
          const journal
          of PILLAR_02_JOURNALS
        ) {
          expect(
            journal.visibility,
          ).toBe("private");

          expect(
            journal.exportAllowed,
          ).toBe(false);

          expect(
            journal
              .telemetryContentAllowed,
          ).toBe(false);
        }
      },
    );

    it(
      "[B25-T07] possui dois diários por fase",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_JOURNALS
              .filter(
                (journal) =>
                  journal.phase === phase,
              ),
          ).toHaveLength(2);
        }
      },
    );

    it(
      "[B25-T08] possui três cartas privadas e não enviáveis",
      () => {
        expect(
          PILLAR_02_LETTERS,
        ).toHaveLength(3);

        for (
          const letter
          of PILLAR_02_LETTERS
        ) {
          expect(
            letter.visibility,
          ).toBe("private");

          expect(
            letter.sendAllowed,
          ).toBe(false);

          expect(
            letter
              .telemetryContentAllowed,
          ).toBe(false);

          expect(
            letter.prompt.text,
          ).toContain(
            "não deve ser enviada",
          );
        }
      },
    );

    it(
      "[B25-T09] possui uma carta por fase",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_LETTERS
              .filter(
                (letter) =>
                  letter.phase === phase,
              ),
          ).toHaveLength(1);
        }
      },
    );

    it(
      "[B25-T10] possui três âncoras complementares",
      () => {
        expect(
          PILLAR_02_ANCHORS,
        ).toHaveLength(3);

        for (
          const anchor
          of PILLAR_02_ANCHORS
        ) {
          expect(
            anchor.interruptionAllowed,
          ).toBe(true);

          expect(
            anchor.completionRequired,
          ).toBe(false);

          expect(
            anchor
              .replacesCanonicalAnchor,
          ).toBe(false);
        }
      },
    );

    it(
      "[B25-T11] possui uma âncora por fase",
      () => {
        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_ANCHORS
              .filter(
                (anchor) =>
                  anchor.phase === phase,
              ),
          ).toHaveLength(1);
        }
      },
    );

    it(
      "[B25-T12] possui quatro passos por âncora",
      () => {
        for (
          const anchor
          of PILLAR_02_ANCHORS
        ) {
          expect(
            anchor.steps,
          ).toHaveLength(4);

          anchor.steps.forEach(
            (step, index) => {
              expect(
                step.order,
              ).toBe(index + 1);
            },
          );
        }

        expect(
          PILLAR_02_BLOCK_25
            .counts.anchorSteps,
        ).toBe(12);
      },
    );

    it(
      "[B25-T13] não possui IDs duplicados",
      () => {
        const allIds = [
          ...PILLAR_02_MICRO_RETURNS
            .map(
              (item) => item.id,
            ),

          ...PILLAR_02_JOURNALS
            .map(
              (item) => item.id,
            ),

          ...PILLAR_02_LETTERS
            .map(
              (item) => item.id,
            ),

          ...PILLAR_02_ANCHORS
            .map(
              (item) => item.id,
            ),
        ];

        expect(
          new Set(allIds).size,
        ).toBe(allIds.length);

        expect(
          PILLAR_02_RESOURCE_IDS.size,
        ).toBe(allIds.length);
      },
    );

    it(
      "[B25-T14] preserva nove regras preditivas",
      () => {
        expect(
          PILLAR_02_PREDICTIVE_RULES_CONNECTED,
        ).toHaveLength(9);
      },
    );

    it(
      "[B25-T15] conecta três regras a recursos reais",
      () => {
        const connected =
          PILLAR_02_PREDICTIVE_RULES_CONNECTED
            .filter(
              (rule) =>
                rule.effect
                  .resourceId !==
                undefined,
            );

        expect(
          connected,
        ).toHaveLength(3);

        for (const rule of connected) {
          expect(
            PILLAR_02_RESOURCE_IDS.has(
              rule.effect.resourceId!,
            ),
          ).toBe(true);
        }
      },
    );

    it(
      "[B25-T16] conecta a regra de sobrecarga defensiva a micro-retorno",
      () => {
        const rule =
          PILLAR_02_PREDICTIVE_RULES_CONNECTED
            .find(
              (item) =>
                item.id ===
                "p02_rule_consciousness_02",
            );

        expect(
          rule?.effect.intervention,
        ).toBe("micro_return");

        expect(
          rule?.effect.resourceId,
        ).toBe(
          createResourceId(
            2,
            "micro_return",
            "consciousness",
            3,
          ),
        );
      },
    );

    it(
      "[B25-T17] conecta presença defensiva à âncora",
      () => {
        const rule =
          PILLAR_02_PREDICTIVE_RULES_CONNECTED
            .find(
              (item) =>
                item.id ===
                "p02_rule_presence_01",
            );

        expect(
          rule?.effect.intervention,
        ).toBe("anchor");

        expect(
          rule?.effect.resourceId,
        ).toBe(
          createResourceId(
            2,
            "anchor",
            "presence",
            1,
          ),
        );
      },
    );

    it(
      "[B25-T18] conecta presença disponível ao diário",
      () => {
        const rule =
          PILLAR_02_PREDICTIVE_RULES_CONNECTED
            .find(
              (item) =>
                item.id ===
                "p02_rule_presence_02",
            );

        expect(
          rule?.effect.intervention,
        ).toBe("journal");

        expect(
          rule?.effect.resourceId,
        ).toBe(
          createResourceId(
            2,
            "journal",
            "presence",
            1,
          ),
        );
      },
    );

    it(
      "[B25-T19] seleciona micro-retorno sem repetir o mais recente",
      () => {
        const pillarStub = {
          source: {
            microReturns:
              PILLAR_02_MICRO_RETURNS,
          },
        } as Parameters<
          typeof selectMicroReturn
        >[0];

        const first =
          selectMicroReturn(
            pillarStub,
            {
              phase:
                "consciousness",

              signalIds: [
                "p02_learned_role",
              ],

              preferredFunction:
                "recognition",
            },
          );

        expect(first).not.toBeNull();

        const second =
          selectMicroReturn(
            pillarStub,
            {
              phase:
                "consciousness",

              signalIds: [
                "p02_learned_role",
              ],

              recentlyUsedIds:
                first
                  ? [first.id]
                  : [],
            },
          );

        expect(
          second?.id,
        ).not.toBe(first?.id);
      },
    );

    it(
      "[B25-T20] mantém todos os recursos como companion fixed",
      () => {
        const content = [
          ...PILLAR_02_MICRO_RETURNS
            .map(
              (item) =>
                item.copy,
            ),

          ...PILLAR_02_JOURNALS
            .flatMap(
              (item) => [
                item.title,
                item.prompt,
              ],
            ),

          ...PILLAR_02_LETTERS
            .flatMap(
              (item) => [
                item.title,
                item.prompt,
              ],
            ),

          ...PILLAR_02_ANCHORS
            .flatMap(
              (item) => [
                item.title,
                item.introduction,
                ...item.steps.map(
                  (step) =>
                    step.copy,
                ),
              ],
            ),
        ];

        for (const item of content) {
          expect(item).toMatchObject({
            editorialOrigin:
              "igent_companion",

            generationMode:
              "fixed",
          });
        }
      },
    );

    it(
      "[B25-T21] não contém prescrição de rompimento",
      () => {
        const serialized =
          JSON.stringify({
            microReturns:
              PILLAR_02_MICRO_RETURNS,

            journals:
              PILLAR_02_JOURNALS,

            letters:
              PILLAR_02_LETTERS,

            anchors:
              PILLAR_02_ANCHORS,
          }).toLowerCase();

        const forbidden = [
          "abandone sua família",
          "rompa com sua família",
          "corte sua família",
          "sua família é tóxica",
          "seus pais são culpados",
          "você precisa se afastar",
          "você deve perdoar",
        ];

        for (
          const expression
          of forbidden
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
      "[B25-T22] valida integralmente o pacote",
      () => {
        const validation =
          validatePillar02Block25({
            microReturns:
              PILLAR_02_MICRO_RETURNS,

            journals:
              PILLAR_02_JOURNALS,

            letters:
              PILLAR_02_LETTERS,

            anchors:
              PILLAR_02_ANCHORS,

            predictiveRules:
              PILLAR_02_PREDICTIVE_RULES_CONNECTED,
          });

        expect(
          validation.errors,
        ).toEqual([]);

        expect(
          validation.valid,
        ).toBe(true);

        expect(
          PILLAR_02_BLOCK_25_VALIDATION
            .valid,
        ).toBe(true);
      },
    );

    it(
      "[B25-T23] está pronto para fechamento e transições",
      () => {
        expect(
          PILLAR_02_BLOCK_25.status,
        ).toBe(
          "resource_package_complete",
        );

        expect(
          PILLAR_02_BLOCK_25
            .readyForClosureAndTransitions,
        ).toBe(true);
      },
    );
  },
);
