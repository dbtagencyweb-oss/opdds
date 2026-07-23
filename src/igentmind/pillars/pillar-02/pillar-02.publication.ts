import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  type Block26ValidationReport,
  type Pillar02PackageCounts,
  type Pillar02PublicationArtifact,
  type Pillar02PublicationManifest,
} from "./pillar-02.block26.contracts";

import {
  PILLAR_02_ANCHORS,
} from "./pillar-02.anchors";

import {
  PILLAR_02_JOURNALS,
} from "./pillar-02.journals";

import {
  PILLAR_02_LETTERS,
} from "./pillar-02.letters";

import {
  PILLAR_02_MICRO_RETURNS,
} from "./pillar-02.micro-returns";

import {
  PILLAR_02_PREDICTIVE_RULES_CONNECTED,
} from "./pillar-02.predictive-rules.connected";

import {
  PILLAR_02_CANONICAL_SECTIONS,
} from "./pillar-02.editorial";

import {
  PILLAR_02_SIGNALS,
} from "./pillar-02.signals";

import { PILLAR_02_QUESTIONS } from "./pillar-02.questions";
import { PILLAR_02_TRANSITIONS } from "./pillar-02.transitions";
import { PILLAR_02_PACKAGE_INPUT } from "./pillar-02.package";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function countQuestionOptions(questions: readonly unknown[]): number {
  return questions.reduce<number>((total, question) => {
    if (!isRecord(question) || !Array.isArray(question.options)) {
      return total;
    }

    return total + question.options.length;
  }, 0);
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

function stableHash(value: string): string {
  let first = 0xcbf29ce484222325n;
  let second = 0x84222325cbf29ce4n;
  const prime = 0x100000001b3n;

  for (const character of value) {
    const code = BigInt(character.codePointAt(0) ?? 0);

    first ^= code;
    first = BigInt.asUintN(64, first * prime);

    second ^= code + 0x9e3779b97f4a7c15n;
    second = BigInt.asUintN(64, second * prime);
  }

  return `${first.toString(16).padStart(16, "0")}${second
    .toString(16)
    .padStart(16, "0")}`;
}

export function getPillar02PackageCounts(): Pillar02PackageCounts {
  return Object.freeze({
    canonicalSections: PILLAR_02_CANONICAL_SECTIONS.length,
    signals: PILLAR_02_SIGNALS.length,
    questions: PILLAR_02_QUESTIONS.length,
    options: countQuestionOptions(PILLAR_02_QUESTIONS),
    microReturns: PILLAR_02_MICRO_RETURNS.length,
    journals: PILLAR_02_JOURNALS.length,
    letters: PILLAR_02_LETTERS.length,
    anchors: PILLAR_02_ANCHORS.length,
    predictiveRules: PILLAR_02_PREDICTIVE_RULES_CONNECTED.length,
    transitions: PILLAR_02_TRANSITIONS.length,
  });
}

export function createPillar02PublicationManifest(): Pillar02PublicationManifest {
  return Object.freeze({
    schemaVersion: "igentmind.pillar.manifest.v1",
    pillarId: PILLAR_02_ID,
    mode: "publication",
    immediateContinuation: Object.freeze({
      experienceId: INTERLUDE_FENDA_ID,
      nextPillarId: PILLAR_03_ID,
    }),
    counts: getPillar02PackageCounts(),
    readingBlocked: false,
    includesReaderPrivateContent: false,
  });
}

export function createPillar02PublicationChecksum(): string {
  const checksumSource = Object.freeze({
    schemaVersion: "igentmind.pillar.checksum.v1",
    pillarId: PILLAR_02_ID,
    mode: "publication",
    manifest: createPillar02PublicationManifest(),
    packageInput: PILLAR_02_PACKAGE_INPUT,
  });

  return stableHash(stableSerialize(checksumSource));
}

export function buildPillar02PublicationArtifact(
  validation: Block26ValidationReport,
): Pillar02PublicationArtifact {
  return Object.freeze({
    schemaVersion: "igentmind.pillar.publication.v1",
    pillarId: PILLAR_02_ID,
    mode: "publication",
    manifest: createPillar02PublicationManifest(),
    validation,
    checksum: createPillar02PublicationChecksum(),
    readiness: validation.valid && validation.errors.length === 0,
  });
}
