import {
  PILLAR_03_ID,
} from "./pillar-03.block28.contracts";

import type {
  Pillar03Block29Artifact,
  Pillar03Block29Manifest,
  Pillar03Block29ValidationReport,
} from "./pillar-03.block29.contracts";

import {
  PILLAR_03_QUESTIONS,
} from "./pillar-03.questions";

import {
  getPillar03Block29Counts,
} from "./pillar-03.block29.validation";

function stableSerialize(
  value: unknown,
): string {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(stableSerialize)
      .join(",")}]`;
  }

  const record =
    value as Record<string, unknown>;

  const keys = Object.keys(record).sort();

  return `{${keys
    .map(
      (key) =>
        `${JSON.stringify(
          key,
        )}:${stableSerialize(
          record[key],
        )}`,
    )
    .join(",")}}`;
}

function stableHash(
  value: string,
): string {
  let first =
    0xcbf29ce484222325n;

  let second =
    0x84222325cbf29ce4n;

  const prime =
    0x100000001b3n;

  for (const character of value) {
    const code = BigInt(
      character.codePointAt(0) ?? 0,
    );

    first ^= code;
    first = BigInt.asUintN(
      64,
      first * prime,
    );

    second ^=
      code +
      0x9e3779b97f4a7c15n;

    second = BigInt.asUintN(
      64,
      second * prime,
    );
  }

  return `${first
    .toString(16)
    .padStart(16, "0")}${second
    .toString(16)
    .padStart(16, "0")}`;
}

export function createPillar03Block29Manifest(): Pillar03Block29Manifest {
  return Object.freeze({
    schemaVersion:
      "igentmind.pillar.questions.v1",
    pillarId: PILLAR_03_ID,
    stage: "question_response_bank",
    counts: getPillar03Block29Counts(),

    openAnswerPriority:
      "higher_than_closed_option",

    privateAnswersInTelemetry: false,
    automaticMemoryCreation: false,

    readingBlocked: false,
    publicationReady: false,
    nextRequiredBlock: 30,
  });
}

export function createPillar03Block29Checksum(): string {
  return stableHash(
    stableSerialize({
      schemaVersion:
        "igentmind.pillar.questions-checksum.v1",
      pillarId: PILLAR_03_ID,
      questions: PILLAR_03_QUESTIONS,
      manifest:
        createPillar03Block29Manifest(),
    }),
  );
}

export function buildPillar03Block29Artifact(
  validation:
    Pillar03Block29ValidationReport,
): Pillar03Block29Artifact {
  return Object.freeze({
    schemaVersion:
      "igentmind.pillar.questions-artifact.v1",
    pillarId: PILLAR_03_ID,
    manifest:
      createPillar03Block29Manifest(),
    validation,
    checksum:
      createPillar03Block29Checksum(),

    questionBankReady:
      validation.valid &&
      validation.errors.length === 0,

    publicationReady: false,
  });
}
