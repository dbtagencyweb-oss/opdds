import {
  buildPillar02PublicationArtifact,
  createPillar02PublicationManifest,
  getPillar02PackageCounts,
} from "./pillar-02.publication";

import { validatePillar02Block26 } from "./pillar-02.block26.validation";
import { PILLAR_02_PACKAGE } from "./pillar-02.package";
import { PILLAR_02_CLOSURE } from "./pillar-02.closure";
import { PILLAR_02_TRANSITIONS } from "./pillar-02.transitions";
import { PILLAR_02_IMMEDIATE_CONTINUATION } from "./pillar-02.continuation";

export const PILLAR_02_BLOCK_26_VALIDATION = validatePillar02Block26();

export const PILLAR_02_PUBLICATION_ARTIFACT =
  buildPillar02PublicationArtifact(PILLAR_02_BLOCK_26_VALIDATION);

export const PILLAR_02_BLOCK_26 = Object.freeze({
  package: PILLAR_02_PACKAGE,
  transitions: PILLAR_02_TRANSITIONS,
  closure: PILLAR_02_CLOSURE,
  continuation: PILLAR_02_IMMEDIATE_CONTINUATION,
  counts: getPillar02PackageCounts(),
  manifest: createPillar02PublicationManifest(),
  validation: PILLAR_02_BLOCK_26_VALIDATION,
  publication: PILLAR_02_PUBLICATION_ARTIFACT,
  readiness: PILLAR_02_PUBLICATION_ARTIFACT.readiness,
});

export function assertPillar02Block26PublicationReady(): void {
  if (!PILLAR_02_PUBLICATION_ARTIFACT.readiness) {
    const details = PILLAR_02_BLOCK_26_VALIDATION.errors
      .map((issue) => `${issue.code}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `O Pilar II não está pronto para publicação.\n${details}`,
    );
  }
}
