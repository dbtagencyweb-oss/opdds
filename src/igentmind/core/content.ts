// src/igentmind/core/content.ts

import {
  BookCursor,
  ContentReferenceSnapshot,
  EditorialOrigin,
  GenerationMode,
  PillarId,
  PILLAR_01_ID,
  PILLAR_02_ID,
} from "./contracts";

import {
  assertEditorialCombination,
  DomainInvariantError,
} from "./invariants";

export interface CanonicalContentEntry {
  contentId: string;
  pillarId: PillarId;
  sectionId: string;
  editorialOrigin: EditorialOrigin;
  generationMode: GenerationMode;
  canonical: boolean;
}

function contentKey(
  pillarId: PillarId,
  sectionId: string,
): string {
  return `${pillarId}:${sectionId}`;
}

export class ContentRegistry {
  private readonly entries =
    new Map<string, CanonicalContentEntry>();

  register(
    entry: CanonicalContentEntry,
  ): void {
    assertEditorialCombination(entry);

    const key = contentKey(
      entry.pillarId,
      entry.sectionId,
    );

    if (this.entries.has(key)) {
      throw new DomainInvariantError(
        "DUPLICATE_CONTENT_REFERENCE",
        `Referência editorial duplicada: ${key}`,
      );
    }

    this.entries.set(key, entry);
  }

  resolveByCursor(
    cursor: BookCursor,
  ): CanonicalContentEntry | null {
    return (
      this.entries.get(
        contentKey(
          cursor.contentId as PillarId,
          cursor.sectionId,
        ),
      ) ?? null
    );
  }

  toReference(
    entry: CanonicalContentEntry,
  ): ContentReferenceSnapshot {
    return {
      contentId: entry.contentId,
      editorialOrigin:
        entry.editorialOrigin,
      generationMode:
        entry.generationMode,
      resolved: true,
      canonical: entry.canonical,
    };
  }
}

const PILLAR_01_CANONICAL_SECTIONS = [
  "identity",
  "limiar",
  "manifesto",
  "narrative",
  "consciousness",
  "judgment",
  "presence",
  "support-letter",
  "canonical-ritual",
  "closing",
] as const;

export function createCanonicalContentRegistry():
  ContentRegistry {
  const registry =
    new ContentRegistry();

  for (
    const sectionId
    of PILLAR_01_CANONICAL_SECTIONS
  ) {
    registry.register({
      contentId:
        `${PILLAR_01_ID}:${sectionId}`,
      pillarId: PILLAR_01_ID,
      sectionId,
      editorialOrigin: "book_exact",
      generationMode: "fixed",
      canonical: true,
    });
  }

  registry.register({
    contentId:
      `${PILLAR_02_ID}:identity`,
    pillarId: PILLAR_02_ID,
    sectionId: "identity",
    editorialOrigin: "book_exact",
    generationMode: "fixed",
    canonical: true,
  });

  return registry;
}
