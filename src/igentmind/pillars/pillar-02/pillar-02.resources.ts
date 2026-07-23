// src/igentmind/pillars/pillar-02/pillar-02.resources.ts

import type {
  PillarAnchor,
  PillarJournal,
  PillarLetter,
  PillarMicroReturn,
} from "../template";

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

export interface Pillar02ResourcePackage {
  microReturns:
    readonly PillarMicroReturn[];

  journals:
    readonly PillarJournal[];

  letters:
    readonly PillarLetter[];

  anchors:
    readonly PillarAnchor[];
}

export const PILLAR_02_RESOURCES:
  Pillar02ResourcePackage = {
    microReturns:
      PILLAR_02_MICRO_RETURNS,

    journals:
      PILLAR_02_JOURNALS,

    letters:
      PILLAR_02_LETTERS,

    anchors:
      PILLAR_02_ANCHORS,
  };

export const PILLAR_02_RESOURCE_IDS =
  new Set([
    ...PILLAR_02_MICRO_RETURNS.map(
      (item) => item.id,
    ),

    ...PILLAR_02_JOURNALS.map(
      (item) => item.id,
    ),

    ...PILLAR_02_LETTERS.map(
      (item) => item.id,
    ),

    ...PILLAR_02_ANCHORS.map(
      (item) => item.id,
    ),
  ]);

export type Pillar02ResourceKind =
  | "micro_return"
  | "journal"
  | "letter"
  | "anchor";

export const PILLAR_02_RESOURCE_KIND_BY_ID =
  new Map<string, Pillar02ResourceKind>([
    ...PILLAR_02_MICRO_RETURNS.map(
      (item) =>
        [
          item.id,
          "micro_return",
        ] as const,
    ),

    ...PILLAR_02_JOURNALS.map(
      (item) =>
        [
          item.id,
          "journal",
        ] as const,
    ),

    ...PILLAR_02_LETTERS.map(
      (item) =>
        [
          item.id,
          "letter",
        ] as const,
    ),

    ...PILLAR_02_ANCHORS.map(
      (item) =>
        [
          item.id,
          "anchor",
        ] as const,
    ),
  ]);
