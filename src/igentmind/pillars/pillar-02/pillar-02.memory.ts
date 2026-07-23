import {
  PILLAR_02_ID,
  type CreatePillar02MemoryCandidateInput,
  type Pillar02ConfirmedMemory,
  type Pillar02DeclinedMemoryCandidate,
  type Pillar02ForbiddenAutomaticMemoryOrigin,
  type Pillar02MemoryCandidate,
  type Pillar02MemoryCandidateOrigin,
  type Pillar02MemoryStore,
  type Pillar02MemoryTelemetry,
} from "./pillar-02.block26.contracts";

const FORBIDDEN_AUTOMATIC_ORIGINS = new Set<string>([
  "closed_option",
  "journal",
  "letter",
  "telemetry",
  "inference",
] satisfies readonly Pillar02ForbiddenAutomaticMemoryOrigin[]);

const ALLOWED_CANDIDATE_ORIGINS = new Set<string>([
  "manual_entry",
  "open_answer",
  "reader_edit",
  "closure_summary",
] satisfies readonly Pillar02MemoryCandidateOrigin[]);

const MAX_MEMORY_TEXT_LENGTH = 600;

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function assertNonEmpty(value: string, field: string): void {
  if (normalizeWhitespace(value).length === 0) {
    throw new Error(`${field} não pode estar vazio.`);
  }
}

function assertCandidateOrigin(origin: string): asserts origin is Pillar02MemoryCandidateOrigin {
  if (
    FORBIDDEN_AUTOMATIC_ORIGINS.has(origin) ||
    !ALLOWED_CANDIDATE_ORIGINS.has(origin)
  ) {
    throw new Error(
      `A origem "${origin}" não pode criar automaticamente uma memória.`,
    );
  }
}

function stableTextHash(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (const character of value) {
    hash ^= BigInt(character.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * prime);
  }

  return hash.toString(16).padStart(16, "0");
}

export function normalizePillar02MemoryText(text: string): string {
  const normalized = normalizeWhitespace(text);

  if (normalized.length > MAX_MEMORY_TEXT_LENGTH) {
    throw new Error(
      `A memória ultrapassa o limite de ${MAX_MEMORY_TEXT_LENGTH} caracteres.`,
    );
  }

  return normalized;
}

export function createPillar02MemoryCandidate(
  input: CreatePillar02MemoryCandidateInput,
): Pillar02MemoryCandidate {
  assertNonEmpty(input.candidateId, "candidateId");
  assertCandidateOrigin(input.origin);

  const text = normalizePillar02MemoryText(input.text);
  assertNonEmpty(text, "text");

  return Object.freeze({
    candidateId: input.candidateId,
    pillarId: PILLAR_02_ID,
    kind: input.kind,
    text,
    origin: input.origin,
    consent: "pending",
    source: "reader_proposed",
    version: 1,
  });
}

export function editPillar02MemoryCandidate(
  candidate: Pillar02MemoryCandidate,
  editedText: string,
): Pillar02MemoryCandidate {
  const text = normalizePillar02MemoryText(editedText);
  assertNonEmpty(text, "editedText");

  return Object.freeze({
    ...candidate,
    text,
    origin: "reader_edit",
    consent: "pending",
    source: "reader_proposed",
    version: candidate.version + 1,
  });
}

export function declinePillar02MemoryCandidate(
  candidate: Pillar02MemoryCandidate,
): Pillar02DeclinedMemoryCandidate {
  return Object.freeze({
    candidateId: candidate.candidateId,
    pillarId: PILLAR_02_ID,
    kind: candidate.kind,
    consent: "declined",
    source: "reader_declined",
    version: candidate.version,
  });
}

export function confirmPillar02MemoryCandidate(
  candidate: Pillar02MemoryCandidate,
  memoryId: string,
): Pillar02ConfirmedMemory {
  assertNonEmpty(memoryId, "memoryId");

  const text = normalizePillar02MemoryText(candidate.text);
  const normalizedForFingerprint = text.toLocaleLowerCase("pt-BR");

  return Object.freeze({
    memoryId,
    candidateId: candidate.candidateId,
    pillarId: PILLAR_02_ID,
    kind: candidate.kind,
    text,
    normalizedFingerprint: stableTextHash(
      `${candidate.kind}:${normalizedForFingerprint}`,
    ),
    consent: "confirmed",
    source: "reader_confirmed",
    version: candidate.version,
  });
}

export function validatePillar02ConfirmedMemory(
  memory: Pillar02ConfirmedMemory,
): readonly string[] {
  const errors: string[] = [];

  if (memory.pillarId !== PILLAR_02_ID) {
    errors.push("A memória não pertence ao Pilar II.");
  }

  if (memory.consent !== "confirmed") {
    errors.push("A memória exige consentimento confirmado.");
  }

  if (memory.source !== "reader_confirmed") {
    errors.push('A fonte da memória deve ser "reader_confirmed".');
  }

  if (normalizeWhitespace(memory.text).length === 0) {
    errors.push("A memória confirmada não pode possuir texto vazio.");
  }

  return errors;
}

export function savePillar02ConfirmedMemory(
  store: Pillar02MemoryStore,
  memory: Pillar02ConfirmedMemory,
): Pillar02MemoryStore {
  const validationErrors = validatePillar02ConfirmedMemory(memory);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(" "));
  }

  const duplicated = store.memories.some(
    (existing) =>
      existing.normalizedFingerprint === memory.normalizedFingerprint,
  );

  if (duplicated) {
    return store;
  }

  return Object.freeze({
    memories: Object.freeze([...store.memories, memory]),
  });
}

export function createEmptyPillar02MemoryStore(): Pillar02MemoryStore {
  return Object.freeze({
    memories: Object.freeze([]),
  });
}

export function selectPillar02MemoryForResponse(
  memories: readonly Pillar02ConfirmedMemory[],
  preferredMemoryId?: string,
): readonly Pillar02ConfirmedMemory[] {
  if (memories.length === 0) {
    return Object.freeze([]);
  }

  const selected =
    memories.find((memory) => memory.memoryId === preferredMemoryId) ??
    memories[0];

  return Object.freeze([selected]);
}

export function canCreatePillar02MemoryCandidateFrom(
  origin: string,
): origin is Pillar02MemoryCandidateOrigin {
  return (
    ALLOWED_CANDIDATE_ORIGINS.has(origin) &&
    !FORBIDDEN_AUTOMATIC_ORIGINS.has(origin)
  );
}

export function createPillar02MemoryTelemetry(
  input:
    | {
        readonly event: "memory_confirmed";
        readonly memory: Pillar02ConfirmedMemory;
      }
    | {
        readonly event: "memory_declined";
        readonly memory: Pillar02DeclinedMemoryCandidate;
      }
    | {
        readonly event: "memory_recalled";
        readonly memory: Pillar02ConfirmedMemory;
      },
): Pillar02MemoryTelemetry {
  if (input.event === "memory_declined") {
    return Object.freeze({
      event: input.event,
      pillarId: PILLAR_02_ID,
      candidateId: input.memory.candidateId,
      kind: input.memory.kind,
      includesPrivateContent: false,
    });
  }

  return Object.freeze({
    event: input.event,
    pillarId: PILLAR_02_ID,
    memoryId: input.memory.memoryId,
    candidateId: input.memory.candidateId,
    kind: input.memory.kind,
    includesPrivateContent: false,
  });
}
