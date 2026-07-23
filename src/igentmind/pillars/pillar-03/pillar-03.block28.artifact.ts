import {
  INTERLUDE_FENDA_ID,
  PILLAR_02_ID,
  PILLAR_03_ID,
  PILLAR_04_ID,
  type Pillar03Block28Artifact,
  type Pillar03Block28Manifest,
  type Pillar03Block28ValidationReport,
} from "./pillar-03.block28.contracts";

import { PILLAR_03_CANONICAL_SECTIONS } from "./pillar-03.canonical";
import { PILLAR_03_DOSSIER } from "./pillar-03.dossier";
import { PILLAR_03_ENTRY } from "./pillar-03.entry";
import { PILLAR_03_IDENTITY } from "./pillar-03.identity";
import { PILLAR_03_PREDICTIVE_RULES } from "./pillar-03.predictive";
import { PILLAR_03_SIGNALS } from "./pillar-03.signals";
import { getPillar03Block28Counts } from "./pillar-03.block28.validation";

function stableSerialize(value: unknown): string {
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
        )}:${stableSerialize(record[key])}`,
    )
    .join(",")}}`;
}

function stableHash(value: string): string {
  let first = 0xcbf29ce484222325n;
  let second = 0x84222325cbf29ce4n;
  const prime = 0x100000001b3n;

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
      code + 0x9e3779b97f4a7c15n;

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

export function createPillar03Block28Manifest(): Pillar03Block28Manifest {
  return Object.freeze({
    schemaVersion:
      "igentmind.pillar.foundation.v1",
    pillarId: PILLAR_03_ID,
    stage:
      "editorial_predictive_foundation",
    counts: getPillar03Block28Counts(),
    entryExperienceId:
      INTERLUDE_FENDA_ID,
    previousPillarId: PILLAR_02_ID,
    nextPillarId: PILLAR_04_ID,
    readingBlocked: false,
    includesReaderPrivateContent: false,
    canonicalBodiesEmbedded: false,
    publicationReady: false,
    nextRequiredBlock: 29,
  });
}

export function createPillar03Block28Checksum(): string {
  const source = Object.freeze({
    schemaVersion:
      "igentmind.pillar.foundation-checksum.v1",
    identity: PILLAR_03_IDENTITY,
    entry: PILLAR_03_ENTRY,
    canonicalSections:
      PILLAR_03_CANONICAL_SECTIONS,
    dossier: PILLAR_03_DOSSIER,
    signals: PILLAR_03_SIGNALS,
    predictiveRules:
      PILLAR_03_PREDICTIVE_RULES,
    manifest:
      createPillar03Block28Manifest(),
  });

  return stableHash(stableSerialize(source));
}

export function buildPillar03Block28Artifact(
  validation:
    Pillar03Block28ValidationReport,
): Pillar03Block28Artifact {
  return Object.freeze({
    schemaVersion:
      "igentmind.pillar.foundation-artifact.v1",
    pillarId: PILLAR_03_ID,
    manifest:
      createPillar03Block28Manifest(),
    validation,
    checksum:
      createPillar03Block28Checksum(),
    foundationReady:
      validation.valid &&
      validation.errors.length === 0,
    publicationReady: false,
  });
}
