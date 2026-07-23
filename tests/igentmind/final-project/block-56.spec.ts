import {
  describe,
  expect,
  it,
} from "vitest";

import {
  FINAL_PILLAR_PACKAGES,
  FINAL_PROJECT_MANIFEST,
} from "../../../src/igentmind/publication";

describe("iGentMIND final project blocks 30-56", () => {
  it("compila os blocos 30-56 em modo de publicação", () => {
    expect(
      FINAL_PROJECT_MANIFEST.implementedBlocks,
    ).toEqual(
      Array.from(
        { length: 27 },
        (_item, index) => index + 30,
      ),
    );

    expect(
      FINAL_PROJECT_MANIFEST.publicationGate.ready,
    ).toBe(true);

    expect(
      FINAL_PROJECT_MANIFEST.compiledPillarIds,
    ).toHaveLength(9);

    expect(
      FINAL_PROJECT_MANIFEST.compiledPillarIds,
    ).toContain("pillar_01_reconhecimento");

    expect(
      FINAL_PROJECT_MANIFEST.compiledPillarIds,
    ).toContain("pillar_09_vazio");

    expect(
      FINAL_PROJECT_MANIFEST.publicationGate.errors,
    ).toEqual([]);
  });

  it("publica sete pacotes finais sem bloquear a leitura", () => {
    expect(FINAL_PILLAR_PACKAGES).toHaveLength(7);

    for (const pkg of FINAL_PILLAR_PACKAGES) {
      expect(pkg.publicationGate.ready).toBe(true);
      expect(pkg.closure.blocksReading).toBe(false);
      expect(
        pkg.memoryPolicy.requiresExplicitConsent,
      ).toBe(true);
      expect(
        pkg.memoryPolicy.oneMemoryPerResponse,
      ).toBe(true);
    }
  });

  it("mantém o contrato de nove perguntas e 54 opções por pilar", () => {
    for (const pkg of FINAL_PILLAR_PACKAGES) {
      expect(pkg.questions).toHaveLength(9);

      const optionCount =
        pkg.questions.reduce(
          (total, question) =>
            total + question.options.length,
          0,
        );

      expect(optionCount).toBe(54);

      for (const question of pkg.questions) {
        expect(question.oneQuestionPerTurn).toBe(true);
        expect(question.blocksReading).toBe(false);
        expect(question.openAnswer.priority).toBe(
          "higher_than_closed_option",
        );
        expect(
          question.openAnswer.telemetryContentAllowed,
        ).toBe(false);
      }
    }
  });

  it("mantém recursos privados fora da telemetria", () => {
    for (const pkg of FINAL_PILLAR_PACKAGES) {
      const resourcesByKind = new Map<string, number>();

      for (const resource of pkg.resources) {
        resourcesByKind.set(
          resource.kind,
          (resourcesByKind.get(resource.kind) ?? 0) + 1,
        );

        expect(resource.sendAllowed).toBe(false);
        expect(
          resource.telemetryContentAllowed,
        ).toBe(false);
        expect(
          resource.replacesCanonicalContent,
        ).toBe(false);
      }

      expect(resourcesByKind.get("micro_return")).toBe(18);
      expect(resourcesByKind.get("journal")).toBe(6);
      expect(resourcesByKind.get("letter")).toBe(3);
      expect(resourcesByKind.get("anchor")).toBe(3);
    }
  });

  it("conecta regras preditivas, transições, cadernos e encerramento", () => {
    for (const pkg of FINAL_PILLAR_PACKAGES) {
      expect(pkg.predictiveRules).toHaveLength(9);
      expect(pkg.transitions).toHaveLength(6);

      for (const rule of pkg.predictiveRules) {
        expect(rule.blocksReading).toBe(false);
        expect(rule.safetyDelegatedToCore).toBe(true);
      }
    }

    expect(
      FINAL_PROJECT_MANIFEST.publicationGate.counts.notebooks,
    ).toBe(3);
    expect(
      FINAL_PROJECT_MANIFEST.publicationGate.counts.closingExperiences,
    ).toBe(4);
  });

  it("mantém navegação, memória e privacidade como políticas globais", () => {
    expect(
      FINAL_PROJECT_MANIFEST.navigationPolicy.readingNeverBlocked,
    ).toBe(true);
    expect(
      FINAL_PROJECT_MANIFEST.navigationPolicy.returnCursorPreserved,
    ).toBe(true);
    expect(
      FINAL_PROJECT_MANIFEST.navigationPolicy.reflectionsSkippable,
    ).toBe(true);
    expect(
      FINAL_PROJECT_MANIFEST.navigationPolicy.resumeExact,
    ).toBe(true);

    expect(
      FINAL_PROJECT_MANIFEST.journeyMemoryPolicy.consentRequired,
    ).toBe(true);
    expect(
      FINAL_PROJECT_MANIFEST.journeyMemoryPolicy.privateWritingExcluded,
    ).toBe(true);
    expect(
      FINAL_PROJECT_MANIFEST.journeyMemoryPolicy.diagnostic,
    ).toBe(false);
  });

  it("não reintroduz o ID legado do Pilar I", () => {
    expect(
      JSON.stringify(FINAL_PROJECT_MANIFEST),
    ).not.toContain("pillar_01_vinculo");
  });
});
