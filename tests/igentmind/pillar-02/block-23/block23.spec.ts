// tests/igentmind/pillar-02/block-23/block23.spec.ts

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  REFLECTION_PHASES,
} from "../../../../src/igentmind/core";

import {
  PILLAR_02_BLOCK_23,
  PILLAR_02_BLOCK_23_VALIDATION,
  PILLAR_02_CANONICAL_SECTIONS,
  PILLAR_02_PREDICTIVE_RULES,
  PILLAR_02_QUESTION_BLUEPRINTS,
  PILLAR_02_SIGNALS,
  validatePillar02Block23,
} from "../../../../src/igentmind/pillars/pillar-02";

describe(
  "BLOCO 23 — Pilar II: Família",
  () => {
    it(
      "[B23-T01] usa o ID oficial do Pilar II",
      () => {
        expect(
          PILLAR_02_BLOCK_23
            .dossier.identity.id,
        ).toBe(
          "pillar_02_familia",
        );

        expect(
          JSON.stringify(
            PILLAR_02_BLOCK_23,
          ),
        ).not.toContain(
          "pillar_01_vinculo",
        );
      },
    );

    it(
      "[B23-T02] preserva a identidade canônica",
      () => {
        const identity =
          PILLAR_02_BLOCK_23
            .dossier.identity;

        expect(
          identity.title.text,
        ).toBe("Família");

        expect(
          identity.subtitle.text,
        ).toBe(
          "O primeiro lugar onde aprendemos a nos calar.",
        );

        expect(
          identity.openingQuote.text,
        ).toBe(
          "Os primeiros vínculos moldam quem acreditamos precisar ser para continuar pertencendo.",
        );

        expect(
          identity.title.editorialOrigin,
        ).toBe("book_exact");
      },
    );

    it(
      "[B23-T03] preserva as dez seções canônicas",
      () => {
        expect(
          PILLAR_02_CANONICAL_SECTIONS,
        ).toHaveLength(10);

        expect(
          PILLAR_02_CANONICAL_SECTIONS
            .map(
              (section) =>
                section.title.text,
            ),
        ).toEqual([
          "Família",
          "Raiz",
          "O primeiro lugar onde aprendemos a nos calar",
          "O pacto silencioso e a dívida emocional que não termina",
          "Ver o contrato que nunca foi assinado",
          "Quando a moral familiar vira prisão interna",
          "Ficar onde antes você se retraía",
          "Ficar onde antes você se retraía",
          "O exercício da devolução silenciosa",
          "O que te formou não precisa te governar",
        ]);
      },
    );

    it(
      "[B23-T04] possui três sinais por fase",
      () => {
        expect(
          PILLAR_02_SIGNALS,
        ).toHaveLength(9);

        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_SIGNALS.filter(
              (signal) =>
                signal.phase === phase,
            ),
          ).toHaveLength(3);
        }
      },
    );

    it(
      "[B23-T05] mantém confiança inicial baixa",
      () => {
        for (
          const signal
          of PILLAR_02_SIGNALS
        ) {
          expect(
            signal.defaultConfidence,
          ).toBeLessThanOrEqual(
            0.35,
          );
        }
      },
    );

    it(
      "[B23-T06] possui três perguntas por fase",
      () => {
        expect(
          PILLAR_02_QUESTION_BLUEPRINTS,
        ).toHaveLength(9);

        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_QUESTION_BLUEPRINTS
              .filter(
                (question) =>
                  question.phase ===
                    phase,
              ),
          ).toHaveLength(3);
        }
      },
    );

    it(
      "[B23-T07] mantém perguntas canônicas de Consciência",
      () => {
        const questions =
          PILLAR_02_QUESTION_BLUEPRINTS
            .filter(
              (question) =>
                question.phase ===
                  "consciousness",
            );

        expect(
          questions.map(
            (question) =>
              question.prompt.text,
          ),
        ).toEqual([
          "Em que momentos da minha vida adulta eu me sinto pequeno de novo?",
          "Onde eu me contenho mesmo estando seguro?",
          "Onde eu continuo tentando manter um equilíbrio que não é meu dever sustentar?",
        ]);

        expect(
          questions.every(
            (question) =>
              question.prompt
                .editorialOrigin ===
              "book_exact",
          ),
        ).toBe(true);
      },
    );

    it(
      "[B23-T08] identifica perguntas complementares",
      () => {
        const companionQuestions =
          PILLAR_02_QUESTION_BLUEPRINTS
            .filter(
              (question) =>
                question.phase !==
                  "consciousness",
            );

        expect(
          companionQuestions,
        ).toHaveLength(6);

        expect(
          companionQuestions.every(
            (question) =>
              question.prompt
                .editorialOrigin ===
              "igent_companion",
          ),
        ).toBe(true);
      },
    );

    it(
      "[B23-T09] nenhuma pergunta isolada cria padrão",
      () => {
        expect(
          PILLAR_02_QUESTION_BLUEPRINTS
            .every(
              (question) =>
                question.createsPatternAlone ===
                  false &&
                question
                  .closedOptionConfidence ===
                  "low" &&
                question
                  .allowOpenAnswer ===
                  true,
            ),
        ).toBe(true);
      },
    );

    it(
      "[B23-T10] possui três regras por fase",
      () => {
        expect(
          PILLAR_02_PREDICTIVE_RULES,
        ).toHaveLength(9);

        for (
          const phase
          of REFLECTION_PHASES
        ) {
          expect(
            PILLAR_02_PREDICTIVE_RULES
              .filter(
                (rule) =>
                  rule.phase === phase,
              ),
          ).toHaveLength(3);
        }
      },
    );

    it(
      "[B23-T11] regras usam somente sinais registrados",
      () => {
        const signalIds =
          new Set(
            PILLAR_02_SIGNALS.map(
              (signal) => signal.id,
            ),
          );

        for (
          const rule
          of PILLAR_02_PREDICTIVE_RULES
        ) {
          const references = [
            ...(
              rule.condition
                .allSignalIds ?? []
            ),

            ...(
              rule.condition
                .anySignalIds ?? []
            ),
          ];

          for (
            const signalId
            of references
          ) {
            expect(
              signalIds.has(signalId),
            ).toBe(true);
          }
        }
      },
    );

    it(
      "[B23-T12] convites surgem apenas depois das três fases",
      () => {
        const sectionsWithInvite =
          PILLAR_02_CANONICAL_SECTIONS
            .filter(
              (section) =>
                section
                  .automaticInvite ===
                "after_section",
            )
            .map(
              (section) =>
                section.kind,
            );

        expect(
          sectionsWithInvite,
        ).toEqual([
          "consciousness",
          "judgment",
          "presence",
        ]);
      },
    );

    it(
      "[B23-T13] passa pelo Interlúdio Fenda antes de Luto",
      () => {
        const continuation =
          PILLAR_02_BLOCK_23
            .dossier.continuation;

        expect(
          continuation
            .immediateExperienceId,
        ).toBe(
          "interlude_fenda",
        );

        expect(
          continuation.nextPillarId,
        ).toBe(
          "pillar_03_luto",
        );

        expect(
          continuation
            .bypassInterludeAllowed,
        ).toBe(false);
      },
    );

    it(
      "[B23-T14] valida integralmente o artefato",
      () => {
        const report =
          validatePillar02Block23(
            PILLAR_02_BLOCK_23,
          );

        expect(report.errors).toEqual([]);
        expect(report.valid).toBe(true);

        expect(
          PILLAR_02_BLOCK_23_VALIDATION
            .valid,
        ).toBe(true);
      },
    );

    it(
      "[B23-T15] está pronto para expansão das opções",
      () => {
        expect(
          PILLAR_02_BLOCK_23
            .readyForQuestionExpansion,
        ).toBe(true);

        expect(
          PILLAR_02_BLOCK_23.status,
        ).toBe(
          "editorial_blueprint",
        );
      },
    );
  },
);
