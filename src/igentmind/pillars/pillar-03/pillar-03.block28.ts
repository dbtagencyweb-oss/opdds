import {
  buildPillar03Block28Artifact,
  createPillar03Block28Manifest,
} from "./pillar-03.block28.artifact";

import {
  getPillar03Block28Counts,
  validatePillar03Block28,
} from "./pillar-03.block28.validation";

import { PILLAR_03_CANONICAL_SECTIONS } from "./pillar-03.canonical";
import { PILLAR_03_DOSSIER } from "./pillar-03.dossier";
import { PILLAR_03_ENTRY } from "./pillar-03.entry";
import { PILLAR_03_IDENTITY } from "./pillar-03.identity";
import { PILLAR_03_PREDICTIVE_RULES } from "./pillar-03.predictive";
import { PILLAR_03_SIGNALS } from "./pillar-03.signals";

export const PILLAR_03_BLOCK_28_VALIDATION =
  validatePillar03Block28();

export const PILLAR_03_BLOCK_28_ARTIFACT =
  buildPillar03Block28Artifact(
    PILLAR_03_BLOCK_28_VALIDATION,
  );

export const PILLAR_03_BLOCK_28 =
  Object.freeze({
    stage:
      "editorial_predictive_foundation",
    identity: PILLAR_03_IDENTITY,
    entry: PILLAR_03_ENTRY,
    canonicalSections:
      PILLAR_03_CANONICAL_SECTIONS,
    dossier: PILLAR_03_DOSSIER,
    signals: PILLAR_03_SIGNALS,
    predictiveRules:
      PILLAR_03_PREDICTIVE_RULES,
    counts: getPillar03Block28Counts(),
    manifest:
      createPillar03Block28Manifest(),
    validation:
      PILLAR_03_BLOCK_28_VALIDATION,
    artifact:
      PILLAR_03_BLOCK_28_ARTIFACT,
    foundationReady:
      PILLAR_03_BLOCK_28_ARTIFACT
        .foundationReady,
    publicationReady: false,
    nextRequiredBlock: 29,
  } as const);

export function assertPillar03Block28Ready(): void {
  if (
    !PILLAR_03_BLOCK_28_ARTIFACT
      .foundationReady
  ) {
    const details =
      PILLAR_03_BLOCK_28_VALIDATION.errors
        .map(
          (current) =>
            `${current.code}: ${current.message}`,
        )
        .join("\n");

    throw new Error(
      `A fundação do Pilar III não está pronta.\n${details}`,
    );
  }
}
