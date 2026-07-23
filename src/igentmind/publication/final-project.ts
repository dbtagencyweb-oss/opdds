import type {
  PillarId,
} from "../core";

import type {
  FinalClosingExperience,
  FinalPresenceNotebook,
  FinalProjectManifest,
} from "./final.contracts";

import {
  createFinalPillarPackage,
} from "./final.factory";

import {
  FINAL_PILLAR_MASTER_SPECS,
} from "./master-data";

export const FINAL_PILLAR_PACKAGES =
  Object.freeze(
    FINAL_PILLAR_MASTER_SPECS.map((spec) =>
      createFinalPillarPackage(spec),
    ),
  );

export const FINAL_PRESENCE_NOTEBOOKS =
  Object.freeze([
    {
      id: "caderno_presenca_sobrevivencia",
      block: 31,
      title: "Caderno de Presença — Sobrevivência",
      after: Object.freeze([
        "pillar_01_reconhecimento",
        "pillar_02_familia",
        "pillar_03_luto",
      ]),
      next: "pillar_04_trabalho",
      invitations: Object.freeze([
        "O que eu reconheço sem tentar resolver agora?",
        "Que ausência ainda pede nome?",
        "Onde sobreviver foi suficiente por tempo demais?",
        "Que gesto mínimo me devolve presença hoje?",
        "Como posso voltar ao livro sem me forçar a concluir?",
      ]),
      writingPrivate: true,
      optional: true,
      blocksReading: false,
    },
    {
      id: "caderno_presenca_reconstrucao",
      block: 41,
      title: "Caderno de Presença — Reconstrução",
      after: Object.freeze([
        "pillar_04_trabalho",
        "pillar_05_dor",
        "pillar_06_desejo",
      ]),
      next: "pillar_07_fe",
      invitations: Object.freeze([
        "Que parte de mim está aprendendo a não se abandonar?",
        "Onde posso reconstruir sem transformar tudo em prova?",
        "Que dor pede intervalo antes de resposta?",
        "Que desejo pode existir sem virar sentença?",
        "Como volto ao livro preservando escolha?",
      ]),
      writingPrivate: true,
      optional: true,
      blocksReading: false,
    },
    {
      id: "caderno_presenca_continuidade",
      block: 51,
      title: "Caderno de Presença — Continuidade",
      after: Object.freeze([
        "pillar_07_fe",
        "pillar_08_escassez",
        "pillar_09_vazio",
      ]),
      next: "encerramento_editorial",
      invitations: Object.freeze([
        "O que permanece quando não há resposta final?",
        "Que pequeno sentido ainda se sustenta?",
        "Onde a falta não define mais todo o meu valor?",
        "Como retorno quando o velho juiz reaparece?",
        "Qual continuidade mínima é honesta hoje?",
      ]),
      writingPrivate: true,
      optional: true,
      blocksReading: false,
    },
  ] satisfies readonly FinalPresenceNotebook[]);

export const FINAL_CLOSING_EXPERIENCES =
  Object.freeze([
    {
      id: "carta_final",
      title: "Carta Final",
      kind: "final_letter",
      canonical: true,
      optional: true,
      blocksReading: false,
    },
    {
      id: "epilogo",
      title: "Epílogo",
      kind: "epilogue",
      canonical: true,
      optional: true,
      blocksReading: false,
    },
    {
      id: "posfacio",
      title: "Posfácio",
      kind: "afterword",
      canonical: true,
      optional: true,
      blocksReading: false,
    },
    {
      id: "caderno_reflexao_final",
      title: "Caderno de Reflexão Final",
      kind: "final_reflection_notebook",
      canonical: true,
      optional: true,
      blocksReading: false,
    },
  ] satisfies readonly FinalClosingExperience[]);

const IMPLEMENTED_BLOCKS = Object.freeze(
  Array.from(
    { length: 27 },
    (_item, index) => index + 30,
  ),
);

export const FINAL_COMPILED_PILLAR_IDS =
  Object.freeze([
    "pillar_01_reconhecimento",
    "pillar_02_familia",
    ...FINAL_PILLAR_PACKAGES.map(
      (pkg) => pkg.pillarId,
    ),
  ] satisfies readonly PillarId[]);

function createGateErrors(): readonly string[] {
  const errors: string[] = [];

  for (const pkg of FINAL_PILLAR_PACKAGES) {
    if (!pkg.publicationGate.ready) {
      errors.push(...pkg.publicationGate.errors);
    }

    if (pkg.closure.blocksReading) {
      errors.push(`${pkg.pillarId}: fechamento não pode bloquear leitura.`);
    }

    if (!pkg.memoryPolicy.requiresExplicitConsent) {
      errors.push(`${pkg.pillarId}: memória exige consentimento explícito.`);
    }
  }

  if (FINAL_PRESENCE_NOTEBOOKS.length !== 3) {
    errors.push("A obra deve possuir três cadernos de presença.");
  }

  if (FINAL_CLOSING_EXPERIENCES.length !== 4) {
    errors.push("O encerramento deve possuir quatro peças editoriais.");
  }

  if (FINAL_COMPILED_PILLAR_IDS.length !== 9) {
    errors.push("A obra compilada deve conter nove pilares.");
  }

  const serialized = JSON.stringify({
    pillarIds: FINAL_COMPILED_PILLAR_IDS,
    pillars: FINAL_PILLAR_PACKAGES,
    notebooks: FINAL_PRESENCE_NOTEBOOKS,
    closing: FINAL_CLOSING_EXPERIENCES,
  });

  if (serialized.includes("pillar_01_vinculo")) {
    errors.push("ID legado pillar_01_vinculo não pode aparecer no pacote final.");
  }

  return Object.freeze(errors);
}

export function createFinalProjectManifest(): FinalProjectManifest {
  const errors = createGateErrors();

  const generatedQuestions =
    FINAL_PILLAR_PACKAGES.reduce(
      (total, pkg) =>
        total + pkg.questions.length,
      0,
    );

  const generatedOptions =
    FINAL_PILLAR_PACKAGES.reduce(
      (total, pkg) =>
        total +
        pkg.questions.reduce(
          (questionTotal, question) =>
            questionTotal +
            question.options.length,
          0,
        ),
      0,
    );

  const resources =
    FINAL_PILLAR_PACKAGES.reduce(
      (total, pkg) =>
        total + pkg.resources.length,
      0,
    );

  return Object.freeze({
    schemaVersion:
      "igentmind.final-project.v1",
    implementedBlocks:
      IMPLEMENTED_BLOCKS,
    compiledPillarIds:
      FINAL_COMPILED_PILLAR_IDS,
    pillars: FINAL_PILLAR_PACKAGES,
    notebooks: FINAL_PRESENCE_NOTEBOOKS,
    closingExperiences:
      FINAL_CLOSING_EXPERIENCES,
    journeyMemoryPolicy: Object.freeze({
      consentRequired: true,
      privateWritingExcluded: true,
      oneMemoryPerResponse: true,
      diagnostic: false,
    }),
    navigationPolicy: Object.freeze({
      readingNeverBlocked: true,
      returnCursorPreserved: true,
      reflectionsSkippable: true,
      resumeExact: true,
    }),
    publicationGate: Object.freeze({
      ready: errors.length === 0,
      errors,
      counts: Object.freeze({
        pillars: 9,
        generatedQuestions,
        generatedOptions,
        resources,
        notebooks:
          FINAL_PRESENCE_NOTEBOOKS.length,
        closingExperiences:
          FINAL_CLOSING_EXPERIENCES.length,
      }),
    }),
  });
}

export const FINAL_PROJECT_MANIFEST =
  createFinalProjectManifest();
