// src/igentmind/core/memory.ts

import {
  MemoryRecordSnapshot,
  MemorySnapshot,
} from "./contracts";

import {
  DomainInvariantError,
} from "./invariants";

interface MemoryCandidate {
  id: string;
  originalText: string;
  currentText: string;
  edited: boolean;
}

function normalizeMemoryText(
  text: string,
): string {
  return text
    .trim()
    .replace(/\s+/g, " ");
}

export class MemoryStore {
  private readonly candidates =
    new Map<string, MemoryCandidate>();

  private readonly confirmed =
    new Map<string, MemoryRecordSnapshot>();

  private readonly refused =
    new Set<string>();

  private lastUsedMemoryId:
    string | null = null;

  constructor(
    private readonly now:
      () => string,
  ) {}

  hasCandidate(
    candidateId: string,
  ): boolean {
    return this.candidates.has(candidateId);
  }

  propose(
    candidateId: string,
    text: string,
  ): void {
    if (this.refused.has(candidateId)) {
      return;
    }

    const normalized =
      normalizeMemoryText(text);

    if (!normalized) {
      throw new DomainInvariantError(
        "EMPTY_MEMORY_CANDIDATE",
        "Uma memória candidata não pode estar vazia.",
      );
    }

    if (this.candidates.has(candidateId)) {
      return;
    }

    this.candidates.set(candidateId, {
      id: candidateId,
      originalText: normalized,
      currentText: normalized,
      edited: false,
    });
  }

  edit(
    candidateId: string,
    text: string,
  ): void {
    const candidate =
      this.candidates.get(candidateId);

    if (!candidate) {
      throw new DomainInvariantError(
        "MEMORY_CANDIDATE_NOT_FOUND",
        `Memória candidata não encontrada: ${candidateId}`,
      );
    }

    const normalized =
      normalizeMemoryText(text);

    if (!normalized) {
      throw new DomainInvariantError(
        "EMPTY_MEMORY_EDIT",
        "A memória editada não pode estar vazia.",
      );
    }

    candidate.currentText = normalized;
    candidate.edited =
      normalized !== candidate.originalText;
  }

  refuse(
    candidateId: string,
  ): void {
    this.candidates.delete(candidateId);
    this.refused.add(candidateId);
  }

  confirm(
    candidateId: string,
    confirmedText?: string,
  ): MemoryRecordSnapshot {
    const candidate =
      this.candidates.get(candidateId);

    if (!candidate) {
      throw new DomainInvariantError(
        "MEMORY_CONFIRMATION_WITHOUT_CANDIDATE",
        "Não é possível confirmar uma memória inexistente.",
      );
    }

    const finalText =
      normalizeMemoryText(
        confirmedText ??
        candidate.currentText,
      );

    if (!finalText) {
      throw new DomainInvariantError(
        "EMPTY_CONFIRMED_MEMORY",
        "A memória confirmada não pode estar vazia.",
      );
    }

    const duplicate =
      Array.from(
        this.confirmed.values(),
      ).find(
        (memory) =>
          normalizeMemoryText(memory.text) ===
          finalText,
      );

    if (duplicate) {
      this.candidates.delete(candidateId);
      return duplicate;
    }

    const record:
      MemoryRecordSnapshot = {
        id: candidateId,
        text: finalText,
        consent: "confirmed",
        confirmedAt: this.now(),
        source: "reader_confirmed",
        editedBeforeConfirmation:
          candidate.edited ||
          finalText !==
            candidate.originalText,
      };

    this.confirmed.set(
      record.id,
      record,
    );

    this.candidates.delete(candidateId);
    this.refused.delete(candidateId);

    return record;
  }

  useOne(
    candidateIds:
      readonly string[],
  ): MemoryRecordSnapshot | null {
    for (const candidateId of candidateIds) {
      const memory =
        this.confirmed.get(candidateId);

      if (memory) {
        this.lastUsedMemoryId =
          memory.id;

        return {
          ...memory,
        };
      }
    }

    this.lastUsedMemoryId = null;
    return null;
  }

  snapshot(): MemorySnapshot {
    return {
      confirmed: Array.from(
        this.confirmed.values(),
      ).map((memory) => ({
        ...memory,
      })),

      refusedCandidateIds:
        Array.from(this.refused),

      pendingCandidateIds:
        Array.from(
          this.candidates.keys(),
        ),

      lastUsedMemoryId:
        this.lastUsedMemoryId,
    };
  }
}
