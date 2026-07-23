import {
  INTERLUDE_FENDA_ID,
  INTERLUDE_FENDA_NEXT_PILLAR_ID,
  INTERLUDE_FENDA_PREVIOUS_PILLAR_ID,
  type InterludeFendaPublicationArtifact,
  type InterludeFendaPublicationManifest,
  type InterludeFendaValidationReport,
} from "./interlude-fenda.contracts";

import {
  getInterludeFendaCounts,
  INTERLUDE_FENDA_PACKAGE_INPUT,
} from "./interlude-fenda.package";

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
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableSerialize(
          record[key],
        )}`,
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
    first = BigInt.asUintN(64, first * prime);

    second ^= code + 0x9e3779b97f4a7c15n;
    second = BigInt.asUintN(64, second * prime);
  }

  return `${first
    .toString(16)
    .padStart(16, "0")}${second
    .toString(16)
    .padStart(16, "0")}`;
}

export function createInterludeFendaPublicationManifest(): InterludeFendaPublicationManifest {
  return Object.freeze({
    schemaVersion: "igentmind.experience.manifest.v1",
    experienceId: INTERLUDE_FENDA_ID,
    kind: "interlude",
    previousPillarId:
      INTERLUDE_FENDA_PREVIOUS_PILLAR_ID,
    nextPillarId: INTERLUDE_FENDA_NEXT_PILLAR_ID,
    counts: getInterludeFendaCounts(),
    readingBlocked: false,
    countsAsPillar: false,
    includesReaderPrivateContent: false,
  });
}

export function createInterludeFendaChecksum(): string {
  const source = Object.freeze({
    schemaVersion: "igentmind.experience.checksum.v1",
    experienceId: INTERLUDE_FENDA_ID,
    packageInput: INTERLUDE_FENDA_PACKAGE_INPUT,
    manifest: createInterludeFendaPublicationManifest(),
  });

  return stableHash(stableSerialize(source));
}

export function buildInterludeFendaPublicationArtifact(
  validation: InterludeFendaValidationReport,
): InterludeFendaPublicationArtifact {
  return Object.freeze({
    schemaVersion:
      "igentmind.experience.publication.v1",
    experienceId: INTERLUDE_FENDA_ID,
    mode: "publication",
    manifest: createInterludeFendaPublicationManifest(),
    validation,
    checksum: createInterludeFendaChecksum(),
    readiness:
      validation.valid && validation.errors.length === 0,
  });
}
